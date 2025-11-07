'use client'

import { useState, useEffect } from 'react' // ← ADICIONAR useEffect AQUI
import { Venda } from '@/types'
import { formatarMoeda, formatarData, formatarTipoPagamento } from '@/lib/utils'

interface ModalDetalhesVendaProps {
  show: boolean
  onClose: () => void
  venda: Venda | null
  onAtualizarVenda: (vendaId: string, tipoPagamento: string) => void
}

export default function ModalDetalhesVenda({ 
  show, 
  onClose, 
  venda, 
  onAtualizarVenda 
}: ModalDetalhesVendaProps) {
  const [tipoPagamento, setTipoPagamento] = useState('PENDENTE')
  const [loading, setLoading] = useState(false)

  // Corrigir: Adicionar useEffect para atualizar o estado quando a venda mudar
  useEffect(() => {
    if (venda) {
      setTipoPagamento(venda.tipoPagamento)
    }
  }, [venda])

  const handleSubmit = async () => {
    if (!venda) return

    setLoading(true)
    try {
      await onAtualizarVenda(venda.id, tipoPagamento)
      onClose()
    } catch (error) {
      console.error('Erro ao atualizar venda:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!show || !venda) return null

  const dadosPedido = venda.dadosPedido || {}
  const produtos = dadosPedido.produtos || []

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Detalhes da Venda</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <strong>Data:</strong> {formatarData(new Date(venda.dataVenda))}
            </div>
            <div className="mb-3">
              <strong>Cliente:</strong> {dadosPedido.nome_cliente || dadosPedido.cliente?.nome || 'Não informado'}
            </div>
            <div className="mb-3">
              <strong>Telefone:</strong> {dadosPedido.telefone_cliente || dadosPedido.cliente?.telefone || 'Não informado'}
            </div>
            <div className="mb-3">
              <strong>Tipo de Pedido:</strong> {dadosPedido.tipo_pedido || 'Não informado'}
            </div>
            <div className="mb-3">
              <strong>Valor Total:</strong> {formatarMoeda(venda.valorTotal)}
            </div>
            <div className="mb-3">
              <strong>Produtos:</strong>
              <ul className="mt-2">
                {produtos.map((produto: any, index: number) => (
                  <li key={index}>
                    {produto.quantidade}x {produto.nome_produto || produto.nome} - {formatarMoeda(produto.valor)}
                    {produto.adicionais && produto.adicionais.length > 0 && (
                      <div className="small text-muted">
                        Adicionais: {produto.adicionais.join(', ')}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-3">
              <label htmlFor="tipoPagamentoSelect" className="form-label">
                Tipo de Pagamento
              </label>
              <select 
                className="form-select" 
                id="tipoPagamentoSelect"
                value={tipoPagamento}
                onChange={(e) => setTipoPagamento(e.target.value)}
                disabled={loading}
              >
                <option value="PENDENTE">Pendente</option>
                <option value="DINHEIRO">Dinheiro</option>
                <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                <option value="CARTAO_DEBITO">Cartão de Débito</option>
                <option value="PIX">PIX</option>
                <option value="OUTRO">Outro</option>
                <option value="VR">VR</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Fechar
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Salvando...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg"></i> Salvar Alterações
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}