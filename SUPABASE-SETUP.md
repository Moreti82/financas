# 🚀 Configuração do Supabase - FinançasPro

## 📋 Passo a Passo Completo

### 1. Criar Projeto Supabase

1. Acesse: https://supabase.com
2. Clique em "Start your project"
3. Faça login com GitHub/Google
4. Clique em "New Project"
5. Nome do projeto: `financas-pro`
6. Senha do banco: crie uma senha forte e salve
7. Região: escolha a mais próxima (ex: South America East)
8. Aguarde a criação (2-3 minutos)

---

### 2. Configurar Variáveis de Ambiente

Após criar o projeto, você precisa das credenciais:

1. No dashboard do Supabase → Settings → API
2. Copie a **Project URL** (ex: `https://xxxxxxxx.supabase.co`)
3. Copie a **anon public key** (ex: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

4. No seu projeto, crie o arquivo `.env.local`:
```bash
# Substitua com suas credenciais reais
VITE_SUPABASE_URL=https://SEU-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=SUA-CHAVE-ANON-AQUI
```

---

### 3. Executar SQL no Supabase

1. No dashboard Supabase → SQL Editor
2. Copie todo o conteúdo do arquivo `supabase-setup.sql`
3. Cole no editor SQL
4. Clique em "Run" ou "Execute"

**O que será criado:**
- ✅ Tabela `user_profiles` (roles e planos)
- ✅ Tabela `subscriptions` (assinaturas)
- ✅ Tabela `categories` (categorias padrão)
- ✅ Tabela `transactions` (transações)
- ✅ Índices para performance
- ✅ RLS (Row Level Security)
- ✅ Triggers automáticos
- ✅ Views e funções auxiliares

---

### 4. Configurar Authentication

1. Vá para Authentication → Settings
2. Em "Site URL", coloque: `http://localhost:5173`
3. Em "Redirect URLs", adicione: `http://localhost:5173`
4. Desabilite "Enable email confirmations" (para desenvolvimento)

---

### 5. Testar a Configuração

1. Pare o servidor se estiver rodando: `Ctrl + C`
2. Reinicie com as novas variáveis:
```bash
npm run dev
```

3. Teste o cadastro:
   - Vá para `http://localhost:5173`
   - Crie uma conta com qualquer email
   - Faça login

---

### 6. Verificar se Funciona

#### ✅ Indicadores de Sucesso:
- Login funciona sem erros
- Dashboard carrega com dados
- Categorias aparecem
- Transações podem ser adicionadas

#### ❌ Problemas Comuns:
- **Invalid credentials**: Verifique `.env.local`
- **CORS errors**: Verifique redirect URLs
- **Permission denied**: Execute o SQL novamente

---

### 7. Criar Usuário Admin

Para ter acesso admin:

1. Faça signup com: `admin@financaspro.com`
2. O sistema automaticamente criará perfil admin
3. Faça login e clique no botão "Admin"

---

## 🔧 Estrutura Criada

### Tabelas Principais:
```
user_profiles
├── id (UUID)
├── user_id (UUID) → auth.users
├── role (admin/user)
├── plan (free/pro/enterprise)
└── timestamps

subscriptions
├── id (UUID)
├── user_id (UUID) → auth.users
├── plan (free/pro/enterprise)
├── status (active/cancelled/expired)
├── stripe_subscription_id (TEXT)
└── period dates

categories
├── id (UUID)
├── user_id (UUID) → auth.users
├── name (TEXT)
├── icon (TEXT)
├── type (income/expense)
└── color (TEXT)

transactions
├── id (UUID)
├── user_id (UUID) → auth.users
├── category_id (UUID) → categories
├── type (income/expense)
├── amount (DECIMAL)
├── description (TEXT)
└── date (DATE)
```

### Segurança:
- ✅ RLS habilitado em todas tabelas
- ✅ Usuários só veem seus próprios dados
- ✅ Admin tem acesso total via código

---

## 🚀 Comandos Úteis

### Resetar Banco:
```sql
-- Deletar tudo (cuidado!)
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Recriar (execute o setup.sql novamente)
```

### Verificar Dados:
```sql
-- Ver usuários
SELECT * FROM public.user_profiles;

-- Ver transações
SELECT * FROM public.transactions;

-- Ver categorias
SELECT * FROM public.categories;
```

---

## 📱 Pronto para Usar!

Após seguir esses passos:
1. ✅ Sistema 100% funcional
2. ✅ Dados persistindo no Supabase
3. ✅ Multiusuários funcionando
4. ✅ Painel admin operacional
5. ✅ Ready para deploy em produção

**Agora é só desenvolver!** 🎉
