const emailService = require('../utils/emailService');

// Dados de teste
const vendaTeste = {
    clienteNome: 'João Silva',
    clienteEmail: 'joao.teste@exemplo.com', // Substitua por um email válido para teste
    pagamentoValor: 150.00,
    pagamentoTransacaoId: 'TXN_TESTE_123456',
    pagamentoMetodo: 'M-Pesa'
};

const produtoTeste = {
    nome: 'Curso de Marketing Digital',
    linkConteudo: 'https://exemplo.com/curso-marketing'
};

async function testarEnvioEmail() {
    console.log('🧪 Iniciando teste de envio de email...\n');

    // Verificar configuração
    console.log('1. Verificando configuração do serviço de email...');
    if (emailService.isConfigurado()) {
        console.log('✅ Serviço de email configurado corretamente');
    } else {
        console.log('❌ Serviço de email não configurado');
        console.log('   Verifique as variáveis de ambiente:');
        console.log('   - GMAIL_SENDER ou EMAIL_USER');
        console.log('   - GMAIL_PASS ou EMAIL_PASSWORD');
        return;
    }

    // Testar envio
    console.log('\n2. Testando envio de email...');
    try {
        const resultado = await emailService.enviarLinkConteudo(vendaTeste, produtoTeste);
        console.log('✅ Email enviado com sucesso!');
        console.log('   Message ID:', resultado.messageId);
        console.log('   Para:', vendaTeste.clienteEmail);
    } catch (error) {
        console.log('❌ Erro ao enviar email:');
        console.log('   Erro:', error.message);
        
        if (error.code === 'EAUTH') {
            console.log('\n💡 Dica: Verifique se:');
            console.log('   - A verificação em duas etapas está ativa');
            console.log('   - A senha de app está correta');
            console.log('   - O email está correto');
        }
    }

    console.log('\n3. Teste concluído!');
}

// Executar teste se o arquivo for executado diretamente
if (require.main === module) {
    testarEnvioEmail().catch(console.error);
}

module.exports = { testarEnvioEmail }; 