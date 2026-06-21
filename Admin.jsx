import { useState, useEffect } from 'react';
import { LogOut, CheckCircle, XCircle, Users, Settings, Shield, Activity, CreditCard, Edit3, UserPlus, History, Trash2, ArrowDownCircle, ArrowUpCircle, BookOpen, Loader2 } from 'lucide-react';
import { io } from 'socket.io-client'; 

const API_URL = 'https://gambling-cn-backend-production.up.railway.app';

export default function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isFetchingData, setIsFetchingData] = useState(true);

  const [stats, setStats] = useState({ totalUsers: 0, pendingTxCount: 0, totalBets: 0, todayDeposit: 0, todayWithdraw: 0, weekDeposit: 0, weekWithdraw: 0 });
  const [txs, setTxs] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [sysSettings, setSysSettings] = useState({ kpay: '', wave: '', winRate: 42 }); 
  const [subAdmins, setSubAdmins] = useState([]);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyPhone, setHistoryPhone] = useState('');
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    const role = localStorage.getItem('admin_role');
    if (token) { setIsAdmin(true); setAdminRole(role || 'subadmin'); }
  }, []);

  const fetchAdminData = async () => {
    const token = localStorage.getItem('admin_token');
    const headers = { 'Authorization': `Bearer ${token}` };

    setIsFetchingData(true); 

    try {
      if (activeTab === 'dashboard') {
        const res = await fetch(`${API_URL}/dashboard`, { headers });
        if (res.ok) setStats(await res.json());
      } else if (activeTab === 'txs' || activeTab === 'history') {
        const res = await fetch(`${API_URL}/transactions`, { headers });
        const data = await res.json();
        setTxs(Array.isArray(data) ? data : []); 
      } else if (activeTab === 'users') {
        const res = await fetch(`${API_URL}/users`, { headers });
        const data = await res.json();
        setUsersList(Array.isArray(data) ? data : []);
      } else if (activeTab === 'settings') {
        const res = await fetch(`https://roll-dice-production.up.railway.app/api/settings`); 
        if (res.ok) setSysSettings(await res.json());
      } else if (activeTab === 'admins' && adminRole === 'superadmin') {
        const res = await fetch(`${API_URL}/subadmins`, { headers });
        setSubAdmins(Array.isArray(await res.json()) ? await res.json() : []);
      }
    } catch (e) { 
      console.error(e); 
    } finally {
      setIsFetchingData(false); 
    }
  };

  useEffect(() => { if (isAdmin) fetchAdminData(); }, [isAdmin, activeTab]);

  useEffect(() => {
    if (isAdmin) {
      const socket = io('https://roll-dice-production.up.railway.app');
      socket.on('newTransaction', () => { fetchAdminData(); });
      socket.on('userUpdate', () => { if (activeTab === 'users' || activeTab === 'dashboard') fetchAdminData(); });
      return () => socket.disconnect();
    }
  }, [isAdmin, activeTab]);

  const handleAdminLogin = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: usernameInput, password: passwordInput }) });
      const data = await res.json();
      if (res.ok) { localStorage.setItem('admin_token', data.token); localStorage.setItem('admin_role', data.role); setAdminRole(data.role); setIsAdmin(true); } else { alert(data.error); }
    } catch(e) { alert("Server Error"); } setLoading(false);
  };

  const handleTxAction = async (id, action) => {
    if(!window.confirm(`ဒီလုပ်ဆောင်ချက်ကို ${action} လုပ်မှာ သေချာလား?`)) return;
    const token = localStorage.getItem('admin_token');
    await fetch(`${API_URL}/transaction/action`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ transactionId: id, action }) });
    fetchAdminData();
  };

  const handleEditBalance = async (phone, currentBalance) => {
    if (!phone) return alert("ဖုန်းနံပါတ်မရှိပါ");
    // 🚨 Ks အစား ယွမ် သို့ ပြောင်းထားပါသည် 🚨
    const newBal = prompt(`ဖုန်း ${phone} ၏ လက်ရှိငွေ: ${currentBalance} ယွမ်\nပြင်ဆင်လိုသော ငွေပမာဏ (ကော်မာမပါဘဲ ရိုက်ပါ):`, currentBalance);
    if (newBal !== null && newBal !== "") {
      const parsedBal = Number(newBal.replace(/,/g, '').trim());
      if (isNaN(parsedBal)) return alert("❌ ဂဏန်းမှားယွင်းနေပါသည်။ (ဥပမာ - 10000) ဟုသာ ရိုက်ပါ။");

      const token = localStorage.getItem('admin_token');
      await fetch(`${API_URL}/users/update-balance`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
        body: JSON.stringify({ phone, newBalance: parsedBal }) 
      });
      fetchAdminData(); 
      alert("Balance ပြင်ဆင်မှု အောင်မြင်ပါသည်");
    }
  };

  // 🚨 Admin ကနေ User ရဲ့ Password ကို Reset ချပေးမည့် Function 🚨
  const handleResetPassword = async (phone) => {
    const newPassword = prompt(`ဖုန်းနံပါတ် ${phone} အတွက် Password အသစ်ကို ရိုက်ထည့်ပါ (အနည်းဆုံး ၆ လုံး):`);
    
    if (!newPassword) return; 
    if (newPassword.length < 6) return alert("Password သည် အနည်းဆုံး ၆ လုံး ရှိရပါမည်!");

    try {
      const token = localStorage.getItem('admin_token'); 
      const res = await fetch(`${API_URL}/users/reset-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ phone: phone, newPassword: newPassword })
      });
      
      const data = await res.json();
      if (res.ok) {
        alert(`✅ ${phone} ရဲ့ Password ကို အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ!`);
      } else {
        alert("❌ Error: " + data.error);
      }
    } catch (error) {
      alert("❌ Server နှင့် ချိတ်ဆက်၍ မရပါ!");
    }
  };

  const handleDeleteUser = async (id, phone) => {
    if (!window.confirm(`ဖုန်း ${phone} အကောင့်ကို အပြီးတိုင် ဖျက်မှာ သေချာလား?`)) return;
    const token = localStorage.getItem('admin_token');
    await fetch(`${API_URL}/users/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); fetchAdminData();
  };

  const handleUpdateSettings = async (e) => {
    e?.preventDefault(); const token = localStorage.getItem('admin_token');
    await fetch(`${API_URL}/settings`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(sysSettings) });
    alert("Settings ပြင်ဆင်ပြီးပါပြီ"); fetchAdminData(); 
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault(); const token = localStorage.getItem('admin_token');
    const res = await fetch(`${API_URL}/create-subadmin`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ username: e.target.newUsername.value, password: e.target.newPassword.value }) });
    const data = await res.json(); if(res.ok) { alert(data.message); e.target.reset(); fetchAdminData(); } else alert(data.error);
  };

  const handleViewHistory = async (phone) => {
    setHistoryPhone(phone); setShowHistoryModal(true); setLoadingHistory(true);
    try { const res = await fetch(`https://roll-dice-production.up.railway.app/api/history/bets/${phone}`); setHistoryData(await res.json() || []); } catch (e) { setHistoryData([]); }
    setLoadingHistory(false);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white">
        <form onSubmit={handleAdminLogin} className="w-full max-w-xs bg-gray-900 p-8 rounded-2xl border border-yellow-600/50 shadow-2xl">
          <div className="flex justify-center mb-4"><Shield className="w-12 h-12 text-yellow-500" /></div>
          <h2 className="text-yellow-500 font-black text-center text-xl mb-6 tracking-widest">ADMIN PANEL</h2>
          <input type="text" placeholder="Admin Username" onChange={(e) => setUsernameInput(e.target.value)} className="w-full bg-black/50 p-3 rounded-xl mb-3 text-yellow-400 border border-gray-700 outline-none" required />
          <input type="password" placeholder="Password" onChange={(e) => setPasswordInput(e.target.value)} className="w-full bg-black/50 p-3 rounded-xl mb-6 text-yellow-400 border border-gray-700 outline-none" required />
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-yellow-500 to-yellow-700 text-black p-3 font-black rounded-xl tracking-wider">{loading ? "Verifying..." : "ACCESS GRANTED"}</button>
        </form>
      </div>
    );
  }

  const LoadingSpinner = () => (
    <div className="flex flex-col justify-center items-center h-64 w-full">
      <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
      <p className="text-gray-400 mt-4 text-sm font-bold tracking-widest uppercase">Fetching Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row pb-20 md:pb-0 relative">
      
      {/* Sidebar */}
      <div className="md:w-64 bg-gray-950 border-r border-yellow-600/20 p-4 fixed bottom-0 w-full md:relative md:h-screen z-40 flex md:flex-col justify-around md:justify-start gap-2 overflow-x-auto">
        <div className="hidden md:block text-center mb-8">
          <Shield className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
          <h2 className="text-yellow-500 font-black tracking-widest">MASTER</h2>
          <p className="text-[10px] text-gray-500 uppercase">{adminRole}</p>
        </div>
        <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 p-3 rounded-xl font-bold text-sm transition-colors ${activeTab === 'dashboard' ? 'bg-yellow-500/10 text-yellow-400' : 'text-gray-400 hover:bg-gray-900'}`}><Activity className="w-5 h-5"/> <span className="hidden md:inline">Dashboard</span></button>
        <button onClick={() => setActiveTab('txs')} className={`flex items-center gap-2 p-3 rounded-xl font-bold text-sm transition-colors ${activeTab === 'txs' ? 'bg-yellow-500/10 text-yellow-400' : 'text-gray-400 hover:bg-gray-900'}`}><CreditCard className="w-5 h-5"/> <span className="hidden md:inline">Requests</span></button>
        <button onClick={() => setActiveTab('history')} className={`flex items-center gap-2 p-3 rounded-xl font-bold text-sm transition-colors ${activeTab === 'history' ? 'bg-yellow-500/10 text-yellow-400' : 'text-gray-400 hover:bg-gray-900'}`}><BookOpen className="w-5 h-5"/> <span className="hidden md:inline">TX History</span></button>
        <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 p-3 rounded-xl font-bold text-sm transition-colors ${activeTab === 'users' ? 'bg-yellow-500/10 text-yellow-400' : 'text-gray-400 hover:bg-gray-900'}`}><Users className="w-5 h-5"/> <span className="hidden md:inline">Users</span></button>
        <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-2 p-3 rounded-xl font-bold text-sm transition-colors ${activeTab === 'settings' ? 'bg-yellow-500/10 text-yellow-400' : 'text-gray-400 hover:bg-gray-900'}`}><Settings className="w-5 h-5"/> <span className="hidden md:inline">Settings</span></button>
        {adminRole === 'superadmin' && <button onClick={() => setActiveTab('admins')} className={`flex items-center gap-2 p-3 rounded-xl font-bold text-sm transition-colors ${activeTab === 'admins' ? 'bg-yellow-500/10 text-yellow-400' : 'text-gray-400 hover:bg-gray-900'}`}><Shield className="w-5 h-5"/> <span className="hidden md:inline">Sub-Admins</span></button>}
        <button onClick={() => { localStorage.removeItem('admin_token'); window.location.reload(); }} className="mt-auto flex items-center gap-2 p-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-950/30"><LogOut className="w-5 h-5"/> <span className="hidden md:inline">Logout</span></button>
      </div>

      <div className="flex-1 p-4 md:p-8 h-screen overflow-y-auto">
        
        {/* 1. DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 pb-10">
            <h2 className="text-2xl font-black text-white border-l-4 border-yellow-500 pl-3">SYSTEM OVERVIEW</h2>
            {isFetchingData ? <LoadingSpinner /> : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800"><p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Total Users</p><p className="text-3xl font-black text-blue-400">{stats.totalUsers || 0}</p></div>
                  <div className="bg-gray-900 p-6 rounded-2xl border border-yellow-600/30 relative"><div className="absolute top-0 right-0 p-3 opacity-20"><CreditCard className="w-10 h-10 text-yellow-500"/></div><p className="text-xs text-yellow-500/70 uppercase tracking-widest font-bold mb-1">Pending TX</p><p className="text-3xl font-black text-yellow-400">{stats.pendingTxCount || 0}</p></div>
                  <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 col-span-2 md:col-span-1"><p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Total Bets</p><p className="text-3xl font-black text-purple-400">{stats.totalBets || 0}</p></div>
                </div>

                <h3 className="text-lg font-bold text-gray-400 mt-8 border-b border-gray-800 pb-2">TODAY'S FINANCE</h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* 🚨 Ks အစား ယွမ် သို့ ပြောင်းထားပါသည် 🚨 */}
                  <div className="bg-green-950/30 p-5 rounded-2xl border border-green-900/50"><div className="flex items-center gap-2 mb-2"><ArrowDownCircle className="w-5 h-5 text-green-500"/><p className="text-xs text-green-500/80 uppercase font-bold">Today Deposit</p></div><p className="text-xl md:text-2xl font-black text-green-400">+ {stats.todayDeposit?.toLocaleString() || 0} ယွမ်</p></div>
                  <div className="bg-red-950/30 p-5 rounded-2xl border border-red-900/50"><div className="flex items-center gap-2 mb-2"><ArrowUpCircle className="w-5 h-5 text-red-500"/><p className="text-xs text-red-500/80 uppercase font-bold">Today Withdraw</p></div><p className="text-xl md:text-2xl font-black text-red-400">- {stats.todayWithdraw?.toLocaleString() || 0} ယွမ်</p></div>
                </div>

                <h3 className="text-lg font-bold text-gray-400 mt-8 border-b border-gray-800 pb-2">THIS WEEK'S FINANCE</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-950/30 p-5 rounded-2xl border border-blue-900/50">
                    <div className="flex items-center gap-2 mb-2"><ArrowDownCircle className="w-5 h-5 text-blue-500"/><p className="text-xs text-blue-500/80 uppercase font-bold">Week Deposit</p></div>
                    <p className="text-xl md:text-2xl font-black text-blue-400">+ {stats.weekDeposit?.toLocaleString() || 0} ယွမ်</p>
                  </div>
                  <div className="bg-orange-950/30 p-5 rounded-2xl border border-orange-900/50">
                    <div className="flex items-center gap-2 mb-2"><ArrowUpCircle className="w-5 h-5 text-orange-500"/><p className="text-xs text-orange-500/80 uppercase font-bold">Week Withdraw</p></div>
                    <p className="text-xl md:text-2xl font-black text-orange-400">- {stats.weekWithdraw?.toLocaleString() || 0} ယွမ်</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* 2. TRANSACTIONS (PENDING) */}
        {activeTab === 'txs' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white border-l-4 border-yellow-500 pl-3 mb-6">PENDING REQUESTS</h2>
            {isFetchingData ? <LoadingSpinner /> : (
              <>
                {!txs?.filter(t => t.status === 'pending').length ? <p className="text-gray-500 text-center mt-10">စောင့်ဆိုင်းနေသော စာရင်းမရှိပါ</p> : txs?.filter(t => t.status === 'pending').map(t => (
                  <div key={t._id} className="bg-gray-900 p-5 rounded-2xl border border-gray-700 flex flex-col md:flex-row gap-4 justify-between">
                    <div>
                      <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-md mb-2 inline-block ${t.type === 'deposit' ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>{t.type}</span>
                      <p className="text-lg font-bold text-gray-200">{t.username ? `${t.username} (${t.phone})` : t.phone}</p>
                      {/* 🚨 Ks အစား ယွမ် သို့ ပြောင်းထားပါသည် 🚨 */}
                      <p className="text-2xl font-black text-yellow-400">{t.amount?.toLocaleString()} ယွမ်</p>
                      {t.type === 'withdraw' && <div className="mt-2 text-sm text-gray-400 bg-black/40 p-3 rounded-lg"><p>To: <span className="text-white font-bold">{t.method?.toUpperCase()}</span> ({t.accountPhone})</p><p>Name: {t.accountName}</p></div>}
                    </div>
                    {t.screenshot && <div className="md:w-48"><img src={t.screenshot} alt="Receipt" className="w-full h-32 object-contain bg-black/50 rounded-lg border border-gray-700" /></div>}
                    <div className="flex gap-3 mt-4 md:mt-0">
                      <button onClick={() => handleTxAction(t._id, 'approve')} className="flex-1 md:flex-none flex items-center justify-center gap-1 bg-green-600/20 text-green-400 px-6 py-3 rounded-xl font-bold"><CheckCircle className="w-5 h-5"/> Approve</button>
                      <button onClick={() => handleTxAction(t._id, 'reject')} className="flex-1 md:flex-none flex items-center justify-center gap-1 bg-red-600/20 text-red-400 px-6 py-3 rounded-xl font-bold"><XCircle className="w-5 h-5"/> Reject</button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* 3. TX HISTORY */}
        {activeTab === 'history' && (
          <div>
            <h2 className="text-2xl font-black text-white border-l-4 border-yellow-500 pl-3 mb-6">TRANSACTION HISTORY</h2>
            {isFetchingData ? <LoadingSpinner /> : (
              <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-black/50 text-gray-400 uppercase text-[10px] font-bold">
                    <tr><th className="p-4">Date/Time</th><th className="p-4">User Details</th><th className="p-4">Type / Amount</th><th className="p-4 text-right">Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {txs?.filter(t => t.status !== 'pending').map(t => (
                      <tr key={t._id} className="hover:bg-gray-800/50">
                        <td className="p-4 text-gray-400 text-xs">{new Date(t.createdAt).toLocaleString()}</td>
                        <td className="p-4"><p className="font-bold text-white">{t.phone}</p><p className="text-xs text-gray-500">{t.username || 'N/A'}</p></td>
                        <td className="p-4">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded mr-2 ${t.type === 'deposit' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>{t.type}</span>
                          {/* 🚨 Ks အစား ယွမ် သို့ ပြောင်းထားပါသည် 🚨 */}
                          <span className="font-black text-gray-200">{t.amount?.toLocaleString()} ယွမ်</span>
                        </td>
                        <td className="p-4 text-right">
                          <span className={`text-xs font-bold ${t.status === 'approved' ? 'text-green-500' : 'text-red-500'}`}>{t.status.toUpperCase()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 4. USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-2xl font-black text-white border-l-4 border-yellow-500 pl-3 mb-6">USER MANAGEMENT</h2>
            {isFetchingData ? <LoadingSpinner /> : (
              <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-black/50 text-gray-400 uppercase text-xs font-bold"><tr><th className="p-4">Phone / User</th><th className="p-4">Current Balance</th><th className="p-4 text-right">Action</th></tr></thead>
                  <tbody className="divide-y divide-gray-800">
                    {usersList?.map(u => (
                      <tr key={u._id} className="hover:bg-gray-800/50">
                        <td className="p-4">
                          <p className="font-bold text-white">{u.phone || 'N/A'}</p>
                          <p className="text-xs text-gray-500">{u.username || 'No Name'}</p>
                        </td>
                        {/* 🚨 Ks အစား ယွမ် သို့ ပြောင်းထားပါသည် 🚨 */}
                        <td className="p-4 font-black text-yellow-400">{u.balance?.toLocaleString()} ယွမ်</td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2 flex-wrap">
                            <button onClick={() => handleViewHistory(u.phone)} className="inline-flex items-center gap-1 bg-yellow-900/40 text-yellow-400 px-3 py-1.5 rounded-lg text-xs font-bold"><History className="w-3 h-3" /> Info</button>
                            <button onClick={() => handleEditBalance(u.phone, u.balance)} className="inline-flex items-center gap-1 bg-blue-900/40 text-blue-400 px-3 py-1.5 rounded-lg text-xs font-bold"><Edit3 className="w-3 h-3" /> Edit</button>
                            {/* 🚨 Reset Password Button အသစ်ထည့်ထားပါသည် 🚨 */}
                            <button onClick={() => handleResetPassword(u.phone)} className="inline-flex items-center gap-1 bg-purple-900/40 text-purple-400 px-3 py-1.5 rounded-lg text-xs font-bold"><Shield className="w-3 h-3" /> Reset Pwd</button>
                            <button onClick={() => handleDeleteUser(u._id, u.phone)} className="inline-flex items-center gap-1 bg-red-900/40 text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold"><Trash2 className="w-3 h-3" /> Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 5. SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-md">
            <h2 className="text-2xl font-black text-white border-l-4 border-yellow-500 pl-3 mb-6">SYSTEM SETTINGS</h2>
            {isFetchingData ? <LoadingSpinner /> : (
              <form onSubmit={handleUpdateSettings} className="bg-gray-900 p-6 rounded-2xl border border-gray-800 space-y-6">
                <div className="bg-red-950/30 p-4 rounded-xl border border-red-900/50">
                  <label className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase mb-3"><span>Win Probability (RTP)</span><span className="text-lg text-yellow-500 font-black">{sysSettings.winRate || 42}%</span></label>
                  <input type="range" min="0" max="100" value={sysSettings.winRate || 42} onChange={(e) => setSysSettings({...sysSettings, winRate: e.target.value})} className="w-full accent-yellow-500" />
                  <button type="submit" className="w-full bg-yellow-500 text-black px-4 py-2 mt-4 rounded-lg text-xs font-black uppercase shadow-lg">Save RTP</button>
                </div>
                <div><label className="block text-xs font-bold text-gray-400 uppercase mb-2">Admin KPay</label><input type="number" value={sysSettings.kpay || ''} onChange={(e)=>setSysSettings({...sysSettings, kpay: e.target.value})} className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white" required /></div>
                <div><label className="block text-xs font-bold text-gray-400 uppercase mb-2">Admin WavePay</label><input type="number" value={sysSettings.wave || ''} onChange={(e)=>setSysSettings({...sysSettings, wave: e.target.value})} className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white" required /></div>
                <button type="submit" className="w-full bg-yellow-600 text-black font-black py-3 rounded-xl uppercase">Save All Settings</button>
              </form>
            )}
          </div>
        )}

        {/* 6. SUB-ADMINS */}
        {activeTab === 'admins' && adminRole === 'superadmin' && (
          <div>
            <h2 className="text-2xl font-black text-white border-l-4 border-yellow-500 pl-3 mb-6">SUB-ADMIN MANAGEMENT</h2>
            {isFetchingData ? <LoadingSpinner /> : (
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-400 mb-4">CREATE NEW</h3>
                  <form onSubmit={handleCreateAdmin} className="bg-gray-900 p-6 rounded-2xl border border-gray-800 space-y-4">
                    <input type="text" name="newUsername" placeholder="Username" className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white" required />
                    <input type="text" name="newPassword" placeholder="Password" className="w-full bg-black border border-gray-700 rounded-xl p-3 text-white" required />
                    <button type="submit" className="w-full bg-blue-600 text-white font-black py-3 rounded-xl">Create Account</button>
                  </form>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-400 mb-4">EXISTING ACCOUNTS</h3>
                  <div className="space-y-3">
                    {!subAdmins || subAdmins?.length === 0 ? <p className="text-gray-600">No sub-admins yet.</p> : subAdmins?.map(admin => (
                      <div key={admin._id} className="bg-black p-4 rounded-xl border border-gray-800 flex justify-between items-center"><div className="flex items-center gap-3"><div className="bg-gray-800 p-2 rounded-full"><Shield className="w-4 h-4 text-blue-400"/></div><p className="font-bold text-white">{admin.username}</p></div><span className="text-[10px] bg-blue-900/30 text-blue-400 px-2 py-1 rounded uppercase font-bold">{admin.role}</span></div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* History Modal Popup */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/50 rounded-t-2xl">
              <h3 className="text-lg font-black text-yellow-500 flex items-center gap-2"><History className="w-5 h-5"/> {historyPhone} ၏ မှတ်တမ်း</h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-red-500 hover:scale-110 transition-transform"><XCircle/></button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 space-y-2">
              {loadingHistory ? (
                <div className="flex flex-col justify-center items-center py-10">
                  <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
                </div>
              ) : historyData.length === 0 ? <p className="text-center text-gray-500 py-10">ဆော့ကစားထားသော မှတ်တမ်းမရှိပါ</p> : (
                historyData.map((bet, idx) => (
                  <div key={idx} className="bg-black p-3 rounded-xl flex justify-between items-center border border-gray-800">
                    <div>
                      <p className="text-[10px] text-gray-500 mb-1">{new Date(bet.createdAt).toLocaleString()}</p>
                      <p className="font-black uppercase text-sm text-gray-200">{bet.type === 'under' ? 'Under (အောက်)' : bet.type === 'over' ? 'Over (အထက်)' : bet.type?.startsWith('DT_') ? bet.type.split('_')[1] : 'Equal (ညီ)'}</p>
                    </div>
                    <div className="text-right">
                      {/* 🚨 Ks အစား ယွမ် သို့ ပြောင်းထားပါသည် 🚨 */}
                      <p className="text-sm font-bold text-gray-300">{bet.amount?.toLocaleString()} ယွမ်</p>
                      <p className={`text-xs font-black mt-1 ${bet.status === 'win' ? 'text-green-500' : 'text-red-500'}`}>{bet.status === 'win' ? `+ ${bet.amountWon?.toLocaleString()} ယွမ်` : 'Lose'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
