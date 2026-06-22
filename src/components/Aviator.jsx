import React, { useState, useEffect } from 'react';
import { Loader2, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Aviator({ balance, socket }) {
  const [betAmount, setBetAmount] = useState(10);
  const [targetMultiplier, setTargetMultiplier] = useState(2.0);
  const [isFlying, setIsFlying] = useState(false);
  const [currentM, setCurrentM] = useState(1.00);
  const [resultInfo, setResultInfo] = useState(null);

  useEffect(() => {
    if(socket) {
      const handleResult = (data) => {
        // အဖြေရပြီဆိုတာနဲ့ ဒုံးပျံတက်တဲ့ Animation လေး လုပ်ပေးမည်
        let val = 1.00;
        const target = data.crashPoint;
        const interval = setInterval(() => {
          val += 0.05;
          if (val >= target) {
            clearInterval(interval);
            setCurrentM(target);
            setIsFlying(false);
            setResultInfo({ status: data.status, amount: data.amountWon, crash: target });

            try {
              if (data.status === 'win') new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3').play().catch(()=>{});
              else new Audio('https://assets.mixkit.co/sfx/preview/mixkit-losing-bleeps-2026.mp3').play().catch(()=>{});
            } catch(e) {}

            setTimeout(() => setResultInfo(null), 3000);
          } else {
            setCurrentM(val);
          }
        }, 50);
      };
      
      socket.on('aviatorResult', handleResult);
      return () => socket.off('aviatorResult', handleResult);
    }
  }, [socket]);

  const handleBet = () => {
    if (balance < betAmount) {
      setResultInfo({ status: 'error', msg: '余额不足！' });
      setTimeout(() => setResultInfo(null), 2500); return;
    }
    setIsFlying(true); setResultInfo(null); setCurrentM(1.00);
    if (socket) socket.emit('playAviator', { amount: betAmount, target: targetMultiplier });
  };

  return (
    <div className="flex-1 flex flex-col p-4 space-y-6 max-w-md mx-auto w-full">
      {/* Aviator Screen Area */}
      <div className="bg-[#0f1923] border-4 border-gray-700 rounded-[2.5rem] p-6 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center h-64">
        
        {/* Background Grid Elements for Tech Feel */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

        <AnimatePresence>
          {resultInfo && resultInfo.status !== 'error' && (
            <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[2px] rounded-[2.5rem]">
              <div className={`px-6 py-5 rounded-3xl font-black text-center border-2 shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col items-center gap-2 max-w-[85%] ${resultInfo.status === 'win' ? 'bg-gradient-to-b from-[#FFD700] to-[#B8860B] text-[#4A0404] border-white shadow-yellow-500/50' : 'bg-gradient-to-b from-red-600 to-red-900 text-white border-red-400 shadow-red-500/50'}`}>
                {resultInfo.status === 'win' ? <><span className="text-4xl">🎉</span><span className="text-xl tracking-widest">飞越成功</span><span className="text-3xl">+ ¥{resultInfo.amount}</span></> : <><span className="text-4xl">💥</span><span className="text-xl tracking-widest">飞船坠毁</span><span className="text-sm">于 {resultInfo.crash}x 坠毁</span></>}
              </div>
            </motion.div>
          )}

          {resultInfo && resultInfo.status === 'error' && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 rounded-[2.5rem]">
              <div className="px-6 py-5 rounded-3xl font-black text-center bg-gradient-to-b from-red-600 to-red-900 text-white border-2 border-red-400 shadow-[0_0_40px_rgba(255,0,0,0.5)]">
                <span className="text-4xl">⚠️</span><br/>{resultInfo.msg}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10 flex flex-col items-center">
          <motion.div 
            animate={isFlying ? { x: [0, 5, -5, 0], y: [0, -10, 0] } : {}} 
            transition={isFlying ? { repeat: Infinity, duration: 0.5 } : {}}
            className={`mb-4 transition-colors ${!isFlying && currentM > 1 ? 'text-red-500' : 'text-blue-400'}`}
          >
            <Rocket className="w-16 h-16 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)] transform rotate-45" />
          </motion.div>
          <span className={`text-6xl font-black tracking-tighter ${!isFlying && currentM > 1 ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]'}`}>
            {currentM.toFixed(2)}x
          </span>
        </div>
      </div>

      {/* Target Multiplier Selector */}
      <div className="bg-[#1A0000] p-4 rounded-3xl border border-blue-900/50 shadow-lg">
        <div className="flex justify-between items-center mb-3"><span className="text-xs font-bold text-gray-400 uppercase tracking-widest">目标倍数 (TARGET)</span></div>
        <div className="grid grid-cols-5 gap-2">
          {[1.5, 2.0, 3.0, 5.0, 10.0].map(target => (
            <button key={target} onClick={() => setTargetMultiplier(target)} className={`py-2 rounded-xl text-xs font-black transition-all ${targetMultiplier === target ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] scale-105 border border-white/50' : 'bg-black text-gray-400 border border-gray-800'}`}>{target}x</button>
          ))}
        </div>
      </div>

      {/* Amount Selector */}
      <div className="bg-[#1A0000] p-5 rounded-3xl border border-[#FFD700]/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] mt-auto">
        <div className="flex justify-between items-center mb-4"><span className="text-xs font-bold text-gray-400 uppercase tracking-widest">下注金额</span><span className="text-lg font-black text-[#FFD700] bg-[#FFD700]/10 px-4 py-1 rounded-full border border-[#FFD700]/30 shadow-inner">¥ {betAmount.toLocaleString()}</span></div>
        <div className="grid grid-cols-5 gap-2 mb-5">
          {[10, 50, 100, 500, 1000].map(amt => (
            <button key={amt} onClick={() => setBetAmount(amt)} className={`py-2.5 rounded-xl text-xs font-black transition-all ${betAmount === amt ? 'bg-gradient-to-b from-[#FFD700] to-[#FFA500] text-[#4A0404] scale-105 border border-white/50' : 'bg-black text-gray-400 border border-gray-800'}`}>{amt >= 1000 ? `${amt/1000}K` : amt}</button>
          ))}
        </div>
        <button onClick={handleBet} disabled={isFlying} className={`w-full py-5 rounded-2xl font-black text-2xl tracking-widest transition-all ${isFlying ? 'bg-gray-900 text-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:scale-[1.02] active:scale-95 border border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.4)]'}`}>
          {isFlying ? <Loader2 className="animate-spin mx-auto w-8 h-8 text-blue-400" /> : '起飞 (FLY)'}
        </button>
      </div>
    </div>
  );
}
