-- Script para configurar compartilhamento de códigos no Supabase
-- Usar apenas as tabelas existentes: profiles, project_codes, code_options, invitation_tokens

-- 1. RLS (Row Level Security) para project_codes - SISTEMA COLABORATIVO
ALTER TABLE public.project_codes ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Everyone can view project_codes" ON public.project_codes;
DROP POLICY IF EXISTS "Everyone can insert project_codes" ON public.project_codes;
DROP POLICY IF EXISTS "Everyone can update project_codes" ON public.project_codes;
DROP POLICY IF EXISTS "Everyone can delete project_codes" ON public.project_codes;

-- Criar políticas colaborativas para project_codes
CREATE POLICY "Everyone can view project_codes" ON public.project_codes
  FOR SELECT USING (true);

CREATE POLICY "Everyone can insert project_codes" ON public.project_codes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Everyone can update project_codes" ON public.project_codes
  FOR UPDATE USING (true);

CREATE POLICY "Everyone can delete project_codes" ON public.project_codes
  FOR DELETE USING (true);

-- 2. RLS para profiles - SISTEMA COLABORATIVO
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Everyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Everyone can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Criar políticas colaborativas para profiles
CREATE POLICY "Everyone can view profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Everyone can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- 3. RLS para code_options - SISTEMA COLABORATIVO
ALTER TABLE public.code_options ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Everyone can view code_options" ON public.code_options;
DROP POLICY IF EXISTS "Everyone can insert code_options" ON public.code_options;
DROP POLICY IF EXISTS "Everyone can update code_options" ON public.code_options;

-- Criar políticas colaborativas para code_options
CREATE POLICY "Everyone can view code_options" ON public.code_options
  FOR SELECT USING (true);

CREATE POLICY "Everyone can insert code_options" ON public.code_options
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Everyone can update code_options" ON public.code_options
  FOR UPDATE USING (true);

-- 4. RLS para invitation_tokens - SISTEMA COLABORATIVO
ALTER TABLE public.invitation_tokens ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Everyone can view invitation_tokens" ON public.invitation_tokens;
DROP POLICY IF EXISTS "Everyone can insert invitation_tokens" ON public.invitation_tokens;
DROP POLICY IF EXISTS "Everyone can update invitation_tokens" ON public.invitation_tokens;

-- Criar políticas colaborativas para invitation_tokens
CREATE POLICY "Everyone can view invitation_tokens" ON public.invitation_tokens
  FOR SELECT USING (true);

CREATE POLICY "Everyone can insert invitation_tokens" ON public.invitation_tokens
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Everyone can update invitation_tokens" ON public.invitation_tokens
  FOR UPDATE USING (true);