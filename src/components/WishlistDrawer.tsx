import React from 'react';
import { X, Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistProducts: Product[];
  onRemoveFromWishlist: (product: Product) => void;
  onMoveToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistProducts,
  onRemoveFromWishlist,
  onMoveToCart,
  onViewProduct,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="bg-[#F8F4EC] w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-5 bg-beige/40 border-b border-beige-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-burgundy fill-current" />
            <h3 className="font-serif text-2xl font-medium text-charcoal">Saved Wishlist</h3>
            <span className="text-xs font-sans bg-burgundy-light text-burgundy font-medium px-2 py-0.5 rounded-full">
              {wishlistProducts.length}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-charcoal hover:bg-beige transition"
            aria-label="Close wishlist"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wishlist Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {wishlistProducts.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="w-16 h-16 rounded-full bg-beige flex items-center justify-center mx-auto text-charcoal-muted">
                <Heart className="w-8 h-8" />
              </div>
              <h4 className="font-serif text-xl font-medium text-charcoal">Your wishlist is empty</h4>
              <p className="text-xs text-charcoal-muted max-w-xs mx-auto font-sans">
                Save your favourite modest co-ords, linen tunics, and tailoring pieces to revisit anytime.
              </p>
              <button
                onClick={onClose}
                className="bg-burgundy text-white text-xs font-medium px-6 py-2.5 rounded-full hover:bg-burgundy-hover transition shadow-sm font-sans"
              >
                Discover Collection
              </button>
            </div>
          ) : (
            wishlistProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white/80 p-3.5 rounded-2xl border border-beige-border flex space-x-3 shadow-sm hover:shadow-md transition"
              >
                {/* Image */}
                <div
                  onClick={() => { onViewProduct(prod); onClose(); }}
                  className="w-20 h-24 rounded-xl overflow-hidden bg-beige shrink-0 cursor-pointer"
                >
                  <img
                    src={prod.image_url}
                    alt={prod.name}
                    className="w-full h-full object-cover object-top hover:scale-105 transition duration-300"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-start justify-between">
                      <h4
                        onClick={() => { onViewProduct(prod); onClose(); }}
                        className="font-serif text-base font-medium text-charcoal line-clamp-1 cursor-pointer hover:text-burgundy transition"
                      >
                        {prod.name}
                      </h4>
                      <button
                        onClick={() => onRemoveFromWishlist(prod)}
                        className="text-charcoal-muted hover:text-burgundy transition p-1"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-charcoal-muted font-sans line-clamp-1">
                      {prod.fabric_spec}
                    </p>

                    <div className="flex items-baseline space-x-2 pt-0.5">
                      <span className="font-serif text-base font-medium text-charcoal">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </span>
                      {prod.original_price > prod.price && (
                        <span className="text-[11px] text-charcoal-muted line-through font-sans">
                          ₹{prod.original_price.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center space-x-2">
                    <button
                      onClick={() => onMoveToCart(prod)}
                      className="flex-1 bg-burgundy hover:bg-burgundy-hover text-white text-xs font-sans font-medium py-1.5 px-3 rounded-full transition flex items-center justify-center space-x-1.5 shadow-sm"
                    >
                      <ShoppingBag className="w-3 h-3 text-gold" />
                      <span>Move to Bag</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
