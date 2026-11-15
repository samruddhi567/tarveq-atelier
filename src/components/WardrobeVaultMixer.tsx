import React, { useState } from 'react';
import { Shirt, Sparkles, Check, Plus, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { Product, User, WardrobeVaultItem } from '../types';

interface WardrobeVaultMixerProps {
  user: User | null;
  vaultItems: WardrobeVaultItem[];
  products: Product[];
  onOrderCapsule: (items: Product[], customTailoring?: any) => void;
  onOpenScan: () => void;
  onAddNewVaultItem: (item: Partial<WardrobeVaultItem>) => void;
}

export const WardrobeVaultMixer: React.FC<WardrobeVaultMixerProps> = ({
  user,
  vaultItems,
  products,
  onOrderCapsule,
  onOpenScan,
  onAddNewVaultItem,
}) => {
  const [selectedVaultItem, setSelectedVaultItem] = useState<WardrobeVaultItem>(
    vaultItems[0] || null
  );
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([
    products[0]?.id || '',
    products[1]?.id || '',
  ]);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState('Bottoms');

  const selectedProducts = products.filter((p) => selectedProductIds.includes(p.id));

  const toggleProduct = (id: string) => {
    if (selectedProductIds.includes(id)) {
      if (selectedProductIds.length > 1) {
        setSelectedProductIds(selectedProductIds.filter((pId) => pId !== id));
      }
    } else {
      if (selectedProductIds.length < 3) {
        setSelectedProductIds([...selectedProductIds, id]);
      } else {
        setSelectedProductIds([selectedProductIds[1], selectedProductIds[2], id]);
      }
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    onAddNewVaultItem({
      item_name: customName.trim(),
      category: customCategory,
      color_name: 'Custom Palette',
      color_hex: '#B8925A',
      image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80',
      tags: ['Personal Closet', 'Smart Capsule'],
    });
    setCustomName('');
    setIsAddingCustom(false);
  };

  const rawSubtotal = selectedProducts.reduce((sum, p) => sum + p.price, 0);
  const bundleDiscount = Math.round(rawSubtotal * 0.15); // 15% Capsule Discount
  const finalTotal = rawSubtotal - bundleDiscount;
  const synergyScore = selectedProducts.length >= 2 ? 98.6 : 96.2;

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Editorial Studio Intro */}
      <div className="bg-[#F3ECE1] p-6 sm:p-8 rounded-3xl border border-[#E8DFC8] space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#3F5945] animate-pulse"></span>
            <span className="text-[10px] uppercase font-serif font-bold tracking-widest text-[#5C4D48]">
              Wardrobe Vault Mixer Studio
            </span>
          </div>
          <span className="bg-[#7A2E2E] text-[#FBF8F3] text-[10px] font-serif font-bold px-3 py-1 rounded-full flex items-center space-x-1 border border-[#B8925A]">
            <Tag className="w-3 h-3 text-[#B8925A]" />
            <span>Capsule Bundle & Save 15%</span>
          </span>
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#261B18]">
          The Circular Modest Capsule
        </h2>
        <p className="text-xs sm:text-sm text-[#5C4D48] leading-relaxed font-sans max-w-2xl">
          Select an anchor piece already in your closet. Our computer vision engine harmonizes undertones and drape proportions to build 2- or 3-piece modular outfits with an automatic <strong>15% bundle savings</strong>.
        </p>
      </div>

      {/* Step 1: Select Anchor Closet Item */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-base sm:text-lg font-bold text-[#261B18] uppercase tracking-wider flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-[#7A2E2E] text-[#FBF8F3] text-xs font-serif font-bold flex items-center justify-center">
              1
            </span>
            <span>Anchor Item from Your Closet</span>
          </h3>

          <button
            onClick={() => setIsAddingCustom(!isAddingCustom)}
            className="text-xs font-serif font-bold text-[#7A2E2E] flex items-center space-x-1 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Pin Closet Item</span>
          </button>
        </div>

        {/* Add custom closet item form */}
        {isAddingCustom && (
          <form onSubmit={handleAddCustom} className="p-4 bg-white rounded-2xl border border-[#E8DFC8] space-y-3 text-xs font-sans">
            <input
              type="text"
              placeholder="e.g. Existing White Linen Pants"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#E8DFC8] bg-[#FBF8F3] focus:outline-none focus:border-[#7A2E2E] text-[#261B18]"
              required
            />
            <div className="flex items-center justify-between">
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#E8DFC8] bg-[#FBF8F3] text-[#261B18] text-xs font-sans"
              >
                <option value="Bottoms">Bottoms</option>
                <option value="Outerwear">Outerwear</option>
                <option value="Tops">Tops</option>
                <option value="Footwear">Footwear</option>
              </select>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(false)}
                  className="px-3 py-1 text-[#5C4D48]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#7A2E2E] text-white font-serif font-bold rounded-xl shadow-sm border border-[#B8925A]"
                >
                  Save to Vault
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Horizontal scroll of Vault pieces */}
        <div className="flex space-x-3 overflow-x-auto pb-2 pt-1 scrollbar-none">
          {vaultItems.map((item) => {
            const isSelected = selectedVaultItem?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedVaultItem(item)}
                className={`flex-shrink-0 w-36 sm:w-40 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all p-2.5 bg-white flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#7A2E2E] shadow-elevated-luxe bg-[#FAF0F0]'
                    : 'border-[#E8DFC8] hover:border-[#B8925A]'
                }`}
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-[#E7DEC8] mb-2 relative">
                  <img src={item.image_url} alt={item.item_name} className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 bg-[#7A2E2E] text-white rounded-full p-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-[#5C4D48] font-serif uppercase tracking-wider">{item.category}</p>
                  <p className="text-xs font-serif font-bold text-[#261B18] line-clamp-1">{item.item_name}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 2: Mix Brand Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-base sm:text-lg font-bold text-[#261B18] uppercase tracking-wider flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-[#7A2E2E] text-[#FBF8F3] text-xs font-serif font-bold flex items-center justify-center">
              2
            </span>
            <span>Pair with AURA Pieces</span>
          </h3>
          <span className="text-xs text-[#5C4D48] font-serif">Select 1 or 2 matching pieces</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {products.map((prod) => {
            const isSelected = selectedProductIds.includes(prod.id);
            return (
              <div
                key={prod.id}
                onClick={() => toggleProduct(prod.id)}
                className={`rounded-2xl p-2.5 border-2 transition-all cursor-pointer bg-white flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#7A2E2E] shadow-elevated-luxe bg-[#FAF0F0]'
                    : 'border-[#E8DFC8] hover:border-[#B8925A]'
                }`}
              >
                <div className="aspect-[4/5] rounded-xl overflow-hidden bg-[#E7DEC8] mb-2 relative">
                  <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover object-top" />
                  <div className="absolute top-1.5 left-1.5 bg-[#3F5945] text-white text-[9px] font-serif font-bold px-2 py-0.5 rounded-full">
                    {prod.aiMatchScore}% Match
                  </div>
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 bg-[#7A2E2E] text-white rounded-full p-1">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-serif font-bold text-[#261B18] line-clamp-1">{prod.name}</h4>
                  <div className="flex items-baseline space-x-1.5 mt-1 font-serif">
                    <span className="text-sm font-bold text-[#261B18]">₹{prod.price.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-[#5C4D48] line-through">₹{prod.original_price}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 3: Real-Time Capsule Synergy Card & Checkout */}
      <div className="bg-[#F3ECE1] rounded-3xl p-6 sm:p-8 border border-[#E8DFC8] space-y-4 shadow-elevated-luxe">
        <div className="flex items-center justify-between border-b border-[#E8DFC8] pb-3">
          <div>
            <span className="text-[10px] uppercase font-serif font-bold text-[#3F5945] tracking-wider">Algorithmic Balance</span>
            <h3 className="font-serif text-xl font-bold text-[#261B18]">
              Capsule Synergy: {synergyScore}%
            </h3>
          </div>
          <div className="bg-[#3F5945] text-white text-xs font-serif font-bold px-3.5 py-1 rounded-full flex items-center space-x-1 shadow-sm border border-[#93AFA9]/40">
            <Sparkles className="w-3 h-3 text-[#B8925A]" />
            <span>Harmonized Palette</span>
          </div>
        </div>

        {/* Selected Summary */}
        <div className="space-y-1 text-xs font-sans">
          <p className="text-[#5C4D48]">
            Anchored by: <strong className="text-[#261B18]">{selectedVaultItem?.item_name || 'Existing Closet Piece'}</strong>
          </p>
          <p className="text-[#5C4D48]">
            Paired drops: <strong className="text-[#261B18]">{selectedProducts.map((p) => p.name).join(' + ')}</strong>
          </p>
        </div>

        {/* Pricing & 15% Bundle Discount */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8DFC8] space-y-2 text-xs font-sans">
          <div className="flex justify-between text-[#5C4D48]">
            <span>Catalogue Subtotal</span>
            <span>₹{rawSubtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-[#7A2E2E] font-semibold">
            <span>Capsule Bundle Discount (-15%)</span>
            <span>-₹{bundleDiscount.toLocaleString('en-IN')}</span>
          </div>
          <div className="pt-2 border-t border-[#E8DFC8] flex justify-between items-baseline font-bold text-[#261B18]">
            <span className="text-sm font-serif">Final Bundle Total</span>
            <span className="font-serif text-2xl text-[#261B18]">
              ₹{finalTotal.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => onOrderCapsule(selectedProducts)}
          className="w-full bg-[#7A2E2E] hover:bg-[#632323] text-white font-serif tracking-widest uppercase font-bold text-xs py-4 px-6 rounded-xl transition flex items-center justify-center space-x-2 shadow-elevated-luxe border border-[#B8925A] group"
        >
          <Sparkles className="w-4 h-4 text-[#B8925A] group-hover:rotate-12 transition-transform" />
          <span>Checkout Capsule Bundle (Save ₹{bundleDiscount})</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-center text-[10px] text-[#5C4D48] font-serif uppercase tracking-wider">
          Protected by AURA Pre-Dispatch Fit-Gate • Zero-Return Certified
        </p>
      </div>
    </div>
  );
};
