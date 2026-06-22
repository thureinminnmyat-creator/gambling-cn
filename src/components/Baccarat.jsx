import React, { useState, useEffect } from 'react';
import { Loader2, Trophy, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const generateCardsForScore = (targetScore) => {
  const suits = ['♠', '♥', '♦', '♣'];
  const faces = ['10', 'J', 'Q', 'K'];
  
  let val1 = Math.floor(Math.random() * 10);
  let val2 = targetScore - val1;
  if (val2 < 0) val2 += 10;

  const toCardValue = (v) => {
    if (v === 0) return faces[Math.floor(Math.random() * faces.length)];
    if (v === 1) return 'A';
    return v.toString();
  };

  return [
    { suit: suits[Math.floor(Math.random() * suits.length)], value: toCardValue(val1) },
    { suit: suits[Math.floor(Math.random() * suits.length)], value: toCardValue(val2) }
  ];
};

const PlayingCard = ({ card, isRevealed, delay }) => {
  if (!isRevealed) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -20, rotateY: 180 }} 
        animate={{ opacity: 1, y: 0, rotateY: 180 }} 
        transition={{ delay, duration: 0.3 }}
        className="w-12 h-16 md:w-14 md:h-20 bg-gradient-to-br from-blue-700 to-blue-900 rounded-lg border border-white/50 shadow-lg flex items-center justify-center relative overflow-hidden"
      >
        <div className="absolute inset-0.5 border border-white/20 rounded-md opacity-50" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)' }}></div>
      </motion.div>
    );
  }

  const isRed = card.suit === '♥' || card.suit === '♦';
  return (
    <motion.div 
      initial={{ rotateY: 180 }} 
      animate={{ rotateY: 0 }} 
      transition={{ duration: 0.4, type: 'spring' }}
      className="w-12 h-16 md:w-14 md:h-20 bg-white rounded-lg border border-gray-300 shadow-lg flex flex-col justify-between p-1.5 relative overflow-hidden"
    >
      <span className={`text-sm md:text-base font-black leading-none ${isRed ? 'text-red-600' : 'text-black'}`}>{card.value}</span>
      <span className={`text-2xl md:text-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 ${isRed ? 'text-red-600' : 'text-black'}`}>{card.suit}</span>
      <span className={`text-sm md:text-base font-black leading-none self-end rotate-180 ${isRed ? 'text-red-600' : 'text-black'}`}>{card.value}</span>
    </motion.div>
  );
};

export default function Baccarat({ balance, socket }) {
  const [betAmount, setBetAmount] = useState(10);
  const [selectedBet, setSelectedBet] = useState(''); 
  
  const [gamePhase, setGamePhase] = useState('idle'); 
  const [playerCards, setPlayerCards] = useState([]);
  const [bankerCards, setBankerCards] = useState([]);
  const [scores, setScores] = useState({ player: '?', banker: '?' });
  const [resultInfo, setResultInfo] = useState(null); 

  useEffect(() => {
    if(socket) {
      const handleResult = (data) => {
        const pCards = generateCardsForScore(data.result.playerScore);
        const bCards = generateCardsForScore(data.result.bankerScore);
        
        setPlayerCards(pCards);
        setBankerCards(bCards);
        
        try { new Audio('https://assets.mixkit.co/sfx/preview/mixkit-paper-slide-1530.mp3').play().catch(()=>{}); } catch(e){}

        setTimeout(() => {
          setGamePhase('revealed');
          setScores({ player: data.result.playerScore, banker: data.result.bankerScore });
          setResultInfo({ status: data.status, amount: data.amountWon });

          try {
            if (data.status === 'win') new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3').play().catch(()=>{});
            else new Audio('https://assets.mixkit.co/sfx/preview/mixkit-losing-bleeps-2026.mp3').play().catch(()=>{});
          } catch(e) {}

          setTimeout(() => {
            setResultInfo(null);
            setGamePhase('idle');
            setScores({ player: '?', banker: '?' });
          }, 3500); 
        }, 1200); 
      };
      
      socket.on('baccaratResult', handleResult);
      return () => socket.off('baccaratResult', handleResult);
    }
  }, [socket]);

  const handleBet = () => {
    if (!selectedBet) {
      setResultInfo({ status: 'error', msg: '请选择下注区域！' });
      setTimeout(() => setResultInfo(null), 2000); return;
    }
    if (balance < betAmount) {
      setResultInfo({ status: 'error', msg: '余额不足！' });
      setTimeout(() => setResultInfo(null), 2000); return;
    }
    
    try { new Audio('https://assets.mixkit.co/sfx/preview/mixkit-cards-shuffling-and-dealing-1828.mp3').play().catch(()=>{}); } catch(e){}
    
    setGamePhase('dealing'); 
    setScores({ player: '?', banker: '?' }); 
    setResultInfo(null); 
    
    if (socket) socket.emit('playBaccarat', { type: selectedBet, amount: betAmount });
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto w-full p-2 space-y-3 justify-between">
      
      {/* 🚨 Table UI (Medium/Balanced Size) 🚨 */}
      <div className="relative flex-1 min-h-[200px] bg-gradient-to-b from-[#064e3b] to-[#022c22] border-4 border-[#FFD700] rounded-3xl p-3 shadow-xl overflow-hidden flex flex-col justify-end pb-5">
        
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '18px 18px' }}></div>
        <div className="absolute inset-1.5 border border-[#FFD700]/20 rounded-[1.25rem] pointer-events-none"></div>

        {/* Floating Result Noti */}
        <AnimatePresence>
          {resultInfo && resultInfo.status !== 'error' && (
            <motion.div 
              initial={{ opacity: 0, y: -10, x: '-50%' }} 
              animate={{ opacity: 1, y: 0, x: '-50%' }} 
              exit={{ opacity: 0, y: -10, x: '-50%' }} 
              className={`absolute top-4 left-1/2 z-50 px-5 py-2 rounded-2xl font-black text-center border-2 shadow-xl flex items-center gap-2 w-max ${resultInfo.status === 'win' ? 'bg-gradient-to-r from-[#FFD700] to-[#B8860B] text-[#4A0404] border-white' : 'bg-gradient-to-r from-gray-800 to-black text-gray-300 border-gray-600'}`}
            >
              {resultInfo.status === 'win' ? (
                <><Trophy className="w-5 h-5"/> <span className="text-base tracking-widest">赢了</span> <span className="text-xl">+ ¥{resultInfo.amount}</span></>
              ) : (
                <><span className="text-base">😢</span> <span className="text-base tracking-widest">再接再厉</span></>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {resultInfo && resultInfo.status === 'error' && (
           <motion.div initial={{ opacity: 0, y: -10, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0 }} className="absolute top-4 left-1/2 z-50 bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 w-max border border-white/50">
             <AlertTriangle className="w-4 h-4"/> {resultInfo.msg}
           </motion.div>
        )}

        {/* Cards & Scores Area */}
        <div className="flex justify-between items-end w-full z-10 relative px-2">
          
          <div className="flex flex-col items-center gap-2 w-[40%]">
            <span className="text-blue-400 font-black tracking-widest text-[11px] drop-shadow-md">闲 (PLAYER)</span>
            <div className="flex gap-[-12px] justify-center w-full h-16 md:h-20">
              {gamePhase === 'idle' ? (
                <div className="w-12 h-16 md:w-14 md:h-20 border-2 border-dashed border-blue-400/30 rounded-lg"></div>
              ) : (
                <>
                  <div className="rotate-[-10deg] translate-x-2 z-10">
                    <PlayingCard card={playerCards[0]} isRevealed={gamePhase === 'revealed'} delay={0.1} />
                  </div>
                  <div className="rotate-[10deg] -translate-x-2 z-20">
                    <PlayingCard card={playerCards[1]} isRevealed={gamePhase === 'revealed'} delay={0.2} />
                  </div>
                </>
              )}
            </div>
            <div className="mt-1 bg-blue-900/80 border border-blue-400 px-3 py-0.5 rounded-full shadow">
              <span className="text-blue-400 font-black text-xs">分数 {scores.player}</span>
            </div>
          </div>
          
          <div className="text-[#FFD700] font-black text-sm drop-shadow-md bg-black/60 w-8 h-8 flex items-center justify-center rounded-full border border-[#FFD700]/30 shadow-inner z-30 self-center translate-y-2">VS</div>
          
          <div className="flex flex-col items-center gap-2 w-[40%]">
            <span className="text-red-400 font-black tracking-widest text-[11px] drop-shadow-md">庄 (BANKER)</span>
             <div className="flex gap-[-12px] justify-center w-full h-16 md:h-20">
              {gamePhase === 'idle' ? (
                <div className="w-12 h-16 md:w-14 md:h-20 border-2 border-dashed border-red-400/30 rounded-lg"></div>
              ) : (
                <>
                  <div className="rotate-[-10deg] translate-x-2 z-10">
                    <PlayingCard card={bankerCards[0]} isRevealed={gamePhase === 'revealed'} delay={0.3} />
                  </div>
                  <div className="rotate-[10deg] -translate-x-2 z-20">
                    <PlayingCard card={bankerCards[1]} isRevealed={gamePhase === 'revealed'} delay={0.4} />
                  </div>
                </>
              )}
            </div>
            <div className="mt-1 bg-red-900/80 border border-red-400 px-3 py-0.5 rounded-full shadow">
              <span className="text-red-400 font-black text-xs">分数 {scores.banker}</span>
            </div>
          </div>

        </div>
      </div>

      {/* 🚨 Betting Options 🚨 */}
      <div className="grid grid-cols-3 gap-2.5 flex-shrink-0">
        <button onClick={() => setSelectedBet('player')} className={`relative p-2.5 rounded-2xl border-2 transition-all duration-300 ${selectedBet === 'player' ? 'border-blue-500 scale-[1.02] shadow-[0_0_15px_rgba(59,130,246,0.5)] bg-[#00002A]' : 'border-blue-900/40 bg-[#00001A]'}`}>
          <div className={`absolute inset-0 bg-gradient-to-b from-blue-600/20 to-blue-900/40 ${selectedBet === 'player' ? 'opacity-100' : 'opacity-0'}`}></div>
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-blue-500 font-black text-xl mb-1">闲</span>
            <span className="text-[10px] text-white bg-blue-600/50 px-2.5 py-0.5 rounded-full border border-blue-500/30">1 : 1</span>
          </div>
        </button>

        <button onClick={() => setSelectedBet('tie')} className={`relative p-2.5 rounded-2xl border-2 transition-all duration-300 ${selectedBet === 'tie' ? 'border-green-500 scale-[1.02] shadow-[0_0_15px_rgba(34,197,94,0.5)] bg-[#002A00]' : 'border-green-900/40 bg-[#001A00]'}`}>
          <div className={`absolute inset-0 bg-gradient-to-b from-green-600/20 to-green-900/40 ${selectedBet === 'tie' ? 'opacity-100' : 'opacity-0'}`}></div>
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-green-500 font-black text-xl mb-1">和</span>
            <span className="text-[10px] text-white bg-green-600/50 px-2.5 py-0.5 rounded-full border border-green-500/30">1 : 8</span>
          </div>
        </button>

        <button onClick={() => setSelectedBet('banker')} className={`relative p-2.5 rounded-2xl border-2 transition-all duration-300 ${selectedBet === 'banker' ? 'border-red-500 scale-[1.02] shadow-[0_0_15px_rgba(239,68,68,0.5)] bg-[#2A0000]' : 'border-red-900/40 bg-[#1A0000]'}`}>
          <div className={`absolute inset-0 bg-gradient-to-b from-red-600/20 to-red-900/40 ${selectedBet === 'banker' ? 'opacity-100' : 'opacity-0'}`}></div>
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-red-500 font-black text-xl mb-1">庄</span>
            <span className="text-[10px] text-white bg-red-600/50 px-2.5 py-0.5 rounded-full border border-red-500/30">1 : 0.95</span>
          </div>
        </button>
      </div>

      {/* 🚨 Bottom Controls 🚨 */}
      <div className="bg-[#1A0000] p-3.5 rounded-2xl border border-[#FFD700]/20 shadow-lg flex-shrink-0">
        
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">下注金额</span>
          <span className="text-sm font-black text-[#FFD700] bg-[#FFD700]/10 px-3 py-1 rounded-full border border-[#FFD700]/30 shadow-inner">¥ {betAmount.toLocaleString()}</span>
        </div>
        
        <div className="grid grid-cols-5 gap-2 mb-3.5">
          {[10, 50, 100, 500, 1000].map(amt => (
            <button 
              key={amt} 
              onClick={() => setBetAmount(amt)} 
              className={`py-1.5 rounded-full text-[10px] font-black transition-all ${
                betAmount === amt 
                  ? 'bg-gradient-to-b from-[#FFD700] to-[#FFA500] text-[#4A0404] shadow-[0_0_10px_rgba(255,215,0,0.6)] scale-105 border border-white' 
                  : 'bg-black text-gray-300 border border-gray-700 hover:border-[#FFD700]/50 shadow-[inset_0_0_5px_rgba(255,255,255,0.05)]'
              }`}
            >
              {amt >= 1000 ? `${amt/1000}K` : amt}
            </button>
          ))}
        </div>

        <button 
          onClick={handleBet} 
          disabled={gamePhase !== 'idle'} 
          className={`w-full py-3 rounded-xl font-black text-base tracking-widest transition-all ${
            gamePhase !== 'idle' 
              ? 'bg-gray-900 text-gray-600 cursor-not-allowed border border-gray-800' 
              : 'bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] text-[#4A0404] shadow-[0_0_15px_rgba(255,215,0,0.4)] active:scale-95 border border-white/50'
          }`}
        >
          {gamePhase !== 'idle' ? <Loader2 className="animate-spin mx-auto w-5 h-5 text-[#4A0404]" /> : '确认下注'}
        </button>
      </div>

    </div>
  );
}
