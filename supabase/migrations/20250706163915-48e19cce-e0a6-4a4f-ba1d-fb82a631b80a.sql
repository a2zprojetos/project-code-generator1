-- Drop the existing enum and recreate profiles table with text role
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ALTER COLUMN role TYPE TEXT;
DROP TYPE IF EXISTS public.user_role CASCADE;

-- Update the handle_new_user function to work with text roles
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
        COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
        token_record.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;