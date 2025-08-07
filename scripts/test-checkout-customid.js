const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testCheckoutCustomId() {
    try {
        console.log('🧪 Testando checkout com customId...\n');
        
        // Testar busca por customId
        console.log('📡 Testando busca por customId...');
        const response = await fetch('http://localhost:3000/api/produtos/C03872');
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const produto = await response.json();
        console.log('✅ Produto encontrado por customId:');
        console.log(`   Nome: ${produto.nome}`);
        console.log(`   ID: ${produto.id}`);
        console.log(`   CustomID: ${produto.customId}`);
        console.log(`   Imagem: ${produto.imagemUrl || 'NENHUMA'}`);
        console.log(`   Preço: MZN ${produto.preco}`);
        console.log(`   Desconto: ${produto.desconto}%`);
        console.log(`   Preço Final: MZN ${produto.precoComDesconto}`);
        
        // Testar busca por ID também
        console.log('\n📡 Testando busca por ID...');
        const responseById = await fetch(`http://localhost:3000/api/produtos/${produto.id}`);
        
        if (responseById.ok) {
            const produtoById = await responseById.json();
            console.log('✅ Produto encontrado por ID:');
            console.log(`   Nome: ${produtoById.nome}`);
            console.log(`   CustomID: ${produtoById.customId}`);
        }
        
        // Testar acesso à imagem
        if (produto.imagemUrl) {
            console.log('\n🖼️  Testando acesso à imagem...');
            const imageUrl = `http://localhost:3000${produto.imagemUrl}`;
            console.log(`   URL: ${imageUrl}`);
            
            try {
                const imageResponse = await fetch(imageUrl, { method: 'HEAD' });
                
                if (imageResponse.ok) {
                    const contentLength = imageResponse.headers.get('content-length');
                    const contentType = imageResponse.headers.get('content-type');
                    
                    console.log(`   ✅ Status: ${imageResponse.status}`);
                    console.log(`   📏 Tamanho: ${contentLength} bytes`);
                    console.log(`   🎨 Tipo: ${contentType}`);
                } else {
                    console.log(`   ❌ Erro: ${imageResponse.status} ${imageResponse.statusText}`);
                }
            } catch (error) {
                console.log(`   ❌ Erro de conexão: ${error.message}`);
            }
        }
        
        console.log('\n🔗 URLs de teste:');
        console.log(`   Por CustomID: http://localhost:3000/checkout?id=${produto.customId}`);
        console.log(`   Por ID: http://localhost:3000/checkout?id=${produto.id}`);
        
        console.log('\n🎉 Teste concluído!');
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
    }
}

if (require.main === module) {
    testCheckoutCustomId();
}

module.exports = { testCheckoutCustomId }; 