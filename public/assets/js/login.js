// Configuração da API
const API_BASE = window.location.origin + '/api';

// Função para verificar se o usuário está autenticado
async function checkAuthStatus() {
    try {
        const response = await fetch(`${API_BASE}/auth/verificar`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.autenticado;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        return false;
    }
}

// Função para fazer logout
async function logout() {
    try {
        const response = await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        
        if (response.ok) {
            window.location.href = '/login';
        } else {
            console.error('Erro ao fazer logout');
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        window.location.href = '/login';
    }
}

// Função para redirecionar para login se não autenticado
async function requireAuth() {
    const isAuthenticated = await checkAuthStatus();
    if (!isAuthenticated) {
        window.location.href = '/login';
        return false;
    }
    return true;
}

// Exportar funções para uso global
window.RatixPayAuth = {
    checkAuthStatus,
    logout,
    requireAuth
};

// Verificar autenticação ao carregar a página
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔐 Verificando autenticação...');
    
    // Se estiver na página de login, não verificar
    if (window.location.pathname === '/login') {
        return;
    }
    
    const isAuthenticated = await checkAuthStatus();
    if (!isAuthenticated) {
        console.log('❌ Usuário não autenticado, redirecionando para login');
        window.location.href = '/login';
    } else {
        console.log('✅ Usuário autenticado');
    }
});

