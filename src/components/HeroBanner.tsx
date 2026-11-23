import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroBannerProps {
  onExploreCollection: () => void;
  onDiscoverStyle: () => void;
  isScanned?: boolean;
  userUndertone?: string;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreCollection,
}) => {
  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: '340px' }}>
      {/* Full-bleed Background — editorial floral/fabric photo */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1800&q=90"
          alt="TARVEQ Atelier Editorial"
          className="w-full h-full object-cover object-center"
        />
        {/* Soft warm overlay so text is legible without hiding the photo */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F8F4EC]/80 via-[#F8F4EC]/50 to-[#F8F4EC]/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#F8F4EC]/70" />
      </div>

      {/* Content layer */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-8 py-14 sm:py-20 lg:py-24">

        {/* Small eyebrow label */}
        <p
          className="text-xs sm:text-[13px] uppercase tracking-[0.25em] text-gold font-sans font-semibold mb-5"
          style={{ letterSpacing: '0.22em' }}
        >
          Tarveq Atelier &nbsp;•&nbsp; New Collection
        </p>

        {/* Large centred collection title — Cormorant Garamond */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mb-5">
          <h1
            className="font-serif font-semibold text-burgundy leading-none select-none"
            style={{
              fontSize: 'clamp(2.5rem, 8vw, 6.5rem)',
              letterSpacing: '0.04em',
              textShadow: '0 2px 24px rgba(124,48,49,0.10)',
            }}
          >
            TARVEQ ATELIER
          </h1>
        </div>

        {/* Thin decorative rule with diamond */}
        <div className="flex items-center justify-center gap-3 mb-5 w-full max-w-sm sm:max-w-md">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gold/50" />
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="flex-shrink-0">
            <rect x="6" y="0" width="8.5" height="8.5" rx="1" transform="rotate(45 6 0)" fill="#B58C50" opacity="0.7" />
          </svg>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gold/50" />
        </div>

        {/* Subtitle */}
        <p
          className="text-charcoal font-sans text-xs sm:text-sm tracking-[0.18em] uppercase mb-8 sm:mb-10"
          style={{ letterSpacing: '0.17em' }}
        >
          Our Very First Collection
        </p>

        {/* CTA pill button — slightly right-aligned on desktop */}
        <div className="flex items-center justify-center sm:justify-end w-full max-w-3xl">
          <button
            onClick={onExploreCollection}
            className="group flex items-center gap-3 bg-burgundy hover:bg-burgundy-hover text-white font-sans font-medium text-[13px] sm:text-sm tracking-widest uppercase px-7 py-3.5 rounded-full shadow-lg border border-gold/30 transition-all duration-300 hover:shadow-xl hover:gap-4"
            style={{ letterSpacing: '0.12em' }}
          >
            <span>Explore Collection</span>
            <span className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center transition-all group-hover:bg-white/25">
              <ArrowRight className="w-3.5 h-3.5 text-gold" />
            </span>
          </button>
        </div>
      </div>

      {/* Bottom fade to page background */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#F8F4EC] to-transparent z-10 pointer-events-none" />
    </section>
  );
};
