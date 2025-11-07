const { PrismaClient } = require('@prisma/client');

async function checkDatabase() {
  console.log('🔍 VERIFICANDO BANCO DE DADOS');
  
  const prisma = new PrismaClient();

  try {
    // Verificar caixas
    const caixas = await prisma.caixaAbertura.findMany({
      orderBy: { dataAbertura: 'desc' }
    });
    
    console.log(`\n📊 CAIXAS (${caixas.length}):`);
    caixas.forEach(caixa => {
      console.log(`   - ${caixa.id.substring(0, 8)}: ${caixa.status} | R$ ${caixa.valorInicial} | ${caixa.dataAbertura}`);
    });

    // Verificar vendas
    const vendas = await prisma.venda.findMany({
      orderBy: { dataVenda: 'desc' },
      take: 10
    });
    
    console.log(`\n🛒 VENDAS (${vendas.length}):`);
    vendas.forEach(venda => {
      console.log(`   - ${venda.id.substring(0, 8)}: R$ ${venda.valorTotal} | ${venda.tipoPagamento} | ${venda.dataVenda}`);
    });

    // Verificar se há caixa aberto
    const caixaAberto = await prisma.caixaAbertura.findFirst({
      where: { status: 'ABERTO' }
    });
    
    console.log(`\n🎯 CAIXA ABERTO: ${caixaAberto ? 'SIM' : 'NÃO'}`);
    if (caixaAberto) {
      console.log(`   - ID: ${caixaAberto.id}`);
      console.log(`   - Valor Inicial: R$ ${caixaAberto.valorInicial}`);
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();