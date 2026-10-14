import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Download, TrendingUp, TrendingDown, Database, DollarSign, FileText, Search, Filter } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAppContext } from '../context/AppContext';

export default function Reports() {
  const { usuario, vendas, despesas, insumos, receitas } = useAppContext();
  const [filterPeriod, setFilterPeriod] = useState<'ano' | 'mes_atual'>('ano');
  const [searchTerm, setSearchTerm] = useState('');

  const reportData = useMemo(() => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const data = meses.map(mes => ({ mes, receitas: 0, despesas: 0, custo: 0, lucro: 0 }));

    vendas.forEach(v => {
      const d = new Date(v.data);
      if (!isNaN(d.getTime())) {
        data[d.getMonth()].receitas += (v.valorVenda * v.quantidade);
        data[d.getMonth()].custo += ((v.custoProduto || 0) * v.quantidade);
      }
    });

    despesas.forEach(d => {
      const dt = new Date(d.data);
      if (!isNaN(dt.getTime())) {
        data[dt.getMonth()].despesas += d.valor;
      }
    });

    data.forEach(d => {
      d.lucro = d.receitas - d.custo - d.despesas;
    });

    const mesAtual = new Date().getMonth();
    return filterPeriod === 'mes_atual' ? [data[mesAtual]] : data.slice(0, mesAtual + 1);
  }, [vendas, despesas, filterPeriod]);

  const totaisGerais = reportData.reduce((acc, curr) => {
    acc.receitas += curr.receitas;
    acc.despesas += curr.despesas;
    acc.lucro += curr.lucro;
    return acc;
  }, { receitas: 0, despesas: 0, lucro: 0 });

  const valorEstoqueInsumos = insumos.reduce((acc, i) => acc + (i.precoPorPacote / (i.tamanhoPacote || 1)) * i.estoqueTotal, 0);

  // CSV Export functionality
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `Relatorio Financeiro MEI - ${usuario?.nomeNegocio || 'IMPREDESC'}\n`;
    csvContent += `Data Exportacao: ${new Date().toLocaleDateString('pt-BR')}\n\n`;
    csvContent += "Mes,Receitas (R$),Despesas (R$),Lucro (R$)\n";

    reportData.forEach(row => {
      csvContent += `${row.mes},${row.receitas.toFixed(2)},${row.despesas.toFixed(2)},${row.lucro.toFixed(2)}\n`;
    });

    csvContent += `\nTotal,${totaisGerais.receitas.toFixed(2)},${totaisGerais.despesas.toFixed(2)},${totaisGerais.lucro.toFixed(2)}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_financial_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const receitasFiltradas = receitas.filter(r =>
    r.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.categoriaMercado && r.categoriaMercado.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Relatórios & DRE MEI</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Análise detalhada do seu faturamento, custos e lucratividade.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            <Filter size={16} className="text-slate-400 ml-2" />
            <select
              value={filterPeriod}
              onChange={e => setFilterPeriod(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-slate-700 outline-none pr-3 py-1.5 cursor-pointer"
            >
              <option value="ano">Ano Inteiro</option>
              <option value="mes_atual">Mês Atual</option>
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-xs hover:shadow-lg transition-all shadow-md"
          >
            <Download size={16} />
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Receita Bruta</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">R$ {totaisGerais.receitas.toFixed(2)}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Despesas Operacionais</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">R$ {totaisGerais.despesas.toFixed(2)}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <TrendingDown size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor em Estoque</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">R$ {valorEstoqueInsumos.toFixed(2)}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Database size={20} />
          </div>
        </div>

        <div className="bg-indigo-600 text-white p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-indigo-100 uppercase tracking-wider">Lucro Líquido</p>
            <h3 className="text-2xl font-black mt-1">R$ {totaisGerais.lucro.toFixed(2)}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold">
            <DollarSign size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider mb-6">Comparativo Receitas x Despesas</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reportData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => `R$ ${Number(value || 0).toFixed(2)}`}
                />
                <Area type="monotone" dataKey="receitas" name="Receitas" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorReceita)" />
                <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorDespesa)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider mb-6">Resultado Mensal (Lucro)</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => `R$ ${Number(value || 0).toFixed(2)}`}
                />
                <Bar dataKey="lucro" name="Lucro Líquido" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Análise de Margens por Produto</h3>
            <p className="text-xs text-slate-500 font-medium">Margens de lucro de cada produto calculado.</p>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar produto ou categoria..."
              className="w-full px-4 py-2 pl-9 rounded-xl bg-white border border-slate-200 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          </div>
        </div>

        <div className="p-0 overflow-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-extrabold text-slate-400 uppercase bg-white border-b border-slate-100">
                <th className="p-5">Produto</th>
                <th className="p-5">Categoria</th>
                <th className="p-5 text-right">Custo Unit.</th>
                <th className="p-5 text-right">Preço Venda</th>
                <th className="p-5 text-right">Lucro Unit.</th>
                <th className="p-5 text-right">Margem %</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium">
              {receitasFiltradas.map(r => {
                const lucro = r.precoSugeridoUnitario - r.custoTotalUnitario;
                const margem = r.precoSugeridoUnitario > 0 ? (lucro / r.precoSugeridoUnitario) * 100 : 0;
                return (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-5 font-bold text-slate-800">{r.nome}</td>
                    <td className="p-5 text-slate-500 text-xs">{r.categoriaMercado || 'Geral'}</td>
                    <td className="p-5 text-right text-rose-600 font-semibold">R$ {r.custoTotalUnitario.toFixed(2)}</td>
                    <td className="p-5 text-right font-bold text-slate-900">R$ {r.precoSugeridoUnitario.toFixed(2)}</td>
                    <td className="p-5 text-right text-emerald-600 font-bold">R$ {lucro.toFixed(2)}</td>
                    <td className="p-5 text-right font-extrabold text-indigo-600">{margem.toFixed(1)}%</td>
                  </tr>
                );
              })}
              {receitasFiltradas.length === 0 && (
                <tr><td colSpan={6} className="p-10 text-center text-slate-400 text-xs font-semibold">Nenhuma receita ou produto cadastrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900">Relatório Consolidado MEI</h3>
          <p className="text-xs text-slate-500">Documentação formatada para acompanhamento mensal do microentreendedor.</p>
        </div>
        <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
              <FileText size={24} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Resumo Anual de Faturamento Bruto MEI</h4>
              <p className="text-xs text-slate-500">Exportação em formato CSV compatível com planilhas e contabilidade.</p>
            </div>
          </div>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-indigo-50 text-indigo-700 font-bold rounded-xl text-xs hover:bg-indigo-100 transition-colors"
          >
            Baixar Relatório
          </button>
        </div>
      </div>
    </div>
  );
}
