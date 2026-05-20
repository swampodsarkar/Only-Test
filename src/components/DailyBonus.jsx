import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { database, ref, get, update } from '../config/firebase';
import { addReward, settings, coinsToBDT } from '../utils/helpers';
import { HiGift, HiFire, HiSparkles } from 'react-icons/hi';

const STREAK_REWARDS = {
  1: 30,
  2: 30,
  3: 40,
  4: 40,
  5: 50,
  6: 50,
  7: 100,
};

export default function DailyBonus() {
  const { user, refreshUser } = useAuth();
  const [claiming, setClaiming] = useState(false);

  const now = Date.now();
  const lastClaimed = user?.dailyBonusLastClaimed || 0;
  const streak = user?.dailyBonusStreak || 0;

  const hoursSinceLastClaim = (now - lastClaimed) / (1000 * 60 * 60);
  const canClaim = hoursSinceLastClaim >= 24 || lastClaimed === 0;

  const currentReward = STREAK_REWARDS[Math.min(streak + 1, 7)] || 30;
  const nextReward = STREAK_REWARDS[Math.min(streak + 2, 7)] || 30;

  const handleClaim = async () => {
    if (!canClaim) {
      const nextIn = Math.ceil(24 - hoursSinceLastClaim);
      toast.error(`পরবর্তী বোনাস ${nextIn} ঘণ্টায়`);
      return;
    }

    setClaiming(true);
    try {
      const rewardAmount = STREAK_REWARDS[Math.min(streak + 1, 7)] || 30;
      let newStreak = streak + 1;

      if (newStreak > 7) newStreak = 1;
      if (streak > 0 && hoursSinceLastClaim > 48) newStreak = 1;

      await update(ref(database), {
        [`users/${user.id}/dailyBonusLastClaimed`]: now,
        [`users/${user.id}/dailyBonusStreak`]: newStreak,
      });

      await addReward(user.id, rewardAmount);
      await refreshUser();

      toast.success(`🔥 দৈনিক বোনাস ক্লেইম হয়েছে! +${rewardAmount} কয়েন`);
    } catch (err) {
      console.error('Daily bonus error:', err);
      toast.error('বোনাস ক্লেইম করতে ব্যর্থ');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 animate-slide-up stagger-4 ${
      canClaim ? 'border border-amber-500/20' : 'glass'
    }`}>
      {/* Background */}
      <div className={`absolute inset-0 ${
        canClaim
          ? 'bg-gradient-to-br from-amber-600/10 via-orange-600/5 to-amber-600/10'
          : 'bg-white/[0.02]'
      }`} />
      {canClaim && (
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl animate-pulse" />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              canClaim ? 'bg-amber-500/20' : 'bg-white/5'
            }`}>
              <HiGift className={`text-lg ${canClaim ? 'text-amber-400' : 'text-white/30'}`} />
            </div>
            <h3 className="font-bold text-white">দৈনিক বোনাস</h3>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1 text-orange-400">
              <HiFire className="text-sm" />
              <span className="text-xs font-bold">{streak} দিন স্ট্রিক</span>
            </div>
          )}
        </div>

        {/* Streak Tracker */}
        <div className="flex items-center justify-center gap-1.5 mb-4">
          {Array.from({ length: 7 }, (_, i) => {
            const dayNum = i + 1;
            const isCompleted = i < streak;
            const isCurrent = i === streak && canClaim;
            const reward = STREAK_REWARDS[dayNum];

            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20'
                      : isCurrent
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 animate-pulse-glow'
                      : 'bg-white/5 text-white/20 border border-white/5'
                  }`}
                >
                  {isCompleted ? '✓' : dayNum}
                </div>
                <span className={`text-[8px] ${
                  isCompleted || isCurrent ? 'text-amber-400/60' : 'text-white/10'
                }`}>
                  +{reward}
                </span>
              </div>
            );
          })}
        </div>

        {/* Reward Display */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-1.5">
            <HiSparkles className="text-amber-400" />
            <span className="text-2xl font-black gradient-text-gold">+{currentReward}</span>
            <span className="text-sm text-white/40">কয়েন</span>
          </div>
          {streak > 0 && streak < 7 && (
            <p className="text-[10px] text-white/20 mt-1">
              পরবর্তী: +{nextReward} কয়েন (দিন {Math.min(streak + 1, 7)})
            </p>
          )}
          {streak >= 7 && (
            <p className="text-[10px] text-amber-400/50 mt-1">
              <HiFire className="inline text-xs" /> সর্বোচ্চ স্ট্রিক! ক্লেইম করার পর রিসেট হবে।
            </p>
          )}
        </div>

        {/* Claim Button */}
        <button
          onClick={handleClaim}
          disabled={claiming || !canClaim}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
            !canClaim
              ? 'bg-white/5 text-white/20 cursor-not-allowed'
              : claiming
              ? 'bg-white/10 text-white/40 cursor-not-allowed'
              : 'btn-gold text-white'
          }`}
        >
          {claiming ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              ক্লেইম হচ্ছে...
            </span>
          ) : canClaim ? (
            `${currentReward} কয়েন ক্লেইম করুন`
          ) : (
            `পরবর্তী ${Math.ceil(24 - hoursSinceLastClaim)} ঘণ্টায়`
          )}
        </button>
      </div>
    </div>
  );
}
