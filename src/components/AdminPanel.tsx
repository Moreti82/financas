import { useState, useEffect } from 'react';
import { Users, CreditCard, Settings, Crown, Shield, Star } from 'lucide-react';
import type { Subscription, PlanType, SubscriptionStatus } from '../types/database';

interface MockSubscription extends Subscription {
  user_email: string;
  user_name: string;
}

export function AdminPanel() {
  const [subscriptions, setSubscriptions] = useState<MockSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{
    plan?: PlanType;
    status?: SubscriptionStatus;
  }>({});

  useEffect(() => {
    loadSubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadSubscriptions = async () => {
    setLoading(true);
    
    // Mock data até configurar Supabase
    const mockData: MockSubscription[] = [
      {
        id: '1',
        user_id: 'user1',
        plan: 'free',
        status: 'active',
        user_email: 'joao@email.com',
        user_name: 'João Silva',
        current_period_start: '2024-01-01',
        current_period_end: '2024-02-01',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      },
      {
        id: '2',
        user_id: 'user2',
        plan: 'pro',
        status: 'active',
        user_email: 'maria@email.com',
        user_name: 'Maria Santos',
        current_period_start: '2024-01-15',
        current_period_end: '2024-02-15',
        created_at: '2024-01-15',
        updated_at: '2024-01-15'
      },
      {
        id: '3',
        user_id: 'user3',
        plan: 'enterprise',
        status: 'cancelled',
        user_email: 'empresa@company.com',
        user_name: 'Empresa LTDA',
        current_period_start: '2024-01-01',
        current_period_end: '2024-02-01',
        created_at: '2024-01-01',
        updated_at: '2024-01-20'
      }
    ];

    // Aplicar filtros
    let filtered = mockData;
    if (filter.plan) {
      filtered = filtered.filter(sub => sub.plan === filter.plan);
    }
    if (filter.status) {
      filtered = filtered.filter(sub => sub.status === filter.status);
    }

    setSubscriptions(filtered);
    setLoading(false);
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
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'active').length,
    free: subscriptions.filter(s => s.plan === 'free').length,
    pro: subscriptions.filter(s => s.plan === 'pro').length,
    enterprise: subscriptions.filter(s => s.plan === 'enterprise').length,
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
            <h3 className="text-lg font-semibold text-slate-900">Assinaturas</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Plano
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Período
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Criado em
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {subscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {subscription.user_name}
                        </div>
                        <div className="text-sm text-slate-500">
                          {subscription.user_email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getPlanColor(subscription.plan)}`}>
                        {getPlanIcon(subscription.plan)}
                        {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(subscription.status)}`}>
                        {subscription.status === 'active' ? 'Ativo' : 
                         subscription.status === 'cancelled' ? 'Cancelado' : 'Expirado'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(subscription.current_period_start).toLocaleDateString('pt-BR')} - 
                      {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(subscription.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
