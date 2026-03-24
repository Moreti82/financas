import { Crown, TrendingUp, Check, X, AlertCircle } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { Modal } from './Modal';

interface PlanDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTransactions: number;
  currentCategories: number;
}

export function PlanDetailsModal({ isOpen, onClose, currentTransactions, currentCategories }: PlanDetailsModalProps) {
  const { currentPlan, limits, canAddTransaction, canAddCategory } = useSubscription();

  const transactionLimit = limits.transactions;
  const categoryLimit = limits.categories;
  
  const transactionUsage = (currentTransactions / transactionLimit) * 100;
  const categoryUsage = (currentCategories / categoryLimit) * 100;

  const isNearLimit = transactionUsage >= 80 || categoryUsage >= 80;
  const isAtLimit = !canAddTransaction(currentTransactions) || !canAddCategory(currentCategories);

  const getUsageColor = (usage: number) => {
    if (usage >= 100) return 'bg-red-500';
    if (usage >= 80) return 'bg-amber-500';
    return 'bg-blue-500';
  };

  const getUsageTextColor = (usage: number) => {
    if (usage >= 100) return 'text-red-600 dark:text-red-400';
    if (usage >= 80) return 'text-amber-600 dark:text-amber-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes do Plano"
      size="md"
    >
      <div className="space-y-6">
        {/* Current Plan */}
        <div className="text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
            currentPlan === 'free' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' :
            currentPlan === 'pro' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
            'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
          }`}>
            {currentPlan === 'free' ? (
              <>
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">Plano Free</span>
              </>
            ) : (
              <>
                <Crown className="w-4 h-4" />
                <span className="font-medium">Plano {currentPlan === 'pro' ? 'Pro' : 'Enterprise'}</span>
              </>
            )}
          </div>
        </div>

        {/* Usage Stats */}
        {currentPlan === 'free' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Transações</span>
                <span className={`text-sm font-bold ${getUsageTextColor(transactionUsage)}`}>
                  {currentTransactions}/{transactionLimit}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getUsageColor(transactionUsage)}`}
                  style={{ width: `${Math.min(transactionUsage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {transactionUsage.toFixed(0)}% utilizado
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Categorias</span>
                <span className={`text-sm font-bold ${getUsageTextColor(categoryUsage)}`}>
                  {currentCategories}/{categoryLimit}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${getUsageColor(categoryUsage)}`}
                  style={{ width: `${Math.min(categoryUsage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {categoryUsage.toFixed(0)}% utilizado
              </p>
            </div>
          </div>
        )}

        {/* Warning Messages */}
        {isAtLimit && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <X className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Limites atingidos
                </p>
                <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                  Você atingiu os limites do plano Free. Faça upgrade para continuar usando.
                </p>
              </div>
            </div>
          </div>
        )}

        {isNearLimit && !isAtLimit && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Próximo dos limites
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">
                  Você está usando mais de 80% dos limites do plano Free.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Plan Comparison */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">Comparação de Planos</h3>
          
          <div className="space-y-2">
            {/* Free Plan */}
            <div className={`border rounded-lg p-3 ${
              currentPlan === 'free' 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400' 
                : 'border-gray-200 dark:border-gray-700'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white">Free</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">Grátis</span>
              </div>
              <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-500" />
                  {transactionLimit} transações/mês
                </li>
                <li className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-500" />
                  {categoryLimit} categorias
                </li>
                <li className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-500" />
                  Dashboard básico
                </li>
              </ul>
            </div>

            {/* Pro Plan */}
            <div className={`border rounded-lg p-3 ${
              currentPlan === 'pro' 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400' 
                : 'border-gray-200 dark:border-gray-700'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-gray-900 dark:text-white">Pro</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">R$ 19,90/mês</span>
              </div>
              <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                <li className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-500" />
                  Transações ilimitadas
                </li>
                <li className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-500" />
                  Categorias ilimitadas
                </li>
                <li className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-500" />
                  Relatórios avançados
                </li>
                <li className="flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-500" />
                  Exportação de dados
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Fechar
          </button>
          {currentPlan === 'free' && (
            <button
              onClick={() => {
                // Redirecionar para página de pricing
                window.location.href = '/pricing';
              }}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4" />
              Fazer Upgrade
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
