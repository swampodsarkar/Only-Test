import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Toast from './Toast';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#0f0b1a] flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Radial gradient top */}
        <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-violet-600/10 to-transparent" />

        {/* Floating orbs */}
        <div className="absolute top-20 -left-20 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 -right-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-40 left-10 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-grid opacity-20" />
      </div>

      {/* Content */}
      <main className="flex-1 pb-24 px-4 pt-4 max-w-lg mx-auto w-full relative z-10">
        <Outlet />
      </main>

      <Navbar />
      <Toast />
    </div>
  );
}
