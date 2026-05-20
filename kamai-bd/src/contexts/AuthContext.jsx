import { createContext, useContext, useState, useEffect } from 'react';
import { database, ref, get, set, update } from '../config/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initTelegram = async () => {
      try {
        const tg = window.Telegram?.WebApp;
        if (tg) {
          tg.ready();
          tg.expand();
          const initData = tg.initDataUnsafe?.user;
          if (initData) {
            const telegramUser = {
              id: String(initData.id),
              firstName: initData.first_name || 'User',
              username: initData.username || `user_${initData.id}`,
              lastName: initData.last_name || '',
            };
            await findOrCreateUser(telegramUser);
          }
        }
      } catch (err) {
        console.error('Telegram init error:', err);
      } finally {
        setLoading(false);
      }
    };
    initTelegram();
  }, []);

  const findOrCreateUser = async (telegramUser) => {
    try {
      const userRef = ref(database, `users/${telegramUser.id}`);
      const snapshot = await get(userRef);

      const now = Date.now();
      const today = new Date().toISOString().split('T')[0];

      if (snapshot.exists()) {
        const userData = snapshot.val();
        await update(userRef, { lastActiveAt: now });
        setUser({
          ...userData,
          id: telegramUser.id,
          firstName: telegramUser.firstName,
          username: telegramUser.username,
        });
      } else {
        const newUser = {
          userId: telegramUser.id,
          username: telegramUser.username,
          firstName: telegramUser.firstName,
          balance: 0,
          totalEarned: 0,
          withdrawn: 0,
          referralCount: 0,
          referredBy: '',
          joinedAt: now,
          lastActiveAt: now,
          dailyWatchCount: 0,
          lastWatchDate: today,
          dailyBonusLastClaimed: 0,
          dailyBonusStreak: 0,
          tasksCompleted: {
            task_join_channel: false,
            task_adsgram: false,
            task_share: false,
            task_profile: false,
          },
        };
        await set(userRef, newUser);
        setUser({ ...newUser, id: telegramUser.id });
      }
    } catch (err) {
      console.error('User creation error:', err);
    }
  };

  const refreshUser = async () => {
    if (!user?.id) return;
    try {
      const userRef = ref(database, `users/${user.id}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        setUser(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error('Refresh user error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
