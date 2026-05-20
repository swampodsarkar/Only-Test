import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { database, ref, get, update } from '../config/firebase';
import { settings, getTodayStr, addReward, coinsToBDT } from '../utils/helpers';
import { HiPlay, HiVideoCamera, HiInformationCircle, HiClock } from 'react-icons/hi';

export default function Ads() {
  const { user, refreshUser } = useAuth();
  const [watching, setWatching] = useState(false);
  const [mounted, setMounted] = useState(false);

  const today = getTodayStr();
  const dailyWatchCount = user?.lastWatchDate === today ? (user?.dailyWatchCount || 0) : 0;
  const watchLimitReached = dailyWatchCount >= settings.dailyWatchLimit;
  const watchPercent = (dailyWatchCount / settings.dailyWatchLimit) * 100;

  const handleWatchAd = async () => {
    if (watchLimitReached) {
      toast.error(`দৈনিক লিমিট পূর্ণ! (${settings.dailyWatchLimit}/${settings.dailyWatchLimit})`);
      return;
    }

    setWatching(true);
    toast.loading('ভিডিও লোড হচ্ছে...');

    try {
      await new Promise(r => setTimeout(r, 1500));
      toast.dismiss();

      const confirmed = window.confirm('AdsGram: আপনি কি পুরো ভিডিও দেখেছেন?');
      if (!confirmed) {
        toast.error('দয়া করে পুরো ভিডিও দেখুন');
        setWatching(false);
        return;
      }

      const userRef = ref(database, `users/${user.id}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const updates = {};

        if (data.lastWatchDate === today) {
          updates['users/' + user.id + '/dailyWatchCount'] = (data.dailyWatchCount || 0) + 1;
        } else {
          updates['users/' + user.id + '/dailyWatchCount'] = 1;
          updates['users/' + user.id + '/lastWatchDate'] = today;
        }

        const weeklyKey = `weeklyEarned/${today}`;
        updates['users/' + user.id + '/' + weeklyKey] = (data.weeklyEarned?.[today] || 0) + settings.watchReward;

        await addReward(user.id, settings.watchReward);
        await update(ref(database), updates);
        await refreshUser();

        toast.success(`🎬 +${settings.watchReward} কয়েন অর্জন করেছেন!`);
      }
    } catch (err) {
      console.error('Watch ad error:', err);
      toast.error('ভিডিও প্রসেস করতে ব্যর্থ');
    } finally {
      setWatching(false);
    }
  };

  return (
    <div className={`pb-4 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-lg font-bold text-white">ভিডিও দেখে আয় করুন</h1>
        <p className="text-xs text-white/40 mt-0.5">ভিডিও দেখে তাৎক্ষণিক কয়েন অর্জন করুন</p>
      </div>

      {/* Hero Watch Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 mb-4 animate-slide-up stagger-1">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-cyan-600/10 to-blue-600/20" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-grid opacity-20" />

        {/* Content */}
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center animate-pulse-glow">
            <HiVideoCamera className="text-4xl text-white/80" />
          </div>

          <h2 className="text-lg font-bold text-white mb-1">রিওয়ার্ডেড ভিডিও</h2>
          <p className="text-sm text-white/50 mb-4">ছোট ভিডিও দেখে কয়েন অর্জন করুন</p>

          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-4">
            <span className="text-lg font-bold gradient-text-green">+{settings.watchReward}</span>
            <span className="text-xs text-white/60">কয়েন প্রতি ভিডিও</span>
          </div>

          <button
            onClick={handleWatchAd}
            disabled={watching || watchLimitReached}
            className={`w-full py-4 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
              watchLimitReached
                ? 'bg-white/5 text-white/20 cursor-not-allowed'
                : watching
                ? 'bg-white/10 text-white/40 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {watching ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                দেখা হচ্ছে...
              </>
            ) : (
              <>
                <HiPlay className="text-xl" />
                {watchLimitReached ? 'দৈনিক লিমিট পূর্ণ' : 'ভিডিও দেখে আয় করুন'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Card */}
      <div className="glass rounded-2xl p-4 mb-3 animate-slide-up stagger-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HiClock className="text-blue-400" />
            <span className="text-sm text-white/80 font-medium">আজকের অগ্রগতি</span>
          </div>
          <span className="text-xs text-white/40 font-mono">{dailyWatchCount} / {settings.dailyWatchLimit}</span>
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-700"
            style={{ width: `${watchPercent}%` }}
          />
        </div>
        <div className="flex items-start gap-2 mt-3">
          <HiInformationCircle className="text-blue-400 text-sm flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-white/30">
            প্রতিদিন {settings.dailyWatchLimit}টি ভিডিও দেখতে পারবেন। প্রতিটি ভিডিও {settings.watchReward} কয়েন দেয়।
          </p>
        </div>
      </div>

      {/* Earnings Card */}
      <div className="glass rounded-2xl p-4 animate-slide-up stagger-3">
        <p className="text-xs text-white/40 mb-1">আজকের ভিডিও থেকে আয়</p>
        <p className="text-3xl font-bold gradient-text-green">+{dailyWatchCount * settings.watchReward}</p>
        <p className="text-xs text-white/30 mt-0.5">কয়েন অর্জন করেছেন আজ</p>
        <p className="text-sm text-white/50 mt-1">≈ ৳{coinsToBDT(dailyWatchCount * settings.watchReward)}</p>
      </div>
    </div>
  );
}
