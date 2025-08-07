const express = require('express');
const router = express.Router();
const Venda = require('../models/Venda');
const Produto = require('../models/Produto');

// GET - Estatísticas gerais do dashboard
router.get('/estatisticas', async (req, res) => {
  try {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const inicioAno = new Date(hoje.getFullYear(), 0, 1);
    
    const db = require('../config/database').getPool();
    
    // Receita total
    const receitaTotalResult = await pool.query(`
      SELECT SUM(pagamento_valor) as total 
      FROM vendas 
      WHERE pagamento_status = 'Aprovado'
    `);
    
    // Vendas aprovadas
    const vendasAprovadas = await Venda.count({ 'pagamentoStatus': 'Aprovado' });
    
    // Produtos ativos
    const produtosAtivos = await Produto.count({ 'ativo': true });
    
    // Clientes únicos
    const clientesUnicosResult = await pool.query(`
      SELECT COUNT(DISTINCT cliente_email) as total 
      FROM vendas 
      WHERE pagamento_status = 'Aprovado'
    `);
    
    // Vendas do mês
    const vendasMes = await Venda.count({ 
      'pagamentoStatus': 'Aprovado',
      'dataInicio': inicioMes.toISOString()
    });
    
    // Receita do mês
    const receitaMesResult = await pool.query(`
      SELECT SUM(pagamento_valor) as total 
      FROM vendas 
      WHERE pagamento_status = 'Aprovado' AND data_venda >= $1
    `, [inicioMes.toISOString()]);
    
    // Crescimento comparado ao mês anterior
    const mesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    const fimMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
    
    const receitaMesAnteriorResult = await pool.query(`
      SELECT SUM(pagamento_valor) as total 
      FROM vendas 
      WHERE pagamento_status = 'Aprovado' 
        AND data_venda >= $1 
        AND data_venda <= $2
    `, [mesAnterior.toISOString(), fimMesAnterior.toISOString()]);
    
    const receitaAtual = receitaMesResult.rows[0]?.total || 0;
    const receitaAnterior = receitaMesAnteriorResult.rows[0]?.total || 0;
    const crescimento = receitaAnterior > 0 ? 
      ((receitaAtual - receitaAnterior) / receitaAnterior * 100).toFixed(1) : 0;

    // Métodos de pagamento mais usados
    const metodosPagamentoResult = await pool.query(`
      SELECT 
        pagamento_metodo,
        COUNT(*) as quantidade,
        SUM(pagamento_valor) as valorTotal
      FROM vendas
      WHERE pagamento_status = 'Aprovado'
      GROUP BY pagamento_metodo
      ORDER BY quantidade DESC
    `);

    // Dispositivos mais usados
    const dispositivosResult = await pool.query(`
      SELECT 
        cliente_dispositivo,
        COUNT(*) as quantidade
      FROM vendas
      WHERE pagamento_status = 'Aprovado'
      GROUP BY cliente_dispositivo
      ORDER BY quantidade DESC
      LIMIT 5
    `);

    // Top produtos vendidos
    const produtosVendidosResult = await pool.query(`
      SELECT 
        p.nome as produtoNome,
        p.custom_id as produtoCustomId,
        COUNT(v.id) as vendas,
        SUM(v.pagamento_valor) as receita
      FROM vendas v
      LEFT JOIN produtos p ON v.produto_id = p.id
      WHERE v.pagamento_status = 'Aprovado'
      GROUP BY v.produto_id, p.nome, p.custom_id
      ORDER BY vendas DESC
      LIMIT 5
    `);
    
    res.json({
      receitaTotal: receitaTotalResult.rows[0]?.total || 0,
      vendasAprovadas,
      produtosAtivos,
      totalClientes: clientesUnicosResult.rows[0]?.total || 0,
      vendasMes,
      receitaMes: receitaAtual,
      crescimentoMes: parseFloat(crescimento),
      metodosPagamento: metodosPagamentoResult.rows,
      dispositivos: dispositivosResult.rows,
      produtosVendidos: produtosVendidosResult.rows
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ erro: 'Erro ao buscar estatísticas' });
  }
});

// GET - Vendas da semana (para gráfico)
router.get('/vendas-semana', async (req, res) => {
  try {
    const hoje = new Date();
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - 7);
    
    const db = require('../config/database').getPool();
    
    const vendas = await pool.query(`
      SELECT 
        DATE(data_venda) as data,
        COUNT(id) as vendas,
        SUM(pagamento_valor) as receita
      FROM vendas
      WHERE data_venda >= $1 AND pagamento_status = 'Aprovado'
      GROUP BY DATE(data_venda)
      ORDER BY data
    `, [inicioSemana.toISOString()]);
    
    // Preencher dias sem vendas com zero
    const vendasPorDia = {};
    for (let i = 0; i < 7; i++) {
      const data = new Date(inicioSemana);
      data.setDate(inicioSemana.getDate() + i);
      const dataStr = data.toISOString().split('T')[0];
      vendasPorDia[dataStr] = {
        _id: dataStr,
        vendas: 0,
        receita: 0
      };
    }
    
    vendas.rows.forEach(venda => {
      const dataStr = venda.data;
      vendasPorDia[dataStr] = {
        _id: dataStr,
        vendas: venda.vendas,
        receita: venda.receita
      };
    });
    
    res.json(Object.values(vendasPorDia));
  } catch (error) {
    console.error('Erro ao buscar vendas da semana:', error);
    res.status(500).json({ erro: 'Erro ao buscar vendas da semana' });
  }
});

// GET - Últimas vendas
router.get('/ultimas-vendas', async (req, res) => {
  try {
    const vendas = await Venda.findAll({
      'pagamentoStatus': 'Aprovado'
    });
    
    // Pegar apenas as 5 últimas vendas
    const ultimasVendas = vendas
      .sort((a, b) => new Date(b.dataVenda) - new Date(a.dataVenda))
      .slice(0, 5)
      .map(venda => venda.toJSON());
    
    res.json(ultimasVendas);
  } catch (error) {
    console.error('Erro ao buscar últimas vendas:', error);
    res.status(500).json({ erro: 'Erro ao buscar últimas vendas' });
  }
});

// GET - Últimas transações detalhadas
router.get('/ultimas-transacoes', async (req, res) => {
  try {
    const db = require('../config/database').getPool();
    
    const ultimasTransacoes = db.prepare(`
      SELECT 
        v.*,
        p.nome as produtoNome,
        p.customId as produtoCustomId,
        p.tipo as produtoTipo
      FROM vendas v
      LEFT JOIN produtos p ON v.produtoId = p.id
      ORDER BY v.dataVenda DESC
      LIMIT 10
    `).all();
    
    const transacoesFormatadas = ultimasTransacoes.map(t => ({
        id: t.id,
        transacaoId: t.pagamentoTransacaoId,
        produto: {
            nome: t.produtoNome,
            customId: t.produtoCustomId,
            tipo: t.produtoTipo
        },
        cliente: {
            nome: t.clienteNome,
            email: t.clienteEmail,
            telefone: t.clienteTelefone,
            cidade: t.clienteCidade,
            pais: t.clientePais
        },
        pagamento: {
            metodo: t.pagamentoMetodo,
            valor: t.pagamentoValor,
            valorFormatado: Venda.formatarValorMZN(t.pagamentoValor),
            status: t.pagamentoStatus,
            dataProcessamento: t.pagamentoDataProcessamento,
            referencia: t.pagamentoReferencia
        },
        dispositivo: t.clienteDispositivo || 'Não identificado',
        navegador: t.clienteNavegador || 'Não identificado',
        canalVenda: t.canalVenda || 'Site',
        utmSource: t.utmSource || null,
        dataVenda: t.dataVenda,
        status: t.status
    }));
    
    res.json(transacoesFormatadas);
  } catch (error) {
    console.error('Erro ao buscar últimas transações:', error);
    res.status(500).json({ erro: 'Erro ao buscar últimas transações' });
  }
});

// GET - Análise de tráfego e conversão
router.get('/analise-trafico', async (req, res) => {
  try {
    const db = require('../config/database').getPool();
    
    // Análise por origem de tráfego
    const origemTraficoResult = db.prepare(`
      SELECT 
        COALESCE(origemTrafico, 'Direto') as origem,
        COUNT(*) as totalVendas,
        SUM(CASE WHEN pagamentoStatus = 'Aprovado' THEN 1 ELSE 0 END) as vendasAprovadas,
        SUM(CASE WHEN pagamentoStatus = 'Aprovado' THEN pagamentoValor ELSE 0 END) as receita
      FROM vendas
      GROUP BY origemTrafico
      ORDER BY totalVendas DESC
    `).all();

    // Análise por UTM Source
    const utmSourceResult = db.prepare(`
      SELECT 
        COALESCE(utmSource, 'Direto') as utmSource,
        COUNT(*) as totalVendas,
        SUM(CASE WHEN pagamentoStatus = 'Aprovado' THEN 1 ELSE 0 END) as vendasAprovadas,
        SUM(CASE WHEN pagamentoStatus = 'Aprovado' THEN pagamentoValor ELSE 0 END) as receita
      FROM vendas
      GROUP BY utmSource
      ORDER BY totalVendas DESC
    `).all();

    res.json({
      origemTrafico: origemTraficoResult,
      utmSource: utmSourceResult
    });
  } catch (error) {
    console.error('Erro ao buscar análise de tráfego:', error);
    res.status(500).json({ erro: 'Erro ao buscar análise de tráfego' });
  }
});

// GET - Produtos mais vendidos
router.get('/produtos-populares', async (req, res) => {
  try {
    const produtos = await Produto.findAtivos();
    
    // Ordenar por número de vendas
    const produtosOrdenados = produtos
      .sort((a, b) => b.vendas - a.vendas)
      .slice(0, 5)
      .map(produto => produto.toJSON());
    
    res.json(produtosOrdenados);
  } catch (error) {
    console.error('Erro ao buscar produtos populares:', error);
    res.status(500).json({ erro: 'Erro ao buscar produtos populares' });
  }
});

// GET - Métodos de pagamento mais usados
router.get('/metodos-pagamento', async (req, res) => {
  try {
    const db = require('../config/database').getPool();
    
    const metodos = db.prepare(`
      SELECT 
        pagamentoMetodo,
        COUNT(id) as quantidade,
        SUM(pagamentoValor) as valorTotal
      FROM vendas
      WHERE pagamentoStatus = 'Aprovado'
      GROUP BY pagamentoMetodo
      ORDER BY quantidade DESC
    `).all();
    
    res.json(metodos);
  } catch (error) {
    console.error('Erro ao buscar métodos de pagamento:', error);
    res.status(500).json({ erro: 'Erro ao buscar métodos de pagamento' });
  }
});

// GET - Resumo de vendas por período
router.get('/resumo-periodo', async (req, res) => {
  try {
    const { periodo = '30' } = req.query;
    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - parseInt(periodo));
    
    const db = require('../config/database').getPool();
    
    const resumo = db.prepare(`
      SELECT 
        COUNT(id) as totalVendas,
        SUM(CASE WHEN pagamentoStatus = 'Aprovado' THEN 1 ELSE 0 END) as vendasAprovadas,
        SUM(CASE WHEN pagamentoStatus = 'Pendente' THEN 1 ELSE 0 END) as vendasPendentes,
        SUM(CASE WHEN pagamentoStatus = 'Rejeitado' THEN 1 ELSE 0 END) as vendasRejeitadas,
        SUM(CASE WHEN pagamentoStatus = 'Aprovado' THEN pagamentoValor ELSE 0 END) as receitaTotal,
        AVG(CASE WHEN pagamentoStatus = 'Aprovado' THEN pagamentoValor ELSE NULL END) as ticketMedio
      FROM vendas
      WHERE dataVenda >= ?
    `).get(dataInicio.toISOString());
    
    res.json(resumo);
  } catch (error) {
    console.error('Erro ao buscar resumo do período:', error);
    res.status(500).json({ erro: 'Erro ao buscar resumo do período' });
  }
});

module.exports = router;

