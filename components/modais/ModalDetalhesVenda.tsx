'use client'

import { useState } from 'react'
import { Venda } from '@/types'
import { formatarMoeda, formatarTipoPagamento, getBadgeColorTipoPagamento } from '@/lib/utils'

interface ModalDetalhesVendaProps {
  show: boolean
  onClose: () => void
  venda: Venda | null
  onAtualizarVenda: (vendaId: string, tipoPagamento: string) => Promise<void>
}

export default function ModalDetalhesVenda({
  show,
  onClose,
  venda,
  onAtualizarVenda
}: ModalDetalhesVendaProps) {
  const [loading, setLoading] = useState(false)
  const [tipoPagamentoSelecionado, setTipoPagamentoSelecionado] = useState(venda?.tipoPagamento || 'PENDENTE')

  if (!show || !venda) return null

  const tiposPagamento = [
    'DINHEIRO',
    'CARTAO_CREDITO', 
    'CARTAO_DEBITO',
    'PIX',
    'VR',
    'OUTRO',
    'PENDENTE'
  ]

  // components/dashboard/modais/ModalDetalhesVenda.tsx
const handleSalvarAlteracao = async () => {
  if (!venda) return
  
  if (tipoPagamentoSelecionado === venda.tipoPagamento) {
    onClose()
    return
  }

  setLoading(true)
  try {
    console.log('🔄 Salvando alteração:', {
      vendaId: venda.id,
      tipoPagamentoAntigo: venda.tipoPagamento,
      tipoPagamentoNovo: tipoPagamentoSelecionado
    })

    await onAtualizarVenda(venda.id, tipoPagamentoSelecionado)
    
    console.log('✅ Alteração salva com sucesso')
    onClose()
  } catch (error: any) {
    console.error('❌ Erro ao atualizar venda:', error)
    alert(`Erro ao atualizar tipo de pagamento: ${error.message}`)
  } finally {
    setLoading(false)
  }
}


  /*const handleSalvarAlteracao = async () => {
    if (!venda) return
    
    if (tipoPagamentoSelecionado === venda.tipoPagamento) {
      onClose()
      return
    }

    setLoading(true)
    try {
      await onAtualizarVenda(venda.id, tipoPagamentoSelecionado)
      onClose()
    } catch (error) {
      console.error('Erro ao atualizar venda:', error)
      alert('Erro ao atualizar tipo de pagamento')
    } finally {
      setLoading(false)
    }
  }*/

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Detalhes da Venda</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <div className="modal-body">
            {/* Informações da Venda */}
            <div className="row mb-4">
              <div className="col-md-6">
                <h6>Informações da Venda</h6>
                <p><strong>ID:</strong> {venda.id}</p>
                <p><strong>Data:</strong> {new Date(venda.dataVenda).toLocaleString('pt-BR')}</p>
                <p><strong>Valor Total:</strong> {formatarMoeda(venda.valorTotal)}</p>
                <p>
                  <strong>Tipo de Pagamento:</strong>{' '}
                  <span className={`badge ${getBadgeColorTipoPagamento(venda.tipoPagamento)}`}>
                    {formatarTipoPagamento(venda.tipoPagamento)}
                  </span>
                </p>
              </div>
              
              <div className="col-md-6">
                <h6>Informações do Cliente</h6>
                {venda.nomeCliente && (
                  <p><strong>Nome:</strong> {venda.nomeCliente}</p>
                )}
                {venda.telefoneCliente && (
                  <p><strong>Telefone:</strong> {venda.telefoneCliente}</p>
                )}
                {venda.tipoPedido && (
                  <p><strong>Tipo de Pedido:</strong> {venda.tipoPedido}</p>
                )}
                {venda.endereco && (
                  <p><strong>Endereço:</strong> {venda.endereco}</p>
                )}
              </div>
            </div>

            {/* Alterar Tipo de Pagamento */}
            <div className="card">
              <div className="card-header">
                <h6 className="card-title mb-0">Alterar Tipo de Pagamento</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-8">
                    <select 
                      className="form-select"
                      value={tipoPagamentoSelecionado}
                      onChange={(e) => setTipoPagamentoSelecionado(e.target.value)}
                      disabled={loading}
                    >
                      {tiposPagamento.map(tipo => (
                        <option key={tipo} value={tipo}>
                          {formatarTipoPagamento(tipo)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <button 
                      className="btn btn-primary w-100"
                      onClick={handleSalvarAlteracao}
                      disabled={loading || tipoPagamentoSelecionado === venda.tipoPagamento}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Salvando...
                        </>
                      ) : (
                        'Salvar Alteração'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalhes dos Produtos */}
            {venda.dadosPedido?.produtos && (
              <div className="card mt-4">
                <div className="card-header">
                  <h6 className="card-title mb-0">Produtos</h6>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Produto</th>
                          <th>Quantidade</th>
                          <th>Valor Unit.</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {venda.dadosPedido.produtos.map((produto: any, index: number) => (
                          <tr key={index}>
                            <td>
                              {produto.nome}
                              {produto.adicionais && produto.adicionais.length > 0 && (
                                <div className="small text-muted">
                                  <strong>Adicionais:</strong>{' '}
                                  {produto.adicionais.map((adicional: any, idx: number) => (
                                    <span key={idx}>
                                      {adicional.nome}
                                      {idx < produto.adicionais.length - 1 ? ', ' : ''}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td>{produto.quantidade}</td>
                            <td>{formatarMoeda(produto.valor)}</td>
                            <td>{formatarMoeda(produto.quantidade * produto.valor)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Dados Completos do Webhook (para debug) */}
            <div className="card mt-4">
              <div className="card-header">
                <h6 className="card-title mb-0">Dados Completos do Pedido</h6>
              </div>
              <div className="card-body">
                <pre className="bg-light p-3 rounded small" style={{ maxHeight: '200px', overflow: 'auto' }}>
                  {JSON.stringify(venda.dadosPedido, null, 2)}
                </pre>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}