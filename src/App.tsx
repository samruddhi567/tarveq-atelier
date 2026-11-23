import React, { useState, useEffect } from 'react';
import { Header, ActiveNavTab } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { ProductCatalogueView } from './components/ProductCatalogueView';
import { Footer } from './components/Footer';
import { ProductCard } from './components/ProductCard';

// Modals & Drawers
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer, CartItem } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { SearchModal } from './components/SearchModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { CheckoutPage } from './components/CheckoutPage';
import { WhatsAppOrderConfirmationModal } from './components/WhatsAppOrderConfirmationModal';

// AI Suite: Edge Vision, Wardrobe Vault, Stylist Chat & Roadmap
import { EdgeStyleDnaScannerModal } from './components/EdgeStyleDnaScannerModal';
import { WardrobeVaultDrawer } from './components/WardrobeVaultDrawer';
import { StylistChatDrawer } from './components/StylistChatDrawer';
import { AiRoadmapView } from './components/AiRoadmapView';

import { Product, User, Order } from './types';
import { Package, Truck, MessageCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('tarveq_token'));
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('home');
  const [isAdminView, setIsAdminView] = useState<boolean>(false);

  // Cart & Wishlist State (Persisted)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('tarveq_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('tarveq_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modal Visibility States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isStyleDnaOpen, setIsStyleDnaOpen] = useState(false);
  const [isWardrobeVaultOpen, setIsWardrobeVaultOpen] = useState(false);
  const [isStylistChatOpen, setIsStylistChatOpen] = useState(false);

  // WhatsApp-First Order & Checkout States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);
  const [confirmedWhatsAppUrls, setConfirmedWhatsAppUrls] = useState<any>(null);
  const [isWhatsAppConfirmationOpen, setIsWhatsAppConfirmationOpen] = useState(false);

  const [toastNotification, setToastNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => setToastNotification(null), 3000);
  };

  // Persist Cart & Wishlist
  useEffect(() => {
    localStorage.setItem('tarveq_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('tarveq_wishlist', JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  // Fetch authenticated user profile
  const fetchAuthProfile = async () => {
    const currentToken = localStorage.getItem('tarveq_token');
    try {
      const res = await fetch('/api/auth/me', {
        headers: currentToken ? { Authorization: `Bearer ${currentToken}` } : {},
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        if (data.token && !currentToken) {
          localStorage.setItem('tarveq_token', data.token);
          setToken(data.token);
        }
      }
    } catch (err) {
      console.error('Error fetching auth user:', err);
    }
  };

  // Fetch catalog and orders
  const fetchStoreData = async () => {
    try {
      const userId = currentUser?.id || 'user-customer-demo';
      const [prodRes, ordersRes] = await Promise.all([
        fetch(`/api/products?userId=${userId}`).then((r) => r.json()),
        fetch(`/api/orders?userId=${userId}`).then((r) => r.json()),
      ]);

      if (prodRes.success) setProducts(prodRes.products || []);
      if (ordersRes.success) setOrders(ordersRes.orders || []);
    } catch (err) {
      console.error('Failed to load store data:', err);
    }
  };

  useEffect(() => {
    fetchAuthProfile();
  }, []);

  useEffect(() => {
    fetchStoreData();
  }, [currentUser]);

  // Cart Handlers
  const handleAddToCart = (product: Product, size: string = 'M') => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (it) => it.product.id === product.id && it.size === size
      );
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += 1;
        return next;
      }
      return [...prev, { product, size, length: 'Regular', coverage: 'Standard', quantity: 1 }];
    });
    showToast(`Added ${product.name} (${size}) to your Bag.`);
  };

  const handleUpdateCartQuantity = (idx: number, newQty: number) => {
    setCartItems((prev) => {
      const next = [...prev];
      next[idx].quantity = newQty;
      return next;
    });
  };

  const handleRemoveCartItem = (idx: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Wishlist Handlers
  const handleToggleWishlist = (product: Product) => {
    setWishlistIds((prev) => {
      if (prev.includes(product.id)) {
        showToast(`Removed from your wishlist.`);
        return prev.filter((id) => id !== product.id);
      } else {
        showToast(`Saved ${product.name} to your wishlist.`);
        return [...prev, product.id];
      }
    });
  };

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  const handleProceedCartCheckout = () => {
    if (cartItems.length === 0) return;
    setCheckoutItems(cartItems);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleDirectBuy = (product: Product, tailoring: { size: string }) => {
    setSelectedProduct(null);
    setCheckoutItems([
      {
        product,
        size: tailoring.size || 'M',
        length: 'Regular',
        coverage: 'Standard',
        quantity: 1,
      },
    ]);
    setIsCheckoutOpen(true);
  };

  const handleOrderCreated = (orderData: any, whatsAppUrls: any) => {
    setIsCheckoutOpen(false);
    setCartItems([]);
    setConfirmedOrder(orderData);
    setConfirmedWhatsAppUrls(whatsAppUrls);
    setIsWhatsAppConfirmationOpen(true);
    fetchStoreData();
    showToast(`Order ${orderData.id} created! Please send to WhatsApp admin.`);
  };

  // Auth Handlers
  const handleLoginSuccess = (user: User, userToken: string) => {
    setCurrentUser(user);
    setToken(userToken);
    localStorage.setItem('tarveq_token', userToken);
    showToast(`Welcome back, ${user.name}!`);
    if (user.role === 'admin') {
      setIsAdminView(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tarveq_token');
    setToken(null);
    setCurrentUser(null);
    setIsAdminView(false);
    fetchAuthProfile();
    showToast('Signed out of TARVEQ Atelier.');
  };

  // Admin Dashboard
  if (isAdminView) {
    return (
      <AdminDashboard
        onBackToStore={() => setIsAdminView(false)}
        token={token}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F4EC] text-charcoal font-sans flex flex-col selection:bg-burgundy selection:text-white">
      
      {/* Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-[70] bg-charcoal text-[#F8F4EC] text-xs font-sans font-medium px-4 py-3 rounded-2xl shadow-elevated-luxe flex items-center space-x-2 border border-gold/30 animate-in slide-in-from-bottom-2 duration-300">
          <span>{toastNotification}</span>
        </div>
      )}

      {/* 1. Header Navigation */}
      <Header
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => (currentUser ? setIsProfileOpen(true) : setIsAuthOpen(true))}
        onOpenAdmin={() => setIsAdminView(true)}
        onOpenStyleDna={() => setIsStyleDnaOpen(true)}
        onOpenWardrobeVault={() => setIsWardrobeVaultOpen(true)}
        onOpenStylistChat={() => setIsStylistChatOpen(true)}
        cartCount={cartItems.reduce((sum, it) => sum + it.quantity, 0)}
        wishlistCount={wishlistIds.length}
      />

      {/* 2. Main Tab Views */}
      <div className="flex-1">
        
        {/* VIEW 1: Home Page */}
        {activeTab === 'home' && (
          <main className="space-y-0">
            {/* Hero Banner */}
            <HeroBanner
              onExploreCollection={() => setActiveTab('shop-all')}
              onDiscoverStyle={() => setActiveTab('shop-all')}
              isScanned={false}
              userUndertone={undefined}
            />

            {/* Ornamental Divider */}
            <div className="flex items-center justify-center py-6 px-4 bg-[#F8F4EC]">
              <div className="flex items-center gap-2 sm:gap-3 w-full max-w-2xl">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/40 to-gold/60" />
                <div className="w-2 h-2 rounded-full bg-gold" />
                <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gold/40 to-gold/60" />
              </div>
            </div>

            {/* Shop by Category */}
            <section className="bg-[#F8F4EC] pb-14 pt-2 px-4 sm:px-6 lg:px-8">
              <div className="max-w-6xl mx-auto space-y-8">
                <div className="text-center space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-gold font-sans font-semibold">Collections</p>
                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-charcoal">
                    Shop by Category
                  </h2>
                </div>

                <div className="flex items-start justify-center gap-5 sm:gap-8 lg:gap-10 overflow-x-auto pb-2 scrollbar-hide">
                  {[
                    { label: 'Co-ord Sets', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80', tab: 'shop-all' },
                    { label: 'Tunics', img: 'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=400&q=80', tab: 'shop-all' },
                    { label: 'Shirts', img: 'https://images.unsplash.com/photo-1598032895397-b9472444bf93?auto=format&fit=crop&w=400&q=80', tab: 'shop-all' },
                    { label: 'Trousers', img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&q=80', tab: 'shop-all' },
                    { label: 'New Arrivals', img: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=400&q=80', tab: 'new-arrivals' },
                  ].map((cat) => (
                    <button
                      key={cat.label}
                      onClick={() => setActiveTab(cat.tab as any)}
                      className="flex flex-col items-center gap-3 group flex-shrink-0"
                    >
                      <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden border-2 border-gold/30 group-hover:border-burgundy shadow-md transition-all duration-300">
                        <img
                          src={cat.img}
                          alt={cat.label}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <span className="text-[12px] sm:text-[13px] font-sans font-medium text-charcoal group-hover:text-burgundy transition-colors tracking-wide">
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Featured Outfits Grid */}
            <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-beige-border">
                <div>
                  <div className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-widest text-burgundy font-medium mb-1">
                    <span>Curated Outfits</span>
                    <span>•</span>
                    <span>Signature Collection</span>
                  </div>
                  <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-charcoal">
                    Atelier Highlights
                  </h2>
                </div>

                <button
                  onClick={() => setActiveTab('shop-all')}
                  className="self-start sm:self-auto text-xs font-semibold text-burgundy hover:underline uppercase tracking-wider flex items-center space-x-1"
                >
                  <span>View All {products.length} Outfits</span>
                  <span>→</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {products.slice(0, 6).map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onSelect={(p) => setSelectedProduct(p)}
                    onAddToCart={(p, s) => handleAddToCart(p, s || 'M')}
                    onToggleWishlist={handleToggleWishlist}
                    isWishlisted={wishlistIds.includes(prod.id)}
                  />
                ))}
              </div>
            </section>
          </main>
        )}

        {/* VIEW 2: Shop All Outfits */}
        {activeTab === 'shop-all' && (
          <main>
            <ProductCatalogueView
              products={products}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onAddToCart={(p, s) => handleAddToCart(p, s || 'M')}
              onToggleWishlist={handleToggleWishlist}
              wishlistIds={wishlistIds}
              initialCategory="All"
            />
          </main>
        )}

        {/* VIEW 3: New Arrivals */}
        {activeTab === 'new-arrivals' && (
          <main>
            <div className="bg-burgundy-light/40 py-8 px-4 text-center border-b border-burgundy-border/30 space-y-2">
              <span className="text-xs uppercase tracking-widest text-burgundy font-semibold">
                Limited Batch
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-charcoal">
                Signature Atelier Collection
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-muted max-w-lg mx-auto">
                Handcrafted luxury cambrics, double poplins, and breathable linen co-ords.
              </p>
            </div>

            <ProductCatalogueView
              products={products}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onAddToCart={(p, s) => handleAddToCart(p, s || 'M')}
              onToggleWishlist={handleToggleWishlist}
              wishlistIds={wishlistIds}
              initialCategory="All"
            />
          </main>
        )}

        {/* VIEW 4: Customer Orders History */}
        {activeTab === 'orders' && (
          <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-beige-border">
              <div>
                <h2 className="font-serif text-3xl font-medium text-charcoal">My Orders</h2>
                <p className="text-xs text-charcoal-muted mt-0.5">
                  Direct WhatsApp confirmed orders and fulfillment status
                </p>
              </div>
              <span className="bg-sage-light text-sage text-xs font-semibold px-3 py-1 rounded-full">
                {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl p-8 border border-beige-border space-y-3">
                <Package className="w-10 h-10 text-charcoal-muted mx-auto" />
                <h3 className="font-serif text-xl font-medium text-charcoal">No orders placed yet</h3>
                <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
                  Browse our collection and place your first order directly via WhatsApp.
                </p>
                <button
                  onClick={() => setActiveTab('shop-all')}
                  className="bg-burgundy text-white text-xs font-medium px-6 py-2.5 rounded-full hover:bg-burgundy-hover transition shadow-sm"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div key={ord.id} className="bg-white p-5 rounded-3xl border border-beige-border space-y-3 shadow-sm">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-charcoal text-sm">{ord.id}</span>
                        <p className="text-[11px] text-charcoal-muted">Payment: {ord.payment_method || 'COD / WhatsApp'}</p>
                      </div>
                      <span className="bg-sage-light text-sage text-xs font-medium px-3 py-1 rounded-full flex items-center space-x-1.5">
                        <Truck className="w-3.5 h-3.5" />
                        <span>{ord.fulfillment_status}</span>
                      </span>
                    </div>

                    <div className="divide-y divide-beige-border text-xs">
                      {ord.items.map((it: any, idx: number) => (
                        <div key={idx} className="py-2.5 flex items-center justify-between">
                          <div>
                            <p className="font-serif font-medium text-charcoal text-sm">{it.name}</p>
                            <p className="text-[11px] text-charcoal-muted">
                              Size: {it.size || 'M'} • Qty: {it.quantity || 1}
                            </p>
                          </div>
                          <span className="font-serif font-medium text-charcoal">
                            ₹{it.price?.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-beige-border flex items-center justify-between text-xs">
                      <div>
                        <span className="text-charcoal-muted text-[10px] uppercase">Order Total</span>
                        <p className="font-serif text-lg font-medium text-charcoal">
                          ₹{ord.total_amount?.toLocaleString('en-IN')}
                        </p>
                      </div>

                      <span className="text-gold font-medium text-xs">
                        Status: {ord.payment_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        )}

        {/* VIEW 5: AI Roadmap & Models Architecture */}
        {activeTab === 'ai-roadmap' && (
          <AiRoadmapView onBackToStore={() => setActiveTab('home')} />
        )}

      </div>

      {/* Mobile WhatsApp Floating Action Button */}
      <a
        href="https://wa.me/919307859693"
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="lg:hidden fixed bottom-6 left-6 z-[70] w-14 h-14 rounded-full bg-[#7C3031] shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </a>

      {/* 3. Footer */}
      <Footer onNavClick={setActiveTab} />

      {/* 4. Modals & Drawers */}
      <ProductDetailModal
        product={selectedProduct}
        user={currentUser}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, size) => handleAddToCart(p, size)}
        onDirectBuy={handleDirectBuy}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={selectedProduct ? wishlistIds.includes(selectedProduct.id) : false}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={handleProceedCartCheckout}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistProducts={wishlistProducts}
        onRemoveFromWishlist={handleToggleWishlist}
        onMoveToCart={(p) => {
          handleAddToCart(p, 'M');
          handleToggleWishlist(p);
        }}
        onViewProduct={(p) => setSelectedProduct(p)}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
        orders={orders}
        onLogout={handleLogout}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <CheckoutPage
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={checkoutItems}
        user={currentUser}
        onOrderCreated={handleOrderCreated}
      />

      <WhatsAppOrderConfirmationModal
        isOpen={isWhatsAppConfirmationOpen}
        onClose={() => setIsWhatsAppConfirmationOpen(false)}
        order={confirmedOrder}
        whatsAppUrls={confirmedWhatsAppUrls}
        onTrackOrders={() => setActiveTab('orders')}
      />

      {/* AI Suite: Edge Vision Scanner, Wardrobe Vault & Stylist Chatbot */}
      <EdgeStyleDnaScannerModal
        isOpen={isStyleDnaOpen}
        onClose={() => setIsStyleDnaOpen(false)}
        token={token}
        onScanComplete={(updatedUser) => {
          setCurrentUser(updatedUser);
          showToast('Style DNA Calibrated Permanently!');
        }}
      />

      <WardrobeVaultDrawer
        isOpen={isWardrobeVaultOpen}
        onClose={() => setIsWardrobeVaultOpen(false)}
        token={token}
        onSelectProduct={(prod) => {
          setSelectedProduct(prod);
          setIsWardrobeVaultOpen(false);
        }}
      />

      <StylistChatDrawer
        user={currentUser}
        token={token}
        isOpen={isStylistChatOpen}
        onOpen={() => setIsStylistChatOpen(true)}
        onClose={() => setIsStylistChatOpen(false)}
        onOpenStyleDnaScanner={() => setIsStyleDnaOpen(true)}
        onOpenWardrobeVault={() => setIsWardrobeVaultOpen(true)}
        onSelectProduct={(prod) => setSelectedProduct(prod)}
      />

    </div>
  );
};
