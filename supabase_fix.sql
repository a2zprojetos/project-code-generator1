-- EXECUTE ESTE SCRIPT NO PAINEL DO SUPABASE (SQL Editor)
-- Isso resolverá todos os problemas de uma vez

-- 1. Desabilitar RLS completamente na tabela code_options
ALTER TABLE code_options DISABLE ROW LEVEL SECURITY;

-- 2. Inserir contratantes na tabela code_options
INSERT INTO code_options (category, value, label, is_active) 
VALUES 
  ('contratantes', 'IGU', 'IGU - IGUÁ', true),
  ('contratantes', 'CAH', 'CAH - CARVALHO HOSKEN', true)
ON CONFLICT (category, value) DO UPDATE SET 
  label = EXCLUDED.label,
  is_active = EXCLUDED.is_active;

-- 3. Adicionar coluna contratante na tabela project_codes (se não existir)
ALTER TABLE project_codes ADD COLUMN IF NOT EXISTS contratante text;

-- 4. Verificar se tudo foi inserido corretamente
SELECT 'Contratantes inseridos:' as status;
SELECT * FROM code_options WHERE category = 'contratantes';

SELECT 'Colunas da tabela project_codes:' as status;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'project_codes' 
ORDER BY ordinal_position;