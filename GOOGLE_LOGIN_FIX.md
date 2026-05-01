# 🔧 Guia de Correção: Login com Google

## ✅ Problema Identificado

O login com Google estava falhando por **dois motivos**:

### 1. **Erro no Código (CORRIGIDO)**
O arquivo `UserProfileContext.tsx` tentava salvar o campo `email` na tabela `user_profiles`, mas essa coluna **não existe** no banco de dados. Isso causava uma falha silenciosa após o login bem-sucedido, impedindo o carregamento do dashboard.

**Status**: ✅ **CORRIGIDO** - Removemos a linha que tentava salvar o email.

---

### 2. **Configuração do Supabase (VOCÊ PRECISA FAZER)**

O login via Google exige configuração específica no painel do Supabase. Siga os passos abaixo:

## 🚀 Passos para Configurar o Login com Google

### Passo 1: Acessar as Configurações de Autenticação

1. Acesse o painel do Supabase: https://app.supabase.com
2. Selecione seu projeto **financas-pro**
3. Vá para **Authentication** → **Providers**
4. Procure por **Google** e clique nele

### Passo 2: Ativar o Provedor Google

1. Clique no toggle para **ativar** o provedor Google
2. Você verá dois campos:
   - **Client ID**
   - **Client Secret**

### Passo 3: Obter Credenciais do Google Cloud

Se você ainda não tem as credenciais:

1. Acesse: https://console.cloud.google.com
2. Crie um novo projeto ou selecione um existente
3. Vá para **APIs & Services** → **Credentials**
4. Clique em **Create Credentials** → **OAuth 2.0 Client ID**
5. Selecione **Web application**
6. Em **Authorized redirect URIs**, adicione:
   ```
   https://ioxkmtvwxtgzxdtjucgy.supabase.co/auth/v1/callback
   ```
   *(Substitua `ioxkmtvwxtgzxdtjucgy` pelo seu Project ID do Supabase)*

7. Copie o **Client ID** e **Client Secret** gerados

### Passo 4: Configurar no Supabase

1. Volte para o painel do Supabase
2. Cole o **Client ID** no campo correspondente
3. Cole o **Client Secret** no campo correspondente
4. Clique em **Save**

### Passo 5: Configurar URLs de Redirecionamento

1. Em **Authentication** → **Settings**
2. Vá para a seção **Site URL**
3. Configure conforme seu ambiente:

#### Para Desenvolvimento Local:
```
http://localhost:5173
```

#### Para Produção (Vercel):
```
https://seu-dominio.vercel.app
```

4. Em **Redirect URLs**, adicione:
   - `http://localhost:5173` (desenvolvimento)
   - `https://seu-dominio.vercel.app` (produção)

### Passo 6: Desabilitar Confirmação de Email (Opcional - Desenvolvimento)

Para facilitar testes em desenvolvimento:

1. Em **Authentication** → **Settings**
2. Procure por **Email confirmations**
3. Desabilite se desejar (recomendado apenas para dev)

---

## ✅ Testando o Login com Google

Após configurar:

1. Inicie o servidor: `npm run dev`
2. Acesse: `http://localhost:5173`
3. Clique em **"Entrar com Google"**
4. Você será redirecionado para o Google
5. Após autenticar, voltará para o app e entrará no dashboard

---

## 🐛 Se Ainda Não Funcionar

### Erro: "Invalid Client ID"
- Verifique se o Client ID está correto
- Certifique-se de que o URI de redirecionamento no Google Cloud está correto

### Erro: "Redirect URI mismatch"
- Verifique se a URL em **Site URL** do Supabase bate com a URL que você está acessando
- Verifique se o URI de redirecionamento está configurado no Google Cloud

### Erro: "Session not found"
- Limpe os cookies do navegador
- Tente novamente
- Verifique se o JavaScript está habilitado

### Erro: "User profile not created"
- Verifique se o SQL do Supabase foi executado corretamente
- Verifique se a tabela `user_profiles` existe
- Verifique se o trigger `on_auth_user_created` está ativo

---

## 📝 Resumo das Mudanças

### Arquivo Modificado: `src/contexts/UserProfileContext.tsx`

**Antes:**
```typescript
const { data, error } = await supabase
  .from('user_profiles')
  .upsert({
    user_id: user.id,
    email: user.email, // ❌ Campo não existe!
    role: userProfile?.role || 'user',
    ...updates,
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id' })
```

**Depois:**
```typescript
const { data, error } = await supabase
  .from('user_profiles')
  .upsert({
    user_id: user.id,
    // ✅ Removido campo 'email'
    role: userProfile?.role || 'user',
    ...updates,
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id' })
```

---

## 🎯 Próximos Passos

1. ✅ Aplique as correções de código (já feito)
2. 📋 Configure o Google OAuth no Google Cloud Console
3. 🔑 Adicione as credenciais no Supabase
4. 🌐 Configure as URLs de redirecionamento
5. ✅ Teste o login com Google
6. 🚀 Deploy em produção (Vercel)

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique o console do navegador (F12) para erros
2. Verifique os logs do Supabase em **Authentication** → **Logs**
3. Verifique se o banco de dados está respondendo
4. Tente fazer login com email/senha primeiro para descartar problemas de banco de dados

---

**Desenvolvido com ❤️ para FinançasPro**
