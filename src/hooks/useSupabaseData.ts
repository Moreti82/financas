import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Category, TransactionWithCategory } from '../types/database';

export interface SupabaseDataState {
  transactions: TransactionWithCategory[];
  categories: Category[];
  loading: boolean;
  error: string | null;
}

export function useSupabaseData() {
  const [state, setState] = useState<SupabaseDataState>({
    transactions: [],
    categories: [],
    loading: true,
    error: null
  });

  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setState(prev => ({ ...prev, error: 'Usuário não autenticado' }));
        return;
      }

      const [transactionsResult, categoriesResult] = await Promise.all([
        supabase
          .from('transactions')
          .select('*, category:categories(*)')
          .order('date', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase
          .from('categories')
          .select('*')
          .order('name')
      ]);

      if (transactionsResult.error) {
        throw new Error(transactionsResult.error.message);
      }
      if (categoriesResult.error) {
        throw new Error(categoriesResult.error.message);
      }

      setState({
        transactions: transactionsResult.data || [],
        categories: categoriesResult.data || [],
        loading: false,
        error: null
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    ...state,
    refetch: loadData
  };
}
