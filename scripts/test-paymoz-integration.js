const payMozService = require('../services/paymozService');

async function testPayMozIntegration() {
    try {
        console.log('🧪 Testando integração com PayMoz...\n');
        
        // Teste 1: Validação de número de celular
        console.log('📱 Testando validação de números de celular:');
        const numerosTeste = [
            '841234567',
            '861234567',
            '+258841234567',
            '123456789',
            '84123456',
            '8412345678'
        ];
        
        numerosTeste.forEach(numero => {
            const isValid = payMozService.validarNumeroCelular(numero);
            const formatted = payMozService.formatarNumeroCelular(numero);
            console.log(`   ${numero} -> Válido: ${isValid ? '✅' : '❌'}, Formatado: ${formatted}`);
        });
        
        // Teste 2: Validação de valor
        console.log('\n💰 Testando validação de valores:');
        const valoresTeste = [100, 0, -10, 'abc', null, undefined];
        
        valoresTeste.forEach(valor => {
            const isValid = payMozService.validarValor(valor);
            console.log(`   ${valor} -> Válido: ${isValid ? '✅' : '❌'}`);
        });
        
        // Teste 3: Simulação de pagamento M-Pesa (sem fazer requisição real)
        console.log('\n💳 Testando simulação de pagamento M-Pesa:');
        const resultadoMpesa = await payMozService.processarPagamentoMpesa('841234567', 100);
        console.log(`   Resultado: ${resultadoMpesa.success ? '✅ Sucesso' : '❌ Falha'}`);
        if (!resultadoMpesa.success) {
            console.log(`   Erro: ${resultadoMpesa.error}`);
        }
        
        // Teste 4: Simulação de pagamento e-Mola (sem fazer requisição real)
        console.log('\n💳 Testando simulação de pagamento e-Mola:');
        const resultadoEmola = await payMozService.processarPagamentoEmola('861234567', 150);
        console.log(`   Resultado: ${resultadoEmola.success ? '✅ Sucesso' : '❌ Falha'}`);
        if (!resultadoEmola.success) {
            console.log(`   Erro: ${resultadoEmola.error}`);
        }
        
        // Teste 5: Validação de método
        console.log('\n🔧 Testando validação de métodos:');
        const metodosTeste = ['mpesa', 'emola', 'pix', 'cartao', null];
        
        for (const metodo of metodosTeste) {
            const resultado = await payMozService.processarPagamento(metodo, '841234567', 100);
            console.log(`   Método "${metodo}" -> Válido: ${resultado.success ? '✅' : '❌'}`);
            if (!resultado.success) {
                console.log(`   Erro: ${resultado.error}`);
            }
        }
        
        console.log('\n🎉 Teste de integração concluído!');
        console.log('\n💡 Para testar com dados reais:');
        console.log('   1. Inicie o servidor: node server.js');
        console.log('   2. Acesse: http://localhost:3000/checkout?id=C03872');
        console.log('   3. Preencha os dados e teste o pagamento');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

if (require.main === module) {
    testPayMozIntegration();
}

module.exports = { testPayMozIntegration }; 