import React, { useState, useMemo } from 'react';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
}) => {
  const [query, setQuery] = useState('');

  const quickPills = [
    'Cambric Co-ord',
    'Linen Tunic',
    '240 GSM Tee',
    'Zero-Transparency Shirt',
    'Terracotta',
    'Olive',
    'Petite Inseam',
  ];

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.fabric_spec.toLowerCase().includes(q) ||
        p.undertone_suitability.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });
  }, [products, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/70 backdrop-blur-md flex items-start justify-center pt-12 sm:pt-20 px-4 animate-in fade-in duration-200">
      <div className="bg-[#F8F4EC] w-full max-w-2xl rounded-3xl shadow-modal-luxe border border-beige-border overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-beige-border flex items-center space-x-3 bg-white">
          <Search className="w-5 h-5 text-burgundy shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search silhouettes, fabrics, occasions, colours..."
            autoFocus
            className="w-full bg-transparent text-charcoal placeholder-charcoal-muted/60 text-base sm:text-lg font-sans focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-charcoal-muted hover:text-charcoal p-1">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-sans font-medium text-charcoal hover:text-burgundy bg-beige/50 px-3 py-1.5 rounded-full"
          >
            Esc
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        <div className="p-4 bg-beige/30 border-b border-beige-border flex items-center space-x-2 overflow-x-auto text-xs font-sans scrollbar-none">
          <span className="text-charcoal-muted uppercase tracking-wider font-semibold text-[10px] shrink-0">
            Suggested:
          </span>
          {quickPills.map((pill) => (
            <button
              key={pill}
              onClick={() => setQuery(pill)}
              className="px-3 py-1 bg-white hover:bg-beige border border-beige-border rounded-full text-charcoal transition shrink-0"
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Search Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-5 space-y-3">
          {!query.trim() ? (
            <div className="text-center py-12 text-charcoal-muted space-y-2">
              <p className="font-serif text-lg text-charcoal">What are you looking for today?</p>
              <p className="text-xs font-sans max-w-sm mx-auto">
                Search our breathable cambric sets, linen tunics, heavyweight tees, or zero-sheer modest shirts.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <p className="font-serif text-lg text-charcoal">No outfits found for "{query}"</p>
              <p className="text-xs text-charcoal-muted font-sans">
                Try searching for "Co-ord", "Linen", "Cotton", or "Trousers".
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <p className="text-[11px] text-charcoal-muted uppercase tracking-wider font-semibold font-sans">
                Matching Outfits ({results.length})
              </p>
              {results.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => {
                    onSelectProduct(prod);
                    onClose();
                  }}
                  className="bg-white hover:bg-beige/40 p-3 rounded-2xl border border-beige-border flex items-center space-x-3.5 cursor-pointer transition group shadow-sm"
                >
                  <div className="w-14 h-16 rounded-xl overflow-hidden bg-beige shrink-0">
                    <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-base font-medium text-charcoal group-hover:text-burgundy transition">
                        {prod.name}
                      </h4>
                      <span className="font-serif text-base font-medium text-charcoal">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-muted font-sans line-clamp-1 mt-0.5">
                      {prod.fabric_spec} • {prod.undertone_suitability}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-charcoal-muted group-hover:text-burgundy group-hover:translate-x-1 transition" />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
