import { useMemo } from 'react';
import type { TransactionWithCategory } from '../types/database';
import { PieChart, Circle } from 'lucide-react';
import * as Icons from 'lucide-react';

interface MonthlyChartProps {
  transactions: TransactionWithCategory[];
  darkMode?: boolean;
  selectedMonth?: number; // 0-11
  selectedYear?: number;
}

export function MonthlyChart({ 
  transactions, 
  darkMode = false,
  selectedMonth,
  selectedYear
}: MonthlyChartProps) {
  // Use current values if none provided
  const month = selectedMonth ?? new Date().getMonth();
  const year = selectedYear ?? new Date().getFullYear();

  const monthlyData = useMemo(() => {
    const filtered = transactions.filter((t) => {
      const date = new Date(t.date + 'T00:00:00');
      return date.getMonth() === month && date.getFullYear() === year;
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
  }, [transactions, month, year]);

  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName.split('-').map((word: string) =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('')];
    return IconComponent || Circle;
  };

  const colors = [
    'bg-blue-600',
    'bg-emerald-600',
    'bg-amber-600',
    'bg-rose-600',
    'bg-indigo-600',
    'bg-pink-600',
    'bg-sky-600',
    'bg-orange-600',
  ];

  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date(year, month));

  return (
    <div className={`${darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-white'} rounded-[32px] shadow-xl border h-full flex flex-col backdrop-blur-sm`}>
      <div className={`p-8 border-b ${darkMode ? 'border-gray-800' : 'border-slate-50'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl">
            <PieChart className="w-6 h-6 text-blue-500" />
          </div>
          <h2 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-slate-900'} capitalize underline decoration-blue-500/30 underline-offset-8`}>Gastos de {monthName}</h2>
        </div>
      </div>

      {monthlyData.categories.length === 0 ? (
        <div className="p-12 text-center flex-1 flex flex-col justify-center items-center opacity-40">
          <div className="p-4 bg-slate-100 dark:bg-gray-800 rounded-full mb-4">
             <Circle className="w-8 h-8" />
          </div>
          <p className={`${darkMode ? 'text-gray-400' : 'text-slate-600'} font-bold`}>Sem despesas neste período.</p>
        </div>
      ) : (
        <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="mb-10 bg-gradient-to-br from-blue-600/5 to-transparent p-6 rounded-2xl border border-blue-500/5 shadow-inner">
            <p className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-slate-500'} mb-1 font-black uppercase tracking-widest`}>Total Mensal Filtro</p>
            <p className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>R$ {monthlyData.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>

          <div className="space-y-6">
            {monthlyData.categories.map((category, index) => {
              const percentage = (category.amount / monthlyData.total) * 100;
              const Icon = getIcon(category.icon);
              const color = colors[index % colors.length];

              return (
                <div key={category.name} className="group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center shadow-lg shadow-${color.split('-')[1]}-500/20 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className={`text-sm font-black ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>{category.name}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        R$ {category.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  <div className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-slate-50'} rounded-full h-3 shadow-inner`}>
                    <div
                      className={`${color} h-full rounded-full transition-all duration-700 ease-out shadow-sm`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-end mt-2">
                    <p className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-slate-400'} font-black uppercase tracking-tighter`}>{percentage.toFixed(1)}% do total</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
