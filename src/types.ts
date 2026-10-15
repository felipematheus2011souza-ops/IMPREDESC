export interface UsuarioMicroempreendedor {
  id: string;
  nome: string;
  email: string;
  nomeNegocio: string;
  segmento: string;
  cnpjCpf?: string;
  telefone?: string;
  metaFaturamentoMensal: number;
  fotoUrl?: string;
  dataCadastro: string;
}

export interface Insumo {
  id: string;
  nome: string;
  precoPorPacote: number;
  quantidadePacotes: number;
  tamanhoPacote: number;
  unidadeMedida: string;
  estoqueTotal: number;
}

export interface InsumoUsado {
  insumoId: string;
  quantidadeUsada: number;
  modoUso: 'total' | 'unitario';
}

export interface ReceitaPrecificada {
  id: string;
  nome: string;
  categoriaMercado: string;
  tempoProducaoMinutos: number;
  valorHoraTrabalho: number;
  custosFixosPercentual: number;
  lucroDesejadoPercentual: number;
  impostosPercentual: number;
  taxaCartaoPercentual: number;
  outrosCustos: number;
  metodoPrecificacao: 'margem' | 'markup';
  custoEmbalagem: number;
  imagemUrl: string;
  rendimento: number;
  insumosUsados: InsumoUsado[];
  custoTotal: number;
  custoTotalUnitario: number;
  precoSugerido: number;
  precoSugeridoUnitario: number;
  priceAdjustmentPercent?: number;
  dataCriacao: string;
}

export interface ProdutoCadastrado {
  id: string;
  nome: string;
  descricao: string;
  unidadeMedida: string;
  custo: number;
  precoVenda: number;
  estoque: number;
}

export interface Configuracoes {
  valorHoraTrabalhoPadrao: number;
  custoFixoPadrao: number;
  lucroDesejadoPadrao: number;
  impostosPadrao: number;
}

export interface Venda {
  id: string;
  produtoId: string;
  nomeProduto: string;
  valorVenda: number;
  custoProduto: number;
  lucroLiquido: number;
  quantidade: number;
  data: string;
}

export interface Despesa {
  id: string;
  descricao: string;
  categoria: string;
  tipo: 'variavel' | 'fixo';
  valor: number;
  data: string;
  status: 'pago' | 'pendente';
}

export interface Orcamento {
  id: string;
  clienteNome: string;
  clienteTelefone?: string;
  dataValidade: string;
  observacoes?: string;
  itens: {
    produtoId?: string;
    nomeProduto: string;
    quantidade: number;
    precoUnitario: number;
  }[];
  valorTotal: number;
  status: 'rascunho' | 'enviado' | 'aprovado' | 'recusado';
  dataCriacao: string;
}
