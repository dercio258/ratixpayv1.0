const databaseManager = require('../database/database');
const Produto = require('../models/Produto');
const fs = require('fs');
const path = require('path');

async function createTestProduct() {
    try {
        // Inicializar banco
        databaseManager.initialize();
        
        console.log('🧪 Criando produto de teste...\n');
        
        // Verificar se já existe um produto de teste
        const existingProduct = await Produto.findByCustomId('TEST001');
        if (existingProduct) {
            console.log('⚠️  Produto de teste já existe:');
            console.log(`   Nome: ${existingProduct.nome}`);
            console.log(`   ID: ${existingProduct.id}`);
            console.log(`   CustomID: ${existingProduct.customId}`);
            console.log(`   Imagem: ${existingProduct.imagemUrl || 'NENHUMA'}`);
            return;
        }
        
        // Buscar imagens disponíveis
        const uploadsPath = path.join(__dirname, '../uploads');
        const imageFiles = fs.readdirSync(uploadsPath)
            .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
            .map(file => `/uploads/${file}`);
        
        console.log(`🖼️  Imagens disponíveis: ${imageFiles.length}`);
        
        // Criar produto de teste
        const testProduct = {
            customId: 'TEST001',
            nome: 'Produto de Teste - Marketing Digital',
            tipo: 'Curso Online',
            preco: 297.00,
            desconto: 15,
            precoComDesconto: 252.45,
            descricao: 'Curso completo de marketing digital para iniciantes. Aprenda as melhores estratégias para alavancar seu negócio online.',
            imagemUrl: imageFiles.length > 0 ? imageFiles[0] : null,
            ativo: true
        };
        
        console.log('📝 Criando produto...');
        console.log(`   Nome: ${testProduct.nome}`);
        console.log(`   CustomID: ${testProduct.customId}`);
        console.log(`   Preço: MZN ${testProduct.preco}`);
        console.log(`   Desconto: ${testProduct.desconto}%`);
        console.log(`   Preço Final: MZN ${testProduct.precoComDesconto}`);
        console.log(`   Imagem: ${testProduct.imagemUrl || 'NENHUMA'}`);
        
        const produto = await Produto.create(testProduct);
        
        console.log('\n✅ Produto criado com sucesso!');
        console.log(`   ID: ${produto.id}`);
        console.log(`   CustomID: ${produto.customId}`);
        console.log(`   Nome: ${produto.nome}`);
        console.log(`   Imagem: ${produto.imagemUrl || 'NENHUMA'}`);
        
        console.log('\n🔗 URLs de teste:');
        console.log(`   Por ID: http://localhost:3000/checkout?id=${produto.id}`);
        console.log(`   Por CustomID: http://localhost:3000/checkout?id=${produto.customId}`);
        
        // Verificar se a imagem existe
        if (produto.imagemUrl) {
            const imagePath = path.join(__dirname, '..', produto.imagemUrl);
            const fileExists = fs.existsSync(imagePath);
            console.log(`\n🖼️  Verificação da imagem:`);
            console.log(`   URL: ${produto.imagemUrl}`);
            console.log(`   Arquivo existe: ${fileExists ? '✅' : '❌'}`);
            
            if (fileExists) {
                const stats = fs.statSync(imagePath);
                console.log(`   Tamanho: ${(stats.size / 1024).toFixed(2)} KB`);
                console.log(`   URL completa: http://localhost:3000${produto.imagemUrl}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Erro ao criar produto de teste:', error);
    } finally {
        databaseManager.close();
    }
}

if (require.main === module) {
    createTestProduct();
}

module.exports = { createTestProduct }; 