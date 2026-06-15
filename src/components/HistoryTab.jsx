import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HistoryTab({ betHistory, txHistory, isLoading }) {
  const [historyTab, setHistoryTab] = useState('tx');

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      {/* Tabs Switcher (ရွှေရောင် အပြင်အဆင်) */}
      <div className="grid grid-cols-2 gap-2 mb-4 bg-[#2A0000]/60 p-1.5 rounded-xl border border-[#FFD700]/30 shadow-inner">
        <button 
          onClick={() => setHistoryTab('bets')} 
          className={`py-2 rounded-lg text-xs font-bold tracking-widest transition-all ${historyTab === 'bets' ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#4A0404] shadow-[0_0_10px_rgba(255,215,0,0.5)]' : 'text-[#FFD700]/60 hover:text-[#FFD700]/80'}`}
        >
          投注记录 {/* Bet History */}
        </button>
        <button 
          onClick={() => setHistoryTab('tx')} 
          className={`py-2 rounded-lg text-xs font-bold tracking-widest transition-all ${historyTab === 'tx' ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#4A0404] shadow-[0_0_10px_rgba(255,215,0,0.5)]' : 'text-[#FFD700]/60 hover:text-[#FFD700]/80'}`}
        >
          交易记录 {/* Transactions */}
        </button>
      </div>

      <div className="space-y-3 h-[65vh] overflow-y-auto pb-20 pr-1">
        
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-40 mt-10">
            <Loader2 className="w-10 h-10 text-[#FFD700] animate-spin" />
            <p className="text-[#FFD700]/70 mt-3 text-sm font-bold tracking-widest">加载中...</p> {/* Loading... */}
          </div>
        ) : (
          <>
            {/* =======================
                BET HISTORY VIEW
                ======================= */}
            {historyTab === 'bets' ? (
              betHistory.length > 0 ? betHistory.map((h, i) => (
                <div key={i} className="bg-[#1A0000] p-3.5 rounded-xl border border-[#FFD700]/20 flex justify-between items-center shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                  <div>
                    <span className={`text-[12px] font-black px-3 py-1 rounded-md border ${
                      h.betType === 'under' ? 'bg-blue-900/60 text-blue-300 border-blue-500/40' : 
                      h.betType === 'over' ? 'bg-red-900/60 text-red-300 border-red-500/40' : 
                      'bg-green-900/60 text-green-300 border-green-500/40'
                    }`}>
                      {h.betType === 'under' ? '小' : h.betType === 'over' ? '大' : '平'}
                    </span>
                    <p className="text-[10px] text-[#FFD700]/50 mt-2">{new Date(h.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#FFD700]/80">下注: ¥ {h.amount.toLocaleString()}</p>
                    <p className={`text-sm font-black mt-1 ${h.result === 'win' ? 'text-[#00FF00] drop-shadow-[0_0_5px_rgba(0,255,0,0.4)]' : 'text-red-500/80'}`}>
                      {h.result === 'win' ? `+ ¥ ${h.payout.toLocaleString()}` : '未中'} {/* 未中 = Lose */}
                    </p>
                  </div>
                </div>
              )) : <p className="text-center text-sm text-[#FFD700]/50 mt-10">暂无投注记录</p> // No records
            ) : (
              
            /* =======================
               TRANSACTIONS VIEW
               ======================= */
              txHistory.length > 0 ? txHistory.map((t, i) => (
                <div key={i} className="bg-[#1A0000] p-3.5 rounded-xl border border-[#FFD700]/20 flex justify-between items-center shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full border ${t.type === 'deposit' ? 'bg-green-900/30 text-[#00FF00] border-[#00FF00]/30' : 'bg-red-900/30 text-red-400 border-red-500/30'}`}>
                      {t.type === 'deposit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-black tracking-wider text-[#FFD700]">
                        {t.type === 'deposit' ? '充值' : '提现'} {/* Deposit / Withdraw */}
                      </p>
                      <p className="text-[10px] text-[#FFD700]/50 mt-0.5">{new Date(t.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-sm font-black text-[#FFD700]">¥ {t.amount.toLocaleString()}</span>
                    
                    {/* Status Badges */}
                    {t.status === 'approved' && (
                      <span className="flex items-center gap-1 bg-green-900/40 text-[#00FF00] px-2 py-0.5 rounded text-[10px] font-bold border border-[#00FF00]/30 shadow-[0_0_5px_rgba(0,255,0,0.2)]">
                        <CheckCircle className="w-3 h-3" /> 成功 {/* Approved */}
                      </span>
                    )}
                    {t.status === 'rejected' && (
                      <span className="flex items-center gap-1 bg-red-900/40 text-red-400 px-2 py-0.5 rounded text-[10px] font-bold border border-red-500/30 shadow-[0_0_5px_rgba(255,0,0,0.2)]">
                        <XCircle className="w-3 h-3" /> 失败 {/* Rejected */}
                      </span>
                    )}
                    {t.status === 'pending' && (
                      <span className="flex items-center gap-1 bg-amber-900/40 text-[#FFD700] px-2 py-0.5 rounded text-[10px] font-bold border border-[#FFD700]/30 shadow-[0_0_5px_rgba(255,215,0,0.2)]">
                        <Clock className="w-3 h-3 animate-pulse" /> 处理中 {/* Pending */}
                      </span>
                    )}
                  </div>
                </div>
              )) : <p className="text-center text-sm text-[#FFD700]/50 mt-10">暂无交易记录</p> // No tx records
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}