import { useMemo } from 'react';
import type { TransactionWithCategory } from '../types/database';
import { PieChart, Circle } from 'lucide-react';
import * as Icons from 'lucide-react';

interface MonthlyChartProps {
  transactions: TransactionWithCategory[];
  darkMode?: boolean;
}

export function MonthlyChart({ transactions, darkMode = false }: MonthlyChartProps) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyData = useMemo(() => {
    const filtered = transactions.filter((t) => {
      const date = new Date(t.date + 'T00:00:00');
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const expensesByCategory = new Map<string, { name: string; amount: number; icon: string }>();

    filtered
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const categoryName = t.category?.name || 'Sem categoria';
        const categoryIcon = t.category?.icon || 'circle';
        const existing = expensesByCategory.get(categoryName);
        if (existing) {
          existing.amount += Number(t.amount);
        } else {
          expensesByCategory.set(categoryName, {
            name: categoryName,
            amount: Number(t.amount),
            icon: categoryIcon,
          });
        }
      });

    const sortedCategories = Array.from(expensesByCategory.values()).sort(
      (a, b) => b.amount - a.amount
    );

    const totalExpenses = sortedCategories.reduce((sum, cat) => sum + cat.amount, 0);

    return {
      categories: sortedCategories,
      total: totalExpenses,
    };
  }, [transactions, currentMonth, currentYear]);

  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName.split('-').map((word: string) =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('')];
    return IconComponent || Circle;
  };

  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500',
  ];

  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date());

  return (
    <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'} rounded-2xl shadow-sm border h-full flex flex-col`}>
      <div className={`p-6 border-b ${darkMode ? 'border-gray-800' : 'border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <PieChart className="w-5 h-5 text-blue-500" />
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'} capitalize`}>Despesas de {monthName}</h2>
        </div>
      </div>

      {monthlyData.categories.length === 0 ? (
        <div className="p-8 text-center flex-1 flex flex-col justify-center">
          <p className={`${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>Nenhuma despesa este mês</p>
        </div>
      ) : (
        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          <div className="mb-6">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'} mb-2`}>Total de despesas</p>
            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>R$ {monthlyData.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>

          <div className="space-y-4">
            {monthlyData.categories.map((category, index) => {
              const percentage = (category.amount / monthlyData.total) * 100;
              const Icon = getIcon(category.icon);
              const color = colors[index % colors.length];

              return (
                <div key={category.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-slate-800'}`}>{category.name}</span>
                    </div>
                    <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      R$ {category.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-slate-100'} rounded-full h-2`}>
                    <div
                      className={`${color} h-2 rounded-full transition-all duration-500 shadow-sm`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-slate-500'} mt-1 font-medium`}>{percentage.toFixed(1)}% do total</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
