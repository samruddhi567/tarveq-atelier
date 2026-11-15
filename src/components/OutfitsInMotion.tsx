import React, { useState } from 'react';
import { Play, Sparkles, X, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface MotionItem {
  id: string;
  title: string;
  fabric: string;
  weaveNote: string;
  posterUrl: string;
  videoUrl: string; // high-quality video or animated loop
  modelDetails: string;
}

const motionReels: MotionItem[] = [
  {
    id: 'motion-1',
    title: 'Terracotta Cambric Drape in Natural Sunlight',
    fabric: '210 GSM Pure Cambric Cotton',
    weaveNote: 'Zero cling during natural stride • Ergonomic 14° clavicle drop',
    posterUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-walking-in-a-terracotta-colored-dress-41551-large.mp4',
    modelDetails: 'Model is 5\'5" (165 cm), Wearing Size M, Regular Length',
  },
  {
    id: 'motion-2',
    title: 'Ivory Zero-Transparency Poplin Light Test',
    fabric: 'Dual-Ply 195 GSM Long-Staple Cotton',
    weaveNote: 'Tested against direct 5000K daylight backlight • 100% Zero Sheer Guarantee',
    posterUrl: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=700&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-white-clothes-walking-in-a-studio-41549-large.mp4',
    modelDetails: 'Model is 5\'3" (160 cm), Wearing Size S, Petite Length',
  },
  {
    id: 'motion-3',
    title: 'Sage Olive Linen Fluid Motion',
    fabric: '220 GSM Flax Linen-Viscose',
    weaveNote: 'Stays upright through 12-hour movement with zero knee bagginess',
    posterUrl: 'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=700&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-model-posing-in-a-green-dress-41552-large.mp4',
    modelDetails: 'Model is 5\'7" (170 cm), Wearing Size L, Tall Length',
  },
  {
    id: 'motion-4',
    title: 'Cinnamon Relaxed Trousers Step Test',
    fabric: '230 GSM Matte Lyocell Twill',
    weaveNote: 'Custom 0.72 waist-to-hip curve eliminates back gaping entirely',
    posterUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=700&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-in-stylish-trousers-walking-down-city-stairs-41554-large.mp4',
    modelDetails: 'Model is 5\'4" (162 cm), Wearing Size M, Regular Length',
  },
];

export const OutfitsInMotion: React.FC = () => {
  const [activeVideo, setActiveVideo] = useState<MotionItem | null>(null);

  return (
    <section id="in-motion" className="py-16 sm:py-24 bg-[#F3ECE1] border-b border-[#E8DFC8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center space-x-2 text-xs font-serif uppercase tracking-widest text-[#7A2E2E]">
            <span>TARVEQ Motion Studio</span>
            <span className="text-[#B8925A]">✦</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl font-medium text-[#261B18]">
            Watch Before You Buy — <span className="italic font-normal text-[#7A2E2E]">Outfits in Motion</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#5C4D48] font-sans">
            Inspect real fabric drape, thickness, and zero-sheer opacity in unedited natural daylight before ordering.
          </p>
        </div>

        {/* Vertical Reel Strip (Padmora-style) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {motionReels.map((reel) => (
            <div
              key={reel.id}
              onClick={() => setActiveVideo(reel)}
              className="bg-[#FBF8F3] rounded-2xl overflow-hidden border border-[#E8DFC8] hover:border-[#7A2E2E] shadow-soft-luxe hover:shadow-elevated-luxe transition-all cursor-pointer group flex flex-col justify-between"
            >
              {/* Video Poster with Animated Play Indicator */}
              <div className="aspect-[9/14] relative bg-[#261B18] overflow-hidden">
                <img
                  src={reel.posterUrl}
                  alt={reel.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90"
                />

                {/* Gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#261B18]/90 via-transparent to-[#261B18]/30"></div>

                {/* Central Play Pulse */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#7A2E2E]/90 text-[#FBF8F3] flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#7A2E2E] transition-all border border-[#B8925A]">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[9px] font-mono uppercase bg-[#B8925A] text-white px-2 py-0.5 rounded-full font-bold">
                    Daylight Reel
                  </span>
                  <p className="font-serif text-xs font-bold mt-1 line-clamp-1">{reel.title}</p>
                </div>
              </div>

              {/* Sub-card details */}
              <div className="p-3 bg-[#FBF8F3] border-t border-[#E8DFC8] space-y-1">
                <p className="text-[10px] font-bold text-[#7A2E2E] uppercase tracking-wider">{reel.fabric}</p>
                <p className="text-[11px] text-[#5C4D48] line-clamp-1">{reel.weaveNote}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Reel Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#FBF8F3] w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-[#B8925A] flex flex-col max-h-[92vh]">
            <div className="p-3.5 bg-[#261B18] text-white flex items-center justify-between border-b border-[#3D2F2B]">
              <div className="flex items-center space-x-2">
                <span className="text-[#B8925A]">🪷</span>
                <span className="font-serif text-sm font-bold tracking-wider">Outfits in Motion</span>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="aspect-[9/14] bg-black relative flex items-center justify-center overflow-hidden">
              <video
                src={activeVideo.videoUrl}
                poster={activeVideo.posterUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            {/* Reel Details */}
            <div className="p-4 bg-[#FBF8F3] space-y-2 text-xs">
              <div className="flex items-center space-x-1.5 text-[#3F5945] font-bold text-[11px]">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Zero-Sheer Daylight Certified</span>
              </div>
              <h3 className="font-serif text-base font-bold text-[#261B18]">{activeVideo.title}</h3>
              <p className="text-[#5C4D48] text-[11px] leading-relaxed">{activeVideo.weaveNote}</p>
              <div className="p-2.5 bg-[#F3ECE1] rounded-xl text-[10px] text-[#261B18] font-mono">
                {activeVideo.modelDetails}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
