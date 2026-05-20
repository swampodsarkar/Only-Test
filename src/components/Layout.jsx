import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';
import Toast from './Toast';

export default function Layout() {
  const { isDevMode } = useAuth();

  return (
    <div className="min-h-screen bg-[#0f0b1a] flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Radial gradient top */}
        <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-violet-600/8 to-transparent" />

        {/* Floating orbs */}
        <div className="absolute top-20 -left-20 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 -right-20 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-10 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-grid opacity-10" />
      </div>

      {/* Dev Mode Banner */}
      {isDevMode && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-amber-500/90 backdrop-blur-sm text-center py-1.5 text-xs font-bold text-black">
          🧪 DEV MODE — Testing without Telegram
        </div>
      )}

      {/* Content */}
      <main className={`flex-1 px-4 pt-4 max-w-lg mx-auto w-full relative z-10 ${isDevMode ? 'pt-10' : 'pt-4'}`}>
        <Outlet />
      </main>

      <Navbar />
      <Toast />
    </div>
  );
}
