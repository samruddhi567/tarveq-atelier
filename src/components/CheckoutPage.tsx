import React, { useState } from 'react';
import {
  X,
  ArrowRight,
  ShieldCheck,
  Truck,
  MessageCircle,
  Copy,
  Check,
  Upload,
  AlertCircle,
  ShoppingBag,
  CreditCard,
  Smartphone,
  Building2,
  Lock,
  QrCode,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { User } from '../types';
import { CartItem } from './CartDrawer';

interface CheckoutPageProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  user: User | null;
  onOrderCreated: (orderData: any, whatsAppUrls: any) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  isOpen,
  onClose,
  items,
  user,
  onOrderCreated,
}) => {
  // Step 1: Customer Details
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');

  // Delivery Address
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState(user?.shipping_address?.street || '');
  const [city, setCity] = useState(user?.shipping_address?.city || 'Dehradun');
  const [state, setState] = useState(user?.shipping_address?.state || 'Uttarakhand');
  const [pincode, setPincode] = useState(user?.shipping_address?.pincode || '248001');
  const [landmark, setLandmark] = useState('');

  // Step 2: Payment Gateway Selection
  // Options: 'UPI' | 'Card' | 'NetBanking' | 'COD'
  const [paymentGatewayMethod, setPaymentGatewayMethod] = useState<'COD' | 'UPI' | 'Card' | 'NetBanking'>('COD');

  // Sub-states for UPI
  const [upiOption, setUpiOption] = useState<'qr' | 'id'>('qr');
  const [upiIdInput, setUpiIdInput] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Sub-states for Cards
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState(customerName || '');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpProcessing, setOtpProcessing] = useState(false);

  // Sub-states for Net Banking
  const [selectedBank, setSelectedBank] = useState('HDFC');

  // Customer Notes
  const [customerNotes, setCustomerNotes] = useState('');

  // UI & Validation States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const CONFIGURED_UPI_ID = '9307859693@upi'; // Primary TARVEQ Business UPI
  const ADMIN_1_PHONE = '9307859693';
  const ADMIN_2_PHONE = '8809271583';

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryCharge = subtotal >= 999 ? 0 : 99;
  const totalAmount = subtotal + deliveryCharge;

  // Format Card Number with 4-digit spaces
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format Card Expiry MM/YY
  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2, 4)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(CONFIGURED_UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 3000);
  };

  const validateForm = () => {
    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return false;
    }
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number for order delivery.');
      return false;
    }
    if (!street.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      setErrorMessage('Please fill in complete delivery address details.');
      return false;
    }
    if (pincode.replace(/\D/g, '').length !== 6) {
      setErrorMessage('Please enter a valid 6-digit Indian PIN code.');
      return false;
    }

    if (paymentGatewayMethod === 'Card') {
      if (cardNumber.replace(/\s/g, '').length !== 16) {
        setErrorMessage('Please enter a valid 16-digit card number.');
        return false;
      }
      if (cardExpiry.length !== 5) {
        setErrorMessage('Please enter card expiry in MM/YY format.');
        return false;
      }
      if (cardCvv.length < 3) {
        setErrorMessage('Please enter a valid 3 or 4 digit CVV.');
        return false;
      }
    }

    if (paymentGatewayMethod === 'UPI' && upiOption === 'id') {
      if (!upiIdInput.includes('@')) {
        setErrorMessage('Please enter a valid UPI ID (e.g. mobile@upi or name@okhdfcbank).');
        return false;
      }
    }

    return true;
  };

  const executeOrderCreation = async (actualPaymentMethod: string, extraNotes?: string) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const payload = {
        userId: user?.id || 'user-customer-demo',
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        shippingAddress: {
          houseNo: houseNo.trim(),
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          landmark: landmark.trim(),
        },
        items: items.map((it) => ({
          id: it.product.id,
          name: it.product.name,
          price: it.product.price,
          size: it.size,
          length: it.length,
          colour: it.product.undertone_suitability,
          quantity: it.quantity,
          image_url: it.product.image_url,
        })),
        paymentMethod: actualPaymentMethod,
        upiReference: paymentGatewayMethod === 'UPI' ? upiIdInput.trim() : '',
        paymentScreenshot: '',
        customerNotes: (customerNotes + (extraNotes ? `\n${extraNotes}` : '')).trim(),
      };

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order.');

      onOrderCreated(data.order, data.whatsAppUrls);
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (paymentGatewayMethod === 'Card') {
      // Trigger card 3D-Secure simulation
      setShowOtpModal(true);
      return;
    }

    let methodLabel = 'Cash on Delivery (COD) via WhatsApp';
    if (paymentGatewayMethod === 'UPI') {
      methodLabel = `UPI Instant (${upiOption === 'qr' ? 'Dynamic QR Code' : upiIdInput})`;
    } else if (paymentGatewayMethod === 'NetBanking') {
      methodLabel = `Net Banking (${selectedBank} Bank)`;
    }

    await executeOrderCreation(methodLabel);
  };

  const handleSimulatedOtpSuccess = async () => {
    setOtpProcessing(true);
    setTimeout(async () => {
      setOtpProcessing(false);
      setShowOtpModal(false);
      await executeOrderCreation(
        `Credit/Debit Card (Ending in ${cardNumber.slice(-4)})`,
        `Cardholder: ${cardHolder || customerName} • 3D Secure Verified`
      );
    }, 1500);
  };

  // Dynamic QR Code URI for UPI
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    `upi://pay?pa=${CONFIGURED_UPI_ID}&pn=TARVEQ%20ATELIER&am=${totalAmount}&cu=INR`
  )}`;

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/70 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#F8F4EC] w-full max-w-4xl rounded-t-3xl sm:rounded-3xl shadow-modal-luxe max-h-[94vh] flex flex-col overflow-hidden border border-beige-border font-sans">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-beige/40 border-b border-beige-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/images/tarveq-crest.png" alt="TARVEQ Crest" className="h-7 w-auto object-contain" />
            <span className="font-serif text-xl sm:text-2xl font-bold text-burgundy tracking-[0.16em] uppercase">TARVEQ</span>
            <span className="text-[11px] sm:text-xs bg-gold text-white font-medium px-2.5 py-0.5 rounded-full flex items-center space-x-1">
              <Lock className="w-3 h-3" />
              <span>Secure Gateway</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="text-xs font-medium text-burgundy hover:underline flex items-center space-x-1 px-2.5 py-1 rounded-full hover:bg-beige transition"
              aria-label="Back to bag"
            >
              <span>← Back to Bag</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-charcoal hover:bg-beige transition"
              aria-label="Close checkout"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {errorMessage && (
            <div className="bg-burgundy-light border border-burgundy-border text-burgundy p-3.5 rounded-2xl flex items-center space-x-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form id="checkout-form" onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            
            {/* Left Column: Customer & Delivery Address */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* 1. Customer Details */}
              <div className="bg-white p-5 rounded-2xl border border-beige-border space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-xl font-medium text-charcoal flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-burgundy text-white text-xs flex items-center justify-center font-bold">1</span>
                    <span>Customer Details</span>
                  </h4>
                  <span className="text-[11px] text-charcoal-muted">Indian Delivery</span>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <label className="font-semibold text-charcoal block mb-1 text-xs">
                      Full Name <span className="text-burgundy">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Ananya Sharma"
                      className="w-full px-3.5 py-2.5 bg-[#F8F4EC]/40 border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-charcoal block mb-1 text-xs">
                        Mobile Number (WhatsApp) <span className="text-burgundy">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full px-3.5 py-2.5 bg-[#F8F4EC]/40 border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-charcoal block mb-1 text-xs">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="e.g. ananya@example.com"
                        className="w-full px-3.5 py-2.5 bg-[#F8F4EC]/40 border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Delivery Address */}
              <div className="bg-white p-5 rounded-2xl border border-beige-border space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif text-xl font-medium text-charcoal flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-burgundy text-white text-xs flex items-center justify-center font-bold">2</span>
                    <span>Delivery Address</span>
                  </h4>
                  <span className="text-[11px] text-sage font-medium flex items-center space-x-1">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Free Shipping on ₹999+</span>
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="font-semibold text-charcoal block mb-1 text-xs">House / Flat No.</label>
                      <input
                        type="text"
                        value={houseNo}
                        onChange={(e) => setHouseNo(e.target.value)}
                        placeholder="e.g. Flat 402"
                        className="w-full px-3.5 py-2.5 bg-[#F8F4EC]/40 border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-semibold text-charcoal block mb-1 text-xs">
                        Street, Colony, Area <span className="text-burgundy">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="e.g. Rajpur Road, Near Clock Tower"
                        className="w-full px-3.5 py-2.5 bg-[#F8F4EC]/40 border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-charcoal block mb-1 text-xs">
                        City <span className="text-burgundy">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Dehradun"
                        className="w-full px-3.5 py-2.5 bg-[#F8F4EC]/40 border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-charcoal block mb-1 text-xs">
                        State <span className="text-burgundy">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="Uttarakhand"
                        className="w-full px-3.5 py-2.5 bg-[#F8F4EC]/40 border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-charcoal block mb-1 text-xs">
                        PIN Code <span className="text-burgundy">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="248001"
                        className="w-full px-3.5 py-2.5 bg-[#F8F4EC]/40 border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-charcoal block mb-1 text-xs">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Opposite Silver City Mall / Near Pacific Mall"
                      className="w-full px-3.5 py-2.5 bg-[#F8F4EC]/40 border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                    />
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              <div className="bg-white p-4 rounded-2xl border border-beige-border space-y-2 shadow-sm text-xs">
                <label className="font-semibold text-charcoal block">
                  Delivery Notes or Custom Tailoring Requests (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="e.g. Please call before arriving or adjust sleeve length by 1 inch."
                  className="w-full px-3 py-2 bg-[#F8F4EC]/40 border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                />
              </div>

            </div>

            {/* Right Column: Payment Gateway & Order Summary */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Order Items Mini Summary */}
              <div className="bg-white p-4 rounded-2xl border border-beige-border space-y-3 shadow-sm text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-beige-border">
                  <span className="font-serif text-base font-medium text-charcoal flex items-center space-x-1.5">
                    <ShoppingBag className="w-4 h-4 text-burgundy" />
                    <span>Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                  </span>
                  <span className="font-serif text-base font-bold text-charcoal">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="max-h-40 overflow-y-auto divide-y divide-beige-border/60 pr-1">
                  {items.map((it, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between space-x-2">
                      <div className="flex items-center space-x-2 truncate">
                        <img
                          src={it.product.image_url}
                          alt={it.product.name}
                          className="w-10 h-12 object-cover rounded-lg shrink-0"
                        />
                        <div className="truncate">
                          <p className="font-medium text-charcoal truncate">{it.product.name}</p>
                          <p className="text-[10px] text-charcoal-muted">
                            Size: {it.size} • Qty: {it.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-serif font-medium text-charcoal shrink-0">
                        ₹{(it.product.price * it.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-beige-border space-y-1.5 text-charcoal-muted text-[11px]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="text-sage font-medium">
                      {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-serif text-sm font-bold text-charcoal pt-1 border-t border-beige-border">
                    <span>Total Amount</span>
                    <span className="text-burgundy">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* 3. PAYMENT GATEWAY */}
              <div className="bg-white p-5 rounded-2xl border border-beige-border space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-beige-border">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-full bg-burgundy text-white text-xs flex items-center justify-center font-bold">3</span>
                    <h4 className="font-serif text-xl font-medium text-charcoal">Payment Gateway</h4>
                  </div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-sage font-bold flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>256-Bit SSL</span>
                  </span>
                </div>

                {/* Gateway Options Selection */}
                <div className="space-y-2.5">
                  
                  {/* Option 1: Instant UPI */}
                  <div
                    onClick={() => setPaymentGatewayMethod('UPI')}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                      paymentGatewayMethod === 'UPI'
                        ? 'border-burgundy bg-burgundy-light/20 ring-1 ring-burgundy shadow-sm'
                        : 'border-beige-border bg-white hover:bg-beige/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="paymentGateway"
                          value="UPI"
                          checked={paymentGatewayMethod === 'UPI'}
                          onChange={() => setPaymentGatewayMethod('UPI')}
                          className="accent-burgundy"
                        />
                        <div className="flex items-center space-x-2">
                          <Smartphone className="w-4 h-4 text-burgundy" />
                          <span className="font-bold text-charcoal text-xs sm:text-sm">UPI Instant Payment</span>
                        </div>
                      </div>
                      <span className="text-[10px] bg-gold/15 text-gold font-semibold px-2 py-0.5 rounded-md">
                        GPay • PhonePe • QR
                      </span>
                    </div>

                    {paymentGatewayMethod === 'UPI' && (
                      <div className="mt-3.5 pt-3 border-t border-burgundy-border/30 space-y-3 animate-in fade-in duration-200">
                        <div className="flex space-x-2 text-xs">
                          <button
                            type="button"
                            onClick={() => setUpiOption('qr')}
                            className={`flex-1 py-1.5 rounded-xl font-medium transition ${
                              upiOption === 'qr' ? 'bg-burgundy text-white shadow-sm' : 'bg-beige/40 text-charcoal hover:bg-beige'
                            }`}
                          >
                            Scan UPI QR Code
                          </button>
                          <button
                            type="button"
                            onClick={() => setUpiOption('id')}
                            className={`flex-1 py-1.5 rounded-xl font-medium transition ${
                              upiOption === 'id' ? 'bg-burgundy text-white shadow-sm' : 'bg-beige/40 text-charcoal hover:bg-beige'
                            }`}
                          >
                            Enter UPI ID
                          </button>
                        </div>

                        {upiOption === 'qr' ? (
                          <div className="bg-[#FAF7F2] p-3 rounded-xl border border-beige-border text-center space-y-2">
                            <p className="text-[11px] text-charcoal font-medium">Scan to pay exact amount: ₹{totalAmount}</p>
                            <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl border border-gold/30 shadow-sm flex items-center justify-center">
                              <img src={upiQrUrl} alt="UPI QR Code" className="w-full h-full object-contain" />
                            </div>
                            <div className="flex items-center justify-center space-x-2 text-[11px]">
                              <span className="font-mono text-charcoal font-semibold">{CONFIGURED_UPI_ID}</span>
                              <button
                                type="button"
                                onClick={handleCopyUpi}
                                className="text-gold hover:text-charcoal font-bold underline text-[10px]"
                              >
                                {copiedUpi ? 'Copied!' : 'Copy'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <label className="text-[11px] font-semibold text-charcoal block">
                              Your VPA / UPI ID (e.g. mobile@upi, name@okaxis)
                            </label>
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={upiIdInput}
                                onChange={(e) => setUpiIdInput(e.target.value)}
                                placeholder="e.g. 9876543210@paytm"
                                className="flex-1 px-3 py-2 bg-white border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (upiIdInput.includes('@')) setUpiVerified(true);
                                }}
                                className="bg-sage text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-sage-dark transition shrink-0"
                              >
                                {upiVerified ? '✓ Verified' : 'Verify'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Option 2: Credit / Debit Cards */}
                  <div
                    onClick={() => setPaymentGatewayMethod('Card')}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                      paymentGatewayMethod === 'Card'
                        ? 'border-burgundy bg-burgundy-light/20 ring-1 ring-burgundy shadow-sm'
                        : 'border-beige-border bg-white hover:bg-beige/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="paymentGateway"
                          value="Card"
                          checked={paymentGatewayMethod === 'Card'}
                          onChange={() => setPaymentGatewayMethod('Card')}
                          className="accent-burgundy"
                        />
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-4 h-4 text-burgundy" />
                          <span className="font-bold text-charcoal text-xs sm:text-sm">Credit / Debit Card</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-charcoal-muted">Visa • RuPay • MC</span>
                    </div>

                    {paymentGatewayMethod === 'Card' && (
                      <div className="mt-3.5 pt-3 border-t border-burgundy-border/30 space-y-3 animate-in fade-in duration-200 text-xs">
                        <div>
                          <label className="font-semibold text-charcoal block mb-1 text-[11px]">Card Number</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={cardNumber}
                              onChange={handleCardNumberChange}
                              maxLength={19}
                              placeholder="4123 4567 8901 2345"
                              className="w-full pl-3 pr-10 py-2 bg-white border border-beige-border rounded-xl text-xs font-mono text-charcoal focus:outline-none focus:border-burgundy"
                            />
                            <CreditCard className="w-4 h-4 text-charcoal-muted absolute right-3 top-2.5" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="font-semibold text-charcoal block mb-1 text-[11px]">Valid Thru (MM/YY)</label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={handleCardExpiryChange}
                              maxLength={5}
                              placeholder="12/28"
                              className="w-full px-3 py-2 bg-white border border-beige-border rounded-xl text-xs font-mono text-charcoal focus:outline-none focus:border-burgundy"
                            />
                          </div>
                          <div>
                            <label className="font-semibold text-charcoal block mb-1 text-[11px]">CVV / CVC</label>
                            <input
                              type="password"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                              maxLength={4}
                              placeholder="•••"
                              className="w-full px-3 py-2 bg-white border border-beige-border rounded-xl text-xs font-mono text-charcoal focus:outline-none focus:border-burgundy"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="font-semibold text-charcoal block mb-1 text-[11px]">Name on Card</label>
                          <input
                            type="text"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            placeholder="e.g. Ananya Sharma"
                            className="w-full px-3 py-2 bg-white border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Option 3: Net Banking */}
                  <div
                    onClick={() => setPaymentGatewayMethod('NetBanking')}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer ${
                      paymentGatewayMethod === 'NetBanking'
                        ? 'border-burgundy bg-burgundy-light/20 ring-1 ring-burgundy shadow-sm'
                        : 'border-beige-border bg-white hover:bg-beige/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="paymentGateway"
                          value="NetBanking"
                          checked={paymentGatewayMethod === 'NetBanking'}
                          onChange={() => setPaymentGatewayMethod('NetBanking')}
                          className="accent-burgundy"
                        />
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-burgundy" />
                          <span className="font-bold text-charcoal text-xs sm:text-sm">Net Banking</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-charcoal-muted">All Indian Banks</span>
                    </div>

                    {paymentGatewayMethod === 'NetBanking' && (
                      <div className="mt-3.5 pt-3 border-t border-burgundy-border/30 space-y-2 animate-in fade-in duration-200">
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          {['HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak', 'PNB'].map((bank) => (
                            <button
                              key={bank}
                              type="button"
                              onClick={() => setSelectedBank(bank)}
                              className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition ${
                                selectedBank === bank
                                  ? 'border-burgundy bg-burgundy text-white shadow-sm'
                                  : 'border-beige-border bg-white text-charcoal hover:bg-beige/30'
                              }`}
                            >
                              {bank} Bank
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Option 4: LAST OPTION - CASH ON DELIVERY (COD) & ORDER VIA WHATSAPP */}
                  <div
                    onClick={() => setPaymentGatewayMethod('COD')}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer relative overflow-hidden ${
                      paymentGatewayMethod === 'COD'
                        ? 'border-gold bg-gold-light/40 ring-2 ring-gold/40 shadow-md'
                        : 'border-beige-border bg-white hover:border-gold/50'
                    }`}
                  >
                    {/* Featured Ribbon Badge */}
                    <div className="absolute top-0 right-0 bg-gold text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-xl tracking-wider uppercase">
                      Recommended
                    </div>

                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="paymentGateway"
                        value="COD"
                        checked={paymentGatewayMethod === 'COD'}
                        onChange={() => setPaymentGatewayMethod('COD')}
                        className="mt-1 accent-gold w-4 h-4"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <Truck className="w-4 h-4 text-burgundy" />
                          <span className="font-serif font-bold text-charcoal text-sm sm:text-base">
                            Cash on Delivery (COD) — Order via WhatsApp
                          </span>
                        </div>
                        <p className="text-xs text-charcoal leading-relaxed">
                          Pay securely upon delivery at your doorstep with Cash or UPI. All delivery details will be directly sent to our two WhatsApp helplines:
                        </p>

                        {/* Dedicated WhatsApp Numbers Badge */}
                        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="bg-white/80 p-2.5 rounded-xl border border-gold/40 flex items-center space-x-2">
                            <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                            <div>
                              <p className="font-bold text-charcoal text-[11px]">Admin 1 WhatsApp</p>
                              <p className="font-mono text-charcoal-muted text-[11px]">+91 {ADMIN_1_PHONE}</p>
                            </div>
                          </div>

                          <div className="bg-white/80 p-2.5 rounded-xl border border-gold/40 flex items-center space-x-2">
                            <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                            <div>
                              <p className="font-bold text-charcoal text-[11px]">Admin 2 WhatsApp</p>
                              <p className="font-mono text-charcoal-muted text-[11px]">+91 {ADMIN_2_PHONE}</p>
                            </div>
                          </div>
                        </div>

                        {paymentGatewayMethod === 'COD' && (
                          <div className="pt-2 text-[11px] text-burgundy font-medium flex items-center space-x-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Your full address, items, and total amount will be shared with both numbers for instant confirmation!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Final Submit Button */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 px-6 rounded-full font-serif font-semibold text-sm sm:text-base transition shadow-elevated-luxe flex items-center justify-center space-x-2 ${
                      paymentGatewayMethod === 'COD'
                        ? 'bg-[#25D366] hover:bg-[#20ba5a] text-white'
                        : 'bg-burgundy hover:bg-burgundy-hover text-white border border-gold/30'
                    }`}
                  >
                    {loading ? (
                      <span>Processing Order...</span>
                    ) : paymentGatewayMethod === 'COD' ? (
                      <>
                        <MessageCircle className="w-5 h-5 fill-current" />
                        <span>Place COD Order & Share on WhatsApp (₹{totalAmount.toLocaleString('en-IN')})</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Pay Securely ₹{totalAmount.toLocaleString('en-IN')} via {paymentGatewayMethod}</span>
                      </>
                    )}
                  </button>

                  <p className="text-center text-[10px] text-charcoal-muted mt-2">
                    {paymentGatewayMethod === 'COD'
                      ? 'No upfront payment needed. Pay upon delivery.'
                      : 'Guaranteed 100% safe & encrypted payment gateway.'}
                  </p>
                </div>

              </div>

            </div>

          </form>
        </div>

      </div>

      {/* 3D-Secure Bank OTP Modal Simulation for Cards */}
      {showOtpModal && (
        <div className="fixed inset-0 z-[60] bg-charcoal/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-beige-border space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-burgundy-light text-burgundy flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="font-serif text-xl font-bold text-charcoal">Bank 3D-Secure Verification</h4>
              <p className="text-xs text-charcoal-muted">
                One-Time Password (OTP) sent to registered mobile for card ending in {cardNumber.slice(-4) || '••••'}
              </p>
            </div>

            <div className="bg-beige/30 p-3 rounded-2xl border border-beige-border space-y-2">
              <span className="text-[10px] uppercase font-bold text-gold">Merchant: TARVEQ ATELIER</span>
              <p className="font-serif text-2xl font-bold text-burgundy">₹{totalAmount.toLocaleString('en-IN')}</p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit OTP"
                className="w-full text-center tracking-[0.4em] font-mono text-lg py-2.5 border border-beige-border rounded-xl focus:outline-none focus:border-burgundy"
              />

              <button
                type="button"
                onClick={() => setOtpInput('482910')}
                className="text-[11px] text-gold underline hover:text-charcoal block mx-auto"
              >
                Auto-fill Demo OTP (482910)
              </button>

              <button
                type="button"
                disabled={otpProcessing || otpInput.length < 4}
                onClick={handleSimulatedOtpSuccess}
                className="w-full bg-burgundy hover:bg-burgundy-hover text-white py-3 rounded-full text-xs font-semibold transition shadow-md"
              >
                {otpProcessing ? 'Verifying with Bank...' : 'Confirm & Authorize Payment'}
              </button>

              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="text-xs text-charcoal-muted hover:underline"
              >
                Cancel Transaction
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
