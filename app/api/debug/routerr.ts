import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const caixasAbertos = await prisma.caixaAbertura.findMany({
      where: { status: 'ABERTO' },
      include: {
        vendas: true,
        retiradas: true
      }
    })

    const totalVendas = await prisma.venda.count()
    const totalCaixas = await prisma.caixaAbertura.count()

    return NextResponse.json({
      status: 'online',
      database: 'connected',
      caixasAbertos: caixasAbertos.length,
      totalCaixas,
      totalVendas,
      caixas: caixasAbertos.map(caixa => ({
        id: caixa.id,
        valorInicial: caixa.valorInicial,
        vendas: caixa.vendas.length,
        retiradas: caixa.retiradas.length,
        dataAbertura: caixa.dataAbertura
      })),
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'online',
      database: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}