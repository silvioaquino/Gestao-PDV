-- CreateTable
CREATE TABLE "caixa_abertura" (
    "id" TEXT NOT NULL,
    "dataAbertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valorInicial" DOUBLE PRECISION NOT NULL,
    "observacao" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ABERTO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "caixa_abertura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendas" (
    "id" TEXT NOT NULL,
    "dataVenda" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dadosPedido" JSONB NOT NULL,
    "tipoPagamento" TEXT NOT NULL DEFAULT 'PENDENTE',
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "manual" BOOLEAN NOT NULL DEFAULT false,
    "caixaAberturaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nomeCliente" TEXT,
    "telefoneCliente" TEXT,
    "tipoPedido" TEXT,
    "endereco" TEXT,

    CONSTRAINT "vendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendas_manuais" (
    "id" TEXT NOT NULL,
    "dataVenda" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipoPagamento" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "descricao" TEXT,
    "caixaAberturaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendas_manuais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retiradas" (
    "id" TEXT NOT NULL,
    "dataRetirada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valor" DOUBLE PRECISION NOT NULL,
    "observacao" TEXT,
    "caixaAberturaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retiradas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caixa_fechamento" (
    "id" TEXT NOT NULL,
    "dataFechamento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valorAbertura" DOUBLE PRECISION NOT NULL,
    "totalVendas" DOUBLE PRECISION NOT NULL,
    "retiradas" DOUBLE PRECISION NOT NULL,
    "saldoFinal" DOUBLE PRECISION NOT NULL,
    "observacoes" TEXT,
    "caixaAberturaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "caixa_fechamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "caixa_abertura_status_idx" ON "caixa_abertura"("status");

-- CreateIndex
CREATE INDEX "caixa_abertura_dataAbertura_idx" ON "caixa_abertura"("dataAbertura");

-- CreateIndex
CREATE INDEX "vendas_dataVenda_idx" ON "vendas"("dataVenda");

-- CreateIndex
CREATE INDEX "vendas_caixaAberturaId_idx" ON "vendas"("caixaAberturaId");

-- CreateIndex
CREATE INDEX "vendas_tipoPagamento_idx" ON "vendas"("tipoPagamento");

-- CreateIndex
CREATE INDEX "vendas_nomeCliente_idx" ON "vendas"("nomeCliente");

-- CreateIndex
CREATE INDEX "vendas_tipoPedido_idx" ON "vendas"("tipoPedido");

-- CreateIndex
CREATE INDEX "vendas_manuais_caixaAberturaId_idx" ON "vendas_manuais"("caixaAberturaId");

-- CreateIndex
CREATE INDEX "vendas_manuais_tipoPagamento_idx" ON "vendas_manuais"("tipoPagamento");

-- CreateIndex
CREATE INDEX "retiradas_caixaAberturaId_idx" ON "retiradas"("caixaAberturaId");

-- CreateIndex
CREATE UNIQUE INDEX "caixa_fechamento_caixaAberturaId_key" ON "caixa_fechamento"("caixaAberturaId");

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_caixaAberturaId_fkey" FOREIGN KEY ("caixaAberturaId") REFERENCES "caixa_abertura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas_manuais" ADD CONSTRAINT "vendas_manuais_caixaAberturaId_fkey" FOREIGN KEY ("caixaAberturaId") REFERENCES "caixa_abertura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "retiradas" ADD CONSTRAINT "retiradas_caixaAberturaId_fkey" FOREIGN KEY ("caixaAberturaId") REFERENCES "caixa_abertura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caixa_fechamento" ADD CONSTRAINT "caixa_fechamento_caixaAberturaId_fkey" FOREIGN KEY ("caixaAberturaId") REFERENCES "caixa_abertura"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
