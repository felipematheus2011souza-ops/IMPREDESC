import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UserPlus, LogIn, Briefcase, Mail, Lock, Building, Target, Phone, FileText } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const { cadastrarUsuario, loginUsuario } = useAppContext();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form states
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // Register specific states
  const [nome, setNome] = useState('');
  const [nomeNegocio, setNomeNegocio] = useState('');
  const [segmento, setSegmento] = useState('Confeitaria & Gastronomia');
  const [cnpjCpf, setCnpjCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [metaFaturamentoMensal, setMetaFaturamentoMensal] = useState(5000);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      if (!email) return alert('Informe seu e-mail.');
      const ok = loginUsuario(email, senha);
      if (ok) onClose();
    } else {
      if (!nome || !email || !nomeNegocio) {
        return alert('Preencha os campos obrigatórios (Nome, E-mail e Nome do Negócio).');
      }
      const ok = cadastrarUsuario({
        nome,
        email,
        nomeNegocio,
        segmento,
        cnpjCpf,
        telefone,
        metaFaturamentoMensal: Number(metaFaturamentoMensal) || 5000
      }, senha);

      if (ok) onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Briefcase size={24} />
              </div>
              <h2 className="text-2xl font-bold">
                {mode === 'login' ? 'Acessar Conta MEI' : 'Conta do Microentreendedor'}
              </h2>
            </div>
            <p className="text-indigo-100 text-sm">
              {mode === 'login'
                ? 'Entre para acessar a gestão financeira do seu negócio.'
                : 'Cadastre sua empresa para salvar precificações e metas.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-sm">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Seu Nome Completo *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={e => setNome(e.target.value)}
                      placeholder="Ex: Maria Silva"
                      className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <Briefcase className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nome da Empresa/Negócio *</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={nomeNegocio}
                        onChange={e => setNomeNegocio(e.target.value)}
                        placeholder="Ex: Doces da Maria MEI"
                        className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <Building className="absolute left-3 top-3.5 text-slate-400" size={18} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ramo / Segmento</label>
                    <select
                      value={segmento}
                      onChange={e => setSegmento(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      <option value="Confeitaria & Gastronomia">Confeitaria & Gastronomia</option>
                      <option value="Artesanato & Costura">Artesanato & Costura</option>
                      <option value="Beleza & Estética">Beleza & Estética</option>
                      <option value="Serviços Técnicos">Serviços Técnicos</option>
                      <option value="Comércio em Geral">Comércio em Geral</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">CNPJ ou CPF</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cnpjCpf}
                        onChange={e => setCnpjCpf(e.target.value)}
                        placeholder="00.000.000/0001-00"
                        className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <FileText className="absolute left-3 top-3.5 text-slate-400" size={18} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">WhatsApp / Telefone</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={telefone}
                        onChange={e => setTelefone(e.target.value)}
                        placeholder="(11) 98765-4321"
                        className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <Phone className="absolute left-3 top-3.5 text-slate-400" size={18} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Meta de Faturamento Mensal (R$)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="500"
                      value={metaFaturamentoMensal}
                      onChange={e => setMetaFaturamentoMensal(Number(e.target.value))}
                      placeholder="5000"
                      className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-700"
                    />
                    <Target className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">E-mail Comercial *</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Senha de Acesso</label>
              <div className="relative">
                <input
                  type="password"
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 text-base mt-4"
            >
              {mode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
              {mode === 'login' ? 'Entrar no Sistema' : 'Criar Minha Conta MEI'}
            </button>
          </form>

          {/* Switch mode footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-xs font-medium text-slate-600">
            {mode === 'login' ? (
              <p>
                Ainda não tem conta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Cadastre seu negócio gratuitamente
                </button>
              </p>
            ) : (
              <p>
                Já possui uma conta?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Faça login aqui
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
