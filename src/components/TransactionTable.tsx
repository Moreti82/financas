import { Trash2, Edit2, Home, Car, Heart, Gamepad2, Utensils, ShoppingCart, Briefcase, Laptop, Gift, Wallet } from 'lucide-react';
import type { TransactionWithCategory } from '../types/database';

interface TransactionTableProps {
  transactions: TransactionWithCategory[];
  darkMode: boolean;
  onEdit: (transaction: TransactionWithCategory) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

const iconMap: Record<string, React.ReactNode> = {
  'home': <Home className="w-4 h-4" />,
  'car': <Car className="w-4 h-4" />,
  'heart': <Heart className="w-4 h-4" />,
  'gamepad-2': <Gamepad2 className="w-4 h-4" />,
  'utensils': <Utensils className="w-4 h-4" />,
  'shopping-cart': <ShoppingCart className="w-4 h-4" />,
  'briefcase': <Briefcase className="w-4 h-4" />,
  'laptop': <Laptop className="w-4 h-4" />,
  'gift': <Gift className="w-4 h-4" />,
};

export function TransactionTable({
  transactions,
  darkMode,
  onEdit,
  onDelete,
  isLoading = false
}: TransactionTableProps) {
  if (isLoading) {
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-8 text-center`}>
        <div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full mx-auto mb-4" />
        <p className={darkMode ? 'text-gray-400' : 'text-slate-600'}>
          Carregando transações...
        </p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-8 text-center`}>
        <p className={darkMode ? 'text-gray-400' : 'text-slate-600'}>
          Nenhuma transação encontrada.
        </p>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-slate-200'}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className={`${darkMode ? 'bg-gray-700' : 'bg-slate-50'} border-b ${darkMode ? 'border-gray-700' : 'border-slate-200'}`}>
              <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                Data
              </th>
              <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                Descrição
              </th>
              <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                Categoria
              </th>
              <th className={`px-6 py-3 text-left text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                Tipo
              </th>
              <th className={`px-6 py-3 text-right text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                Valor
              </th>
              <th className={`px-6 py-3 text-center text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className={`border-b ${
                  darkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-slate-200 hover:bg-slate-50'
                } transition-colors`}
              >
                <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-slate-900'}`}>
                  {new Date(transaction.date).toLocaleDateString('pt-BR')}
                </td>
                <td className={`px-6 py-4 text-sm ${darkMode ? 'text-gray-300' : 'text-slate-900'}`}>
                  {transaction.description || '—'}
                </td>
                <td className={`px-6 py-4 text-sm`}>
                  <div className="flex items-center gap-2">
                    {transaction.category && (
                      <>
                        <div className="text-indigo-600">
                          {iconMap[transaction.category.icon] || <Wallet className="w-4 h-4" />}
                        </div>
                        <span className={darkMode ? 'text-gray-300' : 'text-slate-900'}>
                          {transaction.category.name}
                        </span>
                      </>
                    )}
                  </div>
                </td>
                <td className={`px-6 py-4 text-sm`}>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      transaction.type === 'income'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                  </span>
                </td>
                <td className={`px-6 py-4 text-sm font-semibold text-right ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'} R$ {Number(transaction.amount).toFixed(2)}
                </td>
                <td className={`px-6 py-4 text-sm text-center`}>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(transaction)}
                      className={`p-2 rounded-lg transition-colors ${
                        darkMode
                          ? 'hover:bg-gray-600 text-gray-400 hover:text-white'
                          : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                      }`}
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(transaction.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        darkMode
                          ? 'hover:bg-red-900/20 text-red-400 hover:text-red-300'
                          : 'hover:bg-red-100 text-red-600 hover:text-red-700'
                      }`}
                      title="Deletar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
