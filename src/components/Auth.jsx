import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserCircle, KeyRound, Phone, AlertCircle } from 'lucide-react';

const SOCKET_URL = 'https://gambling-cn-backend-production.up.railway.app'; // သင့် Railway URL

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/login' : '/api/signup';
    const payload = isLogin ? { phone, password } : { phone, username, password };

    try {
      const res = await fetch(`${SOCKET_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('dice_token', data.token);
        localStorage.setItem('dice_phone', data.phone);
        localStorage.setItem('dice_username', data.username);
        onLoginSuccess(data.phone, data.username);
      } else {
        setError(data.error);
      }
    } catch (err) {
      // 🇨🇳 တရုတ်စာ ပြောင်းထားသည် (Server ချိတ်ဆက်၍မရပါ)
      setError('无法连接到服务器'); 
    }
    setLoading(false);
  };

  return (
    // 🎨 UI တွင် အနီရင့်ရောင်နှင့် ရွှေရောင် အပြင်အဆင်ကို အသုံးပြုထားသည်
    <div className="min-h-screen bg-gradient-to-b from-[#4A0404] via-[#2A0000] to-black flex items-center justify-center p-4 select-none">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-sm bg-[#2A0000]/80 border border-[#FFD700]/40 p-6 rounded-3xl shadow-[0_0_30px_rgba(255,215,0,0.15)]"
      >
        <div className="text-center mb-8">
          {/* 🇨🇳 App နာမည်ကို မင်းပေးထားတဲ့ "富貴" အတိုင်း ထားပေးထားသည် */}
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFA500] tracking-widest uppercase mb-2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            富貴
          </h1>
          <p className="text-[#FFD700]/70 text-sm font-bold uppercase tracking-widest">
            {isLogin ? '登录您的账户' : '创建新账户'} 
          </p>
        </div>

        {error && (
          <div className="bg-[#8B0000]/50 border border-red-500/50 text-red-200 p-3 rounded-xl mb-4 flex items-center gap-2 text-sm font-bold shadow-[0_0_10px_rgba(255,0,0,0.2)]">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-[#1A0000] flex items-center px-4 py-3 rounded-xl border border-[#FFD700]/30 focus-within:border-[#FFD700] transition-colors shadow-inner">
            <Phone className="w-5 h-5 text-[#FFD700]/50 mr-3" />
            <input type="number" placeholder="手机号码" required value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-transparent w-full focus:outline-none text-[#FFD700] font-bold placeholder-[#FFD700]/30" />
          </div>

          {!isLogin && (
            <div className="bg-[#1A0000] flex items-center px-4 py-3 rounded-xl border border-[#FFD700]/30 focus-within:border-[#FFD700] transition-colors shadow-inner">
              <UserCircle className="w-5 h-5 text-[#FFD700]/50 mr-3" />
              <input type="text" placeholder="用户名" required value={username} onChange={(e) => setUsername(e.target.value)} className="bg-transparent w-full focus:outline-none text-[#FFD700] font-bold placeholder-[#FFD700]/30" />
            </div>
          )}

          <div className="bg-[#1A0000] flex items-center px-4 py-3 rounded-xl border border-[#FFD700]/30 focus-within:border-[#FFD700] transition-colors shadow-inner">
            <KeyRound className="w-5 h-5 text-[#FFD700]/50 mr-3" />
            <input type="password" placeholder="密码" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-transparent w-full focus:outline-none text-[#FFD700] font-bold placeholder-[#FFD700]/30" />
          </div>

          <button disabled={loading} type="submit" className="w-full py-4 bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00] text-[#4A0404] font-black text-lg rounded-xl shadow-[0_5px_15px_rgba(255,215,0,0.3)] active:scale-95 transition-all disabled:opacity-50 mt-4 uppercase tracking-widest border border-[#FFD700]">
            {loading ? '请稍候...' : (isLogin ? '登录' : '注册')}
          </button>
        </form>

        <div className="text-center mt-6">
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-sm font-bold text-[#FFD700]/80 hover:text-[#FFD700] transition-colors underline underline-offset-4 decoration-[#FFD700]/30">
            {isLogin ? "还没有账户？点击注册" : "已有账户？点击登录"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}