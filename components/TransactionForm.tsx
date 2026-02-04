
import React, { useState, useEffect } from 'react';
import { TransactionType, Currency, Transaction, ExchangeRates } from '../types';

interface TransactionFormProps {
  onSubmit: (data: any) => void;
  initialData?: Transaction | null;
  onCancel?: () => void;
  currentRates: ExchangeRates;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, initialData, onCancel, currentRates }) => {
  const [type, setType] = useState<TransactionType>(TransactionType.INCOME);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [customerName, setCustomerName] = useState('');
  const [isPaid, setIsPaid] = useState<boolean>(true);
  const [currency, setCurrency] = useState<Currency>(Currency.USD);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setDescription(initialData.description);
      setAmount(initialData.amount.toString());
      setQuantity(initialData.quantity.toString());
      setCustomerName(initialData.customerName || '');
      setIsPaid(initialData.isPaid);
      setCurrency(initialData.currency || Currency.USD);
      setDate(initialData.date);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    
    onSubmit({
      type,
      description,
      amount: parseFloat(amount),
      quantity: parseInt(quantity),
      customerName,
      isPaid,
      currency,
      date,
      // If editing, keep original rate unless logic dictates otherwise. 
      // Here we use current rate for new, and keep old rate for edit unless we want to "Update to current rate"
      // Simpler approach: Always update to current rate if we are saving now.
      exchangeRate: currentRates[currency] 
    });

    if (!initialData) {
      setDescription('');
      setAmount('');
      setQuantity('1');
      setCustomerName('');
      setIsPaid(true);
    }
  };

  const getCurrencySymbol = (c: Currency) => {
    switch(c) {
      case Currency.USD: return '$';
      case Currency.TRY: return '₺';
      case Currency.SYP: return 'ل.س';
      case Currency.SAR: return 'ر.س';
    }
  };

  return (
    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 animate-slide-up">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-[#0d1f18]">
          {initialData ? 'تعديل المعاملة' : 'إضافة منتج / خدمة'}
        </h2>
        {initialData && onCancel && (
          <button onClick={onCancel} className="text-gray-400 hover:text-red-500 font-bold text-sm">
            إلغاء ✕
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type & Date */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl border border-gray-100 flex-1">
            <button
              type="button"
              onClick={() => setType(TransactionType.INCOME)}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                type === TransactionType.INCOME ? 'bg-[#0d1f18] text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              إيراد
            </button>
            <button
              type="button"
              onClick={() => setType(TransactionType.EXPENSE)}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                type === TransactionType.EXPENSE ? 'bg-red-500 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              مصروف
            </button>
          </div>
          <input 
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-5 py-3 rounded-xl bg-gray-50 border-none outline-none font-bold text-[#0d1f18]"
          />
        </div>

        {/* Currency Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.values(Currency).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCurrency(c)}
              className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                currency === c 
                  ? 'border-[#c4f057] bg-[#f7fee7] text-[#0d1f18]' 
                  : 'border-gray-100 bg-white text-gray-400'
              }`}
            >
              {c} ({getCurrencySymbol(c)})
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">العميل</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#c4f057] outline-none transition-all font-bold text-[#0d1f18]"
              placeholder="اسم العميل"
            />
          </div>
          <div className="space-y-2">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">الوصف</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#c4f057] outline-none transition-all font-bold text-[#0d1f18]"
              placeholder="شرح الخدمة"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">السعر ({getCurrencySymbol(currency)})</label>
            <input
              type="number"
              required
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#c4f057] outline-none transition-all font-bold text-[#0d1f18]"
              placeholder="0.00"
            />
          </div>
          <div className="space-y-2">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">الكمية</label>
            <input
              type="number"
              required
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#c4f057] outline-none transition-all font-bold text-[#0d1f18]"
            />
          </div>
        </div>

        <div 
          className={`flex items-center justify-between p-5 rounded-2xl cursor-pointer transition-all border-2 ${
            isPaid ? 'border-[#c4f057] bg-[#f7fee7]' : 'border-gray-100 bg-white'
          }`}
          onClick={() => setIsPaid(!isPaid)}
        >
          <div className="flex items-center gap-4">
             <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
               isPaid ? 'border-[#0d1f18] bg-[#0d1f18]' : 'border-gray-300'
             }`}>
               {isPaid && <span className="text-white text-xs">✓</span>}
             </div>
             <span className="font-bold text-[#0d1f18]">الحالة: {isPaid ? 'مدفوع (Paid)' : 'معلق (Pending)'}</span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#0d1f18] hover:bg-[#1a3328] text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-gray-200 transition-all mt-4 flex justify-center items-center gap-2 group"
        >
          <span>{initialData ? 'تحديث البيانات' : 'حفظ المعاملة'}</span>
          <span className="group-hover:translate-x-1 transition-transform">←</span>
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
