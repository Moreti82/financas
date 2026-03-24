import { useState } from 'react';
import { Crown, Star, Check, X, ArrowRight, Shield } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

export function PricingPage() {
  const { currentPlan } = useSubscription();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      description: 'Perfeito para começar',
      icon: Shield,
      color: 'gray',
      features: [
        { text: '10 transações por mês', included: true },
        { text: '3 categorias personalizadas', included: true },
        { text: 'Dashboard básico', included: true },
        { text: 'Relatórios simples', included: false },
        { text: 'Exportação de dados', included: false },
        { text: 'Acesso prioritário', included: false },
        { text: 'API para desenvolvedores', included: false },
        { text: 'Suporte por email', included: true }
      ],
      cta: currentPlan === 'free' ? 'Plano Atual' : 'Começar Gratis'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 5.00,
      yearlyPrice: 50.00,
      description: 'Para profissionais',
      icon: Crown,
      color: 'blue',
      popular: true,
      features: [
        { text: 'Transações ilimitadas', included: true },
        { text: 'Categorias ilimitadas', included: true },
        { text: 'Dashboard avançado', included: true },
        { text: 'Relatórios detalhados', included: true },
        { text: 'Exportação (PDF/Excel)', included: true },
        { text: 'Analytics em tempo real', included: true },
        { text: 'API básica', included: false },
        { text: 'Suporte prioritário', included: true }
      ],
      cta: currentPlan === 'pro' ? 'Plano Atual' : 'Fazer Upgrade'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 15.00,
      yearlyPrice: 150.00,
      description: 'Para equipes',
      icon: Star,
      color: 'purple',
      features: [
        { text: 'Tudo do plano Pro', included: true },
        { text: 'Gestão de equipe', included: true },
        { text: 'API completa', included: true },
        { text: 'Integrações personalizadas', included: true },
        { text: 'Relatórios customizados', included: true },
        { text: 'SLA garantido', included: true },
        { text: 'Suporte dedicado', included: true },
        { text: 'Treinamento da equipe', included: true }
      ],
      cta: currentPlan === 'enterprise' ? 'Plano Atual' : 'Falar com Vendas'
    }
  ];

  const getPlanColor = (color: string) => {
    switch (color) {
      case 'gray': return 'border-gray-200 bg-white';
      case 'blue': return 'border-blue-500 bg-blue-50';
      case 'purple': return 'border-purple-500 bg-purple-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  const getButtonColor = (color: string, popular?: boolean) => {
    switch (color) {
      case 'gray': return 'bg-gray-100 hover:bg-gray-200 text-gray-700';
      case 'blue': return popular ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-100 hover:bg-blue-200 text-blue-700';
      case 'purple': return 'bg-purple-600 hover:bg-purple-700 text-white';
      default: return 'bg-gray-100 hover:bg-gray-200 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Planos e Preços</h1>
              <p className="text-slate-600 mt-1">Escolha o plano perfeito para suas necessidades</p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 border border-slate-200 inline-flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Anual <span className="text-green-600">-20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const displayPrice = billingCycle === 'yearly' && plan.yearlyPrice 
              ? plan.yearlyPrice / 12 
              : plan.price;
            const isCurrentPlan = currentPlan === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-8 transition-all hover:scale-105 ${getPlanColor(plan.color)}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Mais Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                    plan.color === 'blue' ? 'bg-blue-100' :
                    plan.color === 'purple' ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-8 h-8 ${
                      plan.color === 'blue' ? 'text-blue-600' :
                      plan.color === 'purple' ? 'text-purple-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-slate-600 mt-2">{plan.description}</p>
                </div>

                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-slate-900">
                      R$ {displayPrice.toFixed(2)}
                    </span>
                    <span className="text-slate-600 ml-1">/mês</span>
                  </div>
                  {billingCycle === 'yearly' && plan.yearlyPrice && (
                    <p className="text-sm text-green-600 mt-1">
                      Economize R$ {(plan.price * 12 - plan.yearlyPrice).toFixed(2)}/ano
                    </p>
                  )}
                </div>

                <button
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors mb-6 ${
                    isCurrentPlan
                      ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                      : getButtonColor(plan.color, plan.popular)
                  }`}
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? (
                    <span className="flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" />
                      {plan.cta}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      {plan.cta}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </button>

                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-slate-300 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${feature.included ? 'text-slate-700' : 'text-slate-400'}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Perguntas Frequentes</h2>
          <p className="text-slate-600 mb-8">Tudo que você precisa saber sobre nossos planos</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">Posso mudar de plano?</h3>
              <p className="text-slate-600 text-sm">Sim! Você pode upgrade ou downgrade a qualquer momento.</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">Como funciona o cancelamento?</h3>
              <p className="text-slate-600 text-sm">Cancele a qualquer momento. Sem multas ou taxas escondidas.</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">Meus dados estão seguros?</h3>
              <p className="text-slate-600 text-sm">Sim! Usamos criptografia de ponta a seguimos as melhores práticas.</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-2">Existe período de teste?</h3>
              <p className="text-slate-600 text-sm">O plano Free é para sempre. Planos pagos têm 7 dias de garantia.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
