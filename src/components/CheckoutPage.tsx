import React, { useState } from 'react';
import { X, ArrowRight, ShieldCheck, Truck, MessageCircle, Copy, Check, Upload, AlertCircle, ShoppingBag } from 'lucide-react';
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
  // Customer Details
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');

  // Delivery Address
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState(user?.shipping_address?.street || '');
  const [city, setCity] = useState(user?.shipping_address?.city || '');
  const [state, setState] = useState(user?.shipping_address?.state || '');
  const [pincode, setPincode] = useState(user?.shipping_address?.pincode || '');
  const [landmark, setLandmark] = useState('');

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Manual UPI' | 'Pay Later'>('COD');
  const [upiReference, setUpiReference] = useState('');
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Customer Notes
  const [customerNotes, setCustomerNotes] = useState('');

  // UI & Validation States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const CONFIGURED_UPI_ID = '9307859693@upi'; // TARVEQ Atelier Primary Business UPI ID

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryCharge = subtotal >= 999 ? 0 : 99;
  const totalAmount = subtotal + deliveryCharge;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(CONFIGURED_UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 3000);
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('proof', file);

    setUploadingProof(true);
    try {
      const res = await fetch('/api/orders/upload-proof', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload screenshot');
      setPaymentScreenshotUrl(data.fileUrl);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadingProof(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validations
    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number for order delivery.');
      return;
    }
    if (!street.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      setErrorMessage('Please fill in complete delivery address details.');
      return;
    }
    if (pincode.replace(/\D/g, '').length !== 6) {
      setErrorMessage('Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    setLoading(true);
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
        paymentMethod,
        upiReference: upiReference.trim(),
        paymentScreenshot: paymentScreenshotUrl,
        customerNotes: customerNotes.trim(),
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

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/70 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#F8F4EC] w-full max-w-4xl rounded-t-3xl sm:rounded-3xl shadow-modal-luxe max-h-[94vh] flex flex-col overflow-hidden border border-beige-border font-sans">
        
        {/* Header */}
        <div className="p-5 bg-beige/40 border-b border-beige-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/images/tarveq-crest.png" alt="TARVEQ Crest" className="h-7 w-auto object-contain" />
            <span className="font-serif text-2xl font-bold text-burgundy tracking-[0.16em] uppercase">TARVEQ</span>
            <span className="text-xs bg-gold text-white font-medium px-2.5 py-0.5 rounded-full">
              WhatsApp Checkout
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="text-xs font-medium text-burgundy hover:underline flex items-center space-x-1 px-2 py-1 rounded-full hover:bg-beige transition"
              aria-label="Back to cart"
            >
              <span>← Back to Cart</span>
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

        {/* Checkout Form Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {errorMessage && (
            <div className="bg-burgundy-light border border-burgundy-border text-burgundy p-3.5 rounded-2xl flex items-center space-x-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form id="checkout-form" onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Customer & Delivery Details */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* 1. Customer Details */}
              <div className="bg-white p-5 rounded-2xl border border-beige-border space-y-4 shadow-sm">
                <h4 className="font-serif text-xl font-medium text-charcoal flex items-center space-x-2">
                  <span>1. Customer Details</span>
                </h4>

                <div className="space-y-3 text-sm">
                  <div>
                    <label className="font-semibold text-charcoal block mb-1">
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
                      <label className="font-semibold text-charcoal block mb-1">
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
                      <label className="font-semibold text-charcoal block mb-1">
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
                <h4 className="font-serif text-xl font-medium text-charcoal">
                  2. Delivery Destination
                </h4>

                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="font-semibold text-charcoal block mb-1">Flat / House No.</label>
                      <input
                        type="text"
                        value={houseNo}
                        onChange={(e) => setHouseNo(e.target.value)}
                        placeholder="e.g. Flat 402"
                        className="w-full px-3.5 py-2.5 bg-[#F8F4EC]/40 border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-semibold text-charcoal block mb-1">
                        Street, Building, Colony <span className="text-burgundy">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="e.g. Rajpur Road, Clock Tower"
                        className="w-full px-3.5 py-2.5 bg-[#F8F4EC]/40 border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-charcoal block mb-1">
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
                      <label className="font-semibold text-charcoal block mb-1">
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
                      <label className="font-semibold text-charcoal block mb-1">
                        PIN Code <span className="text-burgundy">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="560038"
                        className="w-full px-3.5 py-2.5 bg-[#F8F4EC]/40 border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-charcoal block mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="e.g. Near Metro Station / Behind Axis Bank"
                      className="w-full px-3.5 py-2.5 bg-[#F8F4EC]/40 border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Payment Method Selection */}
              <div className="bg-white p-5 rounded-2xl border border-beige-border space-y-4 shadow-sm">
                <div>
                  <h4 className="font-serif text-xl font-medium text-charcoal">
                    3. Payment Preference
                  </h4>
                  <p className="text-xs text-charcoal-muted mt-0.5">
                    No online payment gateway required. Choose your convenient payment method:
                  </p>
                </div>

                <div className="space-y-3 text-sm">
                  
                  {/* COD */}
                  <label
                    className={`block p-3.5 rounded-2xl border transition cursor-pointer ${
                      paymentMethod === 'COD'
                        ? 'border-burgundy bg-burgundy-light/30 ring-1 ring-burgundy'
                        : 'border-beige-border bg-white hover:bg-beige/20'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={paymentMethod === 'COD'}
                        onChange={() => setPaymentMethod('COD')}
                        className="mt-1 accent-burgundy"
                      />
                      <div>
                        <span className="font-bold text-charcoal text-sm">Cash on Delivery (COD)</span>
                        <p className="text-charcoal-muted mt-0.5">
                          Pay by cash or UPI directly to the delivery partner upon arrival at your doorstep.
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Manual UPI */}
                  <label
                    className={`block p-3.5 rounded-2xl border transition cursor-pointer ${
                      paymentMethod === 'Manual UPI'
                        ? 'border-burgundy bg-burgundy-light/30 ring-1 ring-burgundy'
                        : 'border-beige-border bg-white hover:bg-beige/20'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Manual UPI"
                        checked={paymentMethod === 'Manual UPI'}
                        onChange={() => setPaymentMethod('Manual UPI')}
                        className="mt-1 accent-burgundy"
                      />
                      <div className="flex-1">
                        <span className="font-bold text-charcoal text-sm">Direct UPI Transfer (GPay / PhonePe / Paytm)</span>
                        <p className="text-charcoal-muted mt-0.5">
                          Pay directly to our designated studio UPI ID and enter your transaction reference.
                        </p>

                        {/* UPI Details Box if selected */}
                        {paymentMethod === 'Manual UPI' && (
                          <div className="mt-3 p-3 bg-white rounded-xl border border-gold/40 space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between bg-gold-light p-2.5 rounded-lg border border-gold/30">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-gold">Official Atelier UPI ID:</span>
                                <p className="font-mono font-bold text-charcoal text-sm">{CONFIGURED_UPI_ID}</p>
                              </div>
                              <button
                                type="button"
                                onClick={handleCopyUpi}
                                className="bg-white px-3 py-1 rounded-md text-[11px] font-semibold text-charcoal border border-beige-border hover:bg-beige flex items-center space-x-1"
                              >
                                {copiedUpi ? <Check className="w-3.5 h-3.5 text-sage" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedUpi ? 'Copied!' : 'Copy ID'}</span>
                              </button>
                            </div>

                            <div className="space-y-2">
                              <div>
                                <label className="font-semibold text-charcoal block mb-1">
                                  UPI Reference / UTR Number (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={upiReference}
                                  onChange={(e) => setUpiReference(e.target.value)}
                                  placeholder="e.g. 423984028492"
                                  className="w-full px-3 py-2 bg-[#F8F4EC]/60 border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                                />
                              </div>

                              <div>
                                <label className="font-semibold text-charcoal block mb-1">
                                  Payment Screenshot (Optional)
                                </label>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleScreenshotUpload}
                                  className="text-xs text-charcoal file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-burgundy file:text-white cursor-pointer"
                                />
                                {uploadingProof && <span className="text-[11px] text-gold">Uploading screenshot...</span>}
                                {paymentScreenshotUrl && <span className="text-[11px] text-sage font-medium">✓ Screenshot attached</span>}
                              </div>

                              <p className="text-[10px] text-charcoal-muted italic">
                                Note: Payment status remains "Pending Verification" until manually matched with studio bank records.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </label>

                  {/* Pay Later */}
                  <label
                    className={`block p-3.5 rounded-2xl border transition cursor-pointer ${
                      paymentMethod === 'Pay Later'
                        ? 'border-burgundy bg-burgundy-light/30 ring-1 ring-burgundy'
                        : 'border-beige-border bg-white hover:bg-beige/20'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="Pay Later"
                        checked={paymentMethod === 'Pay Later'}
                        onChange={() => setPaymentMethod('Pay Later')}
                        className="mt-1 accent-burgundy"
                      />
                      <div>
                        <span className="font-bold text-charcoal text-sm">Confirm Payment with TARVEQ on WhatsApp</span>
                        <p className="text-charcoal-muted mt-0.5">
                          Submit your order details now. Our team will verify fabric customization on WhatsApp and send a payment QR code.
                        </p>
                      </div>
                    </div>
                  </label>

                </div>
              </div>

              {/* 4. Customer Instructions */}
              <div className="bg-white p-5 rounded-2xl border border-beige-border space-y-2 shadow-sm text-xs">
                <label className="font-semibold text-charcoal block">
                  Special Delivery Instructions or Requests (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="e.g. Please ring doorbell twice, deliver after 4 PM, or custom sleeve length notes."
                  className="w-full px-3.5 py-2.5 bg-[#F8F4EC]/40 border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy font-sans"
                />
              </div>

            </div>

            {/* Right Column: Order Summary & Review */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-beige-border space-y-4 shadow-sm sticky top-4">
                <h4 className="font-serif text-xl font-medium text-charcoal flex items-center justify-between pb-3 border-b border-beige-border">
                  <span>Order Summary</span>
                  <span className="text-xs font-sans text-charcoal-muted">
                    {items.length} {items.length === 1 ? 'piece' : 'pieces'}
                  </span>
                </h4>

                {/* Items List */}
                <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-beige-border pr-1">
                  {items.map((it, idx) => (
                    <div key={idx} className="pt-2.5 first:pt-0 flex space-x-3">
                      <img
                        src={it.product.image_url}
                        alt={it.product.name}
                        className="w-14 h-16 object-cover rounded-xl bg-beige shrink-0"
                      />
                      <div className="flex-1 text-xs">
                        <h5 className="font-serif font-medium text-charcoal line-clamp-1">{it.product.name}</h5>
                        <p className="text-[11px] text-charcoal-muted">
                          Size: <span className="font-semibold">{it.size}</span> • Inseam: <span className="font-semibold">{it.length}</span>
                        </p>
                        <div className="flex justify-between items-center pt-1 font-sans">
                          <span className="text-charcoal-muted">Qty: {it.quantity}</span>
                          <span className="font-serif font-medium text-charcoal">
                            ₹{(it.product.price * it.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="pt-3 border-t border-beige-border space-y-2 text-xs font-sans">
                  <div className="flex justify-between text-charcoal-muted">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-sage font-medium">
                    <span>Delivery Across India</span>
                    <span>{deliveryCharge === 0 ? 'FREE' : '₹99'}</span>
                  </div>

                  <div className="pt-2 border-t border-beige-border flex justify-between items-baseline">
                    <span className="font-semibold text-charcoal text-sm">Total Payable</span>
                    <span className="font-serif text-2xl font-medium text-burgundy">
                      ₹{totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Place Order CTA */}
                <div className="pt-3 space-y-2">
                  <button
                    type="submit"
                    form="checkout-form"
                    disabled={loading}
                    className="w-full bg-burgundy hover:bg-burgundy-hover text-white font-sans text-sm font-medium py-3 px-6 rounded-full transition shadow-md flex items-center justify-center space-x-2 border border-gold/30 disabled:opacity-50"
                  >
                    <MessageCircle className="w-4 h-4 text-gold" />
                    <span>{loading ? 'Creating Order Request...' : 'Place Order via WhatsApp'}</span>
                  </button>

                  <p className="text-[10px] text-charcoal-muted text-center leading-relaxed">
                    Upon placing the order, you will receive two prefilled WhatsApp buttons to message TARVEQ Atelier administrators directly.
                  </p>
                </div>

              </div>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
};
