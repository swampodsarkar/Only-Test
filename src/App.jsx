import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Tasks from './components/Tasks';
import Ads from './components/Ads';
import Withdraw from './components/Withdraw';
import Referral from './components/Referral';
import { HiSparkles } from 'react-icons/hi';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0f0b1a] flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-violet-600/10 to-transparent" />
      <div className="absolute top-20 -left-20 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute top-40 -right-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

      <div className="text-center relative z-10 animate-scale-in">
        <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center animate-pulse-glow">
          <HiSparkles className="text-4xl text-violet-400" />
        </div>
        <h1 className="text-2xl font-bold gradient-text mb-2">Kamai BD</h1>
        <p className="text-sm text-white/30 mb-4">Loading your dashboard...</p>
        <div className="flex items-center justify-center gap-1">
          <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f0b1a] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-violet-600/10 to-transparent" />
        <div className="absolute top-20 -left-20 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl animate-float" />

        <div className="text-center max-w-sm relative z-10 animate-scale-in">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center">
            <HiSparkles className="text-4xl text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold gradient-text mb-2">Kamai BD</h1>
          <p className="text-white/40 text-sm mb-6">
            Open this app from Telegram to start earning!
          </p>
          <a
            href="https://t.me/kamaibd_bot/app"
            className="inline-block px-8 py-4 rounded-2xl btn-primary text-white font-semibold text-sm"
          >
            Open in Telegram
          </a>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/ads" element={<Ads />} />
        <Route path="/withdraw" element={<Withdraw />} />
        <Route path="/referral" element={<Referral />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
