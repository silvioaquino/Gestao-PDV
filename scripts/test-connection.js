const { PrismaClient } = require('@prisma/client')

async function test() {
  console.log('🧪 Iniciando teste de conexão...')
  
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  })

  try {
    console.log('1. Testando conexão básica...')
    await prisma.$connect()
    console.log('✅ Conectado ao banco')

    console.log('2. Testando query simples...')
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Query executada:', result)

    console.log('3. Verificando tabelas...')
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log('✅ Tabelas encontradas:', tables)

    console.log('4. Verificando caixas abertos...')
    const caixas = await prisma.caixaAbertura.findMany({
      where: { status: 'ABERTO' }
    })
    console.log(`✅ Caixas abertos: ${caixas.length}`)

    if (caixas.length === 0) {
      console.log('📝 Criando caixa de teste...')
      const novoCaixa = await prisma.caixaAbertura.create({
        data: {
          valorInicial: 100.00,
          observacao: 'Caixa automático para testes',
          status: 'ABERTO'
        }
      })
      console.log('✅ Caixa criado:', novoCaixa.id)
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error)
    console.error('Detalhes:', error.message)
  } finally {
    await prisma.$disconnect()
    console.log('🔌 Conexão fechada')
  }
}

test()