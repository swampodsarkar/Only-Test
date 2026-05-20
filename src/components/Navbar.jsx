import { NavLink } from 'react-router-dom';
import { HiHome, HiClipboardCheck, HiCurrencyDollar, HiCreditCard, HiQuestionMarkCircle } from 'react-icons/hi';

const navItems = [
  { path: '/', label: 'হোম', icon: HiHome },
  { path: '/tasks', label: 'কাজ', icon: HiClipboardCheck },
  { path: '/ads', label: 'আয়', icon: HiCurrencyDollar },
  { path: '/withdraw', label: 'ওয়ালেট', icon: HiCreditCard },
  { path: '/referral', label: 'সাপোর্ট', icon: HiQuestionMarkCircle },
];

export default function Navbar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Top gradient border */}
      <div className="h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      <div className="bg-[#0f0b1a]/95 backdrop-blur-xl border-t border-white/5">
        <div className="flex justify-around items-center px-2 py-2 max-w-lg mx-auto">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center px-3 py-1.5 rounded-2xl transition-all duration-300 group ${
                  isActive
                    ? 'text-violet-400'
                    : 'text-white/30 hover:text-white/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" />
                  )}
                  <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${
                    isActive ? 'bg-violet-500/20' : ''
                  }`}>
                    <Icon className={`text-xl transition-transform duration-300 ${
                      isActive ? 'scale-110' : 'group-hover:scale-105'
                    }`} />
                  </div>
                  <span className="text-[10px] font-medium mt-0.5">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
