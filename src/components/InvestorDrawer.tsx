import React, { useState } from 'react';
import { X, TrendingDown, TrendingUp, DollarSign, ShieldAlert, Award, ChevronRight, Calculator } from 'lucide-react';

interface InvestorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InvestorDrawer: React.FC<InvestorDrawerProps> = ({ isOpen, onClose }) => {
  const [orderVolume, setOrderVolume] = useState<number>(25000);

  if (!isOpen) return null;

  // Real-time financial modeling
  const reverseLogisticsCostPerReturn = 380; // ₹380 per return in India (two-way shipping + restocking + dead stock write-off)
  const d2cReturns = Math.round(orderVolume * 0.352);
  const auraReturns = Math.round(orderVolume * 0.074);
  const preventedReturns = d2cReturns - auraReturns;
  const annualSavingsINR = preventedReturns * reverseLogisticsCostPerReturn;
  const grossMarginBps = 420;
  const aovLiftINR = 570; // ₹2240 vs ₹1670

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[420px] bg-white shadow-2xl border-l border-sand-border flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
      {/* Drawer Header */}
      <div className="bg-espresso text-ivory p-4 flex items-center justify-between border-b border-espresso-border">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-terracotta text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
              Series-A Live Deck
            </span>
            <span className="text-xs text-sand-light/80">Unit Economics Engine</span>
          </div>
          <h2 className="font-serif text-lg font-bold text-white mt-1">
            AURA Atelier Financial OS
          </h2>
        </div>

        <button
          onClick={onClose}
          className="text-sand-light/70 hover:text-white p-1 rounded-full hover:bg-espresso-border transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Body with Metrics */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-ivory/50">
        {/* Core KPI Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* KPI 1: Return Rate */}
          <div className="bg-white p-3.5 rounded-xl border border-sand-border shadow-soft-luxe">
            <div className="flex items-center justify-between text-espresso-soft text-xs">
              <span>Return Rate</span>
              <TrendingDown className="w-4 h-4 text-olive" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="font-serif text-2xl font-bold text-olive">7.4%</span>
              <span className="text-[11px] line-through text-espresso-soft">35.2%</span>
            </div>
            <div className="mt-1 text-[10px] text-olive font-semibold flex items-center">
              <span>-79% reduction vs D2C</span>
            </div>
          </div>

          {/* KPI 2: Gross Margin Lift */}
          <div className="bg-white p-3.5 rounded-xl border border-sand-border shadow-soft-luxe">
            <div className="flex items-center justify-between text-espresso-soft text-xs">
              <span>Gross Margin</span>
              <TrendingUp className="w-4 h-4 text-terracotta" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
              <span className="font-serif text-2xl font-bold text-espresso">+420</span>
              <span className="text-xs font-semibold text-terracotta">bps</span>
            </div>
            <div className="mt-1 text-[10px] text-espresso-soft">
              Zero return bleed
            </div>
          </div>

          {/* KPI 3: AOV Lift */}
          <div className="bg-white p-3.5 rounded-xl border border-sand-border shadow-soft-luxe">
            <div className="flex items-center justify-between text-espresso-soft text-xs">
              <span>AOV (Capsule)</span>
              <DollarSign className="w-4 h-4 text-terracotta" />
            </div>
            <div className="mt-2 flex items-baseline space-x-1.5">
              <span className="font-serif text-2xl font-bold text-espresso">₹2,240</span>
            </div>
            <div className="mt-1 text-[10px] text-terracotta font-semibold">
              +34% via Wardrobe Vault
            </div>
          </div>

          {/* KPI 4: Fit-Gate Pass Rate */}
          <div className="bg-white p-3.5 rounded-xl border border-sand-border shadow-soft-luxe">
            <div className="flex items-center justify-between text-espresso-soft text-xs">
              <span>Fit-Gate Accuracy</span>
              <Award className="w-4 h-4 text-gold" />
            </div>
            <div className="mt-2 flex items-baseline space-x-1.5">
              <span className="font-serif text-2xl font-bold text-espresso">98.9%</span>
            </div>
            <div className="mt-1 text-[10px] text-olive font-semibold">
              First-time right fit
            </div>
          </div>
        </div>

        {/* Live Interactive Financial Simulator */}
        <div className="bg-sand-light p-4 rounded-xl border border-sand-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-espresso">
              <Calculator className="w-4 h-4 text-terracotta" />
              <span>Reverse Logistics Savings Model</span>
            </div>
            <span className="text-xs font-semibold text-terracotta">
              {(orderVolume).toLocaleString('en-IN')} orders/mo
            </span>
          </div>

          <input
            type="range"
            min={5000}
            max={100000}
            step={5000}
            value={orderVolume}
            onChange={(e) => setOrderVolume(Number(e.target.value))}
            className="w-full accent-terracotta cursor-pointer"
          />

          <div className="mt-3 pt-3 border-t border-sand-border flex items-center justify-between">
            <div>
              <p className="text-[11px] text-espresso-soft">Prevented Return Packages</p>
              <p className="text-sm font-bold text-espresso font-serif">
                {preventedReturns.toLocaleString('en-IN')} units
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-espresso-soft">Monthly EBITDA Savings</p>
              <p className="text-base font-bold text-olive font-serif">
                ₹{(annualSavingsINR / 100000).toFixed(1)} Lakhs
              </p>
            </div>
          </div>
        </div>

        {/* The 4 Series-A Investment Pillars */}
        <div className="space-y-3">
          <h3 className="font-serif text-sm font-bold text-espresso">
            Core Technological Moats
          </h3>

          <div className="p-3 bg-white rounded-lg border border-sand-border space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-terracotta"></span>
              <h4 className="text-xs font-bold text-espresso">
                1. South Asian Complexion Spectrophotometer
              </h4>
            </div>
            <p className="text-[11px] text-espresso-soft pl-3.5">
              Normalizes camera white-balance against Indian undertones (Warm Golden, Olive, Deep Espresso). Zero color-clash returns.
            </p>
          </div>

          <div className="p-3 bg-white rounded-lg border border-sand-border space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-olive"></span>
              <h4 className="text-xs font-bold text-espresso">
                2. Computer Vision Modesty & Ease Calibration
              </h4>
            </div>
            <p className="text-[11px] text-espresso-soft pl-3.5">
              Calculates anatomical shoulder drop and waist-to-hip curve (0.72 average) to eliminate gaping in modest silhouettes.
            </p>
          </div>

          <div className="p-3 bg-white rounded-lg border border-sand-border space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
              <h4 className="text-xs font-bold text-espresso">
                3. Mandatory Checkout Fit-Gate
              </h4>
            </div>
            <p className="text-[11px] text-espresso-soft pl-3.5">
              Guarantees zero blind sizing guesses. Converts 92% of guest traffic into high-intent calibrated shoppers.
            </p>
          </div>

          <div className="p-3 bg-white rounded-lg border border-sand-border space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-espresso"></span>
              <h4 className="text-xs font-bold text-espresso">
                4. Circular "Wardrobe Vault" Outfit Engine
              </h4>
            </div>
            <p className="text-[11px] text-espresso-soft pl-3.5">
              Pairs new drops with clothes already in the customer's closet, creating 15% capsule bundle discounts and repeat LTV.
            </p>
          </div>
        </div>

        {/* Pitch Closing Note */}
        <div className="p-3.5 bg-olive-light rounded-xl border border-olive-border text-olive-dark text-xs space-y-1">
          <div className="font-bold flex items-center space-x-1.5">
            <ShieldAlert className="w-4 h-4 text-olive" />
            <span>Targeting $10.2B Indian Modest Market</span>
          </div>
          <p className="text-[11px] leading-relaxed text-olive-dark/80">
            By shifting from generic vanity sizing (S/M/L) to algorithmic biometric tailoring, AURA turns the costliest D2C problem (35% returns) into our greatest margin advantage.
          </p>
        </div>
      </div>
    </div>
  );
};
