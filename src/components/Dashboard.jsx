import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { formatCoins, coinsToBDT, getTodayStr } from '../utils/helpers';
import { HiCurrencyDollar, HiTrendingUp, HiClock, HiEye, HiVideoCamera, HiCheckCircle, HiUserGroup, HiCash } from 'react-icons/hi';
import DailyBonus from './DailyBonus';

export default function Dashboard() {
  const { user } = useAuth();
  const [showBdt, setShowBdt] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const today = getTodayStr();
  const todayEarned = user?.weeklyEarned?.[today] || 0;
  const dailyWatchCount = user?.lastWatchDate === today ? (user?.dailyWatchCount || 0) : 0;
  const watchPercent = (dailyWatchCount / 20) * 100;

  return (
    <div className={`space-y-4 pb-4 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs text-dark-400 uppercase tracking-wider">Welcome back</p>
          <h1 className="text-xl font-bold text-white">{user?.firstName || 'User'}</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm">
          {(user?.firstName || 'U').charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Hero Balance Card */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 cursor-pointer animate-slide-up stagger-1"
        onClick={() => setShowBdt(!showBdt)}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-indigo-600/10 to-purple-600/20" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-grid opacity-30" />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <HiCurrencyDollar className="text-lg text-violet-300" />
            </div>
            <span className="text-sm text-white/70 font-medium">Available Balance</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white tracking-tight">
              {formatCoins(user?.balance || 0)}
            </span>
            <span className="text-lg text-violet-300 font-semibold">coins</span>
          </div>

          {showBdt && (
            <div className="mt-2 animate-scale-in">
              <span className="text-sm text-white/60">≈ ৳</span>
              <span className="text-lg text-white font-bold">{coinsToBDT(user?.balance || 0)}</span>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-400 to-indigo-400 transition-all duration-700"
                style={{ width: `${Math.min(((user?.balance || 0) / 500) * 100, 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-white/50">
              {((user?.balance || 0) / 500 * 100).toFixed(0)}% to withdraw
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-4 card-hover animate-slide-up stagger-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <HiTrendingUp className="text-emerald-400 text-sm" />
            </div>
          </div>
          <p className="text-[10px] text-white/40 uppercase tracking-wider">Total Earned</p>
          <p className="text-lg font-bold text-white mt-0.5">{formatCoins(user?.totalEarned || 0)}</p>
        </div>

        <div className="glass rounded-2xl p-4 card-hover animate-slide-up stagger-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <HiClock className="text-amber-400 text-sm" />
            </div>
          </div>
          <p className="text-[10px] text-white/40 uppercase tracking-wider">Today</p>
          <p className="text-lg font-bold gradient-text-gold mt-0.5">+{formatCoins(todayEarned)}</p>
        </div>

        <div className="glass rounded-2xl p-4 card-hover animate-slide-up stagger-4 col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <HiEye className="text-blue-400 text-sm" />
              </div>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Daily Watch Progress</p>
            </div>
            <span className="text-xs text-white/60 font-medium">{dailyWatchCount}/20</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full progress-bar transition-all duration-700"
              style={{ width: `${watchPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-white/30 mt-1.5">
            {dailyWatchCount >= 20 ? '✅ Limit reached' : `${20 - dailyWatchCount} videos remaining`}
          </p>
        </div>
      </div>

      {/* Daily Bonus */}
      <DailyBonus />

      {/* Quick Actions */}
      <div className="glass rounded-2xl p-4 animate-slide-up stagger-5">
        <p className="text-[10px] text-white/40 uppercase tracking-wider mb-3">Quick Actions</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: HiVideoCamera, label: 'Watch Ads', color: 'bg-blue-500/10' },
            { icon: HiCheckCircle, label: 'Tasks', color: 'bg-green-500/10' },
            { icon: HiUserGroup, label: 'Refer', color: 'bg-purple-500/10' },
            { icon: HiCash, label: 'Withdraw', color: 'bg-amber-500/10' },
          ].map((action) => (
            <button
              key={action.label}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all active:scale-95"
            >
              <action.icon className="text-xl text-white/70" />
              <span className="text-[10px] text-white/60">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Exchange Rate Info */}
      <div className="glass rounded-2xl p-4 animate-slide-up stagger-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/50">Exchange Rate</p>
            <p className="text-sm text-white/80 font-medium mt-0.5">10 coins = ৳1 BDT</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/50">Min Withdraw</p>
            <p className="text-sm text-violet-400 font-medium mt-0.5">500 coins (৳50)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
