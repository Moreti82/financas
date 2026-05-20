/*
  # Add color column to categories table

  ## Changes
  - Adds `color` column to `categories` table with default value '#6366f1'
  - Updates existing default categories with appropriate colors
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'color'
  ) THEN
    ALTER TABLE public.categories ADD COLUMN color text NOT NULL DEFAULT '#6366f1';
  END IF;
END $$;

-- Update default expense categories with red-ish colors
UPDATE public.categories SET color = '#ef4444' WHERE user_id IS NULL AND type = 'expense' AND name = 'Alimentação';
UPDATE public.categories SET color = '#f97316' WHERE user_id IS NULL AND type = 'expense' AND name = 'Transporte';
UPDATE public.categories SET color = '#eab308' WHERE user_id IS NULL AND type = 'expense' AND name = 'Moradia';
UPDATE public.categories SET color = '#ef4444' WHERE user_id IS NULL AND type = 'expense' AND name = 'Saúde';
UPDATE public.categories SET color = '#8b5cf6' WHERE user_id IS NULL AND type = 'expense' AND name = 'Educação';
UPDATE public.categories SET color = '#ec4899' WHERE user_id IS NULL AND type = 'expense' AND name = 'Lazer';
UPDATE public.categories SET color = '#14b8a6' WHERE user_id IS NULL AND type = 'expense' AND name = 'Compras';
UPDATE public.categories SET color = '#64748b' WHERE user_id IS NULL AND type = 'expense' AND name = 'Contas';
UPDATE public.categories SET color = '#6b7280' WHERE user_id IS NULL AND type = 'expense' AND name = 'Outros';

-- Update default income categories with green-ish colors
UPDATE public.categories SET color = '#10b981' WHERE user_id IS NULL AND type = 'income' AND name = 'Salário';
UPDATE public.categories SET color = '#06b6d4' WHERE user_id IS NULL AND type = 'income' AND name = 'Freelance';
UPDATE public.categories SET color = '#3b82f6' WHERE user_id IS NULL AND type = 'income' AND name = 'Investimentos';
UPDATE public.categories SET color = '#10b981' WHERE user_id IS NULL AND type = 'income' AND name = 'Outros';
