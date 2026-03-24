-- MUDAR EMAIL ADMIN PARA SEU EMAIL

-- 1. Atualizar função no Supabase
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, role, plan)
  VALUES (
    NEW.id,
    CASE 
      WHEN NEW.email = 'SEU_EMAIL_AQUI@exemplo.com' THEN 'admin'
      ELSE 'user'
    END,
    'free'
  );
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- 2. Se já existir usuário com seu email, atualizar para admin
UPDATE public.user_profiles 
SET role = 'admin' 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'SEU_EMAIL_AQUI@exemplo.com'
);

-- 3. Se já existir usuário admin@financaspro.com, mudar para user
UPDATE public.user_profiles 
SET role = 'user' 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'admin@financaspro.com'
);
