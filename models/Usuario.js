const databaseManager = require('../config/database');

class Usuario {
    constructor(data = {}) {
        this.id = data.id;
        this.username = data.username;
        this.password = data.password;
        this.email = data.email;
        this.nome = data.nome;
        this.role = data.role || 'vendedor';
        this.tipo = data.tipo || 'vendedor';
        this.ativo = data.ativo !== undefined ? data.ativo : true;
        this.createdAt = data.created_at;
        this.updatedAt = data.updated_at;
    }

    // Criar novo usuário
    static async create(usuarioData) {
        const pool = databaseManager.getPool();
        
        // Garantir que todos os valores sejam compatíveis com PostgreSQL
        const username = String(usuarioData.username || usuarioData.email || '');
        const email = String(usuarioData.email || '');
        const nome = String(usuarioData.nome || '');
        const role = String(usuarioData.role || 'vendedor');
        const tipo = String(usuarioData.tipo || 'vendedor');
        const password = String(usuarioData.password || '');
        const ativo = usuarioData.ativo !== undefined ? usuarioData.ativo : true;

        console.log('Dados para inserção:', {
            username, email, nome, role, tipo, ativo
        });

        const query = `
            INSERT INTO usuarios (username, password, email, nome, role, tipo, ativo)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const values = [
            username,
            password,
            email,
            nome,
            role,
            tipo,
            ativo
        ];

        const result = await pool.query(query, values);
        return new Usuario(result.rows[0]);
    }

    // Buscar por ID
    static async findById(id) {
        const pool = databaseManager.getPool();
        const result = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
        return result.rows[0] ? new Usuario(result.rows[0]) : null;
    }

    // Buscar por username
    static async findByUsername(username) {
        const pool = databaseManager.getPool();
        const result = await pool.query('SELECT * FROM usuarios WHERE username = $1', [username]);
        return result.rows[0] ? new Usuario(result.rows[0]) : null;
    }

    // Buscar por email
    static async findByEmail(email) {
        const pool = databaseManager.getPool();
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        return result.rows[0] ? new Usuario(result.rows[0]) : null;
    }

    // Autenticar usuário (simples - sem criptografia)
    static async authenticate(username, password) {
        const usuario = await this.findByUsername(username);
        if (!usuario || !usuario.ativo) {
            return null;
        }

        // Comparação simples de senha (sem hash)
        if (usuario.password === password) {
            return usuario;
        }

        return null;
    }

    // Buscar todos os usuários
    static async findAll(options = {}) {
        const pool = databaseManager.getPool();
        let query = 'SELECT * FROM usuarios';
        const params = [];
        let paramIndex = 1;

        if (options.ativo !== undefined) {
            query += ' WHERE ativo = $' + paramIndex;
            params.push(options.ativo);
        }

        query += ' ORDER BY created_at DESC';

        // Paginação
        if (options.limit) {
            query += ' LIMIT $' + (paramIndex + 1);
            params.push(options.limit);
            paramIndex++;
        }

        if (options.offset) {
            query += ' OFFSET $' + (paramIndex + 1);
            params.push(options.offset);
        }

        const result = await pool.query(query, params);
        return result.rows.map(usuario => new Usuario(usuario));
    }

    // Atualizar usuário
    async save() {
        const pool = databaseManager.getPool();
        
        if (this.id) {
            // Atualizar
            const query = `
                UPDATE usuarios 
                SET username = $1, email = $2, nome = $3, role = $4, tipo = $5, ativo = $6, updated_at = CURRENT_TIMESTAMP
                WHERE id = $7
                RETURNING *
            `;

            const values = [
                this.username,
                this.email,
                this.nome,
                this.role,
                this.tipo,
                this.ativo,
                this.id
            ];

            const result = await pool.query(query, values);
            const updatedUsuario = result.rows[0];
            
            // Atualizar instância atual
            Object.assign(this, new Usuario(updatedUsuario));
            
            return this;
        } else {
            // Criar novo
            return await Usuario.create(this);
        }
    }

    // Atualizar senha
    async updatePassword(newPassword) {
        const pool = databaseManager.getPool();
        const query = `
            UPDATE usuarios 
            SET password = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;
        
        const result = await pool.query(query, [newPassword, this.id]);
        const updatedUsuario = result.rows[0];
        
        // Atualizar instância atual
        Object.assign(this, new Usuario(updatedUsuario));
        
        return this;
    }

    // Deletar usuário
    static async findByIdAndDelete(id) {
        const pool = databaseManager.getPool();
        const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING *', [id]);
        return result.rows[0] ? new Usuario(result.rows[0]) : null;
    }

    // Contar usuários
    static async count(options = {}) {
        const pool = databaseManager.getPool();
        let query = 'SELECT COUNT(*) FROM usuarios';
        const params = [];
        let paramIndex = 1;

        if (options.ativo !== undefined) {
            query += ' WHERE ativo = $' + paramIndex;
            params.push(options.ativo);
        }

        const result = await pool.query(query, params);
        return parseInt(result.rows[0].count);
    }

    // Converter para JSON
    toJSON() {
        return {
            id: this.id,
            username: this.username,
            email: this.email,
            nome: this.nome,
            role: this.role,
            tipo: this.tipo,
            ativo: this.ativo,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Usuario;

