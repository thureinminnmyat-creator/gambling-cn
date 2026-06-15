import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Loader2, Play } from 'lucide-react';

const generateFakeWinners = (count) => {
  const multipliers = [2300, 4600, 5800, 11500, 23000, 29000, 58000, 116000];
  let winners = [];
  for (let i = 0; i < count; i++) {
    const suffix = Math.floor(100 + Math.random() * 900);
    const amount = multipliers[Math.floor(Math.random() * multipliers.length)];
    winners.push({ phone: `09*****${suffix}`, amount });
  }
  return winners;
};

// 🚨 3D Cube အန်စာတုံး 🚨
const RealisticDice = ({ value, isRolling }) => {
  const getRotation = (val) => {
    switch(val) {
      case 1: return 'rotateX(0deg) rotateY(0deg)';     
      case 2: return 'rotateX(0deg) rotateY(-90deg)';   
      case 3: return 'rotateX(-90deg) rotateY(0deg)';   
      case 4: return 'rotateX(90deg) rotateY(0deg)';    
      case 5: return 'rotateX(0deg) rotateY(90deg)';    
      case 6: return 'rotateX(0deg) rotateY(180deg)';   
      default: return 'rotateX(0deg) rotateY(0deg)';
    }
  };

  return (
    <div className="dice-container">
      <div 
        className={`dice-cube ${isRolling ? 'rolling-3d' : ''}`}
        style={!isRolling ? { transform: getRotation(value) } : {}}
      >
        <div className="dice-face front"><DiceDots value={1} /></div>
        <div className="dice-face right"><DiceDots value={2} /></div>
        <div className="dice-face top"><DiceDots value={3} /></div>
        <div className="dice-face bottom"><DiceDots value={4} /></div>
        <div className="dice-face left"><DiceDots value={5} /></div>
        <div className="dice-face back"><DiceDots value={6} /></div>
      </div>
    </div>
  );
};

// 🚨 အစက်လေးများ 🚨
const DiceDots = ({ value }) => {
  if (value === 1) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="w-[20px] h-[20px] rounded-full bg-red-600 shadow-[inset_0_3px_6px_rgba(100,0,0,0.8),0_1px_1px_rgba(255,255,255,0.8)]"></div>
      </div>
    );
  }
  
  const pips = Array(9).fill(false);
  const isRed = value === 4; 
  
  const pipPositions = {
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 3, 6, 2, 5, 8]
  };
  
  (pipPositions[value] || []).forEach(pos => { pips[pos] = true; });

  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-[2px] w-full h-full p-2">
      {pips.map((hasPip, i) => (
        <div key={i} className="flex items-center justify-center">
          {hasPip && (
            <div className={`w-[10px] h-[10px] rounded-full ${isRed ? 'bg-red-600 shadow-[inset_0_2px_4px_rgba(100,0,0,0.8)]' : 'bg-gray-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]'}`}></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default function BetTab({ isRollingUI, displayDice, playSoloBet }) {
  const [selectedAmount, setSelectedAmount] = useState(1000);
  const [selectedType, setSelectedType] = useState(null); 

  const amounts = [100, 500, 1000, 5000, 10000];
  const fakeWinners = useMemo(() => generateFakeWinners(100), []);

  const handleCustomAmount = (e) => {
    let val = parseInt(e.target.value);
    if (isNaN(val)) {
      setSelectedAmount('');
    } else if (val > 100000) {
      setSelectedAmount(100000); 
    } else if (val < 0) {
      setSelectedAmount(0); 
    } else {
      setSelectedAmount(val);
    }
  };

  const handleRollDice = () => {
    if (selectedType && selectedAmount) {
      playSoloBet(selectedType, selectedAmount);
    }
  };

  return (
    <div className="space-y-2 max-w-sm mx-auto relative pb-2 mt-1">
      
      <style>{`
        .dice-container { width: 64px; height: 64px; perspective: 600px; }
        .dice-cube { width: 100%; height: 100%; position: relative; transform-style: preserve-3d; transition: transform 0.4s ease-out; }
        .dice-face { position: absolute; width: 100%; height: 100%; background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%); border-radius: 12px; border: 1px solid #ccc; box-shadow: inset 0 0 10px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; }
        
        .front  { transform: rotateY(0deg) translateZ(32px); }
        .back   { transform: rotateY(180deg) translateZ(32px); }
        .right  { transform: rotateY(90deg) translateZ(32px); }
        .left   { transform: rotateY(-90deg) translateZ(32px); }
        .top    { transform: rotateX(90deg) translateZ(32px); }
        .bottom { transform: rotateX(-90deg) translateZ(32px); }

        @keyframes spin3D {
          0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
          100% { transform: rotateX(1080deg) rotateY(720deg) rotateZ(360deg); } 
        }
        .rolling-3d { animation: spin3D 0.6s infinite linear; }
        
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      {/* Winners Marquee */}
      <div className="bg-[#2A0000]/80 border border-[#FFD700]/40 rounded-full overflow-hidden flex items-center px-3 py-1 shadow-[0_0_8px_rgba(255,215,0,0.2)]">
        <Trophy className="w-3.5 h-3.5 text-[#FFD700] mr-2 shrink-0" />
        <div className="flex-1 overflow-hidden relative h-4">
          <motion.div 
            animate={{ x: ["350px", "-100%"] }} 
            transition={{ repeat: Infinity, duration: 300, ease: "linear" }} 
            className="whitespace-nowrap absolute flex gap-10 text-[10px] font-bold text-[#FFD700]/90 mt-0.5"
          >
            {fakeWinners.map((w, i) => (
              <span key={i}>🎉 {w.phone} 赢 <span className="text-[#00FF00]">¥{w.amount.toLocaleString()}</span></span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* 🚨 Jackpot 🚨 */}
      <div className="bg-gradient-to-r from-[#8B0000] via-[#FF0000] to-[#8B0000] border border-[#FFD700] rounded-xl py-1.5 px-4 text-center shadow-[0_0_15px_rgba(255,215,0,0.4)] animate-pulse relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
        <p className="text-[#FFD700] text-[9px] font-black tracking-widest mb-0.5 drop-shadow-md">🔥 巨额大奖 (JACKPOT) 🔥</p>
        <p className="text-white text-2xl font-black font-mono tracking-wider drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">¥ 8,888,888</p>
      </div>

      {/* 🚨 Dice Area - အန်စာတုံး လျှံမထွက်စေရန် ကွင်းကို (105px) သို့ ချဲ့ပေးထားသည် 🚨 */}
      <div className="relative w-full h-[150px] bg-gradient-to-b from-[#3A0000] to-[#1A0000] rounded-2xl border border-[#FFD700]/30 shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 flex gap-6">
          <div className="w-[105px] h-[105px] rounded-full border-[5px] border-[#FFD700] bg-[#0f0f13] flex items-center justify-center shadow-[0_0_20px_rgba(255,215,0,0.5),inset_0_5px_10px_rgba(0,0,0,0.9)]">
            <RealisticDice value={displayDice.d1} isRolling={isRollingUI} />
          </div>
          <div className="w-[105px] h-[105px] rounded-full border-[5px] border-[#FFD700] bg-[#0f0f13] flex items-center justify-center shadow-[0_0_20px_rgba(255,215,0,0.5),inset_0_5px_10px_rgba(0,0,0,0.9)]">
            <RealisticDice value={displayDice.d2} isRolling={isRollingUI} />
          </div>
        </div>
      </div>

      {/* Amount Selector */}
      <div className="bg-[#2A0000]/60 p-2 rounded-xl border border-[#FFD700]/20 relative z-20 shadow-sm">
        <p className="text-center text-[10px] text-[#FFD700]/80 uppercase tracking-widest font-bold mb-1.5">下注金额</p>
        <div className="mb-2 mx-1 flex items-center bg-[#1A0000] border border-[#FFD700]/40 rounded-lg px-3 py-1.5 focus-within:border-[#FFD700] transition-colors shadow-inner">
          <span className="text-[#FFD700] font-bold mr-2 text-base">¥</span>
          <input 
            type="number" 
            value={selectedAmount} 
            onChange={handleCustomAmount}
            disabled={isRollingUI}
            className="bg-transparent w-full text-white text-base font-black outline-none"
            placeholder="100 - 100000"
          />
        </div>
        <div className="flex flex-wrap justify-center gap-1.5">
          {amounts.map(amt => (
            <button key={amt} onClick={() => !isRollingUI && setSelectedAmount(amt)} className={`px-2 py-1 rounded-md text-xs font-black transition-all border ${selectedAmount === amt ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#4A0404] border-[#FFD700] shadow-[0_0_10px_rgba(255,215,0,0.5)] scale-105' : 'bg-[#1A0000] text-[#FFD700]/70 border-[#FFD700]/20 hover:border-[#FFD700]/50'}`}>
              {amt}
            </button>
          ))}
        </div>
      </div>

      {/* Selection Grid */}
      <div className="grid grid-cols-3 gap-2 relative z-20 mt-1">
        <button 
          disabled={isRollingUI} 
          onClick={() => setSelectedType('under')} 
          className={`transition-all p-2 rounded-xl border-2 ${selectedType === 'under' ? 'bg-blue-700 border-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.8)] scale-105' : 'bg-blue-900/40 border-blue-500/30 opacity-80 hover:opacity-100'}`}
        >
          <p className="text-xs text-blue-200 font-bold mb-0.5">小</p>
          <p className="text-base font-black text-white">2 - 6</p>
          <p className="text-[9px] bg-blue-950 text-blue-300 rounded px-1 mt-0.5 inline-block border border-blue-500/30">2.3x</p>
        </button>

        <button 
          disabled={isRollingUI} 
          onClick={() => setSelectedType('equal')} 
          className={`transition-all p-2 rounded-xl border-2 ${selectedType === 'equal' ? 'bg-green-700 border-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.8)] scale-105' : 'bg-green-900/40 border-green-500/30 opacity-80 hover:opacity-100'}`}
        >
          <p className="text-xs text-green-200 font-bold mb-0.5">平</p>
          <p className="text-base font-black text-white">7</p>
          <p className="text-[9px] bg-green-950 text-green-300 rounded px-1 mt-0.5 inline-block border border-green-500/30">5.8x</p>
        </button>

        <button 
          disabled={isRollingUI} 
          onClick={() => setSelectedType('over')} 
          className={`transition-all p-2 rounded-xl border-2 ${selectedType === 'over' ? 'bg-red-700 border-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.8)] scale-105' : 'bg-red-900/40 border-red-500/30 opacity-80 hover:opacity-100'}`}
        >
          <p className="text-xs text-red-200 font-bold mb-0.5">大</p>
          <p className="text-base font-black text-white">8 - 12</p>
          <p className="text-[9px] bg-red-950 text-red-300 rounded px-1 mt-0.5 inline-block border border-red-500/30">2.3x</p>
        </button>
      </div>

      {/* Play Button */}
      <div className="flex justify-center mt-3 relative pb-2">
        <button 
          disabled={isRollingUI || !selectedAmount || !selectedType} 
          onClick={handleRollDice} 
          className={`relative flex items-center justify-center w-[64px] h-[64px] rounded-full transition-all duration-300 border-[3px] ${
            isRollingUI 
              ? 'bg-[#1A0000] border-gray-600 shadow-none' 
              : selectedType 
                ? 'bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FF8C00] border-white shadow-[0_0_20px_rgba(255,215,0,0.8)] active:scale-90 hover:scale-110' 
                : 'bg-[#2A0000] border-[#FFD700]/30 opacity-50'
          }`}
        >
          {isRollingUI ? (
            <Loader2 className="w-7 h-7 animate-spin text-[#FFD700]" />
          ) : (
            <Play className={`w-8 h-8 ml-1 ${selectedType ? 'text-[#4A0404] fill-current' : 'text-gray-500'}`} />
          )}
        </button>
        
        {!selectedType && !isRollingUI && (
          <p className="absolute -bottom-2 text-center text-[9px] text-[#FFD700]/60">请先选择下注</p>
        )}
      </div>

    </div>
  );
}