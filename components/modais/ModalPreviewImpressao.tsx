'use client'

import ComprovanteTermico from '../impressao/ComprovanteTermico'
import { CaixaAbertura, Venda, Retirada, VendaManual } from '@/types'

interface ModalPreviewImpressaoProps {
  show: boolean
  onClose: () => void
  tipo: 'fechamento' | 'parcial'
  caixaAtual: CaixaAbertura
  vendas: Venda[]
  retiradas: Retirada[]
  vendasManuais: { [key: string]: VendaManual[] }
}

export default function ModalPreviewImpressao({
  show,
  onClose,
  tipo,
  caixaAtual,
  vendas,
  retiradas,
  vendasManuais
}: ModalPreviewImpressaoProps) {
  
  if (!show) return null

  return (
    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Pré-visualização - Impressora Térmica 80mm</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="text-center mb-3">
              <small className="text-muted">
                Visualização do que será impresso na impressora térmica
              </small>
            </div>
            
            <ComprovanteTermico
              tipo={tipo}
              caixaAtual={caixaAtual}
              vendas={vendas}
              retiradas={retiradas}
              vendasManuais={vendasManuais}
              onImprimir={onClose}
            />
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}