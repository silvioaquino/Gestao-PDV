import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  let requestBody: any = null
  
  try {
    console.log('🔵 === WEBHOOK INICIADO ===')
    
    // Tentar obter o corpo da requisição
    try {
      requestBody = await request.json()
      console.log('📥 Dados recebidos:', JSON.stringify(requestBody, null, 2))
    } catch (parseError) {
      console.error('❌ Erro ao parsear JSON:', parseError)
      return NextResponse.json(
        { 
          success: false,
          error: 'JSON inválido',
          message: 'O corpo da requisição não é um JSON válido'
        },
        { status: 400 }
      )
    }

    // Verificar se o Prisma está funcionando
    console.log('🔍 Verificando conexão com o banco...')
    try {
      await prisma.$queryRaw`SELECT 1`
      console.log('✅ Conexão com banco OK')
    } catch (dbError) {
      console.error('❌ Erro na conexão com o banco:', dbError)
      return NextResponse.json(
        { 
          success: false,
          error: 'Erro de banco de dados',
          message: 'Não foi possível conectar ao banco de dados'
        },
        { status: 500 }
      )
    }

    // Verificar se há caixa aberto
    console.log('🔍 Buscando caixas abertos...')
    let caixaAberto
    try {
      caixaAberto = await prisma.caixaAbertura.findFirst({
        where: { status: 'ABERTO' }
      })
      console.log('📊 Caixa aberto encontrado:', caixaAberto ? `Sim (ID: ${caixaAberto.id})` : 'Não')
    } catch (error) {
      console.error('❌ Erro ao buscar caixa aberto:', error)
      return NextResponse.json(
        { 
          success: false,
          error: 'Erro ao verificar caixa',
          message: 'Erro interno ao verificar caixas abertos'
        },
        { status: 500 }
      )
    }

    if (!caixaAberto) {
      console.log('❌ Nenhum caixa aberto encontrado')
      return NextResponse.json(
        { 
          success: false,
          error: 'Nenhum caixa aberto',
          message: 'É necessário abrir um caixa antes de receber pedidos'
        },
        { status: 400 }
      )
    }

    // Processar os dados do webhook
    console.log('🔍 Processando dados do webhook...')
    let dadosVenda: any = {}
    
    // Verificar estrutura dos dados
    if (requestBody.cliente && requestBody.pedido && requestBody.produtos) {
      // Formato Cardápio.ai
      console.log('📋 Formato: Cardápio.ai')
      dadosVenda = {
        cliente: requestBody.cliente,
        pedido: requestBody.pedido,
        produtos: requestBody.produtos,
        origem: 'cardapio-ai',
        raw_data: requestBody // Salvar dados brutos para debug
      }
    } else if (requestBody.nome_cliente || requestBody.valor_total) {
      // Formato de teste simplificado
      console.log('📋 Formato: Teste simplificado')
      dadosVenda = {
        cliente: {
          nome: requestBody.nome_cliente || 'Cliente Teste',
          telefone: requestBody.telefone_cliente || '(11) 99999-9999'
        },
        pedido: {
          tipo: (requestBody.tipo_pedido || 'DELIVERY').toUpperCase(),
          endereco: requestBody.endereco_completo || '',
          dataHora: requestBody.data_hora_pedido || new Date().toISOString(),
          valorTotal: requestBody.valor_total || 0
        },
        produtos: requestBody.produtos || [],
        origem: 'teste',
        raw_data: requestBody
      }
    } else {
      console.log('❌ Formato desconhecido')
      return NextResponse.json(
        { 
          success: false,
          error: 'Formato de dados inválido',
          message: 'Os dados não seguem o formato esperado do Cardápio.ai'
        },
        { status: 400 }
      )
    }

    // Validar dados obrigatórios
    console.log('🔍 Validando dados...')
    if (!dadosVenda.pedido.valorTotal || dadosVenda.pedido.valorTotal <= 0) {
      console.log('❌ Valor total inválido:', dadosVenda.pedido.valorTotal)
      return NextResponse.json(
        { 
          success: false,
          error: 'Valor total inválido',
          message: 'O valor total do pedido deve ser maior que zero'
        },
        { status: 400 }
      )
    }

    console.log('✅ Dados validados:')
    console.log('   - Cliente:', dadosVenda.cliente.nome)
    console.log('   - Valor Total:', dadosVenda.pedido.valorTotal)
    console.log('   - Produtos:', dadosVenda.produtos.length)

    // Criar venda no banco
    console.log('💾 Tentando salvar venda no banco...')
    let venda
    try {
      venda = await prisma.venda.create({
        data: {
          dadosPedido: dadosVenda,
          valorTotal: parseFloat(dadosVenda.pedido.valorTotal),
          tipoPagamento: 'PENDENTE',
          caixaAberturaId: caixaAberto.id,
          manual: false
        }
      })
      console.log('✅ Venda salva com sucesso!')
      console.log('   - ID:', venda.id)
      console.log('   - Valor:', venda.valorTotal)
      console.log('   - Data:', venda.dataVenda)

    } catch (createError: any) {
      console.error('❌ Erro ao criar venda:', createError)
      console.error('   - Mensagem:', createError.message)
      console.error('   - Stack:', createError.stack)
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Erro ao salvar venda',
          message: createError.message,
          details: process.env.NODE_ENV === 'development' ? createError.stack : undefined
        },
        { status: 500 }
      )
    }

    // Verificar se a venda foi realmente salva
    console.log('🔍 Verificando se venda foi persistida...')
    try {
      const vendaVerificada = await prisma.venda.findUnique({
        where: { id: venda.id }
      })
      
      if (vendaVerificada) {
        console.log('✅ Venda confirmada no banco')
      } else {
        console.log('❌ Venda não encontrada após criação!')
      }
    } catch (verifyError) {
      console.error('❌ Erro ao verificar venda:', verifyError)
    }

    console.log('🎉 === WEBHOOK FINALIZADO COM SUCESSO ===')
    
    return NextResponse.json({ 
      success: true,
      message: 'Pedido recebido e registrado com sucesso',
      venda_id: venda.id,
      data: {
        id: venda.id,
        valorTotal: venda.valorTotal,
        dataVenda: venda.dataVenda,
        caixaId: venda.caixaAberturaId
      }
    })

  } catch (error: any) {
    console.error('💥 === ERRO GRAVE NO WEBHOOK ===')
    console.error('Erro:', error)
    console.error('Mensagem:', error.message)
    console.error('Stack:', error.stack)
    console.error('Request Body:', requestBody)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}