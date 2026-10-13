import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, LogOut, Building, User, Phone, FileText, Target } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { usuario, atualizarPerfil, logoutUsuario } = useAppContext();

  const [nome, setNome] = useState('');
  const [nomeNegocio, setNomeNegocio] = useState('');
  const [segmento, setSegmento] = useState('');
  const [cnpjCpf, setCnpjCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [metaFaturamentoMensal, setMetaFaturamentoMensal] = useState(5000);

  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome || '');
      setNomeNegocio(usuario.nomeNegocio || '');
      setSegmento(usuario.segmento || 'Confeitaria & Gastronomia');
      setCnpjCpf(usuario.cnpjCpf || '');
      setTelefone(usuario.telefone || '');
      setMetaFaturamentoMensal(usuario.metaFaturamentoMensal || 5000);
    }
  }, [usuario, isOpen]);

  if (!isOpen || !usuario) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    atualizarPerfil({
      nome,
      nomeNegocio,
      segmento,
      cnpjCpf,
      telefone,
      metaFaturamentoMensal: Number(metaFaturamentoMensal) || 5000
    });
    alert('Perfil atualizado com sucesso!');
    onClose();
  };

  const handleLogout = () => {
    if (window.confirm('Deseja realmente sair da sua conta?')) {
      logoutUsuario();
      onClose();
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
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-xl">
                {usuario.nome ? usuario.nome[0].toUpperCase() : 'M'}
              </div>
              <div>
                <h2 className="text-xl font-bold">{usuario.nomeNegocio}</h2>
                <p className="text-indigo-100 text-xs">{usuario.email}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1 text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Seu Nome</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nome do Negócio</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={nomeNegocio}
                    onChange={e => setNomeNegocio(e.target.value)}
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
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">CNPJ / CPF</label>
                <div className="relative">
                  <input
                    type="text"
                    value={cnpjCpf}
                    onChange={e => setCnpjCpf(e.target.value)}
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
                  className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-700"
                />
                <Target className="absolute left-3 top-3.5 text-slate-400" size={18} />
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 py-3 px-4 rounded-xl border border-rose-200 text-rose-600 font-bold hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut size={18} /> Sair
              </button>
              <button
                type="submit"
                className="flex-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Save size={18} /> Salvar Alterações
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
