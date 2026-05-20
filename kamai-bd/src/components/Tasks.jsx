import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { database, ref, get, update } from '../config/firebase';
import { TASKS, addReward, getTodayStr, checkDailyCheckin } from '../utils/helpers';
import { HiCheckCircle, HiArrowRight, HiSparkles } from 'react-icons/hi';

export default function Tasks() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState({});
  const [taskStates, setTaskStates] = useState({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user?.id) loadTaskStates();
  }, [user?.id]);

  const loadTaskStates = async () => {
    try {
      const userRef = ref(database, `users/${user.id}/tasksCompleted`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) setTaskStates(snapshot.val() || {});
    } catch (err) {
      console.error('Load tasks error:', err);
    }
  };

  const isTaskCompleted = (taskId) => {
    if (taskId === 'task_daily_checkin') {
      return !!taskStates[`task_daily_checkin_${getTodayStr()}`];
    }
    return !!taskStates[taskId];
  };

  const markTaskCompleted = async (taskId, taskKey = null) => {
    const key = taskKey || taskId;
    await update(ref(database), {
      [`users/${user.id}/tasksCompleted/${key}`]: true,
    });
    setTaskStates(prev => ({ ...prev, [key]: true }));
  };

  const handleVerify = async (task) => {
    setLoading(prev => ({ ...prev, [task.id]: true }));
    try {
      switch (task.id) {
        case 'task_join_channel': {
          const confirmed = window.confirm('আপনি কি চ্যানেলে জয়েন করেছেন?');
          if (!confirmed) {
            toast.error('জয়েন সম্পন্ন হলে আবার চেষ্টা করুন');
            return;
          }
          await markTaskCompleted(task.id);
          await addReward(user.id, task.reward);
          await refreshUser();
          toast.success(`🎉 +${task.reward} coins earned!`);
          break;
        }
        case 'task_adsgram': {
          const loadingToast = toast.loading('AdsGram Task চেক করা হচ্ছে...');
          await new Promise(r => setTimeout(r, 2000));
          await markTaskCompleted(task.id);
          await addReward(user.id, task.reward);
          await refreshUser();
          toast.dismiss(loadingToast);
          toast.success(`🎉 +${task.reward} coins earned!`);
          break;
        }
        case 'task_daily_checkin': {
          const alreadyChecked = await checkDailyCheckin(user.id);
          if (alreadyChecked) {
            toast.error('আজকে ইতিমধ্যে check-in সম্পন্ন করেছেন!');
            return;
          }
          const todayKey = `task_daily_checkin_${getTodayStr()}`;
          await markTaskCompleted(task.id, todayKey);
          await addReward(user.id, task.reward);
          await refreshUser();
          toast.success(`✅ +${task.reward} coins earned!`);
          break;
        }
        case 'task_share': {
          const shareUrl = `https://t.me/share/url?url=${encodeURIComponent('https://t.me/kamaibd_bot/app')}&text=${encodeURIComponent('Kamai BD তে জয়েন করুন এবং টাকা উপার্জন করুন! 🚀')}`;
          window.open(shareUrl, '_blank');
          await markTaskCompleted(task.id);
          await addReward(user.id, task.reward);
          await refreshUser();
          toast.success(`📤 +${task.reward} coins earned!`);
          break;
        }
        case 'task_profile': {
          if (!user?.firstName || user.firstName === 'User') {
            toast.error('প্রথমে আপনার প্রোফাইল সম্পূর্ণ করুন');
            return;
          }
          await markTaskCompleted(task.id);
          await addReward(user.id, task.reward);
          await refreshUser();
          toast.success(`👤 +${task.reward} coins earned!`);
          break;
        }
      }
    } catch (err) {
      console.error('Task verify error:', err);
      toast.error('ভেরিফিকেশন ব্যর্থ হয়েছে');
    } finally {
      setLoading(prev => ({ ...prev, [task.id]: false }));
    }
  };

  const completedCount = TASKS.filter(t => isTaskCompleted(t.id)).length;

  return (
    <div className={`pb-4 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Tasks</h1>
          <p className="text-xs text-white/40 mt-0.5">Complete tasks to earn coins</p>
        </div>
        <div className="glass rounded-xl px-3 py-2">
          <span className="text-xs text-white/60">{completedCount}/{TASKS.length}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="glass rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <HiSparkles className="text-amber-400" />
            <span className="text-sm text-white/80 font-medium">Task Progress</span>
          </div>
          <span className="text-xs text-white/40">{Math.round((completedCount / TASKS.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-amber-500 transition-all duration-700"
            style={{ width: `${(completedCount / TASKS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {TASKS.map((task, idx) => {
          const completed = isTaskCompleted(task.id);
          const isLoading = loading[task.id];

          return (
            <div
              key={task.id}
              className={`relative overflow-hidden rounded-2xl transition-all duration-300 card-hover animate-slide-up stagger-${idx + 1} ${
                completed
                  ? 'glass border-emerald-500/20'
                  : 'glass border-white/5'
              }`}
            >
              {completed && (
                <div className="absolute inset-0 bg-emerald-500/5" />
              )}

              <div className="relative p-4 flex items-center gap-3">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${
                  completed
                    ? 'bg-emerald-500/20'
                    : 'bg-gradient-to-br from-violet-500/20 to-indigo-500/20'
                }`}>
                  {completed ? '✅' : task.icon}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-white">{task.title}</h3>
                  <p className="text-xs text-white/40 mt-0.5 line-clamp-1">{task.description}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[10px] font-semibold text-violet-400">+{task.reward} coins</span>
                    {completed && (
                      <span className="text-[10px] text-emerald-400 ml-1">• Completed</span>
                    )}
                  </div>
                </div>

                {/* Action */}
                <div className="flex-shrink-0">
                  {completed ? (
                    <div className="flex items-center gap-1 text-emerald-400 text-xs">
                      <HiCheckCircle className="text-lg" />
                    </div>
                  ) : (
                    <button
                      onClick={() => handleVerify(task)}
                      disabled={isLoading}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1 ${
                        isLoading
                          ? 'bg-white/5 text-white/20 cursor-not-allowed'
                          : 'btn-primary text-white'
                      }`}
                    >
                      {isLoading ? (
                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <>
                          Verify
                          <HiArrowRight />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
