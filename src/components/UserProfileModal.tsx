import React, { useState } from 'react';
import { X, User as UserIcon, Package, LogOut, MapPin } from 'lucide-react';
import { User, Order } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  orders: Order[];
  onLogout: () => void;
  onTrackOrder?: (order: Order) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  orders,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#F8F4EC] w-full max-w-xl rounded-3xl shadow-modal-luxe border border-gold/30 overflow-hidden flex flex-col max-h-[85vh] font-sans">
        
        {/* Header */}
        <div className="p-6 bg-burgundy text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-gold">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-medium tracking-wide">
                {user?.name || 'TARVEQ Account'}
              </h3>
              <p className="text-xs text-white/70">{user?.email || 'Customer Profile'}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-beige-border bg-white px-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 text-xs sm:text-sm font-medium border-b-2 transition mr-6 ${
              activeTab === 'profile'
                ? 'border-burgundy text-burgundy'
                : 'border-transparent text-charcoal-muted hover:text-charcoal'
            }`}
          >
            Profile Info
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 text-xs sm:text-sm font-medium border-b-2 transition ${
              activeTab === 'orders'
                ? 'border-burgundy text-burgundy'
                : 'border-transparent text-charcoal-muted hover:text-charcoal'
            }`}
          >
            My Orders ({orders.length})
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'profile' && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="bg-white p-4 rounded-2xl border border-beige-border space-y-2">
                <span className="text-[10px] uppercase font-bold text-charcoal-muted tracking-wider">Account Details</span>
                <p><strong>Name:</strong> {user?.name || 'Guest User'}</p>
                <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
                <p><strong>Phone:</strong> {user?.phone || '+91 9307859693'}</p>
              </div>

              {user?.shipping_address && (
                <div className="bg-white p-4 rounded-2xl border border-beige-border space-y-2">
                  <div className="flex items-center space-x-1.5 text-charcoal font-semibold">
                    <MapPin className="w-4 h-4 text-gold" />
                    <span>Saved Delivery Address</span>
                  </div>
                  <p className="text-charcoal-muted">
                    {user.shipping_address.street}, {user.shipping_address.city}, {user.shipping_address.state} - {user.shipping_address.pincode}
                  </p>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 rounded-full border border-burgundy/40 text-burgundy hover:bg-burgundy-light/30 transition text-xs font-semibold flex items-center justify-center space-x-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-3">
              {orders.length === 0 ? (
                <div className="text-center py-10 text-charcoal-muted space-y-2">
                  <Package className="w-8 h-8 mx-auto text-charcoal-muted" />
                  <p className="text-xs">No orders placed yet.</p>
                </div>
              ) : (
                orders.map((ord) => (
                  <div key={ord.id} className="bg-white p-4 rounded-2xl border border-beige-border space-y-2 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-beige-border">
                      <span className="font-mono font-bold text-charcoal">{ord.id}</span>
                      <span className="bg-gold-light text-gold-dark font-medium px-2 py-0.5 rounded-full text-[10px]">
                        {ord.fulfillment_status}
                      </span>
                    </div>
                    <p className="text-charcoal-muted">
                      Items: {ord.items.map((i) => i.name).join(', ')}
                    </p>
                    <div className="flex justify-between items-center pt-1 font-semibold text-charcoal">
                      <span>Total Amount:</span>
                      <span className="text-burgundy font-serif">₹{ord.total_amount?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-beige/40 border-t border-beige-border text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-burgundy text-white text-xs font-medium hover:bg-burgundy-hover transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
