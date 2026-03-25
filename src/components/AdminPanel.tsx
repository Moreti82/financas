import { useState, useEffect, useCallback } from 'react';
import { Users, Settings, Crown, Shield, Star, Trash2, ArrowLeft, Home, Moon, Sun, AlertTriangle, Calendar, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
import { useNavigate } from 'react-router-dom';
import type { PlanType, SubscriptionStatus } from '../types/database';

interface AdminSubscriptionView {
  user_id: string;
  email?: string;
  plan: PlanType;
  status: SubscriptionStatus;
  created_at: string;
  plan_expires_at?: string | null;
  cancelled_at?: string | null;
}

export function AdminPanel() {
  const [allSubscriptions, setAllSubscriptions] = useState<AdminSubscriptionView[]>([]);
  const [displayedSubscriptions, setDisplayedSubscriptions] = useState<AdminSubscriptionView[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [filter, setFilter] = useState<{ plan?: PlanType; status?: SubscriptionStatus }>({});
  const toast = useToast();
  const navigate = useNavigate();

  // Auto-downgrade logic: if plan is expired and still paid, reset to free
  const checkAndDowngradeExpired = useCallback(async (profiles: any[]) => {
    const now = new Date();
    const toDowngrade = profiles.filter(p => {
      if (p.plan === 'free') return false;
      if (!p.plan_expires_at) return false;
      return new Date(p.plan_expires_at) < now;
    });

    for (const p of toDowngrade) {
      await supabase
        .from('user_profiles')
        .update({ plan: 'free' })
        .eq('user_id', p.user_id);
      p.plan = 'free'; // update local state too
    }

    if (toDowngrade.length > 0) {
      toast.info('Auto-Downgrade', `${toDowngrade.length} usuário(s) revertido(s) para Free por vencimento.`);
    }
  }, [toast]);

  const loadRealData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: profiles, error: profileErr } = await supabase
        .from('user_profiles')
        .select('*');

      if (profileErr) {
        toast.error('Erro ao buscar do Supabase', profileErr.message);
        return;
      }

      if (profiles) {
        await checkAndDowngradeExpired(profiles);

        const formattedData: AdminSubscriptionView[] = profiles.map((p: any) => ({
          user_id: p.user_id,
          email: p.email,
          plan: (p.plan as PlanType) || 'free',
          status: (p.status as SubscriptionStatus) || 'active',
          created_at: p.created_at || new Date().toISOString(),
          plan_expires_at: p.plan_expires_at || null,
          cancelled_at: p.cancelled_at || null,
        }));
        setAllSubscriptions(formattedData);
        setDisplayedSubscriptions(formattedData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [checkAndDowngradeExpired, toast]);

  useEffect(() => { loadRealData(); }, [loadRealData]);

  useEffect(() => {
    let filtered = allSubscriptions;
    if (filter.plan) filtered = filtered.filter(s => s.plan === filter.plan);
    if (filter.status) filtered = filtered.filter(s => s.status === filter.status);
    setDisplayedSubscriptions(filtered);
  }, [allSubscriptions, filter]);

  const handleApplyAction = async (userId: string, action: 'delete' | 'update_plan' | 'update_status', value?: any) => {
    if (action === 'delete') {
      if (!confirm('Excluir permanentemente este perfil do banco de dados?')) return;
      const { error } = await supabase.from('user_profiles').delete().eq('user_id', userId);
      if (!error) {
        setAllSubscriptions(prev => prev.filter(s => s.user_id !== userId));
        toast.success('Excluído!', 'Perfil removido com sucesso.');
      } else {
        toast.error('Erro ao excluir', error.message);
      }
    } else if (action === 'update_plan') {
      // When setting to free via admin, also record cancelled_at
      const updates: any = { plan: value as PlanType };
      if (value === 'free') {
        updates.cancelled_at = new Date().toISOString();
        updates.status = 'cancelled';
      } else {
        // Set a 30-day expiry for paid plans
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + 30);
        updates.plan_expires_at = expiry.toISOString();
        updates.status = 'active';
        updates.cancelled_at = null;
      }
      const { error } = await supabase.from('user_profiles').update(updates).eq('user_id', userId);
      if (!error) {
        setAllSubscriptions(prev => prev.map(s => s.user_id === userId ? { ...s, ...updates } : s));
        toast.success('Plano atualizado!', `Plano definido como ${value.toUpperCase()}.`);
      } else {
        toast.error('Erro ao atualizar plano', error.message);
      }
    } else if (action === 'update_status') {
      const updates: any = { status: value };
      if (value === 'cancelled') {
        updates.cancelled_at = new Date().toISOString();
        updates.plan = 'free'; // immediate downgrade on cancel
      }
      const { error } = await supabase.from('user_profiles').update(updates).eq('user_id', userId);
      if (!error) {
        setAllSubscriptions(prev => prev.map(s => s.user_id === userId ? { ...s, ...updates } : s));
        toast.success('Status atualizado!', value === 'cancelled' ? 'Usuário cancelado e revertido para Free.' : 'Status atualizado.');
      } else {
        toast.error('Erro', error.message);
      }
    }
  };

  const isExpiringSoon = (expiresAt?: string | null) => {
    if (!expiresAt) return false;
    const exp = new Date(expiresAt);
    const now = new Date();
    const diff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  };

  const isExpired = (expiresAt?: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getPlanIcon = (plan: PlanType) => {
    switch (plan) {
      case 'free': return <Shield className="w-4 h-4 text-gray-400" />;
      case 'pro': return <Crown className="w-4 h-4 text-blue-500" />;
      case 'enterprise': return <Star className="w-4 h-4 text-purple-500" />;
    }
  };

  const getPlanColor = (plan: PlanType) => {
    switch (plan) {
      case 'free': return darkMode ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-gray-100 text-gray-700 border-gray-200';
      case 'pro': return darkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-blue-100 text-blue-700 border-blue-200';
      case 'enterprise': return darkMode ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : 'bg-purple-100 text-purple-700 border-purple-200';
    }
  };

  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case 'active': return darkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return darkMode ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-red-100 text-red-700 border-red-200';
      case 'expired': return darkMode ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const stats = {
    total: allSubscriptions.length,
    free: allSubscriptions.filter(s => s.plan === 'free').length,
    pro: allSubscriptions.filter(s => s.plan === 'pro').length,
    enterprise: allSubscriptions.filter(s => s.plan === 'enterprise').length,
    expiringSoon: allSubscriptions.filter(s => isExpiringSoon(s.plan_expires_at)).length,
  };

  const dm = darkMode;

  if (loading) return (
    <div className={`min-h-screen ${dm ? 'bg-gray-950' : 'bg-slate-50'} flex items-center justify-center`}>
      <div className="animate-spin h-10 w-10 border-b-2 border-indigo-500 rounded-full" />
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dm ? 'bg-gray-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b ${dm ? 'bg-gray-900/80 border-gray-800' : 'bg-white/90 border-slate-200 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm transition-all hover:scale-105 active:scale-95 ${dm ? 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white' : 'bg-white border-slate-200 text-slate-600 shadow-sm hover:text-slate-900'}`}
          >
            <ArrowLeft className="w-4 h-4" />
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <div className="flex items-center gap-3">
            <Settings className={`w-5 h-5 ${dm ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <h1 className="text-lg font-black tracking-tight">Painel Administrativo</h1>
          </div>

          <button
            onClick={() => setDarkMode(!dm)}
            className={`p-3 rounded-xl border transition-all ${dm ? 'bg-gray-800 border-gray-700 text-yellow-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'}`}
          >
            {dm ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-10 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total de Usuários', value: stats.total, icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
            { label: 'Plano Free', value: stats.free, icon: Shield, color: 'text-gray-400', bg: 'bg-gray-500/10' },
            { label: 'Plano Pro', value: stats.pro, icon: Crown, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            { label: 'Enterprise', value: stats.enterprise, icon: Star, color: 'text-purple-400', bg: 'bg-purple-500/10' },
            { label: 'Vencendo em 7d', value: stats.expiringSoon, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          ].map((s, i) => (
            <div key={i} className={`p-5 rounded-2xl border ${dm ? 'bg-gray-900/60 border-gray-800' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className={`text-xs font-bold uppercase tracking-widest ${dm ? 'text-gray-500' : 'text-slate-400'}`}>{s.label}</p>
              <p className={`text-3xl font-black mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className={`p-5 rounded-2xl border flex flex-wrap gap-4 items-center ${dm ? 'bg-gray-900/60 border-gray-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <select
            value={filter.plan || ''}
            onChange={(e) => setFilter({ ...filter, plan: e.target.value as PlanType || undefined })}
            className={`px-4 py-2 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${dm ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-slate-300 text-slate-700'}`}
          >
            <option value="">Todos os Planos</option>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <select
            value={filter.status || ''}
            onChange={(e) => setFilter({ ...filter, status: e.target.value as SubscriptionStatus || undefined })}
            className={`px-4 py-2 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${dm ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-slate-300 text-slate-700'}`}
          >
            <option value="">Todos os Status</option>
            <option value="active">Ativo</option>
            <option value="cancelled">Cancelado</option>
            <option value="expired">Expirado</option>
          </select>
          <button
            onClick={() => setFilter({})}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${dm ? 'bg-gray-800 border border-gray-700 text-white hover:bg-gray-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            Limpar Filtros
          </button>
          <button
            onClick={loadRealData}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all ml-auto"
          >
            Atualizar Dados
          </button>
        </div>

        {/* Table */}
        <div className={`rounded-2xl border overflow-hidden ${dm ? 'bg-gray-900/60 border-gray-800' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className={`px-6 py-4 border-b ${dm ? 'border-gray-800' : 'border-slate-200'}`}>
            <h3 className="font-black text-lg tracking-tight">Gerenciamento de Usuários</h3>
            <p className={`text-xs mt-1 ${dm ? 'text-gray-500' : 'text-slate-400'}`}>{displayedSubscriptions.length} usuário(s) exibido(s)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${dm ? 'bg-gray-800/50' : 'bg-slate-50'} border-b ${dm ? 'border-gray-800' : 'border-slate-200'}`}>
                <tr>
                  {['Usuário', 'Plano', 'Status', 'Cadastro', 'Vencimento', 'Cancelado em', 'Ações'].map(h => (
                    <th key={h} className={`px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest ${dm ? 'text-gray-500' : 'text-slate-400'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${dm ? 'divide-gray-800' : 'divide-slate-100'}`}>
                {displayedSubscriptions.map((sub) => (
                  <tr key={sub.user_id} className={`transition-colors ${dm ? 'hover:bg-gray-800/40' : 'hover:bg-slate-50'}`}>
                    <td className="px-4 py-4">
                      <div className={`text-sm font-bold ${dm ? 'text-white' : 'text-slate-900'}`}>{sub.email || '—'}</div>
                      <div className={`text-[10px] font-mono opacity-40 mt-0.5`}>{sub.user_id.slice(0, 16)}...</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${getPlanColor(sub.plan)}`}>
                        {getPlanIcon(sub.plan)}
                        {sub.plan.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black border ${getStatusColor(sub.status)}`}>
                        {sub.status === 'active' ? 'Ativo' : sub.status === 'cancelled' ? 'Cancelado' : 'Expirado'}
                      </span>
                    </td>
                    <td className={`px-4 py-4 text-sm ${dm ? 'text-gray-400' : 'text-slate-500'}`}>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(sub.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {sub.plan_expires_at ? (
                        <div className={`flex items-center gap-1 text-xs font-bold ${isExpired(sub.plan_expires_at) ? 'text-red-400' : isExpiringSoon(sub.plan_expires_at) ? 'text-amber-400' : (dm ? 'text-gray-400' : 'text-slate-500')}`}>
                          <Clock className="w-3 h-3" />
                          {new Date(sub.plan_expires_at).toLocaleDateString('pt-BR')}
                          {isExpired(sub.plan_expires_at) && <span className="ml-1 text-[9px] bg-red-500/10 px-1 rounded">EXPIRADO</span>}
                          {isExpiringSoon(sub.plan_expires_at) && !isExpired(sub.plan_expires_at) && <span className="ml-1 text-[9px] bg-amber-500/10 px-1 rounded">EM BREVE</span>}
                        </div>
                      ) : <span className={`text-xs ${dm ? 'text-gray-700' : 'text-slate-300'}`}>—</span>}
                    </td>
                    <td className={`px-4 py-4 text-xs ${dm ? 'text-gray-400' : 'text-slate-500'}`}>
                      {sub.cancelled_at ? (
                        <div className="flex items-center gap-1 text-red-400">
                          <AlertTriangle className="w-3 h-3" />
                          {new Date(sub.cancelled_at).toLocaleDateString('pt-BR')}
                        </div>
                      ) : <span className={`text-xs ${dm ? 'text-gray-700' : 'text-slate-300'}`}>—</span>}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={sub.plan}
                          onChange={(e) => handleApplyAction(sub.user_id, 'update_plan', e.target.value)}
                          className={`px-2 py-1.5 rounded-lg text-xs font-bold border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${dm ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-slate-300 text-slate-700'}`}
                        >
                          <option value="free">Free</option>
                          <option value="pro">Pro</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                        <button
                          onClick={() => handleApplyAction(sub.user_id, 'update_status', sub.status === 'active' ? 'cancelled' : 'active')}
                          className={`px-2 py-1.5 rounded-lg text-xs font-black border transition-all ${sub.status === 'active' ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'}`}
                          title={sub.status === 'active' ? 'Cancelar Plano' : 'Reativar'}
                        >
                          {sub.status === 'active' ? 'Cancelar' : 'Reativar'}
                        </button>
                        <button
                          onClick={() => handleApplyAction(sub.user_id, 'delete')}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {displayedSubscriptions.length === 0 && (
                  <tr>
                    <td colSpan={7} className={`px-6 py-16 text-center text-sm font-bold ${dm ? 'text-gray-600' : 'text-slate-400'}`}>
                      Nenhum usuário encontrado com os filtros atuais.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
