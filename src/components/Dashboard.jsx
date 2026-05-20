import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatCoins, coinsToBDT, getTodayStr } from '../utils/helpers';
import { 
  HiHome, HiClipboardCheck, HiCurrencyDollar, HiCreditCard, 
  HiQuestionMarkCircle, HiBell, HiSparkles, HiPlay, HiStar, HiArrowUp,
  HiTrendingUp, HiUserGroup, HiEye, HiGift
} from 'react-icons/hi';
import DailyBonus from './DailyBonus';

export default function Dashboard() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const today = getTodayStr();
  const todayEarned = user?.weeklyEarned?.[today] || 0;
  const dailyWatchCount = user?.lastWatchDate === today ? (user?.dailyWatchCount || 0) : 0;
  const watchPercent = (dailyWatchCount / 20) * 100;

  return (
    <div className={`pb-24 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
            {(user?.firstName || 'K').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs text-white/50">আপনার অ্যাকাউন্ট</p>
            <h1 className="text-sm font-bold text-white">{user?.firstName || 'Kamal BD'}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
            <HiSparkles className="text-amber-400 text-lg" />
          </div>
          <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center relative">
            <HiBell className="text-white/70 text-lg" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0f0b1a]" />
          </div>
        </div>
      </div>

      {/* Cash Cash Banner */}
      <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center flex-shrink-0">
          <HiGift className="text-pink-400" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-pink-300">ক্যাশ ক্যাশ</p>
          <p className="text-[10px] text-white/40">নতুন ইউজারদের জন্য বোনাস ৫ টাকা</p>
        </div>
      </div>

      {/* Super Balance Card */}
      <div className="relative overflow-hidden rounded-3xl p-5 mb-4 animate-slide-up stagger-1">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-grid opacity-10" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HiSparkles className="text-white/80" />
              <span className="text-sm text-white/90 font-medium">সুপার ব্যালেন্স</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
              <span className="text-[10px] text-white font-semibold">টাকাতে দেখুন</span>
            </div>
          </div>

          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-4xl font-black text-white">৳</span>
            <span className="text-4xl font-black text-white">{coinsToBDT(user?.balance || 0)}</span>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <HiTrendingUp className="text-green-300 text-sm" />
              <span className="text-xs text-green-300 font-semibold">+{coinsToBDT(todayEarned)}</span>
            </div>
            <span className="text-[10px] text-white/50">আজকের আয়</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1 mr-3">
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-white transition-all duration-700"
                  style={{ width: `${Math.min(((user?.balance || 0) / 500) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-white/60 mt-1">
                {((user?.balance || 0) / 500 * 100).toFixed(0)}% উইথড্রালের জন্য
              </p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-white text-violet-600 font-bold text-xs hover:bg-white/90 transition-all active:scale-95">
              উইথড্র
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="glass rounded-2xl p-4 card-hover animate-slide-up stagger-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center">
              <HiTrendingUp className="text-green-400 text-sm" />
            </div>
          </div>
          <p className="text-[10px] text-white/40 uppercase tracking-wider">আজকের আয়</p>
          <p className="text-lg font-bold text-green-400 mt-0.5">+৳{coinsToBDT(todayEarned)}</p>
        </div>

        <div className="glass rounded-2xl p-4 card-hover animate-slide-up stagger-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <HiUserGroup className="text-purple-400 text-sm" />
            </div>
          </div>
          <p className="text-[10px] text-white/40 uppercase tracking-wider">রেফারেলস</p>
          <p className="text-lg font-bold text-white mt-0.5">{user?.referralCount || 0} বন্ধু</p>
        </div>
      </div>

      {/* Top Leaderboard */}
      <div className="glass rounded-2xl p-4 mb-4 card-hover animate-slide-up stagger-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <HiTrophy className="text-white text-lg" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">টপ লিডারবোর্ড</p>
              <p className="text-[10px] text-white/40">সেরা ইউজারদের তালিকা দেখুন</p>
            </div>
          </div>
          <div className="text-white/30">›</div>
        </div>
      </div>

      {/* Daily Tasks */}
      <div className="animate-slide-up stagger-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white">প্রতিদিনের কাজ</h2>
          <button className="text-xs text-violet-400 font-medium">সব দেখুন</button>
        </div>

        <div className="space-y-3">
          {/* Watch Video Ad */}
          <div className="glass rounded-2xl p-4 card-hover flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center flex-shrink-0">
              <HiPlay className="text-orange-400 text-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">ভিডিও অ্যাড দেখুন</p>
              <p className="text-[10px] text-white/40">+৳{coinsToBDT(10)} • {dailyWatchCount}/২০ দেখেছেন</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/20 transition-all active:scale-95">
              শুরু
            </button>
          </div>

          {/* Join as Promoter */}
          <div className="glass rounded-2xl p-4 card-hover flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <HiStar className="text-amber-400 text-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">প্রমোটার হিসেবে যোগ দিন</p>
              <p className="text-[10px] text-white/40">+৳৫.০০/রেফার • আজীবন আয়</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold text-xs hover:shadow-lg hover:shadow-amber-500/30 transition-all active:scale-95">
              যোগ দিন
            </button>
          </div>
        </div>
      </div>

      {/* Daily Bonus */}
      <div className="mt-4">
        <DailyBonus />
      </div>
    </div>
  );
}
