import React, { useState, useEffect } from 'react';
import { ArrowLeft, PlayCircle, Lock, Flame, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

import BetTab from './BetTab';
import DragonTiger from './DragonTiger';
// 🚨 ဖိုင်အသစ် ၃ ခုကို Import လုပ်ထားပါသည် 🚨
import Baccarat from './Baccarat';
import Slots from './Slots';
import Aviator from './Aviator';

export default function GameLobby({ balance, socket, isRollingUI, displayDice, playSoloBet, jackpotAmount }) {
  const [activeGame, setActiveGame] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const banners = [
    '/images/banner1.jpg',
    '/images/banner2.jpg',
    '/images/banner3.jpg'
  ];

  useEffect(() => {
    if (activeGame) return; 
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [activeGame, banners.length]);

  // 🚨 ဂိမ်းအားလုံးကို isReady: true ပြောင်းထားပါသည် 🚨
  const games = [
    { 
      id: 'dice', name: '富贵骰子', nameMM: 'FUGUI DICE', 
      image: '/images/dice.jpg', 
      border: 'border-[#FFD700]', 
      isReady: true, colSpan: 2, 
      badge: <span className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-gradient-to-r from-red-600 to-[#FFD700] text-white px-3 py-1 rounded-full text-[10px] font-black uppercase shadow-[0_0_10px_rgba(255,215,0,0.6)] animate-pulse"><Flame className="w-3 h-3 text-yellow-200"/> 热门</span>
    },
    { id: 'dt', name: '龙虎斗', nameMM: 'DRAGON TIGER', image: '/images/dt.jpg', border: 'border-red-500', isReady: true, colSpan: 1 },
    { id: 'baccarat', name: '百家乐', nameMM: 'BACCARAT', image: '/images/baccarat.jpg', border: 'border-purple-500', isReady: true, colSpan: 1 },
    { id: 'crash', name: '飞行者', nameMM: 'AVIATOR', image: '/images/crash.jpg', border: 'border-blue-500', isReady: true, colSpan: 1 },
    { id: 'slots', name: '老虎机', nameMM: 'SLOTS', image: '/images/slots.jpg', border: 'border-emerald-500', isReady: true, colSpan: 1 },
  ];

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } };

  return (
    <div className="flex-1 flex flex-col h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#3A0000] via-black to-black">
      
      {activeGame && (
        <div className="bg-black/80 backdrop-blur-md p-3 flex items-center gap-3 border-b border-[#FFD700]/30 rounded-t-2xl shadow-[0_5px_20px_rgba(255,215,0,0.15)] z-20 relative">
          <button onClick={() => setActiveGame(null)} className="p-2 bg-white/5 border border-[#FFD700]/50 rounded-full text-[#FFD700] hover:scale-110 transition-transform"><ArrowLeft className="w-5 h-5" /></button>
          <h2 className="text-[#FFD700] font-black tracking-widest uppercase drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]">{games.find(g => g.id === activeGame)?.name}</h2>
        </div>
      )}

      {!activeGame ? (
        <div className="p-4 overflow-y-auto pb-24">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mb-8 relative overflow-hidden rounded-[2rem] border-2 border-[#FFD700]/40 shadow-[0_15px_30px_rgba(0,0,0,0.8)] h-40 md:h-52 bg-black group">
            {banners.map((img, index) => <img key={index} src={img} alt={`Banner ${index + 1}`} className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`} />)}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none"></div>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
              {banners.map((_, index) => <div key={index} className={`h-1.5 rounded-full transition-all duration-500 ${index === currentSlide ? 'w-8 bg-[#FFD700] shadow-[0_0_10px_rgba(255,215,0,0.8)]' : 'w-2 bg-white/40 backdrop-blur-sm'}`} />)}
            </div>
          </motion.div>

          <div className="flex items-center gap-2 mb-5 pl-2">
            <Sparkles className="w-5 h-5 text-[#FFD700]" />
            <h3 className="text-xl text-white font-black tracking-widest drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">游戏大厅</h3>
          </div>

          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-2 gap-4">
            {games.map((game) => (
              <motion.button variants={itemVariants} key={game.id} onClick={() => game.isReady && setActiveGame(game.id)} className={`relative overflow-hidden rounded-[2rem] p-0 transition-all duration-300 group ${game.isReady ? 'hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(255,215,0,0.2)] cursor-pointer' : 'opacity-70 cursor-not-allowed grayscale-[50%]'} ${game.colSpan === 2 ? 'col-span-2 aspect-[2/1]' : 'col-span-1 aspect-square'}`}>
                <img src={game.image} alt={game.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent opacity-80"></div>
                <div className={`absolute inset-0 border-[2px] ${game.border} rounded-[2rem] opacity-30 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none`}></div>
                {game.badge && game.badge}
                <div className={`absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-md border-t border-white/10 flex flex-col items-center justify-center transition-all duration-300 ${game.colSpan === 2 ? 'p-4' : 'p-3'}`}>
                  <h3 className="font-black text-white tracking-widest uppercase leading-tight drop-shadow-md text-base md:text-lg">{game.name}</h3>
                  <div className="w-full mt-2">
                    {game.isReady ? <span className="flex items-center justify-center gap-1.5 w-full bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#4A0404] py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase shadow-[0_0_15px_rgba(255,215,0,0.5)] group-hover:scale-[1.02] transition-transform"><PlayCircle className="w-4 h-4" /> 立即开始</span> : <span className="flex items-center justify-center gap-1.5 w-full bg-gray-900/80 text-gray-400 border border-gray-600/50 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase"><Lock className="w-3 h-3" /> 即将推出</span>}
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      ) : activeGame === 'dt' ? (
        <DragonTiger balance={balance} socket={socket} />
      ) : activeGame === 'baccarat' ? (
        // 🚨 Baccarat ကို ချိတ်ဆက်ခြင်း 🚨
        <Baccarat balance={balance} socket={socket} />
      ) : activeGame === 'slots' ? (
        // 🚨 Slots ကို ချိတ်ဆက်ခြင်း 🚨
        <Slots balance={balance} socket={socket} />
      ) : activeGame === 'crash' ? (
        // 🚨 Aviator ကို ချိတ်ဆက်ခြင်း 🚨
        <Aviator balance={balance} socket={socket} />
      ) : (
        <div className="flex-1 bg-black/50">
          <BetTab isRollingUI={isRollingUI} displayDice={displayDice} playSoloBet={playSoloBet} jackpotAmount={jackpotAmount} />
        </div>
      )}
    </div>
  );
}
