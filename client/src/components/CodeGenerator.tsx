
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Copy, CopyCheck, Code } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useCodes } from '@/context/CodeContext';
import { generateLegendItems } from '@/lib/codeUtils';

interface FormState {
  empresa: string;
  localidade: string;
  servico: string;
  sistema: string;
  componente: string;
  etapa: string;
  disciplina: string;
  tipoDoc: string;
  numero: string;
  data: Date | undefined;
  versao: string;
  nome: string;
  contratante: string;
}

export function CodeGenerator() {
  const { toast } = useToast();
  const { addCode, codeOptions, loading, getNextSequentialNumber, addContratante } = useCodes();
  const generatedCodeCardRef = useRef<HTMLDivElement>(null);
  const [formState, setFormState] = useState<FormState>({
    empresa: '',
    localidade: '',
    servico: '',
    sistema: '',
    componente: '',
    etapa: '',
    disciplina: '',
    tipoDoc: '',
    numero: '0001',
    data: new Date(),
    versao: 'R0',
    nome: '',
    contratante: '',
  });
  const [generatedCode, setGeneratedCode] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [legendItems, setLegendItems] = useState<{ title: string; text: string }[]>([]);

  const handleInputChange = (field: keyof FormState, value: string | Date | undefined) => {
    setFormState(prevState => ({ ...prevState, [field]: value }));
  };

  const handleGenerateNextNumber = async () => {
    try {
      const nextNumber = await getNextSequentialNumber();
      handleInputChange('numero', nextNumber);
      toast({
        title: "Número gerado!",
        description: `Próximo número sequencial: ${nextNumber}`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o próximo número.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateCode = async () => {
    const { empresa, localidade, servico, sistema, componente, etapa, disciplina, tipoDoc, numero, data, versao, nome, contratante } = formState;

    if (!nome.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira um nome para o código.",
        variant: "destructive",
      });
      return;
    }

    if (!data) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma data.",
        variant: "destructive",
      });
      return;
    }

    if (!empresa || !localidade || !servico || !sistema || !componente || !etapa || !disciplina || !tipoDoc || !contratante) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios, incluindo o contratante.",
        variant: "destructive",
      });
      return;
    }

    const numeroFormatado = numero.padStart(4, '0');
    const dataFormatada = format(data, 'ddMMyy');

    const code = `${contratante}-${empresa}-${localidade}-${servico}-${sistema}-${componente}-${etapa}-${disciplina}-${tipoDoc}-${numeroFormatado}-${dataFormatada}-${versao}`;
    
    try {
      await addCode({
        name: nome,
        code,
        empresa,
        localidade,
        servico,
        sistema,
        componente,
        etapa,
        disciplina,
        tipo_documento: tipoDoc,
        numero: numeroFormatado,
        data,
        versao,
        contratante
      });

      setGeneratedCode(code);
      setHistory(prev => [code, ...prev].slice(0, 10));
      setLegendItems(generateLegendItems(code, codeOptions.contratantes));
      toast({
        title: "Código Gerado e Salvo!",
        description: "O novo código foi adicionado à sua lista.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar o código. Tente novamente.",
        variant: "destructive",
      });
    }
  };
  
  const handleCopy = (textToCopy: string, id: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied({ [id]: true });
    toast({
      title: "Copiado!",
      description: "O código foi copiado para a área de transferência.",
    });
    setTimeout(() => setCopied(prevState => ({ ...prevState, [id]: false })), 2000);
  };

  const handleExport = (type: 'pdf' | 'image') => {
    if (generatedCodeCardRef.current) {
      toast({
        title: "Exportando...",
        description: `Gerando ${type === 'pdf' ? 'PDF' : 'imagem'}, por favor aguarde.`,
      });
      html2canvas(generatedCodeCardRef.current, { backgroundColor: null, scale: 2 }).then((canvas) => {
        if (type === 'image') {
          const imgData = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = imgData;
          link.download = `${generatedCode}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height]
          });
          pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
          pdf.save(`${generatedCode}.pdf`);
        }
        toast({
          title: "Sucesso!",
          description: `O ${type === 'pdf' ? 'PDF' : 'imagem'} foi baixado.`,
        });
      });
    }
  };

  const renderSelect = (id: keyof FormState, label: string, options: { value: string, label: string }[]) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={formState[id] as string} onValueChange={(value) => handleInputChange(id, value)}>
        <SelectTrigger id={id}>
          <SelectValue placeholder={`Selecione ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  // Initialize form with first options when codeOptions are loaded
  useEffect(() => {
    if (codeOptions.empresas.length > 0 && !formState.empresa) {
      setFormState(prev => ({
        ...prev,
        empresa: codeOptions.empresas[0]?.value || '',
        localidade: codeOptions.localidades[0]?.value || '',
        servico: codeOptions.servicos[0]?.value || '',
        sistema: codeOptions.sistemas[0]?.value || '',
        componente: codeOptions.componentes[0]?.value || '',
        etapa: codeOptions.etapas[0]?.value || '',
        disciplina: codeOptions.disciplinas[0]?.value || '',
        tipoDoc: codeOptions.tipoDocumento[0]?.value || '',
        // Não inicializar contratante automaticamente para forçar seleção consciente
      }));
    }
  }, [codeOptions]);

  // Auto-load next sequential number when component mounts
  useEffect(() => {
    const loadNextNumber = async () => {
      if (!loading && !formState.numero) {
        try {
          const nextNumber = await getNextSequentialNumber();
          handleInputChange('numero', nextNumber);
        } catch (error) {
          console.error('Error loading next number:', error);
        }
      }
    };
    
    loadNextNumber();
  }, [loading, getNextSequentialNumber, formState.numero]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando opções...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-20"></div>
            <div className="relative bg-white dark:bg-gray-800 p-3 rounded-xl border border-white/20 dark:border-gray-700/30">
              <Code className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          Gerador de Código de Projeto
        </h1>
        <p className="text-lg text-muted-foreground">Preencha os campos para gerar um código único</p>
      </header>

      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
        <CardHeader className="relative">
          <CardTitle className="text-xl font-semibold">Parâmetros do Código</CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Código</Label>
              <Input id="nome" placeholder="Ex: Projeto Principal da Barra" value={formState.nome} onChange={(e) => handleInputChange('nome', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contratante">Contratante *</Label>
                <div className="flex gap-2">
                  <Select value={formState.contratante} onValueChange={(value) => handleInputChange('contratante', value)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione ou adicione contratante" />
                    </SelectTrigger>
                    <SelectContent>
                      {codeOptions.contratantes.map(option => (
                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => {
                      const nomeCompleto = prompt('Digite o nome completo do contratante:');
                      if (nomeCompleto && nomeCompleto.trim()) {
                        addContratante(nomeCompleto.trim())
                          .then(abreviacao => {
                            handleInputChange('contratante', abreviacao);
                            toast({
                              title: "Contratante adicionado!",
                              description: `${abreviacao} - ${nomeCompleto} foi adicionado com sucesso.`,
                            });
                          })
                          .catch(() => {
                            toast({
                              title: "Erro",
                              description: "Não foi possível adicionar o contratante.",
                              variant: "destructive",
                            });
                          });
                      }
                    }}
                    className="px-3"
                  >
                    +
                  </Button>
                </div>
              </div>
              {renderSelect('empresa', 'Empresa', codeOptions.empresas)}
              {renderSelect('localidade', 'Cidade/Estado', codeOptions.localidades)}
              {renderSelect('servico', 'Serviço', codeOptions.servicos)}
              {renderSelect('sistema', 'Sistema/Categoria', codeOptions.sistemas)}
              {renderSelect('componente', 'Componente', codeOptions.componentes)}
              {renderSelect('etapa', 'Etapa', codeOptions.etapas)}
              {renderSelect('disciplina', 'Disciplina', codeOptions.disciplinas)}
              {renderSelect('tipoDoc', 'Tipo de Documento', codeOptions.tipoDocumento)}
              <div className="space-y-2">
                <Label htmlFor="numero">Número Sequencial (4 dígitos)</Label>
                <div className="flex gap-2">
                  <Input 
                    id="numero" 
                    value={formState.numero} 
                    onChange={(e) => handleInputChange('numero', e.target.value)}
                    placeholder="0001"
                    className="flex-1"
                  />
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={handleGenerateNextNumber}
                    className="px-3"
                  >
                    Auto
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formState.data && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formState.data ? format(formState.data, "dd/MM/yyyy") : <span>Escolha uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formState.data}
                      onSelect={(date) => handleInputChange('data', date)}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="versao">Versão</Label>
                <Input id="versao" value={formState.versao} onChange={(e) => handleInputChange('versao', e.target.value)} />
              </div>
            </div>
          </div>
          <Button 
            onClick={handleGenerateCode} 
            className="w-full mt-6 gradient-bg hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-lg py-6"
          >
            <Code className="mr-2 h-5 w-5" />
            Gerar e Salvar Código
          </Button>
        </CardContent>
      </Card>

      {generatedCode && (
        <Card ref={generatedCodeCardRef} className="overflow-hidden">
          <CardHeader>
            <CardTitle>Código Gerado</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between bg-muted p-4">
            <code className="text-lg font-mono break-all mr-4">{generatedCode}</code>
            <Button variant="ghost" size="icon" onClick={() => handleCopy(generatedCode, 'main')}>
              {copied['main'] ? <CopyCheck className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-wrap justify-end gap-2 p-4 border-t">
            <Button variant="outline" onClick={() => handleExport('image')}>Exportar como Imagem</Button>
            <Button variant="outline" onClick={() => handleExport('pdf')}>Exportar como PDF</Button>
          </CardFooter>
        </Card>
      )}

      {legendItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Legenda do Código Gerado</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {legendItems.map((item, index) => (
                <li key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
                  <span className="font-semibold col-span-1">{item.title}:</span>
                  <span className="md:col-span-2">{item.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {history.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Histórico (últimos 10)</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {history.map((code, index) => (
                <li key={index} className="flex items-center justify-between bg-muted/50 p-3 rounded-md">
                  <span className="font-mono text-sm break-all mr-2">{code}</span>
                  <Button variant="ghost" size="icon" onClick={() => handleCopy(code, `history-${index}`)}>
                     {copied[`history-${index}`] ? <CopyCheck className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
