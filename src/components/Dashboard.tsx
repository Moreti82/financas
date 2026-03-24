import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useSubscription } from '../hooks/useSubscription';
import { supabase } from '../lib/supabase';
import type { Category, TransactionWithCategory } from '../types/database';
import { LogOut, Plus, TrendingUp, TrendingDown, Wallet, Settings, Shield, Crown } from 'lucide-react';
import { TransactionList } from './TransactionList';
import { TransactionForm } from './TransactionForm';
import { MonthlyChart } from './MonthlyChart';
import { CategoryList } from './CategoryList';
import { UserAvatar } from './UserAvatar';
import { PlanLimits } from './PlanLimits';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserProfile();
  const { currentPlan, isPro } = useSubscription();
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithCategory | undefined>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
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

      if (transactionsResult.data) {
        setTransactions(transactionsResult.data as TransactionWithCategory[]);
      }
      if (categoriesResult.data) {
        setCategories(categoriesResult.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionAdded = () => {
    setShowForm(false);
    setEditingTransaction(undefined);
    loadData();
  };

  const handleTransactionEdit = (transaction: TransactionWithCategory) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTransaction(undefined);
  };

  const handleTransactionDeleted = () => {
    loadData();
  };

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpenses;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserAvatar email={user?.email} size="md" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">FinançasPro</h1>
                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  onClick={() => window.location.href = '/admin'}
                  className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:text-purple-900 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Categorias</span>
              </button>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1">Saldo Total</p>
            <p className={`text-3xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              R$ {balance.toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1">Receitas</p>
            <p className="text-3xl font-bold text-green-600">R$ {totalIncome.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-1">Despesas</p>
            <p className="text-3xl font-bold text-red-600">R$ {totalExpenses.toFixed(2)}</p>
          </div>
        </div>

        <div className="mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-lg shadow-blue-600/30"
          >
            <Plus className="w-5 h-5" />
            Nova Transação
          </button>
        </div>

        {showForm && (
          <div className="mb-8">
            <TransactionForm
              transaction={editingTransaction}
              categories={categories}
              onSuccess={handleTransactionAdded}
              onCancel={handleFormCancel}
            />
          </div>
        )}

        {showCategories && (
          <div className="mb-8">
            <CategoryList
              categories={categories}
              onCategoryUpdated={loadData}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TransactionList
              transactions={transactions}
              onTransactionDeleted={handleTransactionDeleted}
              onTransactionEdit={handleTransactionEdit}
            />
          </div>
          <div className="lg:col-span-1">
            <MonthlyChart transactions={transactions} />
          </div>
        </div>
      </main>
    </div>
  );
}
