-- ============================================
-- CONFIGURAÇÃO DO SUPABASE - FINANÇASPRO
-- ============================================

-- 1. Criar tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user' NOT NULL,
  plan TEXT CHECK (plan IN ('free', 'pro', 'enterprise')) DEFAULT 'free' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- 2. Criar tabela de assinaturas
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan TEXT CHECK (plan IN ('free', 'pro', 'enterprise')) DEFAULT 'free' NOT NULL,
  status TEXT CHECK (status IN ('active', 'cancelled', 'expired')) DEFAULT 'active' NOT NULL,
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- 3. Criar tabela de categorias (se ainda não existir)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  color TEXT DEFAULT '#3B82F6' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Criar tabela de transações (se ainda não existir)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id);

-- 6. Criar RLS (Row Level Security) policies
-- Habilitar RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policies para user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies para subscriptions
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription" ON public.subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies para categories
CREATE POLICY "Users can view own categories" ON public.categories
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

-- Policies para transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language plpgsql;

-- Aplicar trigger nas tabelas
CREATE TRIGGER handle_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 8. Criar função para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, role, plan)
  VALUES (
    NEW.id,
    CASE 
      WHEN NEW.email = 'admin@financaspro.com' THEN 'admin'
      ELSE 'user'
    END,
    'free'
  );
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Trigger automático para criar perfil
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Inserir categorias padrão (opcional)
INSERT INTO public.categories (name, icon, type, color, user_id) VALUES
  -- Receitas
  ('Salário', 'briefcase', 'income', '#10B981', NULL),
  ('Freelance', 'laptop', 'income', '#10B981', NULL),
  ('Investimentos', 'trending-up', 'income', '#10B981', NULL),
  ('Presentes', 'gift', 'income', '#10B981', NULL),
  
  -- Despesas
  ('Alimentação', 'utensils', 'expense', '#EF4444', NULL),
  ('Transporte', 'car', 'expense', '#EF4444', NULL),
  ('Moradia', 'home', 'expense', '#EF4444', NULL),
  ('Saúde', 'heart', 'expense', '#EF4444', NULL),
  ('Educação', 'book-open', 'expense', '#EF4444', NULL),
  ('Lazer', 'gamepad-2', 'expense', '#EF4444', NULL),
  ('Compras', 'shopping-cart', 'expense', '#EF4444', NULL),
  ('Serviços', 'wrench', 'expense', '#EF4444', NULL),
  ('Outros', 'more-horizontal', 'expense', '#EF4444', NULL)
ON CONFLICT DO NOTHING;

-- 10. Criar view para facilitar queries
CREATE OR REPLACE VIEW public.user_transactions AS
SELECT 
  t.*,
  c.name as category_name,
  c.icon as category_icon,
  c.color as category_color,
  c.type as category_type
FROM public.transactions t
LEFT JOIN public.categories c ON t.category_id = c.id;

-- 11. Criar função para buscar dados do dashboard
CREATE OR REPLACE FUNCTION public.get_user_dashboard(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_transactions', (SELECT COUNT(*) FROM public.transactions WHERE user_id = user_uuid),
    'total_income', (SELECT COALESCE(SUM(amount), 0) FROM public.transactions WHERE user_id = user_uuid AND type = 'income'),
    'total_expense', (SELECT COALESCE(SUM(amount), 0) FROM public.transactions WHERE user_id = user_uuid AND type = 'expense'),
    'balance', (SELECT 
      (SELECT COALESCE(SUM(amount), 0) FROM public.transactions WHERE user_id = user_uuid AND type = 'income') -
      (SELECT COALESCE(SUM(amount), 0) FROM public.transactions WHERE user_id = user_uuid AND type = 'expense')
    ),
    'recent_transactions', (
      SELECT json_agg(
        json_build_object(
          'id', id,
          'description', description,
          'amount', amount,
          'type', type,
          'date', date,
          'category', json_build_object(
            'name', c.name,
            'icon', c.icon,
            'color', c.color
          )
        )
      )
      FROM public.transactions t
      LEFT JOIN public.categories c ON t.category_id = c.id
      WHERE t.user_id = user_uuid
      ORDER BY t.created_at DESC
      LIMIT 5
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
