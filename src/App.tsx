import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useAppContext } from './context/AppContext';
import Pricing from './componentes/Pricing';
import Dashboard from './componentes/Dashboard';
import Expenses from './componentes/Expenses';
import Products from './componentes/Products';
import Reports from './componentes/Reports';
import AuthModal from './componentes/AuthModal';
import ProfileModal from './componentes/ProfileModal';
import SettingsModal from './componentes/SettingsModal';
import SupportModal from './componentes/SupportModal';
import Preloader from './componentes/Preloader';
import {
  LayoutDashboard,
  Calculator,
  Receipt,
  Package,
  FileText,
  Menu,
  X,
  Sparkles,
  User,
  LogIn,
  Building,
  Bell,
  Settings,
  LifeBuoy,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

function AppContent() {
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'dashboard' | 'precificacao' | 'despesas' | 'produtos' | 'relatorios'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  // Auto-save toast feedback
  const [autoSaveNotice, setAutoSaveNotice] = useState<string | null>(null);

  const { usuario, produtos, insumos } = useAppContext();

  // Initial Preloader simulation to prevent UI lag on startup
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  // Low stock calculation for notification bell
  const produtosEsgotados = produtos.filter(p => p.estoque === 0);
  const produtosPoucoEstoque = produtos.filter(p => p.estoque > 0 && p.estoque <= 3);
  const insumosBaixos = insumos.filter(i => i.estoqueTotal < i.tamanhoPacote * 0.2);

  const totalNotificacoes = produtosEsgotados.length + produtosPoucoEstoque.length + insumosBaixos.length;

  const triggerAutoSaveFeedback = (msg = 'Dados salvos automaticamente!') => {
    setAutoSaveNotice(msg);
    setTimeout(() => setAutoSaveNotice(null), 2500);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'from-blue-500 to-cyan-500' },
    { id: 'precificacao', label: 'Precificação', icon: Calculator, color: 'from-purple-500 to-pink-500' },
    { id: 'produtos', label: 'Estoque & Produtos', icon: Package, color: 'from-green-500 to-emerald-500' },
    { id: 'despesas', label: 'Despesas', icon: Receipt, color: 'from-orange-500 to-red-500' },
    { id: 'relatorios', label: 'Relatórios MEI', icon: FileText, color: 'from-indigo-500 to-purple-500' },
  ];

  if (loading) {
    return <Preloader />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased flex flex-col justify-between selection:bg-indigo-600 selection:text-white">
      <div>
        {/* Sleek Modern Header */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">

              {/* Company Logo & Brand */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => setActiveView('dashboard')}
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm group-hover:bg-indigo-700 transition-colors">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h1 className="text-base font-extrabold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                    {usuario?.nomeNegocio ? usuario.nomeNegocio : 'EMPREDESC'}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    <Building size={10} className="text-indigo-500" /> Gestão Inteligente MEI
                  </span>
                </div>
              </motion.div>
              
              {/* Desktop Menu Navigation Bar */}
              <nav className="hidden lg:flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/70">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setActiveView(item.id as any); triggerAutoSaveFeedback(); }}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                      }`}
                    >
                      <Icon size={15} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Header Right Actions */}
              <div className="hidden md:flex items-center gap-2">
                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2 rounded-xl bg-slate-100/80 border border-slate-200/80 hover:bg-slate-200/70 text-slate-600 transition-colors relative shadow-2xs"
                    title="Avisos de Estoque"
                  >
                    <Bell size={18} />
                    {totalNotificacoes > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                        {totalNotificacoes}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  <AnimatePresence>
                    {notificationsOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 8 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-4 z-50 text-xs space-y-3"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Alertas de Estoque ({totalNotificacoes})</span>
                          <button onClick={() => setNotificationsOpen(false)} className="text-slate-400 hover:text-slate-600">
                            <X size={14} />
                          </button>
                        </div>

                        <div className="max-h-60 overflow-y-auto space-y-2">
                          {totalNotificacoes === 0 ? (
                            <div className="p-4 text-center text-slate-400 font-medium">
                              Nenhum alerta de estoque pendente! 🎉
                            </div>
                          ) : (
                            <>
                              {produtosEsgotados.map(p => (
                                <div key={p.id} className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-2 text-rose-900">
                                  <AlertTriangle size={15} className="text-rose-600 shrink-0 mt-0.5" />
                                  <div>
                                    <p className="font-bold text-xs">{p.nome} esgotado</p>
                                    <p className="text-[10px] text-rose-700">Reponha no estoque para continuar vendendo.</p>
                                  </div>
                                </div>
                              ))}

                              {produtosPoucoEstoque.map(p => (
                                <div key={p.id} className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-2 text-amber-900">
                                  <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                                  <div>
                                    <p className="font-bold text-xs">{p.nome} está acabando</p>
                                    <p className="text-[10px] text-amber-700">Restam {p.estoque} unidades no estoque.</p>
                                  </div>
                                </div>
                              ))}

                              {insumosBaixos.map(i => (
                                <div key={i.id} className="p-2.5 rounded-xl bg-sky-50 border border-sky-100 flex items-start gap-2 text-sky-900">
                                  <AlertTriangle size={15} className="text-sky-600 shrink-0 mt-0.5" />
                                  <div>
                                    <p className="font-bold text-xs">Insumo baixo: {i.nome}</p>
                                    <p className="text-[10px] text-sky-700">Faça reposição de insumos na aba Precificação.</p>
                                  </div>
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Support Button */}
                <button
                  onClick={() => setSupportModalOpen(true)}
                  className="p-2 rounded-xl bg-slate-100/80 border border-slate-200/80 hover:bg-slate-200/70 text-slate-600 transition-colors shadow-2xs"
                  title="Suporte Técnico"
                >
                  <LifeBuoy size={18} />
                </button>

                {/* Settings Button */}
                <button
                  onClick={() => setSettingsModalOpen(true)}
                  className="p-2 rounded-xl bg-slate-100/80 border border-slate-200/80 hover:bg-slate-200/70 text-slate-600 transition-colors shadow-2xs"
                  title="Configurações e Diretrizes"
                >
                  <Settings size={18} />
                </button>

                {/* Profile / Account Badge */}
                {usuario ? (
                  <button
                    onClick={() => setProfileModalOpen(true)}
                    className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/80 transition-colors text-left shadow-2xs"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-extrabold flex items-center justify-center text-xs shadow-xs">
                      {usuario.nome ? usuario.nome[0].toUpperCase() : 'M'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight line-clamp-1">{usuario.nome}</p>
                      <p className="text-[10px] text-indigo-600 font-semibold">{usuario.nomeNegocio || 'MEI'}</p>
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 ml-1">
                    <button
                      onClick={() => { setAuthModalMode('login'); setAuthModalOpen(true); }}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                    >
                      Entrar
                    </button>
                    <button
                      onClick={() => { setAuthModalMode('register'); setAuthModalOpen(true); }}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <User size={14} /> Criar Conta MEI
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="lg:hidden flex items-center gap-2">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 bg-slate-100 rounded-lg border border-slate-200 text-slate-600 relative"
                >
                  <Bell size={18} />
                  {totalNotificacoes > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                      {totalNotificacoes}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
                >
                  {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </div>
            </div>

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="lg:hidden border-t border-slate-200/80 bg-white"
                >
                  <div className="p-4 space-y-2 text-sm">
                    {navItems.map(item => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveView(item.id as any);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all ${
                            activeView === item.id
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <Icon size={18} />
                          {item.label}
                        </button>
                      );
                    })}

                    <div className="pt-2 border-t border-slate-200 mt-2 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { setSettingsModalOpen(true); setMobileMenuOpen(false); }}
                        className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-100 font-bold text-slate-700 text-xs"
                      >
                        <Settings size={15} /> Configurações
                      </button>
                      <button
                        onClick={() => { setSupportModalOpen(true); setMobileMenuOpen(false); }}
                        className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-indigo-50 font-bold text-indigo-700 text-xs"
                      >
                        <LifeBuoy size={15} /> Suporte
                      </button>
                    </div>

                    <div className="pt-2">
                      {usuario ? (
                        <button
                          onClick={() => { setProfileModalOpen(true); setMobileMenuOpen(false); }}
                          className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
                        >
                          <User size={15} /> Perfil MEI ({usuario.nome})
                        </button>
                      ) : (
                        <button
                          onClick={() => { setAuthModalMode('register'); setAuthModalOpen(true); setMobileMenuOpen(false); }}
                          className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                        >
                          <LogIn size={15} /> Criar Conta
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Auto-Save Toast Alert */}
        <AnimatePresence>
          {autoSaveNotice && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-2 text-xs font-bold"
            >
              <CheckCircle2 size={16} className="text-emerald-400" />
              {autoSaveNotice}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content View Switcher */}
        <div className="pt-6 pb-12">
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <Dashboard setActiveView={setActiveView as any} />
              </motion.div>
            )}
            {activeView === 'precificacao' && (
              <motion.div
                key="precificacao"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <Pricing />
              </motion.div>
            )}
            {activeView === 'produtos' && (
              <motion.div
                key="produtos"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <Products />
              </motion.div>
            )}
            {activeView === 'despesas' && (
              <motion.div
                key="despesas"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <Expenses />
              </motion.div>
            )}
            {activeView === 'relatorios' && (
              <motion.div
                key="relatorios"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <Reports />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Global Footer with Reserved Rights and Company Disclaimer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <p className="font-bold text-white">
              {usuario?.nomeNegocio ? `${usuario.nomeNegocio} - Gestão Financeira` : 'IMPREDESC Plataforma MEI'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Todos os direitos da plataforma são reservados a <a href="https://empredesc.com.br" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline font-bold">empredesc.com.br</a>
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-semibold">
            <button onClick={() => setSettingsModalOpen(true)} className="hover:text-white transition-colors">
              Diretrizes & Termos
            </button>
            <span>•</span>
            <button onClick={() => setSupportModalOpen(true)} className="hover:text-white transition-colors">
              Suporte
            </button>
            <span>•</span>
            <span className="px-2.5 py-1 bg-white/10 rounded-full text-indigo-300 font-extrabold">
              v2.5.0 MEI
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
      <SupportModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
      />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
