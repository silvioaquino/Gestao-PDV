'use client'

import { useState, useEffect } from 'react'

interface TelaInicialProps {
  onAbrirCaixa: () => void
  onConsultarCaixa: (data: string) => void
}

export default function TelaInicial({ onAbrirCaixa, onConsultarCaixa }: TelaInicialProps) {
  const [dataConsulta, setDataConsulta] = useState(new Date().toISOString().split('T')[0])
  const [statusBackend, setStatusBackend] = useState('Verificando...')
  const [statusDatabase, setStatusDatabase] = useState('Verificando...')

  const verificarStatus = async () => {
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      
      setStatusBackend('Online')
      setStatusDatabase(data.database === 'connected' ? 'Conectado' : 'Desconectado')
    } catch (error) {
      setStatusBackend('Offline')
      setStatusDatabase('Desconectado')
    }
  }

  useEffect(() => {
    verificarStatus()
  }, [])

  return (
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-body text-center py-5">
            <h1 className="card-title">Sistema de Gestão PDV</h1>
            <p className="card-text">Conectado via Backend Seguro</p>
            <button 
              className="btn btn-primary btn-lg"
              onClick={onAbrirCaixa}
            >
              <i className="bi bi-cash-stack"></i> Abrir Caixa
            </button>

            <div className="row mt-5">
              <div className="col-md-6 offset-md-3">
                <div className="card">
                  <div className="card-header bg-info text-white">
                    <h6 className="card-title mb-0">Consulta de Caixa por Data</h6>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <label htmlFor="dataConsulta" className="form-label">
                        Selecione a Data
                      </label>
                      <input 
                        type="date" 
                        className="form-control" 
                        id="dataConsulta"
                        value={dataConsulta}
                        onChange={(e) => setDataConsulta(e.target.value)}
                      />
                    </div>
                    <button 
                      className="btn btn-info w-100"
                      onClick={() => onConsultarCaixa(dataConsulta)}
                    >
                      <i className="bi bi-search"></i> Consultar Caixa
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="card">
                <div className="card-header">
                  <h6 className="card-title mb-0">Status do Sistema</h6>
                </div>
                <div className="card-body">
                  <div className="mb-2">
                    <strong>Backend:</strong>
                    <span className={`badge ${statusBackend === 'Online' ? 'bg-success' : 'bg-danger'}`}>
                      {statusBackend}
                    </span>
                  </div>
                  <div className="mb-2">
                    <strong>Banco de Dados:</strong>
                    <span className={`badge ${statusDatabase === 'Conectado' ? 'bg-success' : 'bg-warning'}`}>
                      {statusDatabase}
                    </span>
                  </div>
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={verificarStatus}
                  >
                    <i className="bi bi-arrow-clockwise"></i> Verificar Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}