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
        setDbError(`Erro Transações: ${transactionsResult.error.message}`);
      } else {
        setTransactions(transactionsResult.data || []);
      }

      if (categoriesResult.error) {
        setDbError(`Erro Categorias: ${categoriesResult.error.message}`);
      } else {
        setCategories(categoriesResult.data || []);
      }

    } catch (error) {
      setDbError('Erro crítico ao carregar dados.');
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
      toast.info('Vazio', 'Sem dados para exportar.');
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
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `financas_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      toast.success('Pronto!', 'Exportação concluída.');
    } catch {
      toast.error('Erro', 'Falha ao exportar.');
    }
  };

  const stats = {
    income: transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0),
    expense: transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
    balance: 0,
    rate: 0
  };

  stats.balance = stats.income - stats.expense;
  stats.rate = stats.income > 0 ? (stats.balance / stats.income) * 100 : 0;

  const expensesByCategory = transactions
    .filter(t => t.type === 'expense' && t.category)
    .reduce((acc, t) => {
      acc[t.category!.name] = (acc[t.category!.name] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const sortedCategories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const getCategoryIcon = (icon: string) => {
    const icons: any = { home: Home, car: Car, heart: Heart, utensils: Utensils, briefcase: Briefcase, laptop: Laptop, gift: Gift, wallet: Wallet };
    const Icon = icons[icon] || Wallet;
    return <Icon className="w-4 h-4" />;
  };

  const filtered = transactions.filter(t => 
    t.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full" /></div>;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-950' : 'bg-slate-50'} transition-colors duration-300 pb-20`}>
      <header className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'} sticky top-0 z-50 border-b shadow-sm`}>
        <div className="max-w-[1700px] mx-auto px-4 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20"><DollarSign className="text-white" /></div>
            <div>
              <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>FinançasPro</h1>
              <p className="text-[10px] text-blue-500 font-black uppercase">Modo Pro Ativo</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <PlanButton currentTransactions={transactions.length} currentCategories={categories.length} darkMode={darkMode} />
            <button onClick={() => setDarkMode(!darkMode)} className={darkMode ? 'text-yellow-400' : 'text-slate-600'}><Moon className="w-5 h-5" /></button>
            {isAdmin && <Shield className="w-5 h-5 text-purple-500 cursor-pointer" onClick={() => navigate('/admin')} />}
            <UserAvatar email={user?.email} size="md" />
            <button onClick={() => signOut()} className="text-slate-400 hover:text-red-500"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </header>

      <main className="max-w-[1700px] mx-auto px-4 lg:px-8 py-8">
        {dbError && <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl">{dbError}</div>}

        <div className="flex gap-4 mb-8">
          <button onClick={() => { setEditingTransaction(undefined); setShowForm(true); }} className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"><Plus className="w-5 h-5" /><span className="font-bold">Novo Lançamento</span></button>
          <button onClick={() => setShowCategories(true)} className={`px-6 py-3 rounded-xl border ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-slate-700'} flex items-center gap-2`}><FileText className="w-5 h-5 text-slate-400" /><span className="font-bold">Categorias</span></button>
          <button onClick={handleExport} className={`p-3 rounded-xl border ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-slate-700'}`}><Download className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {[
                { l: 'Entradas', v: stats.income, c: 'text-green-500', i: <TrendingUp /> },
                { l: 'Saídas', v: stats.expense, c: 'text-red-500', i: <TrendingDown /> },
                { l: 'Saldo', v: stats.balance, c: 'text-blue-500', i: <Wallet /> },
                { l: 'Reserva', v: `${stats.rate.toFixed(1)}%`, i: <PiggyBank />, c: 'text-purple-500' }
              ].map((s, idx) => (
                <div key={idx} className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-100'} p-6 rounded-2xl border`}>
                  <div className={`w-10 h-10 ${s.c} bg-current bg-opacity-10 rounded-xl flex items-center justify-center mb-3`}>{s.i}</div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">{s.l}</p>
                  <h3 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{typeof s.v === 'string' ? s.v : `R$ ${s.v.toLocaleString('pt-BR')}`}</h3>
                </div>
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <MonthlyChart transactions={transactions} darkMode={darkMode} />
              
              <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-100'} p-6 rounded-2xl border flex flex-col`}>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Maiores Despesas</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Ranking por Categoria</p>
                  </div>
                  <PieChart className="text-indigo-500" />
                </div>
                <div className="space-y-5 flex-1 justify-center flex flex-col">
                  {sortedCategories.map(([n, v]) => (
                    <div key={n}>
                      <div className="flex justify-between text-xs font-bold mb-1"><span className={darkMode ? 'text-gray-400' : 'text-slate-600'}>{n}</span><span className={darkMode ? 'text-white' : 'text-slate-900'}>R$ {v.toLocaleString()}</span></div>
                      <div className="w-full bg-slate-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(v / stats.expense) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                  {sortedCategories.length === 0 && <p className="text-center text-xs text-slate-500 mt-4">Nenhuma despesa registrada.</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-100'} rounded-3xl border shadow-sm overflow-hidden flex flex-col h-full`}>
              <div className="p-6 border-b border-slate-50 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Extrato</h2>
                  <p className="text-[10px] text-blue-500 font-bold uppercase">Últimos Lançamentos</p>
                </div>
                <ArrowUpRight className="text-blue-500" />
              </div>
              <div className="divide-y divide-slate-50 dark:divide-gray-800">
                {filtered.slice(0, 15).map(t => (
                  <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-gray-800/50 cursor-pointer transition-all" onClick={() => handleEditTransaction(t)}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${t.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{getCategoryIcon(t.category?.icon || '')}</div>
                      <div className="min-w-0">
                        <p className={`font-bold text-xs ${darkMode ? 'text-white' : 'text-slate-800'} truncate`}>{t.description || t.category?.name}</p>
                        <p className="text-[10px] text-slate-400">{new Date(t.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <p className={`font-black text-xs ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>{Number(t.amount).toLocaleString('pt-BR')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditingTransaction(undefined); }} title="Transação" size="md">
        <TransactionFormModal onClose={() => { setShowForm(false); setEditingTransaction(undefined); }} onSuccess={() => { setShowForm(false); loadData(); }} categories={categories} editingTransaction={editingTransaction} currentCount={transactions.length} />
      </Modal>

      <Modal isOpen={showCategories} onClose={() => setShowCategories(false)} title="Categorias" size="lg">
        <CategoryFormModal onClose={() => setShowCategories(false)} onSuccess={() => { setShowCategories(false); loadData(); }} currentCount={categories.length} />
      </Modal>
    </div>
  );
}
