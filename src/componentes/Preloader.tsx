import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export default function Preloader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white"
    >
      <motion.div
        animate={{ scale: [0.9, 1.1, 0.9], rotate: [0, 180, 360] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-2xl mb-6 shadow-indigo-500/50"
      >
        <Sparkles size={32} className="text-white" />
      </motion.div>

      <motion.h1
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-black bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent"
      >
        IMPREDESC
      </motion.h1>

      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xs text-indigo-300 font-semibold tracking-widest uppercase mt-2"
      >
        Carregando Recursos e Dados MEI...
      </motion.p>

      {/* Loading Bar */}
      <div className="w-48 h-1.5 bg-indigo-950/80 rounded-full mt-6 overflow-hidden border border-indigo-800/40">
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
        />
      </div>

      <span className="text-[10px] text-slate-500 font-medium absolute bottom-6">
        v2.5.0 - empredesc.com.br
      </span>
    </motion.div>
  );
}
