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
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
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
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h10.5M6.75 12h10.5m-10.5 5.25h10.5m-16.5-12h2.25a2.25 2.25 0 012.25 2.25V9a2.25 2.25 0 01-2.25 2.25H4.5A2.25 2.25 0 012.25 9V4.5A2.25 2.25 0 014.5 2.25h9a2.25 2.25 0 012.25 2.25V9a2.25 2.25 0 01-2.25 2.25H15M2.25 12v6.75a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25V12" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14.25v-4.5m0 0l-1.5 1.5m1.5-1.5l1.5 1.5" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => onEdit(t)}
                      className="bg-[#c4f057] text-[#0d1f18] w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#b0d94e] transition-colors"
                      title="تعديل"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => { if(confirm('حذف السجل؟')) onDelete(t.id) }}
                      className="bg-gray-100 text-gray-500 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
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