import React, { useState } from 'react';
import { Heart, Eye, ShoppingBag, Check, X, Zap } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product, size?: string) => void;
  onBuyNow?: (product: Product, size?: string) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  recommendedSize?: string | null;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted,
  recommendedSize,
}) => {
  const isSoldOut = product.is_sold_out || product.total_stock === 0;
  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  const discountPct = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  // Size picker state
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>(recommendedSize || 'M');

  const handleAddToBagClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSoldOut) return;
    setShowSizePicker(true);
  };

  const handleConfirmSize = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, selectedSize);
    setShowSizePicker(false);
  };

  const handleCancelSize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSizePicker(false);
  };

  return (
    <div className="bg-[#E8E0D3]/35 hover:bg-[#E8E0D3]/60 rounded-3xl overflow-hidden border border-beige-border shadow-soft-luxe hover:shadow-elevated-luxe transition-all duration-300 flex flex-col justify-between group">
      
      {/* 1. Product Image & Floating Badges */}
      <div className="relative aspect-[4/5] sm:aspect-[3/4] overflow-hidden bg-beige cursor-pointer max-h-[500px] sm:max-h-none" onClick={() => onSelect(product)}>
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out filter saturate-[0.96]"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1.5">
          {recommendedSize ? (
            <span className="bg-sage text-white text-[11px] font-sans font-medium px-2.5 py-1 rounded-full shadow-md flex items-center space-x-1">
              <Check className="w-3 h-3" />
              <span>Recommended Size: {recommendedSize}</span>
            </span>
          ) : product.isCalibrated ? (
            <span className="bg-sage text-white text-[11px] font-sans font-medium px-2.5 py-1 rounded-full shadow-md">
              ✦ Fit Calibrated
            </span>
          ) : null}

          {discountPct > 0 && (
            <span className="bg-burgundy text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm w-fit font-sans">
              {discountPct}% Off
            </span>
          )}
        </div>

        {/* Top Right: Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
            isWishlisted
              ? 'bg-burgundy text-white'
              : 'bg-white/80 hover:bg-white text-charcoal hover:text-burgundy'
          }`}
          aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Bottom Hover Action: Quick View */}
        <div className="absolute inset-x-0 bottom-3 px-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="w-full bg-[#F8F4EC]/95 backdrop-blur-md text-charcoal hover:text-burgundy hover:bg-white text-xs font-sans font-medium py-2 px-3 rounded-full shadow-md flex items-center justify-center space-x-1.5 border border-charcoal/10 transition"
          >
            <Eye className="w-3.5 h-3.5 text-burgundy" />
            <span>Quick View & Tailoring</span>
          </button>
        </div>
      </div>

      {/* 2. Product Details Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Category & Fabric */}
          <div className="flex items-center justify-between text-xs text-charcoal-muted uppercase tracking-wider font-sans">
            <span>{product.category}</span>
            <span className="text-gold font-medium">{product.undertone_suitability}</span>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onSelect(product)}
            className="font-serif text-xl sm:text-[22px] font-medium text-charcoal hover:text-burgundy transition cursor-pointer line-clamp-1 leading-snug"
          >
            {product.name}
          </h3>

          {/* Fabric Spec Tag */}
          <p className="text-xs text-charcoal-muted font-sans line-clamp-1">
            {product.fabric_spec} • {product.fabric_opacity?.includes('100%') ? '100% Zero-Sheer' : 'Modest Coverage'}
          </p>
        </div>

        {/* 3. Pricing and Add to Bag */}
        <div className="pt-3 border-t border-beige-border space-y-3">
          {/* Price row */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="font-serif text-xl sm:text-2xl font-medium text-charcoal">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.original_price > product.price && (
                  <span className="text-xs text-charcoal-muted line-through font-sans">
                    ₹{product.original_price.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-sage font-sans font-medium">Free Shipping Across India</p>
            </div>

            {/* Add to Cart / Sold Out / Buy Now Button */}
            {isSoldOut ? (
              <button
                onClick={() => onSelect(product)}
                className="bg-beige text-charcoal-muted text-xs font-sans font-medium px-3.5 py-2 rounded-full cursor-not-allowed border border-beige-border"
              >
                Sold Out
              </button>
            ) : !showSizePicker ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleAddToBagClick}
                  className="bg-white hover:bg-beige-light text-burgundy border border-burgundy text-xs font-sans font-semibold px-3 py-2 rounded-full transition flex items-center space-x-1 shadow-sm"
                  title="Add to Shopping Bag"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Bag</span>
                </button>
                {onBuyNow && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBuyNow(product, selectedSize);
                    }}
                    className="bg-[#7C3031] hover:bg-[#632324] text-white text-xs font-sans font-bold px-3 py-2 rounded-full transition flex items-center space-x-1 shadow-sm border border-gold/40"
                    title="Buy Now with Instant Payment Gateway"
                  >
                    <Zap className="w-3 h-3 text-gold fill-current" />
                    <span>Buy Now</span>
                  </button>
                )}
              </div>
            ) : null}
          </div>

          {/* ── Inline Size Picker (shown when user clicks "Add to Bag") ── */}
          {showSizePicker && !isSoldOut && (
            <div
              className="bg-white/95 border border-gold/30 rounded-2xl px-3 py-3 space-y-2.5 shadow-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-charcoal font-sans font-semibold uppercase tracking-widest">
                  Select Size
                </span>
                <button onClick={handleCancelSize} className="text-charcoal-muted hover:text-charcoal transition">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Size pills */}
              <div className="flex flex-wrap gap-1.5">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={(e) => { e.stopPropagation(); setSelectedSize(s); }}
                    className={`text-[12px] font-sans font-medium px-3 py-1 rounded-full border transition-all ${
                      selectedSize === s
                        ? 'bg-burgundy text-white border-burgundy shadow-sm'
                        : recommendedSize === s
                        ? 'border-sage bg-sage-light text-sage'
                        : 'border-beige-border text-charcoal-muted bg-white hover:border-burgundy hover:text-burgundy'
                    }`}
                  >
                    {s}
                    {recommendedSize === s && (
                      <span className="ml-1 text-[9px] opacity-80">★</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Confirm / Action buttons: Add to Bag and Buy Now */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleConfirmSize}
                  className="flex-1 bg-white hover:bg-beige-light text-burgundy border border-burgundy text-[12px] font-sans font-semibold py-2 rounded-full transition flex items-center justify-center space-x-1 shadow-sm"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Bag</span>
                </button>
                {onBuyNow && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSizePicker(false);
                      onBuyNow(product, selectedSize);
                    }}
                    className="flex-1 bg-[#7C3031] hover:bg-[#632324] text-white text-[12px] font-sans font-bold py-2 rounded-full transition flex items-center justify-center space-x-1 shadow-sm border border-gold/40"
                  >
                    <Zap className="w-3 h-3 text-gold fill-current" />
                    <span>Buy Now</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
