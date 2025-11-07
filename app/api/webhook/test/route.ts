import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Verificar se há caixa aberto
    const caixaAberto = await prisma.caixaAbertura.findFirst({
      where: { status: 'ABERTO' }
    })

    if (!caixaAberto) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Nenhum caixa aberto para registrar a venda' 
        },
        { status: 400 }
      )
    }

    // Criar venda de teste
    const venda = await prisma.venda.create({
      data: {
        dadosPedido: data,
        valorTotal: data.valor_total,
        tipoPagamento: data.tipo_pagamento || 'PENDENTE',
        caixaAberturaId: caixaAberto.id
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Pedido de teste recebido com sucesso',
      venda_id: venda.id,
      data: venda
    })
  } catch (error) {
    console.error('Erro ao processar webhook de teste:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
}