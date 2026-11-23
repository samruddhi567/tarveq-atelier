import React, { useState } from 'react';
import { CheckCircle2, MessageCircle, ArrowRight, ShieldCheck, Copy, Check, ExternalLink, Package, Star } from 'lucide-react';

interface WhatsAppOrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  whatsAppUrls: {
    admin1Phone: string;
    admin2Phone: string;
    admin1Url: string;
    admin2Url: string;
    rawMessage: string;
  } | null;
  onTrackOrders: () => void;
}

export const WhatsAppOrderConfirmationModal: React.FC<WhatsAppOrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  order,
  whatsAppUrls,
  onTrackOrders,
}) => {
  const [admin1Sent, setAdmin1Sent] = useState(false);
  const [admin2Sent, setAdmin2Sent] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  if (!isOpen || !order || !whatsAppUrls) return null;

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(whatsAppUrls.rawMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#F8F4EC] w-full max-w-2xl rounded-3xl shadow-modal-luxe border border-gold/40 overflow-hidden flex flex-col max-h-[92vh] font-sans">
        
        {/* Modal Top Header */}
        <div className="p-6 bg-gradient-to-r from-burgundy to-burgundy-dark text-white text-center space-y-2 relative">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <img src="/images/tarveq-crest.png" alt="TARVEQ" className="h-7 w-auto object-contain brightness-125" />
            <span className="font-serif text-xl font-bold tracking-[0.2em] text-white uppercase">TARVEQ</span>
          </div>

          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-gold flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl font-medium tracking-wide">
            Your Order Request Has Been Created!
          </h3>

          <div className="inline-block bg-white/10 px-3.5 py-1 rounded-full border border-gold/40 text-xs font-mono font-bold tracking-wider text-gold">
            Order ID: {order.id}
          </div>

          <p className="text-xs text-white/80 max-w-md mx-auto pt-1 font-light">
            Thank you for choosing TARVEQ ATELIER. Your order details are securely recorded in our database.
          </p>
        </div>

        {/* Action Guide & Two WhatsApp Buttons */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Important Instruction Notice */}
          <div className="bg-gold-light border-2 border-gold/50 rounded-2xl p-4 space-y-2">
            <div className="flex items-center space-x-2 text-charcoal font-semibold text-xs sm:text-sm">
              <span className="text-gold text-lg">⚠️</span>
              <span>Final Step to Confirm Your Order:</span>
            </div>
            <p className="text-xs text-charcoal leading-relaxed font-sans">
              To complete your order request, please send the prepared order message to <strong>both TARVEQ WhatsApp contacts</strong> below. Clicking each button opens WhatsApp with your prefilled order summary—simply press <strong>Send</strong>!
            </p>
          </div>

          {/* TWO DEDICATED WHATSAPP BUTTONS */}
          <div className="space-y-3.5">
            
            {/* Button 1: Admin 1 */}
            <div className="bg-white p-4 rounded-2xl border border-beige-border space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-charcoal">TARVEQ Business Contact – Admin 1</span>
                <span className="text-charcoal-muted font-mono">+91 93078 59693</span>
              </div>

              <a
                href={whatsAppUrls.admin1Url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setAdmin1Sent(true)}
                className={`w-full py-3 px-5 rounded-full text-xs sm:text-sm font-semibold transition flex items-center justify-center space-x-2 shadow-md ${
                  admin1Sent
                    ? 'bg-sage hover:bg-sage-dark text-white'
                    : 'bg-[#25D366] hover:bg-[#20ba5a] text-white'
                }`}
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>
                  {admin1Sent ? '✓ Sent to Admin 1 (+91 9307859693)' : '1. Send Order to TARVEQ – Admin 1'}
                </span>
                <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-80" />
              </a>
            </div>

            {/* Button 2: Admin 2 */}
            <div className="bg-white p-4 rounded-2xl border border-beige-border space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-charcoal">TARVEQ Business Contact – Admin 2</span>
                <span className="text-charcoal-muted font-mono">+91 88092 71583</span>
              </div>

              <a
                href={whatsAppUrls.admin2Url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setAdmin2Sent(true)}
                className={`w-full py-3 px-5 rounded-full text-xs sm:text-sm font-semibold transition flex items-center justify-center space-x-2 shadow-md ${
                  admin2Sent
                    ? 'bg-sage hover:bg-sage-dark text-white'
                    : 'bg-[#25D366] hover:bg-[#20ba5a] text-white'
                }`}
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>
                  {admin2Sent ? '✓ Sent to Admin 2 (+91 8809271583)' : '2. Send Order to TARVEQ – Admin 2'}
                </span>
                <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-80" />
              </a>
            </div>

          </div>

          {/* Copy Plaintext Order Message (Backup) */}
          <div className="flex items-center justify-between pt-1 text-xs text-charcoal-muted">
            <span>Having trouble with WhatsApp links?</span>
            <button
              onClick={handleCopyMessage}
              className="text-burgundy hover:underline font-semibold flex items-center space-x-1"
            >
              {copiedMessage ? <Check className="w-3.5 h-3.5 text-sage" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMessage ? 'Copied Message!' : 'Copy Order Text'}</span>
            </button>
          </div>

          {/* Order Details Summary Card */}
          <div className="bg-white p-4 rounded-2xl border border-beige-border space-y-3 text-xs shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-beige-border font-semibold text-charcoal">
              <span>Order Summary ({order.items?.length} items)</span>
              <span>Total: ₹{order.total_amount?.toLocaleString('en-IN')}</span>
            </div>

            <div className="space-y-1.5 text-charcoal-muted">
              <p>
                <strong className="text-charcoal">Customer:</strong> {order.customer_name} ({order.customer_phone})
              </p>
              <p>
                <strong className="text-charcoal">Delivery to:</strong> {order.shipping_address?.street}, {order.shipping_address?.city} ({order.shipping_address?.pincode})
              </p>
              <p>
                <strong className="text-charcoal">Payment Method:</strong> {order.payment_method} • <span className="text-gold font-medium">Status: {order.payment_status}</span>
              </p>
              <p>
                <strong className="text-charcoal">Order Status:</strong> {order.fulfillment_status}
              </p>
            </div>
          </div>

          {/* MVP Customer Feedback Collection */}
          <div className="bg-white p-4 rounded-2xl border border-beige-border space-y-3 text-xs shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-beige-border">
              <span className="font-semibold text-charcoal">How was your ordering experience?</span>
              <span className="text-[10px] text-charcoal-muted">Early Customer Feedback</span>
            </div>
            {feedbackSubmitted ? (
              <div className="p-3 bg-[#E8EFE9] text-[#2D5A27] rounded-xl flex items-center space-x-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-[#2D5A27]" />
                <span>Thank you! Your feedback helps us shape TARVEQ ATELIER.</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center space-x-2">
                  <span className="text-charcoal-muted">Rate:</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            star <= rating ? 'fill-gold text-gold' : 'text-charcoal/20'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={feedbackNote}
                    onChange={(e) => setFeedbackNote(e.target.value)}
                    placeholder="Any suggestions or questions for the founders?"
                    className="flex-1 px-3 py-1.5 bg-[#FAF7F2] border border-beige-border rounded-xl text-xs focus:outline-none focus:border-gold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (rating > 0 || feedbackNote.trim()) {
                        setFeedbackSubmitted(true);
                      }
                    }}
                    className="px-3 py-1.5 bg-charcoal text-white rounded-xl hover:bg-black transition text-xs font-medium"
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 bg-beige/40 border-t border-beige-border flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onTrackOrders();
            }}
            className="text-xs font-semibold text-charcoal hover:text-burgundy px-4 py-2 flex items-center space-x-1.5"
          >
            <Package className="w-4 h-4 text-gold" />
            <span>View in My Orders</span>
          </button>

          <button
            onClick={onClose}
            className="bg-burgundy hover:bg-burgundy-hover text-white text-xs sm:text-sm font-medium py-2.5 px-6 rounded-full transition shadow-sm"
          >
            Return to Shopping
          </button>
        </div>

      </div>
    </div>
  );
};
