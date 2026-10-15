import { Shield, Lock, Eye, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy({ onBack }: { onBack: () => void }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-4 py-2 rounded-xl transition-colors"
      >
        <ArrowLeft size={16} /> Voltar ao Painel Principal
      </button>

      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Política de Privacidade & LGPD</h1>
            <p className="text-xs text-slate-500 font-medium">Última atualização: Outubro de 2025 • empredesc.com.br</p>
          </div>
        </div>

        <div className="space-y-4 text-xs leading-relaxed text-slate-700">
          <section className="space-y-2">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Lock size={16} className="text-indigo-600" /> 1. Compromisso de Privacidade
            </h2>
            <p>
              A plataforma <strong>EMPREDESC PRO</strong> (disponível em empredesc.com.br) tem como compromisso prioritário a transparência e a segurança no tratamento dos dados de microentreendedores individuais (MEI).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Eye size={16} className="text-indigo-600" /> 2. Coleta e Armazenamento Local
            </h2>
            <p>
              Todos os seus registros de faturamento, preços de insumos, custos de produtos e contatos de clientes são mantidos com <strong>armazenamento privado local (LocalStorage)</strong> em seu próprio navegador. Isso significa que seus segredos comerciais não são compartilhados nem comercializados.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" /> 3. Seus Direitos (LGPD)
            </h2>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
              <li>Acesso e edição imediata dos seus dados no perfil.</li>
              <li>Exclusão instantânea de cadastros e histórico a qualquer momento.</li>
              <li>Exportação física dos seus dados em relatórios CSV e PDF.</li>
            </ul>
          </section>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-500 font-medium">
            Em caso de dúvidas sobre nossa Política de Privacidade, entre em contato com nosso Encarregado de Proteção de Dados (DPO) através do e-mail <strong>felipematheus2011souza@gmail.com</strong>.
          </div>
        </div>
      </div>
    </div>
  );
}
