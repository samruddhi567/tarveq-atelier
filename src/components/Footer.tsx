import React, { useState } from 'react';
import { ArrowRight, Instagram, MessageCircle, Check, Lock, MapPin, Navigation, Clock, Phone } from 'lucide-react';

interface FooterProps {
  onNavClick: (tab: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;

    try {
      await fetch('/api/waitlist/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: newsletterEmail, type: 'email' }),
      });
      setSubscribed(true);
      setNewsletterEmail('');
    } catch {
      setSubscribed(true);
    }
  };

  return (
    <footer className="bg-charcoal text-[#F8F4EC] pt-16 pb-12 border-t border-charcoal-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Atelier Studio & Interactive Location Map */}
        <div id="atelier-map" className="pb-16 mb-14 border-b border-charcoal-border/70 scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Location & Appointment Info */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center space-x-2 bg-gold/15 text-gold px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest border border-gold/30">
                <MapPin className="w-3.5 h-3.5" />
                <span>Flagship Atelier & Fitting Studio</span>
              </div>

              <h3 className="font-serif text-3xl sm:text-4xl font-medium text-white leading-tight">
                Visit Our Dehradun Atelier
              </h3>

              <p className="text-sm text-[#F8F4EC]/80 leading-relaxed font-sans">
                Experience in-person bespoke draping, fitting, and touch our premium fabrics and breathable cambrics firsthand.
              </p>

              <div className="space-y-2.5 text-xs text-[#F8F4EC]/80 font-sans pt-1">
                <div className="flex items-start space-x-2.5">
                  <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                  <span>TARVEQ Atelier Studio, Rajpur Road, Dehradun, Uttarakhand 248001</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Clock className="w-4 h-4 text-gold flex-shrink-0" />
                  <span>Monday – Saturday: 10:30 AM – 8:30 PM | Sunday: 11:00 AM – 7:00 PM</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                  <span>Direct Concierge: +91 9307859693 / +91 8809271583</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href="https://maps.google.com/?q=Rajpur+Road+Dehradun+Uttarakhand"
                  target="_blank"
                  rel="noreferrer"
                  className="bg-gold hover:bg-gold-hover text-charcoal font-sans text-xs font-semibold px-5 py-2.5 rounded-full transition flex items-center space-x-2 shadow-sm"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Open in Google Maps</span>
                </a>

                <a
                  href="https://wa.me/919307859693?text=Hello%20TARVEQ%20Atelier%2C%20I%20would%20like%20to%20inquire%20about%20your%20collection."
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-sans text-xs font-medium px-5 py-2.5 rounded-full transition flex items-center space-x-2"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-sage" />
                  <span>Order on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Right Interactive Embedded Google Map */}
            <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-gold/30 shadow-2xl relative h-[320px] sm:h-[380px] bg-charcoal-light">
              <iframe
                title="TARVEQ Atelier Location Map"
                src="https://maps.google.com/maps?q=Rajpur%20Road,%20Dehradun,%20Uttarakhand%20248001&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0 filter contrast-105"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

          </div>
        </div>

        {/* Main 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12 pb-14 border-b border-charcoal-border/70">
          
          {/* Column 1: Brand & Story */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img
                src="/images/tarveq-crest.png"
                alt="TARVEQ Crest"
                className="h-10 w-auto object-contain brightness-125"
              />
              <div className="flex flex-col">
                <span className="font-serif text-2xl sm:text-3xl tracking-[0.2em] font-bold text-white uppercase leading-none">
                  TARVEQ
                </span>
                <span className="text-[10px] text-gold tracking-[0.32em] font-medium uppercase mt-1">
                  Atelier
                </span>
              </div>
            </div>

            <p className="text-sm text-[#F8F4EC]/80 font-sans leading-relaxed">
              Premium Indian modest fashion and handcrafted luxury wear. High-quality fabrics designed for comfortable elegance and timeless beauty.
            </p>

            <div className="text-xs text-gold/90 font-sans">
              <span>Co-Founders: </span>
              <span className="font-semibold text-white">Samruddhi &amp; Vikash</span>
            </div>

            <p className="text-xs text-gold font-serif italic">
              "Luxury in appearance. Simplicity in experience."
            </p>

            {/* Social Channels */}
            <div className="pt-2 flex items-center space-x-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-burgundy text-[#F8F4EC] flex items-center justify-center transition"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/919307859693?text=Hello%20TARVEQ%20Atelier%2C%20I%20would%20like%20to%20inquire%20about%20your%20collection."
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-sage text-[#F8F4EC] flex items-center justify-center transition"
                aria-label="WhatsApp Concierge"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: SHOP */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg font-medium text-gold tracking-wide">Shop</h4>
            <ul className="space-y-2.5 text-sm text-[#F8F4EC]/80 font-sans">
              <li>
                <button
                  onClick={() => onNavClick('shop-all')}
                  className="hover:text-white transition"
                >
                  Shop All Outfits
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('new-arrivals')}
                  className="hover:text-white transition"
                >
                  New Arrivals
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('orders')}
                  className="hover:text-white transition"
                >
                  Track My Orders
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('ai-roadmap')}
                  className="hover:text-gold transition text-gold/90 flex items-center space-x-1"
                >
                  <span>✨ AI Roadmap & Models</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: CUSTOMER SUPPORT & NEWSLETTER */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-medium text-gold tracking-wide">Customer Support</h4>
            <ul className="space-y-2 text-sm text-[#F8F4EC]/80 font-sans">
              <li>TARVEQ Atelier, Rajpur Road, Dehradun, Uttarakhand 248001</li>
              <li>Co-Founders: <span className="text-white font-medium">Samruddhi &amp; Vikash</span></li>
              <li>WhatsApp Admin 1: <a href="https://wa.me/919307859693" target="_blank" rel="noreferrer" className="hover:text-gold transition font-mono">+91 9307859693</a></li>
              <li>WhatsApp Admin 2: <a href="https://wa.me/918809271583" target="_blank" rel="noreferrer" className="hover:text-gold transition font-mono">+91 8809271583</a></li>
              <li>Email: contact@tarveqatelier.com</li>
              <li className="text-xs text-gold/90 pt-1">
                WhatsApp-first ordering with personal assistance
              </li>
            </ul>

            {/* Newsletter Subscription */}
            <div className="pt-2">
              <p className="text-xs font-medium text-white mb-2">Join the TARVEQ Circle</p>
              {subscribed ? (
                <div className="flex items-center space-x-1.5 text-xs text-sage font-medium bg-white/5 p-2 rounded-lg">
                  <Check className="w-3.5 h-3.5" />
                  <span>Thank you for subscribing.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex items-center space-x-1.5">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="bg-white/10 border border-white/20 rounded-full px-3.5 py-1.5 text-xs text-white placeholder-white/50 focus:outline-none focus:border-gold w-full font-sans"
                  />
                  <button
                    type="submit"
                    className="bg-burgundy hover:bg-burgundy-hover text-white p-2 rounded-full transition flex-shrink-0"
                    aria-label="Subscribe"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Strip: Trust & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-[#F8F4EC]/60 gap-4">
          <div className="flex flex-wrap items-center gap-4 text-center md:text-left">
            <span>© 2026 TARVEQ ATELIER. All rights reserved.</span>
            <span>•</span>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Direct WhatsApp Ordering</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-gold">
              <Lock className="w-3.5 h-3.5" />
              <span className="text-[11px]">Direct WhatsApp Verified Orders</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
