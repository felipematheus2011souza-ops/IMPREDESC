import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import type {
  UsuarioMicroempreendedor,
  Insumo,
  ReceitaPrecificada,
  ProdutoCadastrado,
  Configuracoes,
  Venda,
  Despesa,
  Orcamento
} from '../types';

interface AppContextType {
  usuario: UsuarioMicroempreendedor | null;
  cadastrarUsuario: (dados: Omit<UsuarioMicroempreendedor, 'id' | 'dataCadastro'>, senha?: string) => boolean;
  loginUsuario: (email: string, senha?: string) => boolean;
  logoutUsuario: () => void;
  atualizarPerfil: (dados: Partial<UsuarioMicroempreendedor>) => void;

  insumos: Insumo[];
  setInsumos: React.Dispatch<React.SetStateAction<Insumo[]>>;
  receitas: ReceitaPrecificada[];
  setReceitas: React.Dispatch<React.SetStateAction<ReceitaPrecificada[]>>;
  produtos: ProdutoCadastrado[];
  setProdutos: React.Dispatch<React.SetStateAction<ProdutoCadastrado[]>>;
  configuracoes: Configuracoes;
  setConfiguracoes: React.Dispatch<React.SetStateAction<Configuracoes>>;
  vendas: Venda[];
  setVendas: React.Dispatch<React.SetStateAction<Venda[]>>;
  despesas: Despesa[];
  setDespesas: React.Dispatch<React.SetStateAction<Despesa[]>>;
  orcamentos: Orcamento[];
  setOrcamentos: React.Dispatch<React.SetStateAction<Orcamento[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Storage keys
const STORAGE_USER_KEY = 'impredesc_usuario_atual';
const STORAGE_ACCOUNTS_KEY = 'impredesc_contas_usuarios';

// Sample default user so the app is immediately ready if not logged in
const defaultUser: UsuarioMicroempreendedor = {
  id: 'demo-user-1',
  nome: 'Maria Silva',
  email: 'maria@confeitaria.com',
  nomeNegocio: 'Doces da Maria MEI',
  segmento: 'Confeitaria & Gastronomia',
  cnpjCpf: '12.345.678/0001-90',
  telefone: '(11) 98765-4321',
  metaFaturamentoMensal: 5000,
  dataCadastro: new Date().toISOString()
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioMicroempreendedor | null>(() => {
    const storedUser = localStorage.getItem(STORAGE_USER_KEY);
    if (storedUser) {
      try { return JSON.parse(storedUser); } catch { /* ignore */ }
    }
    return defaultUser;
  });

  // Unique data per user
  const userPrefix = usuario ? `user_${usuario.id}_` : 'guest_';

  const [insumos, setInsumos] = useState<Insumo[]>(() => {
    const saved = localStorage.getItem(`${userPrefix}insumos`);
    return saved ? JSON.parse(saved) : [];
  });

  const [receitas, setReceitas] = useState<ReceitaPrecificada[]>(() => {
    const saved = localStorage.getItem(`${userPrefix}receitas`);
    return saved ? JSON.parse(saved) : [];
  });

  const [produtos, setProdutos] = useState<ProdutoCadastrado[]>(() => {
    const saved = localStorage.getItem(`${userPrefix}produtos`);
    return saved ? JSON.parse(saved) : [];
  });

  const [vendas, setVendas] = useState<Venda[]>(() => {
    const saved = localStorage.getItem(`${userPrefix}vendas`);
    return saved ? JSON.parse(saved) : [];
  });

  const [despesas, setDespesas] = useState<Despesa[]>(() => {
    const saved = localStorage.getItem(`${userPrefix}despesas`);
    return saved ? JSON.parse(saved) : [];
  });

  const [orcamentos, setOrcamentos] = useState<Orcamento[]>(() => {
    const saved = localStorage.getItem(`${userPrefix}orcamentos`);
    return saved ? JSON.parse(saved) : [];
  });

  const [configuracoes, setConfiguracoes] = useState<Configuracoes>({
    valorHoraTrabalhoPadrao: 25,
    custoFixoPadrao: 10,
    lucroDesejadoPadrao: 30,
    impostosPadrao: 5
  });

  // Save user session
  useEffect(() => {
    if (usuario) {
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(usuario));
    } else {
      localStorage.removeItem(STORAGE_USER_KEY);
    }
  }, [usuario]);

  // Persist domain state to localStorage
  useEffect(() => {
    localStorage.setItem(`${userPrefix}insumos`, JSON.stringify(insumos));
  }, [insumos, userPrefix]);

  useEffect(() => {
    localStorage.setItem(`${userPrefix}receitas`, JSON.stringify(receitas));
  }, [receitas, userPrefix]);

  useEffect(() => {
    localStorage.setItem(`${userPrefix}produtos`, JSON.stringify(produtos));
  }, [produtos, userPrefix]);

  useEffect(() => {
    localStorage.setItem(`${userPrefix}vendas`, JSON.stringify(vendas));
  }, [vendas, userPrefix]);

  useEffect(() => {
    localStorage.setItem(`${userPrefix}despesas`, JSON.stringify(despesas));
  }, [despesas, userPrefix]);

  useEffect(() => {
    localStorage.setItem(`${userPrefix}orcamentos`, JSON.stringify(orcamentos));
  }, [orcamentos, userPrefix]);

  const cadastrarUsuario = (dados: Omit<UsuarioMicroempreendedor, 'id' | 'dataCadastro'>, senha?: string): boolean => {
    const accountsRaw = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
    const accounts = accountsRaw ? JSON.parse(accountsRaw) : [];

    const existing = accounts.find((acc: any) => acc.email.toLowerCase() === dados.email.toLowerCase());
    if (existing) {
      alert('E-mail já cadastrado! Por favor faça login.');
      return false;
    }

    const novoUser: UsuarioMicroempreendedor = {
      ...dados,
      id: crypto.randomUUID(),
      dataCadastro: new Date().toISOString()
    };

    accounts.push({ ...novoUser, senha: senha || '123456' });
    localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
    setUsuario(novoUser);
    return true;
  };

  const loginUsuario = (email: string, senha?: string): boolean => {
    const accountsRaw = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
    const accounts = accountsRaw ? JSON.parse(accountsRaw) : [];

    const found = accounts.find((acc: any) => acc.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      // If default demo account
      if (email.toLowerCase() === defaultUser.email.toLowerCase()) {
        setUsuario(defaultUser);
        return true;
      }
      alert('Usuário não encontrado. Crie uma conta!');
      return false;
    }

    if (senha && found.senha && found.senha !== senha) {
      alert('Senha incorreta!');
      return false;
    }

    const { senha: _, ...userObj } = found;
    setUsuario(userObj);
    return true;
  };

  const logoutUsuario = () => {
    setUsuario(null);
  };

  const atualizarPerfil = (dados: Partial<UsuarioMicroempreendedor>) => {
    if (!usuario) return;
    const atualizado = { ...usuario, ...dados };
    setUsuario(atualizado);

    const accountsRaw = localStorage.getItem(STORAGE_ACCOUNTS_KEY);
    if (accountsRaw) {
      const accounts = JSON.parse(accountsRaw).map((acc: any) =>
        acc.id === usuario.id ? { ...acc, ...dados } : acc
      );
      localStorage.setItem(STORAGE_ACCOUNTS_KEY, JSON.stringify(accounts));
    }
  };

  return (
    <AppContext.Provider
      value={{
        usuario,
        cadastrarUsuario,
        loginUsuario,
        logoutUsuario,
        atualizarPerfil,
        insumos,
        setInsumos,
        receitas,
        setReceitas,
        produtos,
        setProdutos,
        configuracoes,
        setConfiguracoes,
        vendas,
        setVendas,
        despesas,
        setDespesas,
        orcamentos,
        setOrcamentos
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
