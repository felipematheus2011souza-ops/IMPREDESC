import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Box, Trash2, TrendingUp, X, AlertCircle, Package } from 'lucide-react';
import type { ProdutoCadastrado, Venda } from '../types';
import { useAppContext } from '../context/AppContext';

export default function Products() {
  const { produtos, setProdutos, vendas, setVendas } = useAppContext();
  
  const [showVendaModal, setShowVendaModal] = useState(false);
  const [showProduzirModal, setShowProduzirModal] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<ProdutoCadastrado | null>(null);
  
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

  const lucroMedio = produtoSelecionado ? (produtoSelecionado.precoVenda - produtoSelecionado.custo) : 0;
  const percentualLucro = produtoSelecionado && produtoSelecionado.precoVenda > 0 ? ((lucroMedio / produtoSelecionado.precoVenda) * 100) : 0;

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-4"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Inventário</h1>
          <p className="text-slate-500">Gerencie seus produtos, vendas e produção</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="rounded-2xl border border-white/20 p-6 backdrop-blur-xl bg-white/40">
            <p className="text-sm font-medium text-slate-600 mb-2">Total de Produtos</p>
            <p className="text-3xl font-bold text-slate-900">{produtos.length}</p>
          </div>
          <div className="rounded-2xl border border-white/20 p-6 backdrop-blur-xl bg-white/40">
            <p className="text-sm font-medium text-slate-600 mb-2">Em Estoque</p>
            <p className="text-3xl font-bold text-emerald-600">{produtos.reduce((acc, p) => acc + p.estoque, 0)}</p>
          </div>
          <div className="rounded-2xl border border-white/20 p-6 backdrop-blur-xl bg-white/40">
            <p className="text-sm font-medium text-slate-600 mb-2">Sem Estoque</p>
            <p className="text-3xl font-bold text-rose-600">{produtos.filter(p => p.estoque === 0).length}</p>
          </div>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {produtos.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -8 }}
              className="group rounded-2xl border border-white/20 backdrop-blur-xl bg-white/40 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col relative"
            >
              {/* Status Badge */}
              <AnimatePresence>
                {p.estoque === 0 && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="absolute top-4 right-4 bg-gradient-to-br from-rose-500 to-red-600 text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl shadow-lg z-10 flex items-center gap-1.5"
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
                  className="absolute top-4 right-4 bg-gradient-to-br from-amber-500 to-orange-600 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg shadow-lg z-10"
                >
                  Pouco Estoque
                </motion.div>
              )}
              
              {/* Content */}
              <div className="p-6 pb-4 flex-1 flex flex-col">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    <Package size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 truncate">{p.nome}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{p.descricao || 'Sem descrição'}</p>
                  </div>
                </div>
                
                {/* Price and Stock */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl p-3 border border-emerald-200/30">
                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1">Preço</p>
                    <p className="text-xl font-black text-emerald-700">R$ {p.precoVenda.toFixed(2)}</p>
                  </div>
                  <div className={`rounded-xl p-3 border transition-all ${
                    p.estoque === 0 
                      ? 'bg-gradient-to-br from-rose-100 to-rose-50 border-rose-200/30' 
                      : 'bg-gradient-to-br from-blue-100 to-blue-50 border-blue-200/30'
                  }`}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: p.estoque === 0 ? '#be123c' : '#0369a1' }}>
                      Estoque
                    </p>
                    <p className={`text-xl font-black ${p.estoque === 0 ? 'text-rose-700' : 'text-blue-700'}`}>
                      {p.estoque}
                    </p>
                  </div>
                </div>

                {/* Profit Info */}
                <div className="bg-indigo-50/50 border border-indigo-200/30 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest mb-1">Margem</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-lg font-bold text-indigo-700">R$ {(p.precoVenda - p.custo).toFixed(2)}</p>
                    <p className="text-xs text-indigo-600 font-semibold">({((((p.precoVenda - p.custo) / p.precoVenda) * 100) || 0).toFixed(0)}%)</p>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="p-3 bg-white/50 border-t border-white/30 flex gap-2">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setProdutoSelecionado(p); setShowVendaModal(true); }}
                  disabled={p.estoque === 0}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  <TrendingUp size={16} /> Vender
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setProdutoSelecionado(p); setShowProduzirModal(true); }}
                  className="flex-1 py-3 bg-white border border-slate-300 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Plus size={16} /> Produzir
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => excluirProduto(p.id)}
                  className="p-3 bg-white border border-rose-200 text-slate-400 rounded-lg hover:text-rose-600 hover:bg-rose-50 transition-colors shadow-sm"
                >
                  <Trash2 size={16} />
                </motion.button>
              </div>
            </motion.div>
          ))}

          {produtos.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-full py-24 text-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block mb-4"
              >
                <Box size={64} className="text-slate-300" />
              </motion.div>
              <p className="font-bold text-slate-600 text-xl mb-2">Nenhum produto cadastrado</p>
              <p className="text-slate-500 mb-6">Vá na aba "Precificação" para criar e salvar seus produtos.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg"
              >
                Ir para Precificação
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Modals */}
        <AnimatePresence>
          {showVendaModal && produtoSelecionado && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
              >
                <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">Registrar Venda</h3>
                    <p className="text-indigo-100 text-sm">{produtoSelecionado.nome}</p>
                  </div>
                  <motion.button
                    whileHover={{ rotate: 90 }}
                    onClick={() => setShowVendaModal(false)}
                    className="p-2"
                  >
                    <X size={20} />
                  </motion.button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-2 text-sm">Quantidade</label>
                    <input 
                      type="number" 
                      min="1" 
                      max={produtoSelecionado.estoque} 
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                      value={vendaForm.quantidade} 
                      onChange={(e) => setVendaForm({ ...vendaForm, quantidade: Number(e.target.value) })} 
                    />
                    <p className="text-[10px] text-slate-500 mt-2 font-medium">Disponível: {produtoSelecionado.estoque} unidades</p>
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-2 text-sm">Data da Venda</label>
                    <input 
                      type="date" 
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                      value={vendaForm.data} 
                      onChange={(e) => setVendaForm({ ...vendaForm, data: e.target.value })} 
                    />
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mt-4">
                    <p className="text-sm text-emerald-800 font-semibold">
                      Receita esperada: <span className="text-lg font-bold">R$ {(produtoSelecionado.precoVenda * vendaForm.quantidade).toFixed(2)}</span>
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 flex gap-3 border-t border-slate-200">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowVendaModal(false)}
                    className="flex-1 py-3 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRegistrarVenda}
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
                  >
                    Confirmar Venda
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showProduzirModal && produtoSelecionado && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
              >
                <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-green-600 to-emerald-600 text-white flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">Adicionar ao Estoque</h3>
                    <p className="text-green-100 text-sm">{produtoSelecionado.nome}</p>
                  </div>
                  <motion.button
                    whileHover={{ rotate: 90 }}
                    onClick={() => setShowProduzirModal(false)}
                    className="p-2"
                  >
                    <X size={20} />
                  </motion.button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-2 text-sm">Quantidade a Produzir</label>
                    <input 
                      type="number" 
                      min="1" 
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all" 
                      value={produzirForm.quantidade} 
                      onChange={(e) => setProduzirForm({ ...produzirForm, quantidade: Number(e.target.value) })} 
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-2 text-sm">Validade (dias)</label>
                    <input 
                      type="number" 
                      min="1" 
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all" 
                      value={produzirForm.validadeDias} 
                      onChange={(e) => setProduzirForm({ ...produzirForm, validadeDias: Number(e.target.value) })} 
                    />
                    <p className="text-sm text-amber-700 font-medium mt-2 bg-amber-50 p-2 rounded-lg">
                      📅 Vencerá em: <strong>{new Date(calcularValidade(produzirForm.validadeDias)).toLocaleDateString('pt-BR')}</strong>
                    </p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 flex gap-3 border-t border-slate-200">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowProduzirModal(false)}
                    className="flex-1 py-3 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleProduzirMais}
                    className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:shadow-lg transition-all"
                  >
                    Adicionar Estoque
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

      <AnimatePresence>
        {showVendaModal && produtoSelecionado && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-3xl shadow-xl w-full max-w-sm">
              <div className="p-6 border-b border-slate-100 bg-indigo-600 text-white">
                <h3 className="font-bold text-lg">Registrar Venda</h3>
                <p className="text-indigo-200 text-sm">{produtoSelecionado.nome}</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-2 text-sm">Quantidade</label>
                  <input type="number" min="1" max={produtoSelecionado.estoque} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={vendaForm.quantidade} onChange={(e) => setVendaForm({ ...vendaForm, quantidade: Number(e.target.value) })} />
                  <p className="text-[10px] text-slate-400 mt-1">Estoque: {produtoSelecionado.estoque}</p>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-2 text-sm">Data</label>
                  <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" value={vendaForm.data} onChange={(e) => setVendaForm({ ...vendaForm, data: e.target.value })} />
                </div>
              </div>
              <div className="p-4 bg-slate-50 flex gap-3 border-t border-slate-100">
                <button onClick={() => setShowVendaModal(false)} className="flex-1 py-3 text-slate-600 font-bold rounded-xl transition-colors">Cancelar</button>
                <button onClick={handleRegistrarVenda} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-sm hover:bg-indigo-700">Confirmar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProduzirModal && produtoSelecionado && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-3xl shadow-xl w-full max-w-sm">
              <div className="p-6 border-b border-slate-100 bg-slate-800 text-white">
                <h3 className="font-bold text-lg">Adicionar Estoque</h3>
                <p className="text-slate-400 text-sm">{produtoSelecionado.nome}</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-2 text-sm">Quantidade</label>
                  <input type="number" min="1" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none" value={produzirForm.quantidade} onChange={(e) => setProduzirForm({ ...produzirForm, quantidade: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-2 text-sm">Validade (dias)</label>
                  <input type="number" min="1" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none" value={produzirForm.validadeDias} onChange={(e) => setProduzirForm({ ...produzirForm, validadeDias: Number(e.target.value) })} />
                  <p className="text-[10px] font-medium text-amber-600 mt-1">Vencerá em: {new Date(calcularValidade(produzirForm.validadeDias)).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="p-4 bg-slate-50 flex gap-3 border-t border-slate-100">
                <button onClick={() => setShowProduzirModal(false)} className="flex-1 py-3 text-slate-600 font-bold rounded-xl">Cancelar</button>
                <button onClick={handleProduzirMais} className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-xl shadow-sm hover:bg-slate-900">Adicionar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
