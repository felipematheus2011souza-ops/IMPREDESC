import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, DollarSign, Calculator, ArrowUpRight, ArrowDownRight, Target, Award, Sparkles, Send, Plus, Trash2, CheckCircle, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../context/AppContext';

const StatCard = ({ icon: Icon, label, value, trend, color, gradient }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    className={`relative overflow-hidden rounded-3xl border border-white/40 p-6 backdrop-blur-xl group cursor-default shadow-sm`}
    style={{
      background: `linear-gradient(135deg, ${color}12 0%, ${color}04 100%)`,
    }}
  >
    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300" style={{ background: gradient }}></div>
    <div className="relative z-10 space-y-3">
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-2xl ${color}20`}>
          <Icon size={24} style={{ color }} className="transition-transform group-hover:scale-110" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold ${
            trend > 0 ? 'bg-emerald-100/80 text-emerald-800' : 'bg-rose-100/80 text-rose-800'
          }`}>
            {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
      </div>
    </div>
  </motion.div>
);

export default function Dashboard({ setActiveView }: { setActiveView: (v: string) => void }) {
  const { usuario, vendas, setVendas, despesas, produtos, setProdutos, orcamentos, setOrcamentos } = useAppContext();
  const [showVendaModal, setShowVendaModal] = useState(false);
  const [showOrcamentoModal, setShowOrcamentoModal] = useState(false);

  const [vendaForm, setVendaForm] = useState({ produtoId: '', quantidade: 1, data: new Date().toISOString().substring(0, 10) });

  // Quotation form state
  const [clienteNome, setClienteNome] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');
  const [dataValidade, setDataValidade] = useState(new Date(Date.now() + 7 * 86400000).toISOString().substring(0, 10));
  const [observacoes, setObservacoes] = useState('');
  const [orcamentoItens, setOrcamentoItens] = useState<{ produtoId: string; nomeProduto: string; quantidade: number; precoUnitario: number }[]>([]);
  const [itemDraft, setItemDraft] = useState({ produtoId: '', quantidade: 1 });

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

  const addItemToOrcamento = () => {
    const prod = produtos.find(p => p.id === itemDraft.produtoId);
    if (!prod) return alert('Selecione um produto.');
    setOrcamentoItens([...orcamentoItens, {
      produtoId: prod.id,
      nomeProduto: prod.nome,
      quantidade: itemDraft.quantidade,
      precoUnitario: prod.precoVenda
    }]);
    setItemDraft({ produtoId: '', quantidade: 1 });
  };

  const handleGerarOrcamento = () => {
    if (!clienteNome || orcamentoItens.length === 0) return alert('Informe o cliente e ao menos 1 item.');
    const valorTotal = orcamentoItens.reduce((acc, item) => acc + (item.precoUnitario * item.quantidade), 0);

    const novo = {
      id: crypto.randomUUID(),
      clienteNome,
      clienteTelefone,
      dataValidade,
      observacoes,
      itens: orcamentoItens,
      valorTotal,
      status: 'enviado' as const,
      dataCriacao: new Date().toISOString()
    };

    setOrcamentos([novo, ...orcamentos]);

    // Copy quote text for WhatsApp
    let textoWhats = `*ORÇAMENTO - ${usuario?.nomeNegocio || 'IMPREDESC'}*\n`;
    textoWhats += `Cliente: ${clienteNome}\n`;
    textoWhats += `Validade: ${new Date(dataValidade).toLocaleDateString('pt-BR')}\n\n`;
    textoWhats += `*Itens:*\n`;
    orcamentoItens.forEach(item => {
      textoWhats += `- ${item.quantidade}x ${item.nomeProduto}: R$ ${(item.precoUnitario * item.quantidade).toFixed(2)}\n`;
    });
    textoWhats += `\n*TOTAL: R$ ${valorTotal.toFixed(2)}*\n`;
    if (observacoes) textoWhats += `\nObs: ${observacoes}`;

    try {
      navigator.clipboard.writeText(textoWhats);
      alert('Orçamento gerado e texto copiado para a área de transferência! Cole no WhatsApp do cliente.');
    } catch {
      alert('Orçamento gerado com sucesso!');
    }

    setShowOrcamentoModal(false);
    setClienteNome('');
    setClienteTelefone('');
    setObservacoes('');
    setOrcamentoItens([]);
  };

  const totalReceitas = vendas.reduce((acc, v) => acc + (v.valorVenda * v.quantidade), 0);
  const totalCustoProdutos = vendas.reduce((acc, v) => acc + ((v.custoProduto || 0) * v.quantidade), 0);
  const lucroBrutoProdutos = totalReceitas - totalCustoProdutos;
  
  const totalDespesas = despesas.reduce((acc, d) => acc + d.valor, 0);
  const lucroLiquido = lucroBrutoProdutos - totalDespesas;

  // Monthly Goal Calculation
  const metaMensal = usuario?.metaFaturamentoMensal || 5000;
  const progressoMeta = Math.min(100, Math.round((totalReceitas / metaMensal) * 100));

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
        
        {/* Header with Welcome Greeting */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full flex items-center gap-1">
                <Sparkles size={12} /> {usuario?.nomeNegocio || 'Painel MEI'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
              Olá, {usuario?.nome || 'Microentreendedor'}! 👋
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">Acompanhe o desempenho do seu negócio em tempo real.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowOrcamentoModal(true)}
              className="px-4 py-3 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 rounded-2xl font-bold text-xs shadow-sm transition-all flex items-center gap-2"
            >
              <Send size={16} className="text-indigo-600" />
              Enviar Orçamento
            </button>
            <button
              onClick={() => setShowVendaModal(true)}
              className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <TrendingUp size={16} />
              Nova Venda
            </button>
          </div>
        </motion.div>

        {/* Goal Widget Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <Target size={18} className="text-emerald-400" /> Meta de Faturamento Mensal MEI
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black">R$ {totalReceitas.toFixed(2)}</span>
                <span className="text-indigo-300 text-sm font-semibold">de R$ {metaMensal.toFixed(2)}</span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1 pt-1">
                <div className="w-full h-3 bg-indigo-950/80 rounded-full overflow-hidden p-0.5 border border-indigo-700/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressoMeta}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full shadow-md"
                  />
                </div>
                <div className="flex justify-between text-[11px] font-bold text-indigo-300 pt-1">
                  <span>{progressoMeta}% concluído</span>
                  <span>Faltam R$ {Math.max(0, metaMensal - totalReceitas).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {progressoMeta >= 100 && (
              <div className="bg-emerald-500/20 border border-emerald-400/40 p-4 rounded-2xl flex items-center gap-3 backdrop-blur-sm">
                <Award size={32} className="text-amber-300 shrink-0" />
                <div>
                  <p className="font-extrabold text-sm text-emerald-200">Parabéns! Meta Atingida! 🎉</p>
                  <p className="text-xs text-indigo-200">Seu faturamento superou a meta mensal.</p>
                </div>
              </div>
            )}
          </div>
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
            className="lg:col-span-2 rounded-3xl border border-white/40 p-6 backdrop-blur-xl bg-white/70 shadow-sm"
          >
            <h3 className="text-base font-extrabold text-slate-900 mb-6 uppercase tracking-wider text-xs">Evolução Mensal</h3>
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(203, 213, 225, 0.2)" />
                  <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px',
                      border: 'none', 
                      background: 'rgba(15, 23, 42, 0.95)',
                      backdropFilter: 'blur(10px)',
                      color: '#fff'
                    }}
                    formatter={(value: any) => `R$ ${Number(value || 0).toFixed(2)}`}
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
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider px-2">Acesso Rápido</h3>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowVendaModal(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              <TrendingUp size={18} />
              Nova Venda
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveView('precificacao')}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Calculator size={18} />
              Calculadora de Preço
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveView('produtos')}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              📦 Gestão de Estoque
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveView('relatorios')}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              📊 Relatórios Financeiros
            </motion.button>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl border border-white/40 p-6 backdrop-blur-xl bg-white/70 shadow-sm"
        >
          <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-6">Últimas Transações</h3>
          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white/60 hover:bg-white transition-all border border-slate-100"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base ${
                      tx.type === 'venda' 
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {tx.type === 'venda' ? '↑' : '↓'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{tx.descricao}</p>
                      <p className="text-xs text-slate-400">{new Date(tx.data).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <p className={`text-base font-extrabold ${tx.valor > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.valor > 0 ? '+' : ''} R$ {Math.abs(tx.valor).toFixed(2)}
                  </p>
                </motion.div>
              ))
            ) : (
              <p className="text-center text-slate-400 py-8 text-sm">Nenhuma transação registrada ainda.</p>
            )}
          </div>
        </motion.div>

        {/* Modal Venda */}
        <AnimatePresence>
          {showVendaModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Registrar Venda</h2>
                  <button
                    onClick={() => setShowVendaModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Produto</label>
                    <select
                      value={vendaForm.produtoId}
                      onChange={(e) => setVendaForm({ ...vendaForm, produtoId: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      <option value="">Selecione um produto...</option>
                      {produtos.map(p => (
                        <option key={p.id} value={p.id}>{p.nome} ({p.estoque} em estoque)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Quantidade</label>
                    <input
                      type="number"
                      min={1}
                      value={vendaForm.quantidade}
                      onChange={(e) => setVendaForm({ ...vendaForm, quantidade: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Data</label>
                    <input
                      type="date"
                      value={vendaForm.data}
                      onChange={(e) => setVendaForm({ ...vendaForm, data: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowVendaModal(false)}
                      className="px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleRegistrarVenda}
                      className="px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:shadow-lg transition-all"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal Orçamento */}
        <AnimatePresence>
          {showOrcamentoModal && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Gerar Orçamento / Cotação</h2>
                    <p className="text-xs text-slate-500">Envie um orçamento personalizado para seu cliente.</p>
                  </div>
                  <button onClick={() => setShowOrcamentoModal(false)} className="p-2 text-slate-400 hover:text-slate-600">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nome do Cliente *</label>
                      <input
                        type="text"
                        value={clienteNome}
                        onChange={e => setClienteNome(e.target.value)}
                        placeholder="Ex: João Silva"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Telefone / Whats</label>
                      <input
                        type="text"
                        value={clienteTelefone}
                        onChange={e => setClienteTelefone(e.target.value)}
                        placeholder="(11) 99999-9999"
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                  </div>

                  {/* Add items */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <p className="font-bold text-xs uppercase text-slate-500">Adicionar Produtos ao Orçamento</p>
                    <div className="flex gap-2">
                      <select
                        value={itemDraft.produtoId}
                        onChange={e => setItemDraft({ ...itemDraft, produtoId: e.target.value })}
                        className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl outline-none text-xs font-semibold"
                      >
                        <option value="">Selecione um produto...</option>
                        {produtos.map(p => (
                          <option key={p.id} value={p.id}>{p.nome} (R$ {p.precoVenda.toFixed(2)})</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={itemDraft.quantidade}
                        onChange={e => setItemDraft({ ...itemDraft, quantidade: Number(e.target.value) })}
                        className="w-16 p-2.5 bg-white border border-slate-200 rounded-xl outline-none text-xs font-bold text-center"
                      />
                      <button
                        type="button"
                        onClick={addItemToOrcamento}
                        className="px-3 bg-indigo-600 text-white rounded-xl font-bold text-xs hover:bg-indigo-700"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Table of quote items */}
                    {orcamentoItens.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-slate-200">
                        {orcamentoItens.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs p-2 bg-white rounded-lg border border-slate-100">
                            <span className="font-bold text-slate-800">{item.quantidade}x {item.nomeProduto}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-indigo-600">R$ {(item.precoUnitario * item.quantidade).toFixed(2)}</span>
                              <button onClick={() => setOrcamentoItens(orcamentoItens.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-rose-600">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                        <div className="text-right pt-2 font-black text-slate-900 text-sm">
                          Total: R$ {orcamentoItens.reduce((a, b) => a + (b.precoUnitario * b.quantidade), 0).toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Validade do Orçamento</label>
                    <input
                      type="date"
                      value={dataValidade}
                      onChange={e => setDataValidade(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Observações / Condições</label>
                    <textarea
                      value={observacoes}
                      onChange={e => setObservacoes(e.target.value)}
                      placeholder="Ex: 50% de sinal no pedido e 50% na entrega."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs"
                      rows={2}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleGerarOrcamento}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} /> Gerar e Copiar para WhatsApp
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
