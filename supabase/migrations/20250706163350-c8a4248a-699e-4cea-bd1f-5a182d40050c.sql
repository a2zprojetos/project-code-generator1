-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'user');

-- Create invitation tokens table
CREATE TABLE public.invitation_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id),
  used_by UUID REFERENCES auth.users(id),
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  invitation_token_id UUID REFERENCES public.invitation_tokens(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.invitation_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invitation_tokens
CREATE POLICY "Users can view invitation tokens during signup"
ON public.invitation_tokens
FOR SELECT
USING (NOT is_used AND expires_at > now());

CREATE POLICY "Admins can create invitation tokens"
ON public.invitation_tokens
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can view all invitation tokens"
ON public.invitation_tokens
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  token_record RECORD;
BEGIN
  -- Get token from metadata
  IF NEW.raw_user_meta_data->>'invitation_token' IS NOT NULL THEN
    -- Find and validate the token
    SELECT * INTO token_record
    FROM public.invitation_tokens
    WHERE token = NEW.raw_user_meta_data->>'invitation_token'
    AND NOT is_used
    AND expires_at > now();
    
    IF token_record.id IS NOT NULL THEN
      -- Mark token as used
      UPDATE public.invitation_tokens
      SET is_used = TRUE, used_by = NEW.id, updated_at = now()
      WHERE id = token_record.id;
      
      -- Create profile
      INSERT INTO public.profiles (user_id, name, role, invitation_token_id)
      VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'name',
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'user'),
        token_record.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to generate invitation tokens
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_token TEXT;
BEGIN
  -- Generate a random token
  new_token := encode(gen_random_bytes(32), 'hex');
  
  -- Insert the token
  INSERT INTO public.invitation_tokens (token, created_by)
  VALUES (new_token, auth.uid());
  
  RETURN new_token;
END;
$$;

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_invitation_tokens_updated_at
  BEFORE UPDATE ON public.invitation_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial admin token (valid for 30 days)
INSERT INTO public.invitation_tokens (token, expires_at)
VALUES ('admin-token-2024', now() + interval '30 days');