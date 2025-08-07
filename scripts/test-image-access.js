const express = require('express');
const path = require('path');
const fs = require('fs');

// Criar um servidor de teste simples
const testApp = express();
const PORT = 3002;

// Configurar middleware para servir imagens (igual ao servidor principal)
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

// Rota para listar imagens
testApp.get('/', (req, res) => {
    const uploadsPath = path.join(__dirname, '../uploads');
    const imageFiles = fs.readdirSync(uploadsPath)
        .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
    
    let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Teste de Acesso às Imagens</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
                .container { max-width: 1200px; margin: 0 auto; }
                .image-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; margin-top: 20px; }
                .image-card { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .image-card img { width: 100%; height: 200px; object-fit: cover; border-radius: 4px; }
                .image-info { margin-top: 10px; }
                .image-info p { margin: 5px 0; font-size: 14px; }
                .error { color: red; }
                .success { color: green; }
                .url { font-family: monospace; background: #f0f0f0; padding: 2px 4px; border-radius: 2px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🧪 Teste de Acesso às Imagens</h1>
                <p>Testando ${imageFiles.length} imagens do diretório uploads/</p>
                <p><strong>Servidor:</strong> http://localhost:${PORT}</p>
                <p><strong>Diretório:</strong> ${uploadsPath}</p>
                
                <div class="image-grid">
    `;
    
    imageFiles.forEach(file => {
        const imageUrl = `/uploads/${file}`;
        const filePath = path.join(uploadsPath, file);
        const stats = fs.statSync(filePath);
        
        html += `
            <div class="image-card">
                <img src="${imageUrl}" alt="${file}" 
                     onerror="this.parentElement.querySelector('.status').innerHTML = '<span class=\\'error\\'>❌ Erro ao carregar</span>'" 
                     onload="this.parentElement.querySelector('.status').innerHTML = '<span class=\\'success\\'>✅ Carregada</span>'">
                <div class="image-info">
                    <p><strong>Arquivo:</strong> ${file}</p>
                    <p><strong>Tamanho:</strong> ${(stats.size / 1024).toFixed(2)} KB</p>
                    <p><strong>URL:</strong> <span class="url">${imageUrl}</span></p>
                    <p><strong>Status:</strong> <span class="status">⏳ Carregando...</span></p>
                </div>
            </div>
        `;
    });
    
    html += `
                </div>
                
                <div style="margin-top: 30px; padding: 20px; background: #e8f4fd; border-radius: 8px;">
                    <h3>🔗 URLs de Teste</h3>
                    <p>Teste estas URLs diretamente no navegador:</p>
                    <ul>
    `;
    
    imageFiles.slice(0, 3).forEach(file => {
        html += `<li><a href="http://localhost:${PORT}/uploads/${file}" target="_blank">http://localhost:${PORT}/uploads/${file}</a></li>`;
    });
    
    html += `
                    </ul>
                </div>
            </div>
        </body>
        </html>
    `;
    
    res.send(html);
});

// Rota para testar uma imagem específica
testApp.get('/test/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads', filename);
    
    if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        res.json({
            success: true,
            filename,
            size: stats.size,
            sizeKB: (stats.size / 1024).toFixed(2),
            url: `http://localhost:${PORT}/uploads/${filename}`,
            path: filePath
        });
    } else {
        res.status(404).json({
            success: false,
            error: 'Arquivo não encontrado',
            filename,
            path: filePath
        });
    }
});

// Iniciar servidor de teste
testApp.listen(PORT, () => {
    console.log(`🧪 Servidor de teste de imagens rodando em http://localhost:${PORT}`);
    console.log(`🔗 Acesse http://localhost:${PORT} para verificar as imagens`);
    
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
        
        if (imageFiles.length > 0) {
            console.log(`\n🔗 Teste uma imagem: http://localhost:${PORT}/uploads/${imageFiles[0]}`);
        }
    } else {
        console.log('❌ Diretório uploads não encontrado');
    }
}); 