import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, User, UserRole, AppConfig, ExchangeRates, Currency } from './types';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionTable from './components/TransactionTable';
import InvoiceView from './components/InvoiceView';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import ExchangeRatePanel from './components/ExchangeRatePanel';
import { GoogleGenAI } from "@google/genai";

// Endpoint API URL - Relative path assumes api.php is in the same folder as the built index.html
const API_URL = './api.php';

const App: React.FC = () => {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // App Data State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [config, setConfig] = useState<AppConfig>({
    sheetUrl: '',
    googleSheetId: '',
    lastSync: '',
    rates: { USD: 1, TRY: 32, SYP: 14000, SAR: 3.75 } 
  });

  // UI State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'add' | 'history' | 'admin' | 'rates'>('dashboard');
  const [selectedInvoice, setSelectedInvoice] = useState<Transaction | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [advice, setAdvice] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string>('');

  // Initialize Session
  useEffect(() => {
    const session = localStorage.getItem('story_session');
    if (session) setCurrentUser(JSON.parse(session));
  }, []);

  // ---------------------------------------------------------
  // 🌐 API INTEGRATION
  // ---------------------------------------------------------

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setApiError('');
      const response = await fetch(`${API_URL}?action=getData`);
      
      // Check if response is valid JSON, if not (e.g. PHP error), get text
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("API returned non-JSON:", text);
        setApiError('خطأ في الاتصال بقاعدة البيانات. يرجى التحقق من api.php');
        return;
      }

      if (data.error) {
        setApiError(data.error);
        return;
      }
      
      if (data.transactions) setTransactions(data.transactions);
      if (data.users) setUsers(data.users);
      if (data.config) setConfig(data.config);
      
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setApiError('فشل الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchAllData();
    }
  }, [currentUser]);

  // ---------------------------------------------------------
  // 📊 EXCEL (CSV) IMPORT / EXPORT (Client Side)
  // ---------------------------------------------------------

  const exportToCSV = () => {
    const BOM = "\uFEFF"; 
    const headers = ['ID', 'Invoice Number', 'Date', 'Type', 'Customer', 'Description', 'Amount', 'Quantity', 'Currency', 'Is Paid'];
    
    const rows = transactions.map(t => [
      t.id,
      t.invoiceNumber,
      t.date,
      t.type,
      `"${t.customerName || ''}"`,
      `"${t.description}"`,
      t.amount,
      t.quantity,
      t.currency,
      t.isPaid ? 'TRUE' : 'FALSE'
    ]);

    const csvContent = BOM + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Story_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split('\n');
      let count = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const cols = line.split(',').map(c => c.replace(/^"|"$/g, ''));
        
        if (cols.length >= 9) {
          const t: Transaction = {
            id: cols[0] || crypto.randomUUID(),
            invoiceNumber: cols[1] || `IMP-${i}`,
            date: cols[2] || new Date().toISOString().split('T')[0],
            type: cols[3] as TransactionType || TransactionType.INCOME,
            customerName: cols[4],
            description: cols[5],
            amount: parseFloat(cols[6]) || 0,
            quantity: parseFloat(cols[7]) || 1,
            currency: (cols[8] as Currency) || Currency.USD,
            isPaid: cols[9]?.toLowerCase() === 'true',
            exchangeRate: 1 
          };
          
          await fetch(`${API_URL}?action=saveTransaction`, {
            method: 'POST',
            body: JSON.stringify(t)
          });
          count++;
        }
      }
      alert(`تم استيراد ${count} معاملة بنجاح!`);
      fetchAllData();
    };
    reader.readAsText(file);
  };

  // ---------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('story_session', JSON.stringify(user));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('story_session');
  };

  const handleTransactionSubmit = async (data: any) => {
    const transactionData = {
      ...data,
      id: editingTransaction ? editingTransaction.id : crypto.randomUUID(),
      invoiceNumber: editingTransaction ? editingTransaction.invoiceNumber : `ST-${new Date().getFullYear()}${String(transactions.length + 1).padStart(4, '0')}`
    };

    try {
      await fetch(`${API_URL}?action=saveTransaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      });
      
      fetchAllData(); // Refresh data
      setEditingTransaction(null);
      setActiveTab('history');
    } catch (e) {
      alert('حدث خطأ أثناء الحفظ');
    }
  };

  const startEditTransaction = (t: Transaction) => {
    setEditingTransaction(t);
    setActiveTab('add');
  };

  const cancelEdit = () => {
    setEditingTransaction(null);
    setActiveTab('history');
  };

  const deleteTransaction = async (id: string) => {
    if (currentUser?.role === UserRole.VIEWER) {
      alert('ليس لديك صلاحية الحذف');
      return;
    }
    if (confirm('هل أنت متأكد من الحذف؟')) {
      try {
        await fetch(`${API_URL}?action=deleteTransaction&id=${id}`, { method: 'DELETE' });
        fetchAllData();
      } catch (e) {
        alert('فشل الحذف');
      }
    }
  };

  const togglePaidStatus = async (id: string) => {
    try {
      await fetch(`${API_URL}?action=togglePaid`, {
        method: 'POST',
        body: JSON.stringify({ id })
      });
      // Optimistic update
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, isPaid: !t.isPaid } : t));
    } catch (e) {
      console.error(e);
    }
  };

  const updateExchangeRates = async (newRates: ExchangeRates) => {
    try {
      await fetch(`${API_URL}?action=updateRates`, {
        method: 'POST',
        body: JSON.stringify(newRates)
      });
      setConfig(prev => ({ ...prev, rates: newRates }));
    } catch (e) {
      alert('فشل تحديث الأسعار');
    }
  };

  const handleAddUser = async (user: User) => {
    try {
      await fetch(`${API_URL}?action=addUser`, {
        method: 'POST',
        body: JSON.stringify(user)
      });
      fetchAllData();
    } catch (e) {
      alert('فشل إضافة المستخدم');
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await fetch(`${API_URL}?action=deleteUser&id=${id}`, { method: 'DELETE' });
      fetchAllData();
    } catch (e) {
      alert('فشل حذف المستخدم');
    }
  };

  const handleUpdateConfig = async (newConfig: AppConfig) => {
    try {
      await fetch(`${API_URL}?action=updateConfig`, {
        method: 'POST',
        body: JSON.stringify(newConfig)
      });
      setConfig(newConfig);
    } catch (e) {
      alert('فشل تحديث الإعدادات');
    }
  };

  // Stats Logic
  const getStats = () => {
    const calculateUSD = (t: Transaction) => {
      const rate = t.exchangeRate || 1; 
      return (t.amount * t.quantity) / rate;
    };

    const totalIncome = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + calculateUSD(t), 0);
      
    const totalExpense = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + calculateUSD(t), 0);
      
    const paidIncome = transactions
      .filter(t => t.type === TransactionType.INCOME && t.isPaid)
      .reduce((sum, t) => sum + calculateUSD(t), 0);
      
    const pendingIncome = transactions
      .filter(t => t.type === TransactionType.INCOME && !t.isPaid)
      .reduce((sum, t) => sum + calculateUSD(t), 0);

    return {
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
      paidIncome,
      pendingIncome
    };
  };

  const generateFinancialAdvice = async () => {
    const stats = getStats();
    if (!process.env.API_KEY) {
       setAdvice("الرجاء إضافة API_KEY للذكاء الاصطناعي");
       return;
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `بصفتك مستشار مالي، قدم نصيحة قصيرة جداً (سطرين) بناءً على: الدخل ${Math.round(stats.totalIncome)}$، المصاريف ${Math.round(stats.totalExpense)}$.`,
      });
      setAdvice(response.text || "لا يمكن الحصول على نصيحة حالياً.");
    } catch (error) {
      console.error("AI Error:", error);
      setAdvice("خدمة الذكاء الاصطناعي غير متاحة حالياً.");
    }
  };

  // Render Logic
  if (!currentUser) {
    return <Login onLogin={handleLogin} users={users} />;
  }

  if (selectedInvoice) {
    return <InvoiceView transaction={selectedInvoice} onBack={() => setSelectedInvoice(null)} />;
  }

  return (
    <div className="flex min-h-screen bg-[#f3f4f6] text-gray-800 font-['Tajawal']">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      
      <main className="flex-1 p-4 md:p-6 lg:p-8 transition-all duration-300 overflow-y-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0d1f18]">
              {activeTab === 'rates' ? 'إعدادات العملات' : 'لوحة التحكم'}
            </h1>
            <p className="text-gray-400 text-sm mt-1 flex items-center gap-2">
              أهلاً بك، {currentUser.name}
              <span className="text-xs bg-[#c4f057] text-[#0d1f18] px-2 py-1 rounded-full font-bold">Online / MySQL</span>
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {activeTab === 'dashboard' && (
              <button 
                onClick={generateFinancialAdvice}
                className="bg-white border border-gray-200 hover:border-[#c4f057] text-[#0d1f18] px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-all text-sm font-bold"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#0d1f18]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
                <span>تحليل AI</span>
              </button>
            )}
            <div className="w-10 h-10 rounded-full bg-[#0d1f18] text-[#c4f057] flex items-center justify-center font-bold">
              {currentUser.name.charAt(0)}
            </div>
          </div>
        </header>

        {loading && (
          <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-[100]">
             <div className="h-full bg-[#c4f057] animate-[pulse_1s_ease-in-out_infinite]"></div>
          </div>
        )}

        {apiError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm font-bold text-center" dir="rtl">
            ⚠️ {apiError}
          </div>
        )}

        {advice && activeTab === 'dashboard' && (
          <div className="mb-6 p-4 bg-[#0d1f18] text-white rounded-2xl animate-fade-in shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#c4f057]"></div>
            <h3 className="font-bold text-[#c4f057] mb-2 text-sm">مستشار Story الذكي:</h3>
            <p className="text-gray-200 text-sm leading-relaxed">{advice}</p>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <Dashboard stats={getStats()} transactions={transactions} />
        )}

        {activeTab === 'add' && (
          <div className="max-w-3xl mx-auto">
             {currentUser.role !== UserRole.VIEWER ? (
               <TransactionForm 
                onSubmit={handleTransactionSubmit} 
                initialData={editingTransaction}
                onCancel={editingTransaction ? cancelEdit : undefined}
                currentRates={config.rates}
              />
             ) : (
               <div className="text-center p-12 bg-white rounded-3xl shadow-sm">
                 <div className="text-4xl mb-4">🔒</div>
                 <p className="font-bold text-gray-500">وضع المشاهدة فقط</p>
               </div>
             )}
          </div>
        )}

        {activeTab === 'history' && (
          <TransactionTable 
            transactions={transactions} 
            onDelete={deleteTransaction} 
            onViewInvoice={setSelectedInvoice}
            onEdit={startEditTransaction}
            onTogglePaid={togglePaidStatus}
          />
        )}

        {activeTab === 'rates' && (
          <ExchangeRatePanel 
            currentRates={config.rates} 
            onUpdateRates={updateExchangeRates} 
          />
        )}

        {activeTab === 'admin' && currentUser.role === UserRole.SUPER_ADMIN && (
          <div className="space-y-6">
            <AdminPanel 
              config={config} 
              onUpdateConfig={handleUpdateConfig}
              users={users}
              onAddUser={handleAddUser}
              onDeleteUser={handleDeleteUser}
            />
            
            {/* EXCEL IMPORT/EXPORT SECTION */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 animate-fade-in">
              <h2 className="text-xl font-bold text-[#0d1f18] mb-6 flex items-center gap-2">
                <span className="w-8 h-8 bg-[#c4f057] rounded-lg flex items-center justify-center text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-[#0d1f18]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  </svg>
                </span>
                إدارة قاعدة البيانات (Excel)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <h3 className="font-bold text-[#0d1f18] mb-2">تصدير البيانات</h3>
                  <p className="text-gray-500 text-xs mb-4">تحميل نسخة من جميع المعاملات بصيغة Excel (CSV).</p>
                  <button 
                    onClick={exportToCSV}
                    className="w-full bg-[#0d1f18] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#1a3328] transition-all flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    تحميل ملف Excel
                  </button>
                </div>

                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                  <h3 className="font-bold text-[#0d1f18] mb-2">استيراد بيانات</h3>
                  <p className="text-gray-500 text-xs mb-4">رفع ملف Excel (CSV) لاستعادة البيانات.</p>
                  <label className="w-full bg-white border border-dashed border-gray-300 text-gray-500 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    اختر ملف CSV
                    <input type="file" accept=".csv" onChange={importFromCSV} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;