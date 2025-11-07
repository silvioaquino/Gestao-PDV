const { PrismaClient } = require('@prisma/client')
const fetch = require('node-fetch')

async function debugWebhookFlow() {
  console.log('🔍 INICIANDO DIAGNÓSTICO DO WEBHOOK')
  
  const prisma = new PrismaClient()
  const API_URL = 'http://localhost:3000'

  try {
    // 1. Verificar estado atual do banco
    console.log('\n1. 📊 VERIFICANDO BANCO DE DADOS:')
    
    const caixasAbertos = await prisma.caixaAbertura.findMany({
      where: { status: 'ABERTO' }
    })
    
    console.log(`   Caixas abertos: ${caixasAbertos.length}`)
    if (caixasAbertos.length > 0) {
      console.log('   ✅ Há caixa aberto:', caixasAbertos[0].id)
    } else {
      console.log('   ❌ Nenhum caixa aberto encontrado')
    }

    const totalVendas = await prisma.venda.count()
    console.log(`   Total de vendas no banco: ${totalVendas}`)

    // 2. Enviar webhook de teste
    console.log('\n2. 📨 ENVIANDO WEBHOOK DE TESTE:')
    
    const webhookData = {
      cliente: {
        nome: "Cliente Diagnóstico",
        telefone: "(11) 98888-7777"
      },
      pedido: {
        tipo: "DELIVERY",
        endereco: "Rua Diagnóstico, 456",
        dataHora: new Date().toISOString(),
        valorTotal: 99.99
      },
      produtos: [
        {
          nome: "Produto Diagnóstico",
          quantidade: 1,
          valor: 99.99,
          adicionais: ["Teste"]
        }
      ]
    }

    console.log('   Dados enviados:', JSON.stringify(webhookData, null, 2))

    const response = await fetch(`${API_URL}/api/webhook/cardapio-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    })

    const responseData = await response.json()
    console.log('   Resposta do servidor:')
    console.log('   - Status:', response.status)
    console.log('   - Success:', responseData.success)
    console.log('   - Message:', responseData.message)
    console.log('   - Venda ID:', responseData.venda_id)
    if (responseData.error) {
      console.log('   - Error:', responseData.error)
    }

    // 3. Verificar se a venda foi criada
    console.log('\n3. 🔍 VERIFICANDO SE VENDA FOI CRIADA:')
    
    if (responseData.venda_id) {
      const vendaCriada = await prisma.venda.findUnique({
        where: { id: responseData.venda_id }
      })
      
      if (vendaCriada) {
        console.log('   ✅ Venda encontrada no banco:')
        console.log('   - ID:', vendaCriada.id)
        console.log('   - Valor:', vendaCriada.valorTotal)
        console.log('   - Caixa ID:', vendaCriada.caixaAberturaId)
        console.log('   - Data:', vendaCriada.dataVenda)
      } else {
        console.log('   ❌ Venda NÃO encontrada no banco pelo ID retornado')
      }
    }

    // 4. Listar todas as vendas recentes
    console.log('\n4. 📈 LISTANDO TODAS AS VENDAS:')
    
    const todasVendas = await prisma.venda.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        caixaAbertura: {
          select: { status: true, id: true }
        }
      }
    })

    console.log(`   Últimas ${todasVendas.length} vendas:`)
    todasVendas.forEach(venda => {
      console.log(`   - ${venda.id}: R$ ${venda.valorTotal} (${venda.tipoPagamento}) - Caixa: ${venda.caixaAbertura.status} - ${venda.createdAt}`)
    })

    // 5. Verificar estrutura dos dados salvos
    console.log('\n5. 🗂️  VERIFICANDO ESTRUTURA DOS DADOS:')
    
    if (todasVendas.length > 0) {
      const ultimaVenda = todasVendas[0]
      console.log('   Dados da última venda:')
      console.log('   - Tipo de dadosPedido:', typeof ultimaVenda.dadosPedido)
      
      if (ultimaVenda.dadosPedido && typeof ultimaVenda.dadosPedido === 'object') {
        console.log('   - Cliente:', ultimaVenda.dadosPedido.cliente?.nome || 'N/A')
        console.log('   - Origem:', ultimaVenda.dadosPedido.origem || 'N/A')
      }
    }

  } catch (error) {
    console.error('💥 ERRO NO DIAGNÓSTICO:', error)
  } finally {
    await prisma.$disconnect()
    console.log('\n🔚 DIAGNÓSTICO FINALIZADO')
  }
}

debugWebhookFlow()