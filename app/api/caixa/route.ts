import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const caixaAberto = await prisma.caixaAbertura.findFirst({
      where: { status: 'ABERTO' },
      include: {
        vendas: true,
        retiradas: true,
        vendasManuais: true
      }
    })

    return NextResponse.json({
      caixaAberto: !!caixaAberto,
      caixaAtual: caixaAberto
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao verificar estado do caixa' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { valor_inicial, observacao } = await request.json()

    const caixaExistente = await prisma.caixaAbertura.findFirst({
      where: { status: 'ABERTO' }
    })

    if (caixaExistente) {
      return NextResponse.json(
        { error: 'Já existe um caixa aberto' },
        { status: 400 }
      )
    }

    const caixa = await prisma.caixaAbertura.create({
      data: {
        valorInicial: parseFloat(valor_inicial),
        observacao: observacao || '',
        status: 'ABERTO'
      }
    })

    return NextResponse.json({ data: caixa })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao abrir caixa' },
      { status: 500 }
    )
  }
}