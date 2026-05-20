import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { database, ref, get, update } from '../config/firebase';
import { addReward, settings } from '../utils/helpers';
import { HiShare, HiUserGroup, HiLink, HiClipboard } from 'react-icons/hi';

export default function Referral() {
  const { user, refreshUser } = useAuth();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  const referralLink = `https://t.me/kamaibd_bot/app?start=${user?.id || ''}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      toast.success('📋 Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error('Failed to copy');
    });
  };

  const handleShare = () => {
    const text = `🚀 Join Kamai BD and start earning coins!\n\n✅ Complete tasks\n📺 Watch ads\n💰 Withdraw real money\n\n👉 ${referralLink}\n\nUse my link to get 50 bonus coins!`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
    toast.success('Shared successfully!');
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
        <h1 className="text-xl font-bold text-white">Refer & Earn</h1>
        <p className="text-xs text-white/40 mt-0.5">Invite friends and earn bonus coins</p>
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
          <h2 className="text-lg font-bold text-white mb-1">Invite Friends</h2>
          <p className="text-sm text-white/50 mb-4">Both you and your friend earn bonus coins!</p>

          {/* Bonus Cards */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="glass rounded-xl p-3">
              <p className="text-2xl font-bold gradient-text">{settings.referralBonusReferrer}</p>
              <p className="text-[10px] text-white/40">Your Bonus</p>
            </div>
            <div className="glass rounded-xl p-3">
              <p className="text-2xl font-bold gradient-text-green">{settings.referralBonusNewUser}</p>
              <p className="text-[10px] text-white/40">Friend's Bonus</p>
            </div>
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleShare}
            className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 btn-primary text-white mb-2"
          >
            <HiShare className="text-lg" />
            Share with Friends
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
                Copied!
              </>
            ) : (
              <>
                <HiLink className="text-lg" />
                Copy Referral Link
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
            <p className="text-xs text-white/40">Total Referrals</p>
            <p className="text-2xl font-bold text-white">{user?.referralCount || 0}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/40">Earned</p>
            <p className="text-lg font-bold gradient-text">+{(user?.referralCount || 0) * settings.referralBonusReferrer}</p>
          </div>
        </div>
      </div>

      {/* Link Display */}
      <div className="glass rounded-2xl p-4 animate-slide-up stagger-3">
        <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Your Referral Link</p>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs text-violet-300 break-all font-mono">{referralLink}</p>
        </div>
        <p className="text-[10px] text-white/20 mt-2">
          Share this link. When friends join, both earn bonus coins!
        </p>
      </div>
    </div>
  );
}
