export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

export function formatarData(data: Date): string {
  return data.toLocaleString('pt-BR')
}

export function formatarTipoPagamento(tipo: string): string {
  const tipos: { [key: string]: string } = {
    'DINHEIRO': 'Dinheiro',
    'CARTAO_CREDITO': 'Cartão de Crédito',
    'CARTAO_DEBITO': 'Cartão de Débito',
    'PIX': 'PIX',
    'OUTRO': 'Outro'
  }
  return tipos[tipo] || tipo
}

export function formatarDataInput(data: Date): string {
  return data.toISOString().split('T')[0]
}

export function getBadgeColorTipoPagamento(tipo: string): string {
  const cores: { [key: string]: string } = {
    'PENDENTE': 'bg-warning',
    'DINHEIRO': 'bg-success',
    'CARTAO_CREDITO': 'bg-primary',
    'CARTAO_DEBITO': 'bg-info',
    'PIX': 'bg-secondary',
    'OUTRO': 'bg-dark'
  }
  return cores[tipo] || 'bg-secondary'
}

export function getIconTipoPagamento(tipo: string): string {
  const icones: { [key: string]: string } = {
    'PENDENTE': 'bi-clock',
    'DINHEIRO': 'bi-cash',
    'CARTAO_CREDITO': 'bi-credit-card',
    'CARTAO_DEBITO': 'bi-credit-card-2-front',
    'PIX': 'bi-phone',
    'OUTRO': 'bi-three-dots'
  }
  return icones[tipo] || 'bi-three-dots'
}