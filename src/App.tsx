import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider } from './context/AppContext';
import Pricing from './componentes/Pricing';
import Dashboard from './componentes/Dashboard';
import Expenses from './componentes/Expenses';
import Products from './componentes/Products';
import Reports from './componentes/Reports';
import { LayoutDashboard, Calculator, Receipt, Package, FileText, Menu, X, Sparkles } from 'lucide-react';

function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'precificacao' | 'despesas' | 'produtos' | 'relatorios'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'from-blue-500 to-cyan-500' },
    { id: 'precificacao', label: 'Precificação', icon: Calculator, color: 'from-purple-500 to-pink-500' },
    { id: 'produtos', label: 'Produtos', icon: Package, color: 'from-green-500 to-emerald-500' },
    { id: 'despesas', label: 'Despesas', icon: Receipt, color: 'from-orange-500 to-red-500' },
    { id: 'relatorios', label: 'Relatórios', icon: FileText, color: 'from-indigo-500 to-purple-500' },
  ];

  return (
    <AppProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        {/* Navbar with Glassmorphism */}
        <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-white/20 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative px-3 py-2 bg-white rounded-lg">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">IMPREDESC</h1>
                  <p className="text-xs text-slate-400 font-medium">Gestão Financeira</p>
                </div>
              </motion.div>
              
              {/* Desktop Menu */}
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setActiveView(item.id as any)}
                      className={`relative group flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                        isActive
                          ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-blue-500/30`
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="active-tab"
                          className="absolute inset-0 bg-white/10 rounded-xl"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <Icon size={18} className="relative z-10" />
                      <span className="relative z-10">{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Mobile Menu Button */}
              <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 hover:bg-slate-100 rounded-xl transition-colors duration-300"
              >
                <motion.div
                  animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </motion.div>
              </motion.button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="md:hidden border-t border-slate-200/50 bg-white/80 backdrop-blur-sm"
                >
                  <div className="p-4 space-y-2">
                    {navItems.map(item => {
                      const Icon = item.icon;
                      return (
                        <motion.button
                          key={item.id}
                          whileHover={{ x: 4 }}
                          onClick={() => {
                            setActiveView(item.id as any);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                            activeView === item.id
                              ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <Icon size={18} />
                          {item.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Main Content with smooth transitions */}
        <div className="pt-8 pb-12">
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Dashboard setActiveView={setActiveView as any} />
              </motion.div>
            )}
            {activeView === 'precificacao' && (
              <motion.div
                key="precificacao"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Pricing />
              </motion.div>
            )}
            {activeView === 'produtos' && (
              <motion.div
                key="produtos"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Products />
              </motion.div>
            )}
            {activeView === 'despesas' && (
              <motion.div
                key="despesas"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Expenses />
              </motion.div>
            )}
            {activeView === 'relatorios' && (
              <motion.div
                key="relatorios"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Reports />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppProvider>
  );
}

export default App;
