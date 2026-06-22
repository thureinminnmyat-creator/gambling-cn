import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Slots({ balance, socket }) {
  const [betAmount, setBetAmount] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  
  // 🚨 5x3 Grid အကွက်ကြီး (Pragmatic Play Style) 🚨
  const [reels, setReels] = useState([
    ['🍒', '💎', '7️⃣', '🐉', '🐼'],
    ['🐉', '👑', '🧧', '🍒', '🐯'], 
    ['🐼', '🐯', '🍒', '💎', '👑']
  ]);
  const [resultInfo, setResultInfo] = useState(null); 

  useEffect(() => {
    if(socket) {
      const handleResult = (data) => {
        setReels(data.reels);
        setIsSpinning(false);
        setResultInfo({ status: data.status, amount: data.amountWon });

        try {
          if (data.status === 'win') new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3').play().catch(()=>{});
          else new Audio('https://assets.mixkit.co/sfx/preview/mixkit-losing-bleeps-2026.mp3').play().catch(()=>{});
        } catch(e) {}

        setTimeout(() => setResultInfo(null), 3000);
      };
      socket.on('slotsResult', handleResult);
      return () => socket.off('slotsResult', handleResult);
    }
  }, [socket]);

  const handleSpin = () => {
    if (balance < betAmount) {
      setResultInfo({ status: 'error', msg: '余额不足！' });
      setTimeout(() => setResultInfo(null), 2500); return;
    }
    setIsSpinning(true); setResultInfo(null); 
    if (socket) socket.emit('playSlots', { amount: betAmount });
  };

  const spinSymbols = ['🐉', '🐯', '🐼', '👑', '💎', '🧧', '🍒', '7️⃣'];

  return (
    <div className="flex-1 flex flex-col p-4 space-y-6 max-w-md mx-auto w-full">
      {/* 🚨 Slot Machine Area (5x3 Grid) 🚨 */}
      <div className="bg-gradient-to-b from-[#1a0833] to-[#0d001a] border-[4px] border-[#FFD700] rounded-[2rem] p-4 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center">
        
        <AnimatePresence>
          {resultInfo && (
            <motion.div initial={{ opacity: 0, scale: 0.5, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: -30 }} className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-[2rem]">
              <div className={`px-6 py-5 rounded-3xl font-black text-center border-2 shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col items-center gap-2 max-w-[90%] ${resultInfo.status === 'win' ? 'bg-gradient-to-b from-[#FFD700] to-[#B8860B] text-[#4A0404] border-white shadow-yellow-500/50' : resultInfo.status === 'error' ? 'bg-gradient-to-b from-red-600 to-red-900 text-white border-red-400 shadow-red-500/50' : 'bg-gradient-to-b from-gray-800 to-black text-gray-300 border-gray-600'}`}>
                {resultInfo.status === 'win' ? <><span className="text-5xl animate-bounce">🎉</span><span className="text-xl tracking-widest">大奖 (BIG WIN)</span><span className="text-4xl drop-shadow-md">+ ¥{resultInfo.amount}</span></> : resultInfo.status === 'error' ? <><span className="text-4xl">⚠️</span><span className="text-sm">{resultInfo.msg}</span></> : <><span className="text-4xl">😢</span><span className="text-lg tracking-widest">再接再厉</span></>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🚨 Machine Panel 🚨 */}
        <div className="relative flex justify-center items-center gap-1.5 w-full bg-[#050011] p-3 rounded-2xl border-4 border-[#2a1b4d] shadow-[inset_0_0_30px_rgba(0,0,0,1)]">
          
          {/* အလယ်က နိုင်/ရှုံး လေဆာမျဉ်း (Payline) */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#00ffcc]/60 -translate-y-1/2 z-20 shadow-[0_0_15px_rgba(0,255,204,0.8)] pointer-events-none"></div>

          {/* 🚨 ကော်လံ ၅ ခု (5 Columns) 🚨 */}
          {[0, 1, 2, 3, 4].map(colIdx => (
            <div key={colIdx} className="flex flex-col flex-1 bg-gradient-to-b from-[#2a1b4d] via-[#1a0f33] to-[#2a1b4d] rounded-lg border border-[#4a2e8c] overflow-hidden relative h-[220px] shadow-[inset_0_10px_20px_rgba(0,0,0,0.8)]">
               
               {isSpinning ? (
                  // လည်နေချိန် Animation (တစ်တန်းနဲ့ တစ်တန်း အမြန်နှုန်း မတူအောင် လုပ်ထားသည်)
                  <motion.div
                    animate={{ y: [0, -400] }}
                    transition={{ repeat: Infinity, duration: 0.15 + (colIdx * 0.04), ease: "linear" }}
                    className="flex flex-col absolute top-0 w-full"
                  >
                     {[...spinSymbols, ...spinSymbols, ...spinSymbols].map((sym, i) => (
                        <div key={i} className="h-[73px] flex items-center justify-center text-3xl md:text-4xl blur-[2px]">{sym}</div>
                     ))}
                  </motion.div>
               ) : (
                  // မလည်ချိန် (ရလဒ်ပြနေချိန်)
                  <div className="flex flex-col h-full justify-around py-1">
                     {reels.map((row, rowIdx) => (
                        <div key={rowIdx} className={`flex items-center justify-center text-3xl md:text-4xl transition-all duration-300 ${rowIdx === 1 ? 'scale-110 drop-shadow-[0_0_15px_rgba(0,255,204,0.6)] z-10' : 'opacity-50 grayscale-[30%]'}`}>
                           {row[colIdx]}
                        </div>
                     ))}
                  </div>
               )}
            </div>
          ))}
        </div>
      </div>

      {/* 🚨 Amount Selector & Spin Button 🚨 */}
      <div className="bg-[#1A0000] p-5 rounded-3xl border border-[#FFD700]/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] mt-auto">
        <div className="flex justify-between items-center mb-4"><span className="text-xs font-bold text-gray-400 uppercase tracking-widest">下注金额 (BET)</span><span className="text-lg font-black text-[#FFD700] bg-[#FFD700]/10 px-4 py-1 rounded-full border border-[#FFD700]/30 shadow-inner">¥ {betAmount.toLocaleString()}</span></div>
        <div className="grid grid-cols-5 gap-2 mb-5">
          {[10, 50, 100, 500, 1000].map(amt => (
            <button key={amt} onClick={() => setBetAmount(amt)} className={`py-2.5 rounded-xl text-xs font-black transition-all ${betAmount === amt ? 'bg-gradient-to-b from-[#FFD700] to-[#FFA500] text-[#4A0404] scale-105 border border-white/50 shadow-[0_0_15px_rgba(255,215,0,0.5)]' : 'bg-black text-gray-400 border border-gray-800'}`}>{amt >= 1000 ? `${amt/1000}K` : amt}</button>
          ))}
        </div>
        <button onClick={handleSpin} disabled={isSpinning} className={`w-full py-5 rounded-2xl font-black text-2xl tracking-widest transition-all ${isSpinning ? 'bg-gray-900 text-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] text-[#4A0404] hover:scale-[1.02] active:scale-95 border border-white/50 shadow-[0_0_20px_rgba(255,215,0,0.4)]'}`}>
          {isSpinning ? <Loader2 className="animate-spin mx-auto w-8 h-8 text-[#4A0404]" /> : '旋转 (SPIN)'}
        </button>
      </div>
    </div>
  );
}
