const nodemailer = require('nodemailer');
require('dotenv').config();

// Configurar Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_SENDER,
    pass: process.env.GMAIL_PASS
  }
});

// Função para testar envio de e-mail
async function testarEmail() {
  try {
    console.log('📧 Testando configuração de e-mail...');
    console.log(`📤 Remetente: ${process.env.GMAIL_SENDER}`);
    
    if (!process.env.GMAIL_SENDER || !process.env.GMAIL_PASS) {
      console.error('❌ Variáveis de ambiente GMAIL_SENDER e GMAIL_PASS não configuradas');
      console.log('📝 Configure o arquivo .env com suas credenciais do Gmail');
      return;
    }

    const mailOptions = {
      from: `"RatixPay" <${process.env.GMAIL_SENDER}>`,
      to: process.env.GMAIL_SENDER, // Enviar para o próprio e-mail como teste
      subject: 'Teste de E-mail - RatixPay',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0;">🧪 Teste de E-mail</h1>
              <p style="color: #7f8c8d; margin: 10px 0;">RatixPay.com</p>
            </div>
            
            <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Configuração Funcionando!</h2>
            
            <p style="color: #34495e; line-height: 1.6; font-size: 16px;">
              Este é um e-mail de teste para verificar se a configuração do sistema de e-mail está funcionando corretamente.
            </p>
            
            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #27ae60;">
              <p style="margin: 0; color: #27ae60; font-weight: bold;">
                ✅ Configuração de e-mail funcionando perfeitamente!
              </p>
            </div>
            
            <p style="color: #34495e; line-height: 1.6;">
              Agora o sistema pode enviar e-mails de confirmação automaticamente após os pagamentos.
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
              <p style="color: #7f8c8d; margin: 0;">
                <strong>Equipe RatixPay 🚀</strong>
              </p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ E-mail de teste enviado com sucesso!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📤 De: ${info.from}`);
    console.log(`📥 Para: ${info.to}`);
    
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail de teste:', error);
    console.log('\n🔧 Possíveis soluções:');
    console.log('1. Verifique se as credenciais do Gmail estão corretas');
    console.log('2. Certifique-se de usar uma "Senha de App" do Gmail');
    console.log('3. Ative a verificação em duas etapas na sua conta Google');
    console.log('4. Verifique se o arquivo .env está configurado corretamente');
  }
}

// Executar teste
testarEmail();

