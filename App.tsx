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

// Firebase Imports
import { db } from './src/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc, query, orderBy } from 'firebase/firestore';

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

  // Initialize Session
  useEffect(() => {
    const session = localStorage.getItem('story_session');
    if (session) setCurrentUser(JSON.parse(session));
  }, []);

  // ---------------------------------------------------------
  // 🔥 REAL-TIME DATABASE LISTENERS (FIREBASE)
  // ---------------------------------------------------------

  useEffect(() => {
    // 1. Listen to Transactions
    const q = query(collection(db, "transactions"), orderBy("date", "desc"));
    const unsubscribeTrans = onSnapshot(q, (snapshot) => {
      const transData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Transaction));
      setTransactions(transData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching transactions:", error);
      // Fallback if firebase fails (e.g. invalid config)
      setLoading(false);
    });

    // 2. Listen to Config (Rates, etc)
    const unsubscribeConfig = onSnapshot(doc(db, "app_data", "config"), (doc) => {
      if (doc.exists()) {
        setConfig(doc.data() as AppConfig);
      } else {
        // Initialize config if not exists
        setDoc(doc.ref, config);
      }
    });

    // 3. Listen to Users
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
      setUsers(usersData);
    });

    return () => {
      unsubscribeTrans();
      unsubscribeConfig();
      unsubscribeUsers();
    };
  }, []);

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
    try {
      if (editingTransaction) {
        // Update existing in Firestore
        const transRef = doc(db, "transactions", editingTransaction.id);
        await updateDoc(transRef, data);
        setEditingTransaction(null);
      } else {
        // Create new in Firestore
        // We let Firestore generate the ID, or we create a ref
        const newTransRef = doc(collection(db, "transactions"));
        const newTransaction: Transaction = {
          ...data,
          id: newTransRef.id, // Use Firestore ID
          invoiceNumber: `ST-${new Date().getFullYear()}${String(transactions.length + 1).padStart(4, '0')}`
        };
        await setDoc(newTransRef, newTransaction);
      }
      setActiveTab('history');
    } catch (e) {
      alert("حدث خطأ أثناء الحفظ. تأكد من إعدادات Firebase.");
      console.error(e);
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
    try {
      await deleteDoc(doc(db, "transactions", id));
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء الحذف");
    }
  };

  const togglePaidStatus = async (id: string) => {
    const t = transactions.find(tr => tr.id === id);
    if (t) {
      await updateDoc(doc(db, "transactions", id), {
        isPaid: !t.isPaid
      });
    }
  };

  const updateExchangeRates = async (newRates: ExchangeRates) => {
    // Update config in Firestore
    const newConfig = { ...config, rates: newRates };
    await setDoc(doc(db, "app_data", "config"), newConfig);
    // Config state will auto-update via listener
  };

  const handleAddUser = async (user: User) => {
    await setDoc(doc(db, "users", user.id), user);
  };

  const handleDeleteUser = async (id: string) => {
    await deleteDoc(doc(db, "users", id));
  };

  const handleUpdateConfig = async (newConfig: AppConfig) => {
    await setDoc(doc(db, "app_data", "config"), newConfig);
  };

  // Convert everything to USD for Stats
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
    // Safety check for API KEY
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
              {loading && <span className="text-xs text-[#c4f057] animate-pulse">جاري المزامنة...</span>}
            </p>
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

        {/* Firebase Config Warning if keys are missing */}
        {transactions.length === 0 && loading === false && (
             <div className="mb-6 p-4 bg-yellow-50 text-yellow-800 rounded-2xl border border-yellow-200 text-sm">
               تنبيه: إذا لم تظهر البيانات، تأكد من وضع إعدادات Firebase في ملف <code>src/firebase.ts</code>
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
            onUpdateConfig={handleUpdateConfig}
            users={users}
            onAddUser={handleAddUser}
            onDeleteUser={handleDeleteUser}
          />
        )}
      </main>
    </div>
  );
};

export default App;