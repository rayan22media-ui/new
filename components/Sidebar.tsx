
import React from 'react';
import { User, UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  currentUser: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, currentUser, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: '📊' },
    { id: 'add', label: 'معاملة جديدة', icon: '⚡' },
    { id: 'history', label: 'السجل المالي', icon: '📁' },
  ];

  if (currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.ADMIN) {
    menuItems.push({ id: 'rates', label: 'أسعار الصرف', icon: '💱' });
  }

  if (currentUser.role === UserRole.SUPER_ADMIN) {
    menuItems.push({ id: 'admin', label: 'الإعدادات', icon: '⚙️' });
  }

  return (
    <aside className="w-20 md:w-64 bg-[#0d1f18] h-screen sticky top-0 flex flex-col shadow-2xl no-print z-50">
      <div className="p-8 flex items-center gap-3">
        <div className="w-8 h-8 bg-[#c4f057] rounded-lg flex items-center justify-center text-[#0d1f18] font-black text-lg">S</div>
        <span className="hidden md:block text-xl font-bold text-white tracking-wide">Story</span>
      </div>

      <div className="px-6 mb-6 hidden md:block">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">القائمة الرئيسية</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group ${
              activeTab === item.id 
                ? 'bg-[#c4f057] text-[#0d1f18] shadow-[0_0_15px_rgba(196,240,87,0.3)]' 
                : 'text-gray-400 hover:bg-[#1a3328] hover:text-white'
            }`}
          >
            <span className={`text-lg ${activeTab === item.id ? 'text-[#0d1f18]' : 'text-gray-400 group-hover:text-white'}`}>{item.icon}</span>
            <span className="hidden md:block font-bold text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-[#1a3328] rounded-2xl p-4 mb-2 hidden md:block border border-[#2a4538]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#c4f057] flex items-center justify-center text-[10px] font-bold">
              {currentUser.name.substring(0,2)}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-bold truncate">{currentUser.name}</p>
              <p className="text-[#c4f057] text-[10px] truncate">{currentUser.email}</p>
            </div>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full text-gray-400 hover:text-white hover:bg-[#1a3328] py-3 rounded-2xl transition-colors font-bold flex items-center justify-center gap-2 text-sm"
        >
          <span>🚪</span> <span className="hidden md:inline">تسجيل خروج</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
