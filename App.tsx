
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
    rates: { USD: 1, TRY: 32, SYP: 14000, SAR: 3.75 } // Defaults including SAR
  });

  // UI State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'add' | 'history' | 'admin' | 'rates'>('dashboard');
  const [selectedInvoice, setSelectedInvoice] = useState<Transaction | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [advice, setAdvice] = useState<string>("");

  // Initialize Data
  useEffect(() => {
    const session = localStorage.getItem('story_session');
    if (session) setCurrentUser(JSON.parse(session));

    const savedData = localStorage.getItem('story_accounting_data');
    if (savedData) setTransactions(JSON.parse(savedData));

    const savedUsers = localStorage.getItem('story_users');
    if (savedUsers) setUsers(JSON.parse(savedUsers));

    const savedConfig = localStorage.getItem('story_config');
    if (savedConfig) setConfig(JSON.parse(savedConfig));
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('story_accounting_data', JSON.stringify(transactions));
      localStorage.setItem('story_users', JSON.stringify(users));
      localStorage.setItem('story_config', JSON.stringify(config));
    }
  }, [transactions, users, config, currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('story_session', JSON.stringify(user));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('story_session');
  };

  const handleTransactionSubmit = (data: any) => {
    if (editingTransaction) {
      // Update existing
      setTransactions(transactions.map(t => 
        t.id === editingTransaction.id ? { ...t, ...data } : t
      ));
      setEditingTransaction(null);
      setActiveTab('history');
    } else {
      // Create new
      const newTransaction: Transaction = {
        ...data,
        id: crypto.randomUUID(),
        invoiceNumber: `ST-${new Date().getFullYear()}${String(transactions.length + 1).padStart(4, '0')}`
      };
      setTransactions([newTransaction, ...transactions]);
      setActiveTab('history');
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

  const deleteTransaction = (id: string) => {
    if (currentUser?.role === UserRole.VIEWER) {
      alert('ليس لديك صلاحية الحذف');
      return;
    }
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const togglePaidStatus = (id: string) => {
    setTransactions(transactions.map(t => 
      t.id === id ? { ...t, isPaid: !t.isPaid } : t
    ));
  };

  const updateExchangeRates = (newRates: ExchangeRates) => {
    setConfig({ ...config, rates: newRates });
  };

  // Convert everything to USD for Stats
  const getStats = () => {
    const calculateUSD = (t: Transaction) => {
      // Logic: Amount / Rate = USD (Assuming Rate is X Currency per 1 USD)
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
            <p className="text-gray-400 text-sm mt-1">أهلاً بك، {currentUser.name}</p>
          </div>
          
          <div className="flex items-center gap-3">
            {activeTab === 'dashboard' && (
              <button 
                onClick={generateFinancialAdvice}
                className="bg-white border border-gray-200 hover:border-[#c4f057] text-[#0d1f18] px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-all text-sm font-bold"
              >
                <span>✨</span>
                <span>تحليل AI</span>
              </button>
            )}
            <div className="w-10 h-10 rounded-full bg-[#0d1f18] text-[#c4f057] flex items-center justify-center font-bold">
              {currentUser.name.charAt(0)}
            </div>
          </div>
        </header>

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
          <AdminPanel 
            config={config} 
            onUpdateConfig={setConfig}
            users={users}
            onAddUser={(user) => setUsers([...users, user])}
            onDeleteUser={(id) => setUsers(users.filter(u => u.id !== id))}
          />
        )}
      </main>
    </div>
  );
};

export default App;
