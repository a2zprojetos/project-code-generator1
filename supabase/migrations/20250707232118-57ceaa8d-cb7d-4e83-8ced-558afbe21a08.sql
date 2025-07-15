-- Criar tabela para os códigos gerados pelos usuários
CREATE TABLE public.project_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  empresa TEXT NOT NULL,
  localidade TEXT NOT NULL,
  servico TEXT NOT NULL,
  sistema TEXT NOT NULL,
  componente TEXT NOT NULL,
  etapa TEXT NOT NULL,
  disciplina TEXT NOT NULL,
  tipo_documento TEXT NOT NULL,
  numero TEXT NOT NULL,
  data DATE NOT NULL,
  versao TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.project_codes ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir que usuários vejam e criem seus próprios códigos
CREATE POLICY "Users can view their own codes" 
ON public.project_codes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own codes" 
ON public.project_codes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own codes" 
ON public.project_codes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own codes" 
ON public.project_codes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Criar tabela para as opções dos códigos
CREATE TABLE public.code_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL, -- 'empresas', 'localidades', 'servicos', etc.
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(category, value)
);

-- Habilitar RLS para code_options (público para leitura)
ALTER TABLE public.code_options ENABLE ROW LEVEL SECURITY;

-- Política para permitir que todos os usuários autenticados vejam as opções
CREATE POLICY "Authenticated users can view code options" 
ON public.code_options 
FOR SELECT 
TO authenticated
USING (true);

-- Política para permitir que apenas admins modifiquem as opções
CREATE POLICY "Admins can manage code options" 
ON public.code_options 
FOR ALL 
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

-- Inserir dados iniciais das opções
INSERT INTO public.code_options (category, value, label) VALUES
-- Empresas
('empresas', 'A2Z', 'A2Z - A2Z PROJETOS'),
('empresas', '2SE', '2SE - 2S ENGENHARIA E GEOTECNOLOGIA'),

-- Localidades
('localidades', 'RJ', 'RJ - RIO DE JANEIRO'),
('localidades', 'MP', 'MP - MIGUEL PEREIRA'),
('localidades', 'PY', 'PY - PATY DO ALFERES'),
('localidades', 'CB', 'CB - CUIABÁ'),
('localidades', 'PN', 'PN - PARANAGUÁ'),
('localidades', 'SE', 'SE - SERGIPE'),

-- Serviços
('servicos', 'A', 'A - ÁGUA'),
('servicos', 'D', 'D - DRENAGEM'),
('servicos', 'E', 'E - ESGOTO'),
('servicos', 'G', 'G - GERAL'),
('servicos', 'V', 'V - VÁRIOS'),

-- Sistemas
('sistemas', '000', '000 - VÁRIOS SISTEMAS E CATEGORIAS'),
('sistemas', '001', '001 - VÁRIOS SISTEMAS'),
('sistemas', '002', '002 - PROJETOS SAA'),
('sistemas', '003', '003 - PROJETOS SES'),
('sistemas', '004', '004 - COMPLEXO LAGUNAR DA BARRA DA TIJUCA'),
('sistemas', '005', '005 - REFORMA ETE BARRA'),
('sistemas', '006', '006 - DIAGNÓSTICOS DAS INSTALAÇÕES E OPERAÇÕES'),
('sistemas', '007', '007 - COLETORES DE TEMPO SECO'),
('sistemas', '008', '008 - INVESTIMENTOS EM ÁREAS IRREGULARES'),
('sistemas', '009', '009 - OBRAS SEDE'),
('sistemas', '010', '010 - DESATIVAÇÃO ETE''S e UT''S'),
('sistemas', '011', '011 - RECUPERAÇÃO DAS EEEB e EEAT'),
('sistemas', '012', '012 - PLANO DIRETOR DE AGUA E ESGOTO'),
('sistemas', '013', '013 - VIABILIDADES'),

-- Componentes
('componentes', '00', '00 - GERAIS'),
('componentes', '10', '10 - CAPTAÇÃO E ADUÇÃO DE ÁGUA BRUTA'),
('componentes', '20', '20 - ADUTORAS E SUB-AUTORAS DE AGUA TRATADA'),
('componentes', '30', '30 - LINHAS DE RECALQUE, COLETORES TRONCO, INTERCEPTORES E EMISSÁRIOS'),
('componentes', '40', '40 - ESTAÇÕES ELEVATÓRIAS/ESTAÇÕES PRESSURIZADORAS/BOOSTERS'),
('componentes', '50', '50 - ESTAÇÕES DE TRATAMENTO'),
('componentes', '60', '60 - RESERVATÓRIO'),
('componentes', '70', '70 - REDES DE DISTRIBUIÇÃO'),
('componentes', '80', '80 - REDES COLETORAS'),
('componentes', '90', '90 - LIGAÇÕES DOMICILIARES'),

-- Etapas
('etapas', 'A', 'A - APOIO'),
('etapas', 'B', 'B - AS BUILT'),
('etapas', 'C', 'C - PROJETO CONCEITUAL'),
('etapas', 'E', 'E - PROJETO EXECUTIVO'),
('etapas', 'O', 'O - ETAPA CONTRUTIVA'),
('etapas', 'P', 'P - PROJETO BÁSICO'),
('etapas', 'R', 'R - RECUPERAÇÃO'),
('etapas', 'S', 'S - ESTUDOS'),

-- Disciplinas
('disciplinas', 'A', 'A - ARQUITETURA'),
('disciplinas', 'C', 'C - CIVIL ESTRUTURA'),
('disciplinas', 'D', 'D - DRENAGEM'),
('disciplinas', 'E', 'E - ELÉTRICA'),
('disciplinas', 'G', 'G - GEOTECNICA'),
('disciplinas', 'H', 'H - HIDROMECÂNICO (PROCESSOS, TUBULAÇÕES, EQUIPAMENTOS, HIDRÁULICA)'),
('disciplinas', 'I', 'I - AUTOMAÇÃO E INSTRUMENTAÇÃO'),
('disciplinas', 'P', 'P - TERRAPLANAGEM E MOVIMENTAÇÃO DE SOLO'),
('disciplinas', 'Q', 'Q - QUALIDADE'),
('disciplinas', 'T', 'T - TOPOGRAFIA'),
('disciplinas', 'V', 'V - VIÁRIO E PAVIMENTAÇÃO'),
('disciplinas', 'X', 'X - GERAL'),

-- Tipos de documento
('tipo_documento', 'AT', 'AT - ANÁLISE TÉCNICA DE PROJETOS'),
('tipo_documento', 'BM', 'BM - BOLETIM DE MEDIÇÃO'),
('tipo_documento', 'BT', 'BT - BATIMETRIA'),
('tipo_documento', 'CQ', 'CQ - CROQUIS'),
('tipo_documento', 'CS', 'CS - CADASTRO'),
('tipo_documento', 'DE', 'DE - DESENHO'),
('tipo_documento', 'LA', 'LA - LAUDO'),
('tipo_documento', 'MC', 'MC - MEMÓRIA DE CÁLCULO'),
('tipo_documento', 'MD', 'MD - MEMORIAL DESCRITIVO'),
('tipo_documento', 'NS', 'NS - NOTA DE SERVIÇO'),
('tipo_documento', 'OS', 'OS - ORDEM DE SERVIÇO'),
('tipo_documento', 'TP', 'TP - TOPOGRAFIA'),
('tipo_documento', 'TR', 'TR - TERMO DE REFERÊNCIA'),
('tipo_documento', 'AP', 'AP - APRESENTAÇÃO');

-- Trigger para atualizar updated_at
CREATE TRIGGER update_project_codes_updated_at
BEFORE UPDATE ON public.project_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_code_options_updated_at
BEFORE UPDATE ON public.code_options
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();