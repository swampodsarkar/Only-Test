import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { database, ref, get, push, set } from '../config/firebase';
import { formatCoins, coinsToBDT, settings } from '../utils/helpers';
import { HiCash, HiClock, HiCheckCircle, HiXCircle, HiArrowUp, HiStar, HiCreditCard, HiDeviceMobile } from 'react-icons/hi';

const methods = [
  { id: 'telegram_stars', label: 'Telegram Stars', icon: HiStar },
  { id: 'upi', label: 'UPI ID', icon: HiCreditCard },
  { id: 'bkash', label: 'bKash', icon: HiDeviceMobile },
];

export default function Withdraw() {
  const { user, refreshUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [method, setMethod] = useState('bkash');
  const [accountNo, setAccountNo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const canWithdraw = (user?.balance || 0) >= settings.minWithdraw;

  useEffect(() => {
    if (user?.id) loadHistory();
  }, [user?.id]);

  const loadHistory = async () => {
    try {
      const historyRef = ref(database, 'withdraw_requests');
      const snapshot = await get(historyRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const userRequests = Object.entries(data)
          .filter(([, req]) => req.userId === user.id)
          .map(([id, req]) => ({ id, ...req }))
          .sort((a, b) => (b.requestedAt || 0) - (a.requestedAt || 0));
        setHistory(userRequests);
      }
    } catch (err) {
      console.error('Load history error:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async () => {
    if (!accountNo.trim()) {
      toast.error('অনুগ্রহ করে আপনার অ্যাকাউন্টের বিবরণ দিন');
      return;
    }

    if ((user?.balance || 0) < settings.minWithdraw) {
      toast.error(`সর্বনিম্ন উইথড্রল ${settings.minWithdraw} কয়েন`);
      return;
    }

    setSubmitting(true);
    try {
      const requestsRef = ref(database, 'withdraw_requests');
      const newRequestRef = push(requestsRef);

      await set(newRequestRef, {
        userId: user.id,
        amount: user.balance,
        method,
        accountNo: accountNo.trim(),
        status: 'pending',
        requestedAt: Date.now(),
        processedAt: null,
      });

      toast.success('✅ উইথড্রল রিকোয়েস্ট জমা হয়েছে!');
      setShowForm(false);
      setAccountNo('');
      await loadHistory();
    } catch (err) {
      console.error('Withdraw error:', err);
      toast.error('রিকোয়েস্ট জমা দিতে ব্যর্থ');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-amber-400 text-xs">
            <HiClock className="text-sm" /> পেন্ডিং
          </span>
        );
      case 'approved':
        return (
          <span className="flex items-center gap-1 text-emerald-400 text-xs">
            <HiCheckCircle className="text-sm" /> অনুমোদিত
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 text-red-400 text-xs">
            <HiXCircle className="text-sm" /> বাতিল
          </span>
        );
      default:
        return <span className="text-xs text-white/30">{status}</span>;
    }
  };

  return (
    <div className="pb-4 animate-fade-in">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-lg font-bold text-white">উইথড্রল</h1>
        <p className="text-xs text-white/40 mt-0.5">আপনার কয়েন আসল টাকায় রূপান্তর করুন</p>
      </div>

      {/* Balance Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 mb-4 animate-slide-up stagger-1">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 via-orange-600/10 to-amber-600/20" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-grid opacity-20" />

        <div className="relative z-10 text-center">
          <HiCash className="text-3xl text-amber-400 mx-auto mb-2" />
          <p className="text-xs text-white/50 uppercase tracking-wider">উপলব্ধ ব্যালেন্স</p>
          <p className="text-4xl font-black text-white mt-1">{formatCoins(user?.balance || 0)}</p>
          <p className="text-sm text-white/40 mt-0.5">≈ {coinsToBDT(user?.balance || 0)} BDT</p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="glass rounded-full px-3 py-1">
              <span className="text-[10px] text-white/50">সর্বনিম্ন: {settings.minWithdraw} কয়েন</span>
            </div>
            <div className="glass rounded-full px-3 py-1">
              <span className="text-[10px] text-white/50">১০ কয়েন = ৳১</span>
            </div>
          </div>

          {!showForm && (
            <button
              onClick={() => {
                if (!canWithdraw) {
                  toast.error(`আরও ${settings.minWithdraw - (user?.balance || 0)} কয়েন প্রয়োজন`);
                  return;
                }
                setShowForm(true);
              }}
              disabled={!canWithdraw}
              className={`mt-4 w-full py-4 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                canWithdraw
                  ? 'btn-gold text-white'
                  : 'bg-white/5 text-white/20 cursor-not-allowed'
              }`}
            >
              <HiArrowUp className="text-lg" />
              {canWithdraw ? 'এখনই উইথড্র করুন' : `আরও ${settings.minWithdraw - (user?.balance || 0)} কয়েন প্রয়োজন`}
            </button>
          )}
        </div>
      </div>

      {/* Withdraw Form */}
      {showForm && (
        <div className="glass rounded-2xl p-5 mb-4 animate-slide-up stagger-2">
          <h3 className="font-semibold text-white mb-4">উইথড্রলের বিবরণ</h3>

          {/* Method Selection */}
          <div className="mb-4">
            <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">পেমেন্ট মেথড</p>
            <div className="grid grid-cols-3 gap-2">
              {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`p-3 rounded-xl text-center transition-all duration-200 ${
                    method === m.id
                      ? 'bg-violet-500/20 border border-violet-500/50'
                      : 'bg-white/5 border border-white/10 hover:border-white/20'
                  }`}
                >
                  <m.icon className="text-2xl mx-auto text-white/80" />
                  <p className="text-[10px] mt-1 text-white/60">{m.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Account Input */}
          <div className="mb-4">
            <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">অ্যাকাউন্টের বিবরণ</p>
            <input
              type="text"
              value={accountNo}
              onChange={(e) => setAccountNo(e.target.value)}
              placeholder={
                method === 'bkash'
                  ? 'bKash নম্বর (01XXXXXXXXX)'
                  : method === 'upi'
                  ? 'UPI ID (example@upi)'
                  : 'Telegram Username'
              }
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none transition-all"
            />
          </div>

          {/* Summary */}
          <div className="glass rounded-xl p-3 mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white/40">পরিমাণ</span>
              <span className="text-white font-semibold">{formatCoins(user?.balance || 0)} কয়েন</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">আপনি পাবেন</span>
              <span className="text-amber-400 font-bold">৳{coinsToBDT(user?.balance || 0)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 text-sm font-semibold hover:bg-white/5 transition-all"
            >
              বাতিল
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !accountNo.trim()}
              className="flex-1 py-3 rounded-xl btn-gold text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  প্রসেসিং...
                </span>
              ) : 'জমা দিন'}
            </button>
          </div>
        </div>
      )}

      {/* History */}
      <div className="glass rounded-2xl p-4 animate-slide-up stagger-3">
        <h3 className="font-semibold text-white mb-3">উইথড্রল ইতিহাস</h3>
        {loadingHistory ? (
          <div className="flex items-center justify-center py-8">
            <svg className="animate-spin h-6 w-6 text-white/20" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-8">
            <HiCash className="text-3xl text-white/20 mx-auto mb-2" />
            <p className="text-sm text-white/30">কোনো উইথড্রল ইতিহাস নেই</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{formatCoins(req.amount)} কয়েন</p>
                  <p className="text-xs text-white/30">
                    {req.method === 'bkash' ? (
                      <span className="inline-flex items-center gap-1"><HiDeviceMobile className="text-sm" /> {req.accountNo}</span>
                    ) : req.method === 'upi' ? (
                      <span className="inline-flex items-center gap-1"><HiCreditCard className="text-sm" /> {req.accountNo}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1"><HiStar className="text-sm" /> {req.accountNo}</span>
                    )}
                  </p>
                  <p className="text-[10px] text-white/20 mt-0.5">
                    {new Date(req.requestedAt).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                {getStatusBadge(req.status)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
