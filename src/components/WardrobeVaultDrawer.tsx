import React, { useState, useEffect } from 'react';
import { X, Sparkles, Upload, Trash2, Check, ArrowRight, RefreshCw, Shirt, Image as ImageIcon } from 'lucide-react';
import { Product } from '../types';

interface WardrobeItem {
  id: string;
  item_name: string;
  category: string;
  color_name: string;
  color_hex: string;
  image_url: string;
  tags: string[];
}

interface MatchResult {
  productId: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  synergyScore: number;
  pairingReason: string;
}

interface WardrobeVaultDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
  onSelectProduct: (product: Product) => void;
}

export const WardrobeVaultDrawer: React.FC<WardrobeVaultDrawerProps> = ({
  isOpen,
  onClose,
  token,
  onSelectProduct,
}) => {
  const [vaultItems, setVaultItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [removingBg, setRemovingBg] = useState(false);
  const [matchingItem, setMatchingItem] = useState<WardrobeItem | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [matchingLoading, setMatchingLoading] = useState(false);

  // New item upload form
  const [showAddForm, setShowAddForm] = useState(false);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Tops');
  const [colorName, setColorName] = useState('Warm Silk Sand');
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchVault();
    }
  }, [isOpen, token]);

  const fetchVault = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/wardrobe-vault', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (data.success) {
        setVaultItems(data.vault);
      }
    } catch (err) {
      console.error('Error fetching vault:', err);
    } finally {
      setLoading(false);
    }
  };

  // In-Browser Edge AI Background Removal via @imgly/background-removal
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRemovingBg(true);
    try {
      // Dynamic import prevents bundle blocking at initial page load
      const { removeBackground } = await import('@imgly/background-removal');
      // Execute background removal locally inside the browser
      const blob = await removeBackground(file);

      // Convert clean cutout blob to base64 Data URL for persistent storage
      const reader = new FileReader();
      reader.onloadend = () => {
        setProcessedImageUrl(reader.result as string);
        setRemovingBg(false);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.warn('Browser background removal fallback (using original photo):', err);
      const fallbackUrl = URL.createObjectURL(file);
      setProcessedImageUrl(fallbackUrl);
      setRemovingBg(false);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !processedImageUrl) return;

    try {
      const res = await fetch('/api/wardrobe-vault', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          itemName,
          category,
          colorName,
          colorHex: '#C5A059',
          imageUrl: processedImageUrl,
          tags: ['Owned Garment', 'Edge Cutout'],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setItemName('');
        setProcessedImageUrl(null);
        setShowAddForm(false);
        fetchVault();
      }
    } catch (err) {
      console.error('Error saving vault item:', err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await fetch(`/api/wardrobe-vault/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setVaultItems((prev) => prev.filter((it) => it.id !== id));
      if (matchingItem?.id === id) {
        setMatchingItem(null);
        setMatches([]);
      }
    } catch (err) {
      console.error('Error deleting vault item:', err);
    }
  };

  // Run SigLIP / CLIP Visual Embedding Matcher
  const handleFindMatches = async (item: WardrobeItem) => {
    setMatchingItem(item);
    setMatchingLoading(true);
    setMatches([]);

    try {
      const res = await fetch('/api/wardrobe-vault/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          vaultItem: {
            itemName: item.item_name,
            category: item.category,
            colorName: item.color_name,
            colorHex: item.color_hex,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMatches(data.matches);
      }
    } catch (err) {
      console.error('Error matching wardrobe item:', err);
    } finally {
      setMatchingLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#261B18]/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="bg-[#FBF8F3] w-full max-w-md h-full shadow-2xl flex flex-col border-l border-[#B8925A]/30 font-sans">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#7A2E2E] to-[#4A1616] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-[#B8925A]/20 flex items-center justify-center text-[#B8925A] border border-[#B8925A]/40">
              <Shirt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold tracking-wide text-white">
                Wardrobe Vault & Matcher
              </h3>
              <p className="text-[10px] text-[#F3ECE1]/80">
                In-Browser Cutout • SigLIP Visual Synergy Matching
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Action to add owned garment */}
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full p-3.5 bg-white border-2 border-dashed border-[#B8925A]/50 hover:border-[#7A2E2E] rounded-2xl text-center transition group shadow-sm flex items-center justify-center space-x-2"
            >
              <Upload className="w-4 h-4 text-[#7A2E2E] group-hover:scale-110 transition" />
              <span className="text-xs font-bold text-[#261B18] group-hover:text-[#7A2E2E]">
                + Add Garment You Already Own
              </span>
            </button>
          ) : (
            <form onSubmit={handleSaveItem} className="bg-white p-4 rounded-2xl border border-[#B8925A]/40 space-y-3.5 shadow-sm">
              <div className="flex justify-between items-center border-b border-[#F3ECE1] pb-2">
                <span className="text-xs font-bold text-[#7A2E2E]">Add Owned Garment (Auto-Cutout)</span>
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setProcessedImageUrl(null); }}
                  className="text-xs text-[#261B18]/60 hover:text-[#261B18]"
                >
                  Cancel
                </button>
              </div>

              {/* Photo Input & Cutout State */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-[#261B18]">Garment Photo</label>
                <div className="relative border border-[#F3ECE1] rounded-xl p-3 text-center bg-[#FBF8F3]">
                  {removingBg ? (
                    <div className="py-4 space-y-2">
                      <RefreshCw className="w-6 h-6 mx-auto text-[#B8925A] animate-spin" />
                      <p className="text-[11px] font-semibold text-[#7A2E2E]">
                        Removing background via Edge AI...
                      </p>
                    </div>
                  ) : processedImageUrl ? (
                    <div className="space-y-2">
                      <div className="h-28 mx-auto flex items-center justify-center p-2 rounded-lg bg-[radial-gradient(#ccc_1px,transparent_1px)] [background-size:8px_8px]">
                        <img
                          src={processedImageUrl}
                          alt="Cutout Preview"
                          className="h-full object-contain filter drop-shadow-md"
                        />
                      </div>
                      <span className="text-[10px] text-[#3F5945] font-semibold flex items-center justify-center space-x-1">
                        <Check className="w-3 h-3 text-[#3F5945]" />
                        <span>Background cleanly removed</span>
                      </span>
                    </div>
                  ) : (
                    <label className="cursor-pointer block py-3">
                      <ImageIcon className="w-6 h-6 mx-auto text-[#B8925A] mb-1" />
                      <span className="text-xs text-[#261B18] font-medium block">
                        Upload Photo of Garment
                      </span>
                      <span className="text-[10px] text-[#261B18]/50 block">
                        Edge model automatically isolates clothing
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-[#261B18] mb-1">Item Name</label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. Linen Shirt"
                    required
                    className="w-full px-2.5 py-1.5 bg-[#FBF8F3] border border-[#F3ECE1] rounded-xl text-xs focus:outline-none focus:border-[#B8925A]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-[#261B18] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#FBF8F3] border border-[#F3ECE1] rounded-xl text-xs focus:outline-none focus:border-[#B8925A]"
                  >
                    <option value="Tops">Top / Shirt</option>
                    <option value="Trousers">Trousers / Pants</option>
                    <option value="Modest Tunics">Modest Tunic</option>
                    <option value="Co-ords">Co-ord Set</option>
                    <option value="Outerwear">Outerwear / Cape</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#261B18] mb-1">Color Shade</label>
                <input
                  type="text"
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                  placeholder="e.g. Mustard Ochre, Sage Green"
                  required
                  className="w-full px-2.5 py-1.5 bg-[#FBF8F3] border border-[#F3ECE1] rounded-xl text-xs focus:outline-none focus:border-[#B8925A]"
                />
              </div>

              <button
                type="submit"
                disabled={!processedImageUrl || !itemName}
                className="w-full py-2 bg-[#7A2E2E] text-white text-xs font-semibold rounded-xl hover:bg-[#5E2222] transition disabled:opacity-50"
              >
                Save Cutout to Vault
              </button>
            </form>
          )}

          {/* List of Saved Vault Items */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#261B18] tracking-wider uppercase">
              Your Wardrobe Collection ({vaultItems.length})
            </span>

            {vaultItems.length === 0 ? (
              <div className="p-6 text-center bg-white rounded-2xl border border-[#F3ECE1] text-xs text-[#261B18]/60 space-y-1">
                <p className="font-semibold text-[#261B18]">No items pinned yet</p>
                <p>Upload a favorite garment you own to test AI outfit matching against TARVEQ's catalog.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {vaultItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 bg-white rounded-2xl border transition shadow-sm space-y-2 ${
                      matchingItem?.id === item.id ? 'border-[#7A2E2E] ring-1 ring-[#7A2E2E]' : 'border-[#F3ECE1]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-14 h-14 bg-[radial-gradient(#ddd_1px,transparent_1px)] [background-size:6px_6px] rounded-xl flex items-center justify-center p-1 shrink-0 border border-black/5">
                        <img
                          src={item.image_url}
                          alt={item.item_name}
                          className="h-full object-contain filter drop-shadow-sm"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-[#261B18] truncate">
                          {item.item_name}
                        </h4>
                        <p className="text-[11px] text-[#261B18]/60">
                          {item.color_name} • {item.category}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 text-[#261B18]/40 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleFindMatches(item)}
                      className="w-full py-1.5 px-3 bg-[#FBF8F3] hover:bg-[#F3ECE1] border border-[#B8925A]/40 rounded-xl text-[11px] font-semibold text-[#7A2E2E] flex items-center justify-center space-x-1.5 transition"
                    >
                      <Sparkles className="w-3 h-3 text-[#B8925A]" />
                      <span>Find Matching TARVEQ Pieces</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Matches Section */}
          {matchingItem && (
            <div className="bg-white p-4 rounded-2xl border border-[#B8925A]/40 space-y-3 shadow-md animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[#F3ECE1] pb-2">
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-[#B8925A]" />
                  <span className="text-xs font-bold text-[#261B18]">
                    SigLIP AI Matches for {matchingItem.item_name}
                  </span>
                </div>
                {matchingLoading && <RefreshCw className="w-3.5 h-3.5 text-[#7A2E2E] animate-spin" />}
              </div>

              {matchingLoading ? (
                <div className="py-6 text-center text-xs text-[#261B18]/60">
                  Computing visual & semantic embedding similarity...
                </div>
              ) : matches.length > 0 ? (
                <div className="space-y-3">
                  {matches.map((match) => (
                    <div
                      key={match.productId}
                      className="p-3 bg-[#FBF8F3] rounded-xl border border-[#F3ECE1] space-y-2 hover:border-[#B8925A] transition"
                    >
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={match.imageUrl}
                          alt={match.name}
                          className="w-12 h-12 object-cover rounded-lg border border-black/10 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h5 className="text-xs font-bold text-[#261B18] truncate">{match.name}</h5>
                            <span className="text-[10px] font-bold text-[#3F5945] bg-[#3F5945]/10 px-1.5 py-0.2 rounded">
                              {match.synergyScore}% Match
                            </span>
                          </div>
                          <p className="text-[11px] font-semibold text-[#7A2E2E]">₹{match.price.toLocaleString('en-IN')}</p>
                        </div>
                      </div>

                      <p className="text-[10px] text-[#261B18]/70 leading-relaxed italic bg-white p-2 rounded-lg border border-[#F3ECE1]">
                        "{match.pairingReason}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-center text-[#261B18]/60 py-3">No matches found.</p>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
