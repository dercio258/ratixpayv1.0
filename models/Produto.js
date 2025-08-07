const databaseManager = require('../config/database');

class Produto {
    constructor(data = {}) {
        this.id = data.id;
        this.customId = data.custom_id;
        this.nome = data.nome;
        this.tipo = data.tipo;
        this.preco = data.preco;
        this.desconto = data.desconto || 0;
        this.precoComDesconto = data.preco_com_desconto;
        this.descricao = data.descricao;
        this.imagemUrl = data.imagem_url;
        this.linkConteudo = data.link_conteudo;
        this.ativo = data.ativo !== undefined ? data.ativo : true;
        this.vendas = data.vendas || 0;
        this.createdAt = data.created_at;
        this.updatedAt = data.updated_at;
    }

    // Criar novo produto
    static async create(produtoData) {
        const pool = databaseManager.getPool();
        
        // Calcular preço com desconto se não fornecido
        if (!produtoData.precoComDesconto && produtoData.desconto > 0) {
            produtoData.precoComDesconto = produtoData.preco - (produtoData.preco * produtoData.desconto / 100);
        } else if (!produtoData.precoComDesconto) {
            produtoData.precoComDesconto = produtoData.preco;
        }

        const query = `
            INSERT INTO produtos (custom_id, nome, tipo, preco, desconto, preco_com_desconto, descricao, imagem_url, link_conteudo, ativo)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;

        const values = [
            produtoData.customId || null,
            produtoData.nome || null,
            produtoData.tipo || null,
            produtoData.preco || null,
            produtoData.desconto || 0,
            produtoData.precoComDesconto || null,
            produtoData.descricao || null,
            produtoData.imagemUrl || null,
            produtoData.linkConteudo || null,
            produtoData.ativo !== undefined ? produtoData.ativo : true
        ];

        const result = await pool.query(query, values);
        return new Produto(result.rows[0]);
    }

    // Buscar por ID
    static async findById(id) {
        const pool = databaseManager.getPool();
        const result = await pool.query('SELECT * FROM produtos WHERE id = $1', [id]);
        return result.rows[0] ? new Produto(result.rows[0]) : null;
    }

    // Buscar por customId
    static async findByCustomId(customId) {
        const pool = databaseManager.getPool();
        const result = await pool.query('SELECT * FROM produtos WHERE custom_id = $1', [customId]);
        return result.rows[0] ? new Produto(result.rows[0]) : null;
    }

    // Buscar todos os produtos
    static async findAll(options = {}) {
        const pool = databaseManager.getPool();
        let query = 'SELECT * FROM produtos';
        const params = [];
        let paramIndex = 1;

        // Filtros
        if (options.ativo !== undefined) {
            query += ' WHERE ativo = $' + paramIndex;
            params.push(options.ativo);
            paramIndex++;
        }

        // Ordenação
        query += ' ORDER BY created_at DESC';

        // Paginação
        if (options.limit) {
            query += ' LIMIT $' + paramIndex;
            params.push(options.limit);
            paramIndex++;
        }

        if (options.offset) {
            query += ' OFFSET $' + paramIndex;
            params.push(options.offset);
        }

        const result = await pool.query(query, params);
        return result.rows.map(produto => new Produto(produto));
    }

    // Atualizar produto
    async save() {
        const pool = databaseManager.getPool();
        
        // Calcular preço com desconto se não fornecido
        if (!this.precoComDesconto && this.desconto > 0) {
            this.precoComDesconto = this.preco - (this.preco * this.desconto / 100);
        } else if (!this.precoComDesconto) {
            this.precoComDesconto = this.preco;
        }

        const query = `
            UPDATE produtos 
            SET custom_id = $1, nome = $2, tipo = $3, preco = $4, desconto = $5, 
                preco_com_desconto = $6, descricao = $7, imagem_url = $8, link_conteudo = $9, 
                ativo = $10, vendas = $11, updated_at = CURRENT_TIMESTAMP
            WHERE id = $12
            RETURNING *
        `;

        const values = [
            this.customId,
            this.nome,
            this.tipo,
            this.preco,
            this.desconto,
            this.precoComDesconto,
            this.descricao,
            this.imagemUrl,
            this.linkConteudo,
            this.ativo,
            this.vendas,
            this.id
        ];

        const result = await pool.query(query, values);
        const updatedProduto = result.rows[0];
        
        // Atualizar instância atual
        Object.assign(this, new Produto(updatedProduto));
        
        return this;
    }

    // Deletar produto
    static async findByIdAndDelete(id) {
        const pool = databaseManager.getPool();
        const result = await pool.query('DELETE FROM produtos WHERE id = $1 RETURNING *', [id]);
        return result.rows[0] ? new Produto(result.rows[0]) : null;
    }

    // Incrementar vendas
    static async incrementVendas(id) {
        const pool = databaseManager.getPool();
        await pool.query('UPDATE produtos SET vendas = vendas + 1 WHERE id = $1', [id]);
    }

    // Buscar produtos ativos
    static async findAtivos() {
        return this.findAll({ ativo: true });
    }

    // Contar produtos
    static async count(options = {}) {
        const pool = databaseManager.getPool();
        let query = 'SELECT COUNT(*) FROM produtos';
        const params = [];
        let paramIndex = 1;

        if (options.ativo !== undefined) {
            query += ' WHERE ativo = $' + paramIndex;
            params.push(options.ativo);
        }

        const result = await pool.query(query, params);
        return parseInt(result.rows[0].count);
    }

    // Buscar produtos com estatísticas
    static async findWithStats() {
        const pool = databaseManager.getPool();
        const query = `
            SELECT p.*, 
                   COUNT(v.id) as total_vendas,
                   COALESCE(SUM(v.pagamento_valor), 0) as receita_total
            FROM produtos p
            LEFT JOIN vendas v ON p.id = v.produto_id
            GROUP BY p.id
            ORDER BY p.created_at DESC
        `;

        const result = await pool.query(query);
        return result.rows.map(row => ({
            ...new Produto(row),
            totalVendas: parseInt(row.total_vendas),
            receitaTotal: parseFloat(row.receita_total)
        }));
    }

    // Converter para JSON
    toJSON() {
        return {
            id: this.id,
            customId: this.customId,
            nome: this.nome,
            tipo: this.tipo,
            preco: this.preco,
            desconto: this.desconto,
            precoComDesconto: this.precoComDesconto,
            descricao: this.descricao,
            imagemUrl: this.imagemUrl,
            linkConteudo: this.linkConteudo,
            ativo: this.ativo,
            vendas: this.vendas,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Produto;

