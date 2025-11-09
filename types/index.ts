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
  dataFechamento: Date
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

// Em '@/types/index.ts' - ORGANIZAR o tipo existente
export interface CaixaFechamento {
  id: string
  // Campos principais
  dataAbertura: Date
  dataFechamento: Date
  valorAbertura: number
  totalVendas: number
  saldoFinal: number
  observacoes?: string
  caixaAberturaId: string
  createdAt: Date
  updatedAt: Date
  
  // Campos para compatibilidade (mantenha se estiver usando)
  data_abertura?: string
  data_fechamento?: string
  valor_inicial?: number
  observacao?: string
  
  // Campos calculados para a consulta
  valor_abertura?: number
  vendas_dinheiro?: number
  total_vendas?: number
  total_retiradas?: number
  saldo_final?: number
  
  // Detalhamento
  vendas_por_forma_pagamento?: {
    [key: string]: number
  }
  retiradas?: Array<{
    data: string
    valor: number
    observacao: string
  }>
  
  // Status e dados adicionais da consulta
  status?: string
  fechamento?: {
    data_fechamento: string
    valor_abertura: number
    total_vendas: number
    retiradas: number
    saldo_final: number
    observacoes?: string
  }
  
  // Dados para debug/informação
  total_vendas_sistema?: number
  total_vendas_manuais?: number
  quantidade_vendas?: number
  quantidade_vendas_manuais?: number
  quantidade_retiradas?: number
}