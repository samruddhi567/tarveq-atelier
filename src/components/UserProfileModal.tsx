import React, { useState } from 'react';
import { X, User as UserIcon, Ruler, Palette, Package, MapPin, Heart, LogOut, ShieldCheck, Check, Truck } from 'lucide-react';
import { User, Order } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  orders: Order[];
  onLogout: () => void;
  onOpenFitFinder: () => void;
  onOpenColourStudio: () => void;
  onTrackOrder: (order: Order) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  orders,
  onLogout,
  onOpenFitFinder,
  onOpenColourStudio,
  onTrackOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'fit' | 'orders' | 'addresses'>('profile');

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#F8F4EC] w-full max-w-2xl rounded-3xl shadow-modal-luxe border border-beige-border overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-beige/40 border-b border-beige-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-burgundy text-white flex items-center justify-center font-serif text-lg font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-serif text-2xl font-medium text-charcoal">{user.name}</h3>
              <p className="text-xs text-charcoal-muted font-sans">{user.email}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-full text-charcoal hover:bg-beige transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-beige-border text-xs font-sans font-medium bg-beige/20 px-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'profile' ? 'border-burgundy text-burgundy font-bold' : 'border-transparent text-charcoal-muted'
            }`}
          >
            Account Details
          </button>
          <button
            onClick={() => setActiveTab('fit')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'fit' ? 'border-burgundy text-burgundy font-bold' : 'border-transparent text-charcoal-muted'
            }`}
          >
            Saved Measurements & Fit
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'orders' ? 'border-burgundy text-burgundy font-bold' : 'border-transparent text-charcoal-muted'
            }`}
          >
            My Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`py-3 px-3 border-b-2 transition ${
              activeTab === 'addresses' ? 'border-burgundy text-burgundy font-bold' : 'border-transparent text-charcoal-muted'
            }`}
          >
            Shipping Address
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 font-sans">
          
          {/* TAB 1: Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-beige-border space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-charcoal-muted">Full Name</span>
                  <span className="font-semibold text-charcoal">{user.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-charcoal-muted">Registered Email</span>
                  <span className="font-semibold text-charcoal">{user.email}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-charcoal-muted">Role</span>
                  <span className="font-semibold text-burgundy uppercase">{user.role}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => { onLogout(); onClose(); }}
                  className="w-full bg-white hover:bg-beige/40 text-burgundy border border-burgundy/30 text-xs font-semibold py-2.5 rounded-full transition flex items-center justify-center space-x-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Account</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Saved Fit & Measurements */}
          {activeTab === 'fit' && (
            <div className="space-y-4">
              {user.style_dna && user.style_dna.is_scanned === 1 ? (
                <div className="bg-white p-5 rounded-2xl border border-beige-border space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-beige-border">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-5 h-5 text-sage" />
                      <span className="font-serif text-lg font-medium text-charcoal">
                        Calibrated Fit Profile
                      </span>
                    </div>
                    <button
                      onClick={() => { onOpenFitFinder(); onClose(); }}
                      className="text-xs text-burgundy font-medium underline"
                    >
                      Update
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-beige/20 rounded-xl">
                      <span className="text-charcoal-muted">Recommended Size</span>
                      <p className="font-serif text-xl font-bold text-charcoal mt-0.5">
                        {user.style_dna.build_proportion === 'Petite' ? 'S' : 'M'}
                      </p>
                    </div>

                    <div className="p-3 bg-beige/20 rounded-xl">
                      <span className="text-charcoal-muted">Vertical Inseam</span>
                      <p className="font-serif text-xl font-bold text-charcoal mt-0.5">
                        {user.style_dna.build_proportion || 'Regular'}
                      </p>
                    </div>

                    <div className="p-3 bg-beige/20 rounded-xl">
                      <span className="text-charcoal-muted">Natural Undertone</span>
                      <p className="font-serif text-xl font-bold text-gold mt-0.5">
                        {user.style_dna.undertone || 'Warm Golden'}
                      </p>
                    </div>

                    <div className="p-3 bg-beige/20 rounded-xl">
                      <span className="text-charcoal-muted">Height</span>
                      <p className="font-serif text-xl font-bold text-charcoal mt-0.5">
                        {user.style_dna.height} cm
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-beige-border p-6 space-y-3">
                  <Ruler className="w-8 h-8 text-charcoal-muted mx-auto" />
                  <p className="font-serif text-lg font-medium text-charcoal">No Fit Profile Saved Yet</p>
                  <p className="text-xs text-charcoal-muted max-w-xs mx-auto">
                    Take our 3-second Fit Finder to save your comfort measurements and unlock exact size recommendations across every silhouette.
                  </p>
                  <button
                    onClick={() => { onOpenFitFinder(); onClose(); }}
                    className="bg-burgundy text-white text-xs font-medium px-5 py-2.5 rounded-full hover:bg-burgundy-hover transition shadow-sm"
                  >
                    Launch Fit Finder
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-beige-border p-6 space-y-2">
                  <Package className="w-8 h-8 text-charcoal-muted mx-auto" />
                  <p className="font-serif text-lg font-medium text-charcoal">No orders placed yet</p>
                  <p className="text-xs text-charcoal-muted">
                    When you order garments, live tracking and Shiprocket AWB updates will appear here.
                  </p>
                </div>
              ) : (
                orders.map((ord) => (
                  <div key={ord.id} className="bg-white p-4 rounded-2xl border border-beige-border space-y-3 shadow-sm">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-charcoal">{ord.id}</span>
                        <p className="text-[11px] text-charcoal-muted">Paid via Razorpay Secure</p>
                      </div>
                      <span className="bg-sage-light text-sage text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {ord.fulfillment_status}
                      </span>
                    </div>

                    <div className="divide-y divide-beige-border text-xs">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="py-2 flex items-center justify-between">
                          <span>{it.name} (Size: {it.size || 'M'})</span>
                          <span className="font-serif font-medium">₹{it.price?.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-beige-border flex items-center justify-between text-xs">
                      <p className="font-serif text-base font-bold text-charcoal">
                        Total: ₹{ord.total_amount?.toLocaleString('en-IN')}
                      </p>
                      <button
                        onClick={() => { onTrackOrder(ord); onClose(); }}
                        className="bg-burgundy hover:bg-burgundy-hover text-white text-xs font-medium px-3.5 py-1.5 rounded-full transition flex items-center space-x-1"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Track Delivery</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: Addresses */}
          {activeTab === 'addresses' && (
            <div className="bg-white p-5 rounded-2xl border border-beige-border space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-beige-border">
                <span className="font-semibold text-charcoal uppercase tracking-wider">Saved Delivery Address</span>
                <span className="bg-sage-light text-sage font-medium px-2 py-0.5 rounded-full">Primary</span>
              </div>
              <p className="text-charcoal font-medium">{user.name}</p>
              <p className="text-charcoal-muted">{user.shipping_address?.street || 'Indiranagar 100ft Road'}</p>
              <p className="text-charcoal-muted">
                {user.shipping_address?.city || 'Bengaluru'}, {user.shipping_address?.state || 'Karnataka'} - {user.shipping_address?.pincode || '560038'}
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
