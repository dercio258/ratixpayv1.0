const { Pool } = require('pg');
require('dotenv').config();

class DatabaseInitializer {
    constructor() {
        this.postgresPool = null;
    }

    async initialize() {
        try {
            // Conectar ao PostgreSQL
            this.postgresPool = new Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
            });

            // Testar conexão PostgreSQL
            const client = await this.postgresPool.connect();
            await client.query('SELECT NOW()');
            client.release();
            console.log('✅ Conectado ao banco PostgreSQL');

            // Criar tabelas
            await this.createTables();
            
            console.log('✅ Banco PostgreSQL inicializado com sucesso!');
            return true;
        } catch (error) {
            console.error('❌ Erro ao inicializar PostgreSQL:', error);
            throw error;
        } finally {
            await this.cleanup();
        }
    }

    async createTables() {
        const client = await this.postgresPool.connect();
        
        try {
            console.log('🔄 Criando tabelas...');
            
            // Tabela de produtos
            await client.query(`
                CREATE TABLE IF NOT EXISTS produtos (
                    id SERIAL PRIMARY KEY,
                    custom_id VARCHAR(255) UNIQUE,
                    nome VARCHAR(255) NOT NULL,
                    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('Curso Online', 'eBook')),
                    preco DECIMAL(10,2) NOT NULL,
                    desconto INTEGER DEFAULT 0,
                    preco_com_desconto DECIMAL(10,2),
                    descricao TEXT,
                    imagem_url TEXT,
                    link_conteudo TEXT,
                    ativo BOOLEAN DEFAULT true,
                    vendas INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Tabela de vendas
            await client.query(`
                CREATE TABLE IF NOT EXISTS vendas (
                    id SERIAL PRIMARY KEY,
                    produto_id INTEGER NOT NULL,
                    cliente_nome VARCHAR(255) NOT NULL,
                    cliente_email VARCHAR(255) NOT NULL,
                    cliente_telefone VARCHAR(50) NOT NULL,
                    cliente_cpf VARCHAR(20),
                    cliente_endereco TEXT,
                    cliente_cidade VARCHAR(100),
                    cliente_pais VARCHAR(100),
                    cliente_ip VARCHAR(45),
                    cliente_user_agent TEXT,
                    cliente_dispositivo VARCHAR(100),
                    cliente_navegador VARCHAR(100),
                    pagamento_metodo VARCHAR(50) NOT NULL CHECK (pagamento_metodo IN ('e-Mola', 'M-Pesa')),
                    pagamento_valor DECIMAL(10,2) NOT NULL,
                    pagamento_valor_original DECIMAL(10,2) NOT NULL,
                    pagamento_desconto INTEGER DEFAULT 0,
                    pagamento_cupom VARCHAR(100),
                    pagamento_status VARCHAR(50) DEFAULT 'Pendente' CHECK (pagamento_status IN ('Pendente', 'Aprovado', 'Rejeitado', 'Cancelado')),
                    pagamento_transacao_id VARCHAR(255) UNIQUE,
                    pagamento_gateway VARCHAR(50) DEFAULT 'PaySuite' CHECK (pagamento_gateway IN ('PaySuite', 'Local')),
                    pagamento_data_processamento TIMESTAMP,
                    pagamento_referencia VARCHAR(255),
                    pagamento_comprovante TEXT,
                    afiliado_codigo VARCHAR(100),
                    afiliado_comissao DECIMAL(10,2) DEFAULT 0,
                    status VARCHAR(50) DEFAULT 'Aguardando Pagamento' CHECK (status IN ('Aguardando Pagamento', 'Pago', 'Entregue', 'Cancelado', 'Reembolsado')),
                    data_venda TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    data_entrega TIMESTAMP,
                    observacoes TEXT,
                    ip VARCHAR(45),
                    user_agent TEXT,
                    canal_venda VARCHAR(50) DEFAULT 'Site',
                    origem_trafico VARCHAR(100),
                    campanha VARCHAR(100),
                    utm_source VARCHAR(100),
                    utm_medium VARCHAR(100),
                    utm_campaign VARCHAR(100),
                    FOREIGN KEY (produto_id) REFERENCES produtos (id) ON DELETE CASCADE
                )
            `);

            // Tabela de usuários
            await client.query(`
                CREATE TABLE IF NOT EXISTS usuarios (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255),
                    email VARCHAR(255) UNIQUE,
                    nome VARCHAR(255),
                    role VARCHAR(50) DEFAULT 'vendedor',
                    tipo VARCHAR(50) DEFAULT 'vendedor',
                    ativo BOOLEAN DEFAULT true,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Tabela de clientes
            await client.query(`
                CREATE TABLE IF NOT EXISTS clientes (
                    id SERIAL PRIMARY KEY,
                    nome VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    telefone VARCHAR(50),
                    endereco TEXT,
                    data_nascimento DATE,
                    genero VARCHAR(50) CHECK (genero IN ('Masculino', 'Feminino', 'Outro', 'Prefiro não informar')),
                    total_compras INTEGER DEFAULT 0,
                    valor_total_gasto DECIMAL(10,2) DEFAULT 0,
                    status VARCHAR(50) DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo', 'Bloqueado')),
                    observacoes TEXT,
                    tags TEXT,
                    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    ultima_compra TIMESTAMP,
                    origem VARCHAR(50) DEFAULT 'Site' CHECK (origem IN ('Site', 'Indicação', 'Redes Sociais', 'Publicidade', 'Outro')),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Tabela de configurações
            await client.query(`
                CREATE TABLE IF NOT EXISTS configuracoes (
                    id SERIAL PRIMARY KEY,
                    chave VARCHAR(255) UNIQUE NOT NULL,
                    valor TEXT,
                    descricao TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Inserir dados iniciais
            await this.insertInitialData(client);

            console.log('✅ Tabelas criadas com sucesso');

        } finally {
            client.release();
        }
    }

    async insertInitialData(client) {
        // Verificar se usuário padrão já existe
        const userExists = await client.query('SELECT id FROM usuarios WHERE username = $1', ['Ratixpay']);
        
        if (userExists.rows.length === 0) {
            await client.query(`
                INSERT INTO usuarios (username, password, email, nome, role)
                VALUES ($1, $2, $3, $4, $5)
            `, ['Ratixpay', 'Moz258', 'admin@ratixpay.com', 'Administrador', 'admin']);
            console.log('✅ Usuário padrão criado');
        }
    }

    async cleanup() {
        if (this.postgresPool) {
            await this.postgresPool.end();
            console.log('🔒 Conexão PostgreSQL fechada');
        }
    }
}

// Executar inicialização se o script for chamado diretamente
if (require.main === module) {
    const initializer = new DatabaseInitializer();
    initializer.initialize()
        .then(() => {
            console.log('✅ Script de inicialização finalizado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Erro no script de inicialização:', error);
            process.exit(1);
        });
}

module.exports = DatabaseInitializer; 