import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const data = searchParams.get('data')

    if (!data) {
      return NextResponse.json(
        { error: 'Data é obrigatória' },
        { status: 400 }
      )
    }

    // Converter a data para o formato YYYY-MM-DD
    const dataConsulta = new Date(data)
    if (isNaN(dataConsulta.getTime())) {
      return NextResponse.json(
        { error: 'Data inválida' },
        { status: 400 }
      )
    }

    const dataInicio = new Date(dataConsulta)
    dataInicio.setHours(0, 0, 0, 0)

    const dataFim = new Date(dataConsulta)
    dataFim.setHours(23, 59, 59, 999)

    console.log('Consultando caixa para data:', dataInicio.toISOString(), 'até', dataFim.toISOString())

    // Buscar caixas abertos ou fechados na data selecionada
    const caixas = await prisma.caixaAbertura.findMany({
      where: {
        dataAbertura: {
          gte: dataInicio,
          lte: dataFim
        }
      },
      orderBy: {
        dataAbertura: 'desc'
      },
      include: {
        vendas: true,
        vendasManuais: true,
        retiradas: true,
        fechamento: true
      }
    })

    if (!caixas || caixas.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Nenhum caixa encontrado para esta data' 
        },
        { status: 404 }
      )
    }

    // Para simplificar, vamos pegar o primeiro caixa da data
    const caixa = caixas[0]
    console.log('Caixa encontrado:', caixa.id)

    // Cálculos baseados no modal de fechar caixa
    const valorAbertura = caixa.valorInicial || 0
    
    // Vendas em dinheiro (sistema + manual)
    const vendasDinheiroSistema = caixa.vendas
      .filter(v => v.tipoPagamento === 'DINHEIRO')
      .reduce((total, v) => total + (v.valorTotal || 0), 0)
    
    const vendasDinheiroManuais = caixa.vendasManuais
      .filter(v => v.tipoPagamento === 'DINHEIRO')
      .reduce((total, v) => total + (v.valor || 0), 0)
    
    const vendasDinheiro = vendasDinheiroSistema + vendasDinheiroManuais

    // Totais gerais
    const totalVendasSistema = caixa.vendas.reduce((total, v) => total + (v.valorTotal || 0), 0)
    const totalVendasManuais = caixa.vendasManuais.reduce((total, v) => total + (v.valor || 0), 0)
    const totalGeralVendas = totalVendasSistema + totalVendasManuais

    const totalRetiradas = caixa.retiradas.reduce((total, r) => total + (r.valor || 0), 0)
    const saldoFinal = valorAbertura + vendasDinheiro - totalRetiradas

    // Vendas por tipo de pagamento
    const tiposPagamento = ['DINHEIRO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'PIX', 'OUTRO']
    const vendasPorFormaPagamento: { [key: string]: number } = {}

    tiposPagamento.forEach(tipo => {
      const vendasSistema = caixa.vendas
        .filter(v => v.tipoPagamento === tipo)
        .reduce((total, v) => total + (v.valorTotal || 0), 0)
      
      const vendasManuaisTipo = caixa.vendasManuais
        .filter(v => v.tipoPagamento === tipo)
        .reduce((total, v) => total + (v.valor || 0), 0)
      
      vendasPorFormaPagamento[tipo] = vendasSistema + vendasManuaisTipo
    })

    // Montar resposta com estrutura similar ao modal de fechar caixa
    const dadosCaixa = {
      id: caixa.id,
      dataAbertura: caixa.dataAbertura.toISOString(),
      dataFechamento: caixa.fechamento?.dataFechamento.toISOString(),
      valorAbertura: valorAbertura,
      observacao: caixa.observacao,
      status: caixa.status,
      
      // Resumo financeiro
      valor_abertura: valorAbertura,
      vendas_dinheiro: vendasDinheiro,
      total_vendas: totalGeralVendas,
      total_retiradas: totalRetiradas,
      saldo_final: saldoFinal,
      
      // Detalhamento
      vendas_por_forma_pagamento: vendasPorFormaPagamento,
      retiradas: caixa.retiradas.map(retirada => ({
        data: retirada.dataRetirada.toISOString(),
        valor: retirada.valor,
        observacao: retirada.observacao || ''
      })),

      // Dados do fechamento se existir
      fechamento: caixa.fechamento ? {
        data_fechamento: caixa.fechamento.dataFechamento.toISOString(),
        valor_abertura: caixa.fechamento.valorAbertura,
        total_vendas: caixa.fechamento.totalVendas,
        retiradas: caixa.fechamento.retiradas,
        saldo_final: caixa.fechamento.saldoFinal,
        observacoes: caixa.fechamento.observacoes
      } : null,

      // Dados adicionais para debug
      total_vendas_sistema: totalVendasSistema,
      total_vendas_manuais: totalVendasManuais,
      quantidade_vendas: caixa.vendas.length,
      quantidade_vendas_manuais: caixa.vendasManuais.length,
      quantidade_retiradas: caixa.retiradas.length
    }

    console.log('Dados do caixa preparados:', {
      id: caixa.id,
      status: caixa.status,
      valorAbertura,
      totalVendas: totalGeralVendas,
      totalRetiradas,
      saldoFinal,
      quantidadeVendas: caixa.vendas.length,
      quantidadeVendasManuais: caixa.vendasManuais.length,
      quantidadeRetiradas: caixa.retiradas.length,
      temFechamento: !!caixa.fechamento
    })

    return NextResponse.json({ 
      success: true, 
      data: dadosCaixa 
    })

  } catch (error) {
    console.error('Erro geral na consulta de caixa:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}