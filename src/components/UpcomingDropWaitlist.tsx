import React, { useState } from 'react';
import { Bell, Check, Sparkles, MessageSquare } from 'lucide-react';

export const UpcomingDropWaitlist: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [isJoined, setIsJoined] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setIsJoined(true);
  };

  return (
    <section id="upcoming" className="py-14 sm:py-20 bg-[#7A2E2E] text-[#FBF8F3] relative overflow-hidden">
      {/* Background Motifs */}
      <div className="absolute right-[-40px] bottom-[-40px] text-white/5 font-serif text-9xl font-black select-none pointer-events-none">
        TARVEQ
      </div>

      <div className="max-w-4xl mx-auto px-6 text-center space-y-5 relative z-10">
        <div className="inline-flex items-center space-x-2 bg-[#F9F4EB]/15 border border-[#B8925A] px-3.5 py-1 rounded-full">
          <span className="text-[#B8925A]">✦</span>
          <span className="font-serif text-xs uppercase tracking-widest text-[#F9F4EB]">
            Next Studio Release
          </span>
          <span className="text-[#B8925A]">✦</span>
        </div>

        <h2 className="font-serif text-2xl sm:text-4xl font-medium tracking-tight">
          Drop 02: <span className="italic font-normal text-[#F9F4EB]">Autumn Twilight & Mulberry Silk</span>
        </h2>

        <p className="text-xs sm:text-sm text-[#FBF8F3]/80 max-w-xl mx-auto font-sans leading-relaxed">
          Only 150 calibrated handloom sets per silhouette. Join the WhatsApp inner circle for a 2-hour priority window before the public drop.
        </p>

        {/* WhatsApp Waitlist Form */}
        {isJoined ? (
          <div className="inline-flex items-center space-x-2 bg-[#3F5945] text-white px-6 py-3 rounded-full text-xs font-serif font-bold shadow-lg animate-in zoom-in-95 border border-[#B8925A]">
            <Check className="w-4 h-4 text-[#B8925A]" />
            <span>You're on the priority WhatsApp list! We will ping you 2 hours before Drop 02.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto pt-2">
            <div className="relative w-full">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter WhatsApp Number (+91 ...)"
                required
                className="w-full px-4 py-3 rounded-full text-xs bg-white text-[#261B18] placeholder-[#5C4D48]/70 focus:outline-none focus:ring-2 focus:ring-[#B8925A] shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto bg-[#B8925A] hover:bg-[#A27E47] text-[#261B18] font-serif font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-full transition shadow-md whitespace-nowrap flex items-center justify-center space-x-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Notify Me</span>
            </button>
          </form>
        )}

        <p className="text-[10px] text-[#FBF8F3]/60 tracking-wider uppercase font-mono pt-1">
          Zero Spam • Direct WhatsApp Drop Alert Only
        </p>
      </div>
    </section>
  );
};
