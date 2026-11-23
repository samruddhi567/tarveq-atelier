import React, { useState, useEffect } from 'react';
import { X, Heart, ShoppingBag, ArrowRight, Check, Sparkles } from 'lucide-react';
import { Product, User } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  user: User | null;
  onClose: () => void;
  onAddToCart: (product: Product, size: string) => void;
  onDirectBuy: (product: Product, tailoring: { size: string }) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  user,
  onClose,
  onAddToCart,
  onDirectBuy,
  onToggleWishlist,
  isWishlisted,
}) => {
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [addedToast, setAddedToast] = useState(false);
  const [stylistAdvice, setStylistAdvice] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setStylistAdvice(null);
      fetch('/api/stylist/explain-fit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          userStyleDna: user?.style_dna || null,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.explanation) {
            setStylistAdvice(data.explanation);
          }
        })
        .catch(() => {});
    }
  }, [product, user]);

  if (!product) return null;

  const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image_url];
  const sizes = ['XS', 'S', 'M', 'L', 'XL'];

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleBuyNow = () => {
    onDirectBuy(product, { size: selectedSize });
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#F8F4EC] w-full max-w-4xl rounded-3xl shadow-modal-luxe border border-gold/30 overflow-hidden flex flex-col md:flex-row max-h-[90vh] relative font-sans">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-charcoal flex items-center justify-center transition shadow-sm"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Gallery */}
        <div className="md:w-1/2 p-6 flex flex-col justify-between bg-beige/30 border-r border-beige-border">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-md relative bg-white">
            <img
              src={gallery[activeImageIdx]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {gallery.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-14 h-18 rounded-lg overflow-hidden border-2 transition ${
                    activeImageIdx === idx ? 'border-burgundy scale-105' : 'border-transparent opacity-70'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Actions */}
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-gold font-semibold">{product.category}</p>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal mt-1">
                {product.name}
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <span className="font-serif text-2xl font-semibold text-burgundy">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.original_price > product.price && (
                  <span className="text-sm line-through text-charcoal-muted">
                    ₹{product.original_price.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-charcoal/80 leading-relaxed">
              {product.description || product.tagline}
            </p>

            {/* Size Selector */}
            <div className="pt-2">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">
                  Select Size
                </label>
              </div>
              <div className="flex gap-2">
                {sizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`w-11 h-11 rounded-xl text-xs font-medium border transition ${
                      selectedSize === sz
                        ? 'bg-burgundy text-white border-burgundy shadow-sm'
                        : 'bg-white text-charcoal border-beige-border hover:border-gold'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Fabric Details */}
            {product.fabric_spec && (
              <div className="bg-white p-3.5 rounded-xl border border-beige-border text-xs text-charcoal/80 space-y-1">
                <p><strong>Fabric:</strong> {product.fabric_spec}</p>
                <p><strong>Ordering:</strong> Direct confirmation via WhatsApp</p>
              </div>
            )}

            {/* Ask TARVEQ Stylist Advice */}
            {stylistAdvice && (
              <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#B8925A]/40 space-y-1.5 text-xs">
                <div className="flex items-center space-x-1.5 text-[#7A2E2E] font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-[#B8925A]" />
                  <span>TARVEQ Stylist Note</span>
                </div>
                <p className="text-[#261B18]/80 leading-relaxed italic">
                  "{stylistAdvice}"
                </p>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="pt-6 space-y-3">
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-3 px-4 rounded-full border border-burgundy text-burgundy font-medium text-xs sm:text-sm hover:bg-burgundy-light/30 transition flex items-center justify-center gap-2"
              >
                {addedToast ? <Check className="w-4 h-4 text-sage" /> : <ShoppingBag className="w-4 h-4" />}
                <span>{addedToast ? 'Added to Bag!' : 'Add to Bag'}</span>
              </button>

              <button
                onClick={() => onToggleWishlist(product)}
                className={`p-3 rounded-full border transition ${
                  isWishlisted
                    ? 'bg-burgundy text-white border-burgundy'
                    : 'bg-white text-charcoal border-beige-border hover:text-burgundy'
                }`}
                aria-label="Wishlist"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              className="w-full py-3.5 px-6 rounded-full bg-burgundy hover:bg-burgundy-hover text-white font-medium text-xs sm:text-sm transition shadow-md flex items-center justify-center gap-2"
            >
              <span>Order via WhatsApp</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
