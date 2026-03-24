import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Search,
  Bell,
  Moon,
  Sun,
  Download,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  ShoppingCart,
  Home,
  Car,
  Heart,
  Gamepad2,
  Utensils,
  Briefcase,
  Laptop,
  Gift,
  Shield,
  LogOut,
  Filter
} from 'lucide-react';
import { TransactionForm } from './TransactionForm';
import { CategoryList } from './CategoryList';
import { UserAvatar } from './UserAvatar';
import { PlanLimits } from './PlanLimits';

interface StatCard {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export function ModernDashboard() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserProfile();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  const statCards: StatCard[] = [
    {
      title: 'Receitas',
      value: `R$ ${stats.totalIncome.toFixed(2)}`,
      change: 12.5,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-r from-green-500 to-green-600'
    },
    {
      title: 'Despesas',
      value: `R$ ${stats.totalExpense.toFixed(2)}`,
      change: -8.2,
      icon: <TrendingDown className="w-5 h-5" />,
      color: 'text-red-600',
      bgColor: 'bg-gradient-to-r from-red-500 to-red-600'
    },
    {
      title: 'Saldo',
      value: `R$ ${stats.balance.toFixed(2)}`,
      change: stats.balance >= 0 ? 15.3 : -5.7,
      icon: <Wallet className="w-5 h-5" />,
      color: stats.balance >= 0 ? 'text-blue-600' : 'text-red-600',
      bgColor: stats.balance >= 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-red-500 to-red-600'
    },
    {
      title: 'Taxa de Economia',
      value: `${stats.savingsRate.toFixed(1)}%`,
      change: stats.savingsRate >= 20 ? 5.2 : -2.1,
      icon: <PiggyBank className="w-5 h-5" />,
      color: stats.savingsRate >= 20 ? 'text-purple-600' : 'text-orange-600',
      bgColor: stats.savingsRate >= 20 ? 'bg-gradient-to-r from-purple-500 to-purple-600' : 'bg-gradient-to-r from-orange-500 to-orange-600'
    }
  ];

  const getCategoryIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      'home': <Home className="w-4 h-4" />,
      'car': <Car className="w-4 h-4" />,
      'heart': <Heart className="w-4 h-4" />,
      'gamepad-2': <Gamepad2 className="w-4 h-4" />,
      'utensils': <Utensils className="w-4 h-4" />,
      'shopping-cart': <ShoppingCart className="w-4 h-4" />,
      'briefcase': <Briefcase className="w-4 h-4" />,
      'laptop': <Laptop className="w-4 h-4" />,
      'trending-up': <TrendingUp className="w-4 h-4" />,
      'gift': <Gift className="w-4 h-4" />
    };
    return icons[iconName] || <Wallet className="w-4 h-4" />;
  };

  const recentTransactions = transactions.slice(0, 5);

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>Carregando seu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'} transition-colors duration-300`}>
      {/* Header Moderno */}
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/80 backdrop-blur-lg border-slate-200/50'} sticky top-0 z-50 border-b shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>FinançasPro</h1>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Controle financeiro inteligente</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className={`hidden md:flex items-center gap-2 px-3 py-2 ${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-600' : 'border-slate-200'}`}>
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar transações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-48 text-sm ${darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-slate-700 placeholder-slate-400'} border-0 focus:outline-none`}
                />
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-white text-slate-600'} rounded-lg border ${darkMode ? 'border-gray-600' : 'border-slate-200'} hover:shadow-md transition-all`}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Notifications */}
              <button className={`p-2 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-slate-600'} rounded-lg border ${darkMode ? 'border-gray-600' : 'border-slate-200'} hover:shadow-md transition-all`}>
                <Bell className="w-4 h-4" />
              </button>

              {/* Admin Button */}
              {isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg transition-all hover:shadow-lg"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              )}

              {/* User Avatar */}
              <UserAvatar email={user?.email} size="md" />

              {/* Sign Out */}
              <button
                onClick={() => signOut()}
                className={`flex items-center gap-2 px-4 py-2 ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-slate-600 hover:bg-slate-50'} rounded-lg border ${darkMode ? 'border-gray-600' : 'border-slate-200'} transition-all`}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Plan Limits */}
        <PlanLimits currentTransactions={transactions.length} currentCategories={categories.length} />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 border ${darkMode ? 'border-gray-700' : 'border-slate-200'} hover:shadow-lg transition-all hover:scale-105`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 ${stat.bgColor} rounded-xl text-white`}>
                  {stat.icon}
                </div>
                <div className={`flex items-center gap-1 text-sm ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  <span>{Math.abs(stat.change)}%</span>
                </div>
              </div>
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'} mb-1`}>{stat.value}</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Nova Transação
          </button>
          <button
            onClick={() => setShowCategories(true)}
            className={`flex items-center gap-2 px-6 py-3 ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-slate-700 hover:bg-slate-50'} rounded-xl border ${darkMode ? 'border-gray-700' : 'border-slate-200'} transition-all hover:shadow-lg`}
          >
            <Filter className="w-5 h-5" />
            Gerenciar Categorias
          </button>
          <button className={`flex items-center gap-2 px-6 py-3 ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-slate-700 hover:bg-slate-50'} rounded-xl border ${darkMode ? 'border-gray-700' : 'border-slate-200'} transition-all hover:shadow-lg`}>
            <Download className="w-5 h-5" />
            Exportar Dados
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl border ${darkMode ? 'border-gray-700' : 'border-slate-200'} p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Transações Recentes</h2>
                <button className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}>
                  Ver todas
                </button>
              </div>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className={`flex items-center justify-between p-4 ${darkMode ? 'bg-gray-700' : 'bg-slate-50'} rounded-xl`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} rounded-lg`}>
                        {getCategoryIcon(transaction.category?.icon || 'wallet')}
                      </div>
                      <div>
                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>{transaction.description}</p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>{transaction.category?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}R$ {Number(transaction.amount).toFixed(2)}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Categories Overview */}
          <div>
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl border ${darkMode ? 'border-gray-700' : 'border-slate-200'} p-6`}>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'} mb-6`}>Categorias</h2>
              <div className="space-y-3">
                {categories.slice(0, 6).map((category) => {
                  const categoryTransactions = transactions.filter(t => t.category_id === category.id);
                  const total = categoryTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
                  
                  return (
                    <div key={category.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 ${category.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} rounded-lg`}>
                          {getCategoryIcon(category.icon)}
                        </div>
                        <div>
                          <p className={`font-medium ${darkMode ? 'text-white' : 'text-slate-900'}`}>{category.name}</p>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>{categoryTransactions.length} transações</p>
                        </div>
                      </div>
                      <p className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        R$ {total.toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          categories={categories}
          onSuccess={() => {
            setShowForm(false);
            loadData();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {showCategories && (
        <CategoryList
          categories={categories}
          onCategoryUpdated={() => {
            setShowCategories(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
