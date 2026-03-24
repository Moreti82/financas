import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

// Mock user para desenvolvimento
const mockUser = {
  id: 'mock-user-id',
  email: 'admin@financaspro.com',
  created_at: new Date().toISOString(),
  aud: 'authenticated',
  role: 'authenticated',
} as User;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    // Verificar se está em modo desenvolvimento sem Supabase
    const isDevMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === '';
    
    if (isDevMode) {
      // Modo desenvolvimento - usar mock user
      setUser(mockUser);
      setLoading(false);
      return;
    }

    // Modo produção - usar Supabase real
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setUser(session?.user ?? null);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const isDevMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === '';
    
    if (isDevMode) {
      // Mock signup - sempre funciona
      setUser(mockUser);
      toast.success('Conta criada com sucesso!', 'Bem-vindo ao FinançasPro');
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        toast.error('Erro ao criar conta', error.message);
      } else {
        toast.success('Conta criada com sucesso!', 'Verifique seu email para confirmar');
      }
      
      return { error };
    } catch (error) {
      toast.error('Erro ao criar conta', 'Ocorreu um erro inesperado');
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    const isDevMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === '';
    
    if (isDevMode) {
      // Mock signin - funciona com qualquer email/senha
      const mockSignInUser = {
        id: 'mock-user-id',
        email: email,
        created_at: new Date().toISOString(),
        aud: 'authenticated',
        role: 'authenticated',
      } as User;
      
      setUser(mockSignInUser);
      toast.success('Login realizado com sucesso!', `Bem-vindo de volta, ${email}`);
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast.error('Erro ao fazer login', error.message);
      } else {
        toast.success('Login realizado com sucesso!', 'Bem-vindo ao FinançasPro');
      }
      
      return { error };
    } catch (error) {
      toast.error('Erro ao fazer login', 'Ocorreu um erro inesperado');
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    const isDevMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === '';
    
    if (isDevMode) {
      setUser(null);
      return;
    }
    
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
