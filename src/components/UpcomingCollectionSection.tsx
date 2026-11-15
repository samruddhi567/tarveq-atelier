import React, { useState } from 'react';
import { Sparkles, MessageCircle, ArrowRight, Check, Shield } from 'lucide-react';

export const UpcomingCollectionSection: React.FC = () => {
  const [contact, setContact] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact || contact.trim().length < 4) {
      setError('Please provide a valid email address or phone number.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const type = contact.includes('@') ? 'email' : 'phone';
      const res = await fetch('/api/waitlist/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: contact.trim(), type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Subscription failed');

      setIsSubmitted(true);
      setContact('');
    } catch (err: any) {
      setError(err.message || 'Failed to register subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative w-full bg-burgundy text-[#F8F4EC] py-20 sm:py-28 overflow-hidden border-t border-b border-gold/30">
      
      {/* Background Subtle Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
        <span className="font-serif text-[180px] sm:text-[280px] tracking-widest font-bold uppercase text-white">
          TARVEQ
        </span>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        
        {/* Eyebrow */}
        <div className="inline-flex items-center space-x-2 bg-white/10 border border-gold/40 px-4 py-1.5 rounded-full shadow-sm">
          <span className="text-gold text-xs">🪷</span>
          <span className="text-xs uppercase tracking-widest text-gold font-sans font-medium">
            Limited Studio Batch • Drop 02 Preview
          </span>
          <span className="text-gold text-xs">🪷</span>
        </div>

        {/* Main Heading (Cormorant Garamond) */}
        <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.2]">
          Something Beautiful <br className="hidden sm:inline" />
          <span className="italic font-normal text-gold">Is Coming.</span>
        </h2>

        {/* Supporting Narrative */}
        <p className="text-sm sm:text-base text-[#F8F4EC]/85 max-w-2xl mx-auto leading-relaxed font-sans font-normal">
          Be the first to discover our upcoming collection and receive early access to new designs. Featuring zero-sheer raw silks, structured cambric tunics, and drape-engineered evening modest silhouettes.
        </p>

        {/* Subscription Form */}
        <div className="max-w-md mx-auto pt-4">
          {isSubmitted ? (
            <div className="bg-white/10 backdrop-blur-md border border-gold/40 rounded-2xl p-5 text-center space-y-2 animate-in zoom-in-95 duration-200">
              <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center mx-auto text-gold">
                <Check className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-xl font-medium text-white">Early Access Reserved</h4>
              <p className="text-xs text-[#F8F4EC]/80 font-sans">
                You will receive a private WhatsApp & email preview 24 hours prior to our public launch.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 font-sans">
              <div className="flex flex-col sm:flex-row items-center gap-2 bg-white/10 p-1.5 rounded-full border border-gold/40 backdrop-blur-sm">
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Enter email or WhatsApp number"
                  required
                  className="w-full px-5 py-3 rounded-full bg-transparent text-sm text-white placeholder-white/60 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-gold hover:bg-gold-hover text-charcoal font-sans text-xs sm:text-sm font-semibold py-3 px-7 rounded-full transition shadow-md flex items-center justify-center space-x-1.5 shrink-0"
                >
                  <span>{loading ? 'Registering...' : 'Notify Me'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {error && (
                <p className="text-xs text-[#FFC4C4] font-medium">{error}</p>
              )}

              <p className="text-[11px] text-[#F8F4EC]/60">
                Zero spam. You can unsubscribe anytime with one tap.
              </p>
            </form>
          )}
        </div>

        {/* Studio Specs */}
        <div className="pt-6 border-t border-white/10 flex flex-wrap justify-center items-center gap-6 sm:gap-12 text-xs font-sans text-[#F8F4EC]/80 uppercase tracking-wider">
          <span>Only 150 Handcrafted Pieces</span>
          <span>•</span>
          <span>Petite, Regular & Tall Lengths</span>
          <span>•</span>
          <span>Drop Date: December 2026</span>
        </div>

      </div>
    </section>
  );
};
