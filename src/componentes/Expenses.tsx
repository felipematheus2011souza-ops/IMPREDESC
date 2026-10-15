import { useState } from 'react';
import { Plus, Trash2, TrendingDown, Wallet, Calendar } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import type { Despesa } from '../types';

export default function Expenses() {
  const { despesas, setDespesas } = useAppContext();

  const [novaDespesa, setNovaDespesa] = useState<Partial<Despesa>>({
    descricao: '', categoria: 'Outros', tipo: 'variavel', valor: 0, data: new Date().toISOString().split('T')[0], status: 'pago'
  });

  const handleSalvar = () => {
    if (novaDespesa.descricao && novaDespesa.valor! > 0) {
      setDespesas([{ ...novaDespesa, id: crypto.randomUUID() } as Despesa, ...despesas]);
      setNovaDespesa({ descricao: '', categoria: 'Outros', tipo: 'variavel', valor: 0, data: new Date().toISOString().split('T')[0], status: 'pago' });
    }
  };

  const removerDespesa = (id: string) => {
    setDespesas(despesas.filter(d => d.id !== id));
  };
  
  const toggleStatus = (id: string) => {
    setDespesas(despesas.map(d => d.id === id ? { ...d, status: d.status === 'pago' ? 'pendente' : 'pago' } : d));
  };

  const totalPago = despesas.filter(d => d.status === 'pago').reduce((acc, curr) => acc + curr.valor, 0);
  const totalPendente = despesas.filter(d => d.status === 'pendente').reduce((acc, curr) => acc + curr.valor, 0);
  const total = totalPago + totalPendente;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 font-extrabold text-[10px] uppercase tracking-wider rounded-md border border-rose-100">
              Controle Financeiro MEI
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Gestão Inteligente de Despesas</h2>
          <p className="text-slate-500 text-xs font-medium mt-0.5">Monitore saídas, custos operacionais e faturas a pagar com precisão.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Mês</p>
            <p className="text-2xl font-black text-slate-900">R$ {total.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-2xs hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <Wallet size={24} />
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-rose-400 uppercase tracking-wider">Liquidado / Pago</p>
            <p className="text-2xl font-black text-rose-700">R$ {totalPago.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-amber-100 shadow-2xs hover:shadow-md transition-all flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-[11px] font-extrabold text-amber-500 uppercase tracking-wider">Pendente de Pagamento</p>
            <p className="text-2xl font-black text-amber-700">R$ {totalPendente.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm self-start">
          <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest mb-6">Nova Despesa</h3>
          <div className="space-y-4 text-sm">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Descrição</label>
              <input type="text" value={novaDespesa.descricao} onChange={e => setNovaDespesa({...novaDespesa, descricao: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ex: Conta de Luz" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Valor (R$)</label>
                <input type="number" step="0.01" value={novaDespesa.valor || ''} onChange={e => setNovaDespesa({...novaDespesa, valor: Number(e.target.value)})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Data</label>
                <input type="date" value={novaDespesa.data} onChange={e => setNovaDespesa({...novaDespesa, data: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Categoria</label>
                <select value={novaDespesa.categoria} onChange={e => setNovaDespesa({...novaDespesa, categoria: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="Infraestrutura">Infraestrutura</option>
                  <option value="Insumos">Insumos</option>
                  <option value="Utilidades">Utilidades</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tipo</label>
                <select value={novaDespesa.tipo} onChange={e => setNovaDespesa({...novaDespesa, tipo: e.target.value as any})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="fixo">Fixa</option>
                  <option value="variavel">Variável</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Status</label>
              <select value={novaDespesa.status} onChange={e => setNovaDespesa({...novaDespesa, status: e.target.value as 'pago' | 'pendente'})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="pago">Pago</option>
                <option value="pendente">Pendente</option>
              </select>
            </div>
            
            <button onClick={handleSalvar} className="w-full mt-4 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors flex items-center justify-center gap-2">
              <Plus size={18} /> Registrar
            </button>
          </div>
        </div>

        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Histórico de Lançamentos</h3>
          </div>
          
          <div className="flex-1 p-0 overflow-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-semibold text-slate-400 uppercase bg-slate-50/50 border-b border-slate-100">
                  <th className="p-4">Data</th>
                  <th className="p-4">Descrição</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Valor</th>
                  <th className="p-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {despesas.map(d => (
                  <tr key={d.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-slate-500">{new Date(d.data).toLocaleDateString('pt-BR')}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{d.descricao}</p>
                      <p className="text-xs text-slate-400">{d.categoria}</p>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => toggleStatus(d.id)}
                        className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-colors ${d.status === 'pendente' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                      >
                        {d.status === 'pendente' ? 'Pendente' : 'Pago'}
                      </button>
                    </td>
                    <td className="p-4 text-right font-bold text-rose-600">R$ {d.valor.toFixed(2)}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => removerDespesa(d.id)} className="text-slate-400 hover:text-rose-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {despesas.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-400">Nenhuma despesa registrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
