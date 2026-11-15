import React, { useState } from 'react';
import { X, Heart, ShoppingBag, ArrowRight, ShieldCheck, Check, Truck, RotateCcw, Ruler, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Product, User } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  user: User | null;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, length: string, coverage: string) => void;
  onDirectBuy: (product: Product, tailoring: { size: string; length: string; coverage: string }) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  onOpenFitFinder: () => void;
  recommendedSize?: string | null;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  user,
  onClose,
  onAddToCart,
  onDirectBuy,
  onToggleWishlist,
  isWishlisted,
  onOpenFitFinder,
  recommendedSize,
}) => {
  const [selectedSize, setSelectedSize] = useState<string>(recommendedSize || 'M');
  const [selectedLength, setSelectedLength] = useState<'Petite' | 'Regular' | 'Tall'>('Regular');
  const [selectedCoverage, setSelectedCoverage] = useState<'Standard' | 'High Modest Neckline'>('Standard');
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  if (!product) return null;

  const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image_url];
  const inventory = product.stock_inventory || {};
  const variantStock = inventory[selectedSize]?.[selectedLength] ?? 5;
  const isVariantSoldOut = variantStock <= 0;

  // Garment Measurements Matrix
  const measurements: Record<string, { bust: number; waist: number; hip: number; length: number }> = {
    XS: { bust: 84, waist: 66, hip: 90, length: 104 },
    S: { bust: 88, waist: 70, hip: 94, length: 106 },
    M: { bust: 92, waist: 74, hip: 98, length: 108 },
    L: { bust: 98, waist: 80, hip: 104, length: 110 },
    XL: { bust: 104, waist: 86, hip: 110, length: 112 },
  };

  const handleAddToCart = () => {
    if (isVariantSoldOut) return;
    onAddToCart(product, selectedSize, selectedLength, selectedCoverage);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleBuyNow = () => {
    if (isVariantSoldOut) return;
    onDirectBuy(product, {
      size: selectedSize,
      length: selectedLength,
      coverage: selectedCoverage,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#F8F4EC] w-full max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-modal-luxe max-h-[92vh] flex flex-col overflow-hidden border border-beige-border">
        
        {/* Modal Top Bar */}
        <div className="p-4 bg-beige/40 border-b border-beige-border flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-sans">
            <span className="font-serif font-medium text-charcoal uppercase tracking-wider">
              {product.category}
            </span>
            <span>•</span>
            <span className="text-gold font-medium">{product.undertone_suitability}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-charcoal hover:bg-beige transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* 1. Image Gallery */}
          <div className="space-y-3">
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-beige relative shadow-inner">
              <img
                src={gallery[activeImageIdx]}
                alt={product.name}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute bottom-3 left-3 bg-charcoal/80 backdrop-blur-md text-white text-xs font-sans px-3 py-1 rounded-full">
                {product.fabric_opacity}
              </div>
              {isVariantSoldOut && (
                <div className="absolute top-3 right-3 bg-burgundy text-white text-xs font-sans font-medium px-3 py-1 rounded-full shadow">
                  Sold Out ({selectedSize} / {selectedLength})
                </div>
              )}
            </div>

            {/* Thumbnail switcher */}
            {gallery.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-14 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                      activeImageIdx === idx ? 'border-burgundy' : 'border-transparent opacity-60'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 2. Title & Pricing */}
          <div className="space-y-1.5">
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal">
              {product.name}
            </h2>
            <p className="text-sm text-charcoal-muted font-sans">
              {product.description}
            </p>

            <div className="pt-2 flex items-baseline space-x-3">
              <span className="font-serif text-2xl sm:text-3xl font-medium text-charcoal">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.original_price > product.price && (
                <span className="text-sm text-charcoal-muted line-through font-sans">
                  ₹{product.original_price.toLocaleString('en-IN')}
                </span>
              )}
              {product.original_price > product.price && (
                <span className="text-xs text-burgundy font-medium bg-burgundy-light px-2.5 py-0.5 rounded-full border border-burgundy-border">
                  Save ₹{(product.original_price - product.price).toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          {/* 3. Personalized Size Recommendation Banner */}
          <div className="bg-sage-light border border-sage-border rounded-2xl p-4 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-sage font-medium text-xs sm:text-sm">
                <ShieldCheck className="w-4 h-4 text-sage" />
                <span>
                  {recommendedSize
                    ? `Your Recommended Size is ${recommendedSize}`
                    : 'Personalized Size Recommendation Available'}
                </span>
              </div>
              <p className="text-xs text-charcoal-muted leading-relaxed font-sans">
                {recommendedSize
                  ? `Calculated from your bust (${measurements[recommendedSize]?.bust}cm) and waist measurements for an effortless, modest drape.`
                  : 'Complete our 3-second Fit Finder to receive exact size suggestions for this silhouette.'}
              </p>
            </div>
            {!recommendedSize && (
              <button
                onClick={onOpenFitFinder}
                className="text-xs font-semibold text-burgundy underline whitespace-nowrap ml-3"
              >
                Find My Size
              </button>
            )}
          </div>

          {/* 4. Sizing, Length & Tailoring Options */}
          <div className="space-y-4 pt-1 font-sans">
            
            {/* Size Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-charcoal">
                  Select Size
                </label>
                <button
                  onClick={() => setShowSizeGuide(!showSizeGuide)}
                  className="text-xs text-burgundy hover:underline flex items-center space-x-1 font-medium"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Size Guide & Measurements</span>
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {['XS', 'S', 'M', 'L', 'XL'].map((size) => {
                  const isRec = recommendedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 rounded-xl text-xs font-medium border transition ${
                        selectedSize === size
                          ? 'bg-burgundy text-white border-burgundy shadow-sm'
                          : 'bg-white/80 text-charcoal border-beige-border hover:bg-white'
                      }`}
                    >
                      <span>{size}</span>
                      {isRec && <span className="block text-[9px] text-gold font-bold">Fit</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Guide Accordion Table */}
            {showSizeGuide && (
              <div className="bg-beige/40 p-4 rounded-2xl border border-beige-border space-y-3 text-xs animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-charcoal uppercase tracking-wider">Garment Measurements (cm)</span>
                  <span className="text-[10px] text-charcoal-muted">All dimensions in centimetres</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-center border-collapse">
                    <thead>
                      <tr className="border-b border-beige-border text-charcoal-muted">
                        <th className="py-1 px-2 text-left">Size</th>
                        <th className="py-1 px-2">Bust</th>
                        <th className="py-1 px-2">Waist</th>
                        <th className="py-1 px-2">Hips</th>
                        <th className="py-1 px-2">Length</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-beige-border text-charcoal">
                      {Object.entries(measurements).map(([s, m]) => (
                        <tr key={s} className={selectedSize === s ? 'bg-burgundy/10 font-bold' : ''}>
                          <td className="py-1 px-2 text-left">{s}</td>
                          <td className="py-1 px-2">{m.bust} cm</td>
                          <td className="py-1 px-2">{m.waist} cm</td>
                          <td className="py-1 px-2">{m.hip} cm</td>
                          <td className="py-1 px-2">{m.length} cm</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Custom Length */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-charcoal block mb-2">
                Custom Inseam Length (Included at No Cost)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Petite', label: 'Petite', sub: "Below 5'3\"" },
                  { id: 'Regular', label: 'Regular', sub: "5'3\" – 5'7\"" },
                  { id: 'Tall', label: 'Tall', sub: "Above 5'7\"" },
                ].map((len) => (
                  <button
                    key={len.id}
                    onClick={() => setSelectedLength(len.id as any)}
                    className={`p-2 rounded-xl text-center border transition ${
                      selectedLength === len.id
                        ? 'bg-burgundy text-white border-burgundy shadow-sm'
                        : 'bg-white/80 text-charcoal border-beige-border hover:bg-white'
                    }`}
                  >
                    <p className="text-xs font-medium">{len.label}</p>
                    <p className={`text-[10px] ${selectedLength === len.id ? 'text-white/80' : 'text-charcoal-muted'}`}>
                      {len.sub}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Modest Coverage Preference */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-charcoal block mb-2">
                Neckline & Coverage
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'Standard', label: 'Standard Modest Cut', sub: 'Balanced neck drop' },
                  { id: 'High Modest Neckline', label: 'High Modest Neckline', sub: 'Zero bust gaping' },
                ].map((cov) => (
                  <button
                    key={cov.id}
                    onClick={() => setSelectedCoverage(cov.id as any)}
                    className={`p-2.5 rounded-xl text-left border transition ${
                      selectedCoverage === cov.id
                        ? 'bg-burgundy text-white border-burgundy shadow-sm'
                        : 'bg-white/80 text-charcoal border-beige-border hover:bg-white'
                    }`}
                  >
                    <p className="text-xs font-medium">{cov.label}</p>
                    <p className={`text-[10px] ${selectedCoverage === cov.id ? 'text-white/80' : 'text-charcoal-muted'}`}>
                      {cov.sub}
                    </p>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* 5. Trust Points: Shipping & Returns */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-sans text-charcoal-muted border-t border-beige-border">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-gold flex-shrink-0" />
              <span>Complimentary shipping across India (3-5 days delivery)</span>
            </div>
            <div className="flex items-center space-x-2">
              <RotateCcw className="w-4 h-4 text-gold flex-shrink-0" />
              <span>15-day complimentary exchange & hassle-free returns</span>
            </div>
          </div>

          {/* 6. Honest Customer Ratings Breakdown */}
          <div className="bg-beige/30 p-4 rounded-2xl border border-beige-border space-y-2 font-sans">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-charcoal uppercase tracking-wider">Fabric & Drape Feedback</span>
              <div className="flex items-center space-x-1 text-gold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="font-bold text-charcoal">4.9</span>
                <span className="text-charcoal-muted">(48 verified clients)</span>
              </div>
            </div>
            <p className="text-xs text-charcoal-muted italic">
              "The cambric cotton has a substantial, zero-sheer weight and the petite inseam was exactly right on first wear." — Ananya S., Bengaluru
            </p>
          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-beige/40 border-t border-beige-border flex items-center space-x-3">
          
          {/* Wishlist Button */}
          <button
            onClick={() => onToggleWishlist(product)}
            className={`p-3 rounded-full border transition ${
              isWishlisted
                ? 'bg-burgundy text-white border-burgundy'
                : 'bg-white text-charcoal border-beige-border hover:bg-beige'
            }`}
            aria-label="Wishlist"
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>

          {/* Add to Bag Button */}
          <button
            onClick={handleAddToCart}
            disabled={isVariantSoldOut}
            className={`flex-1 py-3 px-4 rounded-full text-xs sm:text-sm font-medium transition flex items-center justify-center space-x-2 shadow-sm border ${
              isVariantSoldOut
                ? 'bg-beige text-charcoal-muted border-beige-border cursor-not-allowed'
                : 'bg-white text-charcoal border-charcoal/20 hover:border-burgundy hover:text-burgundy'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{addedToast ? 'Added to Bag ✓' : isVariantSoldOut ? 'Sold Out' : 'Add to Bag'}</span>
          </button>

          {/* Direct Buy Now Button */}
          <button
            onClick={handleBuyNow}
            disabled={isVariantSoldOut}
            className={`flex-1 py-3 px-4 rounded-full text-xs sm:text-sm font-medium transition flex items-center justify-center space-x-2 shadow-md ${
              isVariantSoldOut
                ? 'bg-beige text-charcoal-muted cursor-not-allowed'
                : 'bg-burgundy hover:bg-burgundy-hover text-white border border-gold/30'
            }`}
          >
            <span>Buy Now</span>
            <ArrowRight className="w-4 h-4 text-gold" />
          </button>

        </div>

      </div>
    </div>
  );
};
