import React, { useState } from 'react';
import { X, Lock, Mail, Phone, User as UserIcon, Shield, Sparkles, ArrowRight, Check } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register' | 'otp'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1-Click Demo Login (Customer or Admin)
  const handleDemoLogin = async (role: 'customer' | 'admin') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Demo login failed');

      localStorage.setItem('tarveq_token', data.token);
      onLoginSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Standard Email / Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('tarveq_token', data.token);
      onLoginSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Standard Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      localStorage.setItem('tarveq_token', data.token);
      onLoginSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Simulated OTP Login (Auto-verifies any 4-digit OTP)
  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError('Please enter a 4-digit verification OTP');
      return;
    }
    // Automatically logs in demo customer on simulated OTP
    handleDemoLogin('customer');
  };

  return (
    <div className="fixed inset-0 z-50 bg-espresso/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-ivory w-full max-w-md rounded-3xl shadow-modal-luxe overflow-hidden border border-sand-border animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-sand p-5 border-b border-sand-border flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2.5">
              <img src="/images/tarveq-crest.png" alt="TARVEQ Crest" className="h-7 w-auto object-contain" />
              <span className="font-serif text-xl tracking-[0.2em] font-bold text-burgundy uppercase leading-none">
                TARVEQ
              </span>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-burgundy bg-burgundy-light px-2 py-0.5 rounded-full border border-burgundy/20">
                SECURE AUTH
              </span>
            </div>
            <p className="text-[11px] text-espresso-soft mt-1">
              Persistent Profile, Shipping Addresses & Style DNA
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-espresso-soft hover:text-espresso hover:bg-sand-border transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Investor Demo Buttons */}
        <div className="p-5 pb-3 bg-sand-light border-b border-sand-border space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-espresso-soft uppercase tracking-wider">
            <span>⚡ Instant Demo Profiles (No Typing)</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin('customer')}
              disabled={loading}
              className="p-2.5 bg-white border border-sand-border rounded-xl hover:border-terracotta text-left transition shadow-sm group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-espresso group-hover:text-terracotta">Customer Demo</span>
                <span className="text-[9px] bg-sand px-1.5 py-0.5 rounded text-espresso-soft">Client</span>
              </div>
              <p className="text-[10px] text-espresso-soft mt-0.5">Ananya Sharma (Demo User)</p>
            </button>

            <button
              onClick={() => handleDemoLogin('admin')}
              disabled={loading}
              className="p-2.5 bg-espresso text-ivory rounded-xl hover:bg-espresso-muted text-left transition shadow-sm group border border-espresso-border"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white group-hover:text-gold-light">Founder Admin</span>
                <span className="text-[9px] bg-terracotta text-white px-1.5 py-0.5 rounded font-bold">Admin</span>
              </div>
              <p className="text-[10px] text-sand-light/80 mt-0.5">Samruddhi & Vikash (Co-Founders)</p>
            </button>
          </div>
        </div>

        {/* Tabs: Login / Register / OTP */}
        <div className="px-5 pt-3 flex border-b border-sand-border text-xs font-medium">
          <button
            onClick={() => { setTab('login'); setError(null); }}
            className={`flex-1 pb-2.5 text-center transition border-b-2 ${
              tab === 'login' ? 'border-terracotta text-terracotta font-bold' : 'border-transparent text-espresso-soft'
            }`}
          >
            Email Login
          </button>
          <button
            onClick={() => { setTab('otp'); setError(null); }}
            className={`flex-1 pb-2.5 text-center transition border-b-2 ${
              tab === 'otp' ? 'border-terracotta text-terracotta font-bold' : 'border-transparent text-espresso-soft'
            }`}
          >
            Mobile OTP
          </button>
          <button
            onClick={() => { setTab('register'); setError(null); }}
            className={`flex-1 pb-2.5 text-center transition border-b-2 ${
              tab === 'register' ? 'border-terracotta text-terracotta font-bold' : 'border-transparent text-espresso-soft'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5">
          {error && (
            <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {tab === 'login' && (
            <form onSubmit={handleEmailLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-espresso uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-espresso-soft absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-sand-border rounded-xl focus:outline-none focus:border-terracotta text-espresso"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-espresso uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-espresso-soft absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-sand-border rounded-xl focus:outline-none focus:border-terracotta text-espresso"
                  />
                </div>
                <div className="mt-1 flex justify-between text-[11px] text-espresso-soft">
                  <span>Demo: password is customer123</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-terracotta text-white font-semibold text-xs py-3 rounded-xl hover:bg-terracotta-hover transition flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In with Email'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {tab === 'otp' && (
            <form onSubmit={handleOtpLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-espresso uppercase tracking-wider mb-1">
                  Mobile Number (India)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-espresso-soft absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-sand-border rounded-xl focus:outline-none focus:border-terracotta text-espresso"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-espresso uppercase tracking-wider mb-1">
                  4-Digit OTP (Simulated Instant Test)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter any 4 digits, e.g. 1234"
                  required
                  className="w-full px-3 py-2.5 text-center text-sm font-mono tracking-widest bg-white border border-sand-border rounded-xl focus:outline-none focus:border-terracotta text-espresso"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-olive text-white font-semibold text-xs py-3 rounded-xl hover:bg-olive-dark transition flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Verify OTP & Sign In</span>
              </button>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-espresso uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Meera Sen"
                  required
                  className="w-full px-3 py-2 text-xs bg-white border border-sand-border rounded-xl focus:outline-none focus:border-terracotta text-espresso"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-espresso uppercase tracking-wider mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="meera@example.com"
                  required
                  className="w-full px-3 py-2 text-xs bg-white border border-sand-border rounded-xl focus:outline-none focus:border-terracotta text-espresso"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-espresso uppercase tracking-wider mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98000 00000"
                  className="w-full px-3 py-2 text-xs bg-white border border-sand-border rounded-xl focus:outline-none focus:border-terracotta text-espresso"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-espresso uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full px-3 py-2 text-xs bg-white border border-sand-border rounded-xl focus:outline-none focus:border-terracotta text-espresso"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-terracotta text-white font-semibold text-xs py-3 rounded-xl hover:bg-terracotta-hover transition flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <span>Create Persistent Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
