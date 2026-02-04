
import React from 'react';
import { Transaction, TransactionType, Currency } from '../types';

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onViewInvoice: (t: Transaction) => void;
  onEdit: (t: Transaction) => void;
  onTogglePaid: (id: string) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onDelete, onViewInvoice, onEdit, onTogglePaid }) => {
  const getCurrencySymbol = (c: Currency) => {
    switch(c) {
      case Currency.USD: return '$';
      case Currency.TRY: return '₺';
      case Currency.SYP: return 'ل.س';
      case Currency.SAR: return 'ر.س';
      default: return '$';
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in p-2">
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead className="bg-[#f8f9fa] text-gray-400">
            <tr>
              <th className="px-6 py-5 font-bold text-xs uppercase tracking-wider rounded-r-2xl">رقم الفاتورة</th>
              <th className="px-6 py-5 font-bold text-xs uppercase tracking-wider">العميل</th>
              <th className="px-6 py-5 font-bold text-xs uppercase tracking-wider">الوصف</th>
              <th className="px-6 py-5 font-bold text-xs uppercase tracking-wider">الحالة</th>
              <th className="px-6 py-5 font-bold text-xs uppercase tracking-wider">المبلغ</th>
              <th className="px-6 py-5 font-bold text-xs uppercase tracking-wider text-center rounded-l-2xl">أدوات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transactions.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50 transition-all group">
                <td className="px-6 py-5 font-mono text-xs text-gray-500">{t.invoiceNumber}</td>
                <td className="px-6 py-5 text-sm font-bold text-[#0d1f18]">{t.customerName || 'غير محدد'}</td>
                <td className="px-6 py-5 text-sm text-gray-600">{t.description}</td>
                <td className="px-6 py-5">
                  <button 
                    onClick={() => onTogglePaid(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      t.isPaid 
                      ? 'bg-[#c4f057]/20 text-[#0d1f18]' 
                      : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${t.isPaid ? 'bg-[#0d1f18]' : 'bg-gray-400'}`}></span>
                    {t.isPaid ? 'مدفوع' : 'معلق'}
                  </button>
                </td>
                <td className="px-6 py-5 font-bold text-sm" dir="ltr">
                  <span className={t.type === TransactionType.INCOME ? 'text-[#0d1f18]' : 'text-red-500'}>
                    {t.type === TransactionType.INCOME ? '+' : '-'} { (t.amount * t.quantity).toLocaleString() } {getCurrencySymbol(t.currency)}
                  </span>
                </td>
                <td className="px-6 py-5 text-center">
                  <div className="flex justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onViewInvoice(t)}
                      className="bg-[#0d1f18] text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#2a4538] transition-colors"
                      title="طباعة"
                    >
                      📄
                    </button>
                    <button 
                      onClick={() => onEdit(t)}
                      className="bg-[#c4f057] text-[#0d1f18] w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#b0d94e] transition-colors"
                      title="تعديل"
                    >
                      ✎
                    </button>
                    <button 
                      onClick={() => { if(confirm('حذف السجل؟')) onDelete(t.id) }}
                      className="bg-gray-100 text-gray-500 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && (
          <div className="text-center py-24">
            <p className="text-gray-300 font-bold text-lg">لا توجد معاملات</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionTable;
