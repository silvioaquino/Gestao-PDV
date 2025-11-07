const { PrismaClient } = require('@prisma/client')

async function checkDatabase() {
  console.log('🔍 Verificando estado do banco...')
  
  const prisma = new PrismaClient()

  try {
    // 1. Verificar caixas
    console.log('\n📊 CAIXAS:')
    const caixas = await prisma.caixaAbertura.findMany({
      orderBy: { dataAbertura: 'desc' },
      take: 5
    })
    
    console.log(`Total de caixas: ${caixas.length}`)
    caixas.forEach(caixa => {
      console.log(`- ${caixa.id}: ${caixa.status} (R$ ${caixa.valorInicial}) - ${caixa.dataAbertura}`)
    })

    // 2. Verificar vendas
    console.log('\n🛒 VENDAS:')
    const vendas = await prisma.venda.findMany({
      orderBy: { dataVenda: 'desc' },
      take: 10,
      include: {
        caixaAbertura: true
      }
    })
    
    console.log(`Total de vendas: ${vendas.length}`)
    vendas.forEach(venda => {
      console.log(`- ${venda.id}: R$ ${venda.valorTotal} (${venda.tipoPagamento}) - Caixa: ${venda.caixaAbertura.status} - ${venda.dataVenda}`)
      
      // Mostrar alguns dados do pedido
      if (venda.dadosPedido && typeof venda.dadosPedido === 'object') {
        const dados = venda.dadosPedido
        if (dados.cliente) {
          console.log(`  Cliente: ${dados.cliente.nome}`)
        }
        if (dados.pedido) {
          console.log(`  Valor: R$ ${dados.pedido.valorTotal}`)
        }
      }
    })

    // 3. Verificar schema
    console.log('\n🗃️  SCHEMA:')
    const tableCounts = await prisma.$queryRaw`
      SELECT table_name, 
             (SELECT count(*) FROM information_schema.tables t2 
              WHERE t2.table_schema = 'public' AND t2.table_name = t1.table_name) as exists
      FROM information_schema.tables t1
      WHERE table_schema = 'public' 
      AND table_name IN ('caixa_abertura', 'vendas', 'vendas_manuais', 'retiradas', 'caixa_fechamento')
    `
    console.log('Tabelas existentes:', tableCounts)

  } catch (error) {
    console.error('❌ Erro:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()