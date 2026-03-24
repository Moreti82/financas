import { useState } from 'react';
import { Crown, TrendingUp, AlertCircle } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import { PlanDetailsModal } from './PlanDetailsModal';

interface PlanButtonProps {
  currentTransactions: number;
  currentCategories: number;
  darkMode?: boolean;
  compact?: boolean; // Para mobile
}

export function PlanButton({ currentTransactions, currentCategories, darkMode = false, compact = false }: PlanButtonProps) {
  const { currentPlan, limits, canAddTransaction, canAddCategory } = useSubscription();
  const [showModal, setShowModal] = useState(false);

  if (currentPlan === 'pro' || currentPlan === 'enterprise') {
    return null; // Não mostra para planos pagos
  }

  const transactionLimit = limits.transactions;
  const categoryLimit = limits.categories;
  
  const transactionUsage = (currentTransactions / transactionLimit) * 100;
  const categoryUsage = (currentCategories / categoryLimit) * 100;

  const isNearLimit = transactionUsage >= 80 || categoryUsage >= 80;
  const isAtLimit = !canAddTransaction(currentTransactions) || !canAddCategory(currentCategories);

  const getButtonColor = () => {
    if (isAtLimit) {
      return 'bg-red-500 text-white hover:bg-red-600';
    }
    if (isNearLimit) {
      return 'bg-amber-500 text-white hover:bg-amber-600';
    }
    return darkMode 
      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg transition-all
          ${compact ? 'text-xs' : 'text-sm'}
          ${getButtonColor()}
          ${isAtLimit || isNearLimit ? 'animate-pulse' : ''}
        `}
      >
        {isAtLimit ? (
          <>
            <AlertCircle className="w-4 h-4" />
            {compact ? 'Limites' : 'Limites Atigidos'}
          </>
        ) : isNearLimit ? (
          <>
            <AlertCircle className="w-4 h-4" />
            {compact ? `${currentTransactions}/${transactionLimit}` : 'Próximo do Limite'}
          </>
        ) : (
          <>
            <TrendingUp className="w-4 h-4" />
            {compact ? 'Free' : 'Plano Free'}
          </>
        )}
      </button>

      <PlanDetailsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        currentTransactions={currentTransactions}
        currentCategories={currentCategories}
      />
    </>
  );
}
