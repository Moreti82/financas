import { supabase } from '../lib/supabase';
import type { Transaction, Category, TransactionWithCategory, Database } from '../types/database';

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

  static async createTransaction(
    transaction: Omit<Transaction, 'id' | 'created_at'>
  ): Promise<Transaction> {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: transaction.user_id,
        category_id: transaction.category_id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
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
}
