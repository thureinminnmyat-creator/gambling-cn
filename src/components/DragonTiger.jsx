import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function DragonTiger({ balance, socket }) {
  const [betAmount, setBetAmount] = useState(10);
  const [selectedBet, setSelectedBet] = useState(''); // 'dragon', 'tiger', 'tie'
  const [isDealing, setIsDealing] = useState(false);
  const [cards, setCards] = useState({ dragon: null, tiger: null });
  
  // 🚨 နိုင်/ရှုံး ရလဒ်ပြရန် State အသစ် 🚨
  const [resultInfo, setResultInfo] = useState(null); 

  useEffect(() => {
    if(socket) {
      const handleResult = (data) => {
        setCards({ dragon: data.cards.dragonCard, tiger: data.cards.tigerCard });
        setIsDealing(false);
        
        // 🚨 ရလဒ်ကို State ထဲ ထည့်မည် 🚨
        setResultInfo({ status: data.status, amount: data.amountWon });

        // 🚨 နိုင်/ရှုံး အသံမြည်စေရန် 🚨
        try {
          if (data.status === 'win') {
            new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3').play().catch(()=>{});
          } else {
            new Audio('https://assets.mixkit.co/sfx/preview/mixkit-losing-bleeps-2026.mp3').play().catch(()=>{});
          }
        } catch(e) { console.log(e); }

        // ၃ စက္ကန့်နေရင် စာတန်းကို အလိုလို ပြန်ဖျောက်မည်
        setTimeout(() => setResultInfo(null), 3000);
      };

      socket.on('dragonTigerResult', handleResult);
      return () => socket.off('dragonTigerResult', handleResult);
    }
  }, [socket]);

  const handleBet = () => {
    if (!selectedBet) return alert("လောင်းမည့်ဘက်ကို ရွေးချယ်ပါ!");
    if (balance < betAmount) return alert("လက်ကျန်ငွေ မလုံလောက်ပါ!");
    
    setIsDealing(true);
    setCards({ dragon: null, tiger: null });
    setResultInfo(null); // 🚨 ခလုတ်နှိပ်တာနဲ့ အဟောင်းကို ဖျက်မည် 🚨
    
    if (socket) {
      socket.emit('playDragonTiger', { type: selectedBet, amount: betAmount });
    }
  };

  const getCardDisplay = (card) => {
    if (!card) return <div className="w-16 h-24 border-2 border-dashed border-gray-600 rounded-xl flex items-center justify-center bg-gray-800/50">?</div>;
    const isRed = card.suit === '♥' || card.suit === '♦';
    const valStr = card.value === 1 ? 'A' : card.value === 11 ? 'J' : card.value === 12 ? 'Q' : card.value === 13 ? 'K' : card.value;
    return (
      <div className="w-16 h-24 bg-white rounded-xl shadow-xl flex flex-col justify-between p-2">
        <span className={`text-lg font-black leading-none ${isRed ? 'text-red-600' : 'text-black'}`}>{valStr}</span>
        <span className={`text-3xl text-center ${isRed ? 'text-red-600' : 'text-black'}`}>{card.suit}</span>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col p-4 space-y-6">
      {/* Table Area */}
      <div className="bg-green-900/40 border border-green-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl flex flex-col items-center justify-center h-48">
        
        {/* 🚨 နိုင်/ရှုံး တက်လာမည့် စာတန်း (Popup) 🚨 */}
        {resultInfo && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className={`px-6 py-3 rounded-2xl font-black text-xl border-2 shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all animate-bounce ${resultInfo.status === 'win' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black border-white shadow-yellow-500/50' : 'bg-gray-800 text-gray-400 border-gray-600'}`}>
              {resultInfo.status === 'win' ? `🎉 နိုင်ပါပြီ! + ¥${resultInfo.amount}` : '😢 ရှုံးသွားပါသည်'}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center w-full max-w-xs z-10">
          <div className="flex flex-col items-center gap-2">
            <span className="text-red-500 font-black tracking-widest uppercase text-sm">Dragon</span>
            {isDealing ? <div className="w-16 h-24 bg-red-950 rounded-xl animate-pulse border border-red-500/50"></div> : getCardDisplay(cards.dragon)}
          </div>
          
          <div className="text-yellow-500 font-black text-2xl drop-shadow-md">VS</div>
          
          <div className="flex flex-col items-center gap-2">
            <span className="text-blue-500 font-black tracking-widest uppercase text-sm">Tiger</span>
            {isDealing ? <div className="w-16 h-24 bg-blue-950 rounded-xl animate-pulse border border-blue-500/50"></div> : getCardDisplay(cards.tiger)}
          </div>
        </div>
      </div>

      {/* Betting Options */}
      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => setSelectedBet('dragon')} className={`p-4 rounded-2xl border-2 transition-all ${selectedBet === 'dragon' ? 'border-red-500 bg-red-950/80 scale-105' : 'border-red-900/50 bg-red-950/30'}`}>
          <div className="flex flex-col items-center"><span className="text-red-500 font-black mb-1">နဂါး (Dragon)</span><span className="text-xs text-red-400 font-bold">2.0x</span></div>
        </button>
        <button onClick={() => setSelectedBet('tie')} className={`p-4 rounded-2xl border-2 transition-all ${selectedBet === 'tie' ? 'border-green-500 bg-green-950/80 scale-105' : 'border-green-900/50 bg-green-950/30'}`}>
          <div className="flex flex-col items-center"><span className="text-green-500 font-black mb-1">သရေ (Tie)</span><span className="text-xs text-green-400 font-bold">9.0x</span></div>
        </button>
        <button onClick={() => setSelectedBet('tiger')} className={`p-4 rounded-2xl border-2 transition-all ${selectedBet === 'tiger' ? 'border-blue-500 bg-blue-950/80 scale-105' : 'border-blue-900/50 bg-blue-950/30'}`}>
          <div className="flex flex-col items-center"><span className="text-blue-500 font-black mb-1">ကျား (Tiger)</span><span className="text-xs text-blue-400 font-bold">2.0x</span></div>
        </button>
      </div>

      {/* Amount Selector */}
      <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Bet Amount</span>
          <span className="text-sm font-black text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">¥ {betAmount}</span>
        </div>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {[10, 50, 100, 500, 1000].map(amt => (
            <button key={amt} onClick={() => setBetAmount(amt)} className={`py-2 rounded-lg text-xs font-black transition-colors ${betAmount === amt ? 'bg-yellow-500 text-black shadow-[0_0_10px_rgba(255,215,0,0.4)]' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>{amt}</button>
          ))}
        </div>
        <button onClick={handleBet} disabled={!selectedBet || isDealing} className={`w-full py-4 rounded-xl font-black text-lg tracking-widest transition-all ${!selectedBet || isDealing ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:scale-[1.02]'}`}>
          {isDealing ? <Loader2 className="animate-spin mx-auto w-6 h-6" /> : 'PLACE BET'}
        </button>
      </div>
    </div>
  );
}
