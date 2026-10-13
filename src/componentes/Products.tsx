import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Box, Trash2, TrendingUp, X, AlertCircle, Package, Search, Filter } from 'lucide-react';
import type { ProdutoCadastrado, Venda } from '../types';
import { useAppContext } from '../context/AppContext';

export default function Products() {
  const { produtos, setProdutos, vendas, setVendas } = useAppContext();
  
  const [showVendaModal, setShowVendaModal] = useState(false);
  const [showProduzirModal, setShowProduzirModal] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoCadastrado | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStock, setFilterStock] = useState<'todos' | 'em_estoque' | 'esgotado'>('todos');

  const [vendaForm, setVendaForm] = useState({ quantidade: 1, data: new Date().toISOString().split('T')[0] });
  const [produzirForm, setProduzirForm] = useState({ quantidade: 1, validadeDias: 7 });

  const calcularValidade = (dias: number) => {
    const d = new Date();
    d.setDate(d.getDate() + dias);
    return d.toISOString().split('T')[0];
  };

  const handleRegistrarVenda = () => {
    if (!produtoSelecionado || vendaForm.quantidade < 1) return;
    
    if (produtoSelecionado.estoque < vendaForm.quantidade) {
      alert("Estoque insuficiente!");
      return;
    }

    const novaVenda: Venda = {
      id: crypto.randomUUID(),
      produtoId: produtoSelecionado.id,
      nomeProduto: produtoSelecionado.nome,
      valorVenda: produtoSelecionado.precoVenda,
      custoProduto: produtoSelecionado.custo,
      lucroLiquido: (produtoSelecionado.precoVenda - produtoSelecionado.custo) * vendaForm.quantidade,
      quantidade: vendaForm.quantidade,
      data: vendaForm.data
    };

    setVendas([novaVenda, ...vendas]);
    
    setProdutos(produtos.map(p => 
      p.id === produtoSelecionado.id ? { ...p, estoque: p.estoque - vendaForm.quantidade } : p
    ));

    setShowVendaModal(false);
    setProdutoSelecionado(null);
    setVendaForm({ quantidade: 1, data: new Date().toISOString().split('T')[0] });
  };

  const handleProduzirMais = () => {
    if (!produtoSelecionado || produzirForm.quantidade < 1) return;

    setProdutos(produtos.map(p => 
      p.id === produtoSelecionado.id 
      ? { ...p, estoque: p.estoque + produzirForm.quantidade } 
      : p
    ));

    setShowProduzirModal(false);
    setProdutoSelecionado(null);
    setProduzirForm({ quantidade: 1, validadeDias: 7 });
  };

  const excluirProduto = (id: string) => {
    if(window.confirm("Deseja realmente excluir este produto?")) {
      setProdutos(produtos.filter(p => p.id !== id));
    }
  };

  // Filtering
  const produtosFiltrados = produtos.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.descricao && p.descricao.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filterStock === 'em_estoque') return matchesSearch && p.estoque > 0;
    if (filterStock === 'esgotado') return matchesSearch && p.estoque === 0;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Estoque & Inventário</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">Gerencie seus produtos acabados e disponibilidade.</p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar produto..."
                className="w-full px-4 py-2.5 pl-10 rounded-2xl bg-white border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              />
              <Search className="absolute left-3 top-3 text-slate-400" size={16} />
            </div>

            <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm w-full sm:w-auto">
              <Filter size={16} className="text-slate-400 ml-2" />
              <select
                value={filterStock}
                onChange={e => setFilterStock(e.target.value as any)}
                className="bg-transparent text-xs font-bold text-slate-700 outline-none pr-3 py-1.5 cursor-pointer"
              >
                <option value="todos">Todos</option>
                <option value="em_estoque">Em Estoque</option>
                <option value="esgotado">Esgotados</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="rounded-3xl border border-white/40 p-6 backdrop-blur-xl bg-white/60 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Produtos Cadastrados</p>
            <p className="text-3xl font-black text-slate-900">{produtos.length}</p>
          </div>
          <div className="rounded-3xl border border-white/40 p-6 backdrop-blur-xl bg-white/60 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Unidades em Estoque</p>
            <p className="text-3xl font-black text-emerald-600">{produtos.reduce((acc, p) => acc + p.estoque, 0)}</p>
          </div>
          <div className="rounded-3xl border border-white/40 p-6 backdrop-blur-xl bg-white/60 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Produtos Esgotados</p>
            <p className="text-3xl font-black text-rose-600">{produtos.filter(p => p.estoque === 0).length}</p>
          </div>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {produtosFiltrados.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -6 }}
              className="group rounded-3xl border border-white/40 backdrop-blur-xl bg-white/70 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col relative"
            >
              {/* Status Badge */}
              <AnimatePresence>
                {p.estoque === 0 && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="absolute top-4 right-4 bg-gradient-to-br from-rose-500 to-red-600 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-xl shadow-md z-10 flex items-center gap-1.5"
                  >
                    <AlertCircle size={14} /> Esgotado
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Low Stock Warning */}
              {p.estoque > 0 && p.estoque <= 3 && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute top-4 right-4 bg-gradient-to-br from-amber-500 to-orange-600 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-xl shadow-md z-10"
                >
                  Pouco Estoque
                </motion.div>
              )}
              
              {/* Content */}
              <div className="p-6 pb-4 flex-1 flex flex-col">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                    <Package size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 truncate">{p.nome}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 font-medium">{p.descricao || 'Produto cadastrado via precificação.'}</p>
                  </div>
                </div>
                
                {/* Price and Stock */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-emerald-50/80 rounded-2xl p-3 border border-emerald-100">
                    <p className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest mb-1">Preço Venda</p>
                    <p className="text-xl font-black text-emerald-700">R$ {p.precoVenda.toFixed(2)}</p>
                  </div>
                  <div className={`rounded-2xl p-3 border transition-all ${
                    p.estoque === 0 
                      ? 'bg-rose-50/80 border-rose-100'
                      : 'bg-blue-50/80 border-blue-100'
                  }`}>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: p.estoque === 0 ? '#be123c' : '#0369a1' }}>
                      Em Estoque
                    </p>
                    <p className={`text-xl font-black ${p.estoque === 0 ? 'text-rose-700' : 'text-blue-700'}`}>
                      {p.estoque} {p.unidadeMedida || 'un'}
                    </p>
                  </div>
                </div>

                {/* Profit Info */}
                <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-3">
                  <p className="text-[10px] font-extrabold text-indigo-800 uppercase tracking-widest mb-1">Lucro Estimado / Unid.</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-lg font-black text-indigo-700">R$ {(p.precoVenda - p.custo).toFixed(2)}</p>
                    <p className="text-xs text-indigo-600 font-bold">({((((p.precoVenda - p.custo) / (p.precoVenda || 1)) * 100) || 0).toFixed(0)}% margem)</p>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex gap-2">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setProdutoSelecionado(p); setShowVendaModal(true); }}
                  disabled={p.estoque === 0}
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold rounded-xl hover:shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TrendingUp size={14} /> Vender
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setProdutoSelecionado(p); setShowProduzirModal(true); }}
                  className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Plus size={14} /> Repor
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => excluirProduto(p.id)}
                  className="p-2.5 bg-white border border-rose-200 text-slate-400 rounded-xl hover:text-rose-600 hover:bg-rose-50 transition-colors shadow-sm"
                >
                  <Trash2 size={14} />
                </motion.button>
              </div>
            </motion.div>
          ))}

          {produtosFiltrados.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-full py-20 text-center bg-white/50 rounded-3xl border border-slate-200"
            >
              <Box size={48} className="text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-700 text-lg mb-1">Nenhum produto encontrado</p>
              <p className="text-slate-500 text-sm mb-4">Precifique seus produtos e salve-os para gerenciá-los aqui.</p>
            </motion.div>
          )}
        </div>

        {/* Modals */}
        <AnimatePresence>
          {showVendaModal && produtoSelecionado && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
              >
                <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">Registrar Venda</h3>
                    <p className="text-indigo-100 text-xs">{produtoSelecionado.nome}</p>
                  </div>
                  <motion.button
                    whileHover={{ rotate: 90 }}
                    onClick={() => setShowVendaModal(false)}
                    className="p-2"
                  >
                    <X size={20} />
                  </motion.button>
                </div>
                <div className="p-6 space-y-4 text-sm">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Quantidade Vendida</label>
                    <input 
                      type="number" 
                      min="1" 
                      max={produtoSelecionado.estoque} 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-700"
                      value={vendaForm.quantidade} 
                      onChange={(e) => setVendaForm({ ...vendaForm, quantidade: Number(e.target.value) })} 
                    />
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">Disponível em estoque: {produtoSelecionado.estoque}</p>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Data da Venda</label>
                    <input 
                      type="date" 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={vendaForm.data} 
                      onChange={(e) => setVendaForm({ ...vendaForm, data: e.target.value })} 
                    />
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mt-2">
                    <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider mb-1">Total da Venda</p>
                    <p className="text-2xl font-black text-emerald-700">R$ {(produtoSelecionado.precoVenda * vendaForm.quantidade).toFixed(2)}</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 flex gap-3 border-t border-slate-100">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowVendaModal(false)}
                    className="flex-1 py-3 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRegistrarVenda}
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                  >
                    Confirmar
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showProduzirModal && produtoSelecionado && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
              >
                <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-green-600 to-emerald-600 text-white flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">Reposição de Estoque</h3>
                    <p className="text-green-100 text-xs">{produtoSelecionado.nome}</p>
                  </div>
                  <motion.button
                    whileHover={{ rotate: 90 }}
                    onClick={() => setShowProduzirModal(false)}
                    className="p-2"
                  >
                    <X size={20} />
                  </motion.button>
                </div>
                <div className="p-6 space-y-4 text-sm">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Qtd. produzida a adicionar</label>
                    <input 
                      type="number" 
                      min="1" 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-emerald-700"
                      value={produzirForm.quantidade} 
                      onChange={(e) => setProduzirForm({ ...produzirForm, quantidade: Number(e.target.value) })} 
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Validade estimada (dias)</label>
                    <input 
                      type="number" 
                      min="1" 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                      value={produzirForm.validadeDias} 
                      onChange={(e) => setProduzirForm({ ...produzirForm, validadeDias: Number(e.target.value) })} 
                    />
                    <p className="text-xs text-amber-800 font-semibold mt-2 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                      📅 Vencerá em: <strong>{new Date(calcularValidade(produzirForm.validadeDias)).toLocaleDateString('pt-BR')}</strong>
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 flex gap-3 border-t border-slate-100">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowProduzirModal(false)}
                    className="flex-1 py-3 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleProduzirMais}
                    className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
                  >
                    Adicionar
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
