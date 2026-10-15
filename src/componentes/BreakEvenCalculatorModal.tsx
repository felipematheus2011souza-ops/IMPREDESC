import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Target, Calculator, TrendingUp, DollarSign, ArrowRight } from 'lucide-react';

interface BreakEvenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BreakEvenCalculatorModal({ isOpen, onClose }: BreakEvenModalProps) {
  const [custosFixosMensais, setCustosFixosMensais] = useState(2000);
  const [precoMedioVenda, setPrecoMedioVenda] = useState(50);
  const [custoVariavelMedio, setCustoVariavelMedio] = useState(20);
  const [metaLucroDesejado, setMetaLucroDesejado] = useState(3000);

  if (!isOpen) return null;

  // Calculations
  const margemContribuicaoUnitarias = Math.max(0.01, precoMedioVenda - custoVariavelMedio);
  const unidadesPontoEquilibrio = Math.ceil(custosFixosMensais / margemContribuicaoUnitarias);
  const faturamentoPontoEquilibrio = unidadesPontoEquilibrio * precoMedioVenda;

  const unidadesParaMeta = Math.ceil((custosFixosMensais + metaLucroDesejado) / margemContribuicaoUnitarias);
  const faturamentoParaMeta = unidadesParaMeta * precoMedioVenda;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="liquid-glass-dark text-white p-6 relative border-b border-white/10">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center font-bold">
                <Target size={24} />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 font-extrabold text-[9px] uppercase border border-indigo-400/40">
                  Simulador de Metas MEI
                </span>
                <h2 className="text-xl font-black text-white leading-tight">Ponto de Equilíbrio & Lucro</h2>
              </div>
            </div>
          </div>

          {/* Form and Calculations */}
          <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">Custos Fixos Mensais (R$)</label>
                <input
                  type="number"
                  value={custosFixosMensais}
                  onChange={e => setCustosFixosMensais(Number(e.target.value))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-900"
                  placeholder="Ex: 2000"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">Preço Médio de Venda (R$)</label>
                <input
                  type="number"
                  value={precoMedioVenda}
                  onChange={e => setPrecoMedioVenda(Number(e.target.value))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-900"
                  placeholder="Ex: 50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">Custo Variável Unitário (R$)</label>
                <input
                  type="number"
                  value={custoVariavelMedio}
                  onChange={e => setCustoVariavelMedio(Number(e.target.value))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-900"
                  placeholder="Ex: 20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">Meta de Lucro Livre (R$)</label>
                <input
                  type="number"
                  value={metaLucroDesejado}
                  onChange={e => setMetaLucroDesejado(Number(e.target.value))}
                  className="w-full p-3 bg-indigo-50 border border-indigo-200 rounded-xl outline-none font-bold text-indigo-700"
                  placeholder="Ex: 3000"
                />
              </div>
            </div>

            {/* Results Display Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
                <p className="font-extrabold text-slate-500 uppercase text-[10px]">Ponto de Equilíbrio (Zero a Zero)</p>
                <p className="text-2xl font-black text-slate-900">{unidadesPontoEquilibrio} unidades</p>
                <p className="text-[11px] text-slate-500 font-semibold">Faturamento Mínimo: R$ {faturamentoPontoEquilibrio.toFixed(2)}</p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-1">
                <p className="font-extrabold text-emerald-800 uppercase text-[10px]">Vendas p/ Meta de R$ {metaLucroDesejado}</p>
                <p className="text-2xl font-black text-emerald-700">{unidadesParaMeta} unidades</p>
                <p className="text-[11px] text-emerald-800 font-semibold">Faturamento Alvo: R$ {faturamentoParaMeta.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 transition-colors"
            >
              Entendido
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
