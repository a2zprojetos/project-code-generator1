
import {
  empresas,
  localidades,
  servicos,
  sistemas,
  componentes,
  etapas,
  disciplinas,
  tipoDocumento
} from '@/data/semiCodes';

const findLabel = (options: { value: string, label: string }[], value: string) => {
  const option = options.find(o => o.value === value);
  return option ? option.label : `Código "${value}" não encontrado`;
};

export const generateLegendItems = (code: string, contratantes?: { value: string, label: string }[]) => {
  const parts = code.split('-');
  if (parts.length < 12) {
    return [{ title: "Erro", text: "Código inválido para gerar legenda." }];
  }

  const [
    contratanteVal,
    empresaVal,
    localidadeVal,
    servicoVal,
    sistemaVal,
    componenteVal,
    etapaVal,
    disciplinaVal,
    tipoDocVal,
    numeroVal,
    dataVal,
    versaoVal,
  ] = parts;

  // Buscar o nome completo do contratante
  const contratanteCompleto = contratantes?.find(c => c.value === contratanteVal)?.label || `${contratanteVal} - Contratante`;

  const legendItems = [
    { title: 'Contratante', text: contratanteCompleto },
    { title: 'Empresa', text: findLabel(empresas, empresaVal) },
    { title: 'Cidade/Estado', text: findLabel(localidades, localidadeVal) },
    { title: 'Serviço', text: findLabel(servicos, servicoVal) },
    { title: 'Sistema/Categoria', text: findLabel(sistemas, sistemaVal) },
    { title: 'Componente', text: findLabel(componentes, componenteVal) },
    { title: 'Etapa', text: findLabel(etapas, etapaVal) },
    { title: 'Disciplina', text: findLabel(disciplinas, disciplinaVal) },
    { title: 'Tipo de Documento', text: findLabel(tipoDocumento, tipoDocVal) },
    { title: 'Número Sequencial', text: `${numeroVal} - Número Sequencial (4 dígitos)` },
    { title: 'Data', text: `${dataVal} - Data (DDMMAA)` },
    { title: 'Versão', text: `${versaoVal} - Versão (Ex: R0)` },
  ];
  
  return legendItems;
};
