import { useMemo } from 'react';
import type { TransactionWithCategory } from '../types/database';

export interface TransactionStats {
  income: number;
  expense: number;
  balance: number;
  savingsRate: number;
  transactionCount: number;
  expensesByCategory: Record<string, number>;
  topExpenseCategories: Array<[string, number]>;
}

export interface FilteredTransactions {
  dateFiltered: TransactionWithCategory[];
  finalFiltered: TransactionWithCategory[];
  stats: TransactionStats;
}

export function useTransactionStats(
  transactions: TransactionWithCategory[],
  filterMonth: number,
  filterYear: number,
  filterCategory: string,
  searchTerm: string
): FilteredTransactions {
  return useMemo(() => {
    // First Pass: Date Filter
    const dateFiltered = transactions.filter(t => {
      const d = new Date(t.date + 'T00:00:00');
      const yearMatch = d.getFullYear() === filterYear;
      const monthMatch = filterMonth === -1 || d.getMonth() === filterMonth;
      return yearMatch && monthMatch;
    });

    // Second Pass: Search & Category Filter
    const finalFiltered = dateFiltered.filter(t => {
      const matchesSearch = 
        t.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.category?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || t.category_id === filterCategory;
      return matchesSearch && matchesCategory;
    });

    // Calculate Statistics
    const income = finalFiltered
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = finalFiltered
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = income - expense;
    const savingsRate = income > 0 ? (balance / income) * 100 : 0;

    // Expenses by Category
    const expensesByCategory = finalFiltered
      .filter(t => t.type === 'expense' && t.category)
      .reduce((acc, t) => {
        acc[t.category!.name] = (acc[t.category!.name] || 0) + Number(t.amount);
        return acc;
      }, {} as Record<string, number>);

    const topExpenseCategories = Object.entries(expensesByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      dateFiltered,
      finalFiltered,
      stats: {
        income,
        expense,
        balance,
        savingsRate,
        transactionCount: finalFiltered.length,
        expensesByCategory,
        topExpenseCategories
      }
    };
  }, [transactions, filterMonth, filterYear, filterCategory, searchTerm]);
}
