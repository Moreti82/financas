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
  Moon,
  Sun,
  Download,
  Plus,
  ArrowUpRight,
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
  LogOut,
  FileText,
  PieChart,
  AlertTriangle,
  Star as StarIcon,
  Crown,
  Calendar,
  Filter,
  FileDown,
  BarChart3,
  BarChart
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';
import { PlanButton } from './PlanButton';
import { Modal } from './Modal';
import { TransactionFormModal } from './TransactionFormModal';
import { CategoryFormModal } from './CategoryFormModal';
import { MonthlyChart } from './MonthlyChart';
import { useToast } from '../hooks/useToast';
import { useSubscription } from '../hooks/useSubscription';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export function ModernDashboardSimple() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserProfile();
  const { isPro, isEnterprise } = useSubscription();
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

  // Advanced Filters
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth());
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analyticsType, setAnalyticsType] = useState<'month' | 'category'>('month');

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

      if (transactionsResult.error) setDbError(transactionsResult.error.message);
      else setTransactions(transactionsResult.data || []);

      if (categoriesResult.error) setDbError(categoriesResult.error.message);
      else setCategories(categoriesResult.data || []);
    } catch (e) {
      setDbError('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTransaction = (t: TransactionWithCategory) => {
    setEditingTransaction(t);
    setShowForm(true);
  };

  const handleExportPDF = () => {
    if (finalFiltered.length === 0) {
      toast.info('Vazio', 'Sem dados no filtro para gerar PDF.');
      return;
    }

    try {
      const doc = new jsPDF();
      const themeColor: [number, number, number] = [79, 70, 229];
      
      // Header
      doc.setFillColor(themeColor[0], themeColor[1], themeColor[2]);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('FinançasPro - Relatório', 15, 25);
      
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 155, 30);

      // Info
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(14);
      const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
      doc.text(`Período: ${monthNames[filterMonth]} / ${filterYear}`, 15, 55);
      doc.text(`Usuário: ${user?.email || 'N/A'}`, 15, 62);

      // Totals in boxes
      doc.setDrawColor(230, 230, 230);
      doc.line(15, 70, 195, 70);

      const income = finalFiltered.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
      const expense = finalFiltered.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
      
      doc.setFontSize(12);
      doc.text(`Total Receitas: R$ ${income.toLocaleString('pt-BR')}`, 15, 80);
      doc.setTextColor(200, 0, 0);
      doc.text(`Total Despesas: R$ ${expense.toLocaleString('pt-BR')}`, 100, 80);
      doc.setTextColor(themeColor[0], themeColor[1], themeColor[2]);
      doc.text(`Saldo: R$ ${(income - expense).toLocaleString('pt-BR')}`, 15, 88);

      // Table
      const tableData = finalFiltered.map(t => [
        new Date(t.date).toLocaleDateString('pt-BR'),
        t.description || t.category?.name || 'S/D',
        t.category?.name || 'S/C',
        t.type === 'income' ? 'Entrada' : 'Saída',
        `R$ ${Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      ]);

      autoTable(doc, {
        startY: 100,
        head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: themeColor, fontSize: 11, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        alternateRowStyles: { fillColor: [245, 247, 250] }
      });

      doc.save(`relatorio_financas_${monthNames[filterMonth].toLowerCase()}_${filterYear}.pdf`);
      toast.success('Sucesso!', 'Relatório PDF gerado e baixado.');
    } catch (err) {
      console.error(err);
      toast.error('Erro', 'Falha ao gerar PDF.');
    }
  };

  const handleExportCSV = () => {
    if (finalFiltered.length === 0) return;
    const headers = ['Data', 'Descricao', 'Categoria', 'Tipo', 'Valor'];
    const rows = finalFiltered.map(t => [
      new Date(t.date).toLocaleDateString('pt-BR'),
      t.description || '',
      t.category?.name || 'Sem categoria',
      t.type === 'income' ? 'Receita' : 'Despesa',
      Number(t.amount).toFixed(2)
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `financas_pro_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Pronto!', 'Exportação CSV realizada.');
  };

  // 1. First Pass: Date Filter (used for MonthlyChart and Base stats)
  const dateFiltered = transactions.filter(t => {
    const d = new Date(t.date + 'T00:00:00');
    return d.getMonth() === filterMonth && d.getFullYear() === filterYear;
  });

  // 2. Second Pass: Search & Category Filter
  const finalFiltered = dateFiltered.filter(t => {
    const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.category?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || t.category_id === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    income: finalFiltered.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0),
    expense: finalFiltered.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0),
    balance: 0, 
    rate: 0
  };
  stats.balance = stats.income - stats.expense;
  stats.rate = stats.income > 0 ? (stats.balance / stats.income) * 100 : 0;

  const expensesByCategory = finalFiltered
    .filter(t => t.type === 'expense' && t.category)
    .reduce((acc, t) => {
      acc[t.category!.name] = (acc[t.category!.name] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

  const sortedCategories = Object.entries(expensesByCategory).sort(([, a], [, b]) => b - a).slice(0, 5);

  const getCategoryIcon = (iconName: string) => {
    const icons: any = { home: Home, car: Car, heart: Heart, utensils: Utensils, briefcase: Briefcase, laptop: Laptop, gift: Gift, wallet: Wallet, 'gamepad-2': Gamepad2 };
    const Icon = icons[iconName] || Wallet;
    return <Icon className="w-4 h-4" />;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-900"><div className="animate-spin h-8 w-8 border-b-2 border-white rounded-full" /></div>;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-950' : 'bg-slate-100'} transition-all duration-300 pb-20`}>
      <div className={`fixed top-0 left-0 w-full h-1/2 bg-gradient-to-b ${darkMode ? 'from-indigo-950/20' : 'from-indigo-100/50'} pointer-events-none -z-10`} />

      <header className={`${darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/90 border-slate-200'} sticky top-0 z-50 border-b backdrop-blur-xl shadow-sm`}>
        <div className="max-w-[1700px] mx-auto px-4 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/30 rotate-3 group-hover:rotate-0 transition-transform"><DollarSign className="text-white w-7 h-7" /></div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className={`text-xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>FinançasPro</h1>
                  {(isPro || isEnterprise) && (
                    <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-yellow-600 text-[10px] font-black text-white px-2 py-0.5 rounded-full shadow-md animate-pulse">
                      <Crown className="w-3 h-3" /> PRO
                    </div>
                  )}
                </div>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Inteligência Financeira</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-slate-200/50 border-slate-300/30'} rounded-xl border`}>
              <Search className="w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Pesquisar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`bg-transparent text-sm border-0 focus:outline-none ${darkMode ? 'text-white' : 'text-slate-700'}`} />
            </div>
            <PlanButton currentTransactions={transactions.length} currentCategories={categories.length} darkMode={darkMode} />
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-xl border transition-all hover:scale-110 ${darkMode ? 'bg-gray-800 border-gray-700 text-yellow-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'}`} title="Alternar Tema">{darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
            
            {isAdmin && (
              <button 
                onClick={() => navigate('/admin')} 
                className="p-2 rounded-xl border border-transparent hover:bg-purple-500/10 text-purple-500 transition-all hover:scale-110"
                title="Painel Admin"
              >
                <Shield className="w-5 h-5" />
              </button>
            )}

            <div className="h-6 w-[1px] bg-slate-200 dark:bg-gray-700 mx-1" />
            <div className="flex items-center gap-3 pl-2">
              <UserAvatar email={user?.email} size="md" />
              <button onClick={() => signOut()} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Sair"><LogOut className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1700px] mx-auto px-4 lg:px-8 py-10">
        {dbError && <div className="mb-8 p-4 bg-red-600 text-white rounded-2xl flex items-center gap-3 shadow-xl"><AlertTriangle /> {dbError}</div>}

        {/* Action & Filter Bar */}
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <div className="flex flex-wrap gap-4">
            <button onClick={() => { setEditingTransaction(undefined); setShowForm(true); }} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 hover:shadow-indigo-600/40 transition-all font-bold flex items-center gap-2 transform active:scale-95"><Plus /> Novo Lançamento</button>
            <button onClick={() => setShowCategories(true)} className={`px-6 py-4 rounded-2xl border ${darkMode ? 'bg-gray-900 border-gray-800 text-white hover:bg-gray-800' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'} shadow-sm transition-all font-bold flex items-center gap-2`}><FileText className="text-slate-400" /> Categorias</button>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => {
                  if (isPro || isEnterprise) handleExportCSV();
                  else toast.info('Recurso Pro', 'Faça upgrade para exportar em CSV.');
                }} 
                className={`p-4 rounded-2xl border transition-all ${isPro || isEnterprise ? (darkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-slate-200 text-slate-700') : 'opacity-50 grayscale cursor-not-allowed'}`} 
                title={isPro || isEnterprise ? "Exportar CSV" : "Disponível no Plano Pro"}
              >
                <Download className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  if (isPro || isEnterprise) handleExportPDF();
                  else toast.info('Recurso Pro', 'Relatórios PDF são exclusivos para assinantes.');
                }} 
                className={`p-4 rounded-2xl border transition-all flex items-center gap-2 font-black text-xs uppercase ${isPro || isEnterprise ? (darkMode ? 'bg-gray-900 border-indigo-500/30 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600') : 'opacity-50 grayscale cursor-not-allowed'}`} 
                title={isPro || isEnterprise ? "Gerar Relatório PDF" : "Disponível no Plano Pro"}
              >
                <FileDown className="w-5 h-5" /> PDF
              </button>
            </div>
          </div>

          {/* New Advanced Filters Section */}
          <div className={`p-5 rounded-3xl border flex flex-wrap items-center gap-6 ${darkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white/80 border-slate-200'} backdrop-blur-md shadow-xl`}>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <select 
                value={filterMonth} 
                onChange={(e) => setFilterMonth(Number(e.target.value))}
                className={`text-sm font-bold border-0 focus:ring-0 focus:outline-none rounded-lg p-1 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-slate-700'}`}
              >
                {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"].map((m, i) => (
                  <option key={i} value={i} className={darkMode ? 'bg-gray-800 text-white' : 'bg-white text-slate-700'}>{m}</option>
                ))}
              </select>
              <select 
                value={filterYear} 
                onChange={(e) => setFilterYear(Number(e.target.value))}
                className={`text-sm font-bold border-0 focus:ring-0 focus:outline-none rounded-lg p-1 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-slate-700'}`}
              >
                {[2024, 2025, 2026].map(y => (
                  <option key={y} value={y} className={darkMode ? 'bg-gray-800 text-white' : 'bg-white text-slate-700'}>{y}</option>
                ))}
              </select>
              <button 
                onClick={() => { setAnalyticsType('month'); setShowAnalyticsModal(true); }}
                className="p-1.5 hover:bg-indigo-500/10 text-indigo-500 rounded-lg transition-all"
                title="Ver Gráfico Mensal"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
            <div className="h-6 w-[1px] bg-slate-200 dark:bg-gray-800 md:block hidden" />
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-indigo-500" />
              <select 
                value={filterCategory} 
                onChange={(e) => setFilterCategory(e.target.value)}
                className={`text-sm font-bold border-0 focus:ring-0 focus:outline-none rounded-lg p-1 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-slate-700'}`}
              >
                <option value="all" className={darkMode ? 'bg-gray-800 text-white' : 'bg-white text-slate-700'}>Todas Categorias</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id} className={darkMode ? 'bg-gray-800 text-white' : 'bg-white text-slate-700'}>{c.name}</option>
                ))}
              </select>
              <button 
                onClick={() => { setAnalyticsType('category'); setShowAnalyticsModal(true); }}
                className="p-1.5 hover:bg-emerald-500/10 text-emerald-500 rounded-lg transition-all"
                title="Ver Gráfico por Categoria"
              >
                <BarChart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-3 space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
              {[
                { l: `Entradas`, v: stats.income, c: 'text-emerald-500', i: <TrendingUp />, g: 'from-emerald-500/20' },
                { l: `Saídas`, v: stats.expense, c: 'text-rose-500', i: <TrendingDown />, g: 'from-rose-500/20' },
                { l: 'Saldo Filtro', v: stats.balance, c: 'text-indigo-500', i: <Wallet />, g: 'from-indigo-500/20' },
                { l: 'Taxa Reserva', v: `${stats.rate.toFixed(1)}%`, i: <PiggyBank />, c: 'text-amber-500', g: 'from-amber-500/20' }
              ].map((s, idx) => (
                <div key={idx} className={`${darkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white/80 border-white'} p-7 rounded-[32px] border shadow-xl backdrop-blur-sm relative overflow-hidden group hover:-translate-y-1 transition-all`}>
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${s.g} to-transparent opacity-30 -mr-16 -mt-16 rounded-full transition-transform group-hover:scale-125`} />
                  <div className={`w-12 h-12 ${s.c} bg-current bg-opacity-10 rounded-2xl flex items-center justify-center mb-6 shadow-inner`}>{s.i}</div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.l}</p>
                  <h3 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{typeof s.v === 'string' ? s.v : `R$ ${s.v.toLocaleString('pt-BR')}`}</h3>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 h-fit">
              <MonthlyChart transactions={transactions} darkMode={darkMode} selectedMonth={filterMonth} selectedYear={filterYear} />
              <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white/80 border-slate-100'} p-8 rounded-[32px] border shadow-xl flex flex-col backdrop-blur-sm`}>
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className={`text-lg font-black ${darkMode ? 'text-white' : 'text-slate-900 underline decoration-indigo-200 underline-offset-4'}`}>Top Gastos</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Ranking Filtrado</p>
                  </div>
                  <PieChart className="text-indigo-500 w-6 h-6" />
                </div>
                <div className="space-y-6 flex-1 flex flex-col justify-center">
                  {sortedCategories.map(([n, v]) => (
                    <div key={n} className="group">
                      <div className="flex justify-between text-xs font-black mb-2 px-1"><span className={darkMode ? 'text-gray-400' : 'text-slate-600'}>{n}</span><span className={darkMode ? 'text-white' : 'text-slate-900'}>R$ {v.toLocaleString('pt-BR')}</span></div>
                      <div className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-slate-100'} h-3 rounded-full overflow-hidden shadow-inner`}>
                        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full shadow-lg group-hover:brightness-110 transition-all" style={{ width: `${(v / (stats.expense || 1)) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                  {sortedCategories.length === 0 && <p className="text-center text-xs text-slate-400 italic">Nenhum gasto neste filtro.</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className={`${darkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white/80 border-white'} rounded-[40px] border shadow-2xl overflow-hidden flex flex-col h-full backdrop-blur-sm`}>
              <div className="p-8 border-b border-slate-100 dark:border-gray-800 flex items-center justify-between">
                <div>
                  <h2 className={`text-lg font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>Extrato</h2>
                  <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">Registros Filtrados ({finalFiltered.length})</p>
                </div>
                <div className="w-10 h-10 bg-slate-100 dark:bg-gray-800 rounded-full flex items-center justify-center"><ArrowUpRight className="text-indigo-500 w-5 h-5" /></div>
              </div>
              <div className="divide-y divide-slate-100/50 dark:divide-gray-800 h-full">
                {finalFiltered.slice(0, 50).map(t => (
                  <div key={t.id} className="p-5 flex items-center justify-between hover:bg-slate-100/30 dark:hover:bg-gray-800/30 cursor-pointer transition-all group" onClick={() => handleEditTransaction(t)}>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 shadow-sm ${t.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{getCategoryIcon(t.category?.icon || '')}</div>
                      <div className="min-w-0">
                        <p className={`font-bold text-sm ${darkMode ? 'text-white' : 'text-slate-800'} truncate`}>{t.description || t.category?.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{new Date(t.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <p className={`font-black text-xs ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>{Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setEditingTransaction(undefined); }} title={editingTransaction ? "Editar" : "Novo"} size="md">
        <TransactionFormModal onClose={() => { setShowForm(false); setEditingTransaction(undefined); }} onSuccess={() => { setShowForm(false); loadData(); }} categories={categories} editingTransaction={editingTransaction} currentCount={transactions.length} />
      </Modal>

      <Modal isOpen={showCategories} onClose={() => setShowCategories(false)} title="Gerenciar Categorias" size="lg">
        <CategoryFormModal onClose={() => setShowCategories(false)} onSuccess={() => { setShowCategories(false); loadData(); }} currentCount={categories.length} />
      </Modal>

      <Modal 
        isOpen={showAnalyticsModal} 
        onClose={() => setShowAnalyticsModal(false)} 
        title={analyticsType === 'month' ? "Análise do Período" : "Análise por Categoria"} 
        size={analyticsType === 'month' ? "lg" : "md"}
      >
        <div className="py-6 space-y-8">
          {analyticsType === 'month' ? (() => {
            const mIncome = dateFiltered.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
            const mExpense = dateFiltered.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
            const maxVal = Math.max(mIncome, mExpense, 1);
            
            return (
              <div className="space-y-10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                    <p className="text-[10px] uppercase font-black text-emerald-600 mb-1">Total Entradas</p>
                    <p className="text-2xl font-black text-emerald-700">R$ {mIncome.toLocaleString()}</p>
                  </div>
                  <div className="p-5 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                    <p className="text-[10px] uppercase font-black text-rose-600 mb-1">Total Saídas</p>
                    <p className="text-2xl font-black text-rose-700">R$ {mExpense.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">Comparativo Mensal</h3>
                  <div className="flex items-end gap-10 h-64 border-b border-slate-200 pb-2 px-10">
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-emerald-500 rounded-t-xl transition-all duration-1000 shadow-lg shadow-emerald-500/20" style={{ height: `${(mIncome / maxVal) * 100}%` }} />
                      <span className="text-[10px] font-black text-emerald-600">Entradas</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-rose-500 rounded-t-xl transition-all duration-1000 shadow-lg shadow-rose-500/20" style={{ height: `${(mExpense / maxVal) * 100}%` }} />
                      <span className="text-[10px] font-black text-rose-600">Saídas</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })() : (
            <div className="space-y-6">
               <div className="p-6 bg-indigo-50 dark:bg-gray-800 rounded-3xl border border-indigo-100 dark:border-gray-700 text-center">
                  <p className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-2">Gasto nesta Categoria</p>
                  <p className={`text-4xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>R$ {stats.expense.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-2 lowercase italic">
                    {filterCategory === 'all' ? 'selecione uma categoria para análise detalhada' : `representa ${stats.rate.toFixed(1)}% das receitas do mês`}
                  </p>
               </div>
               
               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black text-slate-500 uppercase">Impacto no Patrimônio</h3>
                    <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-black text-xs shadow-lg">{stats.rate.toFixed(0)}%</div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-gray-800 h-6 rounded-full overflow-hidden p-1 shadow-inner">
                    <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(stats.rate, 100)}%` }} />
                  </div>
               </div>
            </div>
          )}
          
          <div className="pt-6 border-t border-slate-100 dark:border-gray-800 flex justify-end">
            <button 
              onClick={() => setShowAnalyticsModal(false)}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
            >
              Fechar Análise
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
