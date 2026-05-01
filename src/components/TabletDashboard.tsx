import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useTransactionStats } from '../hooks/useTransactionStats';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank, 
  Plus,
  Shield,
  LogOut,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { PlanButton } from './PlanButton';
import { Modal } from './Modal';
import { TransactionFormModal } from './TransactionFormModal';
import { CategoryFormModal } from './CategoryFormModal';
import { StatCard } from './StatCard';
import { SmartInsights } from './SmartInsights';
import { ExportData } from './ExportData';
import { AdvancedFilters } from './AdvancedFilters';
import { TransactionTable } from './TransactionTable';
import { MonthlyChart } from './MonthlyChart';
import { useSubscription } from '../hooks/useSubscription';
import { TransactionService } from '../services/transactionService';
import { useToast } from '../hooks/useToast';

export function TabletDashboard() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserProfile();
  useSubscription();
  
  const { transactions, categories, loading, refetch } = useSupabaseData();
  const toast = useToast();
  
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(undefined);
  const [showCategories, setShowCategories] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Filtros
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth());
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { dateFiltered, finalFiltered, stats } = useTransactionStats(
    transactions,
    filterMonth,
    filterYear,
    filterCategory,
    searchTerm
  );

  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar esta transação?')) return;
    try {
      await TransactionService.deleteTransaction(id);
      toast.success('Sucesso!', 'Transação deletada.');
      refetch();
    } catch (err) {
      toast.error('Erro', 'Falha ao deletar transação.');
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-slate-950' : 'bg-slate-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className={darkMode ? 'text-gray-300' : 'text-slate-600'}>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950' : 'bg-slate-50'} transition-colors duration-300`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'} border-b backdrop-blur-xl shadow-sm`}>
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <DollarSign className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className={`text-xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>FinançasPro</h1>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Tablet Edition</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-white text-slate-600'} rounded-lg border ${darkMode ? 'border-gray-600' : 'border-slate-200'} hover:shadow-md transition-all`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAdmin && (
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg transition-all hover:shadow-lg">
                <Shield className="w-4 h-4" />
                Admin
              </button>
            )}

            <UserAvatar email={user?.email} size="md" />

            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`p-2 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-slate-600'} rounded-lg border ${darkMode ? 'border-gray-600' : 'border-slate-200'}`}
            >
              {showMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMenu && (
          <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} border-t p-4 space-y-2`}>
            <button
              onClick={() => signOut()}
              className={`w-full flex items-center gap-2 px-4 py-2 ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-slate-600 hover:bg-slate-50'} rounded-lg border ${darkMode ? 'border-gray-600' : 'border-slate-200'} transition-all`}
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Grid - 2 columns on tablet */}
        <div className="grid grid-cols-2 gap-6">
          <StatCard
            title="Receitas"
            value={`R$ ${stats.income.toFixed(2)}`}
            change={12.5}
            icon={<TrendingUp className="w-5 h-5" />}
            bgColor="bg-emerald-500"
            darkMode={darkMode}
          />
          <StatCard
            title="Despesas"
            value={`R$ ${stats.expense.toFixed(2)}`}
            change={-8.2}
            icon={<TrendingDown className="w-5 h-5" />}
            bgColor="bg-rose-500"
            darkMode={darkMode}
          />
          <StatCard
            title="Saldo"
            value={`R$ ${stats.balance.toFixed(2)}`}
            change={stats.balance >= 0 ? 15.3 : -5.7}
            icon={<DollarSign className="w-5 h-5" />}
            bgColor={stats.balance >= 0 ? 'bg-blue-500' : 'bg-rose-500'}
            darkMode={darkMode}
          />
          <StatCard
            title="Taxa de Economia"
            value={`${stats.savingsRate.toFixed(1)}%`}
            change={stats.savingsRate >= 20 ? 5.2 : -2.1}
            icon={<PiggyBank className="w-5 h-5" />}
            bgColor={stats.savingsRate >= 20 ? 'bg-indigo-500' : 'bg-orange-500'}
            darkMode={darkMode}
          />
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl transition-all hover:shadow-lg font-bold"
          >
            <Plus className="w-5 h-5" />
            Nova Transação
          </button>
          <button
            onClick={() => setShowCategories(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl transition-all hover:shadow-lg font-bold"
          >
            <Plus className="w-5 h-5" />
            Nova Categoria
          </button>
          <PlanButton currentTransactions={transactions.length} currentCategories={categories.length} />
        </div>

        {/* Filters */}
        <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-6 rounded-2xl border shadow-sm`}>
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
            onReset={() => {
              setFilterMonth(new Date().getMonth());
              setFilterYear(new Date().getFullYear());
              setFilterCategory('all');
              setSearchTerm('');
            }}
          />
        </div>

        {/* Smart Insights */}
        <SmartInsights stats={stats} darkMode={darkMode} />

        {/* Export Data */}
        <ExportData
          transactions={finalFiltered}
          month={filterMonth}
          year={filterYear}
          darkMode={darkMode}
        />

        {/* Charts */}
        {dateFiltered.length > 0 && (
          <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-6 rounded-2xl border shadow-sm`}>
            <MonthlyChart transactions={dateFiltered} darkMode={darkMode} />
          </div>
        )}

        {/* Transactions Table */}
        <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-6 rounded-2xl border shadow-sm`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Transações ({finalFiltered.length})
          </h3>
          <TransactionTable
            transactions={finalFiltered}
            darkMode={darkMode}
            onEdit={(t) => {
              setEditingTransaction(t);
              setShowForm(true);
            }}
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
          onSave={() => { setShowForm(false); setEditingTransaction(undefined); refetch(); }}
          onClose={() => { setShowForm(false); setEditingTransaction(undefined); }}
        />
      </Modal>

      <Modal isOpen={showCategories} onClose={() => setShowCategories(false)} title="Categoria">
        <CategoryFormModal
          currentCount={categories.length}
          onSave={() => { setShowCategories(false); refetch(); }}
          onClose={() => setShowCategories(false)}
        />
      </Modal>
    </div>
  );
}
