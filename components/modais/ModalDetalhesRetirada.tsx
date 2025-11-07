'use client'

import { useState } from 'react'
import { Retirada } from '@/types'
import { formatarMoeda, formatarData } from '@/lib/utils'

interface ModalDetalhesRetiradaProps {
  show: boolean
  onClose: () => void
  retirada: Retirada | null
  onExcluirRetirada: (retiradaId: string) => void
}

export default function ModalDetalhesRetirada({ 
  show, 
  onClose, 
  retirada, 
  onExcluirRetirada 
}: ModalDetalhesRetiradaProps) {
  const [loading, setLoading] = useState(false)

  const handleExcluir = async () => {
    if (!retirada) return

    if (!confirm('Tem certeza que deseja excluir esta retirada? Esta ação não pode ser desfeita.')) {
      return
    }

    setLoading(true)
    try {
      await onExcluirRetirada(retirada.id)
      onClose()
    } catch (error) {
      console.error('Erro ao excluir retirada:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!show || !retirada) return null

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Detalhes da Retirada</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <strong>Valor:</strong>
              <div className="fs-4 text-danger">{formatarMoeda(retirada.valor)}</div>
            </div>
            <div className="mb-3">
              <strong>Data e Hora:</strong>
              <div>{formatarData(new Date(retirada.dataRetirada))}</div>
            </div>
            <div className="mb-3">
              <strong>Observação:</strong>
              <div className="p-2 bg-light rounded">{retirada.observacao || 'Sem observação'}</div>
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
              className="btn btn-danger" 
              onClick={handleExcluir}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Excluindo...
                </>
              ) : (
                <>
                  <i className="bi bi-trash"></i> Excluir Retirada
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}