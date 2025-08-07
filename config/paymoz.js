module.exports = {
    // Configurações da API PayMoz
    apiKey: 'neura-59e14acb-f35d-4dc0-a634-d9226bf57c72',
    baseUrl: 'https://paymoz.tech/api/v1',
    
    // Endpoints
    endpoints: {
        mpesa: '/payment/mpesa/',
        emola: '/payment/emola/'
    },
    
    // Headers padrão
    headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'neura-59e14acb-f35d-4dc0-a634-d9226bf57c72'
    },
    
    // Configurações de timeout
    timeout: 30000, // 30 segundos
    
    // Status de resposta
    status: {
        SUCCESS: 'success',
        FAILED: 'failed',
        PENDING: 'pending'
    }
}; 