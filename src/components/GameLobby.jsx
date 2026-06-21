import React, { useState, useEffect } from 'react';
import { ArrowLeft, PlayCircle, Lock, Flame } from 'lucide-react';
import BetTab from './BetTab';
import DragonTiger from './DragonTiger';

export default function GameLobby({ balance, socket, isRollingUI, displayDice, playSoloBet, jackpotAmount }) {
  const [activeGame, setActiveGame] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // 🚨 ဘန်နာ (Slideshow) အတွက် ပုံလင့်ခ်များ 🚨
  const banners = [
    '/images/banner1.jpg',
    '/images/banner2.jpg',
    '/images/banner3.jpg'
  ];

  // 🚨 ၃ စက္ကန့်တစ်ခါ ဘန်နာပုံ အလိုလို ပြောင်းမည့် စနစ် 🚨
  useEffect(() => {
    if (activeGame) return; // ဂိမ်းထဲရောက်နေရင် Slideshow ရပ်ထားမည်
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [activeGame, banners.length]);

  // 🚨 ဂိမ်းစာရင်းနှင့် ဂိမ်းပုံများ (image နေရာတွင် မင်းရဲ့ ပုံနာမည်ကို ပြင်နိုင်သည်) 🚨
  const games = [
    { 
      id: 'dice', name: '富贵骰子', nameMM: 'FUGUI DICE', 
      image: '/images/dice.jpg', // <--- အန်စာတုံးပုံ
      border: 'border-[#FFD700]', 
      isReady: true, colSpan: 2, 
      badge: <span className="absolute top-3 left-3 z-20 flex items-center gap-1 bg-[#FFD700] text-black px-2 py-0.5 rounded text-[9px] font-black uppercase"><Flame className="w-3 h-3"/> 热门</span>
    },
    { 
      id: 'dt', name: '龙虎斗', nameMM: 'DRAGON TIGER', 
      image: '/images/dt.jpg', // <--- ကျားနဂါးပုံ
      border: 'border-red-500', 
      isReady: true, colSpan: 1 
    },
    { 
      id: 'baccarat', name: '百家乐', nameMM: 'BACCARAT', 
      image: '/images/baccarat.jpg', // <--- ဘက်ကရာပုံ
      border: 'border-gray-700', 
      isReady: false, colSpan: 1 
    },
    { 
      id: 'crash', name: '飞行者', nameMM: 'AVIATOR', 
      image: '/images/crash.jpg', // <--- ဒုံးပျံပုံ
      border: 'border-gray-700', 
      isReady: false, colSpan: 1 
    },
    { 
      id: 'slots', name: '老虎机', nameMM: 'SLOTS', 
      image: '/images/slots.jpg', // <--- စလော့ပုံ
      border: 'border-gray-700', 
      isReady: false, colSpan: 1 
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full">
      {activeGame && (
        <div className="bg-[#2A0000] p-3 flex items-center gap-3 border-b border-[#FFD700]/30 rounded-t-2xl shadow-[0_5px_15px_rgba(0,0,0,0.5)] z-10 relative">
          <button onClick={() => setActiveGame(null)} className="p-2 bg-black/50 border border-[#FFD700]/50 rounded-full text-[#FFD700] hover:scale-110 transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-[#FFD700] font-black tracking-widest uppercase drop-shadow-md">
            {games.find(g => g.id === activeGame)?.name}
          </h2>
        </div>
      )}

      {!activeGame ? (
        <div className="p-4 overflow-y-auto pb-24">
          
          {/* 🚨 1. SLIDESHOW BANNER 🚨 */}
          <div className="mb-6 relative overflow-hidden rounded-3xl border-2 border-[#FFD700]/30 shadow-[0_10px_20px_rgba(0,0,0,0.5)] h-40 md:h-48 bg-gray-900 group">
            {/* Banner ပုံပြမည့်နေရာ */}
            {banners.map((img, index) => (
              <img 
                key={index}
                src={img}
                alt={`Banner ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
              />
            ))}
            
            {/* အောက်ခြေက အစက်လေးများ (Slide Indicators) */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10">
              {banners.map((_, index) => (
                <div 
                  key={index} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-6 bg-[#FFD700]' : 'w-2 bg-white/50'}`}
                />
              ))}
            </div>
          </div>

          {/* 🚨 2. GAMES GRID SECTION (အောက်က ဂိမ်းပုံအစစ်များ) 🚨 */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg text-white font-black border-l-4 border-[#FFD700] pl-3 tracking-wider">游戏大厅 (LOBBY)</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {games.map((game) => (
              <button 
                key={game.id} 
                onClick={() => game.isReady && setActiveGame(game.id)}
                className={`relative overflow-hidden rounded-3xl p-0 transition-all shadow-xl group ${game.isReady ? 'hover:scale-[1.03] active:scale-[0.98] cursor-pointer' : 'opacity-60 cursor-not-allowed grayscale-[60%]'} ${game.colSpan === 2 ? 'col-span-2' : 'col-span-1'}`}
              >
                {/* 🚨 ဂိမ်းပုံအစစ်ကို Background အဖြစ်သုံးခြင်း 🚨 */}
                <img 
                  src={game.image} 
                  alt={game.name} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* ပုံပေါ်ကနေ စာဖတ်ရလွယ်အောင် အမည်းရောင် Gradient ခံပေးထားသည် */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90`}></div>
                
                {/* ဘေးက Border အရောင် */}
                <div className={`absolute inset-0 border-2 ${game.border} rounded-3xl opacity-40 group-hover:opacity-80 transition-opacity`}></div>

                {game.badge && game.badge}

                {/* စာသားများနှင့် ခလုတ်များ */}
                <div className={`relative z-10 flex flex-col items-center justify-end p-4 h-full ${game.colSpan === 2 ? 'min-h-[160px]' : 'min-h-[140px]'}`}>
                  <h3 className="font-black text-lg text-white tracking-widest uppercase leading-tight drop-shadow-md">{game.name}</h3>
                  <p className="text-[10px] text-[#FFD700] font-bold tracking-widest mt-1 mb-3">{game.nameMM}</p>

                  <div>
                    {game.isReady ? (
                      <span className="flex items-center justify-center gap-1 bg-[#FFD700] text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase shadow-[0_0_15px_rgba(255,215,0,0.4)]">
                        <PlayCircle className="w-3 h-3" /> 立即开始
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1 bg-black/80 text-gray-400 border border-gray-600 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase backdrop-blur-sm">
                        <Lock className="w-3 h-3" /> 即将推出
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : activeGame === 'dt' ? (
        <DragonTiger balance={balance} socket={socket} />
      ) : (
        <div className="flex-1 bg-black/50">
          <BetTab 
            isRollingUI={isRollingUI} 
            displayDice={displayDice} 
            playSoloBet={playSoloBet} 
            jackpotAmount={jackpotAmount} 
          />
        </div>
      )}
    </div>
  );
}
