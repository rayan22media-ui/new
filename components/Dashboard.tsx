
import React from 'react';
import { FinancialStats, Transaction, TransactionType } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  stats: FinancialStats;
  transactions: Transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ stats, transactions }) => {
  const chartData = [
    { name: 'دخل', value: stats.totalIncome },
    { name: 'مصروف', value: stats.totalExpense },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dark Primary Card */}
        <div className="bg-[#0d1f18] p-8 rounded-[2rem] shadow-xl relative overflow-hidden md:col-span-1 text-white flex flex-col justify-between min-h-[220px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#c4f057] opacity-10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#c4f057] animate-pulse"></div>
              <p className="text-[#c4f057] text-sm font-bold tracking-wide uppercase">صافي الأرباح (USD)</p>
            </div>
            <h2 className="text-5xl font-bold mb-2 tracking-tight">${stats.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h2>
            <p className="text-gray-400 text-xs mt-2">يتم تحويل جميع العملات للدولار حسب سعر الصرف</p>
          </div>
          <button className="bg-[#c4f057] hover:bg-[#b0d94e] text-[#0d1f18] py-3 px-6 rounded-xl font-bold text-sm transition-all mt-6 w-fit shadow-[0_0_15px_rgba(196,240,87,0.2)]">
            عرض التفاصيل
          </button>
        </div>

        {/* Secondary Stats */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
           <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-center">
             <div className="flex justify-between items-start mb-4">
               <div>
                 <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">إجمالي الدخل (USD)</p>
                 <h3 className="text-3xl font-bold text-[#0d1f18]">${stats.totalIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
               </div>
               <div className="p-3 bg-gray-50 rounded-full text-gray-400">↓</div>
             </div>
             <div className="flex gap-2 mt-2">
                <span className="text-xs font-bold bg-[#c4f057]/20 text-[#0d1f18] px-2 py-1 rounded-lg">
                  ${(stats.paidIncome || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })} محصل
                </span>
             </div>
           </div>

           <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-center">
             <div className="flex justify-between items-start mb-4">
               <div>
                 <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">إجمالي المصروفات (USD)</p>
                 <h3 className="text-3xl font-bold text-[#0d1f18]">${stats.totalExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
               </div>
               <div className="p-3 bg-gray-50 rounded-full text-gray-400">↑</div>
             </div>
             <div className="w-full bg-gray-100 h-2 rounded-full mt-2 overflow-hidden">
               <div className="bg-[#0d1f18] h-full rounded-full" style={{ width: `${Math.min(((stats.totalExpense / (stats.totalIncome || 1)) * 100), 100)}%` }}></div>
             </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions List */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
             <h3 className="font-bold text-xl text-[#0d1f18]">آخر المعاملات</h3>
             <button className="text-gray-400 hover:text-[#0d1f18] text-sm font-bold">عرض الكل</button>
          </div>
          
          <div className="space-y-4">
            {transactions.slice(0, 5).map((t) => (
              <div key={t.id} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-colors ${
                    t.type === TransactionType.INCOME 
                    ? 'bg-[#c4f057]/20 text-[#0d1f18]' 
                    : 'bg-gray-100 text-gray-400'
                  }`}>
                    {t.type === TransactionType.INCOME ? '↙' : '↗'}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0d1f18] text-sm">{t.description}</h4>
                    <p className="text-xs text-gray-400 mt-1">{t.date}</p>
                  </div>
                </div>
                <div className="text-right">
                   <p className={`font-bold text-sm ${t.type === TransactionType.INCOME ? 'text-[#0d1f18]' : 'text-gray-400'}`}>
                     {t.type === TransactionType.INCOME ? '+' : '-'}{ (t.amount * t.quantity).toLocaleString() } {t.currency || '$'}
                   </p>
                   <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                     t.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                   }`}>
                     {t.isPaid ? 'Completed' : 'Pending'}
                   </span>
                </div>
              </div>
            ))}
            {transactions.length === 0 && <p className="text-gray-400 text-center py-4">لا توجد بيانات</p>}
          </div>
        </div>

        {/* Small Chart */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col">
           <h3 className="font-bold text-xl text-[#0d1f18] mb-8">الملخص المالي</h3>
           <div className="flex-1 min-h-[200px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData}>
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                 <Tooltip 
                    cursor={{fill: '#f3f4f6', radius: 8}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                 />
                 <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={40}>
                   {chartData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={index === 0 ? '#0d1f18' : '#c4f057'} />
                   ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
           <div className="mt-6 text-center">
             <p className="text-gray-400 text-xs">مقارنة بين الدخل والمصاريف (محولة للدولار)</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
