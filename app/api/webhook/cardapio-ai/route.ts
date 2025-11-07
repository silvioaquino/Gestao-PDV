import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  console.log('🎯 WEBHOOK CARDAPIO.AI CHAMADO')
  
  try {
    // 1. Obter dados da requisição
    const requestBody = await request.json()
    console.log('📥 Dados recebidos:', JSON.stringify(requestBody, null, 2))

    // 2. Verificar conexão com banco
    console.log('🔌 Testando conexão com banco...')
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Conexão com banco OK')

    // 3. Buscar caixa aberto
    console.log('📦 Buscando caixa aberto...')
    const caixaAberto = await prisma.caixaAbertura.findFirst({
      where: { 
        status: 'ABERTO' 
      }
    })

    if (!caixaAberto) {
      console.log('❌ NENHUM CAIXA ABERTO ENCONTRADO')
      return NextResponse.json(
        { 
          success: false,
          error: 'Nenhum caixa aberto',
          message: 'Abra um caixa no sistema PDV antes de enviar pedidos'
        },
        { status: 400 }
      )
    }

    console.log('✅ Caixa aberto encontrado:', caixaAberto.id)

    // 4. Processar dados do webhook
    console.log('🔄 Processando dados do webhook...')
    
    let dadosProcessados: any = {}
    let tipoPagamento = 'PENDENTE' // Default
    
    // Formato Cardápio.ai oficial
    if (requestBody.cliente && requestBody.pedido) {
      dadosProcessados = {
        cliente: requestBody.cliente,
        pedido: requestBody.pedido,
        produtos: requestBody.produtos || [],
        origem: 'cardapio-ai',
        webhook_received_at: new Date().toISOString()
      }
      
      // Tentar extrair tipo de pagamento do webhook
      if (requestBody.pedido.tipoPagamento) {
        tipoPagamento = requestBody.pedido.tipoPagamento.toUpperCase()
      } else if (requestBody.pedido.forma_pagamento) {
        tipoPagamento = requestBody.pedido.forma_pagamento.toUpperCase()
      } else if (requestBody.tipo_pagamento) {
        tipoPagamento = requestBody.tipo_pagamento.toUpperCase()
      }
    } 
    // Formato de teste alternativo
    else {
      dadosProcessados = {
        cliente: {
          nome: requestBody.nome_cliente || 'Cliente Não Identificado',
          telefone: requestBody.telefone_cliente || 'Não informado'
        },
        pedido: {
          tipo: (requestBody.tipo_pedido || 'DELIVERY').toUpperCase(),
          endereco: requestBody.endereco_completo || '',
          dataHora: requestBody.data_hora_pedido || new Date().toISOString(),
          valorTotal: requestBody.valor_total || 0
        },
        produtos: requestBody.produtos || [],
        origem: 'teste',
        webhook_received_at: new Date().toISOString()
      }
      
      // Extrair tipo de pagamento do formato de teste
      if (requestBody.tipo_pagamento) {
        tipoPagamento = requestBody.tipo_pagamento.toUpperCase()
      }
    }

    // Validar e mapear tipo de pagamento
    const tiposValidos = ['DINHEIRO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'PIX', 'OUTRO', 'PENDENTE', 'VR']
    
    // Mapear sinônimos comuns
    const mapeamentoTipos: { [key: string]: string } = {
      'CREDITO': 'CARTAO_CREDITO',
      'CRÉDITO': 'CARTAO_CREDITO',
      'DEBITO': 'CARTAO_DEBITO',
      'DÉBITO': 'CARTAO_DEBITO',
      'CARTAO': 'CARTAO_CREDITO',
      'CARTÃO': 'CARTAO_CREDITO',
      'DINHEIRO': 'DINHEIRO',
      'PIX': 'PIX',
      'DINHEIRO/PIX': 'PIX',
      'OUTROS': 'OUTRO',
      'VR': 'VR'
    }

    // Aplicar mapeamento se necessário
    if (mapeamentoTipos[tipoPagamento]) {
      tipoPagamento = mapeamentoTipos[tipoPagamento]
    }

    // Validar tipo de pagamento
    if (!tiposValidos.includes(tipoPagamento)) {
      console.log('⚠️ Tipo de pagamento inválido ou não especificado, usando PENDENTE:', tipoPagamento)
      tipoPagamento = 'PENDENTE'
    }

    // Validar valor total
    const valorTotal = parseFloat(dadosProcessados.pedido.valorTotal)
    if (isNaN(valorTotal) || valorTotal <= 0) {
      console.log('❌ Valor total inválido:', dadosProcessados.pedido.valorTotal)
      return NextResponse.json(
        { 
          success: false,
          error: 'Valor total inválido',
          message: 'O valor total do pedido deve ser um número maior que zero'
        },
        { status: 400 }
      )
    }

    console.log('✅ Dados processados:')
    console.log('   - Cliente:', dadosProcessados.cliente.nome)
    console.log('   - Valor Total:', valorTotal)
    console.log('   - Tipo Pagamento:', tipoPagamento)
    console.log('   - Produtos:', dadosProcessados.produtos.length)

    // 5. SALVAR NO BANCO
    console.log('💾 SALVANDO VENDA NO BANCO...')
    
    const vendaData = {
      dadosPedido: dadosProcessados,
      valorTotal: valorTotal,
      tipoPagamento: tipoPagamento,
      caixaAberturaId: caixaAberto.id,
      manual: false,
      dataVenda: new Date()
    }

    console.log('   Dados da venda:', JSON.stringify(vendaData, null, 2))

    try {
      const venda = await prisma.venda.create({
        data: vendaData
      })

      console.log('🎉 VENDA SALVA COM SUCESSO!')
      console.log('   - ID:', venda.id)
      console.log('   - Valor:', venda.valorTotal)
      console.log('   - Tipo Pagamento:', venda.tipoPagamento)
      console.log('   - Data:', venda.dataVenda)

      return NextResponse.json({ 
        success: true,
        message: 'Pedido registrado com sucesso',
        venda_id: venda.id,
        data: {
          id: venda.id,
          valorTotal: venda.valorTotal,
          tipoPagamento: venda.tipoPagamento,
          dataVenda: venda.dataVenda,
          caixaId: venda.caixaAberturaId
        }
      })

    } catch (dbError: any) {
      console.error('💥 ERRO AO SALVAR NO BANCO:', dbError)
      console.error('   - Mensagem:', dbError.message)
      console.error('   - Código:', dbError.code)
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Erro ao salvar no banco',
          message: dbError.message,
          code: dbError.code
        },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('💥 ERRO GRAVE NO WEBHOOK:')
    console.error('   - Mensagem:', error.message)
    console.error('   - Stack:', error.stack)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
      },
      { status: 500 }
    )
  }
}