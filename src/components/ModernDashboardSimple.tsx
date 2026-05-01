import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useTransactionStats } from '../hooks/useTransactionStats';
import type { TransactionWithCategory } from '../types/database';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank, 
  Moon,
  Sun,
  Plus,
  Shield,
  LogOut
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { PlanButton } from './PlanButton';
import { Modal } from './Modal';
import { TransactionFormModal } from './TransactionFormModal';
import { CategoryFormModal } from './CategoryFormModal';
import { MonthlyChart } from './MonthlyChart';
import { StatCard } from './StatCard';
import { AdvancedFilters } from './AdvancedFilters';
import { TransactionTable } from './TransactionTable';
import { SmartInsights } from './SmartInsights';
import { ExportData } from './ExportData';
import { SkeletonLoader } from './SkeletonLoader';
import { useToast } from '../hooks/useToast';
import { useSubscription } from '../hooks/useSubscription';
import { TransactionService } from '../services/transactionService';

export function ModernDashboardSimple() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserProfile();
  const { isPro, isEnterprise } = useSubscription();
  const navigate = useNavigate();
  const toast = useToast();
  
  // Use novo hook para dados do Supabase
  const { transactions, categories, loading, error, refetch } = useSupabaseData();
  
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithCategory | undefined>();
  const [showCategories, setShowCategories] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Advanced Filters
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth());
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Use novo hook para estatísticas
  const { dateFiltered, finalFiltered, stats } = useTransactionStats(
    transactions,
    filterMonth,
    filterYear,
    filterCategory,
    searchTerm
  );

  const handleEditTransaction = (t: TransactionWithCategory) => {
    setEditingTransaction(t);
    setShowForm(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar esta transação?')) return;
    
    try {
      await TransactionService.deleteTransaction(id);
      toast.success('Sucesso!', 'Transação deletada com sucesso.');
      refetch();
    } catch (err) {
      toast.error('Erro', 'Falha ao deletar transação.');
    }
  };

  const handleResetFilters = () => {
    setFilterMonth(new Date().getMonth());
    setFilterYear(new Date().getFullYear());
    setFilterCategory('all');
    setSearchTerm('');
  };

  const handleTransactionSaved = () => {
    setShowForm(false);
    setEditingTransaction(undefined);
    refetch();
  };

  const handleCategorySaved = () => {
    setShowCategories(false);
    refetch();
  };

  // Stat Cards
  const statCards = [
    {
      title: 'Receitas',
      value: `R$ ${stats.income.toFixed(2)}`,
      change: 12.5,
      icon: <TrendingUp className="w-5 h-5" />,
      bgColor: 'bg-gradient-to-r from-green-500 to-green-600'
    },
    {
      title: 'Despesas',
      value: `R$ ${stats.expense.toFixed(2)}`,
      change: -8.2,
      icon: <TrendingDown className="w-5 h-5" />,
      bgColor: 'bg-gradient-to-r from-red-500 to-red-600'
    },
    {
      title: 'Saldo',
      value: `R$ ${stats.balance.toFixed(2)}`,
      change: stats.balance >= 0 ? 15.3 : -5.7,
      icon: <DollarSign className="w-5 h-5" />,
      bgColor: stats.balance >= 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-red-500 to-red-600'
    },
    {
      title: 'Taxa de Economia',
      value: `${stats.savingsRate.toFixed(1)}%`,
      change: stats.savingsRate >= 20 ? 5.2 : -2.1,
      icon: <PiggyBank className="w-5 h-5" />,
      bgColor: stats.savingsRate >= 20 ? 'bg-gradient-to-r from-purple-500 to-purple-600' : 'bg-gradient-to-r from-orange-500 to-orange-600'
    }
  ];

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-950' : 'bg-slate-100'} transition-all duration-300 pb-20`}>
        <header className={`${darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/90 border-slate-200'} sticky top-0 z-50 border-b backdrop-blur-xl shadow-sm`}>
          <div className="max-w-[1700px] mx-auto px-4 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center">
                <DollarSign className="text-white w-7 h-7" />
              </div>
              <h1 className={`text-xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                FinançasPro
              </h1>
            </div>
          </div>
        </header>
        <main className="max-w-[1700px] mx-auto px-4 lg:px-8 py-8">
          <SkeletonLoader count={4} darkMode={darkMode} type="card" />
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-950' : 'bg-slate-100'} transition-all duration-300 pb-20`}>
      <div className={`fixed top-0 left-0 w-full h-1/2 bg-gradient-to-b ${darkMode ? 'from-indigo-950/20' : 'from-indigo-100/50'} pointer-events-none -z-10`} />

      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/90 border-slate-200'} sticky top-0 z-50 border-b backdrop-blur-xl shadow-sm`}>
        <div className="max-w-[1700px] mx-auto px-4 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30 rotate-3 group-hover:rotate-0 transition-transform">
                <DollarSign className="text-white w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className={`text-xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    FinançasPro
                  </h1>
                  {(isPro || isEnterprise) && (
                    <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-yellow-600 text-[10px] font-bold px-2 py-1 rounded-full text-white">
                      ⭐ {isPro ? 'PRO' : 'ENTERPRISE'}
                    </div>
                  )}
                </div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                  Controle financeiro inteligente
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-white text-slate-600'} rounded-lg border ${darkMode ? 'border-gray-600' : 'border-slate-200'} hover:shadow-md transition-all`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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
      </header>

      {/* Main Content */}
      <main className="max-w-[1700px] mx-auto px-4 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className={`${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border rounded-lg p-4 mb-8 text-red-700`}>
            <p className="font-semibold">Erro ao carregar dados</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              change={stat.change}
              icon={stat.icon}
              bgColor={stat.bgColor}
              darkMode={darkMode}
            />
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
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-xl transition-all hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Nova Categoria
          </button>
          <PlanButton currentTransactions={transactions.length} currentCategories={categories.length} />
        </div>

        {/* Advanced Filters */}
        <div className="mb-8">
          <AdvancedFilters
            filterMonth={filterMonth}
            filterYear={filterYear}
            filterCategory={filterCategory}
            searchTerm={searchTerm}
            categories={categories}
            darkMode={darkMode}
            onFilterMonthChange={setFilterMonth}
            onFilterYearChange={setFilterYear}
            onFilterCategoryChange={setFilterCategory}
            onSearchChange={setSearchTerm}
            onReset={handleResetFilters}
          />
        </div>

        {/* Smart Insights */}
        <div className="mb-8">
          <SmartInsights stats={stats} darkMode={darkMode} />
        </div>

        {/* Export Data */}
        <div className="mb-8">
          <ExportData
            transactions={finalFiltered}
            month={filterMonth}
            year={filterYear}
            darkMode={darkMode}
          />
        </div>

        {/* Charts Section */}
        {dateFiltered.length > 0 && (
          <div className="mb-8">
            <MonthlyChart transactions={dateFiltered} darkMode={darkMode} />
          </div>
        )}

        {/* Transaction Table */}
        <div className="mb-8">
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Transações ({finalFiltered.length})
          </h3>
          <TransactionTable
            transactions={finalFiltered}
            darkMode={darkMode}
            onEdit={handleEditTransaction}
            onDelete={handleDeleteTransaction}
            isLoading={loading}
          />
        </div>
      </main>

      {/* Modals */}
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditingTransaction(undefined); }} title="Transação">
        <TransactionFormModal
          categories={categories}
          editingTransaction={editingTransaction}
          currentCount={transactions.length}
          onSave={handleTransactionSaved}
          onClose={() => { setShowForm(false); setEditingTransaction(undefined); }}
        />
      </Modal>

      <Modal isOpen={showCategories} onClose={() => setShowCategories(false)} title="Categoria">
        <CategoryFormModal
          currentCount={categories.length}
          onSave={handleCategorySaved}
          onClose={() => setShowCategories(false)}
        />
      </Modal>
    </div>
  );
}
