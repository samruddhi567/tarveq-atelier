import React, { useState } from 'react';
import { AnnouncementBar } from './AnnouncementBar';
import { Search, Heart, User as UserIcon, ShoppingBag, Menu, X, MapPin, ChevronRight, Sparkles, Shirt } from 'lucide-react';
import { User as UserType } from '../types';

export type ActiveNavTab = 'home' | 'shop-all' | 'new-arrivals' | 'orders' | 'ai-roadmap';

interface HeaderProps {
  user: UserType | null;
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  onOpenSearch: () => void;
  onOpenWishlist: () => void;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onOpenAdmin?: () => void;
  onOpenStyleDna?: () => void;
  onOpenWardrobeVault?: () => void;
  onOpenStylistChat?: () => void;
  cartCount: number;
  wishlistCount: number;
  onFilterCategory?: (category: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenSearch,
  onOpenWishlist,
  onOpenCart,
  onOpenAuth,
  onOpenAdmin,
  onOpenStyleDna,
  onOpenWardrobeVault,
  onOpenStylistChat,
  cartCount,
  wishlistCount,
  onFilterCategory,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: ActiveNavTab, categoryFilter?: string) => {
    setActiveTab(tab);
    if (categoryFilter && onFilterCategory) {
      onFilterCategory(categoryFilter);
    }
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F8F4EC]/95 backdrop-blur-md border-b border-beige-border transition-all">
      {/* 1. Top Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24">
          
          {/* Left: Mobile Hamburger Toggle (hidden on desktop) */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 rounded-lg text-charcoal hover:bg-beige/60 transition"
              aria-label="Open Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <button
              onClick={onOpenSearch}
              className="p-2 ml-1 rounded-lg text-charcoal hover:bg-beige/60 transition"
              aria-label="Search Collection"
            >
              <Search className="w-5 h-5 text-charcoal" />
            </button>
          </div>

          {/* Center/Left: Brand Logo (Grand, High-Fashion & Balanced) */}
          <div
            onClick={() => handleNavClick('home')}
            className="cursor-pointer text-center group flex flex-col items-center justify-center py-1 transition-transform select-none"
          >
            <img
              src="/images/tarveq-crest.png"
              alt="TARVEQ Crest"
              className="h-6 sm:h-9 lg:h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-sm mb-0.5 sm:mb-1"
            />

            <div className="flex items-center justify-center">
              <span className="font-serif text-xl sm:text-3xl lg:text-[34px] tracking-[0.18em] sm:tracking-[0.22em] font-bold text-burgundy uppercase leading-none transition-colors group-hover:text-[#5c1c1d]">
                TARVEQ
              </span>
            </div>

            <p className="text-[8px] sm:text-[10px] text-charcoal-muted tracking-[0.26em] sm:tracking-[0.32em] font-light uppercase mt-0.5 sm:mt-1">
              Atelier & Luxury Fashion
            </p>
          </div>

          {/* Center Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-[15px] font-medium text-charcoal">
            <button
              onClick={() => handleNavClick('home')}
              className={`transition py-1 relative ${
                activeTab === 'home'
                  ? 'text-burgundy font-semibold'
                  : 'hover:text-burgundy text-charcoal'
              }`}
            >
              Home
              {activeTab === 'home' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-burgundy rounded-full" />
              )}
            </button>

            <button
              onClick={() => handleNavClick('shop-all')}
              className={`transition py-1 relative ${
                activeTab === 'shop-all'
                  ? 'text-burgundy font-semibold'
                  : 'hover:text-burgundy text-charcoal'
              }`}
            >
              Shop All
              {activeTab === 'shop-all' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-burgundy rounded-full" />
              )}
            </button>

            <button
              onClick={() => handleNavClick('new-arrivals')}
              className={`transition py-1 relative ${
                activeTab === 'new-arrivals'
                  ? 'text-burgundy font-semibold'
                  : 'hover:text-burgundy text-charcoal'
              }`}
            >
              New Arrivals
              {activeTab === 'new-arrivals' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-burgundy rounded-full" />
              )}
            </button>

            <button
              onClick={() => handleNavClick('orders')}
              className={`transition py-1 relative ${
                activeTab === 'orders'
                  ? 'text-burgundy font-semibold'
                  : 'hover:text-burgundy text-charcoal'
              }`}
            >
              My Orders
              {activeTab === 'orders' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-burgundy rounded-full" />
              )}
            </button>

            <button
              onClick={() => handleNavClick('ai-roadmap')}
              className={`transition py-1 relative flex items-center space-x-1 ${
                activeTab === 'ai-roadmap'
                  ? 'text-burgundy font-semibold'
                  : 'hover:text-burgundy text-charcoal'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>AI Roadmap</span>
              {activeTab === 'ai-roadmap' && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-burgundy rounded-full" />
              )}
            </button>

            {/* Atelier Studio Map Link */}
            <a
              href="#atelier-map"
              className="transition py-1 relative flex items-center space-x-1 text-charcoal hover:text-burgundy"
              title="Visit our physical flagship studio in Dehradun, Uttarakhand"
            >
              <MapPin className="w-3.5 h-3.5 text-gold" />
              <span>Atelier Map</span>
            </a>
          </nav>

          {/* Right Utility Icons (Search, Wishlist, Account, Cart) */}
          <div className="flex items-center space-x-1 sm:space-x-4">
            
            {/* Edge Style DNA Trigger */}
            {onOpenStyleDna && (
              <button
                onClick={onOpenStyleDna}
                className="hidden lg:flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full bg-[#FAF7F2] text-[#7A2E2E] hover:bg-[#F3ECE1] border border-[#B8925A]/40 transition"
                title="Scan Body Proportions & CIELAB Undertone"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#B8925A]" />
                <span>Style DNA</span>
              </button>
            )}

            {/* Wardrobe Vault Trigger */}
            {onOpenWardrobeVault && (
              <button
                onClick={onOpenWardrobeVault}
                className="hidden lg:flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full bg-[#FAF7F2] text-[#261B18] hover:bg-[#F3ECE1] border border-[#F3ECE1] transition"
                title="Open Wardrobe Vault & SigLIP Matcher"
              >
                <Shirt className="w-3.5 h-3.5 text-[#7A2E2E]" />
                <span>Vault</span>
              </button>
            )}

            {/* Stylist Chatbot Trigger */}
            {onOpenStylistChat && (
              <button
                onClick={onOpenStylistChat}
                className="hidden lg:flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#7A2E2E] text-white hover:bg-[#5E2222] border border-[#B8925A] shadow-sm transition"
                title="Chat with TARVEQ Personal Stylist AI"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#B8925A] animate-pulse" />
                <span>Ask Stylist ✨</span>
              </button>
            )}

            {/* Desktop Search Icon */}
            <button
              onClick={onOpenSearch}
              className="hidden lg:flex items-center space-x-2 text-charcoal hover:text-burgundy p-2 rounded-full hover:bg-beige/50 transition"
              aria-label="Search products"
              title="Search by name, fabric, or category"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2 text-charcoal hover:text-burgundy rounded-full hover:bg-beige/50 transition"
              aria-label={`Wishlist with ${wishlistCount} items`}
              title="My Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 bg-burgundy text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* User Profile */}
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full border border-beige-border bg-beige/40 hover:bg-beige/80 transition text-charcoal text-xs sm:text-sm font-medium"
              title={user ? `Signed in as ${user.name}` : "Sign In or View Profile"}
            >
              <UserIcon className="w-4 h-4 text-burgundy" />
              {user ? (
                <span className="hidden sm:inline max-w-[85px] truncate font-medium">
                  {user.name.split(' ')[0]}
                </span>
              ) : (
                <span className="hidden sm:inline">Sign In</span>
              )}
            </button>

            {/* Shopping Bag Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2 text-charcoal hover:text-burgundy rounded-full hover:bg-beige/50 transition"
              aria-label={`Shopping bag with ${cartCount} items`}
              title="View Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4 text-charcoal" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-burgundy text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm animate-pulse-subtle">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Founder Admin Direct Access (if admin user) */}
            {user?.role === 'admin' && onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="hidden md:flex items-center space-x-1 bg-burgundy text-white px-2.5 py-1 rounded-full text-xs font-semibold hover:bg-burgundy-hover transition shadow-sm"
              >
                <span>Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Mobile Slide-out Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-beige-border bg-[#F8F4EC] px-6 py-5 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-3 text-base font-medium text-charcoal">
            <button
              onClick={() => handleNavClick('home')}
              className={`flex items-center justify-between text-left py-2 border-b border-beige/60 ${
                activeTab === 'home' ? 'text-burgundy font-bold' : ''
              }`}
            >
              <span>Home</span>
              <ChevronRight className="w-4 h-4 text-charcoal-muted" />
            </button>

            <button
              onClick={() => handleNavClick('shop-all')}
              className={`flex items-center justify-between text-left py-2 border-b border-beige/60 ${
                activeTab === 'shop-all' ? 'text-burgundy font-bold' : ''
              }`}
            >
              <span>Shop All Outfits</span>
              <ChevronRight className="w-4 h-4 text-charcoal-muted" />
            </button>

            <button
              onClick={() => handleNavClick('new-arrivals')}
              className={`flex items-center justify-between text-left py-2 border-b border-beige/60 ${
                activeTab === 'new-arrivals' ? 'text-burgundy font-bold' : ''
              }`}
            >
              <span>New Arrivals</span>
              <ChevronRight className="w-4 h-4 text-charcoal-muted" />
            </button>

            <button
              onClick={() => handleNavClick('orders')}
              className={`flex items-center justify-between text-left py-2 border-b border-beige/60 ${
                activeTab === 'orders' ? 'text-burgundy font-bold' : ''
              }`}
            >
              <span>My Orders</span>
              <ChevronRight className="w-4 h-4 text-charcoal-muted" />
            </button>

            <button
              onClick={() => handleNavClick('ai-roadmap')}
              className={`flex items-center justify-between text-left py-2 border-b border-beige/60 ${
                activeTab === 'ai-roadmap' ? 'text-burgundy font-bold' : ''
              }`}
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-gold" />
                <span>AI Roadmap & Models</span>
              </div>
              <ChevronRight className="w-4 h-4 text-charcoal-muted" />
            </button>

            {onOpenStyleDna && (
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenStyleDna(); }}
                className="flex items-center justify-between text-left py-2 border-b border-beige/60 text-charcoal"
              >
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#7A2E2E]" />
                  <span>Edge Style DNA Scanner</span>
                </div>
                <ChevronRight className="w-4 h-4 text-charcoal-muted" />
              </button>
            )}

            {onOpenWardrobeVault && (
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenWardrobeVault(); }}
                className="flex items-center justify-between text-left py-2 border-b border-beige/60 text-charcoal"
              >
                <div className="flex items-center space-x-2">
                  <Shirt className="w-4 h-4 text-[#261B18]" />
                  <span>Wardrobe Vault & Matcher</span>
                </div>
                <ChevronRight className="w-4 h-4 text-charcoal-muted" />
              </button>
            )}

            {onOpenStylistChat && (
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenStylistChat(); }}
                className="flex items-center justify-between text-left py-2 border-b border-beige/60 text-[#7A2E2E] font-bold"
              >
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-[#B8925A]" />
                  <span>Ask Atelier Stylist (AI Chat)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-charcoal-muted" />
              </button>
            )}

            {/* Mobile Atelier Map Link */}
            <a
              href="#atelier-map"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between text-left py-2 border-b border-beige/60 text-charcoal hover:text-burgundy"
            >
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gold" />
                <span>Visit Dehradun Atelier (Map)</span>
              </div>
              <ChevronRight className="w-4 h-4 text-charcoal-muted" />
            </a>

            {/* Quick WhatsApp Concierge Button */}
            <a
              href="https://wa.me/919307859693?text=Hello%20TARVEQ%20Atelier%2C%20I%20would%20like%20assistance%20with%20sizing%20and%20orders."
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between text-left py-2.5 px-3 rounded-xl bg-sage-light text-sage font-medium text-xs border border-sage-border mt-2"
            >
              <div className="flex items-center space-x-2">
                <span>💬 WhatsApp Concierge</span>
              </div>
              <span className="font-mono text-[11px]">+91 9307859693</span>
            </a>
          </nav>

          {/* Mobile Profile & Support */}
          <div className="pt-3 border-t border-beige-border flex items-center justify-between text-xs text-charcoal-muted">
            <button onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }} className="hover:text-burgundy py-1">
              {user ? `Account: ${user.name}` : 'Sign In / Register'}
            </button>
            <button onClick={() => { handleNavClick('orders'); }} className="hover:text-burgundy py-1">
              My Orders
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
