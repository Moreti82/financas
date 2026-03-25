import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
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
  FileText,
  PieChart
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { PlanButton } from './PlanButton';
import { Modal } from './Modal';
import { TransactionFormModal } from './TransactionFormModal';
import { CategoryFormModal } from './CategoryFormModal';
import { MonthlyChart } from './MonthlyChart';

export function ModernDashboardSimple() {
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

  // Lógica de Exportação (Feature PRO)
  const handleExport = () => {
    const headers = ['Data', 'Descricao', 'Categoria', 'Tipo', 'Valor'];
    const rows = transactions.map(t => [
      new Date(t.date).toLocaleDateString('pt-BR'),
      t.description || '',
      t.category?.name || 'Sem categoria',
      t.type === 'income' ? 'Receita' : 'Despesa',
      Number(t.amount).toFixed(2)
    ]);
    
    const csvContent = [
      headers.join(','), 
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `financas_pro_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  // Lógica de Analytics: Gastos por Categoria
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense' && t.category)
    .reduce((acc, t) => {
      const catName = t.category?.name || 'Outros';
      acc[catName] = (acc[catName] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const sortedCategories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const calculateStats = (ts: typeof transactions) => ({
    income: ts.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0),
    expense: ts.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0),
  });

  const stats = {
    totalIncome: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0),
    totalExpense: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0),
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
      'shopping-cart': <ShoppingCart className="w-4 h-4" />,
      'briefcase': <Briefcase className="w-4 h-4" />,
      'laptop': <Laptop className="w-4 h-4" />,
      'trending-up': <TrendingUp className="w-4 h-4" />,
      'gift': <Gift className="w-4 h-4" />
    };
    return icons[iconName] || <Wallet className="w-4 h-4" />;
  };

  const filteredTransactions = transactions.filter(t => 
    (t.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (t.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const recentTransactions = filteredTransactions.slice(0, 10);

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
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'} transition-colors duration-300 pb-20`}>
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
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Dashboard Pro</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`hidden md:flex items-center gap-2 px-3 py-2 ${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-600' : 'border-slate-200'}`}>
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-32 lg:w-48 text-sm ${darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-slate-700 placeholder-slate-400'} border-0 focus:outline-none`}
                />
              </div>

              <PlanButton 
                currentTransactions={transactions.length} 
                currentCategories={categories.length}
                darkMode={darkMode}
              />

              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-white text-slate-600'} rounded-lg border ${darkMode ? 'border-gray-600' : 'border-slate-200'} hover:shadow-md transition-all`}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg transition-all hover:shadow-lg"
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Painel Admin</span>
                </button>
              )}

              <UserAvatar email={user?.email} size="md" />

              <button
                onClick={() => signOut()}
                className={`p-2 ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-red-500/20' : 'bg-white text-slate-600 hover:bg-red-50'} rounded-lg border ${darkMode ? 'border-gray-600' : 'border-slate-200'} transition-all`}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 border ${darkMode ? 'border-gray-700' : 'border-slate-200'} shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500 rounded-xl text-white shadow-lg shadow-green-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'} mb-1`}>R$ {stats.totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Ganhos Totais</p>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 border ${darkMode ? 'border-gray-700' : 'border-slate-200'} shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-500 rounded-xl text-white shadow-lg shadow-red-500/20">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'} mb-1`}>R$ {stats.totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Gastos Totais</p>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 border ${darkMode ? 'border-gray-700' : 'border-slate-200'} shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${stats.balance >= 0 ? 'bg-blue-500 shadow-blue-500/20' : 'bg-red-500 shadow-red-500/20'} rounded-xl text-white shadow-lg`}>
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'} mb-1`}>R$ {stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Saldo Atual</p>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 border ${darkMode ? 'border-gray-700' : 'border-slate-200'} shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500 rounded-xl text-white shadow-lg shadow-purple-500/20">
                <PiggyBank className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-500 px-2 py-1 bg-slate-100 dark:bg-gray-700 rounded-md">
                META 20%
              </div>
            </div>
            <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'} mb-1`}>{stats.savingsRate.toFixed(1)}%</h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Taxa de Poupança</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-1 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">Nova Transação</span>
          </button>
          
          <button
            onClick={handleExport}
            className={`flex items-center gap-2 px-6 py-3 ${darkMode ? 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'} rounded-xl border shadow-sm transition-all transform hover:-translate-y-1 active:scale-95`}
          >
            <Download className="w-5 h-5" />
            <span className="font-semibold">Exportar CSV</span>
          </button>

          <button
            onClick={() => setShowCategories(true)}
            className={`flex items-center gap-2 px-6 py-3 ${darkMode ? 'bg-gray-800 text-white border-gray-700 hover:bg-gray-700' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'} rounded-xl border shadow-sm transition-all transform hover:-translate-y-1 active:scale-95`}
          >
            <FileText className="w-5 h-5" />
            <span className="font-semibold">Categorias</span>
          </button>
        </div>

        {/* Dashboard Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Chart & Top Categories */}
          <div className="lg:col-span-2 space-y-8">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 border ${darkMode ? 'border-gray-700' : 'border-slate-200'} shadow-sm`}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Evolução Mensal</h2>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Histórico de receitas vs despesas</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs text-slate-500">Receitas</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-xs text-slate-500">Despesas</span>
                  </div>
                </div>
              </div>
              <div className="h-64">
                <MonthlyChart transactions={transactions} />
              </div>
            </div>

            {/* Analytics Section - PRO Feature */}
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 border ${darkMode ? 'border-gray-700' : 'border-slate-200'} shadow-sm`}>
              <div className="flex items-center gap-2 mb-6">
                <PieChart className="w-5 h-5 text-purple-600" />
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Maiores Gastos por Categoria</h2>
              </div>
              <div className="space-y-4">
                {sortedCategories.length > 0 ? (
                  sortedCategories.map(([category, value]) => (
                    <div key={category}>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>{category}</span>
                        <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-purple-600 h-2.5 rounded-full transition-all duration-1000" 
                          style={{ width: `${(value / stats.totalExpense) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-4">Nenhum gasto registrado ainda.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Recent Transactions */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl border ${darkMode ? 'border-gray-700' : 'border-slate-200'} shadow-sm overflow-hidden`}>
            <div className="p-6 border-b border-slate-200 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/50">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Transações Recentes</h2>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-slate-600'} mt-1`}>Últimos 10 movimentos</p>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-gray-700">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {getCategoryIcon(transaction.category?.icon || 'wallet')}
                    </div>
                    <div className="min-w-0">
                      <p className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-slate-900'} truncate`}>{transaction.description || transaction.category?.name}</p>
                      <p className={`text-[11px] ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                        {transaction.category?.name} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}R$ {Number(transaction.amount).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              {recentTransactions.length === 0 && (
                <div className="p-12 text-center text-slate-400">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-10" />
                  <p>Nenhuma transação encontrada</p>
                </div>
              )}
            </div>
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
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            loadData();
          }}
          categories={categories}
          currentCount={transactions.length}
        />
      </Modal>

      <Modal
        isOpen={showCategories}
        onClose={() => setShowCategories(false)}
        title="Gerenciar Categorias"
        size="lg"
      >
        <CategoryFormModal
          onClose={() => setShowCategories(false)}
          onSuccess={() => {
            setShowCategories(false);
            loadData();
          }}
          currentCount={categories.length}
        />
      </Modal>
    </div>
  );
}
