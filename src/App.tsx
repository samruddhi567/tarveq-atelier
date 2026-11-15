import React, { useState, useEffect } from 'react';
import { Header, ActiveNavTab } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { StyleDiscoverySection } from './components/StyleDiscoverySection';
import { ProductCatalogueView } from './components/ProductCatalogueView';
import { StyleStudioView } from './components/StyleStudioView';
import { DigitalWardrobeView } from './components/DigitalWardrobeView';
import { UpcomingCollectionSection } from './components/UpcomingCollectionSection';
import { OutfitsInMotion } from './components/OutfitsInMotion';
import { Footer } from './components/Footer';
import { ProductCard } from './components/ProductCard';

// Modals & Drawers
import { ProductDetailModal } from './components/ProductDetailModal';
import { FitFinderModal } from './components/FitFinderModal';
import { ColourStudioModal } from './components/ColourStudioModal';
import { CartDrawer, CartItem } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { SearchModal } from './components/SearchModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AuthModal } from './components/AuthModal';
import { RazorpayModal } from './components/RazorpayModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { InvestorDrawer } from './components/InvestorDrawer';
import { AdminDashboard } from './components/AdminDashboard';
import { CheckoutPage } from './components/CheckoutPage';
import { WhatsAppOrderConfirmationModal } from './components/WhatsAppOrderConfirmationModal';

import { Product, User, WardrobeVaultItem, Order } from './types';
import { Package, Truck, Bell, Sparkles, MessageCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('aura_token'));
  const [products, setProducts] = useState<Product[]>([]);
  const [vaultItems, setVaultItems] = useState<WardrobeVaultItem[]>([]);
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
  const [isFitFinderOpen, setIsFitFinderOpen] = useState(false);
  const [isColourStudioOpen, setIsColourStudioOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<Order | null>(null);
  const [isInvestorDrawerOpen, setIsInvestorDrawerOpen] = useState(false);

  // WhatsApp-First Order & Checkout States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CartItem[]>([]);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);
  const [confirmedWhatsAppUrls, setConfirmedWhatsAppUrls] = useState<any>(null);
  const [isWhatsAppConfirmationOpen, setIsWhatsAppConfirmationOpen] = useState(false);

  // Active Payment & Order States
  const [activeRazorpayOrder, setActiveRazorpayOrder] = useState<any>(null);
  const [pendingCheckoutPayload, setPendingCheckoutPayload] = useState<any>(null);
  const [latestOrder, setLatestOrder] = useState<any>(null);
  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const [founderAlert, setFounderAlert] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => setToastNotification(null), 4000);
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
    const currentToken = localStorage.getItem('aura_token');
    try {
      const res = await fetch('/api/auth/me', {
        headers: currentToken ? { Authorization: `Bearer ${currentToken}` } : {},
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error('Error fetching auth user:', err);
    }
  };

  // Fetch catalog, vault, and orders
  const fetchStoreData = async () => {
    try {
      const userId = currentUser?.id || 'user-customer-demo';
      const [prodRes, vaultRes, ordersRes] = await Promise.all([
        fetch(`/api/products?userId=${userId}`).then((r) => r.json()),
        fetch(`/api/wardrobe-vault?userId=${userId}`).then((r) => r.json()),
        fetch(`/api/orders?userId=${userId}`).then((r) => r.json()),
      ]);

      if (prodRes.success) setProducts(prodRes.products || []);
      if (vaultRes.success) setVaultItems(vaultRes.vault || []);
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

  // Derived user recommended size
  const userFitSize = currentUser?.style_dna?.is_scanned === 1
    ? (currentUser.style_dna.build_proportion === 'Petite' ? 'S' : 'M')
    : null;

  // Cart Handlers
  const handleAddToCart = (product: Product, size: string = 'M', length: string = 'Regular', coverage: string = 'Standard') => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (it) => it.product.id === product.id && it.size === size && it.length === length
      );
      if (existingIdx > -1) {
        const next = [...prev];
        next[existingIdx].quantity += 1;
        return next;
      }
      return [...prev, { product, size, length, coverage, quantity: 1 }];
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

  // Save Fit Profile to SQLite Backend
  const handleSaveFitProfile = async (fitData: any) => {
    try {
      const userId = currentUser?.id || 'user-customer-demo';
      const res = await fetch('/api/style-dna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          height: fitData.height,
          buildProportion: fitData.build_proportion,
          modestyPreference: fitData.modesty_preference,
          skinUndertone: fitData.undertone,
          shoulderCm: fitData.bust_cm ? fitData.bust_cm * 0.42 : 39,
          bustCm: fitData.bust_cm,
          waistCm: fitData.waist_cm,
          hipCm: fitData.hip_cm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser((prev) => (prev ? { ...prev, style_dna: data.user.style_dna } : data.user));
        fetchStoreData();
        showToast(`Fit Finder profile saved! Recommended size: ${fitData.recommended_size}.`);
      }
    } catch (err) {
      console.error('Failed to save fit profile:', err);
    }
  };

  // Save Colour Palette
  const handleSavePalette = async (undertone: string, paletteName: string) => {
    try {
      const userId = currentUser?.id || 'user-customer-demo';
      await fetch('/api/style-dna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          height: currentUser?.style_dna?.height || 165,
          buildProportion: currentUser?.style_dna?.build_proportion || 'Regular',
          modestyPreference: currentUser?.style_dna?.modesty_preference || 'Balanced Modest',
          skinUndertone: undertone,
        }),
      });
      showToast(`Palette saved! Harmonized with ${paletteName}.`);
      fetchStoreData();
      fetchAuthProfile();
    } catch (err) {
      console.error('Failed to save palette:', err);
    }
  };

  // Add & Delete Wardrobe Vault Items
  const handleAddNewVaultItem = async (item: Partial<WardrobeVaultItem>) => {
    try {
      const res = await fetch('/api/wardrobe-vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id || 'user-customer-demo',
          itemName: item.item_name,
          category: item.category,
          colorName: item.color_name,
          colorHex: item.color_hex,
          imageUrl: item.image_url,
          tags: item.tags,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchStoreData();
        showToast('Piece added to your TARVEQ Wardrobe!');
      }
    } catch (err) {
      console.error('Failed to add vault piece:', err);
    }
  };

  const handleDeleteVaultItem = async (id: string) => {
    try {
      const res = await fetch(`/api/wardrobe-vault/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setVaultItems((prev) => prev.filter((it) => it.id !== id));
        showToast('Piece removed from wardrobe.');
      }
    } catch (err) {
      console.error('Failed to delete vault item:', err);
    }
  };

  // Checkout Flow
  const initiateCheckout = async (items: any[], customTailoring: any = {}) => {
    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id || 'user-customer-demo',
          items,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'OUT_OF_STOCK') {
          showToast(`⚠️ ${data.message}`);
          return;
        }
        throw new Error(data.error || 'Failed to initiate payment');
      }

      setPendingCheckoutPayload({ items, customTailoring });
      setActiveRazorpayOrder(data.order);
      setIsRazorpayOpen(true);
      setIsCartOpen(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleProceedCartCheckout = () => {
    if (cartItems.length === 0) return;
    setCheckoutItems(cartItems);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleDirectBuy = (product: Product, tailoring: { size: string; length: string; coverage: string }) => {
    setSelectedProduct(null);
    setCheckoutItems([
      {
        product,
        size: tailoring.size || 'M',
        length: tailoring.length || 'Regular',
        coverage: tailoring.coverage || 'Standard',
        quantity: 1,
      },
    ]);
    setIsCheckoutOpen(true);
  };

  const handleOrderCapsule = (capsuleProducts: Product[]) => {
    const formatted: CartItem[] = capsuleProducts.map((p) => ({
      product: p,
      size: userFitSize || 'M',
      length: 'Regular',
      coverage: 'Capsule Bundle',
      quantity: 1,
    }));
    setCheckoutItems(formatted);
    setIsCheckoutOpen(true);
  };

  const handleOrderCreated = (orderData: any, whatsAppUrls: any) => {
    setIsCheckoutOpen(false);
    setCartItems([]);
    setConfirmedOrder(orderData);
    setConfirmedWhatsAppUrls(whatsAppUrls);
    setIsWhatsAppConfirmationOpen(true);
    fetchStoreData();
    showToast(`Order ${orderData.id} created! Please send to both WhatsApp admins.`);
  };

  const handlePaymentSuccess = async (paymentId: string, paymentMethod: string) => {
    setIsRazorpayOpen(false);
    if (!pendingCheckoutPayload) return;

    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: activeRazorpayOrder.id,
          razorpay_payment_id: paymentId,
          paymentMethod,
          userId: currentUser?.id || 'user-customer-demo',
          items: pendingCheckoutPayload.items,
          customTailoring: pendingCheckoutPayload.customTailoring,
          shippingAddress: currentUser?.shipping_address || {
            street: 'Indiranagar 100ft Road',
            city: 'Bengaluru',
            state: 'Karnataka',
            pincode: '560038',
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setLatestOrder(data);
        setIsSuccessOpen(true);
        setCartItems([]); // Clear cart upon successful order
        if (data.founderAlertMessage) {
          setFounderAlert(data.founderAlertMessage);
          setTimeout(() => setFounderAlert(null), 8000);
        }
        fetchStoreData();
      }
    } catch (err) {
      console.error('Payment verification failed:', err);
    }
  };

  // Auth Handlers
  const handleLoginSuccess = (user: User, userToken: string) => {
    setCurrentUser(user);
    setToken(userToken);
    showToast(`Welcome back, ${user.name}!`);
    if (user.role === 'admin') {
      setIsAdminView(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('aura_token');
    setToken(null);
    setCurrentUser(null);
    setIsAdminView(false);
    fetchAuthProfile();
    showToast('Signed out of TARVEQ Atelier.');
  };

  // If Founder Admin Dashboard is active
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
          <Sparkles className="w-4 h-4 text-gold" />
          <span>{toastNotification}</span>
        </div>
      )}

      {/* Founder Admin Alert Banner (Live Simulation) */}
      {founderAlert && (
        <div className="fixed top-24 right-4 z-50 bg-burgundy text-white p-4 rounded-2xl shadow-2xl max-w-sm border border-gold/40 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start space-x-2.5">
            <Bell className="w-4 h-4 text-gold shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs font-sans">
              <span className="font-bold text-gold uppercase tracking-wider text-[10px]">Atelier Dispatch Alert</span>
              <p className="leading-snug">{founderAlert}</p>
            </div>
          </div>
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
        onOpenFitFinder={() => setIsFitFinderOpen(true)}
        onOpenAdmin={() => setIsAdminView(true)}
        cartCount={cartItems.reduce((sum, it) => sum + it.quantity, 0)}
        wishlistCount={wishlistIds.length}
      />

      {/* 2. Main Tab Views */}
      <div className="flex-1">
        
        {/* VIEW 1: Home Page */}
        {activeTab === 'home' && (
          <main className="space-y-0">
            {/* Hero Banner — editorial full-bleed style */}
            <HeroBanner
              onExploreCollection={() => setActiveTab('shop-all')}
              onDiscoverStyle={() => setIsFitFinderOpen(true)}
              isScanned={currentUser?.style_dna?.is_scanned === 1}
              userUndertone={currentUser?.style_dna?.undertone}
            />

            {/* ── Ornamental Divider ── */}
            <div className="flex items-center justify-center py-6 px-4 bg-[#F8F4EC]">
              <div className="flex items-center gap-2 sm:gap-3 w-full max-w-2xl">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/40 to-gold/60" />
                <svg width="120" height="20" viewBox="0 0 120 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 opacity-70">
                  <circle cx="60" cy="10" r="3" fill="#B58C50"/>
                  <rect x="52" y="9" width="6" height="2" rx="1" fill="#B58C50"/>
                  <rect x="62" y="9" width="6" height="2" rx="1" fill="#B58C50"/>
                  <circle cx="45" cy="10" r="2" fill="#B58C50" opacity="0.5"/>
                  <circle cx="75" cy="10" r="2" fill="#B58C50" opacity="0.5"/>
                  <circle cx="34" cy="10" r="1.5" fill="#B58C50" opacity="0.3"/>
                  <circle cx="86" cy="10" r="1.5" fill="#B58C50" opacity="0.3"/>
                  <circle cx="25" cy="10" r="1" fill="#B58C50" opacity="0.2"/>
                  <circle cx="95" cy="10" r="1" fill="#B58C50" opacity="0.2"/>
                </svg>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gold/40 to-gold/60" />
              </div>
            </div>

            {/* ── Shop by Category — circular chips ── */}
            <section className="bg-[#F8F4EC] pb-14 pt-2 px-4 sm:px-6 lg:px-8">
              <div className="max-w-6xl mx-auto space-y-8">
                {/* Section header */}
                <div className="text-center space-y-1">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-gold font-sans font-semibold">Our Blooms</p>
                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-charcoal">
                    Shop by Category
                  </h2>
                </div>

                {/* Circular category chips */}
                <div className="flex items-start justify-center gap-5 sm:gap-8 lg:gap-10 overflow-x-auto pb-2 scrollbar-hide">
                  {[
                    {
                      label: 'Co-ord Sets',
                      img: 'https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?auto=format&fit=crop&w=300&q=80',
                      tab: 'shop-all',
                    },
                    {
                      label: 'Tunics',
                      img: 'https://images.unsplash.com/photo-1587316205589-54b66fc80563?auto=format&fit=crop&w=300&q=80',
                      tab: 'shop-all',
                    },
                    {
                      label: 'Shirts',
                      img: 'https://images.unsplash.com/photo-1598032895397-b9472444bf93?auto=format&fit=crop&w=300&q=80',
                      tab: 'shop-all',
                    },
                    {
                      label: 'Trousers',
                      img: 'https://images.unsplash.com/photo-1594938298603-c8148c4b5fca?auto=format&fit=crop&w=300&q=80',
                      tab: 'shop-all',
                    },
                    {
                      label: 'New Arrivals',
                      img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=300&q=80',
                      tab: 'new-arrivals',
                    },
                  ].map((cat) => (
                    <button
                      key={cat.label}
                      onClick={() => setActiveTab(cat.tab as any)}
                      className="flex flex-col items-center gap-3 group flex-shrink-0"
                    >
                      <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden border-2 border-gold/30 group-hover:border-burgundy shadow-md group-hover:shadow-lg transition-all duration-300 ring-4 ring-transparent group-hover:ring-burgundy/10">
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

            {/* ── Second ornamental divider ── */}
            <div className="flex items-center justify-center py-4 px-4 bg-[#F8F4EC]">
              <div className="flex items-center gap-2 sm:gap-3 w-full max-w-2xl">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/30 to-gold/50" />
                <svg width="80" height="16" viewBox="0 0 80 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 opacity-60">
                  <circle cx="40" cy="8" r="2.5" fill="#B58C50"/>
                  <circle cx="30" cy="8" r="1.5" fill="#B58C50" opacity="0.5"/>
                  <circle cx="50" cy="8" r="1.5" fill="#B58C50" opacity="0.5"/>
                  <circle cx="21" cy="8" r="1" fill="#B58C50" opacity="0.3"/>
                  <circle cx="59" cy="8" r="1" fill="#B58C50" opacity="0.3"/>
                </svg>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gold/30 to-gold/50" />
              </div>
            </div>

            {/* Personalized Style Discovery Section (4 Cards) */}
            <StyleDiscoverySection
              onOpenFitFinder={() => setIsFitFinderOpen(true)}
              onOpenColourStudio={() => setIsColourStudioOpen(true)}
              onOpenStyleStudio={() => setActiveTab('style-studio')}
              onOpenWardrobe={() => setActiveTab('wardrobe')}
            />

            {/* Featured Outfits Grid */}
            <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-beige-border">
                <div>
                  <div className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-widest text-burgundy font-medium mb-1">
                    <span>Curated Outfits</span>
                    <span>•</span>
                    <span>Drop 01</span>
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
                {products.slice(0, 3).map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onSelect={(p) => setSelectedProduct(p)}
                    onAddToCart={(p, s) => handleAddToCart(p, s || 'M')}
                    onToggleWishlist={handleToggleWishlist}
                    isWishlisted={wishlistIds.includes(prod.id)}
                    recommendedSize={userFitSize}
                  />
                ))}
              </div>
            </section>

            {/* Outfits In Motion (Video Reels of Drape & Movement) */}
            <OutfitsInMotion />

            {/* Upcoming Collection Waitlist */}
            <UpcomingCollectionSection />
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
              userFitSize={userFitSize}
              initialCategory="All"
            />
          </main>
        )}

        {/* VIEW 3: Shop by Fit */}
        {activeTab === 'shop-by-fit' && (
          <main className="space-y-6">
            <div className="bg-beige/30 py-8 px-4 text-center border-b border-beige-border space-y-2">
              <span className="text-xs uppercase tracking-widest text-burgundy font-semibold">
                Proportion Engineered
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-charcoal">
                Shop by Inseam & Fit
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-muted max-w-lg mx-auto">
                Bespoke silhouettes calibrated for Petite (under 5'3"), Regular, and Tall lengths with zero-bust gaping guarantees.
              </p>
            </div>

            <ProductCatalogueView
              products={products}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onAddToCart={(p, s) => handleAddToCart(p, s || 'M')}
              onToggleWishlist={handleToggleWishlist}
              wishlistIds={wishlistIds}
              userFitSize={userFitSize}
              initialCategory="Co-ord Set"
            />
          </main>
        )}

        {/* VIEW 4: AI Style Studio */}
        {activeTab === 'style-studio' && (
          <main>
            <StyleStudioView
              products={products}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onAddToCart={(p, s) => handleAddToCart(p, s || 'M')}
              onToggleWishlist={handleToggleWishlist}
              wishlistIds={wishlistIds}
              userFitSize={userFitSize}
            />
          </main>
        )}

        {/* VIEW 5: My TARVEQ Wardrobe */}
        {activeTab === 'wardrobe' && (
          <main>
            <DigitalWardrobeView
              user={currentUser}
              vaultItems={vaultItems}
              products={products}
              onAddNewVaultItem={handleAddNewVaultItem}
              onDeleteVaultItem={handleDeleteVaultItem}
              onAddToCart={(p, s) => handleAddToCart(p, s || 'M')}
              onOrderCapsule={handleOrderCapsule}
              userFitSize={userFitSize}
            />
          </main>
        )}

        {/* VIEW 6: New Arrivals (Drop 01) */}
        {activeTab === 'new-arrivals' && (
          <main>
            <div className="bg-burgundy-light/40 py-8 px-4 text-center border-b border-burgundy-border/30 space-y-2">
              <span className="text-xs uppercase tracking-widest text-burgundy font-semibold">
                Limited Atelier Batch
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-charcoal">
                Drop 01: Start of the Bloom
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-muted max-w-lg mx-auto">
                Handcrafted breathable cambric, zero-sheer double poplins, and drape-calibrated linen co-ords.
              </p>
            </div>

            <ProductCatalogueView
              products={products}
              onSelectProduct={(p) => setSelectedProduct(p)}
              onAddToCart={(p, s) => handleAddToCart(p, s || 'M')}
              onToggleWishlist={handleToggleWishlist}
              wishlistIds={wishlistIds}
              userFitSize={userFitSize}
              initialCategory="All"
            />
          </main>
        )}

        {/* VIEW 7: Customer Orders History */}
        {activeTab === 'orders' && (
          <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-beige-border">
              <div>
                <h2 className="font-serif text-3xl font-medium text-charcoal">My Orders</h2>
                <p className="text-xs text-charcoal-muted mt-0.5">
                  Live dispatch updates and Shiprocket tracking for your bespoke orders
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
                  Explore our collection or pair an item you already own in your digital wardrobe to experience custom modest tailoring.
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
                        <p className="text-[11px] text-charcoal-muted">Paid via Razorpay Secure</p>
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
                              Size: {it.size || 'M'} • Inseam: {it.length || 'Regular'}
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
                        <span className="text-charcoal-muted text-[10px] uppercase">Total Paid</span>
                        <p className="font-serif text-lg font-medium text-charcoal">
                          ₹{ord.total_amount?.toLocaleString('en-IN')}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedOrderForTracking(ord)}
                        className="bg-[#F8F4EC] hover:bg-beige text-charcoal font-medium text-xs px-4 py-2 rounded-xl border border-gold transition flex items-center space-x-1.5 shadow-sm"
                      >
                        <Truck className="w-3.5 h-3.5 text-burgundy" />
                        <span>Track Live AWB</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
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
      <Footer
        onNavClick={setActiveTab}
        onOpenFitFinder={() => setIsFitFinderOpen(true)}
        onOpenColourStudio={() => setIsColourStudioOpen(true)}
        onOpenStyleStudio={() => setActiveTab('style-studio')}
        onOpenWardrobe={() => setActiveTab('wardrobe')}
        onToggleInvestorDrawer={() => setIsInvestorDrawerOpen(true)}
      />

      {/* ======================================================== */}
      {/* 4. MODALS & DRAWERS */}
      {/* ======================================================== */}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        user={currentUser}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, size, length, coverage) => {
          handleAddToCart(p, size, length, coverage);
        }}
        onDirectBuy={handleDirectBuy}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={selectedProduct ? wishlistIds.includes(selectedProduct.id) : false}
        onOpenFitFinder={() => {
          setSelectedProduct(null);
          setIsFitFinderOpen(true);
        }}
        recommendedSize={userFitSize}
      />

      {/* Fit Finder Modal */}
      <FitFinderModal
        isOpen={isFitFinderOpen}
        onClose={() => setIsFitFinderOpen(false)}
        onSaveProfile={handleSaveFitProfile}
        user={currentUser}
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      {/* Colour Studio Modal */}
      <ColourStudioModal
        isOpen={isColourStudioOpen}
        onClose={() => setIsColourStudioOpen(false)}
        onSavePalette={handleSavePalette}
        user={currentUser}
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={handleProceedCartCheckout}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistProducts={wishlistProducts}
        onRemoveFromWishlist={handleToggleWishlist}
        onMoveToCart={(p) => {
          handleAddToCart(p, userFitSize || 'M');
          handleToggleWishlist(p);
        }}
        onViewProduct={(p) => setSelectedProduct(p)}
      />

      {/* Live Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        products={products}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      {/* Customer Profile / Account Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
        orders={orders}
        onLogout={handleLogout}
        onOpenFitFinder={() => {
          setIsProfileOpen(false);
          setIsFitFinderOpen(true);
        }}
        onOpenColourStudio={() => {
          setIsProfileOpen(false);
          setIsColourStudioOpen(true);
        }}
        onTrackOrder={(ord) => setSelectedOrderForTracking(ord)}
      />

      {/* Auth Modal (Sign in / Register) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Razorpay Checkout & Payment Simulator Modal */}
      <RazorpayModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        order={activeRazorpayOrder}
        onPaymentSuccess={handlePaymentSuccess}
        user={currentUser}
      />

      {/* Order Placement Success Modal */}
      <OrderSuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        order={latestOrder}
        onTrackOrder={() => {
          setIsSuccessOpen(false);
          if (latestOrder) {
            setSelectedOrderForTracking(latestOrder);
          }
        }}
      />

      {/* Dedicated WhatsApp-First Checkout Modal */}
      <CheckoutPage
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={checkoutItems}
        user={currentUser}
        onOrderCreated={handleOrderCreated}
      />

      {/* WhatsApp Click-to-Chat Order Confirmation Modal */}
      <WhatsAppOrderConfirmationModal
        isOpen={isWhatsAppConfirmationOpen}
        onClose={() => setIsWhatsAppConfirmationOpen(false)}
        order={confirmedOrder}
        whatsAppUrls={confirmedWhatsAppUrls}
        onTrackOrders={() => setActiveTab('orders')}
      />

      {/* Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={!!selectedOrderForTracking}
        onClose={() => setSelectedOrderForTracking(null)}
        order={selectedOrderForTracking}
      />

      {/* Investor Metrics & Pitch Drawer (Discrete, accessed via footer link) */}
      <InvestorDrawer
        isOpen={isInvestorDrawerOpen}
        onClose={() => setIsInvestorDrawerOpen(false)}
        user={currentUser}
      />

    </div>
  );
};
