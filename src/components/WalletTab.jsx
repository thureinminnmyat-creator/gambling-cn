import { useState, useEffect } from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight, Copy, ChevronLeft, CreditCard, User, Phone, ImagePlus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SOCKET_URL = 'https://roll-dice-production.up.railway.app';

export default function WalletTab({ balance, userId, handleDeposit, handleWithdraw }) {
  const [activeAction, setActiveAction] = useState('menu');
  
  const [amountInput, setAmountInput] = useState('');
  const [payMethod, setPayMethod] = useState('alipay'); // kpay အစား alipay ပြောင်းထားသည်
  const [accPhone, setAccPhone] = useState('');
  const [accName, setAccName] = useState('');
  
  const [screenshot, setScreenshot] = useState(null);
  
  // 🚨 Admin ထည့်ထားသော WeChat / Alipay နံပါတ်များ သိမ်းရန်
  const [sysSettings, setSysSettings] = useState({ alipay: '加载中...', wechat: '加载中...' });

  useEffect(() => {
    fetch(`${SOCKET_URL}/api/settings`)
      .then(res => res.json())
      .then(data => {
        // Backend မှာ 'kpay' နဲ့ 'wave' လို့ သိမ်းထားရင်တောင် UI မှာ alipay နဲ့ wechat လို့ ပြမည်
        if (data) setSysSettings({ alipay: data.kpay || '', wechat: data.wave || '' });
      })
      .catch(console.error);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitDeposit = () => {
    handleDeposit({ amount: amountInput, screenshot: screenshot });
    setAmountInput('');
    setScreenshot(null);
    setActiveAction('menu');
  };

  const submitWithdraw = () => {
    handleWithdraw({ amount: amountInput, method: payMethod, accountPhone: accPhone, accountName: accName });
    setAmountInput(''); setAccPhone(''); setAccName('');
    setActiveAction('menu');
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pb-10">
      
      {/* --- Balance Display (Gold Theme) --- */}
      <div className="bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FF8C00] rounded-2xl p-6 text-[#4A0404] shadow-[0_10px_20px_rgba(255,215,0,0.3)] relative overflow-hidden border border-[#FFD700]">
        <div className="absolute top-0 right-0 p-4 opacity-20"><Wallet className="w-24 h-24" /></div>
        <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">总余额 (Total Balance)</p>
        <h2 className="text-4xl font-black mb-4 flex items-baseline gap-2">
          <span className="text-2xl">¥</span> {balance.toLocaleString()}
        </h2>
        <p className="text-[10px] font-black bg-black/10 inline-block px-3 py-1.5 rounded-full shadow-inner border border-[#4A0404]/10">UID: {userId}</p>
      </div>

      <AnimatePresence mode="wait">
        
        {/* --- Main Menu --- */}
        {activeAction === 'menu' && (
          <motion.div key="menu" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="grid grid-cols-2 gap-4">
            <button onClick={() => setActiveAction('deposit')} className="flex flex-col items-center justify-center gap-3 py-8 bg-gradient-to-b from-green-700 to-green-900 border-b-4 border-green-950 rounded-2xl shadow-[0_5px_15px_rgba(0,255,0,0.2)] active:translate-y-1 transition-all">
              <div className="bg-green-500/30 p-3 rounded-full border border-[#00FF00]/30"><ArrowDownLeft className="w-8 h-8 text-[#00FF00]" /></div>
              <span className="font-black text-lg tracking-widest text-white drop-shadow-md">充值</span> {/* Deposit */}
            </button>
            <button onClick={() => setActiveAction('withdraw')} className="flex flex-col items-center justify-center gap-3 py-8 bg-gradient-to-b from-[#8B0000] to-[#4A0404] border-b-4 border-black rounded-2xl shadow-[0_5px_15px_rgba(255,0,0,0.3)] active:translate-y-1 transition-all">
              <div className="bg-red-500/30 p-3 rounded-full border border-red-500/30"><ArrowUpRight className="w-8 h-8 text-red-400" /></div>
              <span className="font-black text-lg tracking-widest text-white drop-shadow-md">提现</span> {/* Withdraw */}
            </button>
          </motion.div>
        )}

        {/* --- Deposit Form --- */}
        {activeAction === 'deposit' && (
          <motion.div key="deposit" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="bg-[#1A0000] p-5 rounded-2xl border border-[#FFD700]/30 shadow-lg">
            <button onClick={() => setActiveAction('menu')} className="flex items-center text-[#FFD700]/70 hover:text-[#FFD700] mb-4 font-bold text-sm transition-colors">
              <ChevronLeft className="w-5 h-5 mr-1" /> 返回 {/* Back */}
            </button>
            
            {/* 🚨 Admin WeChat & Alipay Numbers Display 🚨 */}
            <div className="bg-[#2A0000]/60 border border-[#FFD700]/40 p-4 rounded-xl mb-5 text-center space-y-3 shadow-inner">
              <div>
                <p className="text-[10px] text-[#00a1e9] uppercase tracking-widest mb-1 font-bold">支付宝收款码 (Alipay)</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-lg font-black text-[#FFD700] tracking-wider">{sysSettings.alipay}</span>
                  <button onClick={() => { navigator.clipboard.writeText(sysSettings.alipay); alert('支付宝账号已复制! (Copied)'); }} className="p-1.5 bg-black/30 rounded-lg hover:bg-black/50 transition border border-[#FFD700]/20">
                    <Copy className="w-4 h-4 text-[#00a1e9]" />
                  </button>
                </div>
              </div>
              <div className="border-t border-[#FFD700]/20 pt-3">
                <p className="text-[10px] text-[#09B83E] uppercase tracking-widest mb-1 font-bold">微信收款码 (WeChat Pay)</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-lg font-black text-[#FFD700] tracking-wider">{sysSettings.wechat}</span>
                  <button onClick={() => { navigator.clipboard.writeText(sysSettings.wechat); alert('微信号已复制! (Copied)'); }} className="p-1.5 bg-black/30 rounded-lg hover:bg-black/50 transition border border-[#FFD700]/20">
                    <Copy className="w-4 h-4 text-[#09B83E]" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FFD700]/50" />
                <input type="number" placeholder="充值金额 (¥)" value={amountInput} onChange={(e) => setAmountInput(e.target.value)} className="w-full bg-[#2A0000] border border-[#FFD700]/30 py-3.5 pl-12 pr-4 rounded-xl focus:outline-none focus:border-[#FFD700] text-[#FFD700] font-bold placeholder-[#FFD700]/30 shadow-inner" />
              </div>

              <div className="border-2 border-dashed border-[#FFD700]/40 rounded-xl p-4 text-center relative overflow-hidden bg-[#2A0000]/50 hover:bg-[#2A0000] transition-colors">
                {!screenshot ? (
                  <>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                      <ImagePlus className="w-8 h-8 text-[#FFD700]/60" />
                      <p className="text-xs font-bold text-[#FFD700]/80 tracking-widest">上传转账截图 (Upload Receipt)</p>
                    </div>
                  </>
                ) : (
                  <div className="relative flex justify-center">
                    <img src={screenshot} alt="Receipt Preview" className="h-32 object-contain rounded-lg border border-[#FFD700]/50 shadow-[0_0_15px_rgba(255,215,0,0.2)]" />
                    <button onClick={() => setScreenshot(null)} className="absolute -top-2 -right-2 bg-red-600 p-1.5 rounded-full text-white shadow-lg hover:bg-red-500 border border-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <button onClick={submitDeposit} className="w-full py-4 bg-gradient-to-r from-green-600 to-green-800 text-white font-black rounded-xl tracking-widest shadow-[0_5px_15px_rgba(0,255,0,0.2)] active:scale-95 transition-transform border border-[#00FF00]/50">
                确认充值 (Confirm)
              </button>
            </div>
          </motion.div>
        )}

        {/* --- Withdraw Form --- */}
        {activeAction === 'withdraw' && (
          <motion.div key="withdraw" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="bg-[#1A0000] p-5 rounded-2xl border border-[#FFD700]/30 shadow-lg">
            <button onClick={() => setActiveAction('menu')} className="flex items-center text-[#FFD700]/70 hover:text-[#FFD700] mb-4 font-bold text-sm transition-colors">
              <ChevronLeft className="w-5 h-5 mr-1" /> 返回 {/* Back */}
            </button>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 mb-2">
                {/* Alipay Button */}
                <button onClick={() => setPayMethod('alipay')} className={`py-3 rounded-xl font-bold border transition-all ${payMethod === 'alipay' ? 'bg-[#00a1e9]/20 text-[#00a1e9] border-[#00a1e9] shadow-[0_0_15px_rgba(0,161,233,0.3)]' : 'bg-[#2A0000] text-[#FFD700]/50 border-[#FFD700]/20'}`}>
                  支付宝 (Alipay)
                </button>
                {/* WeChat Button */}
                <button onClick={() => setPayMethod('wechat')} className={`py-3 rounded-xl font-bold border transition-all ${payMethod === 'wechat' ? 'bg-[#09B83E]/20 text-[#09B83E] border-[#09B83E] shadow-[0_0_15px_rgba(9,184,62,0.3)]' : 'bg-[#2A0000] text-[#FFD700]/50 border-[#FFD700]/20'}`}>
                  微信 (WeChat)
                </button>
              </div>

              <div className="relative">
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FFD700]/50" />
                <input type="number" placeholder="提现金额 (¥)" value={amountInput} onChange={(e) => setAmountInput(e.target.value)} className="w-full bg-[#2A0000] border border-[#FFD700]/30 py-3.5 pl-12 pr-4 rounded-xl focus:outline-none focus:border-[#FFD700] text-[#FFD700] font-bold placeholder-[#FFD700]/30 shadow-inner" />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FFD700]/50" />
                <input type="text" placeholder="收款账号 (Account No.)" value={accPhone} onChange={(e) => setAccPhone(e.target.value)} className="w-full bg-[#2A0000] border border-[#FFD700]/30 py-3.5 pl-12 pr-4 rounded-xl focus:outline-none focus:border-[#FFD700] text-[#FFD700] font-bold placeholder-[#FFD700]/30 shadow-inner" />
              </div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FFD700]/50" />
                <input type="text" placeholder="收款人姓名 (Name)" value={accName} onChange={(e) => setAccName(e.target.value)} className="w-full bg-[#2A0000] border border-[#FFD700]/30 py-3.5 pl-12 pr-4 rounded-xl focus:outline-none focus:border-[#FFD700] text-[#FFD700] font-bold placeholder-[#FFD700]/30 shadow-inner" />
              </div>

              <button onClick={submitWithdraw} className="w-full py-4 bg-gradient-to-r from-[#8B0000] to-[#4A0404] text-white font-black rounded-xl tracking-widest shadow-[0_5px_15px_rgba(255,0,0,0.3)] active:scale-95 transition-transform mt-2 border border-red-500/50">
                确认提现 (Confirm)
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}