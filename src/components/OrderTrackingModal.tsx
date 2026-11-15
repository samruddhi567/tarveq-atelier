import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Clock, Truck, ShieldCheck, Printer, ArrowRight, Package } from 'lucide-react';
import { Order } from '../types';

interface OrderTrackingModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ order, onClose }) => {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showInvoice, setShowInvoice] = useState<boolean>(false);

  useEffect(() => {
    if (!order) return;
    setLoading(true);
    fetch(`/api/orders/${order.id}/tracking`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setTimeline(data.timeline || []);
        }
      })
      .catch((err) => console.error('Error fetching tracking:', err))
      .finally(() => setLoading(false));
  }, [order]);

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 bg-espresso/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-ivory w-full max-w-lg rounded-3xl shadow-modal-luxe overflow-hidden border border-sand-border animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-sand p-4 border-b border-sand-border flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-espresso">{order.id}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                order.fulfillment_status.includes('Shipped')
                  ? 'bg-olive text-white'
                  : 'bg-sand-border text-espresso'
              }`}>
                {order.fulfillment_status}
              </span>
            </div>
            <p className="text-[11px] text-espresso-soft mt-0.5">
              AWB: <strong className="text-espresso font-mono">{order.awb_tracking_code || 'Pending Dispatch Assignment'}</strong>
            </p>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setShowInvoice(!showInvoice)}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-sand-border bg-white hover:bg-sand transition flex items-center space-x-1 text-espresso"
            >
              <Printer className="w-3 h-3 text-terracotta" />
              <span>{showInvoice ? 'Tracking' : 'Tax Invoice'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-espresso-soft hover:text-espresso hover:bg-sand-border transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {showInvoice ? (
            /* Printable Tax Invoice & GST View */
            <div className="bg-white p-5 rounded-2xl border border-sand-border space-y-4 text-xs font-mono">
              <div className="border-b border-sand-border pb-3 flex justify-between items-start">
                <div>
                  <h3 className="font-serif text-base font-bold text-espresso">AURA ATELIER D2C PVT LTD</h3>
                  <p className="text-[10px] text-espresso-soft">GSTIN: 29AABCA1234F1Z5 | HSN: 6204</p>
                  <p className="text-[10px] text-espresso-soft">Indiranagar 100ft Road, Bengaluru, Karnataka 560038</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-espresso">ORIGINAL TAX INVOICE</p>
                  <p className="text-[10px] text-espresso-soft">Date: {new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-sand-border text-[11px]">
                <div>
                  <p className="font-bold text-espresso">BILLED & SHIPPED TO:</p>
                  <p className="text-espresso">{order.customer_name}</p>
                  <p className="text-espresso-soft">{order.shipping_address?.street}</p>
                  <p className="text-espresso-soft">{order.shipping_address?.city}, {order.shipping_address?.pincode}</p>
                  <p className="text-espresso-soft">Phone: {order.customer_phone}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-espresso">SHIPPING DETAILS:</p>
                  <p className="text-espresso">Courier: {order.courier_partner || 'Delhivery Express'}</p>
                  <p className="text-espresso font-mono">AWB: {order.awb_tracking_code || 'Pending'}</p>
                  <p className="text-olive font-bold">Zero-Return Guaranteed</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <div className="flex justify-between font-bold border-b border-sand-border pb-1">
                  <span>Item Description</span>
                  <span>Amount (INR)</span>
                </div>
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-espresso">
                    <div>
                      <p>{it.name}</p>
                      <p className="text-[10px] text-espresso-soft">Size: {it.size || 'M'} • Length: {it.length || 'Regular'}</p>
                    </div>
                    <span>₹{it.price?.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-sand-border pt-3 space-y-1 text-right">
                <div className="flex justify-between text-espresso-soft">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal?.toLocaleString('en-IN')}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-terracotta">
                    <span>Capsule Bundle Discount (-15%)</span>
                    <span>-₹{order.discount?.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-espresso pt-1 border-t border-sand-border">
                  <span>Total Paid (Razorpay Verified)</span>
                  <span>₹{order.total_amount?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="p-2.5 bg-sand-light rounded-xl text-center text-[10px] text-espresso-soft">
                Computer Generated Invoice • Authorized Digital Signature
              </div>
            </div>
          ) : (
            /* Live 5-Step Timeline */
            <div className="space-y-4">
              <div className="bg-sand p-4 rounded-2xl border border-sand-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-espresso-soft">Courier Partner</span>
                  <p className="text-sm font-bold text-espresso font-serif">{order.courier_partner || 'Delhivery Express Modest'}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-espresso-soft">Est. Delivery</span>
                  <p className="text-xs font-bold text-olive">3 Business Days</p>
                </div>
              </div>

              <div className="space-y-4 pl-2">
                <h4 className="font-serif text-sm font-bold text-espresso">Fulfillment & Transit Milestones</h4>
                <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-sand-border">
                  {timeline.map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        step.completed
                          ? 'bg-olive border-olive text-white'
                          : 'bg-white border-sand-border text-transparent'
                      }`}>
                        {step.completed && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-bold ${step.completed ? 'text-espresso' : 'text-espresso-soft'}`}>
                            {step.stage}
                          </p>
                          <span className="text-[10px] text-espresso-soft">{step.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-espresso-soft mt-0.5 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
