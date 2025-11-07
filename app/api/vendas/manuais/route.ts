import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const caixaId = searchParams.get('caixaId')

    let where = {}
    if (caixaId) {
      where = { caixaAberturaId: caixaId }
    }

    const vendasManuais = await prisma.vendaManual.findMany({
      where,
      orderBy: {
        dataVenda: 'desc'
      }
    })

    return NextResponse.json({ data: vendasManuais })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar vendas manuais' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tipo_pagamento, valor, descricao, caixa_abertura_id } = await request.json()

    const vendaManual = await prisma.vendaManual.create({
      data: {
        tipoPagamento: tipo_pagamento,
        valor: parseFloat(valor),
        descricao: descricao || '',
        caixaAberturaId: caixa_abertura_id
      }
    })

    return NextResponse.json({ data: vendaManual })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar venda manual' },
      { status: 500 }
    )
  }
}