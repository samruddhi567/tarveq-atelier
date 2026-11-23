import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, Lock } from 'lucide-react';
import { Product } from '../types';

export interface CartItem {
  product: Product;
  size: string;
  length: string;
  coverage: string;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 999;
  const progressToFreeShipping = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="bg-[#F8F4EC] w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-5 bg-beige/40 border-b border-beige-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-burgundy" />
            <h3 className="font-serif text-2xl font-medium text-charcoal">Shopping Bag</h3>
            <span className="text-xs font-sans bg-burgundy-light text-burgundy font-medium px-2 py-0.5 rounded-full">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-charcoal hover:bg-beige transition"
            aria-label="Close bag"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="px-5 py-3 bg-beige/20 border-b border-beige-border text-xs font-sans">
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center space-x-1.5 text-charcoal font-medium">
              <Truck className="w-3.5 h-3.5 text-gold" />
              <span>
                {subtotal >= freeShippingThreshold
                  ? 'Complimentary Delivery Unlocked!'
                  : `Add ₹${(freeShippingThreshold - subtotal).toLocaleString('en-IN')} more for free delivery`}
              </span>
            </span>
            <span className="text-gold font-bold">{progressToFreeShipping}%</span>
          </div>
          <div className="w-full bg-beige h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gold h-full rounded-full transition-all duration-300"
              style={{ width: `${progressToFreeShipping}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="w-16 h-16 rounded-full bg-beige flex items-center justify-center mx-auto text-charcoal-muted">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-serif text-xl font-medium text-charcoal">Your bag is empty</h4>
              <p className="text-xs text-charcoal-muted max-w-xs mx-auto">
                Explore our curated collection of bespoke cambric co-ords, linen tunics, and modest essentials.
              </p>
              <button
                onClick={onClose}
                className="bg-burgundy text-white text-xs font-medium px-6 py-2.5 rounded-full hover:bg-burgundy-hover transition shadow-sm flex items-center space-x-2 mx-auto"
              >
                <span>Explore Collection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={idx}
                className="bg-white/80 p-3.5 rounded-2xl border border-beige-border flex space-x-3 shadow-sm"
              >
                {/* Thumbnail */}
                <div className="w-20 h-24 rounded-xl overflow-hidden bg-beige shrink-0">
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-start justify-between">
                      <h4 className="font-serif text-base font-medium text-charcoal line-clamp-1">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(idx)}
                        className="text-charcoal-muted hover:text-burgundy transition p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-charcoal-muted font-sans">
                      Size: <span className="font-semibold text-charcoal">{item.size}</span> • Inseam: <span className="font-semibold text-charcoal">{item.length}</span>
                    </p>

                    <p className="text-[11px] text-charcoal-muted font-sans">
                      Neckline: {item.coverage}
                    </p>
                  </div>

                  {/* Quantity & Price */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2 border border-beige-border rounded-lg bg-beige/30 px-2 py-0.5 text-xs font-sans">
                      <button
                        onClick={() => onUpdateQuantity(idx, Math.max(1, item.quantity - 1))}
                        className="text-charcoal-muted hover:text-charcoal font-bold px-1 min-w-[32px] min-h-[32px] flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="font-medium px-1 text-charcoal">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                        className="text-charcoal-muted hover:text-charcoal font-bold px-1 min-w-[32px] min-h-[32px] flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-serif text-base font-medium text-charcoal">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer & Checkout Trigger */}
        {items.length > 0 && (
          <div className="p-5 bg-beige/40 border-t border-beige-border space-y-3">
            <div className="flex items-center justify-between text-xs text-charcoal-muted font-sans">
              <span>Subtotal</span>
              <span className="font-serif text-lg font-medium text-charcoal">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-sage font-sans font-medium">
              <span>Shipping Across India</span>
              <span>{subtotal >= freeShippingThreshold ? 'FREE' : '₹99'}</span>
            </div>

            <div className="pt-2 border-t border-beige-border flex items-center justify-between">
              <div>
                <span className="text-[10px] text-charcoal-muted uppercase tracking-wider font-sans">Total Payable</span>
                <p className="font-serif text-2xl font-medium text-charcoal">
                  ₹{(subtotal + (subtotal >= freeShippingThreshold ? 0 : 99)).toLocaleString('en-IN')}
                </p>
              </div>

              <button
                onClick={onProceedToCheckout}
                className="bg-burgundy hover:bg-burgundy-hover text-white font-sans text-xs sm:text-sm font-semibold py-3 px-5 rounded-full transition shadow-md flex items-center space-x-2 border border-gold/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Proceed to Payment Gateway</span>
                <ArrowRight className="w-4 h-4 text-gold" />
              </button>
            </div>

            {/* Payment Gateway Trust Badge */}
            <div className="bg-white/90 p-2.5 rounded-xl border border-beige-border text-center space-y-1">
              <div className="flex items-center justify-center space-x-1.5 text-[11px] text-charcoal font-semibold">
                <Lock className="w-3.5 h-3.5 text-burgundy" />
                <span>Verified TARVEQ Payment Gateway</span>
              </div>
              <p className="text-[10px] text-charcoal-muted">
                UPI Instant • Credit/Debit Cards • NetBanking • Cash on Delivery (COD via WhatsApp to 9307859693 & 8809271583)
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
