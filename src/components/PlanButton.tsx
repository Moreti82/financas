import { useState } from 'react';
import { TrendingUp, AlertCircle, Crown, Star } from 'lucide-react';
import { PlanDetailsModal } from './PlanDetailsModal';
import { useSubscription } from '../hooks/useSubscription';

interface PlanButtonProps {
  currentTransactions: number;
  currentCategories: number;
  darkMode?: boolean;
  compact?: boolean; // Para mobile
}

export function PlanButton({ currentTransactions, currentCategories, darkMode = false, compact = false }: PlanButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const { limits, isPro, isEnterprise } = useSubscription();

  const transactionLimit = limits.transactions;
  const categoryLimit = limits.categories;
  
  const transactionUsage = transactionLimit === Infinity ? 0 : (currentTransactions / transactionLimit) * 100;
  const categoryUsage = categoryLimit === Infinity ? 0 : (currentCategories / categoryLimit) * 100;

  const isNearLimit = (transactionLimit !== Infinity && transactionUsage >= 80) || 
                      (categoryLimit !== Infinity && categoryUsage >= 80);
  const isAtLimit = (transactionLimit !== Infinity && currentTransactions >= transactionLimit) || 
                    (categoryLimit !== Infinity && currentCategories >= categoryLimit);

  const getButtonColor = () => {
    if (isAtLimit) {
      return 'bg-red-500 text-white hover:bg-red-600';
    }
    if (isNearLimit) {
      return 'bg-amber-500 text-white hover:bg-amber-600';
    }
    if (isPro || isEnterprise) {
      return 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-md ring-2 ring-white/20';
    }
    return darkMode 
      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
  };

  const getPlanName = () => {
    if (isEnterprise) return 'Enterprise';
    if (isPro) return 'Plano Pro';
    return 'Plano Free';
  };

  const getIcon = () => {
    if (isAtLimit || isNearLimit) return <AlertCircle className="w-4 h-4" />;
    if (isEnterprise) return <Star className="w-4 h-4" />;
    if (isPro) return <Crown className="w-4 h-4" />;
    return <TrendingUp className="w-4 h-4" />;
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg transition-all
          ${compact ? 'text-xs' : 'text-sm font-semibold'}
          ${getButtonColor()}
          ${(isAtLimit || isNearLimit) ? 'animate-pulse' : ''}
          hover:scale-105 active:scale-95
        `}
      >
        {getIcon()}
        <span>
          {isAtLimit && !compact ? 'Limites Atingidos' : 
           isNearLimit && compact ? `${currentTransactions}/${transactionLimit}` : 
           getPlanName()}
        </span>
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
