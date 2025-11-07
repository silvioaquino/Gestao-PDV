const fetch = require('node-fetch')

const testWebhook = async () => {
  const API_URL = 'http://localhost:3000'
  
  const pedidoTeste = {
    cliente: {
      nome: "Cliente Teste Direto",
      telefone: "(11) 99999-9999"
    },
    pedido: {
      tipo: "DELIVERY",
      endereco: "Rua Teste, 123 - São Paulo/SP",
      dataHora: new Date().toISOString(),
      valorTotal: 75.50
    },
    produtos: [
      {
        nome: "Pizza Calabresa",
        quantidade: 1,
        valor: 45.00,
        adicionais: ["Borda recheada"]
      },
      {
        nome: "Coca-Cola 2L", 
        quantidade: 1,
        valor: 10.00,
        adicionais: []
      },
      {
        nome: "Brownie",
        quantidade: 2,
        valor: 10.25,
        adicionais: ["Sorvete"]
      }
    ]
  }

  console.log('🧪 Enviando teste de webhook...')
  console.log('Dados:', JSON.stringify(pedidoTeste, null, 2))

  try {
    const response = await fetch(`${API_URL}/api/webhook/cardapio-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pedidoTeste)
    })

    const data = await response.json()
    
    console.log('\n📥 Resposta:')
    console.log('Status:', response.status)
    console.log('Dados:', JSON.stringify(data, null, 2))

    if (data.success) {
      console.log('✅ Webhook funcionou!')
      console.log('ID da Venda:', data.venda_id)
    } else {
      console.log('❌ Webhook falhou!')
      console.log('Erro:', data.error)
      console.log('Mensagem:', data.message)
    }

  } catch (error) {
    console.error('💥 Erro na requisição:', error.message)
  }
}

testWebhook()