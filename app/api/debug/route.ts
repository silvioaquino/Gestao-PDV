import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const diagnostic: any = {
    timestamp: new Date().toISOString(),
    node_env: process.env.NODE_ENV,
    database_url: process.env.DATABASE_URL ? '✅ Configurada' : '❌ Não configurada'
  }

  try {
    // Testar conexão com banco
    await prisma.$queryRaw`SELECT 1`
    diagnostic.database_connection = '✅ Conectado'

    // Contar registros
    diagnostic.caixas_abertos = await prisma.caixaAbertura.count({ 
      where: { status: 'ABERTO' } 
    })
    diagnostic.total_vendas = await prisma.venda.count()
    diagnostic.total_caixas = await prisma.caixaAbertura.count()

    // Se não há caixa aberto, criar um
    if (diagnostic.caixas_abertos === 0) {
      const novoCaixa = await prisma.caixaAbertura.create({
        data: {
          valorInicial: 100.00,
          observacao: 'Caixa criado automaticamente pelo diagnóstico',
          status: 'ABERTO'
        }
      })
      diagnostic.caixa_criado = novoCaixa.id
      diagnostic.caixas_abertos = 1
    }

  } catch (error: any) {
    diagnostic.database_connection = '❌ Erro'
    diagnostic.database_error = error.message
  }

  return NextResponse.json(diagnostic)
}