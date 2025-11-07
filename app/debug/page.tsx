'use client'

import { useState } from 'react'

export default function DebugPage() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runDiagnostics = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug')
      const data = await response.json()
      setResults(data)
    } catch (error) {
      setResults({ error: error instanceof Error ? error.message : 'Erro desconhecido' })
    } finally {
      setLoading(false)
    }
  }

  const testWebhook = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/webhook/cardapio-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true, message: 'Teste simples' })
      })
      const data = await response.json()
      setResults(data)
    } catch (error) {
      setResults({ error: error instanceof Error ? error.message : 'Erro desconhecido' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mt-4">
      <h1>🐛 Diagnóstico do Sistema</h1>
      
      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Testes</h5>
            </div>
            <div className="card-body">
              <button 
                className="btn btn-primary w-100 mb-2"
                onClick={runDiagnostics}
                disabled={loading}
              >
                {loading ? 'Testando...' : '🧪 Executar Diagnóstico'}
              </button>
              
              <button 
                className="btn btn-secondary w-100"
                onClick={testWebhook}
                disabled={loading}
              >
                {loading ? 'Testando...' : '📨 Testar Webhook Simples'}
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Resultados</h5>
            </div>
            <div className="card-body">
              {results ? (
                <pre style={{ background: '#f8f9fa', padding: '15px', borderRadius: '5px' }}>
                  {JSON.stringify(results, null, 2)}
                </pre>
              ) : (
                <p>Execute um teste para ver os resultados...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header">
          <h5 className="card-title mb-0">Próximos Passos</h5>
        </div>
        <div className="card-body">
          <ol>
            <li>Execute o diagnóstico acima</li>
            <li>Verifique se o banco está conectado</li>
            <li>Teste o webhook simples</li>
            <li>Se funcionar, teste na página de webhook completa</li>
          </ol>
        </div>
      </div>
    </div>
  )
}