import { AlertCircle, Crown } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

interface PlanLimitsProps {
  currentTransactions: number;
  currentCategories: number;
}

export function PlanLimits({ currentTransactions, currentCategories }: PlanLimitsProps) {
  const { currentPlan, limits, canAddTransaction, canAddCategory } = useSubscription();

  if (currentPlan === 'pro' || currentPlan === 'enterprise') {
    return null; // Sem limites para planos pagos
  }

  const transactionLimit = limits.transactions;
  const categoryLimit = limits.categories;
  
  const transactionUsage = (currentTransactions / transactionLimit) * 100;
  const categoryUsage = (currentCategories / categoryLimit) * 100;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="w-5 h-5 text-amber-600" />
        <h3 className="font-semibold text-amber-900">Plano Gratuito - Limites</h3>
      </div>

      <div className="space-y-3">
        {/* Transações */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-amber-700">Transações</span>
            <span className="text-amber-700 font-medium">
              {currentTransactions}/{transactionLimit}
            </span>
          </div>
          <div className="w-full bg-amber-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-colors ${
                transactionUsage >= 90 ? 'bg-red-500' : 
                transactionUsage >= 70 ? 'bg-amber-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(transactionUsage, 100)}%` }}
            />
          </div>
          {!canAddTransaction(currentTransactions) && (
            <p className="text-xs text-red-600 mt-1">
              Limite atingido! Faça upgrade para continuar.
            </p>
          )}
        </div>

        {/* Categorias */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-amber-700">Categorias</span>
            <span className="text-amber-700 font-medium">
              {currentCategories}/{categoryLimit}
            </span>
          </div>
          <div className="w-full bg-amber-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-colors ${
                categoryUsage >= 90 ? 'bg-red-500' : 
                categoryUsage >= 70 ? 'bg-amber-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(categoryUsage, 100)}%` }}
            />
          </div>
          {!canAddCategory(currentCategories) && (
            <p className="text-xs text-red-600 mt-1">
              Limite atingido! Faça upgrade para continuar.
            </p>
          )}
        </div>
      </div>

      {/* Upgrade Button */}
      <div className="mt-4 pt-3 border-t border-amber-200">
        <button className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
          <Crown className="w-4 h-4" />
          Fazer Upgrade para Pro
        </button>
        <p className="text-xs text-amber-600 mt-2 text-center">
          R$ 19,90/mês • Ilimitado + Relatórios
        </p>
      </div>
    </div>
  );
}
