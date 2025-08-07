const express = require('express');
const path = require('path');
const fs = require('fs');

// Criar um servidor de teste simples
const testApp = express();
const PORT = 3001;

// Configurar middleware para servir imagens
testApp.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
    setHeaders: (res, filePath) => {
        if (filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000');
            res.setHeader('Content-Type', getContentType(filePath));
        }
    }
}));

function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
    };
    return contentTypes[ext] || 'application/octet-stream';
}

// Rota de teste
testApp.get('/test', (req, res) => {
    const uploadsPath = path.join(__dirname, '../uploads');
    const imageFiles = fs.readdirSync(uploadsPath)
        .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
    
    let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Teste de Imagens</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .image-test { margin: 20px 0; padding: 10px; border: 1px solid #ccc; }
                img { max-width: 200px; max-height: 200px; }
                .error { color: red; }
                .success { color: green; }
            </style>
        </head>
        <body>
            <h1>Teste de Carregamento de Imagens</h1>
            <p>Testando ${imageFiles.length} imagens...</p>
    `;
    
    imageFiles.forEach(file => {
        const imageUrl = `/uploads/${file}`;
        html += `
            <div class="image-test">
                <h3>${file}</h3>
                <p>URL: ${imageUrl}</p>
                <img src="${imageUrl}" alt="${file}" onerror="this.parentElement.innerHTML += '<p class=\\'error\\'>❌ Erro ao carregar imagem</p>'" onload="this.parentElement.innerHTML += '<p class=\\'success\\'>✅ Imagem carregada com sucesso</p>'">
            </div>
        `;
    });
    
    html += `
        </body>
        </html>
    `;
    
    res.send(html);
});

// Iniciar servidor de teste
testApp.listen(PORT, () => {
    console.log(`🧪 Servidor de teste rodando em http://localhost:${PORT}`);
    console.log(`🔗 Acesse http://localhost:${PORT}/test para verificar as imagens`);
    console.log(`📁 Diretório de uploads: ${path.join(__dirname, '../uploads')}`);
    
    // Listar arquivos de imagem
    const uploadsPath = path.join(__dirname, '../uploads');
    if (fs.existsSync(uploadsPath)) {
        const imageFiles = fs.readdirSync(uploadsPath)
            .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
        
        console.log(`\n🖼️  Imagens encontradas: ${imageFiles.length}`);
        imageFiles.forEach((file, index) => {
            const filePath = path.join(uploadsPath, file);
            const stats = fs.statSync(filePath);
            console.log(`   ${index + 1}. ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
        });
    } else {
        console.log('❌ Diretório uploads não encontrado');
    }
}); 