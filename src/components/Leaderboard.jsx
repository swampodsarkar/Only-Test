import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { database, ref, get } from '../config/firebase';
import { formatCoins, coinsToBDT } from '../utils/helpers';
import { HiSparkles, HiArrowLeft, HiUser } from 'react-icons/hi';

export default function Leaderboard() {
  const { user } = useAuth();
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const usersList = Object.entries(data)
          .map(([id, userData]) => ({
            id,
            ...userData,
          }))
          .sort((a, b) => (b.totalEarned || 0) - (a.totalEarned || 0))
          .slice(0, 20);
        setTopUsers(usersList);
      }
    } catch (err) {
      console.error('Load leaderboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUserRank = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <div className={`pb-4 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => window.history.back()}
          className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"
        >
          <HiArrowLeft className="text-white/70" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">টপ লিডারবোর্ড</h1>
          <p className="text-xs text-white/40">সেরা ২০ ইউজার</p>
        </div>
      </div>

      {/* Top 3 Cards */}
      {topUsers.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {/* 2nd Place */}
          <div className="glass rounded-2xl p-3 text-center animate-slide-up stagger-1">
            <div className="text-2xl mb-1">🥈</div>
            <div className="w-10 h-10 mx-auto rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center mb-2">
              <HiUser className="text-white text-lg" />
            </div>
            <p className="text-[10px] text-white/60 truncate">{topUsers[1]?.firstName || 'User'}</p>
            <p className="text-xs font-bold text-white mt-0.5">{formatCoins(topUsers[1]?.totalEarned || 0)}</p>
          </div>

          {/* 1st Place */}
          <div className="glass rounded-2xl p-3 text-center border border-amber-500/30 animate-slide-up stagger-2">
            <div className="text-2xl mb-1"></div>
            <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-2">
              <HiUser className="text-white text-xl" />
            </div>
            <p className="text-[10px] text-white/60 truncate">{topUsers[0]?.firstName || 'User'}</p>
            <p className="text-sm font-bold text-amber-400 mt-0.5">{formatCoins(topUsers[0]?.totalEarned || 0)}</p>
          </div>

          {/* 3rd Place */}
          <div className="glass rounded-2xl p-3 text-center animate-slide-up stagger-3">
            <div className="text-2xl mb-1"></div>
            <div className="w-10 h-10 mx-auto rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mb-2">
              <HiUser className="text-white text-lg" />
            </div>
            <p className="text-[10px] text-white/60 truncate">{topUsers[2]?.firstName || 'User'}</p>
            <p className="text-xs font-bold text-white mt-0.5">{formatCoins(topUsers[2]?.totalEarned || 0)}</p>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-white/20" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : topUsers.length === 0 ? (
          <div className="text-center py-12">
            <HiSparkles className="text-4xl text-white/20 mx-auto mb-3" />
            <p className="text-sm text-white/30">কোনো ইউজার নেই</p>
          </div>
        ) : (
          topUsers.slice(3).map((u, idx) => (
            <div
              key={u.id}
              className={`glass rounded-xl p-3 flex items-center gap-3 card-hover ${
                u.id === user?.id ? 'border border-violet-500/30 bg-violet-500/5' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm font-bold text-white/60">
                {getUserRank(idx + 3)}
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/30 flex items-center justify-center flex-shrink-0">
                <HiUser className="text-white/70 text-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {u.firstName || 'User'}
                  {u.id === user?.id && <span className="text-[10px] text-violet-400 ml-1">(আপনি)</span>}
                </p>
                <p className="text-[10px] text-white/30">{u.username || ''}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-white">{formatCoins(u.totalEarned || 0)}</p>
                <p className="text-[10px] text-white/30">কয়েন</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
