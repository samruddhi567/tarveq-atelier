import React from 'react';
import { CheckCircle2, X, Award, ShieldCheck, ArrowRight, Package } from 'lucide-react';
import { User } from '../types';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderDetails: any;
  user: User | null;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  onClose,
  orderDetails,
  user,
}) => {
  if (!isOpen || !orderDetails) return null;

  return (
    <div className="fixed inset-0 z-50 bg-espresso/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-ivory w-full max-w-md rounded-3xl shadow-modal-luxe overflow-hidden border border-sand-border animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-sand p-6 text-center border-b border-sand-border relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-espresso-soft hover:text-espresso hover:bg-sand-border transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-full bg-olive-light border-2 border-olive-border text-olive flex items-center justify-center mx-auto mb-3 shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <span className="bg-olive text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full">
            Fit-Gate Verified Order
          </span>

          <h2 className="font-serif text-2xl font-bold text-espresso mt-2">
            Order Confirmed!
          </h2>
          <p className="text-xs text-olive font-semibold mt-1">
            Zero-Return Certificate Issued
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          {/* Order Meta Box */}
          <div className="bg-white p-4 rounded-2xl border border-sand-border space-y-2 text-xs">
            <div className="flex justify-between text-espresso-soft">
              <span>Order Reference</span>
              <strong className="text-espresso font-mono">{orderDetails.orderId}</strong>
            </div>

            <div className="flex justify-between text-espresso-soft">
              <span>Bespoke Tailoring Status</span>
              <span className="text-olive font-semibold">Calibrated In-Queue</span>
            </div>

            <div className="flex justify-between text-espresso-soft">
              <span>Total Paid</span>
              <strong className="font-serif text-base text-espresso">
                ₹{orderDetails.total?.toLocaleString('en-IN')}
              </strong>
            </div>
          </div>

          {/* Certificate Card */}
          <div className="bg-sand-light p-4 rounded-2xl border border-sand-border space-y-2 text-xs">
            <div className="flex items-center space-x-1.5 font-serif font-bold text-espresso">
              <Award className="w-4 h-4 text-gold" />
              <span>Series-A Zero-Return Guarantee</span>
            </div>
            <p className="text-espresso-soft text-[11px] leading-relaxed">
              Every seam is cut to your <strong>{user?.undertone || 'Calibrated'}</strong> tone and <strong>{user?.build_proportion || 'Regular'}</strong> silhouette. If the shoulder or drape deviates by even 1cm, get an instant 100% store credit plus free home concierge adjustment.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-espresso text-ivory font-semibold text-sm py-3 px-4 rounded-xl hover:bg-espresso-muted transition flex items-center justify-center space-x-2 shadow"
          >
            <Package className="w-4 h-4" />
            <span>Track Tailoring & Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
};
