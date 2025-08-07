# Sistema de Coleta de Dados Durante Pagamento

## Visão Geral

O sistema foi aprimorado para coletar dados detalhados durante o processo de pagamento, permitindo análises avançadas no dashboard e gestão de vendas.

## Novos Campos Coletados

### Dados do Cliente
- **Nome completo**: Nome do cliente
- **Email**: Email do cliente
- **Telefone**: Número de telefone formatado
- **CPF**: Documento de identificação
- **Endereço**: Endereço completo
- **Cidade**: Cidade do cliente
- **País**: País do cliente (padrão: Moçambique)
- **IP**: Endereço IP do cliente
- **User Agent**: Informações do navegador
- **Dispositivo**: Tipo de dispositivo (Mobile, Tablet, Desktop)
- **Navegador**: Navegador utilizado (Chrome, Firefox, Safari, etc.)

### Dados de Pagamento
- **Método**: e-Mola ou M-Pesa
- **Valor**: Valor final da transação
- **Valor Original**: Valor sem desconto
- **Desconto**: Valor do desconto aplicado
- **Cupom**: Código do cupom utilizado
- **Status**: Status do pagamento (Pendente, Aprovado, Rejeitado, Cancelado)
- **ID da Transação**: ID único da transação
- **Gateway**: Gateway de pagamento utilizado
- **Data de Processamento**: Data/hora do processamento
- **Referência**: Referência do pagamento
- **Comprovante**: URL do comprovante

### Dados de Analytics
- **Canal de Venda**: Canal onde a venda foi realizada (Site, WhatsApp, etc.)
- **Origem do Tráfego**: Origem do tráfego (Google, Facebook, Instagram, etc.)
- **Campanha**: Nome da campanha
- **UTM Source**: Fonte UTM
- **UTM Medium**: Meio UTM
- **UTM Campaign**: Campanha UTM

### Dados de Afiliado
- **Código do Afiliado**: Código do afiliado
- **Comissão**: Valor da comissão

## Novas Rotas da API

### 1. Processamento de Pagamento Aprimorado
```
POST /api/pagar
```

**Parâmetros adicionais:**
```json
{
  "produtoId": "string",
  "numeroCelular": "string",
  "metodo": "string",
  "nomeCliente": "string",
  "emailCliente": "string",
  "cpfCliente": "string",
  "enderecoCliente": "string",
  "cidadeCliente": "string",
  "paisCliente": "string",
  "afiliadoCodigo": "string",
  "cupomDesconto": "string",
  "observacoes": "string",
  "utmSource": "string",
  "utmMedium": "string",
  "utmCampaign": "string",
  "campanha": "string",
  "origemTrafico": "string"
}
```

### 2. Detalhes Completos de Transação
```
GET /api/vendas/transacao/:transacaoId
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "transacaoId": "RTX123456789",
    "produto": {
      "id": 1,
      "nome": "Curso de Marketing Digital",
      "customId": "CURSO001",
      "tipo": "Curso Online",
      "preco": 500,
      "precoComDesconto": 450
    },
    "cliente": {
      "nome": "João Silva",
      "email": "joao@email.com",
      "telefone": "+258841234567",
      "cpf": "12345678901",
      "endereco": "Rua das Flores, 123",
      "cidade": "Maputo",
      "pais": "Moçambique"
    },
    "pagamento": {
      "metodo": "e-Mola",
      "valor": 450,
      "valorFormatado": "MZN 450,00",
      "valorOriginal": 500,
      "desconto": 50,
      "cupom": "DESCONTO10",
      "status": "Aprovado",
      "gateway": "PaySuite",
      "dataProcessamento": "2024-01-15T10:30:00Z",
      "referencia": "REF123456",
      "comprovante": "https://comprovante.com/123"
    },
    "afiliado": {
      "codigo": "AFF001",
      "comissao": 45
    },
    "analytics": {
      "dispositivo": "Mobile",
      "navegador": "Chrome",
      "ip": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "canalVenda": "Site",
      "origemTrafico": "Facebook",
      "campanha": "Black Friday 2024",
      "utmSource": "facebook",
      "utmMedium": "social",
      "utmCampaign": "blackfriday2024"
    },
    "status": "Pago",
    "dataVenda": "2024-01-15T10:25:00Z",
    "dataEntrega": null,
    "observacoes": "Cliente interessado em mais cursos"
  }
}
```

### 3. Relatório Detalhado de Vendas
```
GET /api/vendas/relatorio/detalhado?dataInicio=2024-01-01&dataFim=2024-01-31&status=Aprovado&metodo=e-Mola
```

### 4. Análise de Tráfego e Conversão
```
GET /api/dashboard/analise-trafico
```

### 5. Últimas Transações Detalhadas
```
GET /api/dashboard/ultimas-transacoes
```

## Middleware de Analytics

O sistema inclui um middleware que captura automaticamente:

- **UTM Parameters**: utm_source, utm_medium, utm_campaign, utm_term, utm_content
- **Referrer**: Origem do tráfego
- **User Agent**: Informações do navegador
- **IP**: Endereço IP do cliente
- **Timestamp**: Data/hora da requisição

## Dashboard Aprimorado

### Novas Estatísticas
- Métodos de pagamento mais utilizados
- Dispositivos mais utilizados
- Produtos mais vendidos
- Análise de tráfego por origem
- Análise de campanhas
- Análise de UTM sources

### Gráficos e Relatórios
- Vendas por período
- Receita por método de pagamento
- Conversão por origem de tráfego
- Performance de campanhas
- Análise de dispositivos e navegadores

## Gestão de Vendas Melhorada

### Filtros Disponíveis
- Por status de pagamento
- Por método de pagamento
- Por produto
- Por email do cliente
- Por período de data
- Por origem de tráfego
- Por campanha

### Informações Detalhadas
- ID da transação
- Produto comprado
- Nome do cliente
- Email do cliente
- Status da transação
- Método de pagamento
- Valor da transação
- Data da venda
- Dispositivo utilizado
- Navegador utilizado
- Origem do tráfego
- Campanha
- UTM parameters

## Exemplo de Uso

### 1. Processar Pagamento com Dados Completos
```javascript
const response = await fetch('/api/pagar', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    produtoId: 'CURSO001',
    numeroCelular: '841234567',
    metodo: 'emola',
    nomeCliente: 'João Silva',
    emailCliente: 'joao@email.com',
    cpfCliente: '12345678901',
    enderecoCliente: 'Rua das Flores, 123',
    cidadeCliente: 'Maputo',
    paisCliente: 'Moçambique',
    afiliadoCodigo: 'AFF001',
    cupomDesconto: 'DESCONTO10',
    observacoes: 'Cliente interessado em mais cursos',
    utmSource: 'facebook',
    utmMedium: 'social',
    utmCampaign: 'blackfriday2024',
    campanha: 'Black Friday 2024',
    origemTrafico: 'Facebook'
  })
});
```

### 2. Buscar Detalhes de Transação
```javascript
const transacao = await fetch('/api/vendas/transacao/RTX123456789');
const dados = await transacao.json();
console.log('Detalhes da transação:', dados.data);
```

### 3. Gerar Relatório Detalhado
```javascript
const relatorio = await fetch('/api/vendas/relatorio/detalhado?dataInicio=2024-01-01&dataFim=2024-01-31&status=Aprovado');
const dados = await relatorio.json();
console.log('Relatório detalhado:', dados.data);
```

## Benefícios

1. **Análise Avançada**: Dados completos para análise de performance
2. **Rastreamento de Conversão**: Identificar fontes de tráfego mais eficazes
3. **Otimização de Campanhas**: Dados para otimizar campanhas de marketing
4. **Gestão de Clientes**: Informações detalhadas sobre clientes
5. **Relatórios Completos**: Relatórios detalhados para tomada de decisão
6. **Auditoria**: Rastreamento completo de todas as transações

## Próximos Passos

1. Implementar sistema de cupons
2. Adicionar mais gateways de pagamento
3. Implementar sistema de afiliados
4. Criar relatórios em PDF
5. Implementar notificações automáticas
6. Adicionar integração com Google Analytics 