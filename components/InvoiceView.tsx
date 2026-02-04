import React from 'react';
import { Transaction } from '../types';

interface InvoiceViewProps {
  transaction: Transaction;
  onBack: () => void;
}

const InvoiceView: React.FC<InvoiceViewProps> = ({ transaction, onBack }) => {
  const total = transaction.amount * transaction.quantity;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 md:px-0 font-['Tajawal']">
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-8 no-print">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-[#0d1f18] font-bold bg-white px-4 py-2 rounded-xl shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
          العودة
        </button>
        <button 
          onClick={handlePrint}
          className="bg-[#0d1f18] text-[#c4f057] px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
        >
          طباعة / حفظ PDF
        </button>
      </div>

      <div className="max-w-[210mm] mx-auto bg-white shadow-2xl min-h-[297mm] p-12 md:p-16 relative overflow-hidden print:shadow-none print:p-8 rounded-sm">
        
        {/* Decorative Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-[#0d1f18]"></div>
        <div className="absolute top-4 right-12 w-24 h-4 bg-[#c4f057]"></div>

        <div className="flex justify-between items-start mb-20 mt-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#0d1f18] rounded-lg flex items-center justify-center text-[#c4f057] text-2xl font-black">S</div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#0d1f18]">Story</h1>
              <p className="text-xs uppercase text-gray-400 tracking-[0.3em] font-medium">Creative Studio</p>
            </div>
          </div>
          
          <div className="text-left">
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">INVOICE NO.</p>
            <p className="text-2xl font-mono font-bold text-[#0d1f18]">{transaction.invoiceNumber}</p>
            <p className="text-sm text-gray-500 mt-1">{transaction.date}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-16">
          <div>
            <p className="text-gray-400 text-xs uppercase tracking-wider mb-4 font-bold">Bill To (العميل)</p>
            <h2 className="text-2xl font-bold text-[#0d1f18] mb-2">{transaction.customerName || 'عميل عام'}</h2>
            <p className="text-gray-500 text-sm">تفاصيل المشروع والخدمات المقدمة</p>
          </div>
          <div className="text-left">
             <p className="text-gray-400 text-xs uppercase tracking-wider mb-4 font-bold">Status (الحالة)</p>
             <span className={`px-4 py-2 rounded-lg font-bold text-sm border-2 ${
               transaction.isPaid 
               ? 'border-[#0d1f18] text-[#0d1f18] bg-[#c4f057]' 
               : 'border-gray-200 text-gray-400'
             }`}>
               {transaction.isPaid ? 'PAID / مدفوع' : 'PENDING / معلق'}
             </span>
          </div>
        </div>

        <div className="mb-12">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b-2 border-[#0d1f18]">
                <th className="py-4 text-xs uppercase tracking-wider text-gray-500 font-bold w-12 text-center">#</th>
                <th className="py-4 text-xs uppercase tracking-wider text-gray-500 font-bold">الوصف (Item Description)</th>
                <th className="py-4 text-xs uppercase tracking-wider text-gray-500 font-bold text-center">السعر</th>
                <th className="py-4 text-xs uppercase tracking-wider text-gray-500 font-bold text-center">الكمية</th>
                <th className="py-4 text-xs uppercase tracking-wider text-gray-500 font-bold text-center">المجموع</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-6 text-center text-gray-400">01</td>
                <td className="py-6 font-bold text-[#0d1f18] text-lg">{transaction.description}</td>
                <td className="py-6 text-center text-gray-600">${transaction.amount.toLocaleString()}</td>
                <td className="py-6 text-center text-gray-600">{transaction.quantity}</td>
                <td className="py-6 text-center font-bold text-[#0d1f18]">${total.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mb-24">
          <div className="w-72">
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500 font-bold text-sm">Subtotal</span>
              <span className="font-bold text-[#0d1f18]">${total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-gray-500 font-bold text-sm">Tax (0%)</span>
              <span className="font-bold text-[#0d1f18]">$0.00</span>
            </div>
            <div className="flex justify-between py-4 mt-2">
              <span className="text-[#0d1f18] font-bold text-lg">Total</span>
              <span className="font-black text-3xl text-[#0d1f18]">${total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-[#f8f9fa] p-12 flex justify-between items-end">
          <div>
            <p className="font-bold text-[#0d1f18] mb-1">Story Creative Studio</p>
            <p className="text-gray-400 text-xs">www.story-studio.com</p>
          </div>
          <div className="text-right">
             <p className="text-gray-400 text-xs mb-2">Authorized Signature</p>
             <div className="h-px w-32 bg-[#0d1f18]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceView;