import React, { useState, useEffect } from 'react';
import {
  Package, DollarSign, TrendingUp, Users, Plus, Upload, Save, Truck,
  Download, ArrowLeft, RefreshCw, CheckCircle2, AlertCircle, FileText, Printer, Check
} from 'lucide-react';
import { Order, Product, InventoryMatrix } from '../types';

interface AdminDashboardProps {
  onBackToStore: () => void;
  token: string | null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToStore, token }) => {
  const [activeTab, setActiveTab] = useState<'ledger' | 'add-product' | 'inventory' | 'dispatch'>('ledger');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [ledgerStats, setLedgerStats] = useState<any>({
    totalGrossRevenue: 0,
    paidOrdersCount: 0,
    netProfitEstimate: 0,
    averageOrderValue: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Add Product Form State
  const [newTitle, setNewTitle] = useState('');
  const [newTagline, setNewTagline] = useState('');
  const [newCategory, setNewCategory] = useState('Co-ord Set');
  const [newPrice, setNewPrice] = useState('1499');
  const [newOriginalPrice, setNewOriginalPrice] = useState('2499');
  const [newFabricSpec, setNewFabricSpec] = useState('240 GSM Pure Cambric Cotton');
  const [newFabricOpacity, setNewFabricOpacity] = useState('100% Zero-Sheer Lab Tested');
  const [newModestyRating, setNewModestyRating] = useState('9.8');
  const [newUndertone, setNewUndertone] = useState('Warm / Olive');
  const [newDescription, setNewDescription] = useState('Bespoke modest cut tailored to prevent bust gaping and shoulder pull.');
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stock Matrix State for selected product in Inventory tab
  const [selectedProdForStock, setSelectedProdForStock] = useState<Product | null>(null);
  const [stockMatrix, setStockMatrix] = useState<InventoryMatrix>({});

  // WhatsApp-First Order Dashboard State
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Update Order Status Handler
  const handleUpdateOrderStatus = async (orderId: string, newFulfillmentStatus?: string, newPaymentStatus?: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fulfillment_status: newFulfillmentStatus,
          payment_status: newPaymentStatus,
          admin_notes: adminNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order status');

      showNotification(`Order ${orderId} updated successfully.`);
      fetchLedger();
      if (selectedOrderDetails?.id === orderId) {
        setSelectedOrderDetails(data.order);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Fetch admin orders & ledger
  const fetchLedger = async () => {
    try {
      setLoading(true);
      const [ordersRes, prodsRes] = await Promise.all([
        fetch('/api/admin/orders', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
        fetch('/api/products').then((r) => r.json()),
      ]);

      if (ordersRes.success) {
        setOrders(ordersRes.orders || []);
        setLedgerStats(ordersRes.ledger || {});
      }
      if (prodsRes.success) {
        setProducts(prodsRes.products || []);
        if (prodsRes.products.length > 0 && !selectedProdForStock) {
          setSelectedProdForStock(prodsRes.products[0]);
          setStockMatrix(prodsRes.products[0].stock_inventory || {});
        }
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [token]);

  // Handle Photo File selection for preview
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setSelectedPhotos(files);

    const previews = files.map((file) => URL.createObjectURL(file));
    setPhotoPreviews(previews);
  };

  // Add Product Submit (with Multer)
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', newTitle.trim());
      formData.append('tagline', newTagline.trim() || 'Modest Atelier Collection');
      formData.append('category', newCategory);
      formData.append('price', newPrice);
      formData.append('original_price', newOriginalPrice);
      formData.append('fabric_spec', newFabricSpec);
      formData.append('fabric_opacity', newFabricOpacity);
      formData.append('modesty_rating', newModestyRating);
      formData.append('undertone_suitability', newUndertone);
      formData.append('undertone_tags', JSON.stringify([newUndertone.split('/')[0].trim()]));
      formData.append('description', newDescription);

      selectedPhotos.forEach((file) => {
        formData.append('photos', file);
      });

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload product');

      showNotification('Apparel uploaded with photos and live in catalog!');
      setNewTitle('');
      setSelectedPhotos([]);
      setPhotoPreviews([]);
      fetchLedger();
      setActiveTab('inventory');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save Inventory Matrix
  const handleSaveStockMatrix = async () => {
    if (!selectedProdForStock) return;
    try {
      const res = await fetch(`/api/admin/products/${selectedProdForStock.id}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ stock_inventory: stockMatrix }),
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Stock inventory saved for ${selectedProdForStock.name}!`);
        fetchLedger();
      }
    } catch (err) {
      console.error('Error saving inventory:', err);
    }
  };

  // Generate Shiprocket Shipment & AWB
  const handleGenerateShipment = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/generate-awb`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showNotification(`Shipment created via ${data.shipment.courier_partner}! AWB: ${data.shipment.awb_tracking_code}`);
        fetchLedger();
      }
    } catch (err) {
      console.error('Error generating shipment:', err);
    }
  };

  // 1-Click CSV Export
  const handleDownloadCsv = () => {
    window.open('/api/admin/orders/export-csv', '_blank');
  };

  return (
    <div className="min-h-screen bg-ivory text-espresso font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-espresso text-ivory text-xs px-4 py-2.5 rounded-full shadow-2xl border border-sand-border flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-olive" />
          <span>{notification}</span>
        </div>
      )}

      {/* Admin Top Navigation */}
      <header className="bg-espresso text-ivory border-b border-espresso-border sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackToStore}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sand-light transition flex items-center space-x-1 text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Storefront</span>
            </button>
            <div className="h-4 w-px bg-sand-light/30"></div>
            <div>
              <div className="flex items-center space-x-2.5">
                <img src="/images/tarveq-crest.png" alt="TARVEQ" className="h-6 w-auto object-contain brightness-125" />
                <span className="font-serif text-lg font-bold text-white tracking-wide">TARVEQ Operations OS</span>
                <span className="bg-burgundy text-white text-[9px] uppercase font-bold px-1.5 py-0.5 rounded">
                  Founder Admin
                </span>
              </div>
              <p className="text-[10px] text-sand-light/70">Stock, Multi-Photo Upload, Orders & Shiprocket Fulfillment</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchLedger}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-sand-light transition text-xs flex items-center space-x-1"
              title="Refresh Ledger"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleDownloadCsv}
              className="bg-olive hover:bg-olive-dark text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center space-x-1 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-6xl mx-auto px-4 flex border-t border-white/10 text-xs font-medium">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`py-2.5 px-4 border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'ledger'
                ? 'border-terracotta text-terracotta font-bold bg-white/5'
                : 'border-transparent text-sand-light/70 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4 text-terracotta" />
            <span>Orders & Revenue Ledger</span>
          </button>

          <button
            onClick={() => setActiveTab('add-product')}
            className={`py-2.5 px-4 border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'add-product'
                ? 'border-terracotta text-terracotta font-bold bg-white/5'
                : 'border-transparent text-sand-light/70 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4 text-gold-light" />
            <span>Add Apparel (Photo Upload)</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-2.5 px-4 border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'inventory'
                ? 'border-terracotta text-terracotta font-bold bg-white/5'
                : 'border-transparent text-sand-light/70 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4 text-olive" />
            <span>Size-Wise Stock Manager</span>
          </button>

          <button
            onClick={() => setActiveTab('dispatch')}
            className={`py-2.5 px-4 border-b-2 transition flex items-center space-x-1.5 ${
              activeTab === 'dispatch'
                ? 'border-terracotta text-terracotta font-bold bg-white/5'
                : 'border-transparent text-sand-light/70 hover:text-white'
            }`}
          >
            <Truck className="w-4 h-4 text-sky-400" />
            <span>Shiprocket Dispatch & AWB</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {/* =========================================================
            TAB 1: ORDERS & REVENUE LEDGER (WHATSAPP-FIRST DASHBOARD)
            ========================================================= */}
        {activeTab === 'ledger' && (
          <div className="space-y-6">
            
            {/* 8 Granular Order KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 text-xs">
              <div className="bg-sand p-3 rounded-2xl border border-sand-border shadow-sm text-center">
                <span className="text-[10px] text-espresso-soft font-bold uppercase">Total Orders</span>
                <p className="font-serif text-xl font-bold text-espresso mt-0.5">{orders.length}</p>
              </div>

              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 shadow-sm text-center">
                <span className="text-[10px] text-amber-800 font-bold uppercase">Pending Conf.</span>
                <p className="font-serif text-xl font-bold text-amber-900 mt-0.5">
                  {orders.filter((o) => o.fulfillment_status === 'Pending Confirmation' || o.fulfillment_status === 'New Order').length}
                </p>
              </div>

              <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200 shadow-sm text-center">
                <span className="text-[10px] text-blue-800 font-bold uppercase">Confirmed</span>
                <p className="font-serif text-xl font-bold text-blue-900 mt-0.5">
                  {orders.filter((o) => o.fulfillment_status === 'Confirmed').length}
                </p>
              </div>

              <div className="bg-purple-50 p-3 rounded-2xl border border-purple-200 shadow-sm text-center">
                <span className="text-[10px] text-purple-800 font-bold uppercase">Processing</span>
                <p className="font-serif text-xl font-bold text-purple-900 mt-0.5">
                  {orders.filter((o) => o.fulfillment_status === 'Processing').length}
                </p>
              </div>

              <div className="bg-sky-50 p-3 rounded-2xl border border-sky-200 shadow-sm text-center">
                <span className="text-[10px] text-sky-800 font-bold uppercase">Shipped</span>
                <p className="font-serif text-xl font-bold text-sky-900 mt-0.5">
                  {orders.filter((o) => o.fulfillment_status?.includes('Shipped')).length}
                </p>
              </div>

              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 shadow-sm text-center">
                <span className="text-[10px] text-emerald-800 font-bold uppercase">Delivered</span>
                <p className="font-serif text-xl font-bold text-emerald-900 mt-0.5">
                  {orders.filter((o) => o.fulfillment_status === 'Delivered').length}
                </p>
              </div>

              <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200 shadow-sm text-center">
                <span className="text-[10px] text-rose-800 font-bold uppercase">Cancelled</span>
                <p className="font-serif text-xl font-bold text-rose-900 mt-0.5">
                  {orders.filter((o) => o.fulfillment_status === 'Cancelled').length}
                </p>
              </div>

              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-300 shadow-sm text-center">
                <span className="text-[10px] text-amber-800 font-bold uppercase">Pending Pay</span>
                <p className="font-serif text-xl font-bold text-amber-900 mt-0.5">
                  {orders.filter((o) => o.payment_status === 'Pending' || o.payment_status === 'Pending Verification').length}
                </p>
              </div>
            </div>

            {/* Orders Ledger Table & Filter Controls */}
            <div className="bg-white rounded-2xl border border-sand-border overflow-hidden shadow-soft-luxe">
              
              {/* Table Controls Bar */}
              <div className="p-4 bg-sand border-b border-sand-border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div>
                  <h3 className="font-serif text-lg font-bold text-espresso">Customer Orders Management</h3>
                  <p className="text-[11px] text-espresso-soft">Track WhatsApp order submissions, verify payments, and dispatch items</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Search by Order ID, Name, Phone..."
                    className="px-3 py-1.5 bg-white border border-sand-border rounded-xl text-xs text-espresso focus:outline-none focus:border-terracotta"
                  />

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-sand-border rounded-xl text-xs text-espresso focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending Confirmation">Pending Confirmation</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>

                  <select
                    value={paymentFilter}
                    onChange={(e) => setPaymentFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-sand-border rounded-xl text-xs text-espresso focus:outline-none"
                  >
                    <option value="All">All Payments</option>
                    <option value="Pending">Pending</option>
                    <option value="Pending Verification">Pending Verification</option>
                    <option value="Paid">Paid / Verified</option>
                  </select>
                </div>
              </div>

              {/* Table of Orders */}
              {(() => {
                const filtered = orders.filter((o) => {
                  if (orderSearchQuery.trim()) {
                    const q = orderSearchQuery.toLowerCase();
                    const matchesId = o.id.toLowerCase().includes(q);
                    const matchesName = o.customer_name?.toLowerCase().includes(q);
                    const matchesPhone = o.customer_phone?.includes(q);
                    if (!matchesId && !matchesName && !matchesPhone) return false;
                  }
                  if (statusFilter !== 'All' && !o.fulfillment_status?.includes(statusFilter)) {
                    return false;
                  }
                  if (paymentFilter !== 'All' && !o.payment_status?.includes(paymentFilter)) {
                    return false;
                  }
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-8 text-center text-espresso-soft text-xs">
                      No matching orders found. Adjust your search or filters.
                    </div>
                  );
                }

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-sand-light text-espresso-soft border-b border-sand-border font-semibold uppercase text-[10px]">
                        <tr>
                          <th className="p-3">Order ID</th>
                          <th className="p-3">Customer Details</th>
                          <th className="p-3">Ordered Pieces</th>
                          <th className="p-3">Total Amount</th>
                          <th className="p-3">Payment Method & Status</th>
                          <th className="p-3">Order Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sand-border/60">
                        {filtered.map((o) => (
                          <tr key={o.id} className="hover:bg-sand-light/50 transition">
                            <td className="p-3 font-mono font-bold text-espresso">{o.id}</td>
                            <td className="p-3">
                              <p className="font-bold text-espresso">{o.customer_name}</p>
                              <p className="text-[10px] text-espresso-soft">{o.customer_phone}</p>
                              <p className="text-[10px] text-espresso-soft">{o.shipping_address?.city}, {o.shipping_address?.pincode}</p>
                            </td>
                            <td className="p-3">
                              {o.items?.map((it, idx) => (
                                <div key={idx} className="text-espresso">
                                  <span>{it.name}</span>
                                  <span className="text-espresso-soft text-[10px]"> ({it.size || 'M'} • {it.quantity || 1}x)</span>
                                </div>
                              ))}
                            </td>
                            <td className="p-3 font-serif font-bold text-espresso">
                              ₹{o.total_amount?.toLocaleString('en-IN')}
                            </td>
                            <td className="p-3">
                              <p className="font-semibold text-espresso">{o.payment_method || 'COD'}</p>
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${
                                o.payment_status === 'Paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : o.payment_status === 'Pending Verification'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-sand text-espresso'
                              }`}>
                                {o.payment_status}
                              </span>
                              {o.upi_reference && (
                                <p className="text-[9px] text-espresso-soft font-mono mt-0.5">UTR: {o.upi_reference}</p>
                              )}
                            </td>
                            <td className="p-3">
                              <select
                                value={o.fulfillment_status}
                                onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                                className="bg-sand-light border border-sand-border rounded-lg text-xs font-semibold px-2 py-1 text-espresso focus:outline-none"
                              >
                                <option value="Pending Confirmation">Pending Confirmation</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped via Shiprocket">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="p-3 text-right space-x-1">
                              <button
                                onClick={() => {
                                  setSelectedOrderDetails(o);
                                  setAdminNotes(o.admin_notes || '');
                                }}
                                className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-sand-border bg-sand hover:bg-sand-border text-espresso transition"
                              >
                                Inspect / Notes
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

            {/* Detailed Order Inspect Modal */}
            {selectedOrderDetails && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-sand-border space-y-4 max-h-[90vh] overflow-y-auto text-xs">
                  
                  <div className="flex items-center justify-between pb-3 border-b border-sand-border">
                    <div>
                      <span className="font-mono text-terracotta font-bold text-sm">{selectedOrderDetails.id}</span>
                      <h3 className="font-serif text-xl font-bold text-espresso">Order Inspection & Fulfillment</h3>
                    </div>
                    <button
                      onClick={() => setSelectedOrderDetails(null)}
                      className="p-1 rounded-full text-espresso-soft hover:bg-sand"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Customer & Address Details */}
                  <div className="grid grid-cols-2 gap-4 bg-sand-light p-4 rounded-2xl border border-sand-border">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-espresso-soft">Customer Information</span>
                      <p className="font-bold text-espresso text-sm mt-0.5">{selectedOrderDetails.customer_name}</p>
                      <p className="text-espresso mt-0.5">📞 {selectedOrderDetails.customer_phone}</p>
                      {selectedOrderDetails.customer_email && (
                        <p className="text-espresso-soft">✉️ {selectedOrderDetails.customer_email}</p>
                      )}

                      {/* Direct WhatsApp Contact button */}
                      {selectedOrderDetails.customer_phone && (
                        <a
                          href={`https://wa.me/91${selectedOrderDetails.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${selectedOrderDetails.customer_name}, this is TARVEQ Atelier regarding your Order ${selectedOrderDetails.id}.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1.5 mt-2 bg-[#25D366] text-white px-3 py-1 rounded-full font-semibold text-[11px]"
                        >
                          <span>Message Customer on WhatsApp</span>
                        </a>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-espresso-soft">Delivery Destination</span>
                      <p className="text-espresso mt-0.5">
                        {selectedOrderDetails.shipping_address?.houseNo && `${selectedOrderDetails.shipping_address.houseNo}, `}
                        {selectedOrderDetails.shipping_address?.street}
                      </p>
                      <p className="text-espresso">
                        {selectedOrderDetails.shipping_address?.city}, {selectedOrderDetails.shipping_address?.state} - {selectedOrderDetails.shipping_address?.pincode}
                      </p>
                      {selectedOrderDetails.shipping_address?.landmark && (
                        <p className="text-espresso-soft text-[11px]">Landmark: {selectedOrderDetails.shipping_address.landmark}</p>
                      )}
                    </div>
                  </div>

                  {/* Payment Verification Section */}
                  <div className="bg-sand-light p-4 rounded-2xl border border-sand-border space-y-2">
                    <span className="text-[10px] uppercase font-bold text-espresso-soft">Payment Verification</span>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-espresso text-sm">{selectedOrderDetails.payment_method}</p>
                        {selectedOrderDetails.upi_reference && (
                          <p className="font-mono text-terracotta mt-0.5">UPI UTR: {selectedOrderDetails.upi_reference}</p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <select
                          value={selectedOrderDetails.payment_status}
                          onChange={(e) => handleUpdateOrderStatus(selectedOrderDetails.id, undefined, e.target.value)}
                          className="bg-white border border-sand-border rounded-lg text-xs font-semibold px-2 py-1 text-espresso"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Pending Verification">Pending Verification</option>
                          <option value="Paid">Mark as Paid / Verified</option>
                          <option value="Failed">Failed</option>
                        </select>
                      </div>
                    </div>

                    {selectedOrderDetails.payment_screenshot && (
                      <div className="pt-2">
                        <span className="text-[11px] font-semibold text-espresso-soft block mb-1">Attached Payment Screenshot:</span>
                        <a href={selectedOrderDetails.payment_screenshot} target="_blank" rel="noreferrer">
                          <img
                            src={selectedOrderDetails.payment_screenshot}
                            alt="Payment Proof"
                            className="w-32 h-24 object-cover rounded-xl border border-sand-border hover:opacity-90 transition"
                          />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Customer Instructions */}
                  {selectedOrderDetails.customer_notes && (
                    <div className="p-3 bg-white border border-sand-border rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-espresso-soft">Customer Instructions:</span>
                      <p className="text-espresso mt-0.5 italic">"{selectedOrderDetails.customer_notes}"</p>
                    </div>
                  )}

                  {/* Internal Admin Notes */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-espresso uppercase text-[10px]">Internal Studio Notes</label>
                    <textarea
                      rows={2}
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add internal notes on fabric cut, courier status, or customer preferences..."
                      className="w-full p-2.5 bg-sand-light border border-sand-border rounded-xl text-xs text-espresso"
                    />
                    <button
                      onClick={() => handleUpdateOrderStatus(selectedOrderDetails.id, undefined, undefined)}
                      disabled={updatingStatus}
                      className="bg-espresso text-ivory px-4 py-1.5 rounded-lg font-semibold hover:bg-espresso-muted transition"
                    >
                      {updatingStatus ? 'Saving...' : 'Save Notes'}
                    </button>
                  </div>

                  {/* Close & Print Actions */}
                  <div className="pt-3 border-t border-sand-border flex justify-between items-center">
                    <button
                      onClick={() => setSelectedOrderForInvoice(selectedOrderDetails)}
                      className="bg-sand hover:bg-sand-border text-espresso px-4 py-2 rounded-xl font-semibold border border-sand-border transition"
                    >
                      Print Slip / Invoice
                    </button>
                    <button
                      onClick={() => setSelectedOrderDetails(null)}
                      className="bg-terracotta text-white px-5 py-2 rounded-xl font-semibold hover:bg-terracotta-hover transition"
                    >
                      Done
                    </button>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}

        {/* =========================================================
            TAB 2: ADD NEW APPAREL (MULTI-PHOTO UPLOAD WITH MULTER)
            ========================================================= */}
        {activeTab === 'add-product' && (
          <div className="bg-white rounded-3xl border border-sand-border p-6 shadow-soft-luxe max-w-2xl mx-auto space-y-6">
            <div className="border-b border-sand-border pb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-terracotta">Catalog Creator</span>
              <h2 className="font-serif text-2xl font-bold text-espresso">Add New Modest Apparel</h2>
              <p className="text-xs text-espresso-soft mt-1">Upload high-res photos and configure zero-return fabric parameters</p>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              {/* Photo Upload Zone */}
              <div>
                <label className="block font-bold text-espresso uppercase tracking-wider mb-1.5">
                  Apparel Multi-Angle Photos (Multer Upload)
                </label>
                <div className="border-2 border-dashed border-sand-border hover:border-terracotta rounded-2xl p-5 text-center cursor-pointer transition bg-sand-light relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="w-8 h-8 text-terracotta mx-auto mb-2" />
                  <p className="font-semibold text-espresso">Drag & drop photos or click to browse</p>
                  <p className="text-[10px] text-espresso-soft mt-0.5">Saves locally to /public/uploads/products/</p>
                </div>

                {/* Previews */}
                {photoPreviews.length > 0 && (
                  <div className="mt-3 flex space-x-2 overflow-x-auto pb-1">
                    {photoPreviews.map((src, i) => (
                      <div key={i} className="w-16 h-20 rounded-xl overflow-hidden border border-sand-border shrink-0 shadow-sm">
                        <img src={src} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Title & Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-espresso uppercase tracking-wider mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Cinnamon Relaxed Co-ord"
                    className="w-full px-3 py-2 bg-sand-light border border-sand-border rounded-xl text-espresso focus:outline-none focus:border-terracotta"
                  />
                </div>
                <div>
                  <label className="block font-bold text-espresso uppercase tracking-wider mb-1">Tagline</label>
                  <input
                    type="text"
                    value={newTagline}
                    onChange={(e) => setNewTagline(e.target.value)}
                    placeholder="e.g. Ergonomic ease pleats with high collar"
                    className="w-full px-3 py-2 bg-sand-light border border-sand-border rounded-xl text-espresso focus:outline-none focus:border-terracotta"
                  />
                </div>
              </div>

              {/* Category & Pricing */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-espresso uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-sand-light border border-sand-border rounded-xl text-espresso focus:outline-none"
                  >
                    <option value="Co-ord Set">Co-ord Set</option>
                    <option value="Tunic Set">Tunic Set</option>
                    <option value="Heavyweight Tee">Heavyweight Tee</option>
                    <option value="Modest Shirt">Modest Shirt</option>
                    <option value="Trousers">Trousers</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-espresso uppercase tracking-wider mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-sand-light border border-sand-border rounded-xl text-espresso focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-espresso uppercase tracking-wider mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={newOriginalPrice}
                    onChange={(e) => setNewOriginalPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-sand-light border border-sand-border rounded-xl text-espresso focus:outline-none"
                  />
                </div>
              </div>

              {/* Fabric Specs & Opacity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-espresso uppercase tracking-wider mb-1">Fabric GSM / Weave</label>
                  <input
                    type="text"
                    value={newFabricSpec}
                    onChange={(e) => setNewFabricSpec(e.target.value)}
                    className="w-full px-3 py-2 bg-sand-light border border-sand-border rounded-xl text-espresso focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-espresso uppercase tracking-wider mb-1">Matching Undertones</label>
                  <select
                    value={newUndertone}
                    onChange={(e) => setNewUndertone(e.target.value)}
                    className="w-full px-3 py-2 bg-sand-light border border-sand-border rounded-xl text-espresso focus:outline-none"
                  >
                    <option value="Warm / Olive">Warm / Olive</option>
                    <option value="Olive / Deep">Olive / Deep</option>
                    <option value="Warm / Deep">Warm / Deep</option>
                    <option value="Cool / Neutral">Cool / Neutral</option>
                    <option value="All Undertones">All Undertones</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-espresso uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-sand-light border border-sand-border rounded-xl text-espresso focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-terracotta hover:bg-terracotta-hover text-white font-bold py-3 rounded-xl transition shadow flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>{isSubmitting ? 'Publishing Apparel...' : 'Publish Product to Live Catalog'}</span>
              </button>
            </form>
          </div>
        )}

        {/* =========================================================
            TAB 3: SIZE & LENGTH STOCK INVENTORY MATRIX
            ========================================================= */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-3xl border border-sand-border p-6 shadow-soft-luxe space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sand-border pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-olive">Inventory Engine</span>
                <h2 className="font-serif text-2xl font-bold text-espresso">Size & Length Inventory Matrix</h2>
                <p className="text-xs text-espresso-soft mt-0.5">Granular stock deduction locks out-of-stock items automatically</p>
              </div>

              {/* Product Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-espresso">Apparel:</span>
                <select
                  value={selectedProdForStock?.id}
                  onChange={(e) => {
                    const found = products.find((p) => p.id === e.target.value);
                    if (found) {
                      setSelectedProdForStock(found);
                      setStockMatrix(found.stock_inventory || {});
                    }
                  }}
                  className="px-3 py-1.5 bg-sand border border-sand-border rounded-xl text-xs font-semibold text-espresso focus:outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Matrix Grid */}
            {selectedProdForStock && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-sand-light p-3.5 rounded-2xl border border-sand-border text-xs">
                  <div>
                    <h3 className="font-serif text-base font-bold text-espresso">{selectedProdForStock.name}</h3>
                    <p className="text-espresso-soft">Category: {selectedProdForStock.category} • Price: ₹{selectedProdForStock.price}</p>
                  </div>
                  <button
                    onClick={handleSaveStockMatrix}
                    className="bg-olive hover:bg-olive-dark text-white font-semibold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Stock Updates</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-center text-xs">
                    <thead>
                      <tr className="bg-sand text-espresso font-bold uppercase text-[10px]">
                        <th className="p-3 text-left">Size Variant</th>
                        <th className="p-3">Petite (&lt;5'3")</th>
                        <th className="p-3">Regular (5'3"-5'7")</th>
                        <th className="p-3">Tall (&gt;5'7")</th>
                        <th className="p-3">Total Units</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sand-border">
                      {['XS', 'S', 'M', 'L', 'XL'].map((size) => {
                        const petite = stockMatrix[size]?.Petite ?? 5;
                        const regular = stockMatrix[size]?.Regular ?? 10;
                        const tall = stockMatrix[size]?.Tall ?? 5;
                        const rowTotal = Number(petite) + Number(regular) + Number(tall);

                        return (
                          <tr key={size} className="hover:bg-sand-light/50">
                            <td className="p-3 text-left font-bold text-espresso font-mono">{size}</td>
                            <td className="p-2">
                              <input
                                type="number"
                                min={0}
                                value={petite}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setStockMatrix({
                                    ...stockMatrix,
                                    [size]: { ...(stockMatrix[size] || {}), Petite: val },
                                  });
                                }}
                                className="w-16 text-center py-1 bg-sand-light border border-sand-border rounded-lg text-espresso font-bold"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min={0}
                                value={regular}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setStockMatrix({
                                    ...stockMatrix,
                                    [size]: { ...(stockMatrix[size] || {}), Regular: val },
                                  });
                                }}
                                className="w-16 text-center py-1 bg-sand-light border border-sand-border rounded-lg text-espresso font-bold"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                min={0}
                                value={tall}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setStockMatrix({
                                    ...stockMatrix,
                                    [size]: { ...(stockMatrix[size] || {}), Tall: val },
                                  });
                                }}
                                className="w-16 text-center py-1 bg-sand-light border border-sand-border rounded-lg text-espresso font-bold"
                              />
                            </td>
                            <td className="p-3 font-bold font-mono text-espresso">
                              <span className={rowTotal === 0 ? 'text-red-500 font-bold' : ''}>
                                {rowTotal} units {rowTotal === 0 ? '(Sold Out)' : ''}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            TAB 4: SHIPROCKET DISPATCH & FULFILLMENT
            ========================================================= */}
        {activeTab === 'dispatch' && (
          <div className="bg-white rounded-3xl border border-sand-border p-6 shadow-soft-luxe space-y-5">
            <div className="border-b border-sand-border pb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-sky-600">Shiprocket Ready Logistics</span>
              <h2 className="font-serif text-2xl font-bold text-espresso">Dispatch & AWB Generator</h2>
              <p className="text-xs text-espresso-soft mt-0.5">Automated courier partner assignment (Delhivery / BlueDart / Xpressbees)</p>
            </div>

            <div className="space-y-3">
              {orders.filter((o) => o.payment_status === 'Paid').map((o) => (
                <div key={o.id} className="p-4 rounded-2xl border border-sand-border bg-sand-light flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-espresso text-sm">{o.id}</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Paid (Razorpay)
                      </span>
                    </div>
                    <p className="text-espresso mt-1">
                      Customer: <strong>{o.customer_name}</strong> • Phone: {o.customer_phone}
                    </p>
                    <p className="text-espresso-soft text-[11px]">
                      Destination: {o.shipping_address?.street}, {o.shipping_address?.city} ({o.shipping_address?.pincode})
                    </p>
                    <p className="text-espresso-soft text-[11px] mt-0.5">
                      Items: {o.items.map((it) => it.name).join(', ')}
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end space-y-1.5">
                    {o.awb_tracking_code ? (
                      <div className="text-right">
                        <span className="bg-olive text-white text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Shipped via {o.courier_partner}</span>
                        </span>
                        <p className="font-mono text-xs font-bold text-espresso mt-1">AWB: {o.awb_tracking_code}</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleGenerateShipment(o.id)}
                        className="bg-sky-600 hover:bg-sky-700 text-white font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Generate Shipment & AWB</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedOrderForInvoice(o)}
                      className="text-xs text-espresso-soft hover:text-espresso font-semibold underline flex items-center space-x-1"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Print Label & Tax Invoice</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Printable Invoice Modal if clicked */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold font-serif text-lg">Tax Invoice & Shipping Label</h3>
              <button onClick={() => setSelectedOrderForInvoice(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="font-mono text-xs space-y-3">
              <div className="p-3 bg-slate-50 border rounded-lg">
                <p className="font-bold">AURA ATELIER D2C PVT LTD</p>
                <p>Order: {selectedOrderForInvoice.id}</p>
                <p>Courier: {selectedOrderForInvoice.courier_partner || 'Delhivery Express'}</p>
                <p>AWB: {selectedOrderForInvoice.awb_tracking_code || 'Pending'}</p>
              </div>
              <div>
                <p className="font-bold">Ship To:</p>
                <p>{selectedOrderForInvoice.customer_name}</p>
                <p>{selectedOrderForInvoice.shipping_address?.street}</p>
                <p>{selectedOrderForInvoice.shipping_address?.city}, {selectedOrderForInvoice.shipping_address?.pincode}</p>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold">
                  <span>Total Amount Paid</span>
                  <span>₹{selectedOrderForInvoice.total_amount?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="w-full bg-espresso text-ivory font-bold py-2.5 rounded-xl flex items-center justify-center space-x-1"
            >
              <Printer className="w-4 h-4" />
              <span>Print Document</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
