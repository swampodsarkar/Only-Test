import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { HiArrowLeft, HiChat, HiMail, HiPhone, HiGlobe, HiQuestionMarkCircle } from 'react-icons/hi';

export default function Support() {
  const { user } = useAuth();

  const supportChannels = [
    {
      icon: HiChat,
      title: 'Telegram সাপোর্ট',
      description: 'লাইভ চ্যাটে সাহায্য নিন',
      action: () => window.open('https://t.me/kamaibd_support', '_blank'),
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: HiMail,
      title: 'ইমেইল সাপোর্ট',
      description: 'kamai.bd@gmail.com',
      action: () => window.open('mailto:kamai.bd@gmail.com', '_blank'),
      color: 'from-violet-500 to-purple-500',
    },
    {
      icon: HiPhone,
      title: 'হটলাইন',
      description: 'সকাল ১০টা - রাত ১০টা',
      action: () => window.open('tel:+8801XXXXXXXXX', '_blank'),
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: HiGlobe,
      title: 'ওয়েবসাইট',
      description: 'www.kamaibd.com',
      action: () => window.open('https://kamaibd.com', '_blank'),
      color: 'from-amber-500 to-orange-500',
    },
  ];

  const faqs = [
    {
      q: 'কিভাবে টাকা উইথড্র করবো?',
      a: 'মিনিমাম ৫০০ কয়েন হলে Withdraw পেজে গিয়ে bKash/UPI সিলেক্ট করুন।',
    },
    {
      q: 'কয়েন কিভাবে অর্জন করবো?',
      a: 'ভিডিও দেখুন, টাস্ক সম্পন্ন করুন, বন্ধুদের রেফার করুন।',
    },
    {
      q: 'উইথড্রল কতদিনে পাবো?',
      a: 'সাধারণত ২৪-৪৮ ঘণ্টার মধ্যে প্রসেস হয়।',
    },
    {
      q: 'রেফারেল বোনাস কিভাবে পাবো?',
      a: 'আপনার রেফারেল লিংক শেয়ার করুন, বন্ধু জয়েন করলে উভয়েই বোনাস পাবেন।',
    },
  ];

  return (
    <div className="pb-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => window.history.back()}
          className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"
        >
          <HiArrowLeft className="text-white/70" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">সাপোর্ট</h1>
          <p className="text-xs text-white/40">আমাদের সাথে যোগাযোগ করুন</p>
        </div>
      </div>

      {/* Support Channels */}
      <div className="space-y-3 mb-6">
        {supportChannels.map((channel, idx) => (
          <button
            key={channel.title}
            onClick={channel.action}
            className={`w-full glass rounded-2xl p-4 card-hover flex items-center gap-3 animate-slide-up stagger-${idx + 1}`}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${channel.color} flex items-center justify-center flex-shrink-0`}>
              <channel.icon className="text-white text-xl" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-white">{channel.title}</p>
              <p className="text-[10px] text-white/40">{channel.description}</p>
            </div>
            <div className="text-white/20">›</div>
          </button>
        ))}
      </div>

      {/* FAQ */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <HiQuestionMarkCircle className="text-violet-400" />
          <h2 className="text-sm font-bold text-white">সচরাচর জিজ্ঞাসা</h2>
        </div>
        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <details
              key={idx}
              className="glass rounded-xl overflow-hidden animate-slide-up"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <summary className="p-4 cursor-pointer text-sm font-medium text-white hover:bg-white/5 transition-all list-none flex items-center justify-between">
                {faq.q}
                <span className="text-white/30 ml-2">+</span>
              </summary>
              <div className="px-4 pb-4 text-xs text-white/50 leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>

      {/* User Info */}
      <div className="glass rounded-2xl p-4">
        <p className="text-xs text-white/40 mb-2">আপনার অ্যাকাউন্ট</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">{user?.firstName || 'User'}</p>
            <p className="text-[10px] text-white/30">ID: {user?.id}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-violet-400">{user?.balance || 0} কয়েন</p>
            <p className="text-[10px] text-white/30">ব্যালেন্স</p>
          </div>
        </div>
      </div>
    </div>
  );
}
