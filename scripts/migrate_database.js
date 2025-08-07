const databaseManager = require('../database/database');

async function migrateDatabase() {
    try {
        console.log('🔄 Iniciando migração do banco de dados...');
        
        // Inicializar o banco de dados primeiro
        databaseManager.initialize();
        
        const db = databaseManager.getDatabase();
        
        if (!db) {
            throw new Error('Não foi possível conectar ao banco de dados');
        }
        
        // Verificar se as novas colunas já existem
        const tableInfo = db.prepare("PRAGMA table_info(vendas)").all();
        const existingColumns = tableInfo.map(col => col.name);
        
        console.log('📋 Colunas existentes:', existingColumns);
        
        // Lista de novas colunas para adicionar
        const newColumns = [
            { name: 'clienteCidade', type: 'TEXT' },
            { name: 'clientePais', type: 'TEXT' },
            { name: 'clienteIp', type: 'TEXT' },
            { name: 'clienteUserAgent', type: 'TEXT' },
            { name: 'clienteDispositivo', type: 'TEXT' },
            { name: 'clienteNavegador', type: 'TEXT' },
            { name: 'pagamentoReferencia', type: 'TEXT' },
            { name: 'pagamentoComprovante', type: 'TEXT' },
            { name: 'canalVenda', type: 'TEXT DEFAULT "Site"' },
            { name: 'origemTrafico', type: 'TEXT' },
            { name: 'campanha', type: 'TEXT' },
            { name: 'utmSource', type: 'TEXT' },
            { name: 'utmMedium', type: 'TEXT' },
            { name: 'utmCampaign', type: 'TEXT' }
        ];
        
        // Adicionar novas colunas se não existirem
        for (const column of newColumns) {
            if (!existingColumns.includes(column.name)) {
                console.log(`➕ Adicionando coluna: ${column.name}`);
                try {
                    db.prepare(`ALTER TABLE vendas ADD COLUMN ${column.name} ${column.type}`).run();
                    console.log(`✅ Coluna ${column.name} adicionada com sucesso`);
                } catch (error) {
                    console.log(`⚠️ Erro ao adicionar coluna ${column.name}:`, error.message);
                }
            } else {
                console.log(`✅ Coluna já existe: ${column.name}`);
            }
        }
        
        // Atualizar dados existentes com valores padrão
        console.log('🔄 Atualizando dados existentes...');
        
        // Definir país padrão para registros existentes
        try {
            db.prepare(`
                UPDATE vendas 
                SET clientePais = 'Moçambique' 
                WHERE clientePais IS NULL
            `).run();
            console.log('✅ País padrão definido para registros existentes');
        } catch (error) {
            console.log('⚠️ Erro ao definir país padrão:', error.message);
        }
        
        // Definir canal de venda padrão
        try {
            db.prepare(`
                UPDATE vendas 
                SET canalVenda = 'Site' 
                WHERE canalVenda IS NULL
            `).run();
            console.log('✅ Canal de venda padrão definido');
        } catch (error) {
            console.log('⚠️ Erro ao definir canal de venda padrão:', error.message);
        }
        
        // Detectar dispositivo e navegador para registros existentes
        try {
            const vendasSemDispositivo = db.prepare(`
                SELECT id, userAgent 
                FROM vendas 
                WHERE clienteDispositivo IS NULL AND userAgent IS NOT NULL
            `).all();
            
            console.log(`🔄 Processando ${vendasSemDispositivo.length} registros para detectar dispositivo...`);
            
            for (const venda of vendasSemDispositivo) {
                if (venda.userAgent) {
                    const deviceInfo = detectDevice(venda.userAgent);
                    db.prepare(`
                        UPDATE vendas 
                        SET clienteDispositivo = ?, clienteNavegador = ?
                        WHERE id = ?
                    `).run(deviceInfo.dispositivo, deviceInfo.navegador, venda.id);
                }
            }
            console.log('✅ Dispositivos e navegadores detectados para registros existentes');
        } catch (error) {
            console.log('⚠️ Erro ao detectar dispositivos:', error.message);
        }
        
        console.log('✅ Migração concluída com sucesso!');
        
        // Mostrar estatísticas
        try {
            const totalVendas = db.prepare('SELECT COUNT(*) as count FROM vendas').get();
            const vendasComDadosCompletos = db.prepare(`
                SELECT COUNT(*) as count 
                FROM vendas 
                WHERE clienteDispositivo IS NOT NULL 
                AND clienteNavegador IS NOT NULL
            `).get();
            
            console.log(`📊 Estatísticas:`);
            console.log(`   - Total de vendas: ${totalVendas.count}`);
            console.log(`   - Vendas com dados completos: ${vendasComDadosCompletos.count}`);
            if (totalVendas.count > 0) {
                const percentual = ((vendasComDadosCompletos.count / totalVendas.count) * 100).toFixed(1);
                console.log(`   - Percentual de dados completos: ${percentual}%`);
            }
        } catch (error) {
            console.log('⚠️ Erro ao gerar estatísticas:', error.message);
        }
        
    } catch (error) {
        console.error('❌ Erro durante a migração:', error);
        throw error;
    }
}

// Função para detectar dispositivo e navegador
function detectDevice(userAgent) {
    const ua = userAgent.toLowerCase();
    let dispositivo = 'Desktop';
    let navegador = 'Outro';

    // Detectar dispositivo
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
        dispositivo = 'Mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
        dispositivo = 'Tablet';
    }

    // Detectar navegador
    if (ua.includes('chrome')) {
        navegador = 'Chrome';
    } else if (ua.includes('firefox')) {
        navegador = 'Firefox';
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
        navegador = 'Safari';
    } else if (ua.includes('edge')) {
        navegador = 'Edge';
    } else if (ua.includes('opera')) {
        navegador = 'Opera';
    }

    return { dispositivo, navegador };
}

// Executar migração se o script for executado diretamente
if (require.main === module) {
    migrateDatabase()
        .then(() => {
            console.log('🎉 Migração finalizada!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Erro na migração:', error);
            process.exit(1);
        });
}

module.exports = { migrateDatabase }; 