# FinançasPro

Uma aplicação moderna de controle financeiro pessoal construída com React, TypeScript e Tailwind CSS.

## 🚀 Funcionalidades

- ✅ Autenticação segura com Supabase
- ✅ Registro e login de usuários
- ✅ Dashboard com resumo financeiro
- ✅ Cadastro de transações (receitas e despesas)
- ✅ Categorização de transações
- ✅ Visualização de dados com gráficos mensais
- ✅ Interface responsiva e moderna
- ✅ Suporte a múltiplos idiomas (PT-BR)

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + TypeScript
- **Estilização**: Tailwind CSS
- **Build Tool**: Vite
- **Banco de Dados**: Supabase
- **Ícones**: Lucide React
- **Linting**: ESLint
- **Formatação**: Prettier

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

## 🚀 Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd financas
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

4. Configure seu projeto Supabase e atualize as variáveis de ambiente

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Configuração do Supabase

1. Crie um novo projeto no [Supabase](https://supabase.com)
2. Execute o SQL abaixo no editor SQL do Supabase para criar as tabelas:

```sql
-- Tabela de categorias
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  color VARCHAR(7) DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de transações
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);

-- RLS (Row Level Security)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view categories" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Users can insert categories" ON categories
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update categories" ON categories
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete categories" ON categories
  FOR DELETE USING (true);
```

3. Insira algumas categorias padrão:
```sql
INSERT INTO categories (name, type, color) VALUES
('Salário', 'income', '#10b981'),
('Freelance', 'income', '#10b981'),
('Investimentos', 'income', '#10b981'),
('Alimentação', 'expense', '#ef4444'),
('Transporte', 'expense', '#ef4444'),
('Moradia', 'expense', '#ef4444'),
('Saúde', 'expense', '#ef4444'),
('Educação', 'expense', '#ef4444'),
('Lazer', 'expense', '#ef4444'),
('Outros', 'expense', '#ef4444');
```

## 📦 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa ESLint
- `npm run typecheck` - Verificação de tipos TypeScript

## 🎯 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── Auth.tsx        # Componente de autenticação
│   ├── Dashboard.tsx   # Dashboard principal
│   ├── TransactionForm.tsx # Formulário de transações
│   ├── TransactionList.tsx # Lista de transações
│   └── MonthlyChart.tsx # Gráfico mensal
├── contexts/           # Contextos React
│   └── AuthContext.tsx # Contexto de autenticação
├── lib/               # Utilitários
│   └── supabase.ts    # Cliente Supabase
├── types/             # Tipos TypeScript
│   └── database.ts    # Tipos do banco de dados
└── App.tsx            # Componente principal
```

## 🚀 Deploy

### Vercel
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente no painel do Vercel
3. Deploy automático será executado

### Netlify
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Configure as variáveis de ambiente no painel do Netlify

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

Se você encontrou algum problema ou tem alguma sugestão, por favor abra uma [issue](https://github.com/seu-usuario/financas-pro/issues).

---

Desenvolvido com ❤️ por [Seu Nome]
