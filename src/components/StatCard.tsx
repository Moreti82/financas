import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  bgColor: string;
  darkMode: boolean;
}

export function StatCard({
  title,
  value,
  change,
  icon,
  bgColor,
  darkMode
}: StatCardProps) {
  return (
    <div
      className={`${
        darkMode ? 'bg-gray-800' : 'bg-white'
      } rounded-2xl p-6 border ${
        darkMode ? 'border-gray-700' : 'border-slate-200'
      } hover:shadow-lg transition-all hover:scale-105`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 ${bgColor} rounded-xl text-white`}>
          {icon}
        </div>
        <div
          className={`flex items-center gap-1 text-sm ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {change >= 0 ? (
            <ArrowUpRight className="w-4 h-4" />
          ) : (
            <ArrowDownRight className="w-4 h-4" />
          )}
          <span>{Math.abs(change)}%</span>
        </div>
      </div>
      <h3
        className={`text-2xl font-bold ${
          darkMode ? 'text-white' : 'text-slate-900'
        } mb-1`}
      >
        {value}
      </h3>
      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-600'}`}>
        {title}
      </p>
    </div>
  );
}
