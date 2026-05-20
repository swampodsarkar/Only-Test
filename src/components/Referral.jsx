import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { database, ref, get, update } from '../config/firebase';
import { addReward, settings, coinsToBDT } from '../utils/helpers';
import { HiShare, HiUserGroup, HiLink, HiClipboard } from 'react-icons/hi';

export default function Referral() {
  const { user, refreshUser } = useAuth();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  const referralLink = `https://t.me/kamaibd_bot/app?start=${user?.id || ''}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      toast.success('📋 রেফারেল লিংক কপি হয়েছে!');
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error('কপি করতে ব্যর্থ');
    });
  };

  const handleShare = () => {
    const text = `🚀 Kamai BD তে জয়েন করুন এবং কয়েন অর্জন শুরু করুন!\n\n✅ কাজ সম্পন্ন করুন\n📺 ভিডিও দেখুন\n💰 আসল টাকা উইথড্র করুন\n\n👉 ${referralLink}\n\nআমার লিংক ব্যবহার করে ৫০ বোনাস কয়েন পান!`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
    toast.success('শেয়ার সফল হয়েছে!');
  };

  const handleReferUser = async (referredUserId) => {
    try {
      const referredUserRef = ref(database, `users/${referredUserId}/referredBy`);
      const snapshot = await get(referredUserRef);
      if (snapshot.exists() && snapshot.val()) return;

      await update(ref(database), {
        [`users/${referredUserId}/referredBy`]: user.id,
        [`users/${referredUserId}/balance`]: (user.balance || 0) + settings.referralBonusNewUser,
        [`users/${referredUserId}/totalEarned`]: (user.totalEarned || 0) + settings.referralBonusNewUser,
      });

      await update(ref(database), {
        [`users/${user.id}/balance`]: (user.balance || 0) + settings.referralBonusReferrer,
        [`users/${user.id}/totalEarned`]: (user.totalEarned || 0) + settings.referralBonusReferrer,
        [`users/${user.id}/referralCount`]: (user.referralCount || 0) + 1,
      });

      await refreshUser();
    } catch (err) {
      console.error('Referral processing error:', err);
    }
  };

  return (
    <div className={`pb-4 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-lg font-bold text-white">রেফার করে আয় করুন</h1>
        <p className="text-xs text-white/40 mt-0.5">বন্ধুদের আমন্ত্রণ জানান এবং বোনাস কয়েন অর্জন করুন</p>
      </div>

      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 mb-4 animate-slide-up stagger-1">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/10 to-purple-600/20" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-grid opacity-20" />

        <div className="relative z-10 text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center animate-bounce-subtle">
            <HiUserGroup className="text-3xl text-purple-400" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">বন্ধুদের আমন্ত্রণ জানান</h2>
          <p className="text-sm text-white/50 mb-4">আপনি এবং আপনার বন্ধু উভয়েই বোনাস কয়েন পাবেন!</p>

          {/* Bonus Cards */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="glass rounded-xl p-3">
              <p className="text-2xl font-bold gradient-text">{settings.referralBonusReferrer}</p>
              <p className="text-[10px] text-white/40">আপনার বোনাস</p>
            </div>
            <div className="glass rounded-xl p-3">
              <p className="text-2xl font-bold gradient-text-green">{settings.referralBonusNewUser}</p>
              <p className="text-[10px] text-white/40">বন্ধুর বোনাস</p>
            </div>
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleShare}
            className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 btn-primary text-white mb-2"
          >
            <HiShare className="text-lg" />
            বন্ধুদের সাথে শেয়ার করুন
          </button>
          <button
            onClick={handleCopyLink}
            className={`w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              copied
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'glass text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            {copied ? (
              <>
                <HiClipboard className="text-lg" />
                কপি হয়েছে!
              </>
            ) : (
              <>
                <HiLink className="text-lg" />
                রেফারেল লিংক কপি করুন
              </>
            )}
          </button>
        </div>
      </div>

      {/* Referral Stats */}
      <div className="glass rounded-2xl p-4 mb-3 animate-slide-up stagger-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <HiUserGroup className="text-xl text-purple-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-white/40">মোট রেফারেল</p>
            <p className="text-2xl font-bold text-white">{user?.referralCount || 0}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/40">অর্জিত</p>
            <p className="text-lg font-bold gradient-text">+{(user?.referralCount || 0) * settings.referralBonusReferrer}</p>
          </div>
        </div>
      </div>

      {/* Link Display */}
      <div className="glass rounded-2xl p-4 animate-slide-up stagger-3">
        <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">আপনার রেফারেল লিংক</p>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs text-violet-300 break-all font-mono">{referralLink}</p>
        </div>
        <p className="text-[10px] text-white/20 mt-2">
          এই লিংকটি শেয়ার করুন। বন্ধুরা জয়েন করলে উভয়েই বোনাস কয়েন পাবেন!
        </p>
      </div>
    </div>
  );
}
