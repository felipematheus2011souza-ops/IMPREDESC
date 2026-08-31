import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calculator, Plus, Save, Info, Image as ImageIcon, Database, ShoppingBag, Clock, Tag, ChevronRight, PackageOpen, HelpCircle, Edit, Trash2 } from 'lucide-react';
import type { Insumo, ReceitaPrecificada, InsumoUsado, ProdutoCadastrado } from '../types';
import { useAppContext } from '../context/AppContext';

export default function Pricing() {
  const { insumos, setInsumos, receitas, setReceitas, configuracoes, produtos, setProdutos } = useAppContext();
  const [activeTab, setActiveTab] = useState<'precificar' | 'insumos' | 'salvos'>('precificar');
  const [showTooltip, setShowTooltip] = useState(true);
  
  // Estado para cadastro/edição de insumo
  const [modoEdicaoInsumo, setModoEdicaoInsumo] = useState<string | null>(null);
  const [novoInsumo, setNovoInsumo] = useState<Partial<Insumo>>({
    nome: '', precoPorPacote: 0, quantidadePacotes: 1, tamanhoPacote: 0, unidadeMedida: 'g'
  });

  // Estado para nova precificação
  const [precificacao, setPrecificacao] = useState({
    nome: '', categoriaMercado: 'Confeitaria', tempoProducaoMinutos: 0,
    valorHoraTrabalho: configuracoes.valorHoraTrabalhoPadrao, 
    custosFixosPercentual: configuracoes.custoFixoPadrao, 
    lucroDesejadoPercentual: configuracoes.lucroDesejadoPadrao,
    impostosPercentual: configuracoes.impostosPadrao, 
    taxaCartaoPercentual: 0,
    outrosCustos: 0,
    metodoPrecificacao: 'margem' as 'margem' | 'markup',
    custoEmbalagem: 0, imagemUrl: '', rendimento: 1
  });
  const [insumosSelecionados, setInsumosSelecionados] = useState<InsumoUsado[]>([]);
  const [insumoDraft, setInsumoDraft] = useState<{insumoId: string, quantidade: number, modoUso: 'total' | 'unitario'}>({ insumoId: '', quantidade: 0, modoUso: 'total' });

  const salvarInsumo = () => {
    if (novoInsumo.nome && novoInsumo.precoPorPacote! > 0 && novoInsumo.quantidadePacotes! > 0 && novoInsumo.tamanhoPacote! > 0) {
      const estoqueTotal = novoInsumo.quantidadePacotes! * novoInsumo.tamanhoPacote!;
      
      if (modoEdicaoInsumo) {
        setInsumos(insumos.map(i => i.id === modoEdicaoInsumo ? { ...i, ...novoInsumo, estoqueTotal } as Insumo : i));
        setModoEdicaoInsumo(null);
      } else {
        setInsumos([...insumos, { ...novoInsumo, estoqueTotal, id: crypto.randomUUID() } as Insumo]);
      }
      setNovoInsumo({ nome: '', precoPorPacote: 0, quantidadePacotes: 1, tamanhoPacote: 0, unidadeMedida: 'g' });
    }
  };

  const iniciarEdicaoInsumo = (insumo: Insumo) => {
    setModoEdicaoInsumo(insumo.id);
    setNovoInsumo({
      nome: insumo.nome,
      precoPorPacote: insumo.precoPorPacote,
      quantidadePacotes: insumo.quantidadePacotes,
      tamanhoPacote: insumo.tamanhoPacote,
      unidadeMedida: insumo.unidadeMedida
    });
  };

  const excluirInsumo = (id: string) => {
    setInsumos(insumos.filter(i => i.id !== id));
  };

  const addInsumoAoProduto = () => {
    if (insumoDraft.insumoId && insumoDraft.quantidade > 0) {
      setInsumosSelecionados([...insumosSelecionados, { insumoId: insumoDraft.insumoId, quantidadeUsada: insumoDraft.quantidade, modoUso: insumoDraft.modoUso }]);
      setInsumoDraft({ insumoId: '', quantidade: 0, modoUso: 'total' });
    }
  };

  const removerInsumoDaReceita = (index: number) => {
    setInsumosSelecionados(insumosSelecionados.filter((_, idx) => idx !== index));
  };

  // Cálculos dinâmicos
  const rendimento = Math.max(1, precificacao.rendimento || 1);
  const custoInsumos = insumosSelecionados.reduce((acc, curr) => {
    const insumoDb = insumos.find(i => i.id === curr.insumoId);
    if (!insumoDb) return acc;
    const custoPorUnidade = insumoDb.precoPorPacote / insumoDb.tamanhoPacote;
    const multiplicador = curr.modoUso === 'unitario' ? rendimento : 1;
    return acc + (custoPorUnidade * curr.quantidadeUsada * multiplicador);
  }, 0);

  const custoMaoDeObra = (precificacao.valorHoraTrabalho / 60) * precificacao.tempoProducaoMinutos;
  const subtotal = custoInsumos + custoMaoDeObra + Number(precificacao.custoEmbalagem) + Number(precificacao.outrosCustos || 0);
  
  const totalPercentuais = Number(precificacao.custosFixosPercentual) + Number(precificacao.impostosPercentual) + Number(precificacao.taxaCartaoPercentual || 0);
  
  let precoSugerido = 0;
  let valorLucro = 0;

  if (precificacao.metodoPrecificacao === 'margem') {
    // Margem: Preço = Custo / (1 - (Custos% + Lucro%))
    const divisor = 1 - ((totalPercentuais + Number(precificacao.lucroDesejadoPercentual)) / 100);
    precoSugerido = divisor > 0 ? subtotal / divisor : 0;
    valorLucro = precoSugerido * (Number(precificacao.lucroDesejadoPercentual) / 100);
  } else {
    // Markup: Preço = Custo * (1 + (Custos% + Lucro%))
    const multiplicador = 1 + ((totalPercentuais + Number(precificacao.lucroDesejadoPercentual)) / 100);
    precoSugerido = subtotal * multiplicador;
    valorLucro = subtotal * (Number(precificacao.lucroDesejadoPercentual) / 100);
  }

  const valorCustosFixos = precoSugerido * (Number(precificacao.custosFixosPercentual) / 100);
  const valorTaxaCartao = precoSugerido * (Number(precificacao.taxaCartaoPercentual || 0) / 100);
  const valorImpostos = precoSugerido * (Number(precificacao.impostosPercentual) / 100);

  const custoTotalUnitario = subtotal / rendimento;
  const precoSugeridoUnitario = precoSugerido / rendimento;
  const lucroUnitario = valorLucro / rendimento;
  
  const pctInsumos = precoSugerido > 0 ? (custoInsumos / precoSugerido) * 100 : 0;
  const pctMaoDeObra = precoSugerido > 0 ? (custoMaoDeObra / precoSugerido) * 100 : 0;
  const pctEmbalagem = precoSugerido > 0 ? (Number(precificacao.custoEmbalagem || 0) / precoSugerido) * 100 : 0;
  const pctOutrosCustos = precoSugerido > 0 ? (Number(precificacao.outrosCustos || 0) / precoSugerido) * 100 : 0;
  const pctFixosEImpostos = precoSugerido > 0 ? ((valorCustosFixos + valorTaxaCartao + valorImpostos) / precoSugerido) * 100 : 0;
  const pctLucro = precoSugerido > 0 ? (valorLucro / precoSugerido) * 100 : 0;
  const markupMultiplier = subtotal > 0 ? precoSugerido / subtotal : 1;

  const salvarProduto = () => {
    if (!precificacao.nome) {
      alert("Por favor, preencha o nome do produto.");
      return;
    }

    // Deduzir do estoque
    const novoEstoque = insumos.map(insumo => {
      const insumoUsado = insumosSelecionados.find(i => i.insumoId === insumo.id);
      if (insumoUsado) {
        const multiplicador = insumoUsado.modoUso === 'unitario' ? rendimento : 1;
        return { ...insumo, estoqueTotal: Math.max(0, insumo.estoqueTotal - (insumoUsado.quantidadeUsada * multiplicador)) };
      }
      return insumo;
    });
    setInsumos(novoEstoque);
    
    const novaReceita: ReceitaPrecificada = {
      ...precificacao,
      id: crypto.randomUUID(),
      insumosUsados: insumosSelecionados,
      custoTotal: subtotal,
      custoTotalUnitario: custoTotalUnitario,
      precoSugerido: precoSugerido,
      precoSugeridoUnitario: precoSugeridoUnitario,
      dataCriacao: new Date().toISOString()
    } as ReceitaPrecificada;

    setReceitas([novaReceita, ...receitas]);

    const novoProduto: ProdutoCadastrado = {
      id: crypto.randomUUID(),
      nome: novaReceita.nome,
      descricao: 'Criado a partir da precificação',
      unidadeMedida: 'un',
      custo: novaReceita.custoTotalUnitario,
      precoVenda: novaReceita.precoSugeridoUnitario,
      estoque: novaReceita.rendimento
    };

    setProdutos([novoProduto, ...produtos]);

    // Resetar formulário
    setPrecificacao({
      nome: '', categoriaMercado: 'Confeitaria', tempoProducaoMinutos: 0,
      valorHoraTrabalho: configuracoes.valorHoraTrabalhoPadrao, 
      custosFixosPercentual: configuracoes.custoFixoPadrao, 
      lucroDesejadoPercentual: configuracoes.lucroDesejadoPadrao,
      impostosPercentual: configuracoes.impostosPadrao, 
      taxaCartaoPercentual: 0,
      outrosCustos: 0,
      metodoPrecificacao: 'margem',
      custoEmbalagem: 0, imagemUrl: '', rendimento: 1
    });
    setInsumosSelecionados([]);
    setActiveTab('salvos');
  };

  const formatarEstoque = (estoqueTotal: number, tamanhoPacote: number, unidade: string) => {
    const pacotesFechados = Math.floor(estoqueTotal / tamanhoPacote);
    const resto = estoqueTotal % tamanhoPacote;
    
    const partes = [];
    if (pacotesFechados > 0) {
      partes.push(`${pacotesFechados} pacote${pacotesFechados > 1 ? 's' : ''} de ${tamanhoPacote}${unidade}`);
    }
    if (resto > 0) {
      partes.push(`1 pacote de ${resto}${unidade} (aberto)`);
    }
    if (partes.length === 0) return 'Sem estoque';
    return partes.join(' e ');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      
      {showTooltip && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 relative flex items-start gap-4">
          <button onClick={() => setShowTooltip(false)} className="absolute top-4 right-4 text-indigo-400 hover:text-indigo-600">
            <Info size={20} />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <HelpCircle size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-indigo-900 mb-1">Como começar a precificar?</h3>
            <p className="text-indigo-700 text-sm leading-relaxed mb-4">Para criar sua primeira precificação corretamente, você precisará cadastrar os ingredientes (insumos) que usa. Siga este passo a passo:</p>
            <ol className="list-decimal list-inside text-sm text-indigo-800 space-y-1">
              <li>Clique na aba <strong>"2. Meu Estoque de Insumos"</strong> e adicione as matérias-primas que você comprou (ex: Farinha, 1kg por R$5,00).</li>
              <li>Volte para a aba <strong>"1. Criar Precificação"</strong>.</li>
              <li>Monte sua receita selecionando os insumos cadastrados e adicionando seu tempo e custos!</li>
            </ol>
          </div>
        </motion.div>
      )}

      {/* Abas Superiores Super Intuitivas */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm max-w-fit mx-auto">
        <button 
          onClick={() => setActiveTab('precificar')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'precificar' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
        >
          <Calculator size={20} />
          <span>1. Criar Precificação</span>
        </button>
        <button 
          onClick={() => setActiveTab('insumos')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'insumos' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
        >
          <Database size={20} />
          <span>2. Meu Estoque de Insumos</span>
        </button>
        <button 
          onClick={() => setActiveTab('salvos')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'salvos' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}
        >
          <ShoppingBag size={20} />
          <span>3. Receitas/Produtos Salvos</span>
        </button>
      </div>

      {activeTab === 'insumos' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          <div className="xl:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm self-start">
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <PackageOpen size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Novo Insumo</h3>
            <p className="text-sm text-slate-500 mb-6">Cadastre as matérias-primas que você usa. O sistema dividirá o valor pelo peso automaticamente.</p>
            
            <div className="space-y-5 text-sm">
              <div>
                <label className="block text-slate-700 font-bold mb-1">O que você comprou?</label>
                <input type="text" value={novoInsumo.nome} onChange={e => setNovoInsumo({...novoInsumo, nome: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Ex: Farinha Arapongas" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Preço por Pacote/Unid. (R$)</label>
                  <input type="number" step="0.01" value={novoInsumo.precoPorPacote || ''} onChange={e => setNovoInsumo({...novoInsumo, precoPorPacote: Number(e.target.value)})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Ex: 5.50" />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Qtd. de Pacotes Comprados</label>
                  <input type="number" value={novoInsumo.quantidadePacotes || ''} onChange={e => setNovoInsumo({...novoInsumo, quantidadePacotes: Number(e.target.value)})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Ex: 14" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Tamanho de 1 Pacote</label>
                  <input type="number" value={novoInsumo.tamanhoPacote || ''} onChange={e => setNovoInsumo({...novoInsumo, tamanhoPacote: Number(e.target.value)})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Ex: 1000" />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Medida</label>
                  <select value={novoInsumo.unidadeMedida} onChange={e => setNovoInsumo({...novoInsumo, unidadeMedida: e.target.value as any})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="g">Gramas (g)</option>
                    <option value="kg">Quilos (kg)</option>
                    <option value="ml">Mililitros (ml)</option>
                    <option value="l">Litros (L)</option>
                    <option value="un">Unidades (un)</option>
                  </select>
                </div>
              </div>
              <button onClick={salvarInsumo} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 mt-4 shadow-sm">
                {modoEdicaoInsumo ? <Save size={20} /> : <Plus size={20} />} 
                {modoEdicaoInsumo ? 'Salvar Alterações' : 'Guardar Insumo no Estoque'}
              </button>
            </div>
          </div>

          <div className="xl:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Seus Insumos Salvos</h3>
                <p className="text-sm text-slate-500">Estes itens podem ser usados em qualquer receita.</p>
              </div>
              <span className="text-sm font-bold text-indigo-700 bg-indigo-100 px-4 py-1.5 rounded-full">{insumos.length} cadastrados</span>
            </div>
            <div className="p-0 overflow-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-bold text-slate-400 uppercase bg-white border-b border-slate-100">
                    <th className="p-5">Nome do Insumo</th>
                    <th className="p-5">Estoque Atual</th>
                    <th className="p-5">Custo por Pacote</th>
                    <th className="p-5">Custo Real (Fracionado)</th>
                    <th className="p-5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {insumos.map(i => (
                    <tr key={i.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="p-5 font-bold text-slate-800">{i.nome}</td>
                      <td className="p-5 text-slate-600">
                        {formatarEstoque(i.estoqueTotal, i.tamanhoPacote, i.unidadeMedida)}
                      </td>
                      <td className="p-5 text-rose-600 font-bold">R$ {i.precoPorPacote.toFixed(2)}</td>
                      <td className="p-5 text-slate-500 font-medium bg-slate-50/30">
                        <span className="text-slate-900">R$ {(i.precoPorPacote / i.tamanhoPacote).toFixed(4)}</span> / {i.unidadeMedida}
                      </td>
                      <td className="p-5 text-right flex items-center justify-end gap-2">
                        <button onClick={() => iniciarEdicaoInsumo(i)} className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 rounded-lg transition-colors">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => excluirInsumo(i.id)} className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {insumos.length === 0 && (
                     <tr><td colSpan={5} className="p-12 text-center text-slate-400">
                       <Database size={48} className="mx-auto mb-4 opacity-20" />
                       <p className="font-semibold text-lg text-slate-500">Seu estoque está vazio.</p>
                       <p>Cadastre os ingredientes ou materiais ao lado.</p>
                     </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'precificar' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Lado Esquerdo: Formulários (Passo a Passo) */}
          <div className="xl:col-span-7 space-y-6">
            
            {/* Passo 1: Info Básica */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative">
              <div className="absolute -left-3 -top-3 w-8 h-8 bg-indigo-600 text-white font-bold rounded-full flex items-center justify-center shadow-md border-4 border-[#f8fafc]">1</div>
              <h3 className="font-bold text-slate-900 text-lg mb-6 flex items-center gap-2"><ShoppingBag size={20} className="text-indigo-500"/> O que você vai vender?</h3>
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="w-24 h-24 bg-slate-50 rounded-2xl flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors shrink-0">
                  <ImageIcon size={28} className="mb-1 text-slate-300" />
                  <span className="text-[10px] font-bold uppercase">Foto</span>
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <input type="text" value={precificacao.nome} onChange={e => setPrecificacao({...precificacao, nome: e.target.value})} className="w-full p-0 bg-transparent border-b-2 border-slate-200 focus:border-indigo-600 outline-none text-2xl font-bold text-slate-900 pb-2 transition-colors placeholder:text-slate-300" placeholder="Nome do Produto (Ex: Bolo de Pote)" />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-slate-500 text-xs font-bold uppercase mb-2">Categoria de Mercado</label>
                      <select value={precificacao.categoriaMercado} onChange={e => setPrecificacao({...precificacao, categoriaMercado: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold text-slate-700">
                        <option value="Confeitaria">Confeitaria & Doces</option>
                        <option value="Artesanato">Artesanato & Costura</option>
                        <option value="Servicos">Serviços Gerais</option>
                        <option value="Outros">Outros</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-slate-500 text-xs font-bold uppercase mb-2">Rendimento (Qtd. Produzida)</label>
                      <input type="number" min="1" value={precificacao.rendimento || 1} onChange={e => setPrecificacao({...precificacao, rendimento: Math.max(1, Number(e.target.value))})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold text-slate-700" placeholder="Ex: 10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Passo 2: Receita / Insumos */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative">
              <div className="absolute -left-3 -top-3 w-8 h-8 bg-indigo-600 text-white font-bold rounded-full flex items-center justify-center shadow-md border-4 border-[#f8fafc]">2</div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><Database size={20} className="text-indigo-500"/> Ingredientes / Materiais Usados</h3>
                {insumos.length === 0 && <span className="text-xs text-rose-500 font-bold bg-rose-50 px-2 py-1 rounded-lg">Cadastre insumos primeiro</span>}
              </div>
              
              <div className="flex flex-col gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-slate-600 text-xs font-bold mb-2">Escolha do seu estoque</label>
                    <select value={insumoDraft.insumoId} onChange={e => setInsumoDraft({...insumoDraft, insumoId: e.target.value})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm">
                      <option value="">Selecione o insumo...</option>
                      {insumos.map(i => <option key={i.id} value={i.id}>{i.nome} (medido em {i.unidadeMedida})</option>)}
                    </select>
                  </div>
                  <div className="w-32">
                    <label className="block text-slate-600 text-xs font-bold mb-2">Quantidade</label>
                    <input type="number" value={insumoDraft.quantidade || ''} onChange={e => setInsumoDraft({...insumoDraft, quantidade: Number(e.target.value)})} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm" placeholder="Ex: 250" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="modoUso" value="total" checked={insumoDraft.modoUso === 'total'} onChange={() => setInsumoDraft({...insumoDraft, modoUso: 'total'})} className="text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-sm font-medium text-slate-700">Na Receita Inteira</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="modoUso" value="unitario" checked={insumoDraft.modoUso === 'unitario'} onChange={() => setInsumoDraft({...insumoDraft, modoUso: 'unitario'})} className="text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-sm font-medium text-slate-700">Em 1 Unidade</span>
                    </label>
                  </div>
                  <button onClick={addInsumoAoProduto} disabled={insumos.length === 0} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2">
                    <Plus size={18} /> Adicionar
                  </button>
                </div>
              </div>

              {insumosSelecionados.length > 0 && (
                <div className="border border-slate-100 rounded-2xl overflow-hidden mt-4 shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                      <tr>
                        <th className="p-4 font-bold text-xs uppercase tracking-wider">Insumo</th>
                        <th className="p-4 font-bold text-xs uppercase tracking-wider">Quantidade</th>
                        <th className="p-4 font-bold text-xs uppercase tracking-wider text-right">Custo na Receita</th>
                        <th className="p-4 font-bold text-xs uppercase tracking-wider text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {insumosSelecionados.map((item, idx) => {
                        const insumo = insumos.find(i => i.id === item.insumoId);
                        if (!insumo) return null;
                        const multiplicador = item.modoUso === 'unitario' ? rendimento : 1;
                        const custo = (insumo.precoPorPacote / insumo.tamanhoPacote) * item.quantidadeUsada * multiplicador;
                        return (
                          <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                            <td className="p-4 text-slate-900 font-bold">{insumo.nome}</td>
                            <td className="p-4 text-slate-600 font-medium bg-slate-50/30">
                              {item.quantidadeUsada} {insumo.unidadeMedida}
                              <span className="block text-[10px] text-slate-400 mt-0.5">{item.modoUso === 'unitario' ? 'por unidade' : 'na receita'}</span>
                            </td>
                            <td className="p-4 text-right text-rose-600 font-bold">R$ {custo.toFixed(2)}</td>
                            <td className="p-4 text-right">
                              <button onClick={() => removerInsumoDaReceita(idx)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Passo 3: Mão de Obra */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative">
              <div className="absolute -left-3 -top-3 w-8 h-8 bg-indigo-600 text-white font-bold rounded-full flex items-center justify-center shadow-md border-4 border-[#f8fafc]">3</div>
              <h3 className="font-bold text-slate-900 text-lg mb-6 flex items-center gap-2"><Clock size={20} className="text-indigo-500"/> Seu Tempo (Mão de Obra)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div>
                  <label className="block text-slate-700 font-bold mb-2">Quanto vale 1 hora sua? (R$)</label>
                  <input type="number" value={precificacao.valorHoraTrabalho || ''} onChange={e => setPrecificacao({...precificacao, valorHoraTrabalho: Number(e.target.value)})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ex: 25.00" />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-2">Minutos gastos fazendo 1 unidade?</label>
                  <input type="number" value={precificacao.tempoProducaoMinutos || ''} onChange={e => setPrecificacao({...precificacao, tempoProducaoMinutos: Number(e.target.value)})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ex: 45" />
                </div>
              </div>
            </div>

            {/* Passo 4: Margens e Outros */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative">
              <div className="absolute -left-3 -top-3 w-8 h-8 bg-indigo-600 text-white font-bold rounded-full flex items-center justify-center shadow-md border-4 border-[#f8fafc]">4</div>
              <h3 className="font-bold text-slate-900 text-lg mb-6 flex items-center gap-2"><Tag size={20} className="text-indigo-500"/> Custos Extras, Taxas e Margem</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm mb-6 pb-6 border-b border-slate-100">
                <div>
                  <label className="block text-slate-700 font-bold mb-2">Método de Precificação</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button 
                      onClick={() => setPrecificacao({...precificacao, metodoPrecificacao: 'margem'})}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${precificacao.metodoPrecificacao === 'margem' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Margem (Recomendado)
                    </button>
                    <button 
                      onClick={() => setPrecificacao({...precificacao, metodoPrecificacao: 'markup'})}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${precificacao.metodoPrecificacao === 'markup' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Markup (Sobre o Custo)
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                    {precificacao.metodoPrecificacao === 'margem' 
                      ? 'O lucro será uma porcentagem do preço final de venda. (Cálculo mais seguro para garantir a margem real).' 
                      : 'O lucro é calculado diretamente sobre o custo, multiplicando-o. (Forma tradicional de precificar).'}
                  </p>
                </div>
                <div>
                  <label className="block text-indigo-900 font-bold mb-2">Lucro Desejado (%)</label>
                  <input type="number" value={precificacao.lucroDesejadoPercentual || ''} onChange={e => setPrecificacao({...precificacao, lucroDesejadoPercentual: Number(e.target.value)})} className="w-full p-3 bg-indigo-50 border border-indigo-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-indigo-700 font-bold text-lg" placeholder="Ex: 30" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <label className="block text-slate-700 font-bold mb-2">Embalagem (R$)</label>
                  <input type="number" value={precificacao.custoEmbalagem || ''} onChange={e => setPrecificacao({...precificacao, custoEmbalagem: Number(e.target.value)})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ex: 2.50" />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-2">Outros (R$)</label>
                  <input type="number" value={precificacao.outrosCustos || ''} onChange={e => setPrecificacao({...precificacao, outrosCustos: Number(e.target.value)})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Frete, tags..." />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-2">Fixos/Água (%)</label>
                  <input type="number" value={precificacao.custosFixosPercentual || ''} onChange={e => setPrecificacao({...precificacao, custosFixosPercentual: Number(e.target.value)})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ex: 10" />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-2">Taxa Cartão (%)</label>
                  <input type="number" value={precificacao.taxaCartaoPercentual || ''} onChange={e => setPrecificacao({...precificacao, taxaCartaoPercentual: Number(e.target.value)})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Maquininha/App" />
                </div>
              </div>
            </div>

          </div>

          {/* Lado Direito: Recibo / Resultado */}
          <div className="xl:col-span-5 relative">
            <div className="bg-slate-900 rounded-[2rem] p-6 shadow-2xl text-white sticky top-6 border border-slate-800">
              <div className="text-center mb-8">
                <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Demonstrativo de Preço</h3>
                <h2 className="text-2xl font-bold text-white">{precificacao.nome || 'Produto Sem Nome'}</h2>
              </div>
              
              <div className="space-y-4 text-sm bg-slate-800/50 p-6 rounded-2xl mb-8 border border-slate-700/50">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Custo de Materiais</span>
                  <span className="font-bold text-slate-200">R$ {custoInsumos.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Sua Mão de Obra</span>
                  <span className="font-bold text-slate-200">R$ {custoMaoDeObra.toFixed(2)}</span>
                </div>
                {Number(precificacao.custoEmbalagem || 0) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Embalagens Extra</span>
                    <span className="font-bold text-slate-200">R$ {Number(precificacao.custoEmbalagem || 0).toFixed(2)}</span>
                  </div>
                )}
                {Number(precificacao.outrosCustos || 0) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 font-medium">Outros Custos</span>
                    <span className="font-bold text-slate-200">R$ {Number(precificacao.outrosCustos || 0).toFixed(2)}</span>
                  </div>
                )}
                
                <div className="h-px bg-slate-700 my-4"></div>
                
                <div className="flex justify-between items-center">
                  <span className="text-indigo-300 font-bold text-base">Custo da Receita (Subtotal)</span>
                  <span className="font-bold text-white text-base">R$ {subtotal.toFixed(2)}</span>
                </div>
                
                {rendimento > 1 && (
                  <div className="flex justify-between items-center mt-2 bg-indigo-900/30 p-2 -mx-2 rounded-lg border border-indigo-800/30">
                    <span className="text-indigo-300 font-bold">Custo por Unidade</span>
                    <span className="font-bold text-indigo-300">R$ {custoTotalUnitario.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-4 text-xs">
                  <span className="text-slate-400 font-medium">Fixos ({precificacao.custosFixosPercentual}%) e Cartão ({precificacao.taxaCartaoPercentual || 0}%)</span>
                  <span className="font-medium text-slate-300">Embutido</span>
                </div>
                <div className="flex justify-between items-center mt-2 bg-emerald-900/30 p-2 -mx-2 rounded-lg border border-emerald-800/30">
                  <span className="text-emerald-400 font-bold">Lucro Livre ({precificacao.lucroDesejadoPercentual}%)</span>
                  <span className="font-bold text-emerald-400">R$ {valorLucro.toFixed(2)} {rendimento > 1 ? `(Total)` : ''}</span>
                </div>
                
                {rendimento > 1 && (
                  <div className="flex justify-between items-center bg-emerald-900/10 p-2 -mx-2 rounded-lg">
                    <span className="text-emerald-400/80 font-bold">Lucro por Unidade</span>
                    <span className="font-bold text-emerald-400/80">R$ {lucroUnitario.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Breakdown Progress Bar */}
              {precoSugerido > 0 && (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Composição do Preço</span>
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-900/30 px-2 py-0.5 rounded-md">Markup: {markupMultiplier.toFixed(2)}x</span>
                  </div>
                  <div className="flex h-3 rounded-full overflow-hidden bg-slate-800">
                    {pctInsumos > 0 && <div style={{ width: `${pctInsumos}%` }} className="bg-sky-500" title={`Insumos: ${pctInsumos.toFixed(1)}%`}></div>}
                    {pctMaoDeObra > 0 && <div style={{ width: `${pctMaoDeObra}%` }} className="bg-blue-500" title={`Mão de Obra: ${pctMaoDeObra.toFixed(1)}%`}></div>}
                    {pctEmbalagem > 0 && <div style={{ width: `${pctEmbalagem}%` }} className="bg-slate-400" title={`Embalagem: ${pctEmbalagem.toFixed(1)}%`}></div>}
                    {pctOutrosCustos > 0 && <div style={{ width: `${pctOutrosCustos}%` }} className="bg-purple-500" title={`Outros Custos: ${pctOutrosCustos.toFixed(1)}%`}></div>}
                    {pctFixosEImpostos > 0 && <div style={{ width: `${pctFixosEImpostos}%` }} className="bg-rose-500" title={`Taxas e Fixos: ${pctFixosEImpostos.toFixed(1)}%`}></div>}
                    {pctLucro > 0 && <div style={{ width: `${pctLucro}%` }} className="bg-emerald-500" title={`Lucro Livre: ${pctLucro.toFixed(1)}%`}></div>}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[10px] font-bold text-slate-400">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-sky-500"></div> Insumos ({pctInsumos.toFixed(0)}%)</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Mão de Obra ({pctMaoDeObra.toFixed(0)}%)</div>
                    {pctEmbalagem > 0 && <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-400"></div> Embalagem ({pctEmbalagem.toFixed(0)}%)</div>}
                    {pctOutrosCustos > 0 && <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500"></div> Outros ({pctOutrosCustos.toFixed(0)}%)</div>}
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Taxas/Fixos ({pctFixosEImpostos.toFixed(0)}%)</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Lucro ({pctLucro.toFixed(0)}%)</div>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl p-6 text-center mb-8 relative overflow-hidden shadow-inner border border-indigo-400/30">
                <div className="relative z-10">
                  <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-2">Preço Sugerido {rendimento > 1 ? 'p/ Unidade' : 'p/ Venda'}</p>
                  <p className="text-5xl font-black tracking-tight">R$ {precoSugeridoUnitario.toFixed(2)}</p>
                  
                  {rendimento > 1 && (
                    <p className="text-indigo-200 text-xs font-medium mt-3 bg-indigo-900/30 py-1.5 px-3 rounded-full inline-block">
                      Preço do Lote Inteiro: R$ {precoSugerido.toFixed(2)}
                    </p>
                  )}
                </div>
                {/* Decorative circles */}
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full opacity-10"></div>
                <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-black rounded-full opacity-10"></div>
              </div>

              <button onClick={salvarProduto} className="w-full py-4 bg-emerald-500 text-white rounded-xl font-black text-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/50 hover:shadow-emerald-900/80 hover:-translate-y-1">
                <Save size={24} /> Salvar Produto e Deduzir Estoque
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'salvos' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Receitas & Produtos Salvos</h3>
              <p className="text-sm text-slate-500">Histórico de precificações concluídas.</p>
            </div>
            <span className="text-sm font-bold text-indigo-700 bg-indigo-100 px-4 py-1.5 rounded-full">{receitas.length} Produtos</span>
          </div>
          <div className="p-0 overflow-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-bold text-slate-400 uppercase bg-white border-b border-slate-100">
                  <th className="p-5">Nome do Produto</th>
                  <th className="p-5">Data</th>
                  <th className="p-5 text-center">Rendimento</th>
                  <th className="p-5">Custo Unitário</th>
                  <th className="p-5">Preço Venda Unitário</th>
                  <th className="p-5">Custo Total (Lote)</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {receitas.map(r => (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-5 font-bold text-slate-800">{r.nome}</td>
                    <td className="p-5 text-slate-500">{new Date(r.dataCriacao).toLocaleDateString()}</td>
                    <td className="p-5 text-slate-600 text-center font-bold">{r.rendimento}</td>
                    <td className="p-5 text-slate-600 font-medium">R$ {r.custoTotalUnitario.toFixed(2)}</td>
                    <td className="p-5 text-emerald-600 font-bold bg-emerald-50/30">R$ {r.precoSugeridoUnitario.toFixed(2)}</td>
                    <td className="p-5 text-slate-400">R$ {r.custoTotal.toFixed(2)}</td>
                  </tr>
                ))}
                {receitas.length === 0 && (
                   <tr><td colSpan={6} className="p-12 text-center text-slate-400">
                     <ShoppingBag size={48} className="mx-auto mb-4 opacity-20" />
                     <p className="font-semibold text-lg text-slate-500">Nenhum produto salvo.</p>
                     <p>Precifique seus produtos e eles aparecerão aqui.</p>
                   </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
