const databaseManager = require('../database/database');
const Produto = require('../models/Produto');
const fs = require('fs');
const path = require('path');

async function checkProductsImages() {
    try {
        // Inicializar banco
        databaseManager.initialize();
        
        console.log('🔍 Verificando imagens dos produtos...\n');
        
        // Buscar todos os produtos
        const produtos = await Produto.findAll();
        
        console.log(`📊 Total de produtos: ${produtos.length}`);
        
        if (produtos.length === 0) {
            console.log('✅ Nenhum produto encontrado.');
            return;
        }
        
        // Verificar produtos com e sem imagem
        const produtosComImagem = produtos.filter(p => p.imagemUrl);
        const produtosSemImagem = produtos.filter(p => !p.imagemUrl);
        
        console.log(`📊 Produtos com imagem: ${produtosComImagem.length}`);
        console.log(`📊 Produtos sem imagem: ${produtosSemImagem.length}`);
        
        // Listar produtos sem imagem
        if (produtosSemImagem.length > 0) {
            console.log('\n📋 Produtos sem imagem:');
            produtosSemImagem.forEach((produto, index) => {
                console.log(`${index + 1}. ${produto.nome} (ID: ${produto.id}, CustomID: ${produto.customId})`);
                console.log(`   ImagemUrl: ${produto.imagemUrl || 'NULL'}`);
            });
        }
        
        // Listar produtos com imagem
        if (produtosComImagem.length > 0) {
            console.log('\n📋 Produtos com imagem:');
            produtosComImagem.forEach((produto, index) => {
                console.log(`${index + 1}. ${produto.nome} (ID: ${produto.id}, CustomID: ${produto.customId})`);
                console.log(`   ImagemUrl: ${produto.imagemUrl}`);
                
                // Verificar se o arquivo existe
                if (produto.imagemUrl) {
                    const imagePath = path.join(__dirname, '..', produto.imagemUrl);
                    const fileExists = fs.existsSync(imagePath);
                    console.log(`   Arquivo existe: ${fileExists ? '✅' : '❌'}`);
                    
                    if (fileExists) {
                        const stats = fs.statSync(imagePath);
                        console.log(`   Tamanho: ${(stats.size / 1024).toFixed(2)} KB`);
                    }
                }
            });
        }
        
        // Verificar imagens disponíveis
        const uploadsPath = path.join(__dirname, '../uploads');
        const imageFiles = fs.readdirSync(uploadsPath)
            .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
            .map(file => `/uploads/${file}`);
        
        console.log(`\n🖼️  Imagens disponíveis no diretório uploads/: ${imageFiles.length}`);
        imageFiles.forEach((file, index) => {
            console.log(`   ${index + 1}. ${file}`);
        });
        
        // Sugerir correção
        if (produtosSemImagem.length > 0 && imageFiles.length > 0) {
            console.log('\n💡 Sugestão:');
            console.log('   Execute o script fix-image-loading.js para atribuir imagens aos produtos sem imagem.');
        }
        
    } catch (error) {
        console.error('❌ Erro ao verificar produtos:', error);
    } finally {
        databaseManager.close();
    }
}

if (require.main === module) {
    checkProductsImages();
}

module.exports = { checkProductsImages }; 