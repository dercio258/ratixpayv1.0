# RatixPay - Plataforma de Infoprodutos

## 📋 Descrição

RatixPay é uma plataforma web completa para gestão e venda de infoprodutos digitais (eBooks e Cursos Online). Desenvolvida com HTML, CSS e JavaScript puro, oferece uma interface moderna e responsiva para criadores de conteúdo digital.

## 🚀 Funcionalidades

### ✅ Sistema de Autenticação
- Login seguro com credenciais fixas
- Validação de usuário e senha
- Redirecionamento automático para o dashboard

### 📊 Dashboard Interativo
- Cards de estatísticas em tempo real
- Gráfico de vendas dos últimos 7 dias
- Lista de vendas recentes
- Menu lateral com navegação

### 📦 Criação de Produtos (4 Etapas)
1. **Tipo de Produto**: Escolha entre Curso Online ou eBook
2. **Informações**: Dados básicos, preço, desconto e configurações
3. **Conteúdo**: Upload de arquivos ou criação de módulos
4. **Finalizar**: Revisão e confirmação do cadastro

### 💳 Sistema de Checkout
- Carregamento de produtos via ID na URL
- Formulário completo de dados pessoais
- Métodos de pagamento móvel (e-Mola, M-Pesa)
- Sistema de cupons de desconto
- Integração com PaySuite para pagamentos seguros

## 🔐 Credenciais de Acesso

- **Usuário**: `Ratixpay`
- **Senha**: `Moz258`

## 📁 Estrutura do Projeto

```
RatixPay/
├── index.html              # Página de login
├── dashboard.html           # Dashboard principal
├── criar-produto.html       # Criação de produtos (4 etapas)
├── checkout.html           # Finalização de compras
├── assets/
│   ├── css/
│   │   └── style.css       # Estilos principais
│   └── js/
│       ├── login.js        # Lógica de autenticação
│       ├── dashboard.js    # Funcionalidades do dashboard
│       ├── criar-produto.js # Fluxo de criação de produtos
│       ├── checkout.js     # Processamento de checkout
│       └── produtos.js     # Produtos simulados
└── README.md               # Documentação
```

## 🎨 Design e Tecnologias

### Tecnologias Utilizadas
- **HTML5**: Estrutura semântica
- **CSS3**: Estilização moderna com Flexbox e Grid
- **JavaScript ES6+**: Funcionalidades interativas
- **Font Awesome**: Ícones
- **Google Fonts**: Tipografia (Poppins)

### Características do Design
- **Responsivo**: Adaptável a diferentes tamanhos de tela
- **Moderno**: Interface limpa e profissional
- **Interativo**: Animações e transições suaves
- **Acessível**: Boa usabilidade e navegação intuitiva

### Paleta de Cores
- **Azul Principal**: `#007bff`
- **Cinza Claro**: `#f5f5f5`
- **Branco**: `#ffffff`
- **Sombra**: `rgba(0, 0, 0, 0.05)`

## 🛠️ Como Usar

### 1. Acesso ao Sistema
1. Abra o arquivo `index.html` no navegador
2. Digite as credenciais de acesso
3. Clique em "Entrar" para acessar o dashboard

### 2. Navegação
- **Dashboard**: Visualize estatísticas e vendas
- **Gestão de Produto**: Crie novos produtos
- **Gestão de Vendas**: Acompanhe vendas (em desenvolvimento)
- **Ferramentas**: Funcionalidades adicionais (em desenvolvimento)

### 3. Criação de Produtos
1. Acesse "Gestão de Produto" no menu lateral
2. Siga as 4 etapas do processo:
   - Escolha o tipo (Curso ou eBook)
   - Preencha as informações básicas
   - Adicione o conteúdo
   - Revise e finalize

### 4. Teste de Checkout
- Acesse: `checkout.html?id=1` (para produto simulado)
- Preencha os dados do formulário
- Selecione um método de pagamento
- Teste cupons: `DESCONTO10`, `DESCONTO20`, `BLACKFRIDAY`

## 📱 Responsividade

A plataforma é totalmente responsiva e funciona em:
- **Desktop**: Experiência completa
- **Tablet**: Layout adaptado
- **Mobile**: Interface otimizada para toque

## 🔧 Funcionalidades Técnicas

### Armazenamento Local
- Produtos salvos no `localStorage`
- Dados de sessão persistentes
- Histórico de vendas simulado

### Validações
- Formulários com validação em tempo real
- Verificação de campos obrigatórios
- Validação de email e dados

### Simulações
- Produtos pré-cadastrados para demonstração
- Sistema de pagamento simulado
- Dados de vendas fictícios para o dashboard

## 🎯 Produtos Simulados

O sistema inclui 5 produtos de demonstração:

1. **Curso de Marketing Digital** - R$ 267,30
2. **eBook: Finanças Pessoais** - R$ 47,00
3. **Curso de Programação Web** - R$ 397,60
4. **eBook: Receitas Saudáveis** - R$ 27,00
5. **Curso de Design Gráfico** - R$ 337,45

## 🔮 Futuras Implementações

- Sistema de afiliados
- Relatórios avançados
- Integração com gateways de pagamento reais
- Sistema de usuários múltiplos
- API para integração externa
- Painel administrativo avançado

## 📞 Suporte

Para dúvidas ou sugestões sobre a plataforma RatixPay, entre em contato através dos canais oficiais.

---

**RatixPay** - Sua plataforma completa para infoprodutos digitais 🚀

