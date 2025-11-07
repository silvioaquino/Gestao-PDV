// Teste simples sem dependências externas
const http = require('http');

function simpleTest() {
  console.log('🧪 TESTE SIMPLES DO WEBHOOK');
  
  const data = JSON.stringify({
    cliente: {
      nome: "Teste Simples",
      telefone: "(11) 95555-4444",
      tipo_pagamento: "Dinheiro"
    },
    pedido: {
      tipo: "DELIVERY",
      valorTotal: 25.50
    },
    produtos: [
      {
        nome: "Teste Simples",
        quantidade: 1,
        valor: 25.50
      }
    ]
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/webhook/cardapio-ai',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    console.log(`📥 Status: ${res.statusCode}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log('📨 Resposta:', responseData);
    });
  });

  req.on('error', (error) => {
    console.error('💥 Erro:', error.message);
  });

  req.write(data);
  req.end();
}

simpleTest();