import React, { useState, useEffect } from 'react';
import { ArrowLeft, PlayCircle, Lock, Flame, Sparkles, Dices, Rocket, Swords, Cherry, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import BetTab from './BetTab';
import DragonTiger from './DragonTiger';
import Baccarat from './Baccarat';
import Slots from './Slots';
import Aviator from './Aviator';

export default function GameLobby({ balance, socket, isRollingUI, displayDice, playSoloBet, jackpotAmount }) {
  const [activeGame, setActiveGame] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');

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

  const categories = [
    { id: 'all', name: '全部 (ALL)', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { id: 'dice', name: '骰子 (DICE)', icon: <Dices className="w-3.5 h-3.5" /> },
    { id: 'cards', name: '扑克 (CARDS)', icon: <Swords className="w-3.5 h-3.5" /> },
    { id: 'slots', name: '老虎机 (SLOTS)', icon: <Cherry className="w-3.5 h-3.5" /> },
    { id: 'crash', name: '飞行者 (CRASH)', icon: <Rocket className="w-3.5 h-3.5" /> }
  ];

  // 🚨 1. Dice ဂိမ်းများ (အားလုံးကို colSpan: 1 တူညီအောင် ညှိထားသည်) 🚨
  const diceGames = [
    { id: 'dice-1', category: 'dice', name: '富贵骰子', nameMM: 'FUGUI DICE', image: '/images/dice.jpg', border: 'border-[#FFD700]', isReady: true, colSpan: 1, badge: <span className="absolute top-2 left-2 z-20 flex items-center gap-0.5 bg-gradient-to-r from-red-600 to-[#FFD700] text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase shadow-[0_0_8px_rgba(255,215,0,0.6)] animate-pulse"><Flame className="w-2.5 h-2.5 text-yellow-200"/> 热门</span> },
    { id: 'dice-2', category: 'dice', name: '幸运骰子', nameMM: 'LUCKY DICE', image: '/images/dice.jpg', border: 'border-orange-400', isReady: true, colSpan: 1 },
    { id: 'dice-3', category: 'dice', name: '极速骰子', nameMM: 'SPEED DICE', image: '/images/dice.jpg', border: 'border-red-500', isReady: true, colSpan: 1 }
  ];

  // 🚨 2. Cards ဂိမ်းများ (အားလုံးကို colSpan: 1 တူညီအောင် ညှိထားသည်) 🚨
  const cardGames = [
    { id: 'dt-1', category: 'cards', name: '龙虎斗', nameMM: 'DRAGON TIGER', image: '/images/dt.jpg', border: 'border-red-500', isReady: true, colSpan: 1, badge: <span className="absolute top-2 left-2 z-20 flex items-center gap-0.5 bg-gradient-to-r from-red-600 to-[#FFD700] text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase shadow-[0_0_8px_rgba(255,215,0,0.6)] animate-pulse"><Flame className="w-2.5 h-2.5 text-yellow-200"/> 热门</span> },
    { id: 'baccarat-1', category: 'cards', name: '百家乐', nameMM: 'BACCARAT', image: '/images/baccarat.jpg', border: 'border-purple-500', isReady: true, colSpan: 1 },
    { id: 'baccarat-2', category: 'cards', name: '极速百家乐', nameMM: 'SPEED BACCARAT', image: '/images/baccarat.jpg', border: 'border-blue-500', isReady: true, colSpan: 1 },
    { id: 'dt-2', category: 'cards', name: '极速龙虎', nameMM: 'SPEED DRAGON TIGER', image: '/images/dt.jpg', border: 'border-green-500', isReady: true, colSpan: 1 },
    { id: 'baccarat-3', category: 'cards', name: '贵宾百家乐', nameMM: 'VIP BACCARAT', image: '/images/baccarat.jpg', border: 'border-[#FFD700]', isReady: true, colSpan: 1 }
  ];

  // 🚨 3. Crash ဂိမ်းများ (အားလုံးကို colSpan: 1 တူညီအောင် ညှိထားသည်) 🚨
  const crashGames = [
    { id: 'crash-1', category: 'crash', name: '飞行者', nameMM: 'AVIATOR', image: '/images/crash.jpg', border: 'border-blue-500', isReady: true, colSpan: 1 },
    { id: 'crash-2', category: 'crash', name: '太空侠', nameMM: 'SPACEMAN', image: '/images/crash.jpg', border: 'border-indigo-400', isReady: true, colSpan: 1 }
  ];

  // 🚨 4. Slots ဂိမ်းများ 🚨
  const slotGames = [
    { id: 'slots-1', category: 'slots', name: '经典老虎机', nameMM: 'CLASSIC SLOTS', image: '/images/slots.jpg', border: 'border-emerald-500', isReady: true, colSpan: 1 },
    { id: 'slots-2', category: 'slots', name: '财神到', nameMM: 'GOD OF WEALTH', image: '/images/slots.jpg', border: 'border-red-500', isReady: true, colSpan: 1, badge: <span className="absolute top-2 left-2 z-20 flex items-center gap-0.5 bg-gradient-to-r from-red-600 to-[#FFD700] text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase shadow-[0_0_10px_rgba(255,215,0,0.6)] animate-pulse"><Flame className="w-2.5 h-2.5 text-yellow-200"/> 热门</span> },
    { id: 'slots-3', category: 'slots', name: '熊猫财富', nameMM: 'PANDA FORTUNE', image: '/images/slots.jpg', border: 'border-green-400', isReady: true, colSpan: 1 },
    { id: 'slots-4', category: 'slots', name: '甜蜜暴击', nameMM: 'SWEET BONANZA', image: '/images/slots.jpg', border: 'border-pink-400', isReady: true, colSpan: 1, badge: <span className="absolute top-2 left-2 z-20 flex items-center gap-0.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black uppercase shadow-[0_0_10px_rgba(236,72,153,0.6)]">HOT</span> },
    { id: 'slots-5', category: 'slots', name: '众神之王', nameMM: 'GATES OF OLYMPUS', image: '/images/slots.jpg', border: 'border-yellow-400', isReady: true, colSpan: 1 },
    { id: 'slots-6', category: 'slots', name: '麻将胡了', nameMM: 'MAHJONG WAYS', image: '/images/slots.jpg', border: 'border-red-600', isReady: true, colSpan: 1 },
    { id: 'slots-7', category: 'slots', name: '金龙发财', nameMM: 'GOLDEN DRAGON', image: '/images/slots.jpg', border: 'border-yellow-500', isReady: true, colSpan: 1 },
    { id: 'slots-8', category: 'slots', name: '水果派对', nameMM: 'FRUIT PARTY', image: '/images/slots.jpg', border: 'border-orange-400', isReady: true, colSpan: 1 },
    { id: 'slots-9', category: 'slots', name: '埃及艳后', nameMM: 'CLEOPATRA', image: '/images/slots.jpg', border: 'border-purple-500', isReady: true, colSpan: 1 },
    { id: 'slots-10', category: 'slots', name: '幸运777', nameMM: 'LUCKY 777', image: '/images/slots.jpg', border: 'border-blue-400', isReady: true, colSpan: 1 },
    { id: 'slots-11', category: 'slots', name: '锦鲤', nameMM: 'KOI GATE', image: '/images/slots.jpg', border: 'border-red-400', isReady: true, colSpan: 1 },
    { id: 'slots-12', category: 'slots', name: '摇钱树', nameMM: 'MONEY TREE', image: '/images/slots.jpg', border: 'border-green-500', isReady: true, colSpan: 1 },
    { id: 'slots-13', category: 'slots', name: '聚宝盆', nameMM: 'TREASURE BOWL', image: '/images/slots.jpg', border: 'border-yellow-600', isReady: true, colSpan: 1 },
    { id: 'slots-14', category: 'slots', name: '宝石传奇', nameMM: 'GEMS LEGEND', image: '/images/slots.jpg', border: 'border-cyan-400', isReady: true, colSpan: 1 },
    { id: 'slots-15', category: 'slots', name: '野生之王', nameMM: 'SAFARI KING', image: '/images/slots.jpg', border: 'border-amber-600', isReady: true, colSpan: 1 },
    { id: 'slots-16', category: 'slots', name: '黄金列车', nameMM: 'GOLDEN TRAIN', image: '/images/slots.jpg', border: 'border-yellow-300', isReady: true, colSpan: 1 },
    { id: 'slots-17', category: 'slots', name: '幸运双星', nameMM: 'LUCKY TWINS', image: '/images/slots.jpg', border: 'border-rose-400', isReady: true, colSpan: 1 },
    { id: 'slots-18', category: 'slots', name: '斯巴达', nameMM: 'SPARTAN', image: '/images/slots.jpg', border: 'border-stone-400', isReady: true, colSpan: 1 },
    { id: 'slots-19', category: 'slots', name: '疯马', nameMM: 'CRAZY HORSE', image: '/images/slots.jpg', border: 'border-amber-700', isReady: true, colSpan: 1 },
    { id: 'slots-20', category: 'slots', name: '财富之轮', nameMM: 'WHEEL OF FORTUNE', image: '/images/slots.jpg', border: 'border-indigo-400', isReady: true, colSpan: 1 }
  ];

  const games = [...diceGames, ...cardGames, ...crashGames, ...slotGames];
  const filteredGames = activeCategory === 'all' ? games : games.filter(g => g.category === activeCategory);

  return (
    <div className="flex-1 flex flex-col h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#3A0000] via-black to-black">
      
      {activeGame && (
        <div className="bg-black/80 backdrop-blur-md p-3 flex items-center gap-3 border-b border-[#FFD700]/30 z-20 relative">
          <button onClick={() => setActiveGame(null)} className="p-2 bg-white/5 border border-[#FFD700]/50 rounded-full text-[#FFD700] hover:scale-110 transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-[#FFD700] font-black tracking-widest uppercase drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]">
            {games.find(g => g.id === activeGame)?.name}
          </h2>
        </div>
      )}

      {!activeGame ? (
        <div className="p-2 overflow-y-auto pb-24 flex flex-col space-y-3 md:space-y-4">
          
          {/* Slider Banner */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative overflow-hidden rounded-2xl border border-[#FFD700]/40 shadow-lg h-32 md:h-44 bg-black group flex-shrink-0">
            {banners.map((img, index) => (
              <img key={index} src={img} alt={`Banner ${index + 1}`} className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`} />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none"></div>
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
              {banners.map((_, index) => <div key={index} className={`h-1.5 rounded-full transition-all duration-500 ${index === currentSlide ? 'w-5 bg-[#FFD700] shadow-[0_0_8px_rgba(255,215,0,0.8)]' : 'w-2 bg-white/40 backdrop-blur-sm'}`} />)}
            </div>
          </motion.div>

          {/* Category Tabs */}
          <div className="flex overflow-x-auto gap-2 pb-1 pt-1 sticky top-0 z-10" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style>{`div::-webkit-scrollbar { display: none; }`}</style>
            
            {categories.map((cat) => (
              <button 
                key={cat.id} 
                onClick={() => setActiveCategory(cat.id)} 
                className={`flex-none flex items-center gap-1.5 px-3 py-2 rounded-full whitespace-nowrap transition-all duration-300 border-[1.5px] ${
                  activeCategory === cat.id 
                    ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#4A0404] border-white/50 shadow-[0_0_10px_rgba(255,215,0,0.4)] scale-[1.02]' 
                    : 'bg-black/60 text-gray-400 border-gray-700 hover:border-[#FFD700]/50 shadow-inner'
                }`}
              >
                {cat.icon}
                <span className="font-black text-[10px] md:text-xs tracking-widest">{cat.name}</span>
              </button>
            ))}
          </div>

          {/* 🚨 All Cards Grid (အားလုံးကို col-span-1 aspect-[4/5] ဖြင့် ပုံသေ သတ်မှတ်လိုက်သည်) 🚨 */}
          <motion.div layout className="grid grid-cols-2 gap-2 md:gap-3">
            <AnimatePresence>
              {filteredGames.map((game) => (
                <motion.button 
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                  key={game.id} 
                  onClick={() => game.isReady && setActiveGame(game.id)} 
                  className={`relative overflow-hidden rounded-2xl p-0 transition-all duration-300 group ${
                    game.isReady ? 'hover:-translate-y-1 hover:shadow-[0_10px_15px_rgba(255,215,0,0.2)] cursor-pointer' : 'opacity-70 cursor-not-allowed grayscale-[50%]'
                  } col-span-1 aspect-[4/5]`} /* 👈 ဒီနေရာမှာ အကုန်အရွယ်အစား တူသွားပါပြီ */
                >
                  {/* object-cover object-center ကြောင့် ပုံများ ကွက်တိ လှလှပပ ဝင်ဆံ့နေမည်ဖြစ်သည် */}
                  <img src={game.image} alt={game.name} className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90"></div>
                  <div className={`absolute inset-0 border-[1.5px] ${game.border} rounded-2xl opacity-30 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none`}></div>
                  
                  {game.badge && game.badge}
                  
                  {/* စာသားများကိုလည်း အလယ်ဗဟိုတွင် စနစ်တကျ ညှိပေးထားသည် */}
                  <div className="absolute bottom-0 left-0 right-0 flex flex-col justify-end text-center p-2.5 h-full items-center">
                    <h3 className="font-black text-white tracking-widest uppercase leading-tight drop-shadow-md text-sm md:text-base mb-0.5">{game.name}</h3>
                    <p className="text-[8px] md:text-[10px] text-white/60 font-bold mb-1.5 tracking-widest">{game.nameMM}</p>
                    
                    {game.isReady ? (
                      <span className="flex items-center justify-center gap-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#4A0404] py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase shadow-[0_0_10px_rgba(255,215,0,0.4)] group-hover:scale-[1.05] transition-transform w-full">
                        <PlayCircle className="w-3 h-3" /> 立即开始
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1 bg-gray-900/80 text-gray-400 border border-gray-600/50 py-1 rounded-full text-[8px] md:text-[9px] font-bold uppercase w-full">
                        <Lock className="w-2.5 h-2.5" /> 即将推出
                      </span>
                    )}
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
          
        </div>
      ) : activeGame && activeGame.startsWith('dt') ? (
        <DragonTiger balance={balance} socket={socket} />
      ) : activeGame && activeGame.startsWith('baccarat') ? (
        <Baccarat balance={balance} socket={socket} />
      ) : activeGame && activeGame.startsWith('slots') ? (
        <Slots balance={balance} socket={socket} />
      ) : activeGame && activeGame.startsWith('crash') ? (
        <Aviator balance={balance} socket={socket} />
      ) : (
        <div className="flex-1 bg-black/50">
          <BetTab isRollingUI={isRollingUI} displayDice={displayDice} playSoloBet={playSoloBet} jackpotAmount={jackpotAmount} />
        </div>
      )}
    </div>
  );
}
