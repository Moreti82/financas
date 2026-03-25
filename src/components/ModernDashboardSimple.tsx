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
  PieChart,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { PlanButton } from './PlanButton';
import { Modal } from './Modal';
import { TransactionFormModal } from './TransactionFormModal';
import { CategoryFormModal } from './CategoryFormModal';
import { MonthlyChart } from './MonthlyChart';
import { useToast } from '../hooks/useToast';

export function ModernDashboardSimple() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserProfile();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithCategory | undefined>();
  const [showCategories, setShowCategories] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setDbError(null);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

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
        console.error('Erro Transações:', transactionsResult.error);
        setDbError(`Erro Transações: ${transactionsResult.error.message}`);
      } else {
        setTransactions(transactionsResult.data || []);
      }

      if (categoriesResult.error) {
        console.error('Erro Categorias:', categoriesResult.error);
        setDbError(`Erro Categorias: ${categoriesResult.error.message}`);
      } else {
        setCategories(categoriesResult.data || []);
      }

    } catch (error) {
      console.error('Crash dashboard:', error);
      setDbError('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTransaction = (transaction: TransactionWithCategory) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleExport = () => {
    if (transactions.length === 0) {
      toast.info('Nada para exportar', 'Você ainda não possui transações.');
      return;
    }

    try {
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
      toast.success('Sucesso!', 'Relatório baixado.');
    } catch (err) {
      toast.error('Erro ao exportar', 'Falha ao gerar arquivo.');
    }
  };

  const stats = {
    totalIncome: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0),
    totalExpense: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0),
    balance: 0,
    savingsRate: 0
  };

  stats.balance = stats.totalIncome - stats.totalExpense;
  stats.savingsRate = stats.totalIncome > 0 ? (stats.balance / stats.totalIncome) * 100 : 0;

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
      'gift': <Gift className="w-4 h-4" />,
      'wallet': <Wallet className="w-4 h-4" />,
      'trending-up': <TrendingUp className="w-4 h-4" />
    };
    return icons[iconName] || <Wallet className="w-4 h-4" />;
  };

  const filteredTransactions = transactions.filter(t => 
    (t.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (t.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Exibir todas no PRO ou as últimas 20 para fluidez
  const recentTransactions = filteredTransactions.slice(0, 20);

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-slate-50'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-950' : 'bg-slate-50'} transition-all duration-300 pb-20`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'} sticky top-0 z-50 border-b shadow-sm backdrop-blur-md bg-opacity-80`}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>FinançasPro</h1>
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Painel Premium</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-slate-100 border-transparent'} rounded-lg border`}>
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`bg-transparent text-sm border-0 focus:outline-none ${darkMode ? 'text-white' : 'text-slate-700'}`}
                />
              </div>

              <PlanButton currentTransactions={transactions.length} currentCategories={categories.length} darkMode={darkMode} />

              <div className="h-6 w-[1px] bg-slate-200 dark:bg-gray-700 mx-2" />

              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 transition-transform hover:scale-110 ${darkMode ? 'text-yellow-400' : 'text-slate-600'}`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {isAdmin && (
                <button onClick={() => navigate('/admin')} className="p-2 text-purple-500 hover:scale-110 transition-transform">
                  <Shield className="w-5 h-5" />
                </button>
              )}

              <UserAvatar email={user?.email} size="md" />

              <button onClick={() => signOut()} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
        {dbError && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <p className="text-sm font-medium">{dbError}</p>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setEditingTransaction(undefined); setShowForm(true); }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-1 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span className="font-bold">Nova Transação</span>
            </button>
            <button
              onClick={() => setShowCategories(true)}
              className={`px-6 py-3 border ${darkMode ? 'bg-gray-900 border-gray-800 text-white hover:bg-gray-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'} rounded-xl shadow-sm transition-all transform hover:-translate-y-1 flex items-center gap-2`}
            >
              <FileText className="w-5 h-5 text-slate-400" />
              <span className="font-bold">Categorias</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className={`p-3 ${darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'} rounded-xl transition-all shadow-sm`}
              title="Exportar CSV"
            >
              <Download className="w-5 h-5" />
            </button>
            <button className={`p-3 ${darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'} rounded-xl transition-all shadow-sm`}>
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Grid: Responsive & No Height Caps */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Area: 75% of width */}
          <div className="lg:col-span-3 space-y-8 h-fit">
            
            {/* Stats Cards Dashboard Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {[
                { title: 'Entradas', val: stats.totalIncome, icon: <TrendingUp />, color: 'text-green-500', bg: 'bg-green-500/10' },
                { title: 'Saídas', val: stats.totalExpense, icon: <TrendingDown />, color: 'text-red-500', bg: 'bg-red-500/10' },
                { title: 'Saldo', val: stats.balance, icon: <Wallet />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { title: 'Taxa Poupança', val: `${stats.savingsRate.toFixed(0)}%`, icon: <PiggyBank />, color: 'text-purple-500', bg: 'bg-purple-500/10' }
              ].map((item, idx) => (
                <div key={idx} className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-100'} p-6 rounded-2xl border shadow-sm`}>
                  <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mb-4`}>
                    {item.icon}
                  </div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter mb-1">{item.title}</p>
                  <h3 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    {typeof item.val === 'string' ? item.val : `R$ ${item.val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  </h3>
                </div>
              ))}
            </div>

            {/* Side-by-Side Charts (The most requested change) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-fit">
              {/* Monthly Chart */}
              <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-100'} p-6 rounded-3xl border shadow-sm`}>
                <div className="mb-6">
                  <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Fluxo Mensal</h2>
                  <p className="text-[11px] text-slate-500 uppercase">Receita vs Gastos</p>
                </div>
                <div className="h-[300px]">
                  <MonthlyChart transactions={transactions} darkMode={darkMode} />
                </div>
              </div>

              {/* Analytics: Top Categories */}
              <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-100'} p-6 rounded-3xl border shadow-sm flex flex-col`}>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Divisão de Gastos</h2>
                    <p className="text-[11px] text-slate-500 uppercase">Análise por Categoria</p>
                  </div>
                  <PieChart className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="space-y-4 flex-1">
                  {sortedCategories.length > 0 ? sortedCategories.map(([category, value]) => (
                    <div key={category}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className={`text-xs font-bold ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>{category}</span>
                        <span className={`text-xs font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-full rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${(value / stats.totalExpense) * 100}%` }}
                        />
                      </div>
                    </div>
                  )) : (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-xs text-slate-500 italic">Nenhum gasto registrado.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Area: Recent Transactions (25% or Below on Mobile) */}
          <div className="lg:col-span-1 h-fit">
            <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-100'} rounded-3xl border shadow-sm overflow-hidden flex flex-col h-full`}>
              <div className="p-6 border-b border-slate-50 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Lançamentos</h2>
                  <p className="text-[10px] text-blue-500 font-black uppercase">Exibindo {recentTransactions.length}</p>
                </div>
                <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-lg">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="divide-y divide-slate-50 dark:divide-gray-800 h-full min-h-[400px]">
                {recentTransactions.map((t) => (
                  <div 
                    key={t.id} 
                    className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-gray-800/50 cursor-pointer transition-all group"
                    onClick={() => handleEditTransaction(t)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-110 ${t.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {getCategoryIcon(t.category?.icon || 'wallet')}
                      </div>
                      <div className="min-w-0">
                        <p className={`font-bold text-xs ${darkMode ? 'text-white' : 'text-slate-800'} truncate`}>{t.description || t.category?.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {t.category?.name} • {new Date(t.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-black text-xs ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                        {t.type === 'income' ? '+' : '-'} {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                ))}
                {recentTransactions.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
                    <Search className="w-8 h-8 opacity-20 mb-2" />
                    <p className="text-xs">Vazio</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Modals remain the same but cleaner */}
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditingTransaction(undefined); }} title={editingTransaction ? "Editar" : "Novo"} size="md">
        <TransactionFormModal onClose={() => { setShowForm(false); setEditingTransaction(undefined); }} onSuccess={() => { setShowForm(false); loadData(); }} categories={categories} editingTransaction={editingTransaction} currentCount={transactions.length} />
      </Modal>

      <Modal isOpen={showCategories} onClose={() => setShowCategories(false)} title="Categorias" size="lg">
        <CategoryFormModal onClose={() => setShowCategories(false)} onSuccess={() => { setShowCategories(false); loadData(); }} currentCount={categories.length} />
      </Modal>
    </div>
  );
}
