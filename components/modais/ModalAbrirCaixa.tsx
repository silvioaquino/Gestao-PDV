'use client'

import { useState } from 'react'

interface ModalAbrirCaixaProps {
  show: boolean
  onClose: () => void
  onAbrirCaixa: (valorInicial: number, observacao: string) => void
}

export default function ModalAbrirCaixa({ show, onClose, onAbrirCaixa }: ModalAbrirCaixaProps) {
  const [valorInicial, setValorInicial] = useState('0.00')
  const [observacao, setObservacao] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    const valor = parseFloat(valorInicial)
    if (isNaN(valor) || valor < 0) {
      alert('Por favor, insira um valor inicial válido')
      return
    }

    setLoading(true)
    try {
      await onAbrirCaixa(valor, observacao)
      setValorInicial('0.00')
      setObservacao('')
      onClose()
    } catch (error) {
      console.error('Erro ao abrir caixa:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Abrir Caixa</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label htmlFor="valorInicialInput" className="form-label">
                Valor Inicial em Caixa
              </label>
              <input 
                type="number" 
                className="form-control" 
                id="valorInicialInput" 
                step="0.01" 
                min="0"
                value={valorInicial}
                onChange={(e) => setValorInicial(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="observacaoAbertura" className="form-label">
                Observações
              </label>
              <textarea 
                className="form-control" 
                id="observacaoAbertura" 
                rows={3}
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                disabled={loading}
              ></textarea>
            </div>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
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
                  Abrindo...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg"></i> Abrir Caixa
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}