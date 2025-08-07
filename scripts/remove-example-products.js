const databaseManager = require('../database/database');
const Produto = require('../models/Produto');

async function removeExampleProducts() {
    try {
        // Inicializar banco
        databaseManager.initialize();
        
        console.log('🗑️ Removendo produtos de exemplo...\n');
        
        // Buscar todos os produtos
        const produtos = await Produto.findAll();
        
        console.log(`📊 Produtos encontrados: ${produtos.length}`);
        
        if (produtos.length === 0) {
            console.log('✅ Nenhum produto encontrado para remover.');
            return;
        }
        
        // Listar produtos que serão removidos
        console.log('\n📋 Produtos que serão removidos:');
        produtos.forEach((produto, index) => {
            console.log(`${index + 1}. ${produto.nome} (ID: ${produto.id})`);
            console.log(`   Tipo: ${produto.tipo}`);
            console.log(`   Preço: MZN ${produto.preco}`);
            console.log(`   Imagem: ${produto.imagemUrl || 'NENHUMA'}`);
            console.log('');
        });
        
        // Confirmar remoção
        console.log('⚠️  ATENÇÃO: Esta ação irá remover TODOS os produtos do banco de dados!');
        console.log('   Para continuar, execute este script novamente com o parâmetro --confirm');
        
        if (process.argv.includes('--confirm')) {
            console.log('\n🗑️ Iniciando remoção...');
            
            let removedCount = 0;
            
            for (const produto of produtos) {
                try {
                    await Produto.findByIdAndDelete(produto.id);
                    console.log(`✅ Removido: ${produto.nome}`);
                    removedCount++;
                } catch (error) {
                    console.log(`❌ Erro ao remover ${produto.nome}: ${error.message}`);
                }
            }
            
            console.log(`\n🎉 Remoção concluída!`);
            console.log(`📊 Produtos removidos: ${removedCount}`);
            
            // Verificar se ainda há produtos
            const produtosRestantes = await Produto.findAll();
            console.log(`📊 Produtos restantes: ${produtosRestantes.length}`);
            
            if (produtosRestantes.length === 0) {
                console.log('✅ Banco de dados limpo com sucesso!');
            } else {
                console.log('⚠️  Ainda há produtos no banco:');
                produtosRestantes.forEach(p => {
                    console.log(`   - ${p.nome} (ID: ${p.id})`);
                });
            }
        } else {
            console.log('\n💡 Para confirmar a remoção, execute:');
            console.log('   node scripts/remove-example-products.js --confirm');
        }
        
    } catch (error) {
        console.error('❌ Erro ao remover produtos:', error);
    } finally {
        databaseManager.close();
    }
}

if (require.main === module) {
    removeExampleProducts();
}

module.exports = { removeExampleProducts }; 