import { database, ref, get, update } from '../config/firebase';
import { HiSpeakerphone, HiVideoCamera, HiCheck, HiShare, HiUser } from 'react-icons/hi';

export const settings = {
  minWithdraw: 1000,
  exchangeRate: 20,
  dailyWatchLimit: 30,
  watchReward: 1,
  referralBonusReferrer: 20,
  referralBonusNewUser: 10,
  dailyBonusBase: 10,
  withdrawFee: 0.05,
};

export const TASKS = [
  {
    id: 'task_join_channel',
    title: 'Telegram চ্যানেল জয়েন করুন',
    reward: 20,
    icon: HiSpeakerphone,
    description: 'আমাদের Telegram চ্যানেলে জয়েন করুন এবং ২০ কয়েন উপার্জন করুন!',
  },
  {
    id: 'task_adsgram',
    title: 'Monetag ভিডিও অ্যাড দেখুন',
    reward: 30,
    icon: HiVideoCamera,
    description: 'Monetag ভিডিও অ্যাড সম্পন্ন করুন এবং ৩০ কয়েন উপার্জন করুন!',
  },
  {
    id: 'task_daily_checkin',
    title: 'দৈনিক চেক-ইন',
    reward: 10,
    icon: HiCheck,
    description: 'প্রতিদিন চেক-ইন করুন এবং ১০ কয়েন উপার্জন করুন!',
  },
  {
    id: 'task_share',
    title: '১ বন্ধুর সাথে শেয়ার করুন',
    reward: 50,
    icon: HiShare,
    description: 'অ্যাপটি একজন বন্ধুর সাথে শেয়ার করুন এবং ৫০ কয়েন উপার্জন করুন!',
  },
  {
    id: 'task_profile',
    title: 'প্রোফাইল সম্পূর্ণ করুন',
    reward: 15,
    icon: HiUser,
    description: 'আপনার প্রোফাইল সম্পূর্ণ করুন এবং ১৫ কয়েন উপার্জন করুন!',
  },
];

export const formatCoins = (amount) => {
  return amount.toLocaleString('en-US');
};

export const coinsToBDT = (coins) => {
  return (coins / settings.exchangeRate).toFixed(2);
};

export const calcWithdrawAmount = (coins) => {
  const fee = Math.round(coins * settings.withdrawFee);
  const net = coins - fee;
  return { fee, net, bdt: net / settings.exchangeRate };
};

export const getTodayStr = () => {
  return new Date().toISOString().split('T')[0];
};

export const checkDailyCheckin = async (userId) => {
  try {
    const userRef = ref(database, `users/${userId}/tasksCompleted`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const tasks = snapshot.val();
      const todayKey = `task_daily_checkin_${getTodayStr()}`;
      return !!tasks[todayKey];
    }
    return false;
  } catch {
    return false;
  }
};

export const addReward = async (userId, amount, field = 'balance') => {
  try {
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const updates = {};
      updates[field] = (data[field] || 0) + amount;
      updates.totalEarned = (data.totalEarned || 0) + amount;
      updates.lastActiveAt = Date.now();
      await update(userRef, updates);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};
