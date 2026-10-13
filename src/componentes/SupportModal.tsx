import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, LifeBuoy, CheckCircle, MessageSquare } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const { usuario } = useAppContext();

  const [categoria, setCategoria] = useState('Dúvida de Uso / Precificação');
  const [mensagem, setMensagem] = useState('');
  const [quandoOcorreu, setQuandoOcorreu] = useState('Hoje');
  const [enviado, setEnviado] = useState(false);

  if (!isOpen) return null;

  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensagem) return alert('Por favor, descreva sua dúvida ou problema.');

    const emailDestino = 'felipematheus2011souza@gmail.com';
    const assunto = encodeURIComponent(`[Suporte IMPREDESC] ${categoria} - ${usuario?.nomeNegocio || usuario?.nome || 'Usuário'}`);

    let corpo = `SUPORTE IMPREDESC - REGISTRO DE CHAMADO\n\n`;
    corpo += `Empresa/Usuário: ${usuario?.nomeNegocio || 'N/A'} (${usuario?.nome || 'Anônimo'})\n`;
    corpo += `E-mail de Contato: ${usuario?.email || 'Não informado'}\n`;
    corpo += `Segmento: ${usuario?.segmento || 'MEI'}\n`;
    corpo += `Categoria do Problema: ${categoria}\n`;
    corpo += `Quando ocorreu: ${quandoOcorreu}\n\n`;
    corpo += `Descrição do Problema / Reclamação:\n${mensagem}\n\n`;
    corpo += `---\nEnviado via Plataforma IMPREDESC (empredesc.com.br)`;

    const mailtoUrl = `mailto:${emailDestino}?subject=${assunto}&body=${encodeURIComponent(corpo)}`;

    window.location.href = mailtoUrl;
    setEnviado(true);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <LifeBuoy size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Suporte & Atendimento MEI</h2>
                <p className="text-indigo-100 text-xs">Fale diretamente com nossa equipe técnica.</p>
              </div>
            </div>
          </div>

          {enviado ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={36} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Solicitação Redirecionada!</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Abrimos seu aplicativo de e-mail com os dados preenchidos para <strong>felipematheus2011souza@gmail.com</strong>.
              </p>
              <button
                onClick={() => { setEnviado(false); setMensagem(''); onClose(); }}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md"
              >
                Concluir
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendSupport} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Empresa / Usuário Solicitante</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800">
                  {usuario?.nomeNegocio || 'Visitante'} ({usuario?.email || 'Sem e-mail'})
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Categoria do Problema</label>
                  <select
                    value={categoria}
                    onChange={e => setCategoria(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold"
                  >
                    <option value="Dúvida de Uso / Precificação">Dúvida de Uso / Precificação</option>
                    <option value="Erro ou Travamento no Sistema">Erro ou Travamento no Sistema</option>
                    <option value="Sugestão de Novo Recurso">Sugestão de Novo Recurso</option>
                    <option value="Problema na Conta ou Dados">Problema na Conta ou Dados</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Quando ocorreu?</label>
                  <select
                    value={quandoOcorreu}
                    onChange={e => setQuandoOcorreu(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold"
                  >
                    <option value="Hoje">Hoje</option>
                    <option value="Nos últimos dias">Nos últimos dias</option>
                    <option value="Sempre acontece">Sempre acontece</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Descreva o que aconteceu / Sua reclamação *</label>
                <textarea
                  required
                  rows={4}
                  value={mensagem}
                  onChange={e => setMensagem(e.target.value)}
                  placeholder="Conte em detalhes qual erro você encontrou ou em qual funcionalidade precisa de suporte..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-3 flex items-start gap-3 text-xs text-indigo-900">
                <MessageSquare size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  Sua mensagem será enviada para <strong>felipematheus2011souza@gmail.com</strong> com os detalhes da sua conta MEI para agilizar o suporte.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Send size={18} /> Enviar Mensagem para o Suporte
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
