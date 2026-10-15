import { motion } from 'motion/react';
import { Home, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function NotFound({ onGoHome }: { onGoHome: () => void }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl space-y-5"
      >
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100 font-bold">
          <AlertCircle size={32} />
        </div>

        <div className="space-y-1">
          <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 font-black text-[10px] uppercase tracking-wider rounded-md">
            Erro 404
          </span>
          <h1 className="text-2xl font-black text-slate-900">Página Não Encontrada</h1>
          <p className="text-xs text-slate-500 font-medium">
            A rota ou recurso que você tentou acessar não existe ou foi movido.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={onGoHome}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-xs hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Home size={16} /> Voltar para o Dashboard Principal
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} /> Recarregar Aplicação
          </button>
        </div>
      </motion.div>
    </div>
  );
}
