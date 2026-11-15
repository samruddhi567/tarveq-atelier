import React, { useState } from 'react';
import { X, Palette, Sparkles, Check, Info, ArrowRight, ShieldCheck } from 'lucide-react';
import { Product, User } from '../types';

interface ColourStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePalette: (undertone: string, paletteName: string) => void;
  user: User | null;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const ColourStudioModal: React.FC<ColourStudioModalProps> = ({
  isOpen,
  onClose,
  onSavePalette,
  user,
  products,
  onSelectProduct,
}) => {
  const [selectedUndertone, setSelectedUndertone] = useState<'Warm Golden' | 'Rich Earth' | 'Cool Rose' | 'Neutral Sand'>(
    (user?.style_dna?.undertone as any) || 'Warm Golden'
  );
  const [activeTab, setActiveTab] = useState<'palettes' | 'quiz'>('palettes');

  if (!isOpen) return null;

  const palettes = {
    'Warm Golden': {
      title: 'Warm Golden',
      subtitle: 'Yellow, peachy, and golden undertones common in South Asian complexions.',
      swatches: [
        { name: 'Cambric Terracotta', hex: '#C86D51' },
        { name: 'Banarasi Olive', hex: '#54715F' },
        { name: 'Muted Mustard', hex: '#D4A359' },
        { name: 'Lotus Cream', hex: '#F8F4EC' },
        { name: 'Primary Burgundy', hex: '#7C3031' },
        { name: 'Deep Cinnamon', hex: '#8B4513' },
      ],
      matchingTag: 'Warm',
    },
    'Rich Earth': {
      title: 'Rich Earth / Deep Espresso',
      subtitle: 'Deep espresso, rich caramel, and bronze undertones with natural depth.',
      swatches: [
        { name: 'Deep Espresso', hex: '#29211F' },
        { name: 'Cinnamon Bark', hex: '#A0522D' },
        { name: 'Antique Gold', hex: '#B58C50' },
        { name: 'Sage Green', hex: '#54715F' },
        { name: 'Warm Terracotta', hex: '#7C3031' },
      ],
      matchingTag: 'Deep',
    },
    'Cool Rose': {
      title: 'Cool Rose & Slate',
      subtitle: 'Pink, bluish, and cool neutral undertones with crisp contrast.',
      swatches: [
        { name: 'Charcoal Slate', hex: '#36454F' },
        { name: 'Soft Lavender', hex: '#BDB0D0' },
        { name: 'Dusty Rose', hex: '#DCAEAE' },
        { name: 'Midnight Navy', hex: '#1C2841' },
        { name: 'Alabaster White', hex: '#FDFBF7' },
      ],
      matchingTag: 'Cool',
    },
    'Neutral Sand': {
      title: 'Neutral Sand & Olive',
      subtitle: 'Balanced undertones that harmonize effortlessly with both warm and cool earthy neutrals.',
      swatches: [
        { name: 'Soft Sand', hex: '#E8E0D3' },
        { name: 'Olive Green', hex: '#54715F' },
        { name: 'Burgundy Crimson', hex: '#7C3031' },
        { name: 'Warm Taupe', hex: '#8B8589' },
      ],
      matchingTag: 'Neutral',
    },
  };

  const currentPalette = palettes[selectedUndertone];

  // Matching catalog outfits
  const matchingProducts = products.filter((p) => {
    return (
      p.undertone_suitability.toLowerCase().includes(currentPalette.matchingTag.toLowerCase()) ||
      p.undertone_suitability.toLowerCase().includes('all')
    );
  }).slice(0, 3);

  const handleSave = () => {
    onSavePalette(selectedUndertone, currentPalette.title);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#F8F4EC] w-full max-w-2xl rounded-3xl shadow-modal-luxe border border-beige-border overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 bg-beige/40 border-b border-beige-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-burgundy" />
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-medium text-charcoal">
                TARVEQ Colour Studio
              </h3>
              <p className="text-[11px] text-charcoal-muted font-sans">
                Explore undertone harmonies and curated clothing palettes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-charcoal hover:bg-beige transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 font-sans">
          
          {/* Undertone Selection Tabs */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-charcoal block mb-2">
              Select Your Natural Undertone
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.keys(palettes).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedUndertone(key as any)}
                  className={`p-3 rounded-2xl text-center border transition ${
                    selectedUndertone === key
                      ? 'border-burgundy bg-burgundy-light shadow-sm text-burgundy font-bold'
                      : 'border-beige-border bg-white text-charcoal hover:bg-beige/40'
                  }`}
                >
                  <p className="text-xs">{key}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Palette Details & Swatches */}
          <div className="bg-white p-5 rounded-2xl border border-beige-border space-y-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-burgundy uppercase tracking-wider">
                  Recommended Palette
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-burgundy"></span>
                <span className="text-xs font-medium text-charcoal">{currentPalette.title}</span>
              </div>
              <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                {currentPalette.subtitle}
              </p>
            </div>

            {/* Color Swatches Grid */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-charcoal-muted uppercase tracking-wider font-semibold">
                Curated Color Swatches
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                {currentPalette.swatches.map((swatch, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-2.5 p-2 rounded-xl bg-beige/20 border border-beige-border"
                  >
                    <div
                      className="w-7 h-7 rounded-lg shadow-sm border border-charcoal/10 shrink-0"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-medium text-charcoal truncate">{swatch.name}</p>
                      <p className="text-[10px] text-charcoal-muted font-mono">{swatch.hex}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Matching Collection Outfits */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-charcoal uppercase tracking-wider">
                Matching Outfits in {currentPalette.title}
              </span>
              <span className="text-[11px] text-sage font-medium flex items-center space-x-1">
                <Check className="w-3 h-3" />
                <span>Undertone Harmonized</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {matchingProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => {
                    onSelectProduct(prod);
                    onClose();
                  }}
                  className="bg-white p-3 rounded-2xl border border-beige-border flex sm:flex-col items-center sm:items-start space-x-3 sm:space-x-0 sm:space-y-2 cursor-pointer hover:border-burgundy transition shadow-sm"
                >
                  <img
                    src={prod.image_url}
                    alt={prod.name}
                    className="w-14 h-16 sm:w-full sm:h-36 object-cover rounded-xl"
                  />
                  <div className="overflow-hidden">
                    <p className="font-serif text-sm font-medium text-charcoal line-clamp-1">
                      {prod.name}
                    </p>
                    <p className="text-xs text-charcoal-muted font-sans">
                      ₹{prod.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Honest Disclosure */}
          <div className="bg-beige/40 p-3.5 rounded-2xl border border-beige-border text-xs text-charcoal-muted flex items-start space-x-2.5">
            <Info className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Colour Advisory:</strong> Lighting, phone screens, and seasonal sun exposure naturally affect visual skin tones. These palettes provide proven harmony starting points. Feel free to choose whatever makes you feel confident!
            </p>
          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div className="p-5 bg-beige/40 border-t border-beige-border flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs font-medium text-charcoal-muted hover:text-charcoal px-3 py-2"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="bg-burgundy hover:bg-burgundy-hover text-white text-xs font-medium px-6 py-2.5 rounded-full transition flex items-center space-x-1.5 shadow-md border border-gold/30"
          >
            <Check className="w-4 h-4 text-gold" />
            <span>Save My Palette</span>
          </button>
        </div>

      </div>
    </div>
  );
};
