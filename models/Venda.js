const databaseManager = require('../config/database');
const SecurityUtils = require('../utils/securityUtils');

class Venda {
    constructor(data = {}) {
        this.id = data.id;
        this.produtoId = data.produto_id;
        this.clienteNome = data.cliente_nome;
        this.clienteEmail = data.cliente_email;
        this.clienteTelefone = data.cliente_telefone;
        this.clienteCpf = data.cliente_cpf;
        this.clienteEndereco = data.cliente_endereco;
        this.clienteCidade = data.cliente_cidade;
        this.clientePais = data.cliente_pais;
        this.clienteIp = data.cliente_ip;
        this.clienteUserAgent = data.cliente_user_agent;
        this.clienteDispositivo = data.cliente_dispositivo;
        this.clienteNavegador = data.cliente_navegador;
        this.pagamentoMetodo = data.pagamento_metodo;
        this.pagamentoValor = data.pagamento_valor;
        this.pagamentoValorOriginal = data.pagamento_valor_original;
        this.pagamentoDesconto = data.pagamento_desconto || 0;
        this.pagamentoCupom = data.pagamento_cupom;
        this.pagamentoStatus = data.pagamento_status || 'Pendente';
        this.pagamentoTransacaoId = data.pagamento_transacao_id;
        this.pagamentoGateway = data.pagamento_gateway || 'Local';
        this.pagamentoDataProcessamento = data.pagamento_data_processamento;
        this.pagamentoReferencia = data.pagamento_referencia;
        this.pagamentoComprovante = data.pagamento_comprovante;
        this.afiliadoCodigo = data.afiliado_codigo;
        this.afiliadoComissao = data.afiliado_comissao || 0;
        this.status = data.status || 'Aguardando Pagamento';
        this.dataVenda = data.data_venda;
        this.dataEntrega = data.data_entrega;
        this.observacoes = data.observacoes;
        this.ip = data.ip;
        this.userAgent = data.user_agent;
        this.canalVenda = data.canal_venda || 'Site';
        this.origemTrafico = data.origem_trafico;
        this.campanha = data.campanha;
        this.utmSource = data.utm_source;
        this.utmMedium = data.utm_medium;
        this.utmCampaign = data.utm_campaign;
    }

    // Criar nova venda
    static async create(vendaData) {
        const pool = databaseManager.getPool();
        
        // Validar e sanitizar dados
        if (vendaData.clienteNome) {
            vendaData.clienteNome = SecurityUtils.sanitizarDados(vendaData.clienteNome);
        }
        if (vendaData.clienteEmail) {
            vendaData.clienteEmail = SecurityUtils.sanitizarDados(vendaData.clienteEmail);
        }
        if (vendaData.clienteTelefone) {
            vendaData.clienteTelefone = SecurityUtils.sanitizarDados(vendaData.clienteTelefone);
        }
        
        // Validar valor em MZN
        if (vendaData.pagamentoValor && !SecurityUtils.validarValorMZN(vendaData.pagamentoValor)) {
            throw new Error('Valor inválido. O valor deve estar entre 1 e 50.000 MZN');
        }
        
        // Gerar transação ID seguro se não fornecido
        if (!vendaData.pagamentoTransacaoId) {
            vendaData.pagamentoTransacaoId = SecurityUtils.gerarTransacaoIdSeguro();
        } else {
            // Se o ID foi fornecido pelo gateway de pagamento, aceitar sem validação rigorosa
            // Apenas verificar se é uma string válida
            if (typeof vendaData.pagamentoTransacaoId !== 'string' || vendaData.pagamentoTransacaoId.trim().length === 0) {
                throw new Error('ID de transação inválido');
            }
        }

        // Detectar dispositivo e navegador
        if (vendaData.userAgent) {
            const deviceInfo = this.detectarDispositivo(vendaData.userAgent);
            vendaData.clienteDispositivo = deviceInfo.dispositivo;
            vendaData.clienteNavegador = deviceInfo.navegador;
        }

        const query = `
            INSERT INTO vendas (
                produto_id, cliente_nome, cliente_email, cliente_telefone, cliente_cpf, cliente_endereco,
                cliente_cidade, cliente_pais, cliente_ip, cliente_user_agent, cliente_dispositivo, cliente_navegador,
                pagamento_metodo, pagamento_valor, pagamento_valor_original, pagamento_desconto, 
                pagamento_cupom, pagamento_status, pagamento_transacao_id, pagamento_gateway,
                pagamento_referencia, pagamento_comprovante, afiliado_codigo, afiliado_comissao, 
                status, observacoes, ip, user_agent, canal_venda, origem_trafico, campanha,
                utm_source, utm_medium, utm_campaign
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34)
            RETURNING *
        `;

        const values = [
            vendaData.produtoId,
            vendaData.clienteNome,
            vendaData.clienteEmail,
            vendaData.clienteTelefone,
            vendaData.clienteCpf,
            vendaData.clienteEndereco,
            vendaData.clienteCidade,
            vendaData.clientePais,
            vendaData.clienteIp,
            vendaData.clienteUserAgent,
            vendaData.clienteDispositivo,
            vendaData.clienteNavegador,
            vendaData.pagamentoMetodo,
            vendaData.pagamentoValor,
            vendaData.pagamentoValorOriginal,
            vendaData.pagamentoDesconto,
            vendaData.pagamentoCupom,
            vendaData.pagamentoStatus,
            vendaData.pagamentoTransacaoId,
            vendaData.pagamentoGateway,
            vendaData.pagamentoReferencia,
            vendaData.pagamentoComprovante,
            vendaData.afiliadoCodigo,
            vendaData.afiliadoComissao,
            vendaData.status,
            vendaData.observacoes,
            vendaData.ip,
            vendaData.userAgent,
            vendaData.canalVenda,
            vendaData.origemTrafico,
            vendaData.campanha,
            vendaData.utmSource,
            vendaData.utmMedium,
            vendaData.utmCampaign
        ];

        const result = await pool.query(query, values);
        return new Venda(result.rows[0]);
    }

    // Detectar dispositivo e navegador
    static detectarDispositivo(userAgent) {
        const ua = userAgent.toLowerCase();
        
        let dispositivo = 'Desktop';
        if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
            dispositivo = 'Mobile';
        } else if (ua.includes('tablet') || ua.includes('ipad')) {
            dispositivo = 'Tablet';
        }
        
        let navegador = 'Outro';
        if (ua.includes('chrome')) {
            navegador = 'Chrome';
        } else if (ua.includes('firefox')) {
            navegador = 'Firefox';
        } else if (ua.includes('safari') && !ua.includes('chrome')) {
            navegador = 'Safari';
        } else if (ua.includes('edge')) {
            navegador = 'Edge';
        }
        
        return { dispositivo, navegador };
    }

    // Buscar por ID
    static async findById(id) {
        const pool = databaseManager.getPool();
        const result = await pool.query('SELECT * FROM vendas WHERE id = $1', [id]);
        return result.rows[0] ? new Venda(result.rows[0]) : null;
    }

    // Buscar por transação ID
    static async findByTransacaoId(transacaoId) {
        const pool = databaseManager.getPool();
        const result = await pool.query('SELECT * FROM vendas WHERE pagamento_transacao_id = $1', [transacaoId]);
        return result.rows[0] ? new Venda(result.rows[0]) : null;
    }

    // Buscar por cliente
    static async findByCliente(email, telefone) {
        const pool = databaseManager.getPool();
        const query = `
            SELECT * FROM vendas 
            WHERE cliente_email = $1 OR cliente_telefone = $2
            ORDER BY data_venda DESC
        `;
        const result = await pool.query(query, [email, telefone]);
        return result.rows.map(venda => new Venda(venda));
    }

    // Buscar todas as vendas
    static async findAll(options = {}) {
        const pool = databaseManager.getPool();
        let query = 'SELECT * FROM vendas';
        const params = [];
        let paramIndex = 1;

        // Filtros
        const conditions = [];
        
        if (options.status) {
            conditions.push(`status = $${paramIndex}`);
            params.push(options.status);
            paramIndex++;
        }
        
        if (options.pagamentoStatus) {
            conditions.push(`pagamento_status = $${paramIndex}`);
            params.push(options.pagamentoStatus);
            paramIndex++;
        }
        
        if (options.produtoId) {
            conditions.push(`produto_id = $${paramIndex}`);
            params.push(options.produtoId);
            paramIndex++;
        }
        
        if (options.dataInicio) {
            conditions.push(`data_venda >= $${paramIndex}`);
            params.push(options.dataInicio);
            paramIndex++;
        }
        
        if (options.dataFim) {
            conditions.push(`data_venda <= $${paramIndex}`);
            params.push(options.dataFim);
            paramIndex++;
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        // Ordenação
        query += ' ORDER BY data_venda DESC';

        // Paginação
        if (options.limit) {
            query += ` LIMIT $${paramIndex}`;
            params.push(options.limit);
            paramIndex++;
        }

        if (options.offset) {
            query += ` OFFSET $${paramIndex}`;
            params.push(options.offset);
        }

        const result = await pool.query(query, params);
        return result.rows.map(venda => new Venda(venda));
    }

    // Atualizar venda
    async save() {
        const pool = databaseManager.getPool();
        
        if (this.id) {
            // Atualizar
            const query = `
                UPDATE vendas 
                SET produto_id = $1, cliente_nome = $2, cliente_email = $3, cliente_telefone = $4,
                    cliente_cpf = $5, cliente_endereco = $6, cliente_cidade = $7, cliente_pais = $8,
                    cliente_ip = $9, cliente_user_agent = $10, cliente_dispositivo = $11, cliente_navegador = $12,
                    pagamento_metodo = $13, pagamento_valor = $14, pagamento_valor_original = $15,
                    pagamento_desconto = $16, pagamento_cupom = $17, pagamento_status = $18,
                    pagamento_transacao_id = $19, pagamento_gateway = $20, pagamento_data_processamento = $21,
                    pagamento_referencia = $22, pagamento_comprovante = $23, afiliado_codigo = $24,
                    afiliado_comissao = $25, status = $26, data_entrega = $27, observacoes = $28,
                    ip = $29, user_agent = $30, canal_venda = $31, origem_trafico = $32,
                    campanha = $33, utm_source = $34, utm_medium = $35, utm_campaign = $36
                WHERE id = $37
                RETURNING *
            `;

            const values = [
                this.produtoId, this.clienteNome, this.clienteEmail, this.clienteTelefone,
                this.clienteCpf, this.clienteEndereco, this.clienteCidade, this.clientePais,
                this.clienteIp, this.clienteUserAgent, this.clienteDispositivo, this.clienteNavegador,
                this.pagamentoMetodo, this.pagamentoValor, this.pagamentoValorOriginal,
                this.pagamentoDesconto, this.pagamentoCupom, this.pagamentoStatus,
                this.pagamentoTransacaoId, this.pagamentoGateway, this.pagamentoDataProcessamento,
                this.pagamentoReferencia, this.pagamentoComprovante, this.afiliadoCodigo,
                this.afiliadoComissao, this.status, this.dataEntrega, this.observacoes,
                this.ip, this.userAgent, this.canalVenda, this.origemTrafico,
                this.campanha, this.utmSource, this.utmMedium, this.utmCampaign, this.id
            ];

            const result = await pool.query(query, values);
            const updatedVenda = result.rows[0];
            
            // Atualizar instância atual
            Object.assign(this, new Venda(updatedVenda));
            
            return this;
        } else {
            // Criar novo
            return await Venda.create(this);
        }
    }

    // Deletar venda
    static async findByIdAndDelete(id) {
        const pool = databaseManager.getPool();
        const result = await pool.query('DELETE FROM vendas WHERE id = $1 RETURNING *', [id]);
        return result.rows[0] ? new Venda(result.rows[0]) : null;
    }

    // Atualizar status de pagamento
    static async updatePaymentStatus(transacaoId, status) {
        const pool = databaseManager.getPool();
        const query = `
            UPDATE vendas 
            SET pagamento_status = $1, pagamento_data_processamento = CURRENT_TIMESTAMP
            WHERE pagamento_transacao_id = $2
            RETURNING *
        `;
        const result = await pool.query(query, [status, transacaoId]);
        return result.rows[0] ? new Venda(result.rows[0]) : null;
    }

    // Atualizar status geral
    static async updateStatus(transacaoId, status) {
        const pool = databaseManager.getPool();
        const result = await pool.query(
            'UPDATE vendas SET status = $1 WHERE pagamento_transacao_id = $2 RETURNING *',
            [status, transacaoId]
        );
        return result.rows[0] ? new Venda(result.rows[0]) : null;
    }

    // Gerar transação ID
    static gerarTransacaoId() {
        return 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    // Gerar referência ID
    static gerarReferenciaId() {
        return 'REF' + Date.now() + Math.random().toString(36).substr(2, 6).toUpperCase();
    }

    // Formatar valor MZN
    static formatarValorMZN(valor) {
        if (typeof valor === 'string') {
            valor = parseFloat(valor.replace(/[^\d.,]/g, '').replace(',', '.'));
        }
        
        if (isNaN(valor) || valor <= 0) {
            throw new Error('Valor inválido');
        }
        
        // Limitar a 2 casas decimais
        return Math.round(valor * 100) / 100;
    }

    // Processar pagamento
    async processarPagamento() {
        try {
            // Validar dados obrigatórios
            if (!this.produtoId || !this.clienteEmail || !this.pagamentoValor) {
                throw new Error('Dados obrigatórios não fornecidos');
            }

            // Validar valor
            this.pagamentoValor = Venda.formatarValorMZN(this.pagamentoValor);
            
            if (!SecurityUtils.validarValorMZN(this.pagamentoValor)) {
                throw new Error('Valor inválido. O valor deve estar entre 1 e 50.000 MZN');
            }

            // Definir valor original se não fornecido
            if (!this.pagamentoValorOriginal) {
                this.pagamentoValorOriginal = this.pagamentoValor;
            }

            // Salvar venda
            const vendaSalva = await this.save();
            
            // Incrementar contador de vendas do produto
            await require('./Produto').incrementVendas(this.produtoId);
            
            return vendaSalva;
        } catch (error) {
            console.error('Erro ao processar pagamento:', error);
            throw error;
        }
    }

    // Buscar por período
    static async findByPeriod(startDate, endDate) {
        const pool = databaseManager.getPool();
        const query = `
            SELECT * FROM vendas 
            WHERE data_venda >= $1 AND data_venda <= $2
            ORDER BY data_venda DESC
        `;
        const result = await pool.query(query, [startDate, endDate]);
        return result.rows.map(venda => new Venda(venda));
    }

    // Obter estatísticas
    static async getStats() {
        const pool = databaseManager.getPool();
        
        // Estatísticas gerais
        const totalVendas = await pool.query('SELECT COUNT(*) FROM vendas');
        const vendasPagas = await pool.query("SELECT COUNT(*) FROM vendas WHERE status = 'Pago'");
        const receitaTotal = await pool.query("SELECT COALESCE(SUM(pagamento_valor), 0) FROM vendas WHERE status = 'Pago'");
        
        // Vendas por método de pagamento
        const vendasPorMetodo = await pool.query(`
            SELECT pagamento_metodo, COUNT(*) as total, COALESCE(SUM(pagamento_valor), 0) as valor_total
            FROM vendas 
            WHERE status = 'Pago'
            GROUP BY pagamento_metodo
        `);
        
        // Vendas por status
        const vendasPorStatus = await pool.query(`
            SELECT status, COUNT(*) as total
            FROM vendas 
            GROUP BY status
        `);

        return {
            totalVendas: parseInt(totalVendas.rows[0].count),
            vendasPagas: parseInt(vendasPagas.rows[0].count),
            receitaTotal: parseFloat(receitaTotal.rows[0].coalesce),
            vendasPorMetodo: vendasPorMetodo.rows,
            vendasPorStatus: vendasPorStatus.rows
        };
    }

    // Contar vendas
    static async count(options = {}) {
        const pool = databaseManager.getPool();
        let query = 'SELECT COUNT(*) FROM vendas';
        const params = [];
        let paramIndex = 1;

        if (options.status) {
            query += ` WHERE status = $${paramIndex}`;
            params.push(options.status);
        }

        const result = await pool.query(query, params);
        return parseInt(result.rows[0].count);
    }

    // Converter para JSON
    toJSON() {
        return {
            id: this.id,
            produtoId: this.produtoId,
            clienteNome: this.clienteNome,
            clienteEmail: this.clienteEmail,
            clienteTelefone: this.clienteTelefone,
            clienteCpf: this.clienteCpf,
            clienteEndereco: this.clienteEndereco,
            clienteCidade: this.clienteCidade,
            clientePais: this.clientePais,
            clienteIp: this.clienteIp,
            clienteUserAgent: this.clienteUserAgent,
            clienteDispositivo: this.clienteDispositivo,
            clienteNavegador: this.clienteNavegador,
            pagamentoMetodo: this.pagamentoMetodo,
            pagamentoValor: this.pagamentoValor,
            pagamentoValorOriginal: this.pagamentoValorOriginal,
            pagamentoDesconto: this.pagamentoDesconto,
            pagamentoCupom: this.pagamentoCupom,
            pagamentoStatus: this.pagamentoStatus,
            pagamentoTransacaoId: this.pagamentoTransacaoId,
            pagamentoGateway: this.pagamentoGateway,
            pagamentoDataProcessamento: this.pagamentoDataProcessamento,
            pagamentoReferencia: this.pagamentoReferencia,
            pagamentoComprovante: this.pagamentoComprovante,
            afiliadoCodigo: this.afiliadoCodigo,
            afiliadoComissao: this.afiliadoComissao,
            status: this.status,
            dataVenda: this.dataVenda,
            dataEntrega: this.dataEntrega,
            observacoes: this.observacoes,
            ip: this.ip,
            userAgent: this.userAgent,
            canalVenda: this.canalVenda,
            origemTrafico: this.origemTrafico,
            campanha: this.campanha,
            utmSource: this.utmSource,
            utmMedium: this.utmMedium,
            utmCampaign: this.utmCampaign
        };
    }
}

module.exports = Venda;

