
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  users: User[];
}

const Login: React.FC<LoginProps> = ({ onLogin, users }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      // 1. Check Super Admin Hardcoded Credentials
      if (email === 'admin@rayan2media.com' && password === '546884') {
        onLogin({
          id: 'super_admin_01',
          name: 'مدير النظام',
          email: email,
          role: UserRole.SUPER_ADMIN
        });
        setLoading(false);
        return;
      }

      // 2. Check Local Users
      const foundUser = users.find(u => u.email === email && u.password === password);
      if (foundUser) {
        onLogin(foundUser);
      } else {
        setError('بيانات الدخول غير صحيحة');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6] font-['Tajawal'] relative overflow-hidden" dir="rtl">
      {/* Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full bg-[#0d1f18] skew-y-12 origin-top-left -z-0 transform -translate-y-1/2"></div>
      
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden relative z-10 p-8 md:p-12">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-[#0d1f18] rounded-2xl flex items-center justify-center text-[#c4f057] text-4xl font-black mx-auto mb-6 shadow-xl">S</div>
          <h1 className="text-3xl font-bold text-[#0d1f18] mb-2">تسجيل الدخول</h1>
          <p className="text-gray-400 text-sm">Story Creative Studio Accounting</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm text-center border border-red-100 font-bold">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">البريد الإلكتروني</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#c4f057] outline-none transition-all text-left font-bold text-[#0d1f18]"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">كلمة المرور</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#c4f057] outline-none transition-all text-left font-bold text-[#0d1f18]"
              dir="ltr"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0d1f18] hover:bg-[#1a3328] text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-gray-300 transition-all disabled:opacity-70 flex justify-center items-center gap-2 mt-4"
          >
            {loading ? 'جاري التحقق...' : 'دخول النظام'}
            {!loading && <span>←</span>}
          </button>
        </form>
      </div>
      
      <div className="absolute bottom-8 text-center w-full text-xs text-gray-400 font-bold z-10">
        © 2024 Story Creative Studio
      </div>
    </div>
  );
};

export default Login;
