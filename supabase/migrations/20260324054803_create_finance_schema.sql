/*
  # Personal Finance App Schema

  ## New Tables
  
  ### Categories
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users) - null for default categories
  - `name` (text) - category name
  - `icon` (text) - icon identifier
  - `type` (text) - 'income' or 'expense'
  - `created_at` (timestamptz)
  
  ### Transactions
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `category_id` (uuid, references categories)
  - `type` (text) - 'income' or 'expense'
  - `amount` (decimal) - transaction amount
  - `description` (text) - transaction description
  - `date` (date) - transaction date
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own transactions
  - Users can see default categories and their own custom categories
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text NOT NULL DEFAULT 'circle',
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view default and own categories"
  ON categories FOR SELECT
  TO authenticated
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can create own categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own categories"
  ON categories FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  amount decimal(12, 2) NOT NULL CHECK (amount > 0),
  description text DEFAULT '',
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Insert default categories for expenses
INSERT INTO categories (user_id, name, icon, type) VALUES
  (NULL, 'Alimentação', 'utensils', 'expense'),
  (NULL, 'Transporte', 'car', 'expense'),
  (NULL, 'Moradia', 'home', 'expense'),
  (NULL, 'Saúde', 'heart', 'expense'),
  (NULL, 'Educação', 'book-open', 'expense'),
  (NULL, 'Lazer', 'smile', 'expense'),
  (NULL, 'Compras', 'shopping-bag', 'expense'),
  (NULL, 'Contas', 'receipt', 'expense'),
  (NULL, 'Outros', 'more-horizontal', 'expense')
ON CONFLICT DO NOTHING;

-- Insert default categories for income
INSERT INTO categories (user_id, name, icon, type) VALUES
  (NULL, 'Salário', 'briefcase', 'income'),
  (NULL, 'Freelance', 'laptop', 'income'),
  (NULL, 'Investimentos', 'trending-up', 'income'),
  (NULL, 'Outros', 'more-horizontal', 'income')
ON CONFLICT DO NOTHING;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);