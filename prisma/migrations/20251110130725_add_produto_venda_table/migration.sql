-- CreateTable
CREATE TABLE "produto_venda" (
    "id" TEXT NOT NULL,
    "vendaId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "adicionais" JSONB,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produto_venda_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "produto_venda_vendaId_idx" ON "produto_venda"("vendaId");

-- CreateIndex
CREATE INDEX "produto_venda_nome_idx" ON "produto_venda"("nome");

-- AddForeignKey
ALTER TABLE "produto_venda" ADD CONSTRAINT "produto_venda_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
