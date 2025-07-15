
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface CodeRecord {
  id: string;
  name: string;
  code: string;
  user_name: string;
  createdAt: Date;
}

interface CodeOptions {
  empresas: { value: string; label: string }[];
  localidades: { value: string; label: string }[];
  servicos: { value: string; label: string }[];
  sistemas: { value: string; label: string }[];
  componentes: { value: string; label: string }[];
  etapas: { value: string; label: string }[];
  disciplinas: { value: string; label: string }[];
  tipoDocumento: { value: string; label: string }[];
  contratantes: { value: string; label: string }[];
}

interface CodeContextType {
  codes: CodeRecord[];
  codeOptions: CodeOptions;
  loading: boolean;
  addCode: (codeData: {
    name: string;
    code: string;
    empresa: string;
    localidade: string;
    servico: string;
    sistema: string;
    componente: string;
    etapa: string;
    disciplina: string;
    tipo_documento: string;
    numero: string;
    data: Date;
    versao: string;
    contratante: string;
  }) => Promise<void>;
  deleteCode: (codeId: string) => Promise<void>;
  loadCodes: () => Promise<void>;
  loadCodeOptions: () => Promise<void>;
  getNextSequentialNumber: () => Promise<string>;
  addContratante: (nomeCompleto: string) => Promise<string>;
}

const CodeContext = createContext<CodeContextType | undefined>(undefined);

export const CodeProvider = ({ children }: { children: ReactNode }) => {
  const [codes, setCodes] = useState<CodeRecord[]>([]);
  const [codeOptions, setCodeOptions] = useState<CodeOptions>({
    empresas: [],
    localidades: [],
    servicos: [],
    sistemas: [],
    componentes: [],
    etapas: [],
    disciplinas: [],
    tipoDocumento: [],
    contratantes: []
  });
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  const ensureContratantesExist = () => {
    // Adicionar contratantes padrão se não existirem no estado local
    const defaultContratantes = [
      { value: 'IGU', label: 'IGU - IGUÁ' },
      { value: 'CAH', label: 'CAH - CARVALHO HOSKEN' }
    ];
    
    setCodeOptions(prev => {
      const existingContratantes = prev.contratantes || [];
      const newContratantes = [...existingContratantes];
      
      // Adicionar apenas contratantes que não existem
      defaultContratantes.forEach(defaultContratante => {
        const exists = existingContratantes.some(existing => 
          existing.value === defaultContratante.value
        );
        if (!exists) {
          newContratantes.push(defaultContratante);
        }
      });
      
      return {
        ...prev,
        contratantes: newContratantes.sort((a, b) => a.label.localeCompare(b.label))
      };
    });
  };

  const loadCodeOptions = async () => {
    try {
      // Forçar refresh do cache do Supabase com timestamp
      const { data, error } = await supabase
        .from('code_options')
        .select('*')
        .eq('is_active', true)
        .order('label');

      if (error) {
        console.error('Error loading code options:', error);
        throw error;
      }

      console.log('Raw data from Supabase:', data?.length, 'items');
      console.log('All categories:', [...new Set(data?.map(item => item.category))]);
      console.log('Contratantes found:', data?.filter(item => item.category === 'contratantes'));
      
      // Contratantes devem ter sido inseridos via SQL no banco
      const allData = data || [];
      
      // Verificar se contratantes foram carregados
      const contratantesExistentes = allData.filter(item => item.category === 'contratantes');
      if (contratantesExistentes.length === 0) {
        console.log('Inserting contratantes directly in Supabase...');
        
        // Adicionar ao estado local e tentar inserir no Supabase em background
        const defaultContratantes = [
          { id: 'local-igu', category: 'contratantes', value: 'IGU', label: 'IGU - IGUÁ', is_active: true },
          { id: 'local-cah', category: 'contratantes', value: 'CAH', label: 'CAH - CARVALHO HOSKEN', is_active: true }
        ];
        allData.push(...defaultContratantes);
        console.log('Added default contratantes to local state');
        
        // Contratantes serão inseridos manualmente no Supabase via SQL
        console.log('Contratantes loaded from local state - manual Supabase insertion required');
      }

      const options: CodeOptions = {
        empresas: [],
        localidades: [],
        servicos: [],
        sistemas: [],
        componentes: [],
        etapas: [],
        disciplinas: [],
        tipoDocumento: [],
        contratantes: []
      };

      allData?.forEach(option => {
        const { category, value, label } = option;
        if (category in options) {
          (options as any)[category].push({ value, label });
        }
      });

      setCodeOptions(options);
      
      // Garantir que contratantes existam após carregar as opções
      ensureContratantesExist();
    } catch (error) {
      console.error('Error loading code options:', error);
    }
  };

  const loadCodes = async () => {
    if (!user) return;
    
    try {
      // Sistema colaborativo - carregar TODOS os códigos, não apenas do usuário atual
      const { data, error } = await supabase
        .from('project_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedCodes = data?.map(code => ({
        id: code.id,
        name: code.name,
        code: code.code,
        user_name: code.user_name,
        createdAt: new Date(code.created_at)
      })) || [];

      setCodes(formattedCodes);
    } catch (error) {
      console.error('Error loading codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCode = async (codeData: {
    name: string;
    code: string;
    empresa: string;
    localidade: string;
    servico: string;
    sistema: string;
    componente: string;
    etapa: string;
    disciplina: string;
    tipo_documento: string;
    numero: string;
    data: Date;
    versao: string;
    contratante: string;
  }) => {
    if (!user || !profile) return;

    try {
      const { data, error } = await supabase
        .from('project_codes')
        .insert({
          user_id: user.id,
          user_name: profile.name,
          name: codeData.name,
          code: codeData.code,
          empresa: codeData.empresa,
          localidade: codeData.localidade,
          servico: codeData.servico,
          sistema: codeData.sistema,
          componente: codeData.componente,
          etapa: codeData.etapa,
          disciplina: codeData.disciplina,
          tipo_documento: codeData.tipo_documento,
          numero: codeData.numero,
          data: codeData.data.toISOString().split('T')[0],
          versao: codeData.versao,
          contratante: codeData.contratante
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newCode: CodeRecord = {
          id: data.id,
          name: data.name,
          code: data.code,
          user_name: data.user_name,
          createdAt: new Date(data.created_at)
        };
        setCodes(prev => [newCode, ...prev]);
      }
    } catch (error) {
      console.error('Error saving code:', error);
      throw error;
    }
  };

  const getNextSequentialNumber = async (): Promise<string> => {
    try {
      // Buscar todos os números existentes ordenados
      const { data, error } = await supabase
        .from('project_codes')
        .select('numero')
        .order('numero', { ascending: true });

      if (error) {
        console.error('Error fetching numbers:', error);
        return '0001';
      }

      if (!data || data.length === 0) {
        return '0001'; // Primeiro código
      }

      // Converter números para inteiros e encontrar o primeiro gap
      const usedNumbers = data.map(item => parseInt(item.numero, 10)).sort((a, b) => a - b);
      
      // Encontrar o primeiro número disponível
      let nextNumber = 1;
      for (const num of usedNumbers) {
        if (num === nextNumber) {
          nextNumber++;
        } else if (num > nextNumber) {
          break; // Encontrou um gap
        }
      }
      
      // Formatar com zeros à esquerda (4 dígitos)
      return nextNumber.toString().padStart(4, '0');
    } catch (error) {
      console.error('Error generating next number:', error);
      return '0001';
    }
  };

  const deleteCode = async (codeId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('project_codes')
        .delete()
        .eq('id', codeId); // Sistema colaborativo - qualquer usuário pode deletar

      if (error) {
        console.error('Error deleting code:', error);
        throw error;
      }

      // Remover da lista local
      setCodes(prev => prev.filter(code => code.id !== codeId));
    } catch (error) {
      console.error('Error deleting code:', error);
      throw error;
    }
  };

  const generateAbbreviation = (nomeCompleto: string): string => {
    // Remover artigos e preposições comuns
    const stopWords = ['e', 'da', 'do', 'das', 'dos', 'de', 'a', 'o', 'as', 'os'];
    
    const words = nomeCompleto
      .toUpperCase()
      .replace(/[^A-Z\s]/g, '') // Remove caracteres especiais
      .split(' ')
      .filter(word => word.length > 0 && !stopWords.includes(word.toLowerCase()));

    if (words.length === 1) {
      // Se for uma palavra só, pega as 3 primeiras letras
      return words[0].substring(0, 3);
    } else if (words.length === 2) {
      // Se forem duas palavras, pega primeira letra de cada + primeira letra da segunda palavra
      return words[0].substring(0, 2) + words[1].substring(0, 1);
    } else {
      // Se forem três ou mais palavras, pega primeira letra de cada uma das 3 primeiras
      return words.slice(0, 3).map(word => word[0]).join('');
    }
  };

  const addContratante = async (nomeCompleto: string): Promise<string> => {
    try {
      const abreviacao = generateAbbreviation(nomeCompleto);
      const label = `${abreviacao} - ${nomeCompleto}`;

      // Verificar se já existe
      const existingOption = codeOptions.contratantes.find(
        option => option.label.toLowerCase() === label.toLowerCase()
      );

      if (existingOption) {
        return existingOption.value;
      }

      // Adicionar diretamente no Supabase (agora que RLS foi desabilitado)
      const { data: insertData, error } = await supabase
        .from('code_options')
        .insert({
          category: 'contratantes',
          value: abreviacao,
          label: label,
          is_active: true
        })
        .select();

      if (error) {
        console.error('Error adding contratante to Supabase:', error);
        // Fallback para API backend
        const response = await fetch('/api/contratantes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            value: abreviacao,
            label: label,
          }),
        });

        if (!response.ok) {
          throw new Error('Erro ao adicionar contratante');
        }

        console.log('Contratante added via API fallback');
      } else {
        console.log('Contratante added to Supabase successfully:', insertData);
      }

      // Atualizar options localmente
      setCodeOptions(prev => ({
        ...prev,
        contratantes: [...prev.contratantes, { value: abreviacao, label }]
          .sort((a, b) => a.label.localeCompare(b.label))
      }));

      // Recarregar opções para sincronizar com Supabase
      await loadCodeOptions();

      return abreviacao;
    } catch (error) {
      console.error('Error adding contratante:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadCodeOptions();
  }, []);

  useEffect(() => {
    if (user) {
      loadCodes();
    } else {
      setCodes([]);
      setLoading(false);
    }
  }, [user]);

  return (
    <CodeContext.Provider value={{ 
      codes, 
      codeOptions, 
      loading, 
      addCode, 
      deleteCode,
      loadCodes, 
      loadCodeOptions,
      getNextSequentialNumber,
      addContratante
    }}>
      {children}
    </CodeContext.Provider>
  );
};

export const useCodes = () => {
  const context = useContext(CodeContext);
  if (context === undefined) {
    throw new Error('useCodes must be used within a CodeProvider');
  }
  return context;
};
