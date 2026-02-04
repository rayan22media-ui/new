import React, { useState, useEffect } from 'react';
import { ExchangeRates } from '../types';

interface ExchangeRatePanelProps {
  currentRates: ExchangeRates;
  onUpdateRates: (rates: ExchangeRates) => void;
}

const ExchangeRatePanel: React.FC<ExchangeRatePanelProps> = ({ currentRates, onUpdateRates }) => {
  const [rates, setRates] = useState<ExchangeRates>(currentRates);

  useEffect(() => {
    setRates(currentRates);
  }, [currentRates]);

  const handleChange = (currency: keyof ExchangeRates, value: string) => {
    setRates(prev => ({
      ...prev,
      [currency]: parseFloat(value) || 0
    }));
  };

  const handleSave = () => {
    onUpdateRates(rates);
    alert('تم تحديث أسعار الصرف بنجاح');
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-[#0d1f18] rounded-2xl flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#0d1f18]">أسعار الصرف</h2>
            <p className="text-gray-400 text-sm">حدد قيمة العملات مقابل 1 دولار أمريكي ($)</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* USD (Read Only) */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200 opacity-70">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🇺🇸</span>
              <span className="font-bold text-[#0d1f18]">Dollar (USD)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-500">=</span>
              <input 
                type="number" 
                value="1" 
                disabled 
                className="w-24 px-4 py-2 rounded-xl bg-gray-200 text-center font-bold text-gray-600"
              />
            </div>
          </div>

          {/* SAR */}
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200 shadow-sm focus-within:border-[#c4f057] focus-within:ring-2 focus-within:ring-[#c4f057] transition-all">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🇸🇦</span>
              <span className="font-bold text-[#0d1f18]">Riyal (SAR)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-500">=</span>
              <input 
                type="number" 
                value={rates.SAR}
                onChange={(e) => handleChange('SAR', e.target.value)}
                className="w-32 px-4 py-2 rounded-xl bg-gray-50 text-center font-bold text-[#0d1f18] outline-none border border-gray-100 focus:bg-white"
              />
            </div>
          </div>

          {/* TRY */}
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200 shadow-sm focus-within:border-[#c4f057] focus-within:ring-2 focus-within:ring-[#c4f057] transition-all">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🇹🇷</span>
              <span className="font-bold text-[#0d1f18]">Lira (TRY)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-500">=</span>
              <input 
                type="number" 
                value={rates.TRY}
                onChange={(e) => handleChange('TRY', e.target.value)}
                className="w-32 px-4 py-2 rounded-xl bg-gray-50 text-center font-bold text-[#0d1f18] outline-none border border-gray-100 focus:bg-white"
              />
            </div>
          </div>

          {/* SYP */}
          <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200 shadow-sm focus-within:border-[#c4f057] focus-within:ring-2 focus-within:ring-[#c4f057] transition-all">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🇸🇾</span>
              <span className="font-bold text-[#0d1f18]">Lira (SYP)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-500">=</span>
              <input 
                type="number" 
                value={rates.SYP}
                onChange={(e) => handleChange('SYP', e.target.value)}
                className="w-32 px-4 py-2 rounded-xl bg-gray-50 text-center font-bold text-[#0d1f18] outline-none border border-gray-100 focus:bg-white"
              />
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-[#0d1f18] hover:bg-[#1a3328] text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-gray-200 transition-all mt-8 flex justify-center items-center gap-2"
        >
          <span>تحديث الأسعار</span>
        </button>
      </div>
    </div>
  );
};

export default ExchangeRatePanel;