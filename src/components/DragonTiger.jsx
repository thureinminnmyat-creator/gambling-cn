import React, { useState, useEffect } from 'react'; // 🚨 useEffect ကို ထည့်သွင်းထားပါသည် 🚨
import { Loader2 } from 'lucide-react';

export default function DragonTiger({ balance, socket }) {
  const [betAmount, setBetAmount] = useState(10);
  const [selectedBet, setSelectedBet] = useState(''); // 'dragon', 'tiger', 'tie'
  const [isDealing, setIsDealing] = useState(false);
  const [cards, setCards] = useState({ dragon: null, tiger: null });

  // 🚨 Socket ကနေ ရလဒ်ပြန်လာတာကို ဖမ်းမယ့်ကောင်ကို အသက်ပြန်သွင်းလိုက်ပါပြီ 🚨
  useEffect(() => {
    if(socket) {
      const handleResult = (data) => {
        // ဖဲချပ်အဖြေကို ပြမည်
        setCards({ dragon: data.cards.dragonCard, tiger: data.cards.tigerCard });
        
        // Loading လည်နေတာကို ရပ်မည်
        setIsDealing(false); 
      };

      socket.on('dragonTigerResult', handleResult);
      
      // Cleanup listener
      return () => socket.off('dragonTigerResult', handleResult);
    }
  }, [socket]);

  const handleBet = () => {
    if (!selectedBet) return alert("လောင်းမည့်ဘက်ကို ရွေးချယ်ပါ!");
    if (balance < betAmount) return alert("လက်ကျန်ငွေ မလုံလောက်ပါ!");
    
    setIsDealing(true);
    setCards({ dragon: null, tiger: null });
    
    // 🚨 တကယ့် Socket ဆီသို့ လှမ်းပို့ပါပြီ 🚨
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
        <div className="flex justify-between items-center w-full max-w-xs z-10">
          <div className="flex flex-col items-center gap-2">
            <span className="text-red-500 font-black tracking-widest uppercase text-sm">Dragon</span>
            {isDealing ? <div className="w-16 h-24 bg-red-950 rounded-xl animate-pulse"></div> : getCardDisplay(cards.dragon)}
          </div>
          <div className="text-yellow-500 font-black text-2xl">VS</div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-blue-500 font-black tracking-widest uppercase text-sm">Tiger</span>
            {isDealing ? <div className="w-16 h-24 bg-blue-950 rounded-xl animate-pulse"></div> : getCardDisplay(cards.tiger)}
          </div>
        </div>
      </div>

      {/* Betting Options */}
      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => setSelectedBet('dragon')} className={`p-4 rounded-2xl border-2 transition-all ${selectedBet === 'dragon' ? 'border-red-500 bg-red-950/80 scale-105' : 'border-red-900/50 bg-red-950/30'}`}>
          <div className="flex flex-col items-center"><span className="text-red-500 font-black mb-1">နဂါး</span><span className="text-xs text-red-400">2.0x</span></div>
        </button>
        <button onClick={() => setSelectedBet('tie')} className={`p-4 rounded-2xl border-2 transition-all ${selectedBet === 'tie' ? 'border-green-500 bg-green-950/80 scale-105' : 'border-green-900/50 bg-green-950/30'}`}>
          <div className="flex flex-col items-center"><span className="text-green-500 font-black mb-1">သရေ</span><span className="text-xs text-green-400">9.0x</span></div>
        </button>
        <button onClick={() => setSelectedBet('tiger')} className={`p-4 rounded-2xl border-2 transition-all ${selectedBet === 'tiger' ? 'border-blue-500 bg-blue-950/80 scale-105' : 'border-blue-900/50 bg-blue-950/30'}`}>
          <div className="flex flex-col items-center"><span className="text-blue-500 font-black mb-1">ကျား</span><span className="text-xs text-blue-400">2.0x</span></div>
        </button>
      </div>

      {/* Amount Selector */}
      <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800">
        <div className="flex justify-between mb-3"><span className="text-xs text-gray-400">Bet Amount</span><span className="text-sm font-black text-yellow-500">¥ {betAmount}</span></div>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {[10, 50, 100, 500, 1000].map(amt => (
            <button key={amt} onClick={() => setBetAmount(amt)} className={`py-2 rounded-lg text-xs font-bold ${betAmount === amt ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-300'}`}>{amt}</button>
          ))}
        </div>
        <button onClick={handleBet} disabled={!selectedBet || isDealing} className={`w-full py-4 rounded-xl font-black text-lg ${!selectedBet || isDealing ? 'bg-gray-800 text-gray-500' : 'bg-yellow-500 text-black'}`}>
          {isDealing ? <Loader2 className="animate-spin mx-auto" /> : 'PLACE BET'}
        </button>
      </div>
    </div>
  );
}
