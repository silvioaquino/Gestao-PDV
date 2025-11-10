'use client'

import { useState } from 'react'

export default function TesteWebhook() {
  const [resposta, setResposta] = useState<string>('<em>Nenhuma resposta ainda...</em>')
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)

  const API_URL = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : ''

  const enviarWebhook = async () => {
  setLoading(true)
  
  // Estrutura compatível com Cardápio.ai
  const pedido = {
    cliente: {
      nome: "Cliente Teste " + Math.floor(Math.random() * 1000),
      telefone: "(11) 9" + Math.floor(Math.random() * 9000 + 1000) + "-" + Math.floor(Math.random() * 9000 + 1000)
    },
    pedido: {
      tipo: ((document.getElementById('tipoPedido') as HTMLSelectElement)?.value || 'delivery').toUpperCase(),
      endereco: (document.getElementById('tipoPedido') as HTMLSelectElement)?.value === 'delivery' 
        ? 'Rua Teste, 123 - São Paulo/SP' : undefined,
      dataHora: new Date().toISOString(),
      valorTotal: parseFloat((document.getElementById('valorTotal') as HTMLInputElement)?.value || '45.50'),
      // Incluir tipo de pagamento no pedido
      tipoPagamento: (document.getElementById('tipoPagamento') as HTMLSelectElement)?.value || 'DINHEIRO'
    },
    produtos: [
      {
        nome: "Produto Teste A",
        quantidade: 1,
        valor: 25.00,
        adicionais: ["Extra 1"]
      },
      {
        nome: "Produto Teste B", 
        quantidade: 2,
        valor: 10.25,
        adicionais: []
      }
    ],
    // Também incluir no nível raiz para compatibilidade
    tipo_pagamento: (document.getElementById('tipoPagamento') as HTMLSelectElement)?.value || 'DINHEIRO'
  }

  try {
    console.log('📤 Enviando webhook...', pedido)

    const response = await fetch(`${API_URL}/api/webhook/cardapio-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pedido)
    })

    const data = await response.json()
    
    console.log('📥 Resposta do servidor:', data)

    setResposta(`
      <div class="${response.ok ? 'alert alert-success' : 'alert alert-danger'}">
        <strong>Status HTTP:</strong> ${response.status}<br>
        <strong>Sucesso:</strong> ${data.success ? '✅ Sim' : '❌ Não'}<br>
        <strong>Mensagem:</strong> ${data.message || data.error}<br>
        ${data.venda_id ? `<strong>ID Venda:</strong> ${data.venda_id}` : ''}
        ${data.data ? `
          <strong>Valor Total:</strong> R$ ${data.data.valorTotal}<br>
          <strong>Tipo Pagamento:</strong> ${data.data.tipoPagamento}
        ` : ''}
      </div>
      <hr>
      <strong>Dados Enviados:</strong>
      <pre class="mt-2 p-2 bg-light rounded">${JSON.stringify(pedido, null, 2)}</pre>
      ${data.stack ? `
        <hr>
        <strong>Detalhes do Erro (Desenvolvimento):</strong>
        <pre class="mt-2 p-2 bg-danger text-white rounded">${data.stack}</pre>
      ` : ''}
    `)

  } catch (error: any) {
    console.error('❌ Erro na requisição:', error)
    setResposta(`
      <div class="alert alert-danger">
        <strong>Erro de Conexão:</strong> ${error.message}
      </div>
    `)
  } finally {
    setLoading(false)
  }
}
  
    /*const enviarWebhook = async () => {
    setLoading(true)
    
    const pedido = {
      nome_cliente: "Cliente Teste " + Math.floor(Math.random() * 1000),
      telefone_cliente: "(11) 9" + Math.floor(Math.random() * 9000 + 1000) + "-" + Math.floor(Math.random() * 9000 + 1000),
      tipo_pedido: (document.getElementById('tipoPedido') as HTMLSelectElement)?.value || 'delivery',
      endereco_completo: (document.getElementById('tipoPedido') as HTMLSelectElement)?.value === 'delivery' 
        ? 'Rua Teste, 123 - São Paulo/SP' : '',
      data_hora_pedido: new Date().toISOString(),
      valor_total: parseFloat((document.getElementById('valorTotal') as HTMLInputElement)?.value || '45.50'),
      tipo_pagamento: (document.getElementById('tipoPagamento') as HTMLSelectElement)?.value || 'DINHEIRO',
      produtos: [
        {
          nome_produto: "Produto Teste A",
          quantidade: 1,
          valor: 25.00,
          adicionais: ["Extra 1"],
          complementos: ["Observação teste"]
        },
        {
          nome_produto: "Produto Teste B", 
          quantidade: 2,
          valor: 10.25,
          adicionais: [],
          complementos: []
        }
      ]
    }

    try {
      const response = await fetch(`${API_URL}/api/webhook/cardapio-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pedido)
      })

      const data = await response.json()
      
      setResposta(`
        <strong>Status:</strong> ${response.status}<br>
        <strong>Sucesso:</strong> ${response.ok}<br>
        <strong>Mensagem:</strong> ${data.error || 'Pedido recebido com sucesso'}<br>
        ${data.data?.id ? `<strong>ID Venda:</strong> ${data.data.id}` : ''}
        <hr>
        <strong>Dados Enviados:</strong>
        <pre>${JSON.stringify(pedido, null, 2)}</pre>
      `)

    } catch (error: any) {
      setResposta(`
        <strong>Erro:</strong> ${error.message}
      `)
    } finally {
      setLoading(false)
    }
  }*/

  const verificarStatus = async () => {
    setStatusLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/health`)
      const data = await response.json()
      
      setStatus(`
        <div class="alert alert-success">
          <strong>Backend:</strong> ${data.status}<br>
          <strong>Banco:</strong> ${data.database}<br>
          <strong>Timestamp:</strong> ${new Date(data.timestamp).toLocaleString()}
        </div>
      `)
    } catch (error: any) {
      setStatus(`
        <div class="alert alert-danger">
          <strong>Erro:</strong> Não foi possível conectar ao servidor: ${error.message}
        </div>
      `)
    } finally {
      setStatusLoading(false)
    }
  }

  return (
    <div className="container mt-4">
      <h1>🧪 Teste de Webhook</h1>
      <p>Envie pedidos de teste para o servidor PDV</p>

      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Dados do Pedido</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Tipo de Pedido</label>
                <select className="form-select" id="tipoPedido">
                  <option value="delivery">Delivery</option>
                  <option value="retirada">Retirada</option>
                  <option value="mesa">Mesa</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Tipo de Pagamento</label>
                <select className="form-select" id="tipoPagamento">
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                  <option value="CARTAO_DEBITO">Cartão de Débito</option>
                  <option value="PIX">PIX</option>
                  <option value="VR">VR</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Valor Total</label>
                <input 
                  type="number" 
                  className="form-control" 
                  id="valorTotal" 
                  defaultValue="45.50" 
                  step="0.01"
                />
              </div>
              <button 
                className="btn btn-primary w-100" 
                onClick={enviarWebhook}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Enviando...
                  </>
                ) : (
                  <>
                    📤 Enviar Pedido de Teste
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Resposta do Servidor</h5>
            </div>
            <div className="card-body">
              <div 
                id="resposta" 
                className="response" 
                style={{ background: '#f8f9fa', padding: '15px', borderRadius: '5px', minHeight: '200px' }}
                dangerouslySetInnerHTML={{ __html: resposta }}
              />
            </div>
          </div>

          <div className="card mt-4">
            <div className="card-header">
              <h5 className="card-title mb-0">Status do Sistema</h5>
            </div>
            <div className="card-body">
              <button 
                className="btn btn-outline-secondary w-100" 
                onClick={verificarStatus}
                disabled={statusLoading}
              >
                {statusLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Verificando...
                  </>
                ) : (
                  <>
                    🔍 Verificar Status
                  </>
                )}
              </button>
              <div 
                id="status" 
                className="mt-2"
                dangerouslySetInnerHTML={{ __html: status }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}