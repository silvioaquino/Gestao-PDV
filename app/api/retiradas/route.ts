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

    const retiradas = await prisma.retirada.findMany({
      where,
      orderBy: {
        dataRetirada: 'desc'
      }
    })

    return NextResponse.json({ data: retiradas })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar retiradas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { valor, observacao, caixa_abertura_id } = await request.json()

    const retirada = await prisma.retirada.create({
      data: {
        valor: parseFloat(valor),
        observacao: observacao || '',
        caixaAberturaId: caixa_abertura_id
      }
    })

    return NextResponse.json({ data: retirada })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao criar retirada' },
      { status: 500 }
    )
  }
}