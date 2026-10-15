import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Crash Guard captured an exception:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Sistema Protegido • Anti-Lag</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              O guardião de desempenho da plataforma detectou e isolou uma instabilidade técnica para proteger seus dados.
            </p>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-left text-[11px] font-mono text-slate-400 max-h-24 overflow-y-auto">
              {this.state.error?.toString() || 'Erro inesperado isolado com sucesso.'}
            </div>
            <button
              onClick={this.handleReset}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:shadow-lg transition-all flex items-center justify-center gap-2 text-xs"
            >
              <RefreshCw size={16} /> Reiniciar Sistema em Modo Seguro
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
