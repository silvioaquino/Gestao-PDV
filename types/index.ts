export interface WebhookCardapioAI {
  cliente: {
    nome: string
    telefone: string
  }
  pedido: {
    tipo: "DELIVERY" | "RETIRADA"
    endereco?: string
    dataHora: string
    valorTotal: number
  }
  produtos: Array<{
    nome: string
    quantidade: number
    valor: number
    adicionais?: string[]
  }>
}

export interface CaixaAbertura {
  id: string
  dataAbertura: Date
  valorInicial: number
  observacao?: string
  status: string
  createdAt: Date
  updatedAt: Date
}

export interface Venda {
  id: string
  dataVenda: Date
  dadosPedido: any
  tipoPagamento: string
  valorTotal: number
  manual: boolean
  caixaAberturaId: string
  createdAt: Date
  updatedAt: Date
}

export interface VendaManual {
  id: string
  dataVenda: Date
  tipoPagamento: string
  valor: number
  descricao?: string
  caixaAberturaId: string
  createdAt: Date
  updatedAt: Date
}

export interface Retirada {
  id: string
  dataRetirada: Date
  valor: number
  observacao?: string
  caixaAberturaId: string
  createdAt: Date
  updatedAt: Date
}

export interface CaixaFechamento {
  id: string
  dataFechamento: Date
  valorAbertura: number
  totalVendas: number
  retiradas: number
  saldoFinal: number
  observacoes?: string
  caixaAberturaId: string
  createdAt: Date
  updatedAt: Date
}