# Gestao-PDV
Sistema de Gestão de Caixa
Um sistema completo para gestão de caixa desenvolvido em Next.js, com controle de vendas, retiradas e relatórios detalhados.

📋 Descrição
Sistema web para controle de caixa que permite:

Abertura e fechamento de caixa

Registro de vendas do sistema e manuais

Controle de retiradas

Relatórios por tipo de pagamento

Impressão de relatórios parciais e de fechamento

🚀 Funcionalidades
💰 Gestão de Caixa
Abertura de Caixa: Definição de valor inicial

Fechamento de Caixa: Relatório completo com totais e diferenças

Saldo em Tempo Real: Acompanhamento do saldo atual em dinheiro

💳 Tipos de Pagamento Suportados
Dinheiro 💵

Cartão de Crédito 💳

Cartão de Débito 🏦

PIX 📱

VR (Vale Refeição) 🍽️

Outros 📄

📊 Controle de Vendas
Vendas do Sistema: Integração com sistema de pedidos

Vendas Manuais: Registro direto no caixa

Diferenças Automáticas: Cálculo de diferenças entre sistema e manual

Detalhes por Venda: Visualização completa de cada transação

💸 Retiradas
Registro de Retiradas: Controle de saídas de dinheiro

Observações: Descrição detalhada de cada retirada

Histórico: Listagem completa de todas as retiradas

🖨️ Relatórios
Relatório Parcial: Impressão a qualquer momento

Relatório de Fechamento: Documento completo ao fechar caixa

Resumo por Tipo: Detalhamento por forma de pagamento

🛠️ Tecnologias Utilizadas
Frontend: Next.js 14, React, TypeScript

Estilização: Bootstrap 5, Bootstrap Icons

Backend: API Routes (Next.js)

Banco de Dados: (Configurável - PostgreSQL/MySQL/SQLite)

Validação: Validação de formulários nativa

📦 Instalação
Pré-requisitos
Node.js 18+

npm ou yarn

Banco de dados configurado

Passos para instalação
Clone o repositório

bash
git clone <url-do-repositorio>
cd sistema-caixa
Instale as dependências

bash
npm install
# ou
yarn install
Configure as variáveis de ambiente

bash
cp .env.example .env.local
Edite o arquivo .env.local com suas configurações:

env
DATABASE_URL="sua-string-de-conexao"
NEXTAUTH_SECRET="sua-chave-secreta"
Configure o banco de dados

bash
npx prisma generate
npx prisma db push
# ou use suas migrações
Execute o projeto

bash
npm run dev
# ou
yarn dev
O sistema estará disponível em http://localhost:3000

🏗️ Estrutura do Projeto
text
src/
├── app/
│   ├── api/                 # API Routes
│   │   ├── caixa/          # Endpoints do caixa
│   │   ├── vendas/         # Endpoints de vendas
│   │   └── retiradas/      # Endpoints de retiradas
│   ├── components/         # Componentes React
│   │   └── modais/         # Modais do sistema
│   ├── lib/               # Utilitários
│   │   └── utils.ts       # Funções auxiliares
│   └── types/             # Definições TypeScript
📝 Como Usar
1. Abertura de Caixa
Acesse o sistema

Clique em "Abrir Caixa"

Informe o valor inicial

Confirme a abertura

2. Durante o Expediente
Registre Vendas: As vendas do sistema aparecem automaticamente

Vendas Manuais: Use os inputs em cada tipo de pagamento

Retiradas: Registre retiradas com valor e observação

Acompanhe: Monitore saldos e diferenças em tempo real

3. Fechamento de Caixa
Clique em "Fechar Caixa"

Revise o relatório completo

Confirme o fechamento

Imprima o relatório final

🔧 API Endpoints
Caixa
POST /api/caixa/abrir - Abrir caixa

POST /api/caixa/fechar - Fechar caixa

GET /api/caixa/status - Status atual

Vendas
GET /api/vendas?caixaId=:id - Listar vendas do caixa

POST /api/vendas/manuais - Registrar venda manual

DELETE /api/vendas/manuais/:id - Remover venda manual

Retiradas
GET /api/retiradas?caixaId=:id - Listar retiradas

POST /api/retiradas - Registrar retirada

DELETE /api/retiradas/:id - Excluir retirada

🎨 Personalização
Cores dos Tipos de Pagamento
typescript
const coresTipoPagamento = {
  DINHEIRO: '#28a745',        // Verde
  CARTAO_CREDITO: '#007bff',  // Azul
  CARTAO_DEBITO: '#17a2b8',   // Azul claro
  PIX: '#6f42c1',             // Roxo
  VR: '#fd7e14',              // Laranja
  OUTRO: '#343a40'            // Cinza escuro
}
Adicionar Novo Tipo de Pagamento
Adicione no array tiposPagamento

Configure a cor no card-header

Atualize as funções de formatação

📱 Responsividade
O sistema é totalmente responsivo:

Desktop: Layout completo com 2 colunas

Tablet: Cards reorganizados

Mobile: Interface adaptada para touch

🚨 Tratamento de Erros
Validação de campos obrigatórios

Feedback visual para ações

Mensagens de erro descritivas

Confirmações para ações críticas

🔒 Segurança
Validação de dados no frontend e backend

Proteção contra SQL Injection

Sanitização de inputs

Controle de sessões

📄 Licença
Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

🤝 Contribuição
Fork o projeto

Crie uma branch para sua feature (git checkout -b feature/AmazingFeature)

Commit suas mudanças (git commit -m 'Add some AmazingFeature')

Push para a branch (git push origin feature/AmazingFeature)

Abra um Pull Request

📞 Suporte
Em caso de dúvidas ou problemas:

Verifique a documentação

Consulte as issues no GitHub

Entre em contato com a equipe de desenvolvimento

🎯 Próximas Funcionalidades
Integração com impressoras térmicas

Relatórios gráficos

Backup automático

Multi-usuário

Controle de turnos

Desenvolvido com ❤️ para otimizar a gestão do seu negócio