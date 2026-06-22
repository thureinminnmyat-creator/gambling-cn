import React, { useState, useEffect } from 'react';
import { Loader2, Trophy, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DragonTiger({ balance, socket }) {
  const [betAmount, setBetAmount] = useState(10);
  const [selectedBet, setSelectedBet] = useState(''); 
  const [isDealing, setIsDealing] = useState(false);
  const [cards, setCards] = useState({ dragon: null, tiger: null });
  
  const [resultInfo, setResultInfo] = useState(null); 

  useEffect(() => {
    if(socket) {
      const handleResult = (data) => {
        
        // ဖဲလှန်တဲ့ အသံ
        try { new Audio('https://assets.mixkit.co/sfx/preview/mixkit-paper-slide-1530.mp3').play().catch(()=>{}); } catch(e){}

        // Animation အချိန်ကိုက်
        setTimeout(() => {
          setCards({ dragon: data.cards.dragonCard, tiger: data.cards.tigerCard });
          setIsDealing(false);
          setResultInfo({ status: data.status, amount: data.amountWon });

          try {
            if (data.status === 'win') {
              new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3').play().catch(()=>{});
            } else {
              new Audio('https://assets.mixkit.co/sfx/preview/mixkit-losing-bleeps-2026.mp3').play().catch(()=>{});
            }
          } catch(e) { console.log(e); }

          setTimeout(() => {
            setResultInfo(null);
            setCards({ dragon: null, tiger: null });
          }, 3500);
        }, 800); // ဖဲဝေပြီး 0.8 စက္ကန့်နေမှ လှန်မယ်
      };

      socket.on('dragonTigerResult', handleResult);
      return () => socket.off('dragonTigerResult', handleResult);
    }
  }, [socket]);

  const handleBet = () => {
    if (!selectedBet) {
      setResultInfo({ status: 'error', msg: '请选择下注区域！' });
      setTimeout(() => setResultInfo(null), 2000);
      return;
    }
    
    if (balance < betAmount) {
      setResultInfo({ status: 'error', msg: '余额不足！' });
      setTimeout(() => setResultInfo(null), 2000);
      return;
    }
    
    // ဖဲဝေတဲ့ အသံ
    try { new Audio('https://assets.mixkit.co/sfx/preview/mixkit-cards-shuffling-and-dealing-1828.mp3').play().catch(()=>{}); } catch(e){}

    setIsDealing(true);
    setCards({ dragon: null, tiger: null });
    setResultInfo(null); 
    
    if (socket) {
      socket.emit('playDragonTiger', { type: selectedBet, amount: betAmount });
    }
  };

  const getCardDisplay = (card, delay = 0) => {
    if (!card) return <div className="w-12 h-16 md:w-14 md:h-20 border border-dashed border-[#FFD700]/30 rounded bg-black/40 text-[#FFD700]/50 flex items-center justify-center font-black">?</div>;
    
    const isRed = card.suit === '♥' || card.suit === '♦';
    const valStr = card.value === 1 ? 'A' : card.value === 11 ? 'J' : card.value === 12 ? 'Q' : card.value === 13 ? 'K' : card.value;
    
    return (
      <motion.div 
        initial={{ y: -30, opacity: 0, rotateY: 180 }}
        animate={{ y: 0, opacity: 1, rotateY: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 12, delay }}
        className="w-12 h-16 md:w-14 md:h-20 bg-white rounded border border-gray-300 shadow-[0_10px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between p-1 relative overflow-hidden"
      >
        <span className={`text-sm md:text-base font-black leading-none ${isRed ? 'text-red-600' : 'text-black'}`}>{valStr}</span>
        <span className={`text-2xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 ${isRed ? 'text-red-600' : 'text-black'}`}>{card.suit}</span>
        <span className={`text-sm md:text-base font-black leading-none self-end rotate-180 ${isRed ? 'text-red-600' : 'text-black'}`}>{valStr}</span>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto w-full p-2 space-y-2 justify-between">
      
      {/* 🚨 Table UI (Compact Size) 🚨 */}
      <div className="relative flex-1 min-h-[140px] bg-gradient-to-b from-[#0a4b2a] to-[#042f18] border-4 border-[#FFD700] rounded-3xl p-2 shadow-lg overflow-hidden flex flex-col justify-end pb-4">
        
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
        <div className="absolute inset-1.5 border border-[#FFD700]/20 rounded-2xl pointer-events-none"></div>

        {/* 🚨 Floating Result Noti at the Top (Does not block cards) 🚨 */}
        <AnimatePresence>
          {resultInfo && resultInfo.status !== 'error' && (
            <motion.div 
              initial={{ opacity: 0, y: -10, x: '-50%' }} 
              animate={{ opacity: 1, y: 0, x: '-50%' }} 
              exit={{ opacity: 0, y: -10, x: '-50%' }} 
              className={`absolute top-2 left-1/2 z-50 px-4 py-1.5 rounded-xl font-black text-center border-2 shadow-xl flex items-center gap-2 w-max ${resultInfo.status === 'win' ? 'bg-gradient-to-r from-[#FFD700] to-[#B8860B] text-[#4A0404] border-white' : 'bg-gradient-to-r from-gray-800 to-black text-gray-300 border-gray-600'}`}
            >
              {resultInfo.status === 'win' ? (
                <><Trophy className="w-4 h-4"/> <span className="text-sm tracking-widest">赢了</span> <span className="text-lg">+ ¥{resultInfo.amount}</span></>
              ) : (
                <><span className="text-sm">😢</span> <span className="text-sm tracking-widest">再接再厉</span></>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {resultInfo && resultInfo.status === 'error' && (
           <motion.div initial={{ opacity: 0, y: -10, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0 }} className="absolute top-2 left-1/2 z-50 bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 w-max border border-white/50">
             <AlertTriangle className="w-3 h-3"/> {resultInfo.msg}
           </motion.div>
        )}

        <div className="flex justify-between items-end w-full max-w-xs mx-auto z-10 relative px-1">
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-red-500 font-black tracking-widest text-xs drop-shadow-md">龙</span>
            {isDealing ? (
               <div className="w-12 h-16 md:w-14 md:h-20 bg-red-950/80 rounded animate-pulse border border-red-500/50 shadow-inner"></div>
            ) : getCardDisplay(cards.dragon, 0.1)}
          </div>
          
          <div className="text-[#FFD700] font-black text-sm drop-shadow-md bg-black/40 w-7 h-7 flex items-center justify-center rounded-full border border-[#FFD700]/30 shadow-inner translate-y-1">VS</div>
          
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-blue-500 font-black tracking-widest text-xs drop-shadow-md">虎</span>
            {isDealing ? (
               <div className="w-12 h-16 md:w-14 md:h-20 bg-blue-950/80 rounded animate-pulse border border-blue-500/50 shadow-inner"></div>
            ) : getCardDisplay(cards.tiger, 0.3)}
          </div>
        </div>
      </div>

      {/* 🚨 Betting Options 🚨 */}
      <div className="grid grid-cols-3 gap-2 flex-shrink-0">
        <button onClick={() => setSelectedBet('dragon')} className={`relative p-2 rounded-xl border-2 overflow-hidden transition-all duration-300 ${selectedBet === 'dragon' ? 'border-red-500 scale-[1.02] shadow-[0_0_10px_rgba(239,68,68,0.5)] bg-[#2A0000]' : 'border-red-900/50 bg-[#1A0000]'}`}>
          <div className={`absolute inset-0 bg-gradient-to-b from-red-600/20 to-red-900/40 ${selectedBet === 'dragon' ? 'opacity-100' : 'opacity-0'}`}></div>
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-red-500 font-black text-lg mb-0.5 drop-shadow-md">龙</span>
            <span className="text-[8px] text-white bg-red-600/40 px-2 py-0.5 rounded-full border border-red-500/30">1 : 1</span>
          </div>
        </button>

        <button onClick={() => setSelectedBet('tie')} className={`relative p-2 rounded-xl border-2 overflow-hidden transition-all duration-300 ${selectedBet === 'tie' ? 'border-green-500 scale-[1.02] shadow-[0_0_10px_rgba(34,197,94,0.5)] bg-[#002A00]' : 'border-green-900/50 bg-[#001A00]'}`}>
          <div className={`absolute inset-0 bg-gradient-to-b from-green-600/20 to-green-900/40 ${selectedBet === 'tie' ? 'opacity-100' : 'opacity-0'}`}></div>
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-green-500 font-black text-lg mb-0.5 drop-shadow-md">和</span>
            <span className="text-[8px] text-white bg-green-600/40 px-2 py-0.5 rounded-full border border-green-500/30">1 : 8</span>
          </div>
        </button>

        <button onClick={() => setSelectedBet('tiger')} className={`relative p-2 rounded-xl border-2 overflow-hidden transition-all duration-300 ${selectedBet === 'tiger' ? 'border-blue-500 scale-[1.02] shadow-[0_0_10px_rgba(59,130,246,0.5)] bg-[#00002A]' : 'border-blue-900/50 bg-[#00001A]'}`}>
          <div className={`absolute inset-0 bg-gradient-to-b from-blue-600/20 to-blue-900/40 ${selectedBet === 'tiger' ? 'opacity-100' : 'opacity-0'}`}></div>
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-blue-500 font-black text-lg mb-0.5 drop-shadow-md">虎</span>
            <span className="text-[8px] text-white bg-blue-600/40 px-2 py-0.5 rounded-full border border-blue-500/30">1 : 1</span>
          </div>
        </button>
      </div>

      {/* 🚨 Bottom Controls (Compact) 🚨 */}
      <div className="bg-[#1A0000] p-2.5 rounded-xl border border-[#FFD700]/20 shadow-lg flex-shrink-0">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">下注金额</span>
          <span className="text-sm font-black text-[#FFD700] bg-[#FFD700]/10 px-2 py-0.5 rounded-full border border-[#FFD700]/30 shadow-inner">¥ {betAmount.toLocaleString()}</span>
        </div>
        
        <div className="grid grid-cols-5 gap-1.5 mb-2.5">
          {[10, 50, 100, 500, 1000].map(amt => (
            <button 
              key={amt} 
              onClick={() => setBetAmount(amt)} 
              className={`py-1.5 rounded-full text-[9px] font-black transition-all ${
                betAmount === amt 
                  ? 'bg-gradient-to-b from-[#FFD700] to-[#FFA500] text-[#4A0404] shadow-[0_0_8px_rgba(255,215,0,0.6)] scale-105 border border-white' 
                  : 'bg-black text-gray-400 border border-gray-700 hover:border-[#FFD700]/50'
              }`}
            >
              {amt >= 1000 ? `${amt/1000}K` : amt}
            </button>
          ))}
        </div>

        <button 
          onClick={handleBet} 
          disabled={isDealing} 
          className={`w-full py-2.5 rounded-lg font-black text-base tracking-widest transition-all ${
            isDealing 
              ? 'bg-gray-900 text-gray-600 cursor-not-allowed border border-gray-800' 
              : 'bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] text-[#4A0404] shadow-[0_0_10px_rgba(255,215,0,0.4)] hover:scale-[1.02] active:scale-95 border border-white/50'
          }`}
        >
          {isDealing ? <Loader2 className="animate-spin mx-auto w-5 h-5 text-[#4A0404]" /> : '确认下注'}
        </button>
      </div>
    </div>
  );
}
