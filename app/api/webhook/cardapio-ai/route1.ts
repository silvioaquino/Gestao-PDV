import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { WebhookCardapioAI } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const data: WebhookCardapioAI = await request.json()

    const caixaAberto = await prisma.caixaAbertura.findFirst({
      where: { status: 'ABERTO' }
    })

    if (!caixaAberto) {
      return NextResponse.json(
        { error: 'Nenhum caixa aberto para registrar a venda' },
        { status: 400 }
      )
    }

    const venda = await prisma.venda.create({
      data: {
        dadosPedido: data,
        valorTotal: data.pedido.valorTotal,
        tipoPagamento: 'PENDENTE',
        caixaAberturaId: caixaAberto.id
      }
    })

    return NextResponse.json({ data: venda })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    )
  }
}