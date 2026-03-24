import { AlertCircle, Crown, TrendingUp, X } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';

interface PlanLimitsMinimalProps {
  currentTransactions: number;
  currentCategories: number;
}

export function PlanLimitsMinimal({ currentTransactions, currentCategories }: PlanLimitsMinimalProps) {
  const { currentPlan, limits, canAddTransaction, canAddCategory } = useSubscription();

  if (currentPlan === 'pro' || currentPlan === 'enterprise') {
    return null; // Sem limites para planos pagos
  }

  const transactionLimit = limits.transactions;
  const categoryLimit = limits.categories;
  
  const transactionUsage = (currentTransactions / transactionLimit) * 100;
  const categoryUsage = (currentCategories / categoryLimit) * 100;

  const isNearLimit = transactionUsage >= 80 || categoryUsage >= 80;
  const isAtLimit = !canAddTransaction(currentTransactions) || !canAddCategory(currentCategories);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
      {/* Header Compact */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isAtLimit ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
            isNearLimit ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
            'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
          }`}>
            {isAtLimit ? <X className="w-4 h-4" /> : 
             isNearLimit ? <AlertCircle className="w-4 h-4" /> : 
             <TrendingUp className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Plano Free</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isAtLimit ? 'Limites atingidos' : 
               isNearLimit ? 'Próximo dos limites' : 
               `${currentTransactions}/${transactionLimit} transações`}
            </p>
          </div>
        </div>
        
        {isAtLimit || isNearLimit ? (
          <button className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-medium rounded-lg transition-all hover:shadow-lg flex items-center gap-1">
            <Crown className="w-3 h-3" />
            Upgrade
          </button>
        ) : null}
      </div>

      {/* Progress Bars Minimal */}
      {(isNearLimit || isAtLimit) && (
        <div className="space-y-2">
          {/* Transactions Progress */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600 dark:text-gray-400 w-20">Transações</span>
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  !canAddTransaction(currentTransactions) ? 'bg-red-500' : 
                  transactionUsage >= 80 ? 'bg-amber-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(transactionUsage, 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 w-12 text-right">
              {currentTransactions}/{transactionLimit}
            </span>
          </div>

          {/* Categories Progress */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-600 dark:text-gray-400 w-20">Categorias</span>
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  !canAddCategory(currentCategories) ? 'bg-red-500' : 
                  categoryUsage >= 80 ? 'bg-amber-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(categoryUsage, 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 w-12 text-right">
              {currentCategories}/{categoryLimit}
            </span>
          </div>
        </div>
      )}

      {/* Message */}
      {isAtLimit && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-3 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Limite atingido! Faça upgrade para continuar.
        </p>
      )}

      {/* Upgrade Info - Only show when near/at limit */}
      {(isNearLimit || isAtLimit) && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-900 dark:text-white">Plano Pro</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ilimitado + Relatórios</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900 dark:text-white">R$ 19,90</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">/mês</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
