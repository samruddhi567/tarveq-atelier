import React, { useState, useEffect } from 'react';
import {
  X,
  User as UserIcon,
  Ruler,
  Palette,
  Package,
  MapPin,
  Heart,
  LogOut,
  ShieldCheck,
  Check,
  Truck,
  Shield,
  KeyRound,
  QrCode,
  Smartphone,
  Copy,
  AlertCircle
} from 'lucide-react';
import { User, Order } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  orders: Order[];
  onLogout: () => void;
  onOpenFitFinder: () => void;
  onOpenColourStudio: () => void;
  onTrackOrder: (order: Order) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  orders,
  onLogout,
  onOpenFitFinder,
  onOpenColourStudio,
  onTrackOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'fit' | 'orders' | 'addresses' | 'security'>('profile');

  // Google Authenticator (2FA) State
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(Boolean(user?.two_factor_enabled));
  const [setupStep, setSetupStep] = useState<'idle' | 'generating' | 'qr_ready' | 'verifying'>('idle');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [otpauthUrl, setOtpauthUrl] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setIs2FAEnabled(Boolean(user.two_factor_enabled));
    }
  }, [user]);

  if (!isOpen || !user) return null;

  // Step 1: Request 2FA Setup QR Code
  const handleStart2FASetup = async () => {
    setSetupStep('generating');
    setSecurityError(null);
    setSecuritySuccess(null);
    try {
      const token = localStorage.getItem('aura_token');
      const res = await fetch('/api/auth/2fa/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start 2FA setup');

      setSecretKey(data.secret);
      setQrCodeUrl(data.qrCodeUrl);
      setOtpauthUrl(data.otpauthUrl);
      setSetupStep('qr_ready');
    } catch (err: any) {
      setSecurityError(err.message);
      setSetupStep('idle');
    }
  };

  // Step 2: Confirm 6-digit Code from Google Authenticator App
  const handleVerify2FACode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      setSecurityError('Please enter the 6-digit code shown in Google Authenticator');
      return;
    }

    setSetupStep('verifying');
    setSecurityError(null);
    try {
      const token = localStorage.getItem('aura_token');
      const res = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ token: verificationCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to verify 2FA code');

      setIs2FAEnabled(true);
      setSetupStep('idle');
      setSecuritySuccess('Google Authenticator 2FA activated! Your account is now protected.');
      setVerificationCode('');
    } catch (err: any) {
      setSecurityError(err.message);
      setSetupStep('qr_ready');
    }
  };

  // Step 3: Disable 2FA
  const handleDisable2FA = async () => {
    if (!window.confirm('Are you sure you want to disable Google Authenticator two-factor authentication?')) {
      return;
    }

    setSecurityError(null);
    try {
      const token = localStorage.getItem('aura_token');
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to disable 2FA');

      setIs2FAEnabled(false);
      setSecuritySuccess('Google Authenticator 2FA has been disabled.');
    } catch (err: any) {
      setSecurityError(err.message);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#F8F4EC] w-full max-w-2xl rounded-3xl shadow-modal-luxe border border-beige-border overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-beige/40 border-b border-beige-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-burgundy text-white flex items-center justify-center font-serif text-lg font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif text-2xl font-medium text-charcoal">{user.name}</h3>
                {is2FAEnabled && (
                  <span className="bg-sage-light text-sage text-[10px] font-sans font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 border border-sage/30">
                    <ShieldCheck className="w-3 h-3" />
                    <span>2FA Protected</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-charcoal-muted font-sans">{user.email}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-full text-charcoal hover:bg-beige transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-beige-border text-xs font-sans font-medium bg-beige/20 px-6 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'profile' ? 'border-burgundy text-burgundy font-bold' : 'border-transparent text-charcoal-muted'
            }`}
          >
            Account Details
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap flex items-center space-x-1.5 ${
              activeTab === 'security' ? 'border-burgundy text-burgundy font-bold' : 'border-transparent text-charcoal-muted'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-gold" />
            <span>Google Authenticator (2FA)</span>
          </button>
          <button
            onClick={() => setActiveTab('fit')}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'fit' ? 'border-burgundy text-burgundy font-bold' : 'border-transparent text-charcoal-muted'
            }`}
          >
            Saved Fit
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'orders' ? 'border-burgundy text-burgundy font-bold' : 'border-transparent text-charcoal-muted'
            }`}
          >
            My Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`py-3 px-3 border-b-2 transition whitespace-nowrap ${
              activeTab === 'addresses' ? 'border-burgundy text-burgundy font-bold' : 'border-transparent text-charcoal-muted'
            }`}
          >
            Shipping Address
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 font-sans">
          
          {/* TAB 1: Profile */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-beige-border space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-charcoal-muted">Full Name</span>
                  <span className="font-semibold text-charcoal">{user.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-charcoal-muted">Registered Email</span>
                  <span className="font-semibold text-charcoal">{user.email}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-charcoal-muted">Role</span>
                  <span className="font-semibold text-burgundy uppercase">{user.role}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-charcoal-muted">Two-Factor Authentication</span>
                  <span className={`font-semibold ${is2FAEnabled ? 'text-sage' : 'text-charcoal-muted'}`}>
                    {is2FAEnabled ? '● Enabled via Google Authenticator' : '○ Not Enabled'}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => { onLogout(); onClose(); }}
                  className="w-full bg-white hover:bg-beige/40 text-burgundy border border-burgundy/30 text-xs font-semibold py-2.5 rounded-full transition flex items-center justify-center space-x-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Account</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE AUTHENTICATOR (2FA) */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              
              {/* Status Banner */}
              <div className={`p-4 rounded-2xl border flex items-start space-x-3.5 ${
                is2FAEnabled ? 'bg-sage-light/60 border-sage/40' : 'bg-gold-light/40 border-gold/40'
              }`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  is2FAEnabled ? 'bg-sage text-white' : 'bg-gold text-white'
                }`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-base font-semibold text-charcoal">
                    {is2FAEnabled ? 'Google Authenticator is Active' : 'Two-Factor Authentication (TOTP)'}
                  </h4>
                  <p className="text-xs text-charcoal-muted leading-relaxed">
                    {is2FAEnabled
                      ? 'Your TARVEQ Atelier account is protected. Every time you log in, you will be prompted for a 6-digit code from Google Authenticator.'
                      : 'Protect your orders, measurements, and customer data by requiring a 6-digit code from Google Authenticator on login.'}
                  </p>
                </div>
              </div>

              {securitySuccess && (
                <div className="p-3 bg-sage-light text-sage text-xs rounded-xl flex items-center space-x-2 border border-sage/40">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>{securitySuccess}</span>
                </div>
              )}

              {securityError && (
                <div className="p-3 bg-burgundy-light text-burgundy text-xs rounded-xl flex items-center space-x-2 border border-burgundy/40">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{securityError}</span>
                </div>
              )}

              {/* Action when 2FA is already active */}
              {is2FAEnabled && (
                <div className="bg-white p-5 rounded-2xl border border-beige-border space-y-4">
                  <div className="flex items-center space-x-2 text-xs text-charcoal font-medium">
                    <Smartphone className="w-4 h-4 text-sage" />
                    <span>Connected to: Google Authenticator (iOS / Android)</span>
                  </div>

                  <p className="text-xs text-charcoal-muted">
                    If you change your device or need to re-link Google Authenticator, you can disable 2FA here and re-enable it on your new phone.
                  </p>

                  <button
                    onClick={handleDisable2FA}
                    className="bg-white hover:bg-beige/40 text-charcoal-muted hover:text-burgundy border border-beige-border text-xs font-semibold py-2 px-4 rounded-full transition"
                  >
                    Disable Google Authenticator
                  </button>
                </div>
              )}

              {/* Setup Flow when 2FA is NOT active */}
              {!is2FAEnabled && (
                <div className="bg-white p-5 rounded-2xl border border-beige-border space-y-4">
                  
                  {setupStep === 'idle' && (
                    <div className="space-y-4 text-center py-4">
                      <div className="w-14 h-14 bg-gold-light rounded-full mx-auto flex items-center justify-center text-gold">
                        <KeyRound className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="font-serif text-lg font-medium text-charcoal">
                          Set up Google Authenticator
                        </h5>
                        <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
                          Works with Google Authenticator, Authy, 1Password, or any standard TOTP authenticator app.
                        </p>
                      </div>

                      <button
                        onClick={handleStart2FASetup}
                        className="bg-burgundy hover:bg-burgundy-hover text-white text-xs font-semibold px-6 py-3 rounded-full transition shadow-md border border-gold/30"
                      >
                        Generate Setup QR Code
                      </button>
                    </div>
                  )}

                  {setupStep === 'generating' && (
                    <div className="text-center py-8 text-xs text-charcoal-muted">
                      Generating secure 160-bit key...
                    </div>
                  )}

                  {(setupStep === 'qr_ready' || setupStep === 'verifying') && qrCodeUrl && (
                    <div className="space-y-5">
                      
                      {/* Step Instructions */}
                      <div className="space-y-2 border-b border-beige-border pb-4">
                        <p className="text-xs font-bold text-burgundy uppercase tracking-wider">
                          Step 1: Scan with Google Authenticator
                        </p>
                        <p className="text-xs text-charcoal-muted">
                          Open the <strong>Google Authenticator</strong> app on your mobile device, tap the <strong>+</strong> button, and choose <strong>Scan a QR code</strong>:
                        </p>
                      </div>

                      {/* QR Code Display */}
                      <div className="flex flex-col sm:flex-row items-center gap-5 justify-center py-2">
                        <div className="p-3 bg-white border border-gold/40 rounded-2xl shadow-sm">
                          <img
                            src={qrCodeUrl}
                            alt="Google Authenticator QR Code"
                            className="w-48 h-48 object-contain"
                          />
                        </div>

                        {/* Manual entry secret */}
                        <div className="space-y-2 text-xs max-w-xs text-center sm:text-left">
                          <p className="text-charcoal-muted font-medium">
                            Can't scan the QR code? Enter this secret key manually:
                          </p>
                          <div className="flex items-center space-x-1.5 bg-beige/40 p-2 rounded-xl border border-beige-border">
                            <code className="font-mono text-[11px] text-charcoal font-bold tracking-wider select-all break-all">
                              {secretKey}
                            </code>
                            <button
                              onClick={() => secretKey && copyToClipboard(secretKey)}
                              className="p-1 hover:bg-beige rounded text-charcoal transition"
                              title="Copy key"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {copiedKey && <span className="text-[10px] text-sage font-bold">✓ Secret key copied!</span>}
                        </div>
                      </div>

                      {/* Verification Code Form */}
                      <form onSubmit={handleVerify2FACode} className="space-y-3 pt-3 border-t border-beige-border">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-burgundy uppercase tracking-wider block">
                            Step 2: Enter 6-digit code from Google Authenticator
                          </label>
                          <p className="text-xs text-charcoal-muted">
                            Enter the 6-digit code currently displayed in the app for <strong>TARVEQ Atelier</strong> to verify setup:
                          </p>
                        </div>

                        <div className="flex items-center space-x-3">
                          <input
                            type="text"
                            maxLength={6}
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                            placeholder="123456"
                            className="w-40 text-center font-mono text-xl tracking-[0.3em] font-bold py-2.5 px-3 bg-[#F8F4EC] border border-charcoal/20 focus:border-burgundy rounded-xl focus:outline-none"
                            autoFocus
                          />

                          <button
                            type="submit"
                            disabled={setupStep === 'verifying' || verificationCode.length !== 6}
                            className="bg-burgundy hover:bg-burgundy-hover disabled:opacity-50 text-white text-xs font-semibold px-5 py-3 rounded-full transition shadow-md"
                          >
                            {setupStep === 'verifying' ? 'Verifying...' : 'Activate 2FA'}
                          </button>

                          <button
                            type="button"
                            onClick={() => setSetupStep('idle')}
                            className="text-xs text-charcoal-muted hover:text-charcoal underline"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>

                    </div>
                  )}

                </div>
              )}

            </div>
          )}

          {/* TAB 3: Saved Fit & Measurements */}
          {activeTab === 'fit' && (
            <div className="space-y-4">
              {user.style_dna && user.style_dna.is_scanned === 1 ? (
                <div className="bg-white p-5 rounded-2xl border border-beige-border space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-beige-border">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-5 h-5 text-sage" />
                      <span className="font-serif text-lg font-medium text-charcoal">
                        Calibrated Fit Profile
                      </span>
                    </div>
                    <button
                      onClick={() => { onOpenFitFinder(); onClose(); }}
                      className="text-xs text-burgundy font-medium underline"
                    >
                      Update
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-beige/20 rounded-xl">
                      <span className="text-charcoal-muted">Recommended Size</span>
                      <p className="font-serif text-xl font-bold text-charcoal mt-0.5">
                        {user.style_dna.build_proportion === 'Petite' ? 'S' : 'M'}
                      </p>
                    </div>

                    <div className="p-3 bg-beige/20 rounded-xl">
                      <span className="text-charcoal-muted">Vertical Inseam</span>
                      <p className="font-serif text-xl font-bold text-charcoal mt-0.5">
                        {user.style_dna.build_proportion || 'Regular'}
                      </p>
                    </div>

                    <div className="p-3 bg-beige/20 rounded-xl">
                      <span className="text-charcoal-muted">Natural Undertone</span>
                      <p className="font-serif text-xl font-bold text-gold mt-0.5">
                        {user.style_dna.undertone || 'Warm Golden'}
                      </p>
                    </div>

                    <div className="p-3 bg-beige/20 rounded-xl">
                      <span className="text-charcoal-muted">Height</span>
                      <p className="font-serif text-xl font-bold text-charcoal mt-0.5">
                        {user.style_dna.height} cm
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-beige-border p-6 space-y-3">
                  <Ruler className="w-8 h-8 text-charcoal-muted mx-auto" />
                  <p className="font-serif text-lg font-medium text-charcoal">No Fit Profile Saved Yet</p>
                  <p className="text-xs text-charcoal-muted max-w-xs mx-auto">
                    Take our 3-second Fit Finder to save your comfort measurements and unlock exact size recommendations across every silhouette.
                  </p>
                  <button
                    onClick={() => { onOpenFitFinder(); onClose(); }}
                    className="bg-burgundy text-white text-xs font-medium px-5 py-2.5 rounded-full hover:bg-burgundy-hover transition shadow-sm"
                  >
                    Launch Fit Finder
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-beige-border p-6 space-y-2">
                  <Package className="w-8 h-8 text-charcoal-muted mx-auto" />
                  <p className="font-serif text-lg font-medium text-charcoal">No orders placed yet</p>
                  <p className="text-xs text-charcoal-muted">
                    When you order garments, live tracking and Shiprocket AWB updates will appear here.
                  </p>
                </div>
              ) : (
                orders.map((ord) => (
                  <div key={ord.id} className="bg-white p-4 rounded-2xl border border-beige-border space-y-3 shadow-sm">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-charcoal">{ord.id}</span>
                        <p className="text-[11px] text-charcoal-muted">Paid via Razorpay Secure</p>
                      </div>
                      <span className="bg-sage-light text-sage text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {ord.fulfillment_status}
                      </span>
                    </div>

                    <div className="divide-y divide-beige-border text-xs">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="py-2 flex items-center justify-between">
                          <span>{it.name} (Size: {it.size || 'M'})</span>
                          <span className="font-serif font-medium">₹{it.price?.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-beige-border flex items-center justify-between text-xs">
                      <p className="font-serif text-base font-bold text-charcoal">
                        Total: ₹{ord.total_amount?.toLocaleString('en-IN')}
                      </p>
                      <button
                        onClick={() => { onTrackOrder(ord); onClose(); }}
                        className="bg-burgundy hover:bg-burgundy-hover text-white text-xs font-medium px-3.5 py-1.5 rounded-full transition flex items-center space-x-1"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Track Delivery</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: Addresses */}
          {activeTab === 'addresses' && (
            <div className="bg-white p-5 rounded-2xl border border-beige-border space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-beige-border">
                <span className="font-semibold text-charcoal uppercase tracking-wider">Saved Delivery Address</span>
                <span className="bg-sage-light text-sage font-medium px-2 py-0.5 rounded-full">Primary</span>
              </div>
              <p className="text-charcoal font-medium">{user.name}</p>
              <p className="text-charcoal-muted">{user.shipping_address?.street || 'Indiranagar 100ft Road'}</p>
              <p className="text-charcoal-muted">
                {user.shipping_address?.city || 'Bengaluru'}, {user.shipping_address?.state || 'Karnataka'} - {user.shipping_address?.pincode || '560038'}
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
