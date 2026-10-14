import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Bot, X, Send, Lightbulb, TrendingUp, RefreshCw, Copy, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { GoogleGenAI } from '@google/genai';

export default function GoogleStitchAiAdvisor() {
  const { usuario, vendas, despesas, produtos } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const totalVendas = vendas.reduce((acc, v) => acc + (v.valorVenda * v.quantidade), 0);
  const totalDespesas = despesas.reduce((acc, d) => acc + d.valor, 0);
  const lucroEstimado = totalVendas - totalDespesas;

  const handleAskAI = async (promptCustom?: string) => {
    const question = promptCustom || userQuery;
    if (!question.trim()) return;

    setLoading(true);
    setAiResponse(null);

    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';

      if (!apiKey) {
        // Fallback intelligent diagnostic if API key is not configured locally
        setTimeout(() => {
          setAiResponse(`🤖 **Análise Inteligente Google Stitch MEI:**
- **Faturamento Atual:** R$ ${totalVendas.toFixed(2)}
- **Lucro Líquido:** R$ ${lucroEstimado.toFixed(2)}
- **Diagnóstico:** ${lucroEstimado > 0 ? 'Seu negócio está lucrativo! Excelente margem de operação.' : 'Atenção para suas despesas fixas. Considere reajustar margens na aba Precificação.'}
- **Recomendação:** Cadastre mais produtos e divulgue combos no WhatsApp com margem de 35% a 45%.`);
          setLoading(false);
        }, 800);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const contextPrompt = `Você é o assistente inteligente de negócios Google Stitch da plataforma EMPREDESC MEI.
Perfil do MEI: ${usuario?.nomeNegocio || 'Microempresa'} (Segmento: ${usuario?.segmento || 'Geral'})
Faturamento acumulado: R$ ${totalVendas.toFixed(2)}
Despesas totais: R$ ${totalDespesas.toFixed(2)}
Lucro líquido estimado: R$ ${lucroEstimado.toFixed(2)}
Produtos no catálogo: ${produtos.length}

A pergunta do usuário é: "${question}".
Responda em português de forma clara, motivadora e focada na prática de negócios para microempreendedores. Use formatação markdown e tópicos.`;

      const result = await model.generateContent(contextPrompt);
      const text = result.response.text();
      setAiResponse(text || 'Não foi possível gerar a sugestão. Tente novamente.');
    } catch (err) {
      console.error('Erro ao conectar com Google Stitch AI:', err);
      setAiResponse(`🤖 **Diagnóstico Automático Stitch MEI:**
Sua margem atual está operando com R$ ${lucroEstimado.toFixed(2)} de saldo livre. Dica rápida: Aumente o ticket médio oferecendo embalagens presenteáveis.`);
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = () => {
    if (!aiResponse) return;
    navigator.clipboard.writeText(aiResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Floating Launcher Trigger */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600 text-white p-3.5 pr-4 rounded-full shadow-2xl shadow-indigo-600/40 border border-indigo-400/30 flex items-center gap-2.5 cursor-pointer select-none group"
        title="Assistente Google Stitch AI"
      >
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm">
          <Bot size={20} className="text-amber-300 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
          </span>
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs font-black leading-none">Stitch AI</p>
          <p className="text-[9px] text-indigo-200 font-bold uppercase tracking-wider mt-0.5">Consultor MEI</p>
        </div>
      </motion.button>

      {/* Drawer Assistant Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-0 sm:p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md border border-slate-100 overflow-hidden flex flex-col h-[85vh] sm:h-[620px]"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 relative flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5 shadow-md">
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                      <Sparkles size={18} className="text-amber-300" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-base font-black text-white">Google Stitch AI</h2>
                      <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-extrabold text-[9px] uppercase border border-indigo-500/30">
                        Inteligente
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] font-semibold">Consultoria e estratégias de vendas para MEI</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Chat Body */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs leading-relaxed bg-slate-50/50">
                {/* Default Welcome */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
                  <p className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                    <Lightbulb size={16} className="text-amber-500" /> Olá, {usuario?.nome || 'Empreendedor'}!
                  </p>
                  <p className="text-slate-600">
                    Sou seu assistente de inteligência de negócios. Como posso ajudar seu negócio <strong>{usuario?.nomeNegocio || 'MEI'}</strong> hoje?
                  </p>

                  <div className="pt-2 flex flex-col gap-1.5">
                    <button
                      onClick={() => handleAskAI('Faça um diagnóstico rápido do meu faturamento e margem de lucro.')}
                      className="w-full p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold text-left transition-colors flex items-center justify-between"
                    >
                      <span>📊 Diagnóstico do meu negócio</span>
                      <TrendingUp size={14} className="text-indigo-600" />
                    </button>
                    <button
                      onClick={() => handleAskAI('Crie um texto persuasivo para eu postar no Instagram e WhatsApp divulgando meus produtos.')}
                      className="w-full p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-bold text-left transition-colors flex items-center justify-between"
                    >
                      <span>📲 Copy de vendas p/ Instagram e Whats</span>
                      <Sparkles size={14} className="text-purple-600" />
                    </button>
                  </div>
                </div>

                {/* AI Response Output */}
                {loading && (
                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center gap-3 text-indigo-900 font-bold">
                    <RefreshCw size={18} className="animate-spin text-indigo-600 shrink-0" />
                    <span>Processando estratégia no Google Stitch AI...</span>
                  </div>
                )}

                {aiResponse && (
                  <div className="p-4 rounded-2xl bg-white border border-indigo-200/80 shadow-xs space-y-3 relative group">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="font-extrabold text-indigo-600 uppercase tracking-wider text-[10px] flex items-center gap-1">
                        <Sparkles size={12} /> Resposta Gerada
                      </span>
                      <button
                        onClick={copyResponse}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors flex items-center gap-1 font-bold text-[10px]"
                      >
                        {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        {copied ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                    <div className="whitespace-pre-wrap text-slate-800 font-medium leading-relaxed">
                      {aiResponse}
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white border-t border-slate-200/80 flex items-center gap-2">
                <input
                  type="text"
                  value={userQuery}
                  onChange={e => setUserQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAskAI()}
                  placeholder="Pergunte sobre precificação, metas ou vendas..."
                  className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => handleAskAI()}
                  disabled={loading || !userQuery.trim()}
                  className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold hover:shadow-md transition-all disabled:opacity-50 shrink-0"
                >
                  <Send size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
