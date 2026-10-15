import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, X, ExternalLink, Sparkles, Send } from 'lucide-react';

interface ThankYouModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  customLink?: { label: string; url: string };
}

export default function ThankYouModal({
  isOpen,
  onClose,
  title = "Obrigado pelo seu registro!",
  message = "Sua ação foi processada com sucesso no sistema EMPREDESC PRO.",
  customLink
}: ThankYouModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 text-center space-y-4 relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl"
          >
            <X size={18} />
          </button>

          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 size={36} />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">{message}</p>
          </div>

          {customLink && (
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl">
              <p className="text-[10px] font-extrabold text-indigo-700 uppercase mb-1">Seu Link Personalizado</p>
              <a
                href={customLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
              >
                {customLink.label} <ExternalLink size={12} />
              </a>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-3 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
            >
              Continuar Trabalhando
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
