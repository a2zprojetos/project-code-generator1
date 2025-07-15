-- Adicionar coluna contratante na tabela project_codes via Supabase
ALTER TABLE project_codes ADD COLUMN IF NOT EXISTS contratante text;

-- Inserir contratantes na tabela code_options via Supabase
INSERT INTO code_options (category, value, label, is_active) 
VALUES 
  ('contratantes', 'IGU', 'IGU - IGUÁ', true),
  ('contratantes', 'CAH', 'CAH - CARVALHO HOSKEN', true)
ON CONFLICT (category, value) DO UPDATE SET 
  label = EXCLUDED.label,
  is_active = EXCLUDED.is_active;