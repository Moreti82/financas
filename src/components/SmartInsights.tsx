import { AlertCircle, TrendingUp, Target, Lightbulb } from 'lucide-react';
import type { TransactionStats } from '../hooks/useTransactionStats';

interface SmartInsightsProps {
  stats: TransactionStats;
  darkMode: boolean;
  previousMonthStats?: TransactionStats;
}

export function SmartInsights({
  stats,
  darkMode,
  previousMonthStats
}: SmartInsightsProps) {
  const insights: Array<{
    type: 'warning' | 'success' | 'info' | 'tip';
    title: string;
    description: string;
    icon: React.ReactNode;
  }> = [];

  // Insight: Savings Rate
  if (stats.savingsRate > 30) {
    insights.push({
      type: 'success',
      title: 'Excelente Taxa de Economia!',
      description: `Você está economizando ${stats.savingsRate.toFixed(1)}% da sua renda. Continue assim!`,
      icon: <TrendingUp className="w-5 h-5" />
    });
  } else if (stats.savingsRate < 10 && stats.savingsRate >= 0) {
    insights.push({
      type: 'warning',
      title: 'Taxa de Economia Baixa',
      description: `Você está economizando apenas ${stats.savingsRate.toFixed(1)}% da sua renda. Considere revisar seus gastos.`,
      icon: <AlertCircle className="w-5 h-5" />
    });
  }

  // Insight: Expense Increase
  if (previousMonthStats && stats.expense > previousMonthStats.expense * 1.15) {
    const increase = ((stats.expense - previousMonthStats.expense) / previousMonthStats.expense * 100).toFixed(1);
    insights.push({
      type: 'warning',
      title: 'Aumento de Despesas',
      description: `Suas despesas aumentaram ${increase}% comparado ao mês anterior.`,
      icon: <AlertCircle className="w-5 h-5" />
    });
  }

  // Insight: Top Expense Category
  if (stats.topExpenseCategories.length > 0) {
    const [category, amount] = stats.topExpenseCategories[0];
    const percentage = (amount / stats.expense * 100).toFixed(1);
    insights.push({
      type: 'info',
      title: 'Maior Categoria de Gastos',
      description: `${category} representa ${percentage}% dos seus gastos (R$ ${amount.toFixed(2)}).`,
      icon: <Target className="w-5 h-5" />
    });
  }

  // Insight: No Income
  if (stats.income === 0) {
    insights.push({
      type: 'warning',
      title: 'Nenhuma Receita Registrada',
      description: 'Registre suas receitas para obter uma análise completa.',
      icon: <AlertCircle className="w-5 h-5" />
    });
  }

  // Insight: Balanced Budget
  if (stats.balance > 0 && stats.savingsRate >= 10 && stats.savingsRate <= 30) {
    insights.push({
      type: 'tip',
      title: 'Orçamento Equilibrado',
      description: 'Seu orçamento está bem equilibrado. Mantenha este padrão!',
      icon: <Lightbulb className="w-5 h-5" />
    });
  }

  if (insights.length === 0) {
    return null;
  }

  const getStyles = (type: string) => {
    switch (type) {
      case 'success':
        return {
          bg: darkMode ? 'bg-green-900/20' : 'bg-green-50',
          border: 'border-green-200 dark:border-green-800',
          icon: 'text-green-600',
          title: darkMode ? 'text-green-300' : 'text-green-900',
          desc: darkMode ? 'text-green-200' : 'text-green-700'
        };
      case 'warning':
        return {
          bg: darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50',
          border: 'border-yellow-200 dark:border-yellow-800',
          icon: 'text-yellow-600',
          title: darkMode ? 'text-yellow-300' : 'text-yellow-900',
          desc: darkMode ? 'text-yellow-200' : 'text-yellow-700'
        };
      case 'info':
        return {
          bg: darkMode ? 'bg-blue-900/20' : 'bg-blue-50',
          border: 'border-blue-200 dark:border-blue-800',
          icon: 'text-blue-600',
          title: darkMode ? 'text-blue-300' : 'text-blue-900',
          desc: darkMode ? 'text-blue-200' : 'text-blue-700'
        };
      case 'tip':
        return {
          bg: darkMode ? 'bg-purple-900/20' : 'bg-purple-50',
          border: 'border-purple-200 dark:border-purple-800',
          icon: 'text-purple-600',
          title: darkMode ? 'text-purple-300' : 'text-purple-900',
          desc: darkMode ? 'text-purple-200' : 'text-purple-700'
        };
      default:
        return {
          bg: darkMode ? 'bg-gray-800' : 'bg-gray-50',
          border: 'border-gray-200 dark:border-gray-700',
          icon: 'text-gray-600',
          title: darkMode ? 'text-gray-300' : 'text-gray-900',
          desc: darkMode ? 'text-gray-200' : 'text-gray-700'
        };
    }
  };

  return (
    <div className="space-y-4">
      <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
        💡 Insights Inteligentes
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => {
          const styles = getStyles(insight.type);
          return (
            <div
              key={index}
              className={`${styles.bg} border ${styles.border} rounded-lg p-4 transition-all hover:shadow-md`}
            >
              <div className="flex items-start gap-3">
                <div className={`${styles.icon} mt-1`}>{insight.icon}</div>
                <div>
                  <h4 className={`font-semibold ${styles.title}`}>{insight.title}</h4>
                  <p className={`text-sm mt-1 ${styles.desc}`}>{insight.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
