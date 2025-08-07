const crypto = require('crypto');

function gerarChaves() {
    console.log('🔐 Gerando configurações para produção...\n');
    
    console.log('📋 Configurações básicas do sistema:');
    console.log('PORT=10000');
    console.log('NODE_ENV=production');
    
    console.log('\n📋 Copie essas configurações para o arquivo .env ou variáveis de ambiente do Render');
    console.log('⚠️  IMPORTANTE: Sistema simplificado sem criptografia!');
    
    // Gerar arquivo .env.example com as configurações
    const envContent = `# Configurações do Servidor
PORT=10000
NODE_ENV=production

# Configurações de Email (Gmail)
EMAIL_USER=seu_email@gmail.com
EMAIL_PASSWORD=sua_senha_de_app_gmail
ADMIN_EMAIL=admin@seudominio.com

# Configurações de Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
`;

    const fs = require('fs');
    fs.writeFileSync('.env.production', envContent);
    console.log('\n✅ Arquivo .env.production criado com as configurações');
}

if (require.main === module) {
    gerarChaves();
}

module.exports = { gerarChaves }; 