import { useState } from 'react';
import { UserCircle, Edit3, Save, KeyRound, LogOut, Send, ShieldAlert, Phone, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SOCKET_URL = 'https://roll-dice-production.up.railway.app'; 

export default function ProfileTab({ userId, userName, onLogout, onProfileUpdate, setErrorToast, setSuccessToast }) {
  // Edit Modes State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [editPhone, setEditPhone] = useState(userId);

  // Password States
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Profile သိမ်းမည့် Function
  const handleSaveProfile = async () => {
    if (!editName || !editPhone) return setErrorToast("请填写完整信息"); // အချက်အလက် အပြည့်အစုံ ဖြည့်ပါ
    setLoading(true);
    try {
      const res = await fetch(`${SOCKET_URL}/api/profile/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPhone: userId, newPhone: editPhone, newUsername: editName })
      });
      const data = await res.json();
      if (res.ok) {
        onProfileUpdate(data.phone, data.username);
        setIsEditingProfile(false);
      } else {
        setErrorToast(data.error);
      }
    } catch (e) { setErrorToast("无法连接到服务器"); } // ချိတ်ဆက်မှု အဆင်မပြေပါ
    setLoading(false);
  };

  // Password အသစ်ပြောင်းမည့် Function
  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return setErrorToast("请填写密码"); // Password များ ဖြည့်ပေးပါ
    setLoading(true);
    try {
      const res = await fetch(`${SOCKET_URL}/api/profile/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: userId, oldPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessToast("密码修改成功"); // Password ပြောင်းပြီးပါပြီ (data.message အစား တရုတ်လို တိုက်ရိုက်ပြမည်)
        setOldPassword(''); setNewPassword('');
        setIsChangingPw(false);
      } else {
        setErrorToast(data.error);
      }
    } catch (e) { setErrorToast("无法连接到服务器"); } // ချိတ်ဆက်မှု အဆင်မပြေပါ
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pb-10">
      
      {/* --- Profile Header Info --- */}
      <div className="text-center bg-gradient-to-b from-[#3A0000] to-[#1A0000] p-6 rounded-3xl border border-[#FFD700]/30 relative shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
        <UserCircle className="w-20 h-20 mx-auto text-[#FFD700] mb-3 opacity-90 drop-shadow-[0_0_15px_rgba(255,215,0,0.4)]" />
        <h2 className="text-xl font-black text-[#FFD700] tracking-wider">{userName}</h2>
        <p className="text-xs font-mono text-[#FFD700]/60 mt-1">手机号: {userId}</p> {/* Phone: */}
      </div>

      {/* --- Section 1: Edit Account Details --- */}
      <div className="bg-[#1A0000] p-5 rounded-2xl border border-[#FFD700]/20 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#FFD700]/70">账户详情</h3> {/* Account Details */}
          <button 
            onClick={() => { if(isEditingProfile) handleSaveProfile(); else setIsEditingProfile(true); }}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-bold bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/40 px-3 py-1.5 rounded-xl transition-all active:scale-95 shadow-[0_0_8px_rgba(255,215,0,0.2)]"
          >
            {isEditingProfile ? <><Save className="w-3.5 h-3.5" /> 保存</> : <><Edit3 className="w-3.5 h-3.5" /> 编辑</>}
          </button>
        </div>

        <div className="space-y-3">
          <div className="bg-[#2A0000] flex items-center px-4 py-3 rounded-xl border border-[#FFD700]/20 focus-within:border-[#FFD700]/50 transition-colors">
            <User className="w-4 h-4 text-[#FFD700]/50 mr-3" />
            <input type="text" value={editName} disabled={!isEditingProfile} onChange={(e) => setEditName(e.target.value)} className="bg-transparent w-full focus:outline-none text-[#FFD700] font-bold disabled:text-[#FFD700]/50 text-sm placeholder-[#FFD700]/30" placeholder="用户名" />
          </div>
          <div className="bg-[#2A0000] flex items-center px-4 py-3 rounded-xl border border-[#FFD700]/20 focus-within:border-[#FFD700]/50 transition-colors">
            <Phone className="w-4 h-4 text-[#FFD700]/50 mr-3" />
            <input type="number" value={editPhone} disabled={!isEditingProfile} onChange={(e) => setEditPhone(e.target.value)} className="bg-transparent w-full focus:outline-none text-[#FFD700] font-bold disabled:text-[#FFD700]/50 text-sm placeholder-[#FFD700]/30" placeholder="手机号码" />
          </div>
        </div>
      </div>

      {/* --- Section 2: Change Password Toggle Form --- */}
      <div className="bg-[#1A0000] p-5 rounded-2xl border border-[#FFD700]/20 shadow-lg">
        <button onClick={() => setIsChangingPw(!isChangingPw)} className="w-full flex justify-between items-center text-left">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#FFD700]" />
            <span className="text-sm font-bold text-[#FFD700]/90 tracking-widest">修改密码</span> {/* Change Password */}
          </div>
          <span className="text-xs font-bold text-[#FFD700]/60">{isChangingPw ? '关闭' : '展开'}</span> {/* Close / Open */}
        </button>

        <AnimatePresence>
          {isChangingPw && (
            <motion.form key="pw-form" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} onSubmit={handleSavePassword} className="space-y-3 mt-4 overflow-hidden pt-2">
              <input type="password" placeholder="请输入旧密码" required value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full bg-[#2A0000] border border-[#FFD700]/30 p-3 rounded-xl focus:outline-none focus:border-[#FFD700] text-[#FFD700] text-xs font-bold placeholder-[#FFD700]/40" />
              <input type="password" placeholder="请输入新密码" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-[#2A0000] border border-[#FFD700]/30 p-3 rounded-xl focus:outline-none focus:border-[#FFD700] text-[#FFD700] text-xs font-bold placeholder-[#FFD700]/40" />
              <button disabled={loading} type="submit" className="w-full py-3 bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF8C00] text-[#4A0404] font-black text-xs rounded-xl tracking-widest shadow-[0_0_15px_rgba(255,215,0,0.4)] active:scale-95 transition-transform border border-[#FFD700]">
                更新密码 {/* Update Password */}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      {/* --- Section 3: Telegram Admin Contact & Logout --- */}
      <div className="space-y-3 pt-2">
        {/* Telegram Link Button */}
        <a 
          href="https://t.me/Anser7777" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#0088cc] to-[#0077b5] hover:brightness-110 text-white font-black text-sm rounded-xl tracking-widest shadow-[0_4px_15px_rgba(0,136,204,0.4)] active:scale-95 transition-all border border-[#0088cc]/50"
        >
          <Send className="w-4 h-4 fill-white" /> 联系客服 (Telegram)
        </a>

        {/* Log Out Button */}
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#8B0000]/20 border border-red-500/40 text-red-400 hover:text-red-300 hover:bg-[#8B0000]/40 font-bold text-xs rounded-xl tracking-widest active:scale-95 transition-all shadow-inner"
        >
          <LogOut className="w-4 h-4" /> 退出登录 {/* Log Out */}
        </button>
      </div>

    </motion.div>
  );
}