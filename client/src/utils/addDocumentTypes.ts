import { supabase } from '@/integrations/supabase/client';

const documentTypes = [
  { value: 'AT', label: 'AT - ANÁLISE TÉCNICA DE PROJETOS' },
  { value: 'BM', label: 'BM - BOLETIM DE MEDIÇÃO' },
  { value: 'BT', label: 'BT - BATIMETRIA' },
  { value: 'CQ', label: 'CQ - CROQUIS' },
  { value: 'CS', label: 'CS - CADASTRO' },
  { value: 'DE', label: 'DE - DESENHO' },
  { value: 'LA', label: 'LA - LAUDO' },
  { value: 'MC', label: 'MC - MEMÓRIA DE CÁLCULO' },
  { value: 'MD', label: 'MD - MEMORIAL DESCRITIVO' },
  { value: 'NS', label: 'NS - NOTA DE SERVIÇO' },
  { value: 'OS', label: 'OS - ORDEM DE SERVIÇO' },
  { value: 'TP', label: 'TP - TOPOGRAFIA' },
  { value: 'TR', label: 'TR - TERMO DE REFERÊNCIA' },
  { value: 'AP', label: 'AP - APRESENTAÇÃO' }
];

export async function addDocumentTypesToSupabase() {
  console.log('Inserindo tipos de documento...');
  
  try {
    // Primeiro, verificar se já existem tipos de documento
    const { data: existing } = await supabase
      .from('code_options')
      .select('value')
      .eq('category', 'tipoDocumento');

    const existingValues = existing?.map(item => item.value) || [];
    
    // Filtrar apenas os tipos que ainda não existem
    const newTypes = documentTypes.filter(type => !existingValues.includes(type.value));
    
    if (newTypes.length === 0) {
      console.log('Todos os tipos de documento já existem no banco');
      return;
    }

    // Inserir os novos tipos
    const typesToInsert = newTypes.map(type => ({
      category: 'tipoDocumento',
      value: type.value,
      label: type.label,
      is_active: true
    }));

    const { error } = await supabase
      .from('code_options')
      .insert(typesToInsert);

    if (error) {
      console.error('Erro ao inserir tipos de documento:', error);
      throw error;
    }

    console.log(`${newTypes.length} tipos de documento inseridos com sucesso!`);
    
    // Recarregar a página para atualizar as opções
    window.location.reload();
    
  } catch (error) {
    console.error('Erro ao adicionar tipos de documento:', error);
  }
}