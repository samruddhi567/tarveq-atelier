import React, { useState, useMemo } from 'react';
import { Sparkles, ArrowRight, Heart, ShoppingBag, Check, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { Product } from '../types';

interface StyleStudioViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, size?: string) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: string[];
  userFitSize?: string | null;
}

export const StyleStudioView: React.FC<StyleStudioViewProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onToggleWishlist,
  wishlistIds,
  userFitSize,
}) => {
  const [occasion, setOccasion] = useState<string>('Office');
  const [style, setStyle] = useState<string>('Elegant');
  const [maxBudget, setMaxBudget] = useState<number>(3500);
  const [preferredColor, setPreferredColor] = useState<string>('All');
  const [preferredFit, setPreferredFit] = useState<string>('Regular');
  const [isGenerated, setIsGenerated] = useState<boolean>(true);

  const occasions = ['Office', 'Casual', 'College', 'Party', 'Wedding', 'Travel', 'Festive', 'Everyday'];
  const styles = ['Elegant', 'Minimal', 'Classic', 'Ethnic', 'Western', 'Contemporary', 'Modest'];
  const colorOptions = ['All', 'Warm Earth', 'Olive & Gold', 'Deep Espresso', 'Lotus Ivory', 'Charcoal'];

  // Outfit recommendation generator based on actual catalog
  const outfitRecommendation = useMemo(() => {
    // Select a primary silhouette
    let primary = products.find((p) => {
      if (occasion === 'Office' || occasion === 'Everyday') {
        return p.category.includes('Co-ord') || p.category.includes('Shirt') || p.category.includes('Tunic');
      }
      if (occasion === 'Casual' || occasion === 'College') {
        return p.category.includes('Tee') || p.category.includes('Co-ord') || p.category.includes('Trousers');
      }
      return true;
    }) || products[0];

    // Select complementary pairing
    let complementary = products.find((p) => p.id !== primary?.id) || products[1] || products[0];

    const totalBundlePrice = (primary?.price || 0) + (complementary?.price || 0);

    return {
      title: `${style} ${occasion} Capsule`,
      explanation: `Curated for a refined ${occasion.toLowerCase()} aesthetic. Pairs ${primary?.name} with ${complementary?.name} to ensure breathable, zero-sheer modest drape while maintaining structured elegance.`,
      primary,
      complementary,
      totalPrice: totalBundlePrice,
      bundleDiscountPrice: Math.round(totalBundlePrice * 0.9), // 10% styling bundle incentive
    };
  }, [occasion, style, maxBudget, preferredColor, preferredFit, products]);

  const handleGenerate = () => {
    setIsGenerated(false);
    setTimeout(() => {
      setIsGenerated(true);
    }, 400);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      
      {/* 1. Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-widest text-burgundy font-medium">
          <Sparkles className="w-3.5 h-3.5 text-gold" />
          <span>Curated Silhouette Generator</span>
          <Sparkles className="w-3.5 h-3.5 text-gold" />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-charcoal">
          TARVEQ AI Style Studio
        </h1>
        <p className="text-sm sm:text-base text-charcoal-muted font-sans leading-relaxed">
          Select your lifestyle occasion, styling direction, and budget. Our studio pairs real pieces from the collection for effortless coordination.
        </p>
      </div>

      {/* 2. Interactive Preference Controls */}
      <div className="bg-[#E8E0D3]/40 border border-beige-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft-luxe font-sans">
        
        {/* Occasion Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-charcoal block">
            1. Select Occasion
          </label>
          <div className="flex flex-wrap gap-2">
            {occasions.map((occ) => (
              <button
                key={occ}
                onClick={() => setOccasion(occ)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition ${
                  occasion === occ
                    ? 'bg-burgundy text-white shadow-sm'
                    : 'bg-white/80 text-charcoal hover:bg-white border border-beige-border'
                }`}
              >
                {occ}
              </button>
            ))}
          </div>
        </div>

        {/* Style Aesthetic Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-charcoal block">
            2. Style Direction
          </label>
          <div className="flex flex-wrap gap-2">
            {styles.map((st) => (
              <button
                key={st}
                onClick={() => setStyle(st)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition ${
                  style === st
                    ? 'bg-burgundy text-white shadow-sm'
                    : 'bg-white/80 text-charcoal hover:bg-white border border-beige-border'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Budget & Palette Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-beige-border">
          {/* Budget Range */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-charcoal">
              <span className="font-semibold uppercase tracking-wider">Target Budget</span>
              <span className="font-bold text-burgundy">Up to ₹{maxBudget.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="1500"
              max="5000"
              step="250"
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              className="w-full accent-burgundy"
            />
            <div className="flex justify-between text-[11px] text-charcoal-muted">
              <span>₹1,500</span>
              <span>₹3,000</span>
              <span>₹5,000</span>
            </div>
          </div>

          {/* Color Preference */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-charcoal block">
              Color Preference
            </label>
            <div className="flex flex-wrap gap-2 text-xs">
              {colorOptions.map((col) => (
                <button
                  key={col}
                  onClick={() => setPreferredColor(col)}
                  className={`px-3 py-1.5 rounded-full border transition ${
                    preferredColor === col
                      ? 'border-gold bg-gold text-white font-medium'
                      : 'border-beige-border bg-white/80 text-charcoal hover:bg-white'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-2 flex justify-center">
          <button
            onClick={handleGenerate}
            className="bg-burgundy hover:bg-burgundy-hover text-white font-sans text-sm font-medium py-3 px-8 rounded-full transition shadow-md flex items-center space-x-2 border border-gold/30"
          >
            <Sparkles className="w-4 h-4 text-gold" />
            <span>Generate My Outfit</span>
          </button>
        </div>

      </div>

      {/* 3. Generated Outfit Result Card */}
      {isGenerated && outfitRecommendation.primary && outfitRecommendation.complementary && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-beige-border shadow-elevated-luxe space-y-6 animate-in fade-in duration-300">
          
          {/* Recommendation Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-beige-border gap-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-burgundy font-sans">
                Curated Combination
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal">
                {outfitRecommendation.title}
              </h3>
            </div>

            <div className="text-right sm:text-right">
              <span className="text-xs text-charcoal-muted line-through font-sans">
                ₹{outfitRecommendation.totalPrice.toLocaleString('en-IN')}
              </span>
              <p className="font-serif text-2xl font-medium text-burgundy">
                ₹{outfitRecommendation.bundleDiscountPrice.toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] bg-sage-light text-sage font-medium px-2 py-0.5 rounded-full font-sans">
                10% Studio Styling Discount
              </span>
            </div>
          </div>

          {/* Editorial Explanation */}
          <p className="text-sm text-charcoal-muted leading-relaxed font-sans italic bg-beige/30 p-4 rounded-2xl border border-beige-border">
            "{outfitRecommendation.explanation}"
          </p>

          {/* Outfit Product Cards (2-Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Piece 1 */}
            <div className="bg-[#F8F4EC] p-4 rounded-2xl border border-beige-border flex space-x-4">
              <div
                onClick={() => onSelectProduct(outfitRecommendation.primary)}
                className="w-24 h-32 rounded-xl overflow-hidden bg-beige shrink-0 cursor-pointer"
              >
                <img
                  src={outfitRecommendation.primary.image_url}
                  alt={outfitRecommendation.primary.name}
                  className="w-full h-full object-cover object-top hover:scale-105 transition duration-300"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-gold font-sans">
                    Primary Silhouette
                  </span>
                  <h4
                    onClick={() => onSelectProduct(outfitRecommendation.primary)}
                    className="font-serif text-lg font-medium text-charcoal hover:text-burgundy transition cursor-pointer"
                  >
                    {outfitRecommendation.primary.name}
                  </h4>
                  <p className="text-xs text-charcoal-muted font-sans mt-0.5">
                    {outfitRecommendation.primary.fabric_spec}
                  </p>
                  <p className="font-serif text-base font-medium text-charcoal mt-1">
                    ₹{outfitRecommendation.primary.price.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    onClick={() => onAddToCart(outfitRecommendation.primary, userFitSize || 'M')}
                    className="flex-1 bg-burgundy hover:bg-burgundy-hover text-white text-xs font-sans font-medium py-1.5 px-3 rounded-full transition flex items-center justify-center space-x-1"
                  >
                    <ShoppingBag className="w-3 h-3 text-gold" />
                    <span>Add to Bag</span>
                  </button>
                  <button
                    onClick={() => onToggleWishlist(outfitRecommendation.primary)}
                    className="p-1.5 rounded-full border border-beige-border hover:bg-white text-charcoal"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        wishlistIds.includes(outfitRecommendation.primary.id) ? 'fill-burgundy text-burgundy' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Piece 2 */}
            <div className="bg-[#F8F4EC] p-4 rounded-2xl border border-beige-border flex space-x-4">
              <div
                onClick={() => onSelectProduct(outfitRecommendation.complementary)}
                className="w-24 h-32 rounded-xl overflow-hidden bg-beige shrink-0 cursor-pointer"
              >
                <img
                  src={outfitRecommendation.complementary.image_url}
                  alt={outfitRecommendation.complementary.name}
                  className="w-full h-full object-cover object-top hover:scale-105 transition duration-300"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-gold font-sans">
                    Complementary Pairing
                  </span>
                  <h4
                    onClick={() => onSelectProduct(outfitRecommendation.complementary)}
                    className="font-serif text-lg font-medium text-charcoal hover:text-burgundy transition cursor-pointer"
                  >
                    {outfitRecommendation.complementary.name}
                  </h4>
                  <p className="text-xs text-charcoal-muted font-sans mt-0.5">
                    {outfitRecommendation.complementary.fabric_spec}
                  </p>
                  <p className="font-serif text-base font-medium text-charcoal mt-1">
                    ₹{outfitRecommendation.complementary.price.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    onClick={() => onAddToCart(outfitRecommendation.complementary, userFitSize || 'M')}
                    className="flex-1 bg-burgundy hover:bg-burgundy-hover text-white text-xs font-sans font-medium py-1.5 px-3 rounded-full transition flex items-center justify-center space-x-1"
                  >
                    <ShoppingBag className="w-3 h-3 text-gold" />
                    <span>Add to Bag</span>
                  </button>
                  <button
                    onClick={() => onToggleWishlist(outfitRecommendation.complementary)}
                    className="p-1.5 rounded-full border border-beige-border hover:bg-white text-charcoal"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        wishlistIds.includes(outfitRecommendation.complementary.id) ? 'fill-burgundy text-burgundy' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Bundle Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-beige-border">
            <div className="text-xs text-charcoal-muted font-sans">
              <span>Both items coordinated for your </span>
              <strong className="text-charcoal">{occasion}</strong>
              <span> plans.</span>
            </div>

            <button
              onClick={() => {
                onAddToCart(outfitRecommendation.primary, userFitSize || 'M');
                onAddToCart(outfitRecommendation.complementary, userFitSize || 'M');
              }}
              className="w-full sm:w-auto bg-burgundy hover:bg-burgundy-hover text-white font-sans text-xs sm:text-sm font-medium py-3 px-8 rounded-full transition shadow-md flex items-center justify-center space-x-2 border border-gold/30"
            >
              <ShoppingBag className="w-4 h-4 text-gold" />
              <span>Add Entire {outfitRecommendation.title} to Bag (Save 10%)</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
