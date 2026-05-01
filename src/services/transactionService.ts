import { supabase } from '../lib/supabase';
import type { Category, TransactionWithCategory } from '../types/database';

export class TransactionService {
  static async getTransactions(): Promise<TransactionWithCategory[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data as TransactionWithCategory[];
  }

  static async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw new Error(error.message);
    return data;
  }

  static async createTransaction(transaction: {
    user_id: string;
    category_id?: string | null;
    type: 'income' | 'expense';
    amount: number;
    description?: string;
    date?: string;
  }): Promise<{ id: string; user_id: string; category_id: string | null; type: 'income' | 'expense'; amount: number; description: string; date: string; created_at: string }> {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async updateTransaction(
    id: string,
    updates: Partial<{
      category_id: string | null;
      type: 'income' | 'expense';
      amount: number;
      description: string;
      date: string;
    }>
  ): Promise<TransactionWithCategory> {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select('*, category:categories(*)')
      .single();

    if (error) throw new Error(error.message);
    return data as TransactionWithCategory;
  }

  static async deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  static async getTransactionsByMonth(
    year: number,
    month: number
  ): Promise<TransactionWithCategory[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const { data, error } = await supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) throw new Error(error.message);
    return data as TransactionWithCategory[];
  }

  static async getMonthlyStats(year: number): Promise<
    Array<{
      month: number;
      income: number;
      expense: number;
      balance: number;
    }>
  > {
    const stats = [];
    
    for (let month = 1; month <= 12; month++) {
      const transactions = await this.getTransactionsByMonth(year, month);
      
      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
        
      const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);
        
      stats.push({
        month,
        income,
        expense,
        balance: income - expense,
      });
    }
    
    return stats;
  }

  static async getTransactionsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<TransactionWithCategory[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw new Error(error.message);
    return data as TransactionWithCategory[];
  }

  static async getTransactionsByCategory(
    categoryId: string
  ): Promise<TransactionWithCategory[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*, category:categories(*)')
      .eq('category_id', categoryId)
      .order('date', { ascending: false });

    if (error) throw new Error(error.message);
    return data as TransactionWithCategory[];
  }

  static async createCategory(category: {
    user_id?: string | null;
    name: string;
    icon?: string;
    type: 'income' | 'expense';
  }): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async updateCategory(
    id: string,
    updates: Partial<{
      name: string;
      icon: string;
      type: 'income' | 'expense';
    }>
  ): Promise<Category> {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
}
