import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Download, TrendingUp, TrendingDown, Database, DollarSign, FileText } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAppContext } from '../context/AppContext';

export default function Reports() {
  const { vendas, despesas, insumos, receitas } = useAppContext();

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
    return data.slice(0, mesAtual + 1);
  }, [vendas, despesas]);

  const topProdutos = useMemo(() => {
    const counts: Record<string, { nome: string, qtd: number, receita: number, lucro: number }> = {};
    vendas.forEach(v => {
      if (!counts[v.produtoId]) counts[v.produtoId] = { nome: v.nomeProduto, qtd: 0, receita: 0, lucro: 0 };
      counts[v.produtoId].qtd += v.quantidade;
      counts[v.produtoId].receita += (v.valorVenda * v.quantidade);
      counts[v.produtoId].lucro += (v.lucroLiquido || ((v.valorVenda - (v.custoProduto || 0)) * v.quantidade));
    });
    return Object.values(counts).sort((a, b) => b.qtd - a.qtd).slice(0, 5);
  }, [vendas]);

  const totaisGerais = reportData.reduce((acc, curr) => {
    acc.receitas += curr.receitas;
    acc.despesas += curr.despesas;
    acc.lucro += curr.lucro;
    return acc;
  }, { receitas: 0, despesas: 0, lucro: 0 });

  const valorEstoqueInsumos = insumos.reduce((acc, i) => acc + (i.precoPorPacote / (i.tamanhoPacote || 1)) * i.estoqueTotal, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Relatórios</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Análise financeira de seus dados.</p>
        </div>
        <button 
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Download size={18} />
          Exportar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Receitas</p>
            <h3 className="text-xl font-black text-slate-900">R$ {totaisGerais.receitas.toFixed(2)}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="bg-rose-100 p-3 rounded-xl text-rose-600">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Despesas</p>
            <h3 className="text-xl font-black text-slate-900">R$ {totaisGerais.despesas.toFixed(2)}</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
            <Database size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Em Estoque</p>
            <h3 className="text-xl font-black text-slate-900">R$ {valorEstoqueInsumos.toFixed(2)}</h3>
          </div>
        </div>
        <div className="bg-indigo-600 p-5 rounded-2xl shadow-md text-white flex items-start gap-4">
          <div className="bg-white/20 p-3 rounded-xl">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-indigo-200 uppercase mb-1">Lucro Líquido</p>
            <h3 className="text-xl font-black">R$ {totaisGerais.lucro.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6">Desempenho Financeiro</h3>
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
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                />
                <Area type="monotone" dataKey="receitas" name="Receitas" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorReceita)" />
                <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorDespesa)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6">Lucro por Mês</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                />
                <Bar dataKey="lucro" name="Lucro" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
         <div className="p-5 border-b border-slate-100 bg-slate-50/50">
           <h3 className="text-lg font-bold text-slate-900">Documentos para Exportação</h3>
           <p className="text-sm text-slate-500">Gere relatórios formatados.</p>
         </div>
         <div className="p-0">
           <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <FileText size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Resumo Financeiro</h4>
                <p className="text-xs text-slate-500">Receitas, despesas e lucros.</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-sm hover:bg-indigo-100">
              Gerar
            </button>
          </div>
         </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Produtos Mais Vendidos</h3>
            <p className="text-sm text-slate-500">Itens com maior receita.</p>
          </div>
        </div>
        <div className="p-0 overflow-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-slate-400 uppercase bg-white border-b border-slate-100">
                <th className="p-5">Produto</th>
                <th className="p-5 text-right">Qtd.</th>
                <th className="p-5 text-right">Receita</th>
                <th className="p-5 text-right">Lucro</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {topProdutos.map((p, idx) => (
                <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="p-5 font-bold text-slate-800">{p.nome}</td>
                  <td className="p-5 text-right text-slate-600">{p.qtd}</td>
                  <td className="p-5 text-right font-bold text-indigo-600">R$ {p.receita.toFixed(2)}</td>
                  <td className="p-5 text-right text-emerald-600 font-bold">R$ {p.lucro.toFixed(2)}</td>
                </tr>
              ))}
              {topProdutos.length === 0 && (
                <tr><td colSpan={4} className="p-10 text-center text-slate-400">Sem dados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900">Análise por Produto</h3>
          <p className="text-sm text-slate-500">Custo, preço e margem de cada produto.</p>
        </div>
        <div className="p-0 overflow-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-slate-400 uppercase bg-white border-b border-slate-100">
                <th className="p-5">Produto</th>
                <th className="p-5 text-right">Custo</th>
                <th className="p-5 text-right">Venda</th>
                <th className="p-5 text-right">Lucro</th>
                <th className="p-5 text-right">Margem</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {receitas.map(r => {
                const lucro = r.precoSugeridoUnitario - r.custoTotalUnitario;
                const margem = r.precoSugeridoUnitario > 0 ? (lucro / r.precoSugeridoUnitario) * 100 : 0;
                return (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="p-5 font-bold text-slate-800">{r.nome}</td>
                    <td className="p-5 text-right text-rose-600">R$ {r.custoTotalUnitario.toFixed(2)}</td>
                    <td className="p-5 text-right font-bold">R$ {r.precoSugeridoUnitario.toFixed(2)}</td>
                    <td className="p-5 text-right text-emerald-600 font-bold">R$ {lucro.toFixed(2)}</td>
                    <td className="p-5 text-right font-bold text-indigo-600">{margem.toFixed(1)}%</td>
                  </tr>
                );
              })}
              {receitas.length === 0 && (
                <tr><td colSpan={5} className="p-10 text-center text-slate-400">Sem dados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
