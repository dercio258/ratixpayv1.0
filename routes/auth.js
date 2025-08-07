const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');

// Credenciais fixas para o usuário Rafael
const ADMIN_USERNAME = 'Rafael';
const ADMIN_PASSWORD = 'ratixp@y258';

// Rota de login tradicional
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validações básicas
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Nome de usuário e senha são obrigatórios'
      });
    }

    // Verificar credenciais fixas
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Criar sessão simples
      req.session.user = {
        id: 1,
        username: ADMIN_USERNAME,
        nome: 'Rafael',
        tipo: 'admin',
        ativo: true
      };

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        user: {
          id: 1,
          username: ADMIN_USERNAME,
          nome: 'Rafael',
          tipo: 'admin'
        }
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Credenciais inválidas'
      });
    }
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota para verificar se está autenticado
router.get('/verificar', (req, res) => {
  if (req.session.user) {
    res.json({
      success: true,
      autenticado: true,
      user: req.session.user
    });
  } else {
    res.status(401).json({
      success: false,
      autenticado: false,
      error: 'Usuário não autenticado'
    });
  }
});

// Rota de logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao fazer logout'
      });
    }
    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  });
});

// Rota para obter status da autenticação
router.get('/status', (req, res) => {
  if (req.session.user) {
    res.json({
      autenticado: true,
      user: req.session.user
    });
  } else {
    res.json({ autenticado: false });
  }
});

module.exports = router;

