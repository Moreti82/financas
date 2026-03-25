import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

type Status = 'success' | 'failure' | 'pending';

export function PaymentResultPage({ status }: { status: Status }) {
  const navigate = useNavigate();
  const { refreshSubscription } = useSubscription();
  const [refreshed, setRefreshed] = useState(false);

  useEffect(() => {
    if (status === 'success' && !refreshed) {
      // Dá um tempinho para o webhook processar
      setTimeout(async () => {
        await refreshSubscription();
        setRefreshed(true);
      }, 3000);
    }
  }, [status, refreshed, refreshSubscription]);

  const configs = {
    success: {
      icon: <CheckCircle className="w-20 h-20 text-emerald-500" />,
      title: 'Pagamento Aprovado! 🎉',
      message: 'Seu plano foi ativado com sucesso. Aproveite todos os recursos premium!',
      bg: 'from-emerald-900/20',
      buttonText: 'Ir para o Dashboard',
      buttonClass: 'bg-emerald-600 hover:bg-emerald-700',
    },
    failure: {
      icon: <XCircle className="w-20 h-20 text-red-500" />,
      title: 'Pagamento não aprovado',
      message: 'Houve um problema com seu pagamento. Tente novamente ou use outro método.',
      bg: 'from-red-900/20',
      buttonText: 'Tentar Novamente',
      buttonClass: 'bg-indigo-600 hover:bg-indigo-700',
    },
    pending: {
      icon: <Clock className="w-20 h-20 text-amber-500" />,
      title: 'Pagamento em processamento',
      message: 'Seu pagamento está sendo processado. Você receberá uma confirmação em breve.',
      bg: 'from-amber-900/20',
      buttonText: 'Ir para o Dashboard',
      buttonClass: 'bg-amber-600 hover:bg-amber-700',
    },
  };

  const cfg = configs[status];

  return (
    <div className={`min-h-screen bg-gray-950 bg-gradient-to-b ${cfg.bg} to-transparent flex items-center justify-center p-6`}>
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          {cfg.icon}
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-black text-white">{cfg.title}</h1>
          <p className="text-gray-400 font-medium leading-relaxed">{cfg.message}</p>
          {status === 'success' && !refreshed && (
            <p className="text-xs text-gray-600 animate-pulse">Ativando seu plano...</p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/')}
            className={`w-full py-4 rounded-2xl font-black text-white transition-all ${cfg.buttonClass}`}
          >
            {cfg.buttonText}
          </button>
          {status === 'failure' && (
            <button
              onClick={() => navigate('/pricing')}
              className="w-full py-4 rounded-2xl font-bold border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-all"
            >
              Ver Planos
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
