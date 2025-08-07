# Migração para PostgreSQL (Neon)

Este documento explica como migrar o sistema RatixPay do SQLite para PostgreSQL usando o Neon.

## Pré-requisitos

1. Conta no Neon (https://neon.tech)
2. Node.js instalado
3. Acesso ao projeto RatixPay

## Configuração do Neon PostgreSQL

### 1. Criar banco de dados no Neon

1. Acesse https://neon.tech e faça login
2. Clique em "New Project"
3. Escolha um nome para o projeto (ex: "ratixpay-db")
4. Selecione a região mais próxima
5. Clique em "Create Project"

### 2. Obter string de conexão

1. No dashboard do Neon, vá para "Connection Details"
2. Copie a string de conexão que aparece
3. A string deve ter o formato:
   ```
   postgresql://username:password@host:port/database?sslmode=require
   ```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Configurações do Banco de Dados PostgreSQL (Neon)
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require

# Configurações do Gmail para envio de e-mails
GMAIL_SENDER=seu-email@gmail.com
GMAIL_PASS=sua-senha-de-app

# Configurações do Ambiente
NODE_ENV=development
PORT=3000

# Configurações de Segurança
JWT_SECRET=seu-jwt-secret-aqui
SESSION_SECRET=seu-session-secret-aqui
```

## Instalação das Dependências

Execute o comando para instalar as novas dependências do PostgreSQL:

```bash
npm install
```

## Migração dos Dados

### 1. Executar migração

Para migrar os dados do SQLite para PostgreSQL:

```bash
npm run migrate
```

Ou execute diretamente:

```bash
node scripts/migrate-to-postgresql.js
```

### 2. Verificar migração

O script irá:
- Conectar ao banco SQLite existente
- Conectar ao banco PostgreSQL
- Migrar todos os dados na seguinte ordem:
  1. Produtos
  2. Usuários
  3. Clientes
  4. Vendas
  5. Configurações

### 3. Verificar dados migrados

Após a migração, você pode verificar se os dados foram transferidos corretamente acessando o dashboard do Neon.

## Inicialização do Sistema

### 1. Inicializar banco PostgreSQL

O sistema agora usa PostgreSQL. Na primeira execução, as tabelas serão criadas automaticamente:

```bash
npm start
```

### 2. Verificar funcionamento

Acesse a aplicação e verifique se:
- Login funciona
- Produtos são carregados
- Vendas são registradas
- Dashboard mostra dados corretos

## Estrutura das Tabelas

### Produtos
- `id` (SERIAL PRIMARY KEY)
- `custom_id` (VARCHAR(255) UNIQUE)
- `nome` (VARCHAR(255) NOT NULL)
- `tipo` (VARCHAR(50) NOT NULL)
- `preco` (DECIMAL(10,2) NOT NULL)
- `desconto` (INTEGER DEFAULT 0)
- `preco_com_desconto` (DECIMAL(10,2))
- `descricao` (TEXT)
- `imagem_url` (TEXT)
- `link_conteudo` (TEXT)
- `ativo` (BOOLEAN DEFAULT true)
- `vendas` (INTEGER DEFAULT 0)
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

### Vendas
- `id` (SERIAL PRIMARY KEY)
- `produto_id` (INTEGER NOT NULL, FOREIGN KEY)
- `cliente_nome` (VARCHAR(255) NOT NULL)
- `cliente_email` (VARCHAR(255) NOT NULL)
- `cliente_telefone` (VARCHAR(50) NOT NULL)
- `cliente_cpf` (VARCHAR(20))
- `cliente_endereco` (TEXT)
- `cliente_cidade` (VARCHAR(100))
- `cliente_pais` (VARCHAR(100))
- `cliente_ip` (VARCHAR(45))
- `cliente_user_agent` (TEXT)
- `cliente_dispositivo` (VARCHAR(100))
- `cliente_navegador` (VARCHAR(100))
- `pagamento_metodo` (VARCHAR(50) NOT NULL)
- `pagamento_valor` (DECIMAL(10,2) NOT NULL)
- `pagamento_valor_original` (DECIMAL(10,2) NOT NULL)
- `pagamento_desconto` (INTEGER DEFAULT 0)
- `pagamento_cupom` (VARCHAR(100))
- `pagamento_status` (VARCHAR(50) DEFAULT 'Pendente')
- `pagamento_transacao_id` (VARCHAR(255) UNIQUE)
- `pagamento_gateway` (VARCHAR(50) DEFAULT 'PaySuite')
- `pagamento_data_processamento` (TIMESTAMP)
- `pagamento_referencia` (VARCHAR(255))
- `pagamento_comprovante` (TEXT)
- `afiliado_codigo` (VARCHAR(100))
- `afiliado_comissao` (DECIMAL(10,2) DEFAULT 0)
- `status` (VARCHAR(50) DEFAULT 'Aguardando Pagamento')
- `data_venda` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- `data_entrega` (TIMESTAMP)
- `observacoes` (TEXT)
- `ip` (VARCHAR(45))
- `user_agent` (TEXT)
- `canal_venda` (VARCHAR(50) DEFAULT 'Site')
- `origem_trafico` (VARCHAR(100))
- `campanha` (VARCHAR(100))
- `utm_source` (VARCHAR(100))
- `utm_medium` (VARCHAR(100))
- `utm_campaign` (VARCHAR(100))

### Usuários
- `id` (SERIAL PRIMARY KEY)
- `username` (VARCHAR(255) UNIQUE NOT NULL)
- `password` (VARCHAR(255))
- `email` (VARCHAR(255) UNIQUE)
- `nome` (VARCHAR(255))
- `role` (VARCHAR(50) DEFAULT 'vendedor')
- `tipo` (VARCHAR(50) DEFAULT 'vendedor')
- `ativo` (BOOLEAN DEFAULT true)
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

### Clientes
- `id` (SERIAL PRIMARY KEY)
- `nome` (VARCHAR(255) NOT NULL)
- `email` (VARCHAR(255) UNIQUE NOT NULL)
- `telefone` (VARCHAR(50))
- `endereco` (TEXT)
- `data_nascimento` (DATE)
- `genero` (VARCHAR(50))
- `total_compras` (INTEGER DEFAULT 0)
- `valor_total_gasto` (DECIMAL(10,2) DEFAULT 0)
- `status` (VARCHAR(50) DEFAULT 'Ativo')
- `observacoes` (TEXT)
- `tags` (TEXT)
- `data_cadastro` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- `ultima_compra` (TIMESTAMP)
- `origem` (VARCHAR(50) DEFAULT 'Site')
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

### Configurações
- `id` (SERIAL PRIMARY KEY)
- `chave` (VARCHAR(255) UNIQUE NOT NULL)
- `valor` (TEXT)
- `descricao` (TEXT)
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

## Vantagens do PostgreSQL

1. **Escalabilidade**: Suporte a grandes volumes de dados
2. **Concorrência**: Melhor performance com múltiplos usuários
3. **Recursos Avançados**: Índices, views, stored procedures
4. **Backup Automático**: Neon oferece backup automático
5. **Monitoramento**: Dashboard com métricas de performance
6. **Segurança**: SSL obrigatório, autenticação robusta

## Troubleshooting

### Erro de conexão
- Verifique se a `DATABASE_URL` está correta
- Confirme se o banco está ativo no Neon
- Teste a conexão usando `psql` ou outro cliente PostgreSQL

### Erro de migração
- Verifique se o banco SQLite existe
- Confirme se tem permissões de leitura
- Execute o script novamente (usará `ON CONFLICT DO NOTHING`)

### Performance lenta
- Verifique a região do banco (deve ser próxima)
- Monitore o uso de conexões no dashboard do Neon
- Considere otimizar queries com índices

## Backup e Restauração

### Backup
O Neon oferece backup automático. Para backup manual:

```bash
pg_dump $DATABASE_URL > backup.sql
```

### Restauração
```bash
psql $DATABASE_URL < backup.sql
```

## Monitoramento

Acesse o dashboard do Neon para monitorar:
- Uso de CPU e memória
- Número de conexões
- Queries lentas
- Uso de armazenamento
- Logs de erro

## Suporte

Para problemas específicos do Neon:
- Documentação: https://neon.tech/docs
- Suporte: https://neon.tech/support
- Discord: https://discord.gg/neondatabase 