import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, DollarSign, Calculator, X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../context/AppContext';

const StatCard = ({ icon: Icon, label, value, trend, color, gradient }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    className={`relative overflow-hidden rounded-2xl border border-white/20 p-6 backdrop-blur-xl group cursor-default`}
    style={{
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
    }}
  >
    {/* Gradient Background Effect */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300" style={{ background: gradient }}></div>
    
    {/* Animated border glow */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 blur-xl transition-opacity" style={{ background: gradient }}></div>

    <div className="relative z-10 space-y-3">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-2xl ${color}20`}>
          <Icon size={24} style={{ color }} className="transition-transform group-hover:scale-110" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-semibold ${
            trend > 0 ? 'bg-green-100/50 text-green-700' : 'bg-red-100/50 text-red-700'
          }`}>
            {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      </div>
    </div>
  </motion.div>
);

export default function Dashboard({ setActiveView }: { setActiveView: (v: string) => void }) {
  const { vendas, setVendas, despesas, produtos, setProdutos } = useAppContext();
  const [showVendaModal, setShowVendaModal] = useState(false);
  const [vendaForm, setVendaForm] = useState({ produtoId: '', quantidade: 1, data: new Date().toISOString().substring(0, 10) });

  const handleRegistrarVenda = () => {
    const prod = produtos.find(p => p.id === vendaForm.produtoId);
    if (!prod) return alert('Selecione um produto.');
    if (prod.estoque < vendaForm.quantidade) return alert('Estoque insuficiente para esta venda.');
    
    const novaVenda = {
      id: crypto.randomUUID(),
      produtoId: prod.id,
      nomeProduto: prod.nome,
      valorVenda: prod.precoVenda,
      custoProduto: prod.custo,
      lucroLiquido: (prod.precoVenda - prod.custo) * vendaForm.quantidade,
      quantidade: vendaForm.quantidade,
      data: vendaForm.data
    };

    setVendas([...vendas, novaVenda]);
    setProdutos(produtos.map(p => p.id === prod.id ? { ...p, estoque: p.estoque - vendaForm.quantidade } : p));
    setShowVendaModal(false);
    setVendaForm({ produtoId: '', quantidade: 1, data: new Date().toISOString().substring(0, 10) });
  };

  const totalReceitas = vendas.reduce((acc, v) => acc + (v.valorVenda * v.quantidade), 0);
  const totalCustoProdutos = vendas.reduce((acc, v) => acc + ((v.custoProduto || 0) * v.quantidade), 0);
  const lucroBrutoProdutos = totalReceitas - totalCustoProdutos;
  
  const totalDespesas = despesas.reduce((acc, d) => acc + d.valor, 0);
  const lucroLiquido = lucroBrutoProdutos - totalDespesas;

  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const chartData = meses.map(mes => ({ name: mes, receitas: 0, despesas: 0 }));

  vendas.forEach(venda => {
    const data = new Date(venda.data);
    if (!isNaN(data.getTime())) {
      const mesIndex = data.getMonth();
      chartData[mesIndex].receitas += (venda.valorVenda * venda.quantidade);
    }
  });

  despesas.forEach(despesa => {
    const data = new Date(despesa.data);
    if (!isNaN(data.getTime())) {
      const mesIndex = data.getMonth();
      chartData[mesIndex].despesas += despesa.valor;
    }
  });

  const mesAtual = new Date().getMonth();
  const activeChartData = chartData.slice(0, mesAtual + 1);

  const recentTransactions = [
    ...vendas.slice(-3).map(v => ({ type: 'venda', descricao: v.nomeProduto, valor: v.valorVenda * v.quantidade, data: v.data })),
    ...despesas.slice(-3).map(d => ({ type: 'despesa', descricao: d.descricao, valor: -d.valor, data: d.data }))
  ].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 5);

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-4"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-500">Acompanhe o desempenho financeiro em tempo real</p>
        </motion.div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={TrendingUp}
            label="Faturamento Bruto"
            value={`R$ ${totalReceitas.toFixed(2)}`}
            color="#3b82f6"
            gradient="linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%)"
            trend={12}
          />
          <StatCard
            icon={DollarSign}
            label="Lucro Bruto"
            value={`R$ ${lucroBrutoProdutos.toFixed(2)}`}
            color="#10b981"
            gradient="linear-gradient(135deg, #10b981 0%, #06b6d4 100%)"
            trend={8}
          />
          <StatCard
            icon={TrendingDown}
            label="Total de Despesas"
            value={`R$ ${totalDespesas.toFixed(2)}`}
            color="#f59e0b"
            gradient="linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)"
            trend={-3}
          />
          <StatCard
            icon={DollarSign}
            label="Lucro Líquido"
            value={`R$ ${lucroLiquido.toFixed(2)}`}
            color="#8b5cf6"
            gradient="linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)"
            trend={15}
          />
        </div>

        {/* Charts and Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 rounded-2xl border border-white/20 p-6 backdrop-blur-xl bg-white/40 hover:border-white/40 transition-all duration-300 shadow-lg"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-6">Desempenho Financeiro</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(203, 213, 225, 0.1)" />
                  <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      background: 'rgba(15, 23, 42, 0.9)',
                      backdropFilter: 'blur(10px)',
                      color: '#fff'
                    }}
                    formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                  />
                  <Area type="monotone" dataKey="receitas" name="Receitas" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorReceita)" />
                  <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorDespesa)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-bold text-slate-900 px-2">Ações Rápidas</h3>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowVendaModal(true)}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <TrendingUp size={20} />
              Nova Venda
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveView('precificacao')}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Calculator size={20} />
              Precificação
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveView('produtos')}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              📦 Produtos
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveView('relatorios')}
              className="w-full py-4 px-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
            >
              📊 Relatórios
            </motion.button>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/20 p-6 backdrop-blur-xl bg-white/40 shadow-lg"
        >
          <h3 className="text-lg font-bold text-slate-900 mb-6">Atividade Recente</h3>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/40 hover:bg-white/60 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                      tx.type === 'venda' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {tx.type === 'venda' ? '↑' : '↓'}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{tx.descricao}</p>
                      <p className="text-sm text-slate-500">{new Date(tx.data).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <p className={`text-lg font-bold ${tx.valor > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.valor > 0 ? '+' : ''} R$ {Math.abs(tx.valor).toFixed(2)}
                  </p>
                </motion.div>
              ))
            ) : (
              <p className="text-center text-slate-400 py-8">Nenhuma transação ainda</p>
            )}
          </div>
        </motion.div>

        {/* Modal Venda */}
        <AnimatePresence>
          {showVendaModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">Registrar Venda</h2>
                  <motion.button
                    whileHover={{ rotate: 90 }}
                    onClick={() => setShowVendaModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X size={24} />
                  </motion.button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Produto</label>
                    <select
                      value={vendaForm.produtoId}
                      onChange={(e) => setVendaForm({ ...vendaForm, produtoId: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    >
                      <option value="">Selecione um produto...</option>
                      {produtos.map(p => (
                        <option key={p.id} value={p.id}>{p.nome} ({p.estoque} em estoque)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Quantidade</label>
                    <input
                      type="number"
                      min={1}
                      value={vendaForm.quantidade}
                      onChange={(e) => setVendaForm({ ...vendaForm, quantidade: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Data</label>
                    <input
                      type="date"
                      value={vendaForm.data}
                      onChange={(e) => setVendaForm({ ...vendaForm, data: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowVendaModal(false)}
                      className="px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleRegistrarVenda}
                      className="px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:shadow-lg transition-all"
                    >
                      Registrar
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <div className="bg-indigo-600 p-4 sm:p-5 rounded-2xl shadow-sm text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[10px] font-semibold text-indigo-200 uppercase tracking-widest">Faturamento Bruto</h3>
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white hidden sm:flex">
                <TrendingUp size={16} />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold">R$ {totalReceitas.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-emerald-600 p-4 sm:p-5 rounded-2xl shadow-sm text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[10px] font-semibold text-emerald-200 uppercase tracking-widest">Lucro Bruto</h3>
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white hidden sm:flex">
                <DollarSign size={16} />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold">R$ {lucroBrutoProdutos.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl shadow-sm text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Despesas Totais</h3>
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white hidden sm:flex">
                <TrendingDown size={16} />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold">R$ {totalDespesas.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 sm:p-5 rounded-2xl shadow-sm text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[10px] font-semibold text-indigo-100 uppercase tracking-widest">Lucro Líquido</h3>
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white hidden sm:flex">
                <Wallet size={16} />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold">R$ {lucroLiquido.toFixed(2)}</p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <button onClick={() => setActiveView('precificacao')} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-2 hover:border-indigo-300 hover:shadow-md transition-all group">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Calculator size={20} />
          </div>
          <span className="text-xs font-bold text-slate-700">Precificar</span>
        </button>

        <button onClick={() => setShowVendaModal(true)} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-2 hover:border-emerald-300 hover:shadow-md transition-all group">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <TrendingUp size={20} />
          </div>
          <span className="text-xs font-bold text-slate-700">Venda</span>
        </button>

        <button onClick={() => setActiveView('despesas')} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-2 hover:border-rose-300 hover:shadow-md transition-all group">
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
            <Receipt size={20} />
          </div>
          <span className="text-xs font-bold text-slate-700">Despesa</span>
        </button>

        <button onClick={() => setActiveView('relatorios')} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center gap-2 hover:border-purple-300 hover:shadow-md transition-all group">
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <PieChart size={20} />
          </div>
          <span className="text-xs font-bold text-slate-700">Relatórios</span>
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Tendência de Vendas</h3>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => `R$ ${(value as number).toFixed(2)}`}
                />
                <Area type="monotone" dataKey="receitas" name="Receitas" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorVendas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col p-5">
          <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest mb-4">Atividade Recente</h3>
          
          <div className="flex-1 space-y-3 max-h-[200px] overflow-y-auto">
            {vendas.length === 0 && despesas.length === 0 ? (
              <p className="text-[10px] text-slate-400 text-center mt-6">Nenhuma atividade registrada.</p>
            ) : (
              [...vendas.slice(-3)].reverse().map((v) => (
                <div key={v.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-2 flex-1">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <TrendingUp size={14}/>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-800 truncate">{v.nomeProduto}</p>
                      <p className="text-[10px] text-slate-400">{new Date(v.data).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="text-[11px] font-bold text-emerald-600 whitespace-nowrap ml-2">+R$ {(v.valorVenda * v.quantidade).toFixed(2)}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {showVendaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">Registrar Nova Venda</h3>
              <button onClick={() => setShowVendaModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-slate-700 font-bold mb-2 text-sm">Produto / Serviço</label>
                <select 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  value={vendaForm.produtoId}
                  onChange={(e) => setVendaForm({ ...vendaForm, produtoId: e.target.value })}
                >
                  <option value="">Selecione um produto...</option>
                  {produtos.map(p => (
                    <option key={p.id} value={p.id}>{p.nome} - R$ {p.precoVenda.toFixed(2)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-2 text-sm">Quantidade</label>
                <input 
                  type="number"
                  min="1"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  value={vendaForm.quantidade}
                  onChange={(e) => setVendaForm({ ...vendaForm, quantidade: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-2 text-sm">Data da Venda</label>
                <input 
                  type="date"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  value={vendaForm.data}
                  onChange={(e) => setVendaForm({ ...vendaForm, data: e.target.value })}
                />
              </div>
            </div>
            <div className="p-6 bg-slate-50 flex gap-3 justify-end border-t border-slate-100">
              <button onClick={() => setShowVendaModal(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors">Cancelar</button>
              <button onClick={handleRegistrarVenda} className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow-sm hover:bg-emerald-700 transition-colors flex items-center gap-2">
                <TrendingUp size={18} /> Confirmar
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
