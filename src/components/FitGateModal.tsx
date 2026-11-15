import React from 'react';
import { X, Sparkles, ArrowRight, CheckCircle2, Lock } from 'lucide-react';

interface FitGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartScan: () => void;
}

export const FitGateModal: React.FC<FitGateModalProps> = ({
  isOpen,
  onClose,
  onStartScan,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#261B18]/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#FBF8F3] w-full max-w-md rounded-3xl shadow-modal-luxe overflow-hidden border border-[#B8925A] animate-in zoom-in-95 duration-200">
        {/* Editorial Modal Header */}
        <div className="bg-[#F3ECE1] p-6 text-center border-b border-[#E8DFC8] relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full text-[#5C4D48] hover:text-[#261B18] hover:bg-[#E8DFC8] transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-[#FAF0F0] border border-[#D99B9B] text-[#7A2E2E] flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Lock className="w-7 h-7 text-[#7A2E2E]" />
          </div>

          <span className="bg-[#7A2E2E] text-[#FBF8F3] text-[10px] uppercase font-serif font-bold tracking-widest px-3 py-1 rounded-full">
            Fit-Gate Protected Checkout
          </span>

          <h2 className="font-serif text-2xl font-bold text-[#261B18] mt-2">
            Zero-Return Guarantee
          </h2>
          <p className="text-xs text-[#5C4D48] mt-1 font-serif italic">
            "To guarantee a zero-return fit, complete your 3-second Style DNA scan first."
          </p>
        </div>

        {/* Modal Value Proposition Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-[#5C4D48] leading-relaxed font-sans">
            In standard Indian e-commerce, <strong>35% of apparel is returned</strong> due to anatomical shoulder drop mismatch, bust gaping, or skin-undertone washouts.
          </p>

          <div className="bg-[#F3ECE1] p-4 rounded-2xl border border-[#E8DFC8] space-y-2.5 font-sans">
            <div className="flex items-start space-x-2.5 text-xs text-[#261B18]">
              <CheckCircle2 className="w-4 h-4 text-[#3F5945] shrink-0 mt-0.5" />
              <span>
                <strong>Zero Vanity Sizing Guesswork:</strong> Calibrates your anatomical shoulder slope and South Asian 0.72 waist curve in 3 seconds.
              </span>
            </div>

            <div className="flex items-start space-x-2.5 text-xs text-[#261B18]">
              <CheckCircle2 className="w-4 h-4 text-[#3F5945] shrink-0 mt-0.5" />
              <span>
                <strong>Indian Melanin Calibration:</strong> Eliminates color-clash against your complexion (Warm Golden, Olive, Deep Espresso).
              </span>
            </div>

            <div className="flex items-start space-x-2.5 text-xs text-[#261B18]">
              <CheckCircle2 className="w-4 h-4 text-[#3F5945] shrink-0 mt-0.5" />
              <span>
                <strong>100% On-Device Privacy:</strong> Zero camera photos or videos are ever uploaded or stored.
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                onClose();
                onStartScan();
              }}
              className="w-full bg-[#7A2E2E] hover:bg-[#632323] text-white font-serif font-bold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl transition flex items-center justify-center space-x-2 shadow-elevated-luxe border border-[#B8925A] group"
            >
              <Sparkles className="w-4 h-4 text-[#B8925A] group-hover:rotate-12 transition-transform" />
              <span>Calibrate Style DNA Now (3 Seconds)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-center text-[11px] text-[#5C4D48] mt-2 font-serif">
              Unlocks 1-click seamless checkout across all outfits
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
