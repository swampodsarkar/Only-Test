import { useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { settings, getTodayStr, coinsToBDT } from '../utils/helpers';
import { loadMonitagSDK, showRewardedAd, verifyWithServer as verifyMonetag } from '../utils/monitag';
import { loadAdsGramSDK, showAdsGramReward, verifyWithServer as verifyAdsGram } from '../utils/adsgram';
import { HiPlay, HiVideoCamera, HiInformationCircle, HiClock, HiShieldCheck, HiSparkles } from 'react-icons/hi';

const PROVIDERS = [
  { id: 'monetag', label: 'Monetag', icon: HiShieldCheck, color: 'from-violet-500 to-indigo-500' },
  { id: 'adsgram', label: 'AdsGram', icon: HiSparkles, color: 'from-emerald-500 to-teal-500' },
];

export default function Ads() {
  const { user, refreshUser } = useAuth();
  const [watching, setWatching] = useState(false);
  const [provider, setProvider] = useState('adsgram');
  const [sdkReady, setSdkReady] = useState({ monetag: false, adsgram: false });
  const [manualMode, setManualMode] = useState(false);
  const [manualTimer, setManualTimer] = useState(30);
  const timerRef = useRef(null);

  const today = getTodayStr();
  const dailyWatchCount = user?.lastWatchDate === today ? (user?.dailyWatchCount || 0) : 0;
  const watchLimitReached = dailyWatchCount >= settings.dailyWatchLimit;
  const watchPercent = (dailyWatchCount / settings.dailyWatchLimit) * 100;

  const startManualTimer = useCallback(() => {
    setManualMode(true);
    setManualTimer(30);
    timerRef.current = setInterval(() => {
      setManualTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const claimManualReward = async () => {
    if (manualTimer > 0) return;
    try {
      setWatching(true);
      toast.loading('ভেরিফাই করা হচ্ছে...');
      await verifyAdsGram(user.id);
      await refreshUser();
      toast.dismiss();
      toast.success(`+${settings.watchReward} কয়েন অর্জন করেছেন!`);
      setManualMode(false);
    } catch (err) {
      toast.dismiss();
      toast.error('ভেরিফিকেশন ব্যর্থ');
    } finally {
      setWatching(false);
    }
  };

  const handleWatchAd = async () => {
    if (watchLimitReached) {
      toast.error(`দৈনিক লিমিট পূর্ণ! (${settings.dailyWatchLimit}/${settings.dailyWatchLimit})`);
      return;
    }

    setWatching(true);
    toast.loading(`${provider === 'monetag' ? 'Monetag' : 'AdsGram'} ভিডিও লোড হচ্ছে...`);

    try {
      const verifyServer = provider === 'monetag' ? verifyMonetag : verifyAdsGram;

      if (provider === 'monetag') {
        if (!sdkReady.monetag) {
          await loadMonitagSDK();
          setSdkReady(prev => ({ ...prev, monetag: true }));
        }
        await showRewardedAd();
      } else {
        if (!sdkReady.adsgram) {
          await loadAdsGramSDK();
          setSdkReady(prev => ({ ...prev, adsgram: true }));
        }
        await showAdsGramReward();
      }

      toast.dismiss();
      toast.loading('সার্ভার ভেরিফিকেশন চলছে...');
      await verifyServer(user.id);
      await refreshUser();
      toast.dismiss();
      toast.success(`${provider === 'monetag' ? 'Monetag' : 'AdsGram'}: +${settings.watchReward} কয়েন অর্জন করেছেন!`);

    } catch (err) {
      toast.dismiss();
      if (err.message === 'Ad dismissed') {
        toast.error('ভিডিওটি শেষ পর্যন্ত দেখুন');
      } else {
        toast.error('SDK অ্যাড লোড করতে ব্যর্থ। ম্যানুয়াল অপশন ব্যবহার করুন');
        startManualTimer();
      }
    } finally {
      setWatching(false);
    }
  };

  const currentProvider = PROVIDERS.find(p => p.id === provider);

  return (
    <div className="pb-4 animate-fade-in">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-white">ভিডিও দেখে আয় করুন</h1>
        <p className="text-xs text-white/40 mt-0.5">ভিডিও দেখে তাৎক্ষণিক কয়েন অর্জন করুন</p>
      </div>

      <div className="glass rounded-2xl p-1.5 mb-4 flex animate-slide-up stagger-1">
        {PROVIDERS.map(p => (
          <button
            key={p.id}
            onClick={() => setProvider(p.id)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
              provider === p.id
                ? 'bg-gradient-to-r ' + p.color + ' text-white shadow-lg'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <p.icon className="text-sm" />
            {p.label}
          </button>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-3xl p-6 mb-4 animate-slide-up stagger-1">
        <div className={`absolute inset-0 bg-gradient-to-br ${provider === 'monetag' ? 'from-violet-600/20 via-indigo-600/10 to-violet-600/20' : 'from-emerald-600/20 via-teal-600/10 to-emerald-600/20'}`} />
        <div className={`absolute -top-20 -right-20 w-40 h-40 ${provider === 'monetag' ? 'bg-violet-500/20' : 'bg-emerald-500/20'} rounded-full blur-3xl`} />
        <div className="absolute inset-0 bg-grid opacity-20" />

        <div className="relative z-10 text-center">
          <div className={`w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br ${provider === 'monetag' ? 'from-violet-500/30 to-indigo-500/30' : 'from-emerald-500/30 to-teal-500/30'} flex items-center justify-center animate-pulse-glow`}>
            <HiVideoCamera className="text-4xl text-white/80" />
          </div>

          <h2 className="text-lg font-bold text-white mb-1">
            {manualMode ? 'ম্যানুয়াল ভেরিফিকেশন' : `${currentProvider.label} রিওয়ার্ডেড ভিডিও`}
          </h2>
          <p className="text-sm text-white/50 mb-4">
            {manualMode ? '৩০ সেকেন্ড অপেক্ষা করে ক্লেইম করুন' : 'ছোট ভিডিও দেখে কয়েন অর্জন করুন'}
          </p>

          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-3">
            <span className="text-lg font-bold gradient-text-green">+{settings.watchReward}</span>
            <span className="text-xs text-white/60">কয়েন</span>
          </div>

          <div className="flex items-center justify-center gap-1 mb-4">
            <currentProvider.icon className="text-emerald-400 text-xs" />
            <span className="text-[10px] text-emerald-400/60">{currentProvider.label} দ্বারা সুরক্ষিত</span>
          </div>

          {manualMode ? (
            <div className="space-y-3">
              {manualTimer > 0 ? (
                <div className="py-4 rounded-2xl bg-white/5 text-center">
                  <p className="text-3xl font-bold text-white mb-1">{manualTimer}s</p>
                  <p className="text-xs text-white/40">অপেক্ষা করুন...</p>
                  <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000" style={{ width: `${((30 - manualTimer) / 30) * 100}%` }} />
                  </div>
                </div>
              ) : (
                <button
                  onClick={claimManualReward}
                  disabled={watching}
                  className="w-full py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {watching ? 'প্রসেসিং...' : `${settings.watchReward} কয়েন ক্লেইম করুন`}
                </button>
              )}
              <button
                onClick={() => setManualMode(false)}
                className="w-full py-2 text-xs text-white/40 hover:text-white/60 transition-all"
              >
                SDK অ্যাড ব্যবহার করুন
              </button>
            </div>
          ) : (
            <button
              onClick={handleWatchAd}
              disabled={watching || watchLimitReached}
              className={`w-full py-4 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                watchLimitReached
                  ? 'bg-white/5 text-white/20 cursor-not-allowed'
                  : watching
                  ? 'bg-white/10 text-white/40 cursor-not-allowed'
                  : `bg-gradient-to-r ${currentProvider.color} text-white hover:shadow-lg hover:shadow-${provider === 'monetag' ? 'violet' : 'emerald'}-500/30 hover:scale-[1.02] active:scale-[0.98]`
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
          )}
        </div>
      </div>

      <div className="glass rounded-2xl p-4 mb-3 animate-slide-up stagger-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HiClock className="text-violet-400" />
            <span className="text-sm text-white/80 font-medium">আজকের অগ্রগতি</span>
          </div>
          <span className="text-xs text-white/40 font-mono">{dailyWatchCount} / {settings.dailyWatchLimit}</span>
        </div>
        <div className="h-3 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${provider === 'monetag' ? 'from-violet-500 to-indigo-500' : 'from-emerald-500 to-teal-500'} transition-all duration-700`}
            style={{ width: `${watchPercent}%` }}
          />
        </div>
        <div className="flex items-start gap-2 mt-3">
          <HiInformationCircle className="text-violet-400 text-sm flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-white/30">
            প্রতিদিন {settings.dailyWatchLimit}টি ভিডিও দেখতে পারবেন। প্রতিটি ভিডিও {settings.watchReward} কয়েন দেয়। ১০০০ কয়েন = ৫০৳
          </p>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 animate-slide-up stagger-3">
        <p className="text-xs text-white/40 mb-1">আজকের ভিডিও থেকে আয়</p>
        <p className="text-3xl font-bold gradient-text-green">+{dailyWatchCount * settings.watchReward}</p>
        <p className="text-xs text-white/30 mt-0.5">কয়েন অর্জন করেছেন আজ</p>
        <p className="text-sm text-white/50 mt-1">≈ ৳{coinsToBDT(dailyWatchCount * settings.watchReward)}</p>
      </div>
    </div>
  );
}
