import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, DollarSign, Calculator, ArrowUpRight, ArrowDownRight, Target, Award, Sparkles, Send, Plus, Trash2, CheckCircle, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../context/AppContext';

const StatCard = ({ icon: Icon, label, value, trend, iconBg, iconColor }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all group"
  >
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      <div className={`w-10 h-10 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center font-bold`}>
        <Icon size={20} />
      </div>
    </div>

    <div className="mt-3 flex items-baseline justify-between">
      <h3 className="text-2xl font-black tracking-tight text-slate-900">{value}</h3>
      {trend && (
        <span className={`inline-flex items-center gap-0.5 text-xs font-extrabold px-2 py-0.5 rounded-md ${
          trend > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
        }`}>
          {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </span>
      )}
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
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Welcome Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200/60 text-xs font-bold rounded-md inline-flex items-center gap-1">
                <Sparkles size={12} /> {usuario?.nomeNegocio || 'Painel de Gestão'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Olá, {usuario?.nome || 'Microentreendedor'}! 👋
            </h1>
            <p className="text-slate-500 font-medium text-xs sm:text-sm mt-0.5">Confira o resumo financeiro e metas do seu negócio hoje.</p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowOrcamentoModal(true)}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 rounded-xl font-bold text-xs transition-colors flex items-center gap-2"
            >
              <Send size={15} className="text-indigo-600" />
              Enviar Orçamento
            </button>
            <button
              onClick={() => setShowVendaModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all flex items-center gap-2"
            >
              <TrendingUp size={15} />
              Nova Venda
            </button>
          </div>
        </motion.div>

        {/* Goal Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <Target size={16} className="text-emerald-400" /> Meta de Faturamento Mensal MEI
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black tracking-tight">R$ {totalReceitas.toFixed(2)}</span>
                <span className="text-slate-400 text-sm font-semibold">de R$ {metaMensal.toFixed(2)}</span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1 pt-1">
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressoMeta}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-emerald-400 rounded-full shadow-xs"
                  />
                </div>
                <div className="flex justify-between text-[11px] font-bold text-slate-400 pt-1">
                  <span>{progressoMeta}% concluído</span>
                  <span>Faltam R$ {Math.max(0, metaMensal - totalReceitas).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {progressoMeta >= 100 && (
              <div className="bg-emerald-500/20 border border-emerald-400/30 p-4 rounded-xl flex items-center gap-3">
                <Award size={28} className="text-amber-300 shrink-0" />
                <div>
                  <p className="font-extrabold text-xs text-emerald-200">Parabéns! Meta Atingida! 🎉</p>
                  <p className="text-[11px] text-slate-300">Seu faturamento superou a meta este mês.</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={TrendingUp}
            label="Faturamento Bruto"
            value={`R$ ${totalReceitas.toFixed(2)}`}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            trend={12}
          />
          <StatCard
            icon={DollarSign}
            label="Lucro Bruto"
            value={`R$ ${lucroBrutoProdutos.toFixed(2)}`}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            trend={8}
          />
          <StatCard
            icon={TrendingDown}
            label="Total Despesas"
            value={`R$ ${totalDespesas.toFixed(2)}`}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            trend={-3}
          />
          <StatCard
            icon={DollarSign}
            label="Lucro Líquido"
            value={`R$ ${lucroLiquido.toFixed(2)}`}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
            trend={15}
          />
        </div>

        {/* Charts & Quick Navigation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Evolução de Receitas e Despesas</h3>
              <span className="text-[11px] font-bold text-slate-400">Ano Vigente</span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '11px', fontWeight: 600 }} />
                  <YAxis stroke="#94a3b8" style={{ fontSize: '11px', fontWeight: 600 }} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: '12px',
                      fontWeight: 600
                    }}
                    formatter={(value: any) => `R$ ${Number(value || 0).toFixed(2)}`}
                  />
                  <Area type="monotone" dataKey="receitas" name="Receitas" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReceita)" />
                  <Area type="monotone" dataKey="despesas" name="Despesas" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDespesa)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Quick Actions Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3"
          >
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Acesso Rápido</h3>
            
            <button
              onClick={() => setShowVendaModal(true)}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-400" /> Registrar Nova Venda
              </span>
              <ArrowUpRight size={16} />
            </button>

            <button
              onClick={() => setActiveView('precificacao')}
              className="w-full py-3 px-4 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/60 font-bold text-xs transition-all flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Calculator size={16} className="text-indigo-600" /> Calculadora de Preços
              </span>
              <ArrowUpRight size={16} />
            </button>

            <button
              onClick={() => setActiveView('produtos')}
              className="w-full py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs transition-all flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                📦 Gestão de Estoque
              </span>
              <ArrowUpRight size={16} />
            </button>

            <button
              onClick={() => setActiveView('relatorios')}
              className="w-full py-3 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs transition-all flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                📊 Relatórios MEI
              </span>
              <ArrowUpRight size={16} />
            </button>
          </motion.div>
        </div>

        {/* Recent Transactions List */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Últimas Transações</h3>
            <button onClick={() => setActiveView('relatorios')} className="text-xs font-bold text-indigo-600 hover:underline">
              Ver todas
            </button>
          </div>

          <div className="space-y-2">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                      tx.type === 'venda' 
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {tx.type === 'venda' ? '↑' : '↓'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{tx.descricao}</p>
                      <p className="text-[11px] text-slate-400">{new Date(tx.data).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-extrabold ${tx.valor > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {tx.valor > 0 ? '+' : ''} R$ {Math.abs(tx.valor).toFixed(2)}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-xl">
                Nenhuma transação registrada ainda.
              </div>
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
