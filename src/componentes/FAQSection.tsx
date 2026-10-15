import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, Clock, ShieldCheck, Headphones } from 'lucide-react';

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      pergunta: "Como a calculadora de precificação garante que não terei prejuízo?",
      resposta: "Nossa fórmula embutida divide seus custos em três pilares: matéria-prima (fracionada grama por grama), mão de obra por hora e custos fixos/taxas de cartão. Assim, a margem de lucro sugerida é livre e real."
    },
    {
      pergunta: "Meus dados de faturamento e clientes ficam salvos em nuvem?",
      resposta: "Por padrão e em respeito à LGPD, seus dados financeiros ficam salvos de forma 100% criptografada no seu próprio dispositivo (LocalStorage). Você tem controle total e pode exportar relatórios em PDF ou CSV."
    },
    {
      pergunta: "O que é o limite de faturamento MEI e como o sistema me alerta?",
      resposta: "O limite oficial do MEI é de R$ 81.000,00 por ano (média de R$ 6.750,00/mês). No Dashboard, o indicador visual mostra seu progresso e envia alertas caso você esteja próximo de atingir a meta."
    },
    {
      pergunta: "Como funciona a geração de orçamentos para enviar no WhatsApp?",
      resposta: "Você seleciona os produtos desejados, digita o nome do cliente e o sistema cria instantaneamente uma mensagem formatada profissionalmente e um documento PDF completo pronto para download e envio."
    },
    {
      pergunta: "A plataforma é gratuita para microentreendedores?",
      resposta: "Sim! A versão EMPREDESC PRO fornece todos os recursos essenciais de precificação, estoque, relatórios e assistente Llama 3 AI sem mensalidades abusivas."
    }
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-extrabold text-[10px] uppercase tracking-wider rounded-md border border-indigo-100">
            Dúvidas Frequentes
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Perguntas Frequentes (FAQ)
          </h2>
          <p className="text-slate-500 text-xs font-medium">Tudo o que você precisa saber sobre o funcionamento do EMPREDESC PRO.</p>
        </div>

        {/* Promessa de Atendimento em até 2 horas úteis */}
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-3.5 rounded-2xl border border-indigo-800/60 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold border border-indigo-500/30">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-xs font-black text-white leading-tight">Promessa de Suporte MEI</p>
            <p className="text-[10px] text-indigo-200 font-bold">Atendimento prioritário em até 2 horas úteis</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="border border-slate-200/80 rounded-2xl overflow-hidden transition-all bg-slate-50/50"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-4 text-left font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle size={16} className="text-indigo-600 shrink-0" />
                  {faq.pergunta}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`}
                />
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-slate-200/60 bg-white p-4 text-xs leading-relaxed text-slate-600"
                  >
                    {faq.resposta}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
