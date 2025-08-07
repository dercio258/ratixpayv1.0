const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('🔍 Verificando configuração do Gmail...\n');

// Verificar variáveis de ambiente
console.log('📋 Verificação de Variáveis de Ambiente:');
console.log(`GMAIL_SENDER: ${process.env.GMAIL_SENDER ? '✅ Configurado' : '❌ Não configurado'}`);
console.log(`GMAIL_PASS: ${process.env.GMAIL_PASS ? '✅ Configurado' : '❌ Não configurado'}`);

if (!process.env.GMAIL_SENDER || !process.env.GMAIL_PASS) {
  console.log('\n❌ ERRO: Variáveis de ambiente não configuradas!');
  console.log('📝 Configure o arquivo .env com suas credenciais do Gmail');
  console.log('📖 Consulte: docs/CORRECAO_ERRO_GMAIL.md');
  process.exit(1);
}

// Verificar formato da senha
const senha = process.env.GMAIL_PASS;
console.log(`\n🔐 Verificação da Senha:`);
console.log(`Comprimento: ${senha.length} caracteres`);
console.log(`Contém espaços: ${senha.includes(' ') ? '❌ SIM (remova os espaços)' : '✅ NÃO'}`);
console.log(`Formato: ${/^[a-zA-Z0-9]{16}$/.test(senha) ? '✅ Correto (16 caracteres alfanuméricos)' : '❌ Incorreto'}`);

if (senha.includes(' ') || senha.length !== 16) {
  console.log('\n⚠️ AVISO: A senha de app deve ter exatamente 16 caracteres sem espaços');
  console.log('📖 Exemplo correto: abcd efgh ijkl mnop → abcd efgh ijkl mnop');
}

// Testar conexão SMTP
async function testarConexao() {
  console.log('\n🔌 Testando conexão SMTP...');
  
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_SENDER,
        pass: process.env.GMAIL_PASS
      }
    });

    // Verificar conexão
    await transporter.verify();
    console.log('✅ Conexão SMTP estabelecida com sucesso!');
    
    return transporter;
    
  } catch (error) {
    console.log('❌ Erro na conexão SMTP:');
    
    if (error.code === 'EAUTH') {
      console.log('🔑 ERRO DE AUTENTICAÇÃO:');
      console.log('1. Verifique se a verificação em duas etapas está ativa');
      console.log('2. Confirme se está usando uma senha de app (não senha normal)');
      console.log('3. Gere uma nova senha de app em: https://myaccount.google.com/apppasswords');
      console.log('4. Certifique-se de que a senha tem 16 caracteres sem espaços');
    } else if (error.code === 'ECONNECTION') {
      console.log('🌐 ERRO DE CONEXÃO:');
      console.log('1. Verifique sua conexão com a internet');
      console.log('2. Tente novamente em alguns minutos');
    } else {
      console.log(`❓ Erro desconhecido: ${error.message}`);
    }
    
    console.log('\n📖 Para mais detalhes, consulte: docs/CORRECAO_ERRO_GMAIL.md');
    return null;
  }
}

// Testar envio de e-mail
async function testarEnvio(transporter) {
  if (!transporter) return;
  
  console.log('\n📧 Testando envio de e-mail...');
  
  try {
    const mailOptions = {
      from: `"RatixPay Teste" <${process.env.GMAIL_SENDER}>`,
      to: process.env.GMAIL_SENDER,
      subject: 'Teste de Configuração - RatixPay',
      text: 'Este é um e-mail de teste para verificar se a configuração está funcionando.',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #27ae60;">✅ Configuração Funcionando!</h2>
          <p>O sistema de e-mail está configurado corretamente.</p>
          <p><strong>Data/Hora:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ E-mail de teste enviado com sucesso!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📤 De: ${info.from}`);
    console.log(`📥 Para: ${info.to}`);
    console.log(`⏰ Enviado em: ${new Date().toLocaleString('pt-BR')}`);
    
  } catch (error) {
    console.log('❌ Erro ao enviar e-mail de teste:');
    console.log(`Erro: ${error.message}`);
  }
}

// Executar verificações
async function executarVerificacoes() {
  const transporter = await testarConexao();
  await testarEnvio(transporter);
  
  console.log('\n🎯 Resumo:');
  if (transporter) {
    console.log('✅ Configuração do Gmail está funcionando corretamente!');
    console.log('🚀 O sistema pode enviar e-mails automáticos após pagamentos.');
  } else {
    console.log('❌ Configuração do Gmail precisa ser corrigida.');
    console.log('📖 Siga as instruções em: docs/CORRECAO_ERRO_GMAIL.md');
  }
}

executarVerificacoes(); 