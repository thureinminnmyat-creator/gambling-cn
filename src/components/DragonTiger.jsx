import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
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

        setTimeout(() => setResultInfo(null), 3000);
      };

      socket.on('dragonTigerResult', handleResult);
      return () => socket.off('dragonTigerResult', handleResult);
    }
  }, [socket]);

  const handleBet = () => {
    if (!selectedBet) {
      setResultInfo({ status: 'error', msg: '请选择下注区域！' });
      setTimeout(() => setResultInfo(null), 2500);
      return;
    }
    
    if (balance < betAmount) {
      setResultInfo({ status: 'error', msg: '余额不足！' });
      setTimeout(() => setResultInfo(null), 2500);
      return;
    }
    
    setIsDealing(true);
    setCards({ dragon: null, tiger: null });
    setResultInfo(null); 
    
    if (socket) {
      socket.emit('playDragonTiger', { type: selectedBet, amount: betAmount });
    }
  };

  const getCardDisplay = (card) => {
    if (!card) return <div className="w-16 h-24 border-2 border-dashed border-[#FFD700]/30 rounded-xl flex items-center justify-center bg-black/40 text-[#FFD700]/50 font-black">?</div>;
    const isRed = card.suit === '♥' || card.suit === '♦';
    const valStr = card.value === 1 ? 'A' : card.value === 11 ? 'J' : card.value === 12 ? 'Q' : card.value === 13 ? 'K' : card.value;
    
    return (
      <motion.div 
        initial={{ y: -50, opacity: 0, rotateY: 180 }}
        animate={{ y: 0, opacity: 1, rotateY: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 12 }}
        className="w-16 h-24 bg-white rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between p-2 border border-gray-200"
      >
        <span className={`text-lg font-black leading-none ${isRed ? 'text-red-600' : 'text-black'}`}>{valStr}</span>
        <span className={`text-3xl text-center ${isRed ? 'text-red-600' : 'text-black'}`}>{card.suit}</span>
      </motion.div>
    );
  };

  return (
    <div className="flex-1 flex flex-col p-4 space-y-6 max-w-md mx-auto w-full">
      
      <div className="bg-gradient-to-b from-[#0a4b2a] to-[#042f18] border-[3px] border-[#cda052] rounded-[2.5rem] p-6 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center h-56">
        
        <div className="absolute inset-2 border-2 border-[#cda052]/30 rounded-[2rem] pointer-events-none"></div>

        <AnimatePresence>
          {resultInfo && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -30 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] rounded-[2.5rem]"
            >
              <div className={`px-6 py-5 rounded-3xl font-black text-center border-2 shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col items-center gap-2 max-w-[85%] ${
                resultInfo.status === 'win' ? 'bg-gradient-to-b from-[#FFD700] to-[#B8860B] text-[#4A0404] border-white shadow-yellow-500/50' : 
                resultInfo.status === 'error' ? 'bg-gradient-to-b from-red-600 to-red-900 text-white border-red-400 shadow-red-500/50' :
                'bg-gradient-to-b from-gray-800 to-black text-gray-300 border-gray-600'
              }`}>
                {resultInfo.status === 'win' ? (
                  <>
                    <span className="text-4xl drop-shadow-md">🎉</span>
                    <span className="text-xl tracking-widest">赢了</span>
                    <span className="text-3xl drop-shadow-md">+ ¥{resultInfo.amount}</span>
                  </>
                ) : resultInfo.status === 'error' ? (
                  <>
                    <span className="text-4xl drop-shadow-md">⚠️</span>
                    <span className="text-sm md:text-base tracking-wider whitespace-pre-line">{resultInfo.msg}</span>
                  </>
                ) : (
                  <>
                    <span className="text-4xl drop-shadow-md">😢</span>
                    <span className="text-xl tracking-widest">再接再厉</span>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between items-center w-full max-w-xs z-10">
          <div className="flex flex-col items-center gap-3">
            <span className="text-red-500 font-black tracking-widest text-xl drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]">龙</span>
            {isDealing ? <div className="w-16 h-24 bg-red-950/80 rounded-xl animate-pulse border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]"></div> : getCardDisplay(cards.dragon)}
          </div>
          
          <div className="text-[#FFD700] font-black text-3xl drop-shadow-[0_0_10px_rgba(255,215,0,0.5)] bg-black/40 w-12 h-12 flex items-center justify-center rounded-full border border-[#FFD700]/30">VS</div>
          
          <div className="flex flex-col items-center gap-3">
            <span className="text-blue-500 font-black tracking-widest text-xl drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]">虎</span>
            {isDealing ? <div className="w-16 h-24 bg-blue-950/80 rounded-xl animate-pulse border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]"></div> : getCardDisplay(cards.tiger)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => setSelectedBet('dragon')} className={`relative p-4 rounded-2xl border-2 overflow-hidden transition-all duration-300 ${selectedBet === 'dragon' ? 'border-red-500 scale-105 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'border-red-900/50 bg-[#1A0000]'}`}>
          <div className={`absolute inset-0 bg-gradient-to-b from-red-600/20 to-red-900/40 ${selectedBet === 'dragon' ? 'opacity-100' : 'opacity-0'}`}></div>
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-red-500 font-black text-3xl mb-1 drop-shadow-md">龙</span>
            <span className="text-xs text-white bg-red-600/40 px-3 py-0.5 rounded-full border border-red-500/30 mt-1">1 : 1</span>
          </div>
        </button>

        <button onClick={() => setSelectedBet('tie')} className={`relative p-4 rounded-2xl border-2 overflow-hidden transition-all duration-300 ${selectedBet === 'tie' ? 'border-green-500 scale-105 shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'border-green-900/50 bg-[#001A00]'}`}>
          <div className={`absolute inset-0 bg-gradient-to-b from-green-600/20 to-green-900/40 ${selectedBet === 'tie' ? 'opacity-100' : 'opacity-0'}`}></div>
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-green-500 font-black text-3xl mb-1 drop-shadow-md">和</span>
            <span className="text-xs text-white bg-green-600/40 px-3 py-0.5 rounded-full border border-green-500/30 mt-1">1 : 8</span>
          </div>
        </button>

        <button onClick={() => setSelectedBet('tiger')} className={`relative p-4 rounded-2xl border-2 overflow-hidden transition-all duration-300 ${selectedBet === 'tiger' ? 'border-blue-500 scale-105 shadow-[0_0_20px_rgba(59,130,246,0.4)]' : 'border-blue-900/50 bg-[#00001A]'}`}>
          <div className={`absolute inset-0 bg-gradient-to-b from-blue-600/20 to-blue-900/40 ${selectedBet === 'tiger' ? 'opacity-100' : 'opacity-0'}`}></div>
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-blue-500 font-black text-3xl mb-1 drop-shadow-md">虎</span>
            <span className="text-xs text-white bg-blue-600/40 px-3 py-0.5 rounded-full border border-blue-500/30 mt-1">1 : 1</span>
          </div>
        </button>
      </div>

      <div className="bg-[#1A0000] p-5 rounded-3xl border border-[#FFD700]/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">下注金额</span>
          <span className="text-lg font-black text-[#FFD700] bg-[#FFD700]/10 px-4 py-1 rounded-full border border-[#FFD700]/30 shadow-inner">¥ {betAmount.toLocaleString()}</span>
        </div>
        
        <div className="grid grid-cols-5 gap-2 mb-5">
          {[10, 50, 100, 500, 1000].map(amt => (
            <button key={amt} onClick={() => setBetAmount(amt)} className={`py-2.5 rounded-xl text-xs font-black transition-all ${betAmount === amt ? 'bg-gradient-to-b from-[#FFD700] to-[#FFA500] text-[#4A0404] shadow-[0_0_15px_rgba(255,215,0,0.5)] scale-105 border border-white/50' : 'bg-black text-gray-400 border border-gray-800 hover:border-[#FFD700]/50'}`}>
              {amt >= 1000 ? `${amt/1000}K` : amt}
            </button>
          ))}
        </div>

        <button 
          onClick={handleBet} 
          disabled={isDealing} 
          className={`w-full py-4 rounded-2xl font-black text-xl tracking-widest transition-all ${isDealing ? 'bg-gray-900 text-gray-600 cursor-not-allowed border border-gray-800' : 'bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] text-[#4A0404] shadow-[0_0_20px_rgba(255,215,0,0.4)] hover:scale-[1.02] active:scale-95 border border-white/50'}`}
        >
          {isDealing ? <Loader2 className="animate-spin mx-auto w-7 h-7 text-[#FFD700]" /> : '确认下注'}
        </button>
      </div>
    </div>
  );
}
