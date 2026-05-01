import { useState } from 'react';
import { Crown, Star, Check, X, ArrowRight, Shield, ArrowLeft, Home, Moon, Sun } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { useToast } from '../hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function PricingPage() {
  const { currentPlan } = useSubscription();
  const toast = useToast();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [upgradingTo, setUpgradingTo] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') return;

    const fullPlanId = billingCycle === 'yearly' ? `${planId}_yearly` : planId;
    setUpgradingTo(planId);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Erro', 'Faça login para continuar.');
        setUpgradingTo(null);
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { planId: fullPlanId },
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      // Mostra o erro detalhado vindo da function
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      if (!data?.checkoutUrl) throw new Error('URL de pagamento não retornada.');

      // Redireciona para o checkout do Mercado Pago
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      console.error('Detalhe do erro:', err);
      toast.error('Erro ao iniciar pagamento', err.message);
      setUpgradingTo(null);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      description: 'Ideal para experimentação',
      icon: Shield,
      color: 'gray',
      features: [
        { text: '10 transações mensais', included: true },
        { text: '3 categorias personalizadas', included: true },
        { text: 'Dashboard básico', included: true },
        { text: 'Relatórios avançados', included: false },
        { text: 'Exportação PDF/CSV', included: false },
        { text: 'Suporte prioritário', included: false }
      ],
      cta: currentPlan === 'free' ? 'Plano Atual' : 'Plano Grátis'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 9.90,
      yearlyPrice: 99.00,
      description: 'O melhor para sua gestão',
      icon: Crown,
      color: 'blue',
      popular: true,
      features: [
        { text: 'Transações ilimitadas', included: true },
        { text: 'Categorias ilimitadas', included: true },
        { text: 'Dashboard Pro Completo', included: true },
        { text: 'Relatórios PDF e CSV', included: true },
        { text: 'Analytics com Gráficos', included: true },
        { text: 'Suporte prioritário 24h', included: true }
      ],
      cta: currentPlan === 'pro' ? 'Plano Atual' : 'Fazer Upgrade'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 29.90,
      yearlyPrice: 299.00,
      description: 'Para empresas e equipes',
      icon: Star,
      color: 'purple',
      features: [
        { text: 'Tudo do plano Pro', included: true },
        { text: 'Múltiplos usuários', included: true },
        { text: 'API de Integração', included: true },
        { text: 'SLA de 99.9%', included: true },
        { text: 'Gerente de conta dedicado', included: true },
        { text: 'Customização de layout', included: true }
      ],
      cta: currentPlan === 'enterprise' ? 'Plano Atual' : 'Assinar Enterprise'
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-gray-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Dynamic Background */}
      <div className={`fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] ${darkMode ? 'from-indigo-900/20 via-transparent' : 'from-indigo-100 via-transparent'} to-transparent`} />

      {/* Modern Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b ${darkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/')} 
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all hover:scale-105 active:scale-95 ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'}`}
          >
            <ArrowLeft className="w-4 h-4" />
            <Home className="w-4 h-4 md:block hidden" />
            <span className="font-bold text-sm">Dashboard</span>
          </button>

          <div className="text-center hidden md:block">
            <h1 className="text-xl font-black uppercase tracking-tighter">Planos Premium</h1>
          </div>

          <button 
            onClick={() => setDarkMode(!darkMode)} 
            className={`p-3 rounded-xl border transition-all ${darkMode ? 'bg-gray-800 border-gray-700 text-yellow-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'}`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-black uppercase tracking-widest mb-4">
            <Crown className="w-3 h-3" /> Escolha sua liberdade
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight underline decoration-indigo-500/30 underline-offset-8">Eleve suas Finanças</h2>
          <p className={`text-lg max-w-2xl mx-auto ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>Assuma o controle total com ferramentas de exportação, analytics avançado e lançamentos ilimitados.</p>
        </div>

        {/* Cycle Toggle */}
        <div className="flex justify-center mb-16">
          <div className={`p-1.5 rounded-2xl border flex gap-1 ${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${billingCycle === 'monthly' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-400'}`}
            >
              MENSAL
            </button>
            <button 
              onClick={() => setBillingCycle('yearly')}
              className={`px-8 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-400'}`}
            >
              ANUAL <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-full">POPULAR</span>
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = billingCycle === 'yearly' ? plan.yearlyPrice! / 12 : plan.price;
            const isCurrent = currentPlan === plan.id;
            
            return (
              <div 
                key={plan.id}
                className={`relative rounded-[40px] p-8 border-2 transition-all hover:-translate-y-2 group flex flex-col ${
                  plan.popular 
                    ? (darkMode ? 'bg-gray-900/80 border-indigo-500/50 shadow-2xl shadow-indigo-500/20' : 'bg-white border-indigo-500 shadow-2xl')
                    : (darkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-slate-100 shadow-xl')
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-10 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-indigo-400 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg">RECOMENDADO</div>
                )}

                <div className="mb-8 flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${plan.color === 'blue' ? 'bg-blue-500/10 text-blue-500' : plan.color === 'purple' ? 'bg-purple-500/10 text-purple-500' : 'bg-gray-500/10 text-gray-400'}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">{plan.name}</h3>
                    <p className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-gray-500' : 'text-slate-400'}`}>Plano {plan.id}</p>
                  </div>
                </div>

                <div className="mb-10">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black tracking-tighter">R$ {price.toFixed(2)}</span>
                    <span className="text-sm font-bold opacity-40">/mês</span>
                  </div>
                  <p className={`mt-2 text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>{plan.description}</p>
                </div>

                <div className="space-y-4 mb-10 flex-1">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${f.included ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-500/10 text-gray-500'}`}>
                        {f.included ? <Check className="w-3 h-3 font-black" /> : <X className="w-3 h-3" />}
                      </div>
                      <span className={`text-sm font-bold ${f.included ? (darkMode ? 'text-gray-200' : 'text-slate-700') : 'text-gray-500/60 line-through decoration-1'}`}>{f.text}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrent || !!upgradingTo}
                  className={`w-full py-5 rounded-3xl font-black transition-all ${
                    isCurrent 
                      ? 'bg-emerald-500/10 text-emerald-500 cursor-not-allowed border border-emerald-500/20'
                      : plan.popular
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-600/30 active:scale-95'
                        : (darkMode ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-gray-900 text-white hover:bg-black')
                  } flex items-center justify-center gap-3`}
                >
                  {upgradingTo === plan.id ? (
                    <div className="animate-spin h-5 w-5 border-b-2 border-current rounded-full" />
                  ) : isCurrent ? (
                    <>Plano Ativo</>
                  ) : (
                    <>{plan.cta} <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Security Info */}
        <div className={`mt-20 p-8 rounded-[40px] border flex flex-col md:flex-row items-center justify-between gap-8 ${darkMode ? 'bg-gray-900/30 border-gray-800' : 'bg-white border-slate-100 shadow-sm'}`}>
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center"><Shield className="w-8 h-8 text-emerald-500" /></div>
            <div>
              <h4 className="text-lg font-black tracking-tight">Pagamento Seguro & Criptografado</h4>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-500' : 'text-slate-500'}`}>Processamento via Mercado Pago com criptografia de ponta a ponta.</p>
            </div>
          </div>
          <div className="flex gap-4">
             <div className={`px-4 py-2 rounded-xl text-xs font-black border ${darkMode ? 'border-gray-800 text-gray-500' : 'border-slate-200 text-slate-400'}`}>MERCADO PAGO</div>
             <div className={`px-4 py-2 rounded-xl text-xs font-black border ${darkMode ? 'border-gray-800 text-gray-500' : 'border-slate-200 text-slate-400'}`}>PCI-DSS</div>
          </div>
        </div>
      </main>

      {/* Checkout Overlay */}
      {upgradingTo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/80 backdrop-blur-xl">
          <div className="bg-gray-900 rounded-[48px] p-12 max-w-sm w-full shadow-[0_0_80px_rgba(79,70,229,0.3)] text-center border border-gray-800 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <Shield className="w-12 h-12 text-indigo-500 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-white mb-3">Autenticando</h2>
            <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8">Conectando ao cofre seguro do banco para processar sua assinatura premium...</p>
            <div className="flex justify-center gap-2">
               {[0, 1, 2].map(i => <div key={i} className={`w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:${i*-0.15}s]`} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
