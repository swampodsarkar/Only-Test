import { useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { database, ref, get, update } from '../config/firebase';
import { settings, getTodayStr, addReward, coinsToBDT } from '../utils/helpers';
import { HiPlay, HiVideoCamera, HiClock, HiInformationCircle } from 'react-icons/hi';

export default function Ads() {
  const { user, refreshUser } = useAuth();
  const [claiming, setClaiming] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  const today = getTodayStr();
  const dailyWatchCount = user?.lastWatchDate === today ? (user?.dailyWatchCount || 0) : 0;
  const watchLimitReached = dailyWatchCount >= settings.dailyWatchLimit;
  const watchPercent = (dailyWatchCount / settings.dailyWatchLimit) * 100;

  const startTimer = useCallback(() => {
    setTimer(30);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleClaim = async () => {
    if (timer > 0) return;
    if (watchLimitReached) {
      toast.error(`দৈনিক লিমিট পূর্ণ! (${settings.dailyWatchLimit}/${settings.dailyWatchLimit})`);
      return;
    }

    setClaiming(true);
    try {
      const userRef = ref(database, `users/${user.id}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        const updates = {};

        if (data.lastWatchDate === today) {
          updates[`users/${user.id}/dailyWatchCount`] = (data.dailyWatchCount || 0) + 1;
        } else {
          updates[`users/${user.id}/dailyWatchCount`] = 1;
          updates[`users/${user.id}/lastWatchDate`] = today;
        }

        await addReward(user.id, settings.watchReward);
        await update(ref(database), updates);
        await refreshUser();

        toast.success(`+${settings.watchReward} কয়েন অর্জন করেছেন!`);
      }
    } catch (err) {
      toast.error('ক্লেইম করতে ব্যর্থ। আবার চেষ্টা করুন');
    } finally {
      setClaiming(false);
      setTimer(0);
    }
  };

  return (
    <div className="pb-4 animate-fade-in">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-white">ভিডিও দেখে আয় করুন</h1>
        <p className="text-xs text-white/40 mt-0.5">৩০ সেকেন্ড অপেক্ষা করে কয়েন অর্জন করুন</p>
      </div>

      <div className="relative overflow-hidden rounded-3xl p-6 mb-4 animate-slide-up">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-teal-600/10 to-emerald-600/20" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-grid opacity-20" />

        <div className="relative z-10 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-emerald-500/30 to-teal-500/30 flex items-center justify-center animate-pulse-glow">
            <HiVideoCamera className="text-4xl text-white/80" />
          </div>

          {timer > 0 ? (
            <>
              <h2 className="text-lg font-bold text-white mb-1">অপেক্ষা করুন...</h2>
              <p className="text-5xl font-black gradient-text-green mb-4">{timer}s</p>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden max-w-xs mx-auto mb-4">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000" style={{ width: `${((30 - timer) / 30) * 100}%` }} />
              </div>
              <p className="text-xs text-white/40">ভিডিও দেখার মত অপেক্ষা করুন</p>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-white mb-1">রিওয়ার্ডেড ভিডিও</h2>
              <p className="text-sm text-white/50 mb-4">৩০ সেকেন্ড অপেক্ষা করে কয়েন অর্জন করুন</p>

              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-4">
                <span className="text-lg font-bold gradient-text-green">+{settings.watchReward}</span>
                <span className="text-xs text-white/60">কয়েন</span>
              </div>

              {!timer && timerRef.current === null ? (
                <button
                  onClick={startTimer}
                  disabled={watchLimitReached}
                  className={`w-full py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    watchLimitReached
                      ? 'bg-white/5 text-white/20 cursor-not-allowed'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02]'
                  }`}
                >
                  <HiPlay className="text-xl" />
                  {watchLimitReached ? 'দৈনিক লিমিট পূর্ণ' : 'শুরু করুন'}
                </button>
              ) : (
                <button
                  onClick={handleClaim}
                  disabled={claiming}
                  className="w-full py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {claiming ? 'প্রসেসিং...' : `${settings.watchReward} কয়েন ক্লেইম করুন`}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="glass rounded-2xl p-4 mb-3 animate-slide-up">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HiClock className="text-emerald-400" />
            <span className="text-sm text-white/80 font-medium">আজকের অগ্রগতি</span>
          </div>
          <span className="text-xs text-white/40 font-mono">{dailyWatchCount} / {settings.dailyWatchLimit}</span>
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700" style={{ width: `${watchPercent}%` }} />
        </div>
        <div className="flex items-start gap-2 mt-3">
          <HiInformationCircle className="text-emerald-400 text-sm flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-white/30">প্রতিদিন {settings.dailyWatchLimit}টি ভিডিও ক্লেইম করতে পারবেন। ১০০০ কয়েন = ৫০৳</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 animate-slide-up">
        <p className="text-xs text-white/40 mb-1">আজকের ভিডিও থেকে আয়</p>
        <p className="text-3xl font-bold gradient-text-green">+{dailyWatchCount * settings.watchReward}</p>
        <p className="text-xs text-white/30 mt-0.5">কয়েন অর্জন করেছেন আজ</p>
        <p className="text-sm text-white/50 mt-1">≈ ৳{coinsToBDT(dailyWatchCount * settings.watchReward)}</p>
      </div>
    </div>
  );
}
