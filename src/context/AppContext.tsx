import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Insumo, ReceitaPrecificada, ProdutoCadastrado, Configuracoes, Venda, Despesa } from '../types';

interface AppContextType {
  insumos: Insumo[];
  setInsumos: (insumos: Insumo[]) => void;
  receitas: ReceitaPrecificada[];
  setReceitas: (receitas: ReceitaPrecificada[]) => void;
  produtos: ProdutoCadastrado[];
  setProdutos: (produtos: ProdutoCadastrado[]) => void;
  configuracoes: Configuracoes;
  setConfiguracoes: (configuracoes: Configuracoes) => void;
  vendas: Venda[];
  setVendas: (vendas: Venda[]) => void;
  despesas: Despesa[];
  setDespesas: (despesas: Despesa[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [receitas, setReceitas] = useState<ReceitaPrecificada[]>([]);
  const [produtos, setProdutos] = useState<ProdutoCadastrado[]>([]);
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [configuracoes, setConfiguracoes] = useState<Configuracoes>({
    valorHoraTrabalhoPadrao: 25,
    custoFixoPadrao: 10,
    lucroDesejadoPadrao: 30,
    impostosPadrao: 5
  });

  return (
    <AppContext.Provider value={{ insumos, setInsumos, receitas, setReceitas, produtos, setProdutos, configuracoes, setConfiguracoes, vendas, setVendas, despesas, setDespesas }}>
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
