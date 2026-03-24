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

  // Ultra minimalista - só mostra quando realmente necessário
  if (!isNearLimit && !isAtLimit) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 shadow-sm">
      {/* Header Ultra Compact */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
            isAtLimit ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
            isNearLimit ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' :
            'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
          }`}>
            {isAtLimit ? <X className="w-3 h-3" /> : 
             isNearLimit ? <AlertCircle className="w-3 h-3" /> : 
             <TrendingUp className="w-3 h-3" />}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white text-xs">Plano Free</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isAtLimit ? 'Limites atingidos' : `${currentTransactions}/${transactionLimit}`}
            </p>
          </div>
        </div>
        
        {isAtLimit || isNearLimit ? (
          <button className="px-2 py-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-medium rounded transition-all hover:shadow-lg flex items-center gap-1">
            <Crown className="w-3 h-3" />
            Pro
          </button>
        ) : null}
      </div>

      {/* Progress Bars - Só quando at limit */}
      {isAtLimit && (
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 dark:text-gray-400 w-16">Trans</span>
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <div className="h-1 rounded-full bg-red-500" style={{ width: '100%' }} />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">{currentTransactions}/{transactionLimit}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 dark:text-gray-400 w-16">Cat</span>
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
              <div className="h-1 rounded-full bg-red-500" style={{ width: '100%' }} />
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">{currentCategories}/{categoryLimit}</span>
          </div>
        </div>
      )}
    </div>
  );
}
