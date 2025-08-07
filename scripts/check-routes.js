const express = require('express');
const app = express();

// Testar se o arquivo de rotas existe
try {
    const pagamentoRoutes = require('../routes/pagamento');
    console.log('✅ Arquivo de rotas de pagamento encontrado');
    
    // Verificar se a rota /api/pagar está definida
    if (pagamentoRoutes && typeof pagamentoRoutes === 'function') {
        console.log('✅ Rota de pagamento é uma função válida');
    } else {
        console.log('❌ Rota de pagamento não é uma função válida');
    }
} catch (error) {
    console.log('❌ Erro ao carregar rotas de pagamento:', error.message);
}

// Verificar se o servidor está carregando as rotas
const fs = require('fs');
const path = require('path');
const serverContent = fs.readFileSync(path.join(__dirname, '../server.js'), 'utf8');

if (serverContent.includes('pagamento')) {
    console.log('✅ Servidor inclui referência às rotas de pagamento');
} else {
    console.log('❌ Servidor não inclui referência às rotas de pagamento');
}

if (serverContent.includes('/api/pagar')) {
    console.log('✅ Servidor inclui referência à rota /api/pagar');
} else {
    console.log('❌ Servidor não inclui referência à rota /api/pagar');
}

console.log('\n📋 Verificação concluída'); 