const databaseManager = require('../database/database');
const Produto = require('../models/Produto');
const fs = require('fs');
const path = require('path');

async function fixImageLoading() {
    try {
        // Inicializar banco
        databaseManager.initialize();
        
        console.log('🔧 Corrigindo problema de carregamento de imagens...\n');
        
        // Verificar se o diretório uploads existe
        const uploadsPath = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsPath)) {
            console.log('📁 Criando diretório uploads...');
            fs.mkdirSync(uploadsPath, { recursive: true });
        }
        
        // Listar arquivos de imagem disponíveis
        const imageFiles = fs.readdirSync(uploadsPath)
            .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
            .map(file => `/uploads/${file}`);
        
        console.log(`🖼️  Imagens disponíveis: ${imageFiles.length}`);
        imageFiles.forEach((file, index) => {
            console.log(`   ${index + 1}. ${file}`);
        });
        console.log('');
        
        // Buscar todos os produtos
        const produtos = await Produto.findAll();
        console.log(`📊 Produtos encontrados: ${produtos.length}`);
        
        if (produtos.length === 0) {
            console.log('✅ Nenhum produto encontrado.');
            return;
        }
        
        // Verificar produtos sem imagem
        const produtosSemImagem = produtos.filter(p => !p.imagemUrl);
        const produtosComImagem = produtos.filter(p => p.imagemUrl);
        
        console.log(`📊 Produtos com imagem: ${produtosComImagem.length}`);
        console.log(`📊 Produtos sem imagem: ${produtosSemImagem.length}`);
        
        if (produtosSemImagem.length > 0) {
            console.log('\n📋 Produtos sem imagem:');
            produtosSemImagem.forEach((produto, index) => {
                console.log(`${index + 1}. ${produto.nome} (ID: ${produto.id})`);
            });
            
            if (imageFiles.length > 0) {
                console.log('\n🔧 Atribuindo imagens aos produtos...');
                
                let updatedCount = 0;
                
                for (let i = 0; i < produtosSemImagem.length; i++) {
                    const produto = produtosSemImagem[i];
                    const imageIndex = i % imageFiles.length;
                    const selectedImage = imageFiles[imageIndex];
                    
                    console.log(`📝 Atualizando: ${produto.nome}`);
                    console.log(`   Imagem: ${selectedImage}`);
                    
                    try {
                        produto.imagemUrl = selectedImage;
                        await produto.save();
                        console.log(`   ✅ Atualizado com sucesso!`);
                        updatedCount++;
                    } catch (error) {
                        console.log(`   ❌ Erro: ${error.message}`);
                    }
                    console.log('');
                }
                
                console.log(`🎉 Processo concluído!`);
                console.log(`📊 Produtos atualizados: ${updatedCount}`);
            } else {
                console.log('\n⚠️  Nenhuma imagem disponível para atribuir aos produtos.');
                console.log('   Adicione imagens ao diretório uploads/ e execute novamente.');
            }
        }
        
        // Verificar URLs de imagem
        console.log('\n🔍 Verificando URLs de imagem...');
        const produtosFinais = await Produto.findAll();
        
        produtosFinais.forEach((produto, index) => {
            console.log(`${index + 1}. ${produto.nome}`);
            console.log(`   URL: ${produto.imagemUrl || 'NENHUMA'}`);
            
            if (produto.imagemUrl) {
                const imagePath = path.join(__dirname, '..', produto.imagemUrl);
                const fileExists = fs.existsSync(imagePath);
                console.log(`   Arquivo existe: ${fileExists ? '✅' : '❌'}`);
                
                if (fileExists) {
                    const stats = fs.statSync(imagePath);
                    console.log(`   Tamanho: ${(stats.size / 1024).toFixed(2)} KB`);
                }
            }
            console.log('');
        });
        
        // Testar acesso às imagens
        console.log('🧪 Testando acesso às imagens...');
        const produtosComImagemFinal = produtosFinais.filter(p => p.imagemUrl);
        
        for (const produto of produtosComImagemFinal.slice(0, 3)) {
            const imagePath = path.join(__dirname, '..', produto.imagemUrl);
            
            if (fs.existsSync(imagePath)) {
                const stats = fs.statSync(imagePath);
                console.log(`✅ ${produto.nome}: ${produto.imagemUrl} (${(stats.size / 1024).toFixed(2)} KB)`);
            } else {
                console.log(`❌ ${produto.nome}: Arquivo não encontrado - ${produto.imagemUrl}`);
            }
        }
        
        console.log('\n🎉 Verificação concluída!');
        console.log('\n💡 Dicas para resolver problemas de imagem:');
        console.log('   1. Certifique-se de que as imagens estão no diretório uploads/');
        console.log('   2. Verifique se as URLs começam com /uploads/');
        console.log('   3. Confirme se o servidor está servindo arquivos estáticos corretamente');
        console.log('   4. Teste o acesso direto às URLs das imagens no navegador');
        
    } catch (error) {
        console.error('❌ Erro ao corrigir imagens:', error);
    } finally {
        databaseManager.close();
    }
}

if (require.main === module) {
    fixImageLoading();
}

module.exports = { fixImageLoading }; 