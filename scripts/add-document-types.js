// Script to add document type options to Supabase
// This should be run manually in the Supabase SQL editor or through the dashboard

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

// SQL to insert these into the code_options table:
console.log('Run this SQL in your Supabase dashboard:');
console.log('');

documentTypes.forEach(docType => {
  console.log(`INSERT INTO code_options (category, value, label, is_active) VALUES ('tipoDocumento', '${docType.value}', '${docType.label}', true);`);
});