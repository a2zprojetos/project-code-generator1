import { useMemo } from 'react';
import { useCodes } from '@/context/CodeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { Calendar, Users, FileText, TrendingUp, Award, Building, MapPin, Settings } from 'lucide-react';
import { format, parseISO, startOfMonth, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

export function DashboardPage() {
  const { codes, codeOptions } = useCodes();

  const stats = useMemo(() => {
    // Códigos por contratante
    const byContratante = codes.reduce((acc, code) => {
      const contratanteParts = code.code.split('-');
      const contratanteValue = contratanteParts[0];
      const contratanteLabel = codeOptions.contratantes.find(c => c.value === contratanteValue)?.label || contratanteValue;
      
      acc[contratanteLabel] = (acc[contratanteLabel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Códigos por mês
    const byMonth = codes.reduce((acc, code) => {
      try {
        let date: Date;
        if (code.createdAt instanceof Date) {
          date = code.createdAt;
        } else if (typeof code.createdAt === 'string') {
          date = new Date(code.createdAt);
        } else {
          date = new Date();
        }
        
        if (isValid(date)) {
          const monthKey = format(startOfMonth(date), 'MMM yyyy', { locale: ptBR });
          acc[monthKey] = (acc[monthKey] || 0) + 1;
        }
      } catch (error) {
        // Se houver erro na data, use data atual
        const monthKey = format(startOfMonth(new Date()), 'MMM yyyy', { locale: ptBR });
        acc[monthKey] = (acc[monthKey] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // Códigos por empresa
    const byEmpresa = codes.reduce((acc, code) => {
      const empresaParts = code.code.split('-');
      const empresaValue = empresaParts[1];
      const empresaLabel = codeOptions.empresas.find(e => e.value === empresaValue)?.label || empresaValue;
      
      acc[empresaLabel] = (acc[empresaLabel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Códigos por localidade
    const byLocalidade = codes.reduce((acc, code) => {
      const localidadeParts = code.code.split('-');
      const localidadeValue = localidadeParts[2];
      const localidadeLabel = codeOptions.localidades.find(l => l.value === localidadeValue)?.label || localidadeValue;
      
      acc[localidadeLabel] = (acc[localidadeLabel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Números mais utilizados
    const byNumero = codes.reduce((acc, code) => {
      const numeroParts = code.code.split('-');
      const numero = numeroParts[9]; // Posição do número sequencial
      acc[numero] = (acc[numero] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Conversão para arrays para gráficos
    const contratanteData = Object.entries(byContratante).map(([name, value]) => ({ name, value }));
    const monthData = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, value]) => ({ name, value }));
    
    const empresaData = Object.entries(byEmpresa).map(([name, value]) => ({ name, value }));
    const localidadeData = Object.entries(byLocalidade).map(([name, value]) => ({ name, value }));
    
    const numeroData = Object.entries(byNumero)
      .sort(([a, b]) => parseInt(b) - parseInt(a)) // Ordenar por frequência
      .slice(0, 10) // Top 10
      .map(([name, value]) => ({ name, value }));

    return {
      contratanteData,
      monthData,
      empresaData,
      localidadeData,
      numeroData,
      totals: {
        codes: codes.length,
        contratantes: contratanteData.length,
        empresas: empresaData.length,
        localidades: localidadeData.length
      }
    };
  }, [codes, codeOptions]);

  return (
    <div className="container mx-auto p-6 space-y-8 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-20"></div>
          <div className="relative bg-white dark:bg-gray-800 p-3 rounded-xl border border-white/20 dark:border-gray-700/30">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-lg text-muted-foreground mt-1">Estatísticas detalhadas do sistema</p>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Códigos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totals.codes}</div>
            <p className="text-xs text-muted-foreground">códigos gerados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totals.contratantes}</div>
            <p className="text-xs text-muted-foreground">contratantes ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totals.empresas}</div>
            <p className="text-xs text-muted-foreground">empresas utilizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Localidades</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totals.localidades}</div>
            <p className="text-xs text-muted-foreground">cidades/estados</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Códigos por Contratante */}
        <Card>
          <CardHeader>
            <CardTitle>Códigos por Contratante</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.contratanteData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.contratanteData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Análise Temporal */}
        <Card>
          <CardHeader>
            <CardTitle>Códigos por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.monthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos secundários */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Números Mais Utilizados */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 - Números Mais Utilizados</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.numeroData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Códigos por Empresa */}
        <Card>
          <CardHeader>
            <CardTitle>Códigos por Empresa</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.empresaData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de localidades */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Localidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.localidadeData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="font-medium">{item.name}</span>
                <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-sm">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}