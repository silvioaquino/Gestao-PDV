'use client'

import { useState, useEffect } from 'react'

interface TelaInicialProps {
  onAbrirCaixa: () => void
  onConsultarCaixa: (data: string) => Promise<void>
  loading?: boolean
}

export default function TelaInicial({ 
  onAbrirCaixa, 
  onConsultarCaixa, 
  loading = false 
}: TelaInicialProps) {
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

  const handleConsultarCaixa = async () => {
    if (!dataConsulta) {
      alert('Por favor, selecione uma data válida')
      return
    }
    await onConsultarCaixa(dataConsulta)
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
            
            {/* Botão Abrir Caixa */}
            <button 
              className="btn btn-primary btn-lg mb-4"
              onClick={onAbrirCaixa}
            >
              <i className="bi bi-cash-stack me-2"></i> Abrir Caixa
            </button>

            {/* Card de Consulta */}
            <div className="row justify-content-center mt-4">
              <div className="col-md-6">
                <div className="card border-info">
                  <div className="card-header bg-info text-white">
                    <h6 className="card-title mb-0">
                      <i className="bi bi-search me-2"></i>
                      Consulta de Caixa por Data
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <label htmlFor="dataConsulta" className="form-label">
                        <strong>Selecione a Data</strong>
                      </label>
                      <input 
                        type="date" 
                        className="form-control form-control-lg" 
                        id="dataConsulta"
                        value={dataConsulta}
                        onChange={(e) => setDataConsulta(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <button 
                      className="btn btn-info w-100 btn-lg"
                      onClick={handleConsultarCaixa}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Consultando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-search me-2"></i> Consultar Caixa
                        </>
                      )}
                    </button>
                    
                    {/* Informação sobre a consulta */}
                    <div className="mt-3">
                      <small className="text-muted">
                        <i className="bi bi-info-circle me-1"></i>
                        Consulte caixas abertos ou fechados em qualquer data
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status do Sistema */}
            <div className="row justify-content-center mt-4">
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header bg-dark text-white">
                    <h6 className="card-title mb-0">
                      <i className="bi bi-heart-pulse me-2"></i>
                      Status do Sistema
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <span><strong>Backend:</strong></span>
                          <span className={`badge ${statusBackend === 'Online' ? 'bg-success' : 'bg-danger'}`}>
                            {statusBackend}
                          </span>
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <span><strong>Banco de Dados:</strong></span>
                          <span className={`badge ${statusDatabase === 'Conectado' ? 'bg-success' : 'bg-warning'}`}>
                            {statusDatabase}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button 
                      className="btn btn-outline-primary btn-sm w-100"
                      onClick={verificarStatus}
                      disabled={loading}
                    >
                      <i className="bi bi-arrow-clockwise me-1"></i> Verificar Status
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="row justify-content-center mt-4">
              <div className="col-md-8">
                <div className="card border-secondary">
                  <div className="card-body text-center">
                    <h6 className="card-title">Como Funciona</h6>
                    <div className="row">
                      <div className="col-md-4">
                        <div className="p-3">
                          <i className="bi bi-cash-stack text-primary" style={{fontSize: '2rem'}}></i>
                          <h6 className="mt-2">Abrir Caixa</h6>
                          <small className="text-muted">
                            Inicie um novo caixa com valor inicial
                          </small>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3">
                          <i className="bi bi-search text-info" style={{fontSize: '2rem'}}></i>
                          <h6 className="mt-2">Consultar</h6>
                          <small className="text-muted">
                            Verifique caixas anteriores por data
                          </small>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3">
                          <i className="bi bi-graph-up text-success" style={{fontSize: '2rem'}}></i>
                          <h6 className="mt-2">Relatórios</h6>
                          <small className="text-muted">
                            Acompanhe vendas e retiradas
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}