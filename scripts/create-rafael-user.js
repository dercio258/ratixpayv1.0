const databaseManager = require('../database/database');

async function createRafaelUser() {
    console.log('👤 Criando usuário Rafael...');
    
    try {
        // Inicializar banco de dados
        databaseManager.initialize();
        
        const db = databaseManager.getDatabase();
        
        // Verificar se o usuário Rafael já existe
        const rafaelExists = db.prepare('SELECT id FROM usuarios WHERE username = ?').get('Rafael');
        
        if (rafaelExists) {
            console.log('ℹ️  Usuário Rafael já existe. Atualizando informações...');
            
            // Atualizar informações do usuário
            const updateStmt = db.prepare(`
                UPDATE usuarios 
                SET nome = ?, email = ?, role = ?, tipo = ?
                WHERE username = ?
            `);
            
            updateStmt.run(
                'RAFAEL MANGUELE',
                'rafael@ratixpay.com',
                'admin',
                'admin',
                'Rafael'
            );
            
            console.log('✅ Usuário Rafael atualizado com sucesso!');
        } else {
            // Inserir usuário Rafael (senha sem hash)
            const stmt = db.prepare(`
                INSERT INTO usuarios (username, password, email, nome, role, tipo, ativo)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);
            
            const result = stmt.run(
                'Rafael',
                'ratixp@y258', // Senha sem hash
                'rafael@ratixpay.com',
                'RAFAEL MANGUELE',
                'admin',
                'admin',
                1
            );
            
            console.log('✅ Usuário Rafael criado com sucesso!');
        }
        
        console.log('📋 Credenciais:');
        console.log('   Usuário: Rafael');
        console.log('   Senha: ratixp@y258');
        console.log('   Nome: RAFAEL MANGUELE');
        console.log('   Cargo: ADMINISTRADOR');
        
    } catch (error) {
        console.error('❌ Erro ao criar usuário Rafael:', error);
        throw error;
    }
}

if (require.main === module) {
    createRafaelUser()
        .then(() => {
            console.log('✅ Processo concluído!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Erro:', error);
            process.exit(1);
        });
}

module.exports = { createRafaelUser }; 