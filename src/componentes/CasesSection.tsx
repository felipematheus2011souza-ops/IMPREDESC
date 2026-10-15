import { motion } from 'motion/react';
import { Star, Award, TrendingUp, CheckCircle } from 'lucide-react';

export default function CasesSection() {
  const cases = [
    {
      nome: 'Mariana Silva',
      negocio: 'Doces da Mari MEI',
      ramo: 'Confeitaria',
      crescimento: '+180% de Lucro',
      depoimento: 'Antes de usar a calculadora de precificação do EMPREDESC PRO, eu vendia bolos abaixo do custo de insumos. Hoje sei exatamente minha margem e atingi minha meta mensal!',
      foto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80'
    },
    {
      nome: 'Carlos Eduardo',
      negocio: 'CE Costuras e Reformas',
      ramo: 'Artesanato & Costura',
      crescimento: 'Horas Otimizadas',
      depoimento: 'O gerador de orçamentos em PDF com link direto para o WhatsApp facilitou o fechamento de novos clientes. Economizo 2 horas por dia em atendimento.',
      foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'
    },
    {
      nome: 'Fernanda Oliveira',
      negocio: 'Studio Beleza MEI',
      ramo: 'Estética',
      crescimento: 'Metas Batidas',
      depoimento: 'O assistente de IA Llama me dá ideias diárias de textos para postar nas redes sociais. Meu faturamento aumentou expressivamente!',
      foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
    }
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-extrabold text-[10px] uppercase tracking-wider rounded-md border border-indigo-100">
            Histórias de Sucesso
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Cases de Microentreendedores Reais
          </h2>
          <p className="text-slate-500 text-xs font-medium">Veja como o EMPREDESC PRO transformou pequenos negócios pelo Brasil.</p>
        </div>

        <div className="flex items-center gap-1 text-amber-400">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={18} fill="currentColor" />
          ))}
          <span className="text-xs font-bold text-slate-700 ml-1">4.9/5 Avaliação Geral</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cases.map((item, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -4 }}
            className="bg-slate-50/70 border border-slate-200/70 rounded-2xl p-5 space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-md inline-flex items-center gap-1">
                  <TrendingUp size={12} /> {item.crescimento}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{item.ramo}</span>
              </div>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                "{item.depoimento}"
              </p>
            </div>

            <div className="flex items-center gap-3 pt-3 border-t border-slate-200/60">
              <img src={item.foto} alt={item.nome} className="w-10 h-10 rounded-full object-cover border-2 border-indigo-200" />
              <div>
                <p className="font-bold text-xs text-slate-900 leading-tight">{item.nome}</p>
                <p className="text-[10px] text-indigo-600 font-semibold">{item.negocio}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
