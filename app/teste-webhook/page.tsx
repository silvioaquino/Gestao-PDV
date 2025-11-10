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
    
    // NOVA ESTRUTURA compatível com Cardápio.ai atualizado
    const pedido = {
      nomeCliente: "Cliente Teste " + Math.floor(Math.random() * 1000),
      telefoneCliente: "(11) 9" + Math.floor(Math.random() * 9000 + 1000) + "-" + Math.floor(Math.random() * 9000 + 1000),
      tipoPedido: (document.getElementById('tipoPedido') as HTMLSelectElement)?.value === 'delivery' 
        ? 'Pedido Delivery' 
        : (document.getElementById('tipoPedido') as HTMLSelectElement)?.value === 'retirada'
        ? 'Pedido Retirada'
        : 'Pedido Mesa',
      endereco: (document.getElementById('tipoPedido') as HTMLSelectElement)?.value === 'delivery' 
        ? 'Rua Veneza, 97 - Centro, Paulista - CEP 53427-430' 
        : '',
      dataCompra: new Date().toLocaleDateString('pt-BR'),
      valorCompra: parseFloat((document.getElementById('valorTotal') as HTMLInputElement)?.value || '40.00'),
      tipoPagamento: (document.getElementById('tipoPagamento') as HTMLSelectElement)?.value || 'DINHEIRO',
      produtos: [
        {
          nome: "Eco: Carne Guisada",
          quantidade: "1",
          valor: 15.00,
          adicionais: [
            {
              nome: "Macassar",
              quantidade: 1,
              valor: 0
            }
          ]
        },
        {
          nome: "Suco Natural de Laranja", 
          quantidade: "2",
          valor: 12.50,
          adicionais: [
            {
              nome: "Açúcar",
              quantidade: 1,
              valor: 0
            },
            {
              nome: "Gelo",
              quantidade: 1,
              valor: 0.50
            }
          ]
        }
      ]
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
            <strong>Cliente:</strong> ${data.data.nomeCliente}<br>
            <strong>Valor Total:</strong> R$ ${data.data.valorTotal}<br>
            <strong>Tipo Pagamento:</strong> ${data.data.tipoPagamento}<br>
            <strong>Produtos:</strong> ${data.data.produtosCount || 0}
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

  const enviarWebhookFormatoAntigo = async () => {
    setLoading(true)
    
    // Formato antigo mantido para compatibilidade
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
      tipo_pagamento: (document.getElementById('tipoPagamento') as HTMLSelectElement)?.value || 'DINHEIRO'
    }

    try {
      console.log('📤 Enviando webhook formato antigo...', pedido)

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
            <strong>Cliente:</strong> ${data.data.nomeCliente}<br>
            <strong>Valor Total:</strong> R$ ${data.data.valorTotal}<br>
            <strong>Tipo Pagamento:</strong> ${data.data.tipoPagamento}
          ` : ''}
        </div>
        <hr>
        <strong>Dados Enviados (Formato Antigo):</strong>
        <pre class="mt-2 p-2 bg-light rounded">${JSON.stringify(pedido, null, 2)}</pre>
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

  const verificarStatus = async () => {
    setStatusLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/webhook/cardapio-ai`)
      const data = await response.json()
      
      setStatus(`
        <div class="alert alert-success">
          <strong>Webhook Status:</strong> ✅ Funcionando<br>
          <strong>Mensagem:</strong> ${data.message}<br>
          <strong>Timestamp:</strong> ${new Date(data.timestamp).toLocaleString()}
          ${data.exemplo_novo_formato ? `
            <hr>
            <strong>Exemplo Nova Estrutura:</strong>
            <pre class="mt-2 p-2 bg-light rounded small">${JSON.stringify(data.exemplo_novo_formato, null, 2)}</pre>
          ` : ''}
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
      <h1>🧪 Teste de Webhook - Nova Estrutura</h1>
      <p>Envie pedidos de teste para o servidor PDV usando a nova estrutura do Cardápio.ai</p>

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
                  defaultValue="40.00" 
                  step="0.01"
                />
              </div>
              
              <div className="d-grid gap-2">
                <button 
                  className="btn btn-primary" 
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
                      📤 Enviar Nova Estrutura
                    </>
                  )}
                </button>
                
                <button 
                  className="btn btn-outline-secondary" 
                  onClick={enviarWebhookFormatoAntigo}
                  disabled={loading}
                >
                  🔄 Enviar Formato Antigo
                </button>
              </div>
              
              <div className="mt-3 p-2 bg-info text-dark rounded small">
                <strong>💡 Informação:</strong> A nova estrutura inclui:
                <ul className="mb-0 mt-1">
                  <li>Campos diretos (nomeCliente, telefoneCliente, etc.)</li>
                  <li>Data no formato brasileiro (DD/MM/YYYY)</li>
                  <li>Adicionais como objetos com nome, quantidade e valor</li>
                </ul>
              </div>
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
                    🔍 Verificar Status do Webhook
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