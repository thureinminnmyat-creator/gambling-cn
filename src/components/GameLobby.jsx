import React, { useState } from 'react';
import { Dices, Sword, Rocket, Crown, Coins, ArrowLeft, Info } from 'lucide-react';
import BetTab from './BetTab';           // 🚨 မင်းရဲ့ ရှိပြီးသား အန်စာတုံးဖိုင် 🚨
import DragonTiger from './DragonTiger'; // 🚨 ခုနက အသစ်ဆောက်ထားတဲ့ ကျား/နဂါးဖိုင် 🚨

export default function GameLobby({ balance, socket }) {
  const [activeGame, setActiveGame] = useState(null); 

  const games = [
    { id: 'dice', name: 'Fugui Dice', nameMM: 'အန်စာတုံး', icon: <Dices className="w-8 h-8" />, color: 'from-yellow-600 to-yellow-900', isReady: true },
    { id: 'dt', name: 'Dragon Tiger', nameMM: 'ကျား / နဂါး', icon: <Sword className="w-8 h-8" />, color: 'from-red-600 to-red-900', isReady: true },
    { id: 'crash', name: 'Aviator Crash', nameMM: 'ဒုံးပျံ', icon: <Rocket className="w-8 h-8" />, color: 'from-blue-600 to-blue-900', isReady: false },
    { id: 'baccarat', name: 'Baccarat', nameMM: 'ဘက်ကရာ', icon: <Crown className="w-8 h-8" />, color: 'from-purple-600 to-purple-900', isReady: false },
    { id: 'slots', name: 'Golden Slots', nameMM: 'စလော့', icon: <Coins className="w-8 h-8" />, color: 'from-emerald-600 to-emerald-900', isReady: false },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-black">
      {/* 🚨 ဂိမ်းထဲရောက်နေရင် Back Button ပြမည် 🚨 */}
      {activeGame && (
        <div className="bg-gray-950 p-3 flex items-center gap-3 border-b border-gray-800">
          <button onClick={() => setActiveGame(null)} className="p-2 bg-gray-900 rounded-full text-yellow-500"><ArrowLeft className="w-5 h-5" /></button>
          <h2 className="text-yellow-500 font-black tracking-widest uppercase">{games.find(g => g.id === activeGame)?.name}</h2>
        </div>
      )}

      {/* 🚨 ရွေးချယ်ထားတဲ့ ဂိမ်းအလိုက် သက်ဆိုင်ရာ Component ကို ပြမည် 🚨 */}
      {!activeGame ? (
        // 🏠 LOBBY VIEW
        <div className="p-4 overflow-y-auto pb-24">
          <h2 className="text-xl text-white font-black border-l-4 border-yellow-500 pl-3 mb-6">Top Games</h2>
          <div className="space-y-3">
            {games.map((game) => (
              <button key={game.id} onClick={() => game.isReady && setActiveGame(game.id)} className={`w-full text-left relative overflow-hidden rounded-2xl p-0 ${game.isReady ? '' : 'opacity-60'}`}>
                <div className={`absolute inset-0 bg-gradient-to-r ${game.color} opacity-20`}></div>
                <div className="bg-gray-900/80 p-4 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${game.color}`}>{game.icon}</div>
                    <div><h3 className="font-black text-lg text-white">{game.name}</h3><p className="text-xs text-gray-400">{game.nameMM}</p></div>
                  </div>
                  {game.isReady ? <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-green-500/20">Play</span> : <span className="bg-gray-800 text-gray-400 px-3 py-1 rounded-full text-[10px] uppercase">Coming Soon</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : activeGame === 'dt' ? (
        // 🐉 DRAGON TIGER COMPONENT
        <DragonTiger balance={balance} socket={socket} />
      ) : (
        // 🎲 DICE COMPONENT (မင်းရဲ့ မူလ အန်စာတုံးဖိုင်)
        <BetTab balance={balance} socket={socket} />
      )}
    </div>
  );
}
