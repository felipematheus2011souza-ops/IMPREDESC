import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, FileText, Palette, Info, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { usuario } = useAppContext();
  const [activeTab, setActiveTab] = useState<'diretrizes' | 'isencao' | 'aparencia'>('diretrizes');
  const [tema, setTema] = useState<'claro' | 'escuro' | 'sistema'>('claro');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                <Shield size={24} className="text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Configurações & Diretrizes</h2>
                <p className="text-indigo-200 text-xs">Termos da plataforma, privacidade e personalização.</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 pt-2">
            <button
              onClick={() => setActiveTab('diretrizes')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'diretrizes'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Shield size={16} /> Diretrizes & Dados
            </button>
            <button
              onClick={() => setActiveTab('isencao')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'isencao'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText size={16} /> Isenção de Responsabilidade
            </button>
            <button
              onClick={() => setActiveTab('aparencia')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'aparencia'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Palette size={16} /> Personalização
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1 text-sm leading-relaxed text-slate-600">
            {activeTab === 'diretrizes' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-base">Diretrizes de Coleta e Uso de Dados</h3>
                <p>
                  A plataforma <strong>IMPREDESC</strong> respeita integralmente a privacidade dos microentreendedores (MEI) e segue as diretrizes da Lei Geral de Proteção de Dados (LGPD).
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                  <p className="font-bold text-slate-800">🔒 Armazenamento Seguro e Local:</p>
                  <p>
                    Seus dados financeiros, preços de insumos, listas de produtos e orçamentos são armazenados de forma criptografada localmente no seu dispositivo através do LocalStorage do seu navegador.
                  </p>
                  <p className="font-bold text-slate-800 pt-2">🛡️ Não Compartilhamento:</p>
                  <p>
                    Nenhuma informação referente aos seus lucros ou custos operacionais é vendida ou transferida para terceiros sem o seu consentimento prévio.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'isencao' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-base">Isenção e Regras da Plataforma</h3>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-800">
                    <Info size={16} /> Isenção de Responsabilidade Financeira
                  </div>
                  <p>
                    A plataforma IMPREDESC oferece calculadoras automatizadas e estimativas inteligentes baseadas nas fórmulas de Margem e Markup configuradas pelo usuário.
                  </p>
                  <p>
                    A IMPREDESC não se responsabiliza por eventuais variações de mercado, erros na digitação de dados pelo usuário, inadimplência de clientes ou obrigações tributárias e fiscais do microentreendedor.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'aparencia' && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-base">Personalização do Sistema</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Tema da Interface</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['claro', 'escuro', 'sistema'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTema(t)}
                        className={`p-3 rounded-xl border text-xs font-bold capitalize flex items-center justify-between transition-all ${
                          tema === t
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {t} {tema === t && <Check size={14} className="text-indigo-600" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs font-bold text-slate-700 uppercase mb-1">Identificação da Sua Empresa no Topo</p>
                  <p className="text-xs text-slate-500">
                    Empresa Atual: <strong>{usuario?.nomeNegocio || 'Nenhuma empresa cadastrada'}</strong>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer with Rights and Version */}
          <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between text-xs gap-2 border-t border-slate-800">
            <div className="text-slate-400 font-medium">
              Todos os direitos reservados a <a href="https://empredesc.com.br" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline font-bold">empredesc.com.br</a>
            </div>
            <div className="px-3 py-1 bg-white/10 rounded-full font-bold text-indigo-300 text-[11px]">
              Versão 2.5.0 MEI
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
