

// Configuração da API
const API_BASE = 'http://localhost:3000/api';





// Variáveis globais
let currentProduct = null;
let orderData = {};

// Função para fazer requisições à API
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erro na API:', error);
        throw error;
    }
}

// Função para mostrar notificação
function showNotification(message, type = 'success') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: bold;
                z-index: 1000;
                animation: slideIn 0.3s ease;
            }
            .notification.success { background: #28a745; }
            .notification.error { background: #dc3545; }
            .notification.warning { background: #ffc107; color: #333; }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .notification button {
                background: none;
                border: none;
                color: inherit;
                font-size: 18px;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Função para carregar produto
async function loadProduct() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        showNotification('ID do produto não encontrado', 'error');
        return;
    }
    
    try {
        // Tentar buscar por customId primeiro, depois por ID
        currentProduct = await apiRequest(`/produtos/${productId}`);
        displayProduct();
    } catch (error) {
        console.error('Erro ao carregar produto:', error);
        showNotification('Erro ao carregar produto', 'error');
        
        // Usar produto de fallback se a API falhar
        currentProduct = {
            _id: productId,
            nome: 'Produto de Exemplo',
            tipo: 'Curso Online',
            preco: 297.00,
            desconto: 10,
            precoComDesconto: 267.30,
            descricao: 'Produto de exemplo para demonstração'
        };
        displayProduct();
    }
}

function displayProduct() {
    if (!currentProduct) return;

    const nameEl = document.getElementById('productName');
    if (nameEl) nameEl.textContent = currentProduct.nome;

    const customIdEl = document.getElementById('productCustomId');
            if (customIdEl) customIdEl.textContent = currentProduct.customId || currentProduct.id;

    const typeEl = document.getElementById('productType');
    if (typeEl) typeEl.textContent = currentProduct.tipo;

    const priceEl = document.getElementById('productPrice');
    if (priceEl) priceEl.textContent = `MZN ${currentProduct.preco.toFixed(2).replace('.', ',')}`;

    const discountEl = document.getElementById('productDiscount');
    const finalPriceEl = document.getElementById('finalPrice');
    const discountInfoEl = document.getElementById('discountInfo');
    if (currentProduct.desconto > 0) {
        if (discountEl) discountEl.textContent = `${currentProduct.desconto}% OFF`;
        if (finalPriceEl) finalPriceEl.textContent = `MZN ${currentProduct.precoComDesconto.toFixed(2).replace('.', ',')}`;
        if (discountInfoEl) discountInfoEl.style.display = 'block';
    } else {
        if (finalPriceEl) finalPriceEl.textContent = `MZN ${currentProduct.preco.toFixed(2).replace('.', ',')}`;
        if (discountInfoEl) discountInfoEl.style.display = 'none';
    }

    const descEl = document.getElementById('productDescription');
    if (descEl) descEl.textContent = currentProduct.descricao || '';

    const totalEl = document.getElementById('total');
    if (totalEl) totalEl.textContent = `MZN ${(currentProduct.precoComDesconto || currentProduct.preco).toFixed(2).replace('.', ',')}`;

    // Montar a tag img com a url e o onerror para fallback SVG em base64
    const imagemUrl = currentProduct.imagemUrl || currentProduct.imageUrl || '';
    const imgHTML = `<img src="${imagemUrl}" alt="${currentProduct.nome}" class="product-image"
        onerror="this.onerror=null;this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjhGOUZBIi8+CjxwYXRoIGQ9Ik00MCAyOEMzNy43OTA5IDI4IDM2IDI5Ljc5MDkgMzYgMzJWNDhDMzYgNTAuMjA5MSAzNy43OTA5IDUyIDQwIDUySDQ4QzUwLjIwOTEgNTIgNTIgNTAuMjA5MSA1MiA0OFY0OEM1MiA0NS43OTA5IDUwLjIwOTEgNDQgNDggNDRINDBDMzcuNzkwOSA0NCAzNiA0NS43OTA5IDM2IDQ4VjMyWiIgZmlsbD0iI0U5RUNFRiIvPgo8L3N2Zz4K';">`;
    const productCard = document.getElementById('productCard');
    const imgExistente = productCard ? productCard.querySelector('img.product-image') : null;
    if (productCard) {
        if (imgExistente) {
            imgExistente.outerHTML = imgHTML;
        } else {
            productCard.insertAdjacentHTML('afterbegin', imgHTML);
        }
    }
}



// Função para validar formulário
function validateForm() {
    const requiredFields = [
        'fullName',
        'email',
        'phone'
    ];
    
    for (let fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            field?.focus();
            showNotification(`Por favor, preencha o campo: ${field?.placeholder || fieldId}`, 'error');
            return false;
        }
    }
    
    // Validar método de pagamento
    const metodoPagamento = document.querySelector('input[name="paymentMethod"]:checked');
    if (!metodoPagamento) {
        showNotification('Selecione um método de pagamento', 'error');
        return false;
    }
    
    // Validar formato do telefone
    const telefone = document.getElementById('phone').value.trim();
    const telefoneRegex = /^(\+258)?8[4-7]\d{7}$/;
    if (!telefoneRegex.test(telefone)) {
        showNotification('Número de telefone inválido. Use formato: 84xxxxxxx ou 86xxxxxxx', 'error');
        document.getElementById('phone').focus();
        return false;
    }
    
    return true;
}

// Função para coletar dados do formulário
function collectFormData() {
    orderData.customer = {
        nome: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        telefone: document.getElementById('phone').value.trim()
    };
    
    orderData.product = currentProduct;
    orderData.coupon = currentProduct.cupomAplicado || '';
    
    // Obter método de pagamento
    const metodoPagamento = document.querySelector('input[name="paymentMethod"]:checked');
    orderData.paymentMethod = metodoPagamento ? metodoPagamento.value : null;
}

// Função para mostrar spinner de loading
function showLoadingSpinner(message = 'Processando pagamento...') {
    let spinner = document.getElementById('loadingSpinner');
    if (!spinner) {
        spinner = document.createElement('div');
        spinner.id = 'loadingSpinner';
        spinner.innerHTML = `
            <div class="spinner-overlay">
                <div class="spinner-container">
                    <div class="spinner"></div>
                    <div class="spinner-message">${message}</div>
                    <div class="spinner-subtitle">Não feche esta página</div>
                </div>
            </div>
        `;
        const style = document.createElement('style');
        style.textContent = `
            .spinner-overlay {
                position: fixed; 
                top: 0; 
                left: 0; 
                width: 100vw; 
                height: 100vh;
                background: rgba(0,0,0,0.8); 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                z-index: 3000;
                backdrop-filter: blur(5px);
            }
            .spinner-container {
                text-align: center;
                background: white;
                padding: 40px;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                max-width: 400px;
                width: 90%;
            }
            .spinner {
                border: 4px solid #f3f3f3; 
                border-top: 4px solid #3b82f6; 
                border-radius: 50%; 
                width: 60px; 
                height: 60px; 
                animation: spin 1s linear infinite;
                margin: 0 auto 20px;
            }
            @keyframes spin { 
                0% { transform: rotate(0deg); } 
                100% { transform: rotate(360deg); } 
            }
            .spinner-message { 
                color: #333; 
                font-size: 1.2rem; 
                margin-bottom: 10px; 
                font-weight: bold; 
            }
            .spinner-subtitle {
                color: #666;
                font-size: 0.9rem;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(spinner);
    } else {
        spinner.querySelector('.spinner-message').textContent = message;
        spinner.style.display = 'flex';
    }
}

function hideLoadingSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.style.display = 'none';
}



// Função para mostrar status da transação
function showTransactionStatus(status, valor, transacaoId) {
    let statusMsg = '';
    let color = '#888';
    let icon = 'info-circle';
    
    if (status === 'pending' || status === 'pendente') {
        statusMsg = 'Transação pendente. Aguarde e digite o PIN no seu celular.';
        color = '#f59e42';
        icon = 'clock';
    } else if (status === 'completed' || status === 'concluida' || status === 'aprovado') {
        statusMsg = 'Pagamento concluído com sucesso!';
        color = '#28a745';
        icon = 'check-circle';
    } else if (status === 'failed' || status === 'falha' || status === 'rejeitado') {
        statusMsg = 'Pagamento falhou ou foi cancelado.';
        color = '#dc3545';
        icon = 'times-circle';
    }
    
    const modal = document.createElement('div');
    modal.className = 'transaction-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="status-icon" style="color: ${color}; font-size: 3rem; margin-bottom: 20px;">
                <i class="fas fa-${icon}"></i>
            </div>
            <h3>Status do Pagamento</h3>
            <div class="transaction-info">
                <p><strong>ID da Transação:</strong> ${transacaoId || '-'}</p>
                <p><strong>Valor:</strong> MZN ${valor && typeof valor === 'number' ? valor.toFixed(2).replace('.', ',') : (valor || '-')}</p>
                <p style="color:${color}; font-weight:bold;">${statusMsg}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="close-btn">Fechar</button>
        </div>
    `;
    
    // Adicionar estilos do modal se não existirem
    if (!document.querySelector('#transaction-modal-styles')) {
        const styles = document.createElement('style');
        styles.id = 'transaction-modal-styles';
        styles.textContent = `
            .transaction-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
            }
            .modal-content {
                background: white;
                padding: 30px;
                border-radius: 15px;
                text-align: center;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            .transaction-info {
                margin: 20px 0;
                text-align: left;
            }
            .close-btn {
                background: #3b82f6;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
                margin-top: 15px;
                transition: background 0.3s;
            }
            .close-btn:hover {
                background: #2563eb;
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(modal);
}

// Função para processar pagamento
async function processPayment(customerData) {
    try {
        // Validar dados do cliente
        if (!customerData.nome || !customerData.email) {
            throw new Error('Dados do cliente incompletos');
        }

        // Obter método de pagamento selecionado
        const metodoPagamento = document.querySelector('input[name="paymentMethod"]:checked');
        if (!metodoPagamento) {
            throw new Error('Selecione um método de pagamento');
        }

        // Obter número de telefone
        const telefoneInput = document.getElementById('phone');
        if (!telefoneInput || !telefoneInput.value.trim()) {
            throw new Error('Número de telefone é obrigatório');
        }

        const numeroCelular = telefoneInput.value.trim();

        // Preparar dados do pagamento
        const paymentData = {
            produtoId: currentProduct.id || currentProduct.customId,
            numeroCelular: numeroCelular,
            metodo: metodoPagamento.value, // 'mpesa' ou 'emola'
            nomeCliente: customerData.nome,
            emailCliente: customerData.email
        };

        console.log('💳 Processando pagamento:', paymentData);

        // Fazer requisição para o backend
        const response = await fetch('/api/pagar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(paymentData)
        });

        const result = await response.json();

        if (result.success) {
            // Pagamento processado com sucesso
            showTransactionStatus('success', result.data.pagamento.status, result.data.pagamento.transactionId);
            
            // Salvar dados da transação
            orderData.transaction = result.data;
            
            // Redirecionar para página de sucesso após 3 segundos
            setTimeout(() => {
                window.location.href = `/payment/success?transactionId=${result.data.pagamento.transactionId}`;
            }, 3000);
        } else {
            // Falha no pagamento
            throw new Error(result.error || 'Erro no processamento do pagamento');
        }

    } catch (error) {
        console.error('❌ Erro no pagamento:', error);
        showNotification(error.message, 'error');
        
        // Mostrar status de falha
        showTransactionStatus('failed', null, null);
    }
}

// Função para finalizar pedido
async function finishOrder() {
    if (!validateForm()) return;
    
    collectFormData();
    
    const finishBtn = document.getElementById('finishOrderBtn');
    const originalText = finishBtn.textContent;
    finishBtn.textContent = 'Processando...';
    finishBtn.disabled = true;
    
    try {
        await processPayment(orderData.customer);
        finishBtn.textContent = originalText;
        finishBtn.disabled = false;
    } catch (error) {
        finishBtn.textContent = originalText;
        finishBtn.disabled = false;
    }
}

// Função para obter IP do usuário (simulação)
async function getUserIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return '127.0.0.1';
    }
}

// Função para mostrar informações da transação
function showTransactionInfo(venda) {
    const modal = document.createElement('div');
    modal.className = 'transaction-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Pedido Realizado com Sucesso!</h3>
            <div class="transaction-info">
                <p><strong>ID da Transação:</strong> ${venda.transacaoId}</p>
                <p><strong>Valor:</strong> MZN ${venda.valor.toFixed(2).replace('.', ',')}</p>
                <p><strong>Status:</strong> ${venda.status}</p>
                <p><strong>ID do Produto:</strong> ${venda.produtoCustomId || venda.produtoId}</p>
                <p><em>Você será redirecionado em alguns segundos...</em></p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()">Fechar</button>
        </div>
    `;
    
    // Adicionar estilos do modal
    if (!document.querySelector('#modal-styles')) {
        const styles = document.createElement('style');
        styles.id = 'modal-styles';
        styles.textContent = `
            .transaction-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
            }
            .modal-content {
                background: white;
                padding: 30px;
                border-radius: 10px;
                text-align: center;
                max-width: 400px;
                width: 90%;
            }
            .transaction-info {
                margin: 20px 0;
                text-align: left;
            }
            .modal-content button {
                background: #007bff;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 15px;
            }
        `;
        document.head.appendChild(styles);
    }
    
    document.body.appendChild(modal);
}



// Inicialização quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando checkout...');
    
    // Carregar produto
    loadProduct();
    
    // Configurar métodos de pagamento
    const paymentMethods = document.querySelectorAll('.payment-method');
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            // Selecionar o radio button
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;
            
            // Remover seleção de todos os métodos
            paymentMethods.forEach(m => m.classList.remove('selected'));
            
            // Adicionar seleção ao método clicado
            this.classList.add('selected');
            
            console.log(`💳 Método selecionado: ${radio.value}`);
        });
    });
    
    // Configurar botão de finalizar
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(event) {
            event.preventDefault();
            finishOrder();
        });
    }
    
    // Configurar Enter no campo de cupom
    const couponInput = document.getElementById('couponCode');
    if (couponInput) {
        couponInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyCoupon();
            }
        });
    }

    // Adicionar evento para auto selecionar método ao digitar telefone
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', autoSelectPaymentMethodByPhone);
    }
    
    console.log('Checkout inicializado com sucesso');
});

// Função para auto selecionar método de pagamento baseado no número de telefone
function autoSelectPaymentMethodByPhone() {
    const phoneInput = document.getElementById('phone');
    const phone = phoneInput.value.replace(/\D/g, ''); // Remove caracteres não numéricos
    
    if (phone.length >= 2) {
        const firstTwoDigits = phone.substring(0, 2);
        let methodToSelect = null;
        
        // Selecionar método baseado nos primeiros dígitos
        if (firstTwoDigits === '84') {
            methodToSelect = 'mpesa';
        } else if (firstTwoDigits === '86') {
            methodToSelect = 'emola';
        }
        
        if (methodToSelect) {
            // Desmarcar todos os radio buttons
            document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
                radio.checked = false;
            });
            
            // Remover seleção visual de todos os métodos
            document.querySelectorAll('.payment-method').forEach(method => {
                method.classList.remove('selected');
            });
            
            // Selecionar o método apropriado
            const targetRadio = document.getElementById(methodToSelect);
            const targetMethod = document.querySelector(`[data-method="${methodToSelect}"]`);
            
            if (targetRadio && targetMethod) {
                targetRadio.checked = true;
                targetMethod.classList.add('selected');
                console.log(`🔄 Auto selecionado: ${methodToSelect} para número ${phone}`);
            }
        }
    }
}

