const databaseManager = require('../database/database');
const Venda = require('../models/Venda');
const Produto = require('../models/Produto');

async function corrigirStatusVendas() {
    try {
        console.log('🔧 Iniciando correção de status de vendas...');
        
        // Inicializar banco de dados
        if (!databaseManager.getDatabase()) {
            databaseManager.initialize();
        }
        
        const db = databaseManager.getDatabase();
        
        // Buscar todas as vendas
        const vendas = db.prepare(`
            SELECT * FROM vendas 
            ORDER BY dataVenda DESC
        `).all();
        
        console.log(`📊 Total de vendas encontradas: ${vendas.length}`);
        
        let vendasCorrigidas = 0;
        let vendasInconsistentes = 0;
        
        for (const vendaData of vendas) {
            const venda = new Venda(vendaData);
            let precisaCorrecao = false;
            let correcoes = [];
            
            // Verificar inconsistências
            if (venda.pagamentoStatus === 'Aprovado' && venda.status !== 'Pago') {
                venda.status = 'Pago';
                precisaCorrecao = true;
                correcoes.push('Status da venda corrigido para Pago');
            }
            
            if (venda.pagamentoStatus === 'Rejeitado' && venda.status !== 'Cancelado') {
                venda.status = 'Cancelado';
                precisaCorrecao = true;
                correcoes.push('Status da venda corrigido para Cancelado');
            }
            
            if (venda.pagamentoStatus === 'Cancelado' && venda.status !== 'Cancelado') {
                venda.status = 'Cancelado';
                precisaCorrecao = true;
                correcoes.push('Status da venda corrigido para Cancelado');
            }
            
            if (venda.pagamentoStatus === 'Pendente' && venda.status !== 'Aguardando Pagamento') {
                venda.status = 'Aguardando Pagamento';
                precisaCorrecao = true;
                correcoes.push('Status da venda corrigido para Aguardando Pagamento');
            }
            
            // Verificar se o transaction_id está vazio ou nulo
            if (!venda.pagamentoTransacaoId || venda.pagamentoTransacaoId.trim() === '') {
                venda.pagamentoTransacaoId = `RTX${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
                precisaCorrecao = true;
                correcoes.push('Transaction ID gerado');
            }
            
            // Verificar se a data de processamento está vazia para vendas aprovadas
            if (venda.pagamentoStatus === 'Aprovado' && !venda.pagamentoDataProcessamento) {
                venda.pagamentoDataProcessamento = new Date().toISOString();
                precisaCorrecao = true;
                correcoes.push('Data de processamento adicionada');
            }
            
            if (precisaCorrecao) {
                // Adicionar observação sobre as correções
                const observacao = `[CORREÇÃO AUTOMÁTICA] ${new Date().toISOString()}: ${correcoes.join(', ')}`;
                venda.observacoes = venda.observacoes ? 
                    `${venda.observacoes}\n${observacao}` : 
                    observacao;
                
                await venda.save();
                vendasCorrigidas++;
                vendasInconsistentes++;
                
                console.log(`✅ Venda ${venda.id} corrigida:`, correcoes);
            }
        }
        
        // Verificar estatísticas finais
        const statsResult = db.prepare(`
            SELECT 
                COUNT(*) as totalVendas,
                SUM(CASE WHEN pagamentoStatus = 'Aprovado' THEN 1 ELSE 0 END) as vendasAprovadas,
                SUM(CASE WHEN pagamentoStatus = 'Pendente' THEN 1 ELSE 0 END) as vendasPendentes,
                SUM(CASE WHEN pagamentoStatus = 'Rejeitado' THEN 1 ELSE 0 END) as vendasRejeitadas,
                SUM(CASE WHEN pagamentoStatus = 'Cancelado' THEN 1 ELSE 0 END) as vendasCanceladas
            FROM vendas
        `).get();
        
        console.log('\n📊 Estatísticas finais:');
        console.log(`   Total de vendas: ${statsResult.totalVendas}`);
        console.log(`   Vendas aprovadas: ${statsResult.vendasAprovadas}`);
        console.log(`   Vendas pendentes: ${statsResult.vendasPendentes}`);
        console.log(`   Vendas rejeitadas: ${statsResult.vendasRejeitadas}`);
        console.log(`   Vendas canceladas: ${statsResult.vendasCanceladas}`);
        
        console.log(`\n✅ Correção concluída:`);
        console.log(`   Vendas corrigidas: ${vendasCorrigidas}`);
        console.log(`   Vendas inconsistentes encontradas: ${vendasInconsistentes}`);
        
        if (vendasInconsistentes === 0) {
            console.log('🎉 Nenhuma inconsistência encontrada!');
        }
        
    } catch (error) {
        console.error('❌ Erro durante a correção:', error);
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    corrigirStatusVendas()
        .then(() => {
            console.log('✅ Script de correção concluído com sucesso!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Erro no script:', error);
            process.exit(1);
        });
}

module.exports = { corrigirStatusVendas }; 