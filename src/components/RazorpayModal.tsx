import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, Smartphone, Building2, CheckCircle2, AlertCircle, Lock } from 'lucide-react';

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    id: string;
    amount: number;
    amount_inr: number;
    currency: string;
    items?: any[];
  } | null;
  onPaymentSuccess: (paymentId: string, method: string) => void;
  onPaymentFailure: (errorMsg: string) => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  onClose,
  orderData,
  onPaymentSuccess,
  onPaymentFailure,
}) => {
  const [activeMethod, setActiveMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [selectedUpiApp, setSelectedUpiApp] = useState<string>('Google Pay');
  const [upiVpa, setUpiVpa] = useState<string>('ananya@okhdfcbank');
  const [cardNumber, setCardNumber] = useState<string>('4312 •••• •••• 9012');
  const [cardExpiry, setCardExpiry] = useState<string>('08/29');
  const [selectedBank, setSelectedBank] = useState<string>('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen || !orderData) return null;

  const handleSimulatePayment = (success: boolean) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (success) {
        const paymentId = `pay_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        const methodStr = activeMethod === 'upi' ? `UPI (${selectedUpiApp})` : activeMethod === 'card' ? 'Visa / Mastercard' : `Netbanking (${selectedBank})`;
        onPaymentSuccess(paymentId, methodStr);
      } else {
        onPaymentFailure('Bank authorization rejected (Simulated Payment Failure test)');
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 text-slate-800 animate-in zoom-in-95 duration-200 font-sans">
        {/* Razorpay Top Navy Header */}
        <div className="bg-[#0C2340] text-white p-4 flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3395FF] flex items-center justify-center font-bold text-white text-base shadow">
              R
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-sm font-bold tracking-tight">Razorpay Standard</span>
                <span className="bg-amber-400 text-slate-900 text-[9px] font-black uppercase px-1.5 py-0.2 rounded">
                  Test Sandbox
                </span>
              </div>
              <p className="text-[11px] text-blue-200">Merchant: AURA Atelier D2C Fashion</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Banner */}
        <div className="bg-[#F2F7FF] px-5 py-3 border-b border-blue-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 uppercase font-semibold">Total Payable</span>
            <div className="font-serif text-2xl font-bold text-[#0C2340]">
              ₹{orderData.amount_inr?.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>256-Bit Encrypted</span>
            </span>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">{orderData.id}</p>
          </div>
        </div>

        {/* Payment Method Tabs */}
        <div className="flex border-b border-slate-200 text-xs font-semibold bg-slate-50">
          <button
            onClick={() => setActiveMethod('upi')}
            className={`flex-1 py-3 text-center border-b-2 flex items-center justify-center space-x-1.5 transition ${
              activeMethod === 'upi'
                ? 'border-[#3395FF] text-[#0C2340] bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4 text-[#3395FF]" />
            <span>UPI Instant</span>
          </button>

          <button
            onClick={() => setActiveMethod('card')}
            className={`flex-1 py-3 text-center border-b-2 flex items-center justify-center space-x-1.5 transition ${
              activeMethod === 'card'
                ? 'border-[#3395FF] text-[#0C2340] bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Cards</span>
          </button>

          <button
            onClick={() => setActiveMethod('netbanking')}
            className={`flex-1 py-3 text-center border-b-2 flex items-center justify-center space-x-1.5 transition ${
              activeMethod === 'netbanking'
                ? 'border-[#3395FF] text-[#0C2340] bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-600" />
            <span>Netbanking</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 space-y-4">
          {activeMethod === 'upi' && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wide">
                Select UPI App
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Google Pay', 'PhonePe', 'Paytm'].map((app) => (
                  <button
                    key={app}
                    onClick={() => setSelectedUpiApp(app)}
                    className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition ${
                      selectedUpiApp === app
                        ? 'border-[#3395FF] bg-blue-50 text-[#0C2340] shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    {app}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Virtual Payment Address (VPA / UPI ID)
                </label>
                <input
                  type="text"
                  value={upiVpa}
                  onChange={(e) => setUpiVpa(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                />
              </div>
            </div>
          )}

          {activeMethod === 'card' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Valid Thru</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">CVV</label>
                  <input
                    type="password"
                    value="•••"
                    readOnly
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {activeMethod === 'netbanking' && (
            <div className="space-y-3 text-xs">
              <label className="font-semibold text-slate-600 block">Popular Indian Banks</label>
              <div className="grid grid-cols-2 gap-2">
                {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBank(b)}
                    className={`p-2 rounded-lg border text-left text-xs font-medium transition ${
                      selectedBank === b
                        ? 'border-[#3395FF] bg-blue-50 text-[#0C2340] font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="pt-2 space-y-2">
            <button
              onClick={() => handleSimulatePayment(true)}
              disabled={isProcessing}
              className="w-full bg-[#3395FF] hover:bg-[#2082eb] text-white font-bold text-sm py-3 px-4 rounded-xl shadow transition flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <span>Authorizing with Bank...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay ₹{orderData.amount_inr?.toLocaleString('en-IN')} (Success)</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleSimulatePayment(false)}
              disabled={isProcessing}
              className="w-full text-slate-400 hover:text-rose-600 text-[11px] font-semibold py-1 transition"
            >
              Simulate Bank Drop / Failure Test
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-slate-50 px-5 py-2.5 border-t border-slate-200 text-center text-[10px] text-slate-500">
          Razorpay Certified Partner • Zero Payment Gateway Failure Protection
        </div>
      </div>
    </div>
  );
};
