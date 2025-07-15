-- SQL para executar no Supabase para configurar usuários

-- 1. Função para criar perfil automaticamente usando a tabela profiles existente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, role, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'user'),
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger para executar a função quando um usuário se registra
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. RLS (Row Level Security) para profiles - SISTEMA COLABORATIVO
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Everyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Everyone can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Políticas colaborativas - todos podem ver e criar
CREATE POLICY "Everyone can view profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Everyone can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- 4. Políticas colaborativas para code_options (tabela existente)
ALTER TABLE public.code_options ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Everyone can view code_options" ON public.code_options;
DROP POLICY IF EXISTS "Everyone can insert code_options" ON public.code_options;
DROP POLICY IF EXISTS "Everyone can update code_options" ON public.code_options;

CREATE POLICY "Everyone can view code_options" ON public.code_options
  FOR SELECT USING (true);

CREATE POLICY "Everyone can insert code_options" ON public.code_options
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Everyone can update code_options" ON public.code_options
  FOR UPDATE USING (true);