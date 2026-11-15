import React from 'react';
import { ArrowRight, Ruler, Palette, Sparkles, FolderHeart } from 'lucide-react';

interface StyleDiscoverySectionProps {
  onOpenFitFinder: () => void;
  onOpenColourStudio: () => void;
  onOpenStyleStudio: () => void;
  onOpenWardrobe: () => void;
}

export const StyleDiscoverySection: React.FC<StyleDiscoverySectionProps> = ({
  onOpenFitFinder,
  onOpenColourStudio,
  onOpenStyleStudio,
  onOpenWardrobe,
}) => {
  const cards = [
    {
      title: "Find Your Perfect Fit",
      description: "Discover clothing sizes that match your body measurements and fit preferences.",
      buttonLabel: "Find My Fit",
      icon: Ruler,
      action: onOpenFitFinder,
      image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80",
      accent: "bg-sage/10 text-sage",
    },
    {
      title: "Discover Your Colours",
      description: "Explore colours that complement your natural skin undertone and personal preferences.",
      buttonLabel: "Discover My Palette",
      icon: Palette,
      action: onOpenColourStudio,
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
      accent: "bg-gold/15 text-gold",
    },
    {
      title: "Explore Your Style",
      description: "Find outfits for your lifestyle, occasions, and personal fashion preferences.",
      buttonLabel: "Explore Styles",
      icon: Sparkles,
      action: onOpenStyleStudio,
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
      accent: "bg-burgundy/10 text-burgundy",
    },
    {
      title: "Build Your Wardrobe",
      description: "Organize your favourite clothing pieces and discover new outfit combinations.",
      buttonLabel: "Open My Wardrobe",
      icon: FolderHeart,
      action: onOpenWardrobe,
      image: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&w=800&q=80",
      accent: "bg-charcoal/10 text-charcoal",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#F8F4EC] border-b border-beige-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-widest text-burgundy font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-burgundy"></span>
            <span>Intelligent Styling Suite</span>
            <span className="w-1.5 h-1.5 rounded-full bg-burgundy"></span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-charcoal">
            Discover Your Style
          </h2>
          <p className="text-base text-charcoal-muted font-sans">
            Personalized fashion intelligence tailored to your unique measurements, natural skin undertone, and lifestyle.
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="group bg-[#E8E0D3]/40 hover:bg-[#E8E0D3]/80 border border-beige-border rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between hover:shadow-elevated-luxe"
              >
                {/* Visual Imagery */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-beige">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-60"></div>
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-sm">
                    <Icon className="w-4 h-4 text-burgundy" />
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-serif text-2xl font-medium text-charcoal leading-snug">
                      {card.title}
                    </h3>
                    <p className="text-sm text-charcoal-muted leading-relaxed font-sans">
                      {card.description}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <button
                      onClick={card.action}
                      className="w-full bg-[#F8F4EC] hover:bg-burgundy text-charcoal hover:text-white font-sans text-sm font-medium py-2.5 px-4 rounded-full border border-charcoal/15 hover:border-burgundy transition-all duration-200 flex items-center justify-center space-x-2 group-hover:shadow-sm"
                    >
                      <span>{card.buttonLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
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
