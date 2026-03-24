import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { TransactionWithCategory } from '../types/database';
import { Trash2, Calendar } from 'lucide-react';
import * as Icons from 'lucide-react';

interface TransactionListProps {
  transactions: TransactionWithCategory[];
  onTransactionDeleted: () => void;
}

export function TransactionList({ transactions, onTransactionDeleted }: TransactionListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return;

    setDeletingId(id);
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      onTransactionDeleted();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Erro ao excluir transação');
    } finally {
      setDeletingId(null);
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName.split('-').map((word: string) =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('')];
    return IconComponent || Icons.Circle;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 border border-slate-200 text-center">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Nenhuma transação</h3>
        <p className="text-slate-600">Adicione sua primeira transação para começar</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">Transações</h2>
      </div>
      <div className="divide-y divide-slate-200">
        {transactions.map((transaction) => {
          const Icon = transaction.category ? getIcon(transaction.category.icon) : Icons.Circle;
          return (
            <div
              key={transaction.id}
              className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-4 flex-1">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    transaction.type === 'income'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">
                    {transaction.description || transaction.category?.name || 'Sem descrição'}
                  </p>
                  <p className="text-sm text-slate-500">
                    {transaction.category?.name || 'Sem categoria'} • {formatDate(transaction.date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p
                  className={`text-lg font-bold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'} R$ {Number(transaction.amount).toFixed(2)}
                </p>
                <button
                  onClick={() => handleDelete(transaction.id)}
                  disabled={deletingId === transaction.id}
                  className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
