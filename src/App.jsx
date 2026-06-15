import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Coins, Wallet, History, UserCircle, Dices, AlertCircle, LogOut, CheckCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import BetTab from './components/BetTab';
import WalletTab from './components/WalletTab';
import HistoryTab from './components/HistoryTab';
import ProfileTab from './components/ProfileTab';
import Auth from './components/Auth'; 
import Admin from '../Admin'; 

// 🚨 တရုတ် Backend လင့်ခ်အသစ် ပြောင်းထားပါသည် 🚨
const SOCKET_URL = 'https://dice-cn-backend-production.up.railway.app'; 

function MainGame() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPhone, setUserPhone] = useState('');
  const [userName, setUserName] = useState('');
  const [socket, setSocket] = useState(null);
  
  const [balance, setBalance] = useState(0);
  const [displayDice, setDisplayDice] = useState({ d1: 1, d2: 1, total: 2 });
  const [isRollingUI, setIsRollingUI] = useState(false);
  
  // 🚨 Jackpot တန်ဖိုး သိမ်းရန် State အသစ် 🚨
  const [jackpotAmount, setJackpotAmount] = useState(100000); 
  
  const isRollingRef = useRef(false);
  const rollAudioRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState('bet');
  const [betHistory, setBetHistory] = useState([]);
  const [txHistory, setTxHistory] = useState([]);
  
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);
  
  const [winNotification, setWinNotification] = useState(null);
  const [errorToast, setErrorToast] = useState(null);
  const [successToast, setSuccessToast] = useState(null); 

  useEffect(() => {
    const token = localStorage.getItem('dice_token');
    const phone = localStorage.getItem('dice_phone');
    const name = localStorage.getItem('dice_username');
    if (token && phone) { setUserPhone(phone); setUserName(name || phone); setIsLoggedIn(true); }
  }, []);

  const fetchHistory = async () => {
    const phoneToUse = userPhone || localStorage.getItem('dice_phone');
    if (!phoneToUse) return;
    
    setIsFetchingHistory(true); 
    
    try {
      const resBets = await fetch(`${SOCKET_URL}/api/history/bets/${phoneToUse}?t=${Date.now()}`, { cache: 'no-store' });
      if (resBets.ok) setBetHistory(await resBets.json());
      
      const resTxs = await fetch(`${SOCKET_URL}/api/history/transactions/${phoneToUse}?t=${Date.now()}`, { cache: 'no-store' });
      if (resTxs.ok) setTxHistory(await resTxs.json());
    } catch (e) { 
      console.error(e); 
    } finally {
      setIsFetchingHistory(false); 
    }
  };

  useEffect(() => {
    if (isLoggedIn && (activeTab === 'history' || activeTab === 'wallet')) {
      fetchHistory();
    }
  }, [activeTab, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && userPhone) {
      const token = localStorage.getItem('dice_token');
      const newSocket = io(SOCKET_URL, { query: { token: token } }); 
      setSocket(newSocket);
      
      newSocket.on('balanceUpdate', (newBalance) => {
        if (!isRollingRef.current) setBalance(newBalance);
      });

      // 🚨 Socket ကနေ Jackpot Update လာရင် ဂဏန်းပြောင်းပေးမည် 🚨
      newSocket.on('jackpotUpdate', (amount) => {
        setJackpotAmount(amount);
      });
      
      newSocket.on('errorMsg', (msg) => { setErrorToast(msg); setTimeout(() => setErrorToast(null), 3000); setIsRollingUI(false); isRollingRef.current = false; });
      
      newSocket.on('txUpdate', (data) => {
        fetchHistory();
        if (data.status === 'approved') {
          // 🇨🇳 တရုတ်စာ ပြောင်းထားသည် (အတည်ပြုသည်)
          setSuccessToast(`${data.type === 'deposit' ? '充值' : '提现'} 请求已批准`);
          setTimeout(() => setSuccessToast(null), 3000);
        } else if (data.status === 'rejected') {
          // 🇨🇳 တရုတ်စာ ပြောင်းထားသည် (ပယ်ချသည်)
          setErrorToast(`${data.type === 'deposit' ? '充值' : '提现'} 请求被拒绝`);
          setTimeout(() => setErrorToast(null), 3000);
        }
      });
      
      newSocket.on('soloResult', (data) => {
        isRollingRef.current = false; 

        setTimeout(() => {
          setIsRollingUI(false);
          setDisplayDice({ d1: data.dice.dice1, d2: data.dice.dice2, total: data.dice.total });
          setBalance(data.newBalance); 
          
          if (rollAudioRef.current) {
            rollAudioRef.current.pause();
            rollAudioRef.current = null;
          }
          
          if (data.status === 'win') { 
            const winAudio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3');
            winAudio.play().catch(e => console.log("Win sound error:", e));
            
            setWinNotification(data.amountWon); 
            setTimeout(() => setWinNotification(null), 1000); 
          } else {
            const loseAudio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-losing-bleeps-2026.mp3');
            loseAudio.play().catch(e => console.log("Lose sound error:", e));
            
            // 🇨🇳 တရုတ်စာ ပြောင်းထားသည် (ကြိုးစားပါဦး)
            setErrorToast("再接再厉 😢");
            setTimeout(() => setErrorToast(null), 1500); 
          }
          fetchHistory();
        }, 800); 
      });

      fetchHistory(); 
      return () => newSocket.disconnect();
    }
  }, [isLoggedIn, userPhone]);

  useEffect(() => {
    let interval;
    if (isRollingUI) {
      interval = setInterval(() => { 
        if (isRollingRef.current) {
          setDisplayDice({ d1: Math.floor(Math.random() * 6) + 1, d2: Math.floor(Math.random() * 6) + 1, total: '?' }); 
        } else {
          clearInterval(interval);
        }
      }, 80);
    }
    return () => clearInterval(interval);
  }, [isRollingUI]);

  const handleLoginSuccess = (phone, username) => { setUserPhone(phone); setUserName(username); setIsLoggedIn(true); };
  const handleLogout = () => { localStorage.clear(); setIsLoggedIn(false); setSocket(null); setActiveTab('bet'); };
  
  const playSoloBet = (type, amount) => { 
    if (socket && amount > 0 && balance >= amount) { 
      
      try {
        const clickAudio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-mouse-click-close-1113.mp3');
        clickAudio.play().catch(e => console.log(e));

        const rollAudio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-dice-rolling-on-table-1975.mp3');
        rollAudio.loop = true; 
        rollAudio.play().catch(e => console.log(e));
        rollAudioRef.current = rollAudio; 
      } catch (soundErr) {
        console.log("Sound handling failed, skipping seamlessly:", soundErr);
      }

      setWinNotification(null); 
      setIsRollingUI(true); 
      isRollingRef.current = true; 
      setBalance(prev => prev - amount); 
      socket.emit('playSolo', { type, amount: Number(amount) }); 

      setTimeout(() => {
        if (isRollingRef.current) { 
          isRollingRef.current = false;
          setIsRollingUI(false);
          setDisplayDice({ d1: 1, d2: 1, total: 2 });
          
          if (rollAudioRef.current) {
            rollAudioRef.current.pause();
            rollAudioRef.current = null;
          }
          
          // 🇨🇳 တရုတ်စာ ပြောင်းထားသည် (အင်တာနက် ကြန့်ကြာသည်)
          setErrorToast("网络延迟，请检查连接。"); 
          setTimeout(() => setErrorToast(null), 3000);
          
          fetchHistory(); 
        }
      }, 6000); 

    } else {
      // 🇨🇳 တရုတ်စာ ပြောင်းထားသည် (Balance မလောက်ပါ)
      setErrorToast("余额不足"); setTimeout(() => setErrorToast(null), 2000);
    }
  };

  const handleDeposit = async (payload) => {
    try {
      const res = await fetch(`${SOCKET_URL}/api/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: userPhone, ...payload })
      });
      const data = await res.json();
      if (res.ok) {
        // 🇨🇳 တရုတ်စာ ပြောင်းထားသည် (ငွေသွင်းအောင်မြင်သည်)
        setSuccessToast("充值请求成功");
        setTimeout(() => setSuccessToast(null), 3000);
        fetchHistory();
      } else {
        setErrorToast(data.error || "错误"); setTimeout(() => setErrorToast(null), 3000);
      }
    } catch (e) { setErrorToast("服务器错误"); setTimeout(() => setErrorToast(null), 3000); }
  };

  const handleWithdraw = async (payload) => {
    try {
      const res = await fetch(`${SOCKET_URL}/api/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: userPhone, ...payload })
      });
      const data = await res.json();
      if (res.ok) {
        // 🇨🇳 တရုတ်စာ ပြောင်းထားသည် (ငွေထုတ်အောင်မြင်သည်)
        setSuccessToast("提现请求成功");
        setTimeout(() => setSuccessToast(null), 3000);
        fetchHistory();
      } else {
        setErrorToast(data.error || "错误"); setTimeout(() => setErrorToast(null), 3000);
      }
    } catch (e) { setErrorToast("服务器错误"); setTimeout(() => setErrorToast(null), 3000); }
  };

  if (!isLoggedIn) return <Auth onLoginSuccess={handleLoginSuccess} />;

  return (
    // 🎨 UI တွင် အနီရင့်ရောင် (Deep Red/Maroon) နှင့် ရွှေရောင် (Gold) အပြင်အဆင်ကို သုံးထားသည်
    <div className="min-h-screen bg-gradient-to-b from-[#4A0404] via-[#2A0000] to-black text-white font-sans pb-20 select-none relative">
      
      <AnimatePresence>
        {errorToast && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 20 }} exit={{ opacity: 0, y: -50 }} className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] bg-[#8B0000] border-2 border-red-500 text-white px-4 py-3 rounded-2xl shadow-[0_0_15px_rgba(255,0,0,0.5)]">
            <span className="font-bold">{errorToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {successToast && (
          <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 20 }} exit={{ opacity: 0, y: -50 }} className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] bg-green-800 border-2 border-[#00FF00] text-white px-4 py-3 rounded-2xl shadow-[0_0_15px_rgba(0,255,0,0.4)] flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-white" />
            <span className="font-bold text-sm">{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {winNotification && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.8, y: -20 }} 
            className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[60] bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#4A0404] px-6 py-2 rounded-2xl font-black border-2 border-white shadow-[0_0_20px_rgba(255,215,0,0.6)] pointer-events-none"
          >
            {/* 🇨🇳 ယွမ်သင်္ကေတ ပြောင်းထားသည် */}
            <span className="text-2xl drop-shadow-sm">+ ¥{winNotification.toLocaleString()}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header လေးကို တရုတ်ဆန်ဆန် ပြင်ထားသည် */}
      <header className="flex justify-between items-center p-4 border-b border-[#FFD700]/30 bg-[#2A0000]/60 shadow-md">
        {/* 🇨🇳 "富贵骰子" (Wealth Dice) လို့ နာမည်ပေးထားပါတယ် */}
        <h1 className="text-2xl font-black text-[#FFD700] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-wider">富貴</h1>
        <div className="flex items-center gap-2 bg-[#1A0000] px-4 py-1.5 rounded-full border border-[#FFD700]/60 shadow-[inset_0_0_8px_rgba(255,215,0,0.2)]">
          <Coins className="text-[#FFD700] w-5 h-5" />
          <span className="text-[#FFD700] font-bold tracking-wider">{balance.toLocaleString()}</span>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto">
        {/* 🚨 Jackpot Amount ကို BetTab ဆီ ပို့ပေးလိုက်ပါသည် 🚨 */}
        {activeTab === 'bet' && <BetTab isRollingUI={isRollingUI} displayDice={displayDice} playSoloBet={playSoloBet} jackpotAmount={jackpotAmount} />}
        {activeTab === 'wallet' && <WalletTab balance={balance} userId={userPhone} handleDeposit={handleDeposit} handleWithdraw={handleWithdraw} />}
        
        {activeTab === 'history' && (
          <HistoryTab 
            betHistory={betHistory} 
            txHistory={txHistory} 
            isLoading={isFetchingHistory} 
          />
        )}
        
        {activeTab === 'profile' && <ProfileTab userId={userPhone} userName={userName} onLogout={handleLogout} />}
      </main>

      {/* အောက်ခြေ Navigation Bar အရောင်ပြင်ထားသည် */}
      <nav className="fixed bottom-0 w-full bg-[#2A0000] border-t border-[#FFD700]/20 flex justify-around items-center p-2 z-50 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
        <button onClick={() => setActiveTab('bet')} className={`p-2 transition-all ${activeTab === 'bet' ? 'text-[#FFD700] scale-110 drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]' : 'text-gray-500'}`}><Dices/></button>
        <button onClick={() => setActiveTab('wallet')} className={`p-2 transition-all ${activeTab === 'wallet' ? 'text-[#FFD700] scale-110 drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]' : 'text-gray-500'}`}><Wallet/></button>
        <button onClick={() => setActiveTab('history')} className={`p-2 transition-all ${activeTab === 'history' ? 'text-[#FFD700] scale-110 drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]' : 'text-gray-500'}`}><History/></button>
        <button onClick={() => setActiveTab('profile')} className={`p-2 transition-all ${activeTab === 'profile' ? 'text-[#FFD700] scale-110 drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]' : 'text-gray-500'}`}><UserCircle/></button>
      </nav>
    </div>
  );
}

export default App;