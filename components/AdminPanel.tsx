
import React, { useState } from 'react';
import { AppConfig, User, UserRole } from '../types';

interface AdminPanelProps {
  config: AppConfig;
  onUpdateConfig: (config: AppConfig) => void;
  users: User[];
  onAddUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ config, onUpdateConfig, users, onAddUser, onDeleteUser }) => {
  const [sheetUrl, setSheetUrl] = useState(config.sheetUrl || '');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>(UserRole.ADMIN);

  const handleSaveConfig = () => {
    onUpdateConfig({ ...config, sheetUrl });
    alert('تم حفظ الإعدادات');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPassword) return;

    onAddUser({
      id: crypto.randomUUID(),
      name: newName,
      email: newEmail,
      password: newPassword,
      role: newRole
    });

    setNewName('');
    setNewEmail('');
    setNewPassword('');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Sheet Connection */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-[#0d1f18] mb-6 flex items-center gap-2">
           <span className="w-8 h-8 bg-[#c4f057] rounded-lg flex items-center justify-center text-sm">🔗</span>
           ربط البيانات
        </h2>
        
        <div className="space-y-4">
          <p className="text-gray-400 text-sm font-bold">رابط Google Script Web App</p>
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" 
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              className="flex-1 px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#c4f057] outline-none transition-all text-left"
              dir="ltr"
            />
            <button 
              onClick={handleSaveConfig}
              className="bg-[#0d1f18] text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-[#1a3328] transition-all"
            >
              حفظ
            </button>
          </div>
        </div>
      </div>

      {/* Users Management */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-[#0d1f18] mb-8 flex items-center gap-2">
           <span className="w-8 h-8 bg-[#c4f057] rounded-lg flex items-center justify-center text-sm">👥</span>
           إدارة الفريق
        </h2>
        
        <form onSubmit={handleAddUser} className="bg-gray-50 p-6 rounded-3xl mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="الاسم"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white border-none focus:ring-2 focus:ring-[#c4f057] outline-none"
            />
            <input
              type="email"
              placeholder="البريد"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white border-none focus:ring-2 focus:ring-[#c4f057] outline-none"
            />
            <input
              type="text"
              placeholder="كلمة السر"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="px-4 py-3 rounded-xl bg-white border-none focus:ring-2 focus:ring-[#c4f057] outline-none"
            />
            <button type="submit" className="bg-[#0d1f18] text-white py-3 rounded-xl font-bold hover:bg-[#1a3328]">
              إضافة +
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {users.map(user => (
            <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-[#0d1f18] border border-gray-100">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-[#0d1f18]">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                 <span className="text-xs font-bold bg-white px-3 py-1 rounded-lg border border-gray-100 text-gray-500">
                   {user.role}
                 </span>
                 <button onClick={() => onDeleteUser(user.id)} className="text-red-400 hover:text-red-600 font-bold text-xs">حذف</button>
              </div>
            </div>
          ))}
          {users.length === 0 && <p className="text-center text-gray-400">لا يوجد مستخدمين إضافيين</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
