# 🔧 Correção do Erro de Autenticação Gmail

## ❌ Erro Atual
```
Error: Invalid login: 534-5.7.9 Application-specific password required.
```

## 🎯 Solução: Configurar Senha de App do Gmail

### **Passo 1: Ativar Verificação em Duas Etapas**

1. **Acesse sua conta Google:**
   - Vá para [myaccount.google.com](https://myaccount.google.com)
   - Faça login na sua conta Gmail

2. **Ative a verificação em duas etapas:**
   - Clique em **"Segurança"** no menu lateral
   - Procure por **"Verificação em duas etapas"**
   - Clique em **"Começar"** e siga as instruções
   - **IMPORTANTE:** Esta etapa é obrigatória para gerar senhas de app

### **Passo 2: Gerar Senha de App**

1. **Acesse Senhas de App:**
   - Vá para [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Ou: Segurança → Verificação em duas etapas → Senhas de app

2. **Gere uma nova senha:**
   - Selecione **"Email"** no dropdown
   - Clique em **"Gerar"**
   - **Copie a senha gerada** (16 caracteres sem espaços)

### **Passo 3: Configurar o Arquivo .env**

1. **Crie ou edite o arquivo `.env` na raiz do projeto:**

```env
# Configurações do Gmail
GMAIL_SENDER=seu-email@gmail.com
GMAIL_PASS=sua-senha-de-app-16-caracteres

# Configurações opcionais
EMAIL_FROM_NAME=RatixPay
SUPPORT_EMAIL=suporte@ratixpay.com
SUPPORT_PHONE=+258 84 xxx xxxx
```

2. **Substitua os valores:**
   - `seu-email@gmail.com` → Seu e-mail Gmail real
   - `sua-senha-de-app-16-caracteres` → A senha de app gerada

### **Passo 4: Testar a Configuração**

Execute o script de teste:

```bash
node scripts/test-email.js
```

## 🔍 Exemplo Prático

### **Antes (Erro):**
```env
GMAIL_SENDER=meuemail@gmail.com
GMAIL_PASS=minhasenhanormal123
```

### **Depois (Correto):**
```env
GMAIL_SENDER=meuemail@gmail.com
GMAIL_PASS=abcd efgh ijkl mnop
```

## ⚠️ Pontos Importantes

### **1. Verificação em Duas Etapas Obrigatória**
- ❌ **Não funciona** sem verificação em duas etapas ativada
- ✅ **Funciona** apenas com verificação em duas etapas + senha de app

### **2. Senha de App vs Senha Normal**
- ❌ **Não use:** Senha normal da conta Google
- ✅ **Use:** Senha de app gerada especificamente

### **3. Formato da Senha de App**
- ✅ **16 caracteres** (ex: `abcd efgh ijkl mnop`)
- ✅ **Sem espaços** no arquivo .env
- ✅ **Apenas letras e números**

## 🧪 Teste de Verificação

### **1. Verificar Configuração:**
```bash
node scripts/test-email.js
```

### **2. Resultado Esperado:**
```
📧 Testando configuração de e-mail...
📤 Remetente: seu-email@gmail.com
✅ E-mail de teste enviado com sucesso!
📧 Message ID: <abc123@mail.gmail.com>
📤 De: "RatixPay" <seu-email@gmail.com>
📥 Para: seu-email@gmail.com
```

## 🔒 Segurança

### **Boas Práticas:**
- ✅ **Nunca compartilhe** a senha de app
- ✅ **Use apenas** para este projeto
- ✅ **Revogue** se não usar mais
- ✅ **Mantenha** o arquivo .env seguro

### **Revogar Senha de App:**
1. Vá para [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Clique em **"Revogar"** na senha específica
3. Gere uma nova se necessário

## 🚀 Após a Correção

### **O sistema funcionará:**
- ✅ **E-mails automáticos** após pagamentos
- ✅ **Confirmações personalizadas** para clientes
- ✅ **Logs de sucesso** no console
- ✅ **Sem erros** de autenticação

### **Monitoramento:**
```
✅ E-mail de confirmação personalizado enviado
📧 E-mail de confirmação enviado para: cliente@gmail.com
```

## 📞 Suporte

Se ainda tiver problemas:

1. **Verifique** se a verificação em duas etapas está ativa
2. **Confirme** se a senha de app foi gerada corretamente
3. **Teste** com o script de teste
4. **Verifique** se o arquivo .env está na raiz do projeto

---

**Status:** ✅ **Correção Documentada** - Siga os passos acima para resolver o erro de autenticação do Gmail. 