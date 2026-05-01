import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Wallet,
  LayoutDashboard,
  Settings,
  LogOut,
  Moon,
  Sun,
  Shield
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
import { useSubscription } from '../hooks/useSubscription';

export function MobileDashboard() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserProfile();
  const navigate = useNavigate();
  useSubscription();
  
  // Use novo hook para dados do Supabase
  const { transactions, categories, loading, refetch } = useSupabaseData();
  
  const [showForm, setShowForm] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'filters' | 'insights'>('dashboard');

  // Filtros Mobile
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth());
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Use novo hook para estatísticas
  const { finalFiltered, stats } = useTransactionStats(
    transactions,
    filterMonth,
    filterYear,
    filterCategory,
    searchTerm
  );

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-slate-950' : 'bg-slate-50'} p-4`}>
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/2" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950' : 'bg-slate-50'} transition-colors duration-300 pb-24`}>
      {/* Header Mobile */}
      <header className={`sticky top-0 z-40 ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'} border-b backdrop-blur-lg shadow-sm`}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <DollarSign className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className={`text-base font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>FinançasPro</h1>
              <p className={`text-[10px] ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Controle Inteligente</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="p-2 text-purple-600 dark:text-purple-400 rounded-lg transition-all"
              >
                <Shield className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 ${darkMode ? 'text-yellow-400' : 'text-slate-600'} rounded-lg transition-all`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <UserAvatar email={user?.email} size="sm" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Tabs Navigation */}
        <div className="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'}`}
          >
            Geral
          </button>
          <button
            onClick={() => setActiveTab('filters')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'filters' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'}`}
          >
            Filtros
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'insights' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'}`}
          >
            Insights
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Receitas"
                value={`R$ ${stats.income.toFixed(0)}`}
                change={12}
                icon={<TrendingUp className="w-4 h-4" />}
                bgColor="bg-emerald-500"
                darkMode={darkMode}
              />
              <StatCard
                title="Despesas"
                value={`R$ ${stats.expense.toFixed(0)}`}
                change={-5}
                icon={<TrendingDown className="w-4 h-4" />}
                bgColor="bg-rose-500"
                darkMode={darkMode}
              />
              <StatCard
                title="Saldo"
                value={`R$ ${stats.balance.toFixed(0)}`}
                change={8}
                icon={<Wallet className="w-4 h-4" />}
                bgColor={stats.balance >= 0 ? 'bg-blue-500' : 'bg-rose-500'}
                darkMode={darkMode}
              />
              <StatCard
                title="Economia"
                value={`${stats.savingsRate.toFixed(0)}%`}
                change={2}
                icon={<PiggyBank className="w-4 h-4" />}
                bgColor="bg-indigo-500"
                darkMode={darkMode}
              />
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl shadow-lg shadow-indigo-600/30 font-bold text-sm"
              >
                <Plus className="w-5 h-5" />
                Lançar
              </button>
              <button
                onClick={() => setShowCategories(true)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 ${darkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-700'} rounded-2xl border ${darkMode ? 'border-slate-700' : 'border-slate-200'} font-bold text-sm shadow-sm`}
              >
                Categorias
              </button>
            </div>

            {/* Recent Transactions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={`text-sm font-black uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Transações Recentes</h3>
                <span className="text-xs font-bold text-indigo-600">Ver todas</span>
              </div>
              <div className="space-y-3">
                {finalFiltered.slice(0, 5).map((t) => (
                  <div key={t.id} className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} p-4 rounded-2xl border shadow-sm flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {t.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{t.description || t.category?.name}</p>
                        <p className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{t.category?.name} • {new Date(t.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <p className={`text-sm font-black ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type === 'income' ? '+' : '-'} R$ {Number(t.amount).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'filters' && (
          <div className="space-y-6">
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
            <ExportData
              transactions={finalFiltered}
              month={filterMonth}
              year={filterYear}
              darkMode={darkMode}
            />
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            <SmartInsights stats={stats} darkMode={darkMode} />
            <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} p-6 rounded-2xl border shadow-sm`}>
              <h3 className={`text-sm font-black uppercase tracking-wider mb-4 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Resumo do Plano</h3>
              <PlanButton currentTransactions={transactions.length} currentCategories={categories.length} darkMode={darkMode} />
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 z-50 ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'} border-t backdrop-blur-xl px-6 py-3 flex items-center justify-between pb-8`}>
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-bold">Início</span>
        </button>
        <button onClick={() => setActiveTab('filters')} className={`flex flex-col items-center gap-1 ${activeTab === 'filters' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <Settings className="w-6 h-6" />
          <span className="text-[10px] font-bold">Filtros</span>
        </button>
        <button onClick={() => signOut()} className="flex flex-col items-center gap-1 text-slate-400">
          <LogOut className="w-6 h-6" />
          <span className="text-[10px] font-bold">Sair</span>
        </button>
      </nav>

      {/* Modals */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Nova Transação">
        <TransactionFormModal
          categories={categories}
          currentCount={transactions.length}
          onSave={() => { setShowForm(false); refetch(); }}
          onClose={() => setShowForm(false)}
        />
      </Modal>

      <Modal isOpen={showCategories} onClose={() => setShowCategories(false)} title="Nova Categoria">
        <CategoryFormModal
          currentCount={categories.length}
          onSave={() => { setShowCategories(false); refetch(); }}
          onClose={() => setShowCategories(false)}
        />
      </Modal>
    </div>
  );
}
