const { body, validationResult } = require('express-validator');

// Middleware de validação de login simples
const validateLogin = [
    body('username')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Username é obrigatório'),
    body('password')
        .isLength({ min: 1 })
        .withMessage('Senha é obrigatória'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Dados de login inválidos',
                details: errors.array()
            });
        }
        next();
    }
];

// Middleware de autenticação simples baseado em sessões
function requireAuth(req, res, next) {
    // Verificar se o usuário está autenticado na sessão
    if (req.session && req.session.user) {
        // Adicionar informações do usuário ao request
        req.user = req.session.user;
        next();
    } else {
        // Se não estiver autenticado, redirecionar para login
        if (req.xhr || req.path.startsWith('/api/')) {
            // Para requisições AJAX/API, retornar erro JSON
            res.status(401).json({
                success: false,
                error: 'Usuário não autenticado',
                redirect: '/'
            });
        } else {
            // Para requisições normais, redirecionar para login
            res.redirect('/');
        }
    }
}

// Middleware para verificar se o usuário é admin
function requireAdmin(req, res, next) {
    // Primeiro verificar se está autenticado
    if (!req.session || !req.session.user) {
        return res.status(401).json({
            success: false,
            error: 'Usuário não autenticado'
        });
    }

    // Verificar se é admin
    if (req.session.user.tipo === 'admin' || req.session.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            error: 'Acesso negado. Apenas administradores podem acessar este recurso.'
        });
    }
}

// Middleware para verificar se o usuário está logado (sem redirecionamento)
function isAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        req.user = req.session.user;
        next();
    } else {
        next();
    }
}

// Middleware de autorização por role (simplificado)
function authorizeRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            return res.status(401).json({
                success: false,
                error: 'Usuário não autenticado'
            });
        }

        const userRole = req.session.user.role || req.session.user.tipo;
        
        if (allowedRoles.includes(userRole)) {
            next();
        } else {
            res.status(403).json({
                success: false,
                error: 'Acesso negado. Permissão insuficiente.'
            });
        }
    };
}

// Middleware para verificar propriedade de recursos (simplificado)
function checkOwnership(resourceType) {
    return async (req, res, next) => {
        if (!req.session || !req.session.user) {
            return res.status(401).json({
                success: false,
                error: 'Usuário não autenticado'
            });
        }

        const resourceId = req.params.id;
        const userId = req.session.user.id;

        try {
            switch (resourceType) {
                case 'venda':
                    const Venda = require('../models/Venda');
                    const venda = await Venda.findById(resourceId);
                    if (!venda) {
                        return res.status(404).json({
                            success: false,
                            error: 'Venda não encontrada'
                        });
                    }
                    // Para vendas, permitir acesso a todos os usuários autenticados
                    break;
                case 'produto':
                    const Produto = require('../models/Produto');
                    const produto = await Produto.findById(resourceId);
                    if (!produto) {
                        return res.status(404).json({
                            success: false,
                            error: 'Produto não encontrado'
                        });
                    }
                    // Para produtos, permitir acesso a todos os usuários autenticados
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        error: 'Tipo de recurso não suportado'
                    });
            }

            next();
        } catch (error) {
            console.error('Erro ao verificar propriedade:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    };
}

module.exports = {
    validateLogin,
    requireAuth,
    requireAdmin,
    isAuthenticated,
    authorizeRole,
    checkOwnership
}; 