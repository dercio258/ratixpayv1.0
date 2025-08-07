const axios = require('axios');
const config = require('../config/paymoz');

class PayMozService {
    constructor() {
        this.config = config;
        this.client = axios.create({
            baseURL: config.baseUrl,
            timeout: config.timeout,
            headers: config.headers
        });
    }

    /**
     * Processa pagamento via M-Pesa
     * @param {string} numeroCelular - Número do celular
     * @param {number} valor - Valor do pagamento
     * @returns {Promise<Object>} - Resposta da API
     */
    async processarPagamentoMpesa(numeroCelular, valor) {
        try {
            console.log(`🔄 Processando pagamento M-Pesa: ${numeroCelular} - MZN ${valor}`);
            
            const response = await this.client.post(config.endpoints.mpesa, {
                numero_celular: numeroCelular,
                valor: valor
            });

            console.log(`✅ Pagamento M-Pesa processado:`, response.data);
            return {
                success: true,
                data: response.data,
                metodo: 'mpesa'
            };
        } catch (error) {
            console.error(`❌ Erro no pagamento M-Pesa:`, error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message,
                metodo: 'mpesa'
            };
        }
    }

    /**
     * Processa pagamento via e-Mola
     * @param {string} numeroCelular - Número do celular
     * @param {number} valor - Valor do pagamento
     * @returns {Promise<Object>} - Resposta da API
     */
    async processarPagamentoEmola(numeroCelular, valor) {
        try {
            console.log(`🔄 Processando pagamento e-Mola: ${numeroCelular} - MZN ${valor}`);
            
            const response = await this.client.post(config.endpoints.emola, {
                numero_celular: numeroCelular,
                valor: valor
            });

            console.log(`✅ Pagamento e-Mola processado:`, response.data);
            return {
                success: true,
                data: response.data,
                metodo: 'emola'
            };
        } catch (error) {
            console.error(`❌ Erro no pagamento e-Mola:`, error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message,
                metodo: 'emola'
            };
        }
    }

    /**
     * Processa pagamento baseado no método escolhido
     * @param {string} metodo - Método de pagamento (mpesa ou emola)
     * @param {string} numeroCelular - Número do celular
     * @param {number} valor - Valor do pagamento
     * @returns {Promise<Object>} - Resposta da API
     */
    async processarPagamento(metodo, numeroCelular, valor) {
        // Validar método
        if (!['mpesa', 'emola'].includes(metodo)) {
            return {
                success: false,
                error: 'Método de pagamento inválido. Use "mpesa" ou "emola".',
                metodo: metodo
            };
        }

        // Validar número de celular
        if (!this.validarNumeroCelular(numeroCelular)) {
            return {
                success: false,
                error: 'Número de celular inválido. Use formato: 84xxxxxxx',
                metodo: metodo
            };
        }

        // Validar valor
        if (!this.validarValor(valor)) {
            return {
                success: false,
                error: 'Valor inválido. Deve ser maior que 0.',
                metodo: metodo
            };
        }

        // Processar pagamento baseado no método
        if (metodo === 'mpesa') {
            return await this.processarPagamentoMpesa(numeroCelular, valor);
        } else if (metodo === 'emola') {
            return await this.processarPagamentoEmola(numeroCelular, valor);
        }
    }

    /**
     * Valida número de celular moçambicano
     * @param {string} numero - Número do celular
     * @returns {boolean} - Se é válido
     */
    validarNumeroCelular(numero) {
        // Formato moçambicano: 84xxxxxxx ou +25884xxxxxxx
        const regex = /^(\+258)?8[4-7]\d{7}$/;
        return regex.test(numero);
    }

    /**
     * Valida valor do pagamento
     * @param {number} valor - Valor do pagamento
     * @returns {boolean} - Se é válido
     */
    validarValor(valor) {
        return typeof valor === 'number' && valor > 0;
    }

    /**
     * Formata número de celular para o formato esperado pela API
     * @param {string} numero - Número do celular
     * @returns {string} - Número formatado
     */
    formatarNumeroCelular(numero) {
        // Remove caracteres não numéricos
        let numeroLimpo = numero.replace(/\D/g, '');
        
        // Se começar com 258, remove
        if (numeroLimpo.startsWith('258')) {
            numeroLimpo = numeroLimpo.substring(3);
        }
        
        // Se não começar com 8, adiciona 84 como padrão
        if (!numeroLimpo.startsWith('8')) {
            numeroLimpo = '84' + numeroLimpo;
        }
        
        return numeroLimpo;
    }
}

module.exports = new PayMozService(); 