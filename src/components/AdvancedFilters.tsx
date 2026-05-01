import { Filter, X } from 'lucide-react';
import type { Category } from '../types/database';

interface AdvancedFiltersProps {
  filterMonth: number;
  filterYear: number;
  filterCategory: string;
  searchTerm: string;
  categories: Category[];
  darkMode: boolean;
  onFilterMonthChange: (month: number) => void;
  onFilterYearChange: (year: number) => void;
  onFilterCategoryChange: (category: string) => void;
  onSearchChange: (search: string) => void;
  onReset: () => void;
}

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

export function AdvancedFilters({
  filterMonth,
  filterYear,
  filterCategory,
  searchTerm,
  categories,
  darkMode,
  onFilterMonthChange,
  onFilterYearChange,
  onFilterCategoryChange,
  onSearchChange,
  onReset
}: AdvancedFiltersProps) {
  const hasActiveFilters =
    filterMonth !== new Date().getMonth() ||
    filterYear !== new Date().getFullYear() ||
    filterCategory !== 'all' ||
    searchTerm !== '';

  return (
    <div
      className={`${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'
      } rounded-xl border p-4 space-y-4`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-indigo-600" />
          <h3
            className={`font-semibold ${
              darkMode ? 'text-white' : 'text-slate-900'
            }`}
          >
            Filtros Avançados
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            <X className="w-4 h-4" />
            Limpar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Month Filter */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-slate-700'
            }`}
          >
            Mês
          </label>
          <select
            value={filterMonth}
            onChange={(e) => onFilterMonthChange(Number(e.target.value))}
            className={`w-full px-3 py-2 rounded-lg border ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-slate-300 text-slate-900'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          >
            <option value={-1}>Todos os meses</option>
            {months.map((month, index) => (
              <option key={index} value={index}>
                {month}
              </option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-slate-700'
            }`}
          >
            Ano
          </label>
          <select
            value={filterYear}
            onChange={(e) => onFilterYearChange(Number(e.target.value))}
            className={`w-full px-3 py-2 rounded-lg border ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-slate-300 text-slate-900'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-slate-700'
            }`}
          >
            Categoria
          </label>
          <select
            value={filterCategory}
            onChange={(e) => onFilterCategoryChange(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-slate-300 text-slate-900'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          >
            <option value="all">Todas as categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${
              darkMode ? 'text-gray-300' : 'text-slate-700'
            }`}
          >
            Buscar
          </label>
          <input
            type="text"
            placeholder="Descrição ou categoria..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`w-full px-3 py-2 rounded-lg border ${
              darkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
        </div>
      </div>
    </div>
  );
}
