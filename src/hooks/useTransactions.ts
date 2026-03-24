import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Transaction, Category, TransactionWithCategory } from '../types/database';

export function useTransactions() {
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [transactionsResult, categoriesResult] = await Promise.all([
        supabase
          .from('transactions')
          .select('*, category:categories(*)')
          .order('date', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase
          .from('categories')
          .select('*')
          .order('name'),
      ]);

      if (transactionsResult.error) {
        throw new Error(transactionsResult.error.message);
      }

      if (categoriesResult.error) {
        throw new Error(categoriesResult.error.message);
      }

      setTransactions(transactionsResult.data as TransactionWithCategory[]);
      setCategories(categoriesResult.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      await loadData();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar transação';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      await loadData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir transação';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    transactions,
    categories,
    loading,
    error,
    refetch: loadData,
    addTransaction,
    deleteTransaction,
  };
}
