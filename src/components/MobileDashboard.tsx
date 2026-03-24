import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useSubscription } from '../hooks/useSubscription';
import { supabase } from '../lib/supabase';
import type { Category, TransactionWithCategory } from '../types/database';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank, 
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Home,
  Car,
  Heart,
  Gamepad2,
  Utensils,
  Briefcase,
  Laptop,
  Gift,
  Shield,
  LogOut
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { PlanLimits } from './PlanLimits';
import { Modal } from './Modal';
import { TransactionFormModal } from './TransactionFormModal';
import { CategoryFormModal } from './CategoryFormModal';
import { MobileMenu } from './MobileMenu';

export function MobileDashboard() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserProfile();
  const { currentPlan, isPro } = useSubscription();
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [transactionsResult, categoriesResult] = await Promise.all([
        supabase
          .from('transactions')
          .select('*, category:categories(*)')
          .order('created_at', { ascending: false }),
        supabase
          .from('categories')
          .select('*')
          .order('name')
      ]);

      if (transactionsResult.data) setTransactions(transactionsResult.data);
      if (categoriesResult.data) setCategories(categoriesResult.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estatísticas
  const stats = {
    totalIncome: transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0),
    totalExpense: transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0),
    balance: 0,
    transactionCount: transactions.length,
    savingsRate: 0
  };

  stats.balance = stats.totalIncome - stats.totalExpense;
  stats.savingsRate = stats.totalIncome > 0 ? (stats.balance / stats.totalIncome) * 100 : 0;

  const getCategoryIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      'home': <Home className="w-4 h-4" />,
      'car': <Car className="w-4 h-4" />,
      'heart': <Heart className="w-4 h-4" />,
      'gamepad-2': <Gamepad2 className="w-4 h-4" />,
      'utensils': <Utensils className="w-4 h-4" />,
      'shopping-cart': <Briefcase className="w-4 h-4" />,
      'briefcase': <Briefcase className="w-4 h-4" />,
      'laptop': <Laptop className="w-4 h-4" />,
      'trending-up': <TrendingUp className="w-4 h-4" />,
      'gift': <Gift className="w-4 h-4" />
    };
    return icons[iconName] || <Wallet className="w-4 h-4" />;
  };

  const recentTransactions = transactions.slice(0, 3);

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'} transition-colors duration-300`}>
      {/* Header Mobile */}
      <header className={`sticky top-0 z-40 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/80 backdrop-blur-lg border-slate-200/50'} border-b shadow-sm`}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>FinançasPro</h1>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Seu controle financeiro</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <MobileMenu darkMode={darkMode} setDarkMode={setDarkMode} />
              <UserAvatar email={user?.email} size="sm" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Plan Limits */}
        <PlanLimits currentTransactions={transactions.length} currentCategories={categories.length} />

        {/* Stats Grid - Mobile Optimized */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 border ${darkMode ? 'border-gray-700' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600">
                <ArrowUpRight className="w-3 h-3" />
                <span>12.5%</span>
              </div>
            </div>
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>R$ {stats.totalIncome.toFixed(0)}</h3>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Receitas</p>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 border ${darkMode ? 'border-gray-700' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg text-white">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-1 text-xs text-red-600">
                <ArrowDownRight className="w-3 h-3" />
                <span>8.2%</span>
              </div>
            </div>
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>R$ {stats.totalExpense.toFixed(0)}</h3>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Despesas</p>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 border ${darkMode ? 'border-gray-700' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 ${stats.balance >= 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-red-500 to-red-600'} rounded-lg text-white`}>
                <Wallet className="w-4 h-4" />
              </div>
              <div className={`flex items-center gap-1 text-xs ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.balance >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                <span>{stats.balance >= 0 ? '15.3' : '5.7'}%</span>
              </div>
            </div>
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>R$ {stats.balance.toFixed(0)}</h3>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Saldo</p>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 border ${darkMode ? 'border-gray-700' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 ${stats.savingsRate >= 20 ? 'bg-gradient-to-r from-purple-500 to-purple-600' : 'bg-gradient-to-r from-orange-500 to-orange-600'} rounded-lg text-white`}>
                <PiggyBank className="w-4 h-4" />
              </div>
              <div className={`flex items-center gap-1 text-xs ${stats.savingsRate >= 20 ? 'text-green-600' : 'text-orange-600'}`}>
                {stats.savingsRate >= 20 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                <span>{stats.savingsRate >= 20 ? '5.2' : '2.1'}%</span>
              </div>
            </div>
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{stats.savingsRate.toFixed(0)}%</h3>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Economia</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <button
            id="new-transaction-btn"
            onClick={() => setShowForm(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span className="font-medium">Nova</span>
          </button>
          <button
            onClick={() => setShowCategories(true)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-slate-700'} rounded-xl border ${darkMode ? 'border-gray-700' : 'border-slate-200'} transition-all hover:shadow-lg`}
          >
            <Briefcase className="w-4 h-4" />
            <span className="font-medium">Categorias</span>
          </button>
        </div>

        {/* Recent Transactions */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl border ${darkMode ? 'border-gray-700' : 'border-slate-200'} p-4`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Recentes</h2>
            <button className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}>
              Ver todas
            </button>
          </div>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className={`flex items-center justify-between p-3 ${darkMode ? 'bg-gray-700' : 'bg-slate-50'} rounded-lg`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} rounded-lg`}>
                    {getCategoryIcon(transaction.category?.icon || 'wallet')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-slate-900'} truncate`}>
                      {transaction.description}
                    </p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                      {transaction.category?.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}R$ {Number(transaction.amount).toFixed(0)}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                    {new Date(transaction.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modals */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Nova Transação"
        size="md"
      >
        <TransactionFormModal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            loadData();
          }}
          categories={categories}
        />
      </Modal>

      <Modal
        isOpen={showCategories}
        onClose={() => setShowCategories(false)}
        title="Gerenciar Categorias"
        size="lg"
      >
        <CategoryFormModal
          isOpen={showCategories}
          onClose={() => setShowCategories(false)}
          onSuccess={() => {
            setShowCategories(false);
            loadData();
          }}
        />
      </Modal>
    </div>
  );
}
