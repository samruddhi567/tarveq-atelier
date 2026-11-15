import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface SilhouetteCarouselProps {
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
}

const silhouettes = [
  {
    id: 'co-ord',
    categoryFilter: 'Co-ord',
    title: 'Breathable Cotton Co-ords',
    subtitle: 'Dual-tone tropical cambric weave with ergonomic ease pleats',
    fabric: '210 GSM Pure Cambric',
    undertone: 'Warm & Olive Undertones',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'tee',
    categoryFilter: 'Tee',
    title: '240 GSM Oversized Essentials',
    subtitle: 'Dense boxy cut that completely eliminates outline cling',
    fabric: '240 GSM Heavyweight Organic Cotton',
    undertone: 'Warm & Deep Espresso',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'tunic',
    categoryFilter: 'Tunic',
    title: 'Modest Linen Tunics',
    subtitle: 'Fluid straight drape that stays upright through full workdays',
    fabric: '220 GSM Flax Linen-Viscose',
    undertone: 'Olive & Deep Complexions',
    image: 'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'trousers',
    categoryFilter: 'Trousers',
    title: 'Tailored Relaxed Trousers',
    subtitle: 'Calibrated 0.72 South Asian hip-waist curve with zero waistband gap',
    fabric: '230 GSM Matte Lyocell Twill',
    undertone: 'Universal Indian Proportions',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'shirt',
    categoryFilter: 'Shirt',
    title: 'Double-Layered Zero-Sheer Shirts',
    subtitle: 'Dual-ply long-staple poplin front with modest high-mandarin collar',
    fabric: '195 GSM Long-Staple Poplin',
    undertone: 'All Indian Undertones',
    image: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=700&q=80',
  },
];

export const SilhouetteCarousel: React.FC<SilhouetteCarouselProps> = ({
  onSelectCategory,
  selectedCategory,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <section id="silhouettes" className="py-14 sm:py-20 bg-[#FBF8F3] border-b border-[#E8DFC8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header with Left/Right Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-serif uppercase tracking-widest text-[#7A2E2E]">
              <span>Handcrafted Silhouette Taxonomy</span>
              <span className="text-[#B8925A]">✦</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-medium text-[#261B18] mt-1">
              Shop by Silhouette & <span className="italic font-normal text-[#7A2E2E]">Craft</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#5C4D48] mt-1 font-sans">
              Each silhouette is mathematically graded to eliminate bust gaping, shoulder droop, and sheer outline transparency.
            </p>
          </div>

          {/* Carousel Arrow Controls */}
          <div className="flex items-center space-x-2 self-end">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full border border-[#B8925A] bg-[#F3ECE1] hover:bg-[#E8DFC8] text-[#261B18] flex items-center justify-center transition shadow-sm"
              title="Previous Silhouette"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full border border-[#B8925A] bg-[#F3ECE1] hover:bg-[#E8DFC8] text-[#261B18] flex items-center justify-center transition shadow-sm"
              title="Next Silhouette"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Carousel Track */}
        <div
          ref={scrollRef}
          className="flex space-x-5 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {silhouettes.map((item) => {
            const isSelected = selectedCategory.toLowerCase().includes(item.categoryFilter.toLowerCase());
            return (
              <div
                key={item.id}
                onClick={() => onSelectCategory(item.categoryFilter)}
                className={`snap-start flex-shrink-0 w-72 sm:w-80 bg-[#F3ECE1] rounded-2xl overflow-hidden border-2 transition-all duration-300 cursor-pointer p-3 flex flex-col justify-between group ${
                  isSelected
                    ? 'border-[#7A2E2E] shadow-elevated-luxe bg-[#FAF0F0]'
                    : 'border-[#E8DFC8] hover:border-[#B8925A] hover:shadow-soft-luxe'
                }`}
              >
                {/* Image Container */}
                <div className="aspect-[4/5] rounded-xl overflow-hidden relative bg-[#E7DEC8] mb-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-[#261B18]/85 backdrop-blur-sm text-[#FBF8F3] text-[10px] font-mono px-2 py-0.5 rounded-full">
                    {item.fabric}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-[#7A2E2E] font-serif uppercase tracking-wider font-semibold">
                      {item.undertone}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#261B18] group-hover:text-[#7A2E2E] transition">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#5C4D48] leading-relaxed line-clamp-2 mt-1">
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E8DFC8] flex items-center justify-between text-xs font-semibold text-[#7A2E2E]">
                    <span>View Collection</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
