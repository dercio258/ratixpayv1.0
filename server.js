const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Importar middlewares de segurança
const {
    createRateLimiters,
    createSlowDown,
    sanitizeInput,
    auditLog,
    integrityCheck,
    attackProtection,
    securityHeaders,
    helmetConfig
} = require('./middleware/security');

// Importar middleware de analytics
const { captureAnalytics, captureConversion } = require('./middleware/analytics');

// Inicializar banco de dados PostgreSQL
const databaseManager = require('./config/database');

// Configurar Nodemailer para envio de e-mails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_SENDER,
    pass: process.env.GMAIL_PASS
  }
});

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações de segurança avançada (otimizadas para plano gratuito)
const rateLimiters = createRateLimiters();
const slowDown = createSlowDown();

// Aplicar Helmet (headers de segurança)
app.use(helmetConfig);

// Aplicar headers de segurança customizados
app.use(securityHeaders);

// Middleware de auditoria (otimizado para plano gratuito)
if (process.env.NODE_ENV === 'production') {
    app.use(auditLog);
    app.use(integrityCheck);
    app.use(attackProtection);
}

// Rate limiting geral (reduzido para plano gratuito)
app.use(rateLimiters.general);

// Slow down para requests excessivos (otimizado)
app.use(slowDown);

// Middleware de sanitização
app.use(sanitizeInput);

// Middleware de analytics
app.use(captureAnalytics);
app.use(captureConversion);

// Configuração de CORS simplificada
app.use(cors({
  origin: true, // Permitir todas as origens
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Configuração de sessões
app.use(session({
  secret: 'ratixpay_simple_session_2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// Configuração para servir arquivos de upload
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, filePath) => {
        // Configurar headers para imagens
        if (filePath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache por 1 ano
            res.setHeader('Content-Type', getContentType(filePath));
        }
    }
}));

// Função para determinar o tipo de conteúdo
function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
    };
    return contentTypes[ext] || 'application/octet-stream';
}

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Inicializar banco PostgreSQL
try {
  databaseManager.initialize();
  console.log('✅ Banco PostgreSQL inicializado com sucesso');
} catch (err) {
  console.error('❌ Erro ao inicializar banco PostgreSQL:', err.message);
  process.exit(1);
}

// Importar rotas
const produtoRoutes = require('./routes/produtos');
const vendaRoutes = require('./routes/vendas');
const dashboardRoutes = require('./routes/dashboard');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const pagamentoRoutes = require('./routes/pagamento');

// Usar rotas da API
app.use('/api/produtos', produtoRoutes);
app.use('/api/vendas', vendaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', pagamentoRoutes);

// Rota para envio de confirmação de e-mail após pagamento
app.post('/api/enviar-confirmacao', async (req, res) => {
  try {
    const {
      nome,
      email,
      produto,
      valorPago,
      idTransacao,
      desconto,
      valorOriginal,
      linkProduto
    } = req.body;

    // Validar dados obrigatórios
    if (!nome || !email || !produto || !valorPago || !idTransacao) {
      return res.status(400).json({
        success: false,
        message: 'Dados obrigatórios não fornecidos'
      });
    }

    const mailOptions = {
      from: `"RatixPay" <${process.env.GMAIL_SENDER}>`,
      to: email,
      subject: 'Confirmação de compra - RatixPay',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2c3e50; margin: 0;">🎉 Compra Confirmada!</h1>
              <p style="color: #7f8c8d; margin: 10px 0;">RatixPay.com</p>
            </div>
            
            <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Olá ${nome},</h2>
            
            <p style="color: #34495e; line-height: 1.6; font-size: 16px;">
              Recebemos com sucesso a confirmação da sua compra na <strong>RatixPay.com</strong>.
            </p>
            
            <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #2c3e50; margin-top: 0;">📋 Detalhes do seu pedido:</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin: 10px 0; padding: 10px; background-color: #ffffff; border-radius: 5px; border-left: 4px solid #3498db;">
                  <strong>🔹 Produto:</strong> ${produto}
                </li>
                <li style="margin: 10px 0; padding: 10px; background-color: #ffffff; border-radius: 5px; border-left: 4px solid #27ae60;">
                  <strong>💰 Valor pago:</strong> ${valorPago} MT
                </li>
                <li style="margin: 10px 0; padding: 10px; background-color: #ffffff; border-radius: 5px; border-left: 4px solid #e74c3c;">
                  <strong>🎟️ ID da Transação:</strong> ${idTransacao}
                </li>
                <li style="margin: 10px 0; padding: 10px; background-color: #ffffff; border-radius: 5px; border-left: 4px solid #f39c12;">
                  <strong>📉 Descontos aplicados:</strong> ${desconto || '0'} MT
                </li>
                <li style="margin: 10px 0; padding: 10px; background-color: #ffffff; border-radius: 5px; border-left: 4px solid #9b59b6;">
                  <strong>💵 Valor original:</strong> ${valorOriginal} MT
                </li>
                <li style="margin: 10px 0; padding: 10px; background-color: #ffffff; border-radius: 5px; border-left: 4px solid #1abc9c;">
                  <strong>📎 Link para acesso:</strong> <a href="${linkProduto}" style="color: #3498db; text-decoration: none;">Clique aqui para acessar</a>
                </li>
                <li style="margin: 10px 0; padding: 10px; background-color: #ffffff; border-radius: 5px; border-left: 4px solid #34495e;">
                  <strong>📞 Contacto:</strong> +258 84 xxx xxxx
                </li>
              </ul>
            </div>
            
            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #27ae60;">
              <p style="margin: 0; color: #27ae60; font-weight: bold;">
                ✅ Seu pagamento foi processado com sucesso!
              </p>
            </div>
            
            <p style="color: #34495e; line-height: 1.6;">
              Em caso de dúvidas ou suporte, entre em contato conosco através do e-mail: 
              <a href="mailto:suporte@ratixpay.com" style="color: #3498db; text-decoration: none;">suporte@ratixpay.com</a>
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
              <p style="color: #7f8c8d; margin: 0;">
                <strong>Agradecemos pela sua confiança! 🚀</strong>
              </p>
              <p style="color: #7f8c8d; margin: 5px 0 0 0;">Equipe RatixPay</p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    console.log(`✅ E-mail de confirmação enviado para: ${email}`);
    
    res.status(200).json({
      success: true,
      message: 'E-mail de confirmação enviado com sucesso.'
    });
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail de confirmação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar e-mail de confirmação.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
    });
  }
});



// Health check endpoint para /api/health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV,
    version: '1.0.0',
    plan: 'free'
  });
});

// Rotas para páginas estáticas
const staticRoutes = [
  { path: '/', file: 'index.html' },

  { path: '/dashboard', file: 'dashboard.html' },
  { path: '/criar-produto', file: 'criar-produto.html' },
  { path: '/checkout', file: 'checkout.html' },
  { path: '/payment/success', file: 'payment-success.html' },
  { path: '/gestao-produtos', file: 'gestao-produtos.html' },
  { path: '/gestao-vendas', file: 'gestao-vendas.html' },
  { path: '/ferramentas', file: 'ferramentas.html' },
  { path: '/cadastro-produto', file: 'cadastro-produto.html' },
  { path: '/editar-produto/:id', file: 'editar-produto.html' },
  { path: '/editar-produto', file: 'editar-produto.html' },
  { path: '/saldo', file: 'saldo.html' }
];

staticRoutes.forEach(route => {
  app.get(route.path, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', route.file));
  });
});

// Middleware de tratamento de erros aprimorado
app.use((err, req, res, next) => {
  console.error('❌ Erro no servidor:', err.stack);
  
  // Erro de validação
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      erro: 'Dados inválidos',
      detalhes: err.message
    });
  }
  
  // Erro de autenticação
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      erro: 'Token inválido ou expirado'
    });
  }
  
  // Erro genérico
  res.status(500).json({
    erro: 'Erro interno do servidor',
    mensagem: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// Rota para qualquer outra requisição (404)
app.use('*', (req, res) => {
  res.status(404).json({
    erro: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// Inicializar banco de dados e iniciar servidor
async function startServer() {
  try {
    // Inicializar banco de dados PostgreSQL
    await databaseManager.initialize();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor RatixPay rodando na porta ${PORT}`);
      console.log(`📱 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🗄️ Banco de dados: PostgreSQL (Neon)`);
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

// Iniciar servidor
startServer();

module.exports = app;

