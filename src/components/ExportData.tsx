import { Download, FileText, FileJson } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { TransactionWithCategory } from '../types/database';
import { useToast } from '../hooks/useToast';

interface ExportDataProps {
  transactions: TransactionWithCategory[];
  month: number;
  year: number;
  darkMode: boolean;
}

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function ExportData({
  transactions,
  month,
  year,
  darkMode
}: ExportDataProps) {
  const toast = useToast();

  const handleExportPDF = () => {
    if (transactions.length === 0) {
      toast.info('Vazio', 'Sem dados para exportar.');
      return;
    }

    try {
      const doc = new jsPDF();
      const themeColor: [number, number, number] = [79, 70, 229];
      
      // Header
      doc.setFillColor(themeColor[0], themeColor[1], themeColor[2]);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('FinançasPro - Relatório', 15, 25);
      
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 155, 30);

      // Info
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(14);
      doc.text(`Período: ${monthNames[month]} / ${year}`, 15, 55);

      // Totals
      doc.setDrawColor(230, 230, 230);
      doc.line(15, 70, 195, 70);

      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((s, t) => s + Number(t.amount), 0);
      const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((s, t) => s + Number(t.amount), 0);
      
      doc.setFontSize(12);
      doc.text(`Total Receitas: R$ ${income.toLocaleString('pt-BR')}`, 15, 80);
      doc.setTextColor(200, 0, 0);
      doc.text(`Total Despesas: R$ ${expense.toLocaleString('pt-BR')}`, 100, 80);
      doc.setTextColor(themeColor[0], themeColor[1], themeColor[2]);
      doc.text(`Saldo: R$ ${(income - expense).toLocaleString('pt-BR')}`, 15, 88);

      // Table
      const tableData = transactions.map(t => [
        new Date(t.date).toLocaleDateString('pt-BR'),
        t.description || t.category?.name || 'S/D',
        t.category?.name || 'S/C',
        t.type === 'income' ? 'Entrada' : 'Saída',
        `R$ ${Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      ]);

      autoTable(doc, {
        startY: 100,
        head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: themeColor, fontSize: 11, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 3 },
        alternateRowStyles: { fillColor: [245, 247, 250] }
      });

      doc.save(`relatorio_financas_${monthNames[month].toLowerCase()}_${year}.pdf`);
      toast.success('Sucesso!', 'Relatório PDF gerado e baixado.');
    } catch (err) {
      console.error(err);
      toast.error('Erro', 'Falha ao gerar PDF.');
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.info('Vazio', 'Sem dados para exportar.');
      return;
    }

    try {
      const headers = ['Data', 'Descricao', 'Categoria', 'Tipo', 'Valor'];
      const rows = transactions.map(t => [
        new Date(t.date).toLocaleDateString('pt-BR'),
        t.description || '',
        t.category?.name || 'Sem categoria',
        t.type === 'income' ? 'Receita' : 'Despesa',
        Number(t.amount).toFixed(2)
      ]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `financas_pro_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      toast.success('Pronto!', 'Exportação CSV realizada.');
    } catch (err) {
      console.error(err);
      toast.error('Erro', 'Falha ao exportar CSV.');
    }
  };

  const handleExportJSON = () => {
    if (transactions.length === 0) {
      toast.info('Vazio', 'Sem dados para exportar.');
      return;
    }

    try {
      const data = {
        exportDate: new Date().toISOString(),
        period: `${monthNames[month]}/${year}`,
        totalTransactions: transactions.length,
        transactions: transactions.map(t => ({
          id: t.id,
          date: t.date,
          description: t.description,
          category: t.category?.name,
          type: t.type,
          amount: Number(t.amount)
        }))
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `financas_pro_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      toast.success('Pronto!', 'Exportação JSON realizada.');
    } catch (err) {
      console.error(err);
      toast.error('Erro', 'Falha ao exportar JSON.');
    }
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-slate-200'} rounded-xl border p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          <Download className="w-5 h-5 text-indigo-600" />
          Exportar Dados
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={handleExportPDF}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all hover:shadow-lg"
        >
          <FileText className="w-4 h-4" />
          PDF
        </button>
        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg transition-all hover:shadow-lg"
        >
          <Download className="w-4 h-4" />
          CSV
        </button>
        <button
          onClick={handleExportJSON}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all hover:shadow-lg"
        >
          <FileJson className="w-4 h-4" />
          JSON
        </button>
      </div>
    </div>
  );
}
