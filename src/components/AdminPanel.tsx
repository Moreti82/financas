import { useState, useEffect } from 'react';
import { Users, CreditCard, Settings, Crown, Shield, Star, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
import type { PlanType, SubscriptionStatus } from '../types/database';

interface AdminSubscriptionView {
  user_id: string;
  email?: string;
  plan: PlanType;
  status: SubscriptionStatus;
  created_at: string;
}

export function AdminPanel() {
  const [allSubscriptions, setAllSubscriptions] = useState<AdminSubscriptionView[]>([]);
  const [displayedSubscriptions, setDisplayedSubscriptions] = useState<AdminSubscriptionView[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{
    plan?: PlanType;
    status?: SubscriptionStatus;
  }>({});
  const toast = useToast();

  useEffect(() => {
    loadRealData();
  }, []);

  const loadRealData = async () => {
    setLoading(true);
    try {
      // Como o Supabase não expõe os emails da tabela auth.users por padrão por segurança,
      // usaremos a tabela user_profiles para gerenciar o plano e controle do usuário direto no banco.
      // E a tabela subscriptions para status se houver.

      const { data: profiles, error: profileErr } = await supabase
        .from('user_profiles')
        .select('*');

      if (profileErr) {
        console.error(profileErr);
        toast.error('Erro ao buscar do Supabase', profileErr.message);
        return;
      }

      if (profiles) {
        console.log('Perfis carregados do Supabase:', profiles);
        const formattedData: AdminSubscriptionView[] = profiles.map((p: any) => ({
          user_id: p.user_id,
          email: p.email,
          plan: (p.plan as PlanType) || 'free',
          status: 'active', // Fixo como ativo pois requer join manual para ver subscriptions se ele usar Stripe real
          created_at: p.created_at || new Date().toISOString()
        }));
        setAllSubscriptions(formattedData);
        setDisplayedSubscriptions(formattedData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [allSubscriptions, filter]);

  const applyFilters = () => {
    let filtered = allSubscriptions;
    if (filter.plan) {
      filtered = filtered.filter(sub => sub.plan === filter.plan);
    }
    if (filter.status) {
      filtered = filtered.filter(sub => sub.status === filter.status);
    }
    setDisplayedSubscriptions(filtered);
  };

  const handleApplyAction = async (userId: string, action: 'delete' | 'update_plan' | 'update_status', value?: any) => {
    if (action === 'delete') {
      if (confirm('Tem certeza que deseja excluir permanentemente este perfil do banco de dados? (Isso não exclui a conta de auth por motivos de segurança do Supabase)')) {
        const { error } = await supabase.from('user_profiles').delete().eq('user_id', userId);
        if (!error) {
          setAllSubscriptions(prev => prev.filter(sub => sub.user_id !== userId));
          toast.success('Excluído do banco real!');
        } else {
          toast.error('Erro ao excluir', error.message);
        }
      }
    } else if (action === 'update_plan') {
      const { error } = await supabase
        .from('user_profiles')
        .update({ plan: value as PlanType })
        .eq('user_id', userId);

      if (!error) {
        setAllSubscriptions(prev => prev.map(sub =>
          sub.user_id === userId ? { ...sub, plan: value as PlanType } : sub
        ));
        toast.success('Plano atualizado no banco!');
      } else {
        toast.error('Erro ao atualizar plano', error.message);
      }
    } else if (action === 'update_status') {
      // Como a tabela de user_profiles não tem coluna nativa status ou isActive,
      // idealmente atualizaríamos 'subscriptions' no banco, vamos mockar visual pro front
      setAllSubscriptions(prev => prev.map(sub =>
        sub.user_id === userId ? { ...sub, status: value as SubscriptionStatus } : sub
      ));
      toast.info('Status visual atualizado. Requer tabela Subscriptions sincronizada.');
    }
  };

  const getPlanIcon = (plan: PlanType) => {
    switch (plan) {
      case 'free':
        return <Shield className="w-4 h-4 text-gray-500" />;
      case 'pro':
        return <Crown className="w-4 h-4 text-blue-500" />;
      case 'enterprise':
        return <Star className="w-4 h-4 text-purple-500" />;
    }
  };

  const getPlanColor = (plan: PlanType) => {
    switch (plan) {
      case 'free':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'pro':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'enterprise':
        return 'bg-purple-100 text-purple-700 border-purple-200';
    }
  };

  const getStatusColor = (status: SubscriptionStatus) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'expired':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const stats = {
    total: allSubscriptions.length,
    active: allSubscriptions.filter(s => s.status === 'active').length,
    free: allSubscriptions.filter(s => s.plan === 'free').length,
    pro: allSubscriptions.filter(s => s.plan === 'pro').length,
    enterprise: allSubscriptions.filter(s => s.plan === 'enterprise').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-96 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Settings className="w-8 h-8 text-slate-600" />
              Painel Administrativo
            </h1>
            <p className="text-slate-600 mt-2">Gerencie assinaturas e usuários</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total de Usuários</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Assinaturas Ativas</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.active}</p>
              </div>
              <CreditCard className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Plano Pro</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.pro}</p>
              </div>
              <Crown className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Enterprise</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{stats.enterprise}</p>
              </div>
              <Star className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Filtros</h3>
          <div className="flex gap-4">
            <select
              value={filter.plan || ''}
              onChange={(e) => setFilter({ ...filter, plan: e.target.value as PlanType || undefined })}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os Planos</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>

            <select
              value={filter.status || ''}
              onChange={(e) => setFilter({ ...filter, status: e.target.value as SubscriptionStatus || undefined })}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os Status</option>
              <option value="active">Ativo</option>
              <option value="cancelled">Cancelado</option>
              <option value="expired">Expirado</option>
            </select>

            <button
              onClick={() => setFilter({})}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Gerenciamento de Assinaturas</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Plano Atual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status Atual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Data de Criação
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Ações de Gerenciamento
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {displayedSubscriptions.map((subscription) => (
                  <tr key={subscription.user_id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {subscription.email || '⚠️ Sem E-mail (Verifique Banco)'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 opacity-50">
                          ID: {subscription.user_id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-2">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border w-fit ${getPlanColor(subscription.plan)}`}>
                          {getPlanIcon(subscription.plan)}
                          {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-2">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border w-fit ${getStatusColor(subscription.status)}`}>
                          {subscription.status === 'active' ? 'Ativo' :
                            subscription.status === 'cancelled' ? 'Cancelado' : 'Expirado'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(subscription.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <select
                          value={subscription.plan}
                          onChange={(e) => handleApplyAction(subscription.user_id, 'update_plan', e.target.value)}
                          className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        >
                          <option value="free">Free</option>
                          <option value="pro">Pro</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                        <select
                          value={subscription.status}
                          onChange={(e) => handleApplyAction(subscription.user_id, 'update_status', e.target.value)}
                          className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        >
                          <option value="active">Ativar</option>
                          <option value="cancelled">Inativar/Cancelar</option>
                        </select>
                        <button
                          onClick={() => handleApplyAction(subscription.user_id, 'delete')}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                          title="Excluir Usuário"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {displayedSubscriptions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      Nenhum usuário encontrado com os filtros atuais.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
