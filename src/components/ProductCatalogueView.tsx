import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X, ArrowUpDown, Sparkles, Check, RotateCcw } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ProductCatalogueViewProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, size?: string) => void;
  onBuyNow?: (product: Product, size?: string) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: string[];
  userFitSize?: string | null;
  initialCategory?: string;
}

export const ProductCatalogueView: React.FC<ProductCatalogueViewProps> = ({
  products,
  onSelectProduct,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  wishlistIds,
  userFitSize,
  initialCategory = 'All',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedPriceRange, setSelectedPriceRange] = useState('All');
  const [selectedSize, setSelectedSize] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');
  const [selectedFabric, setSelectedFabric] = useState('All');
  const [selectedFitType, setSelectedFitType] = useState('All');
  const [selectedModesty, setSelectedModesty] = useState('All');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'newest'>('recommended');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const categories = ['All', 'Co-ord Set', 'Shirt', 'Tunic', 'Tee', 'Trousers'];
  const fabrics = ['All', 'Cambric Cotton', 'Linen-Blend', 'Heavyweight 240 GSM', 'Poplin'];
  const colors = ['All', 'Warm Golden', 'Olive', 'Espresso', 'Ivory', 'Cinnamon', 'Charcoal'];
  const fits = ['All', 'Slim Fit', 'Regular Fit', 'Relaxed Fit', 'Oversized Fit'];

  // Filter & Search Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q);
        const matchesFabric = p.fabric_spec.toLowerCase().includes(q);
        const matchesUndertone = p.undertone_suitability.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        if (!matchesName && !matchesCategory && !matchesFabric && !matchesUndertone && !matchesDesc) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== 'All' && !p.category.toLowerCase().includes(selectedCategory.toLowerCase())) {
        return false;
      }

      // Price Range
      if (selectedPriceRange === 'under-1000' && p.price >= 1000) return false;
      if (selectedPriceRange === '1000-1500' && (p.price < 1000 || p.price > 1500)) return false;
      if (selectedPriceRange === 'above-1500' && p.price <= 1500) return false;

      // Color / Undertone
      if (selectedColor !== 'All' && !p.undertone_suitability.toLowerCase().includes(selectedColor.toLowerCase())) {
        return false;
      }

      // Fabric
      if (selectedFabric !== 'All' && !p.fabric_spec.toLowerCase().includes(selectedFabric.toLowerCase())) {
        return false;
      }

      // Modest Fashion Filter
      if (selectedModesty === 'opaque' && !p.fabric_opacity.toLowerCase().includes('100%')) return false;
      if (selectedModesty === 'modest-collar' && !p.description.toLowerCase().includes('collar') && !p.name.toLowerCase().includes('shirt')) return false;

      // In Stock
      if (inStockOnly && p.is_sold_out) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'newest') return (b.price % 3) - (a.price % 3);
      return b.aiMatchScore - a.aiMatchScore;
    });
  }, [products, searchQuery, selectedCategory, selectedPriceRange, selectedColor, selectedFabric, selectedModesty, inStockOnly, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedPriceRange('All');
    setSelectedSize('All');
    setSelectedColor('All');
    setSelectedFabric('All');
    setSelectedFitType('All');
    setSelectedModesty('All');
    setInStockOnly(false);
    setSortBy('recommended');
  };

  const hasActiveFilters =
    searchQuery ||
    selectedCategory !== 'All' ||
    selectedPriceRange !== 'All' ||
    selectedColor !== 'All' ||
    selectedFabric !== 'All' ||
    selectedModesty !== 'All' ||
    inStockOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      
      {/* 1. Page Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-beige-border">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-widest text-burgundy font-medium mb-1">
            <span>Atelier Collection</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-charcoal">
            The Complete Collection
          </h1>
          <p className="text-sm text-charcoal-muted mt-1 font-sans">
            Every garment tailored with zero-sheer opaque fabrics, custom inseams, and Indian undertone calibration.
          </p>
        </div>

        {/* Search Bar Input */}
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, fabric, colour..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#E8E0D3]/40 border border-beige-border text-sm text-charcoal placeholder-charcoal-muted/60 focus:outline-none focus:border-burgundy focus:bg-white transition"
          />
          <Search className="w-4 h-4 text-charcoal-muted absolute left-3.5 top-3" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3 text-charcoal-muted hover:text-charcoal"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Horizontal Category Filter Chips & Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-burgundy text-white shadow-sm'
                  : 'bg-beige/50 text-charcoal hover:bg-beige border border-beige-border'
              }`}
            >
              {cat === 'All' ? 'All Silhouettes' : cat}
            </button>
          ))}
        </div>

        {/* Right Tools: Filter Drawer Trigger & Sort Dropdown */}
        <div className="flex items-center space-x-3 self-end sm:self-auto">
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="flex items-center space-x-1.5 bg-beige/60 hover:bg-beige text-charcoal text-xs font-medium px-3.5 py-1.5 rounded-full border border-beige-border transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-burgundy" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-burgundy"></span>
            )}
          </button>

          <div className="flex items-center space-x-1.5 bg-beige/60 border border-beige-border rounded-full px-3 py-1.5 text-xs text-charcoal">
            <ArrowUpDown className="w-3.5 h-3.5 text-charcoal-muted" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-charcoal text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="recommended">Recommended Fit</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">New Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Active Filter Pills Strip */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-charcoal-muted font-medium">Active filters:</span>
          {searchQuery && (
            <span className="bg-white border border-beige-border text-charcoal px-2.5 py-0.5 rounded-full flex items-center space-x-1">
              <span>"{searchQuery}"</span>
              <button onClick={() => setSearchQuery('')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {selectedCategory !== 'All' && (
            <span className="bg-white border border-beige-border text-charcoal px-2.5 py-0.5 rounded-full flex items-center space-x-1">
              <span>{selectedCategory}</span>
              <button onClick={() => setSelectedCategory('All')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {selectedPriceRange !== 'All' && (
            <span className="bg-white border border-beige-border text-charcoal px-2.5 py-0.5 rounded-full flex items-center space-x-1">
              <span>Price Range</span>
              <button onClick={() => setSelectedPriceRange('All')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {selectedColor !== 'All' && (
            <span className="bg-white border border-beige-border text-charcoal px-2.5 py-0.5 rounded-full flex items-center space-x-1">
              <span>{selectedColor}</span>
              <button onClick={() => setSelectedColor('All')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {selectedFabric !== 'All' && (
            <span className="bg-white border border-beige-border text-charcoal px-2.5 py-0.5 rounded-full flex items-center space-x-1">
              <span>{selectedFabric}</span>
              <button onClick={() => setSelectedFabric('All')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {inStockOnly && (
            <span className="bg-white border border-beige-border text-charcoal px-2.5 py-0.5 rounded-full flex items-center space-x-1">
              <span>In Stock Only</span>
              <button onClick={() => setInStockOnly(false)}><X className="w-3 h-3" /></button>
            </span>
          )}
          <button
            onClick={resetFilters}
            className="text-burgundy hover:underline font-medium ml-2 flex items-center space-x-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset all</span>
          </button>
        </div>
      )}

      {/* 4. Products Count Indicator */}
      <div className="flex items-center justify-between text-xs text-charcoal-muted font-sans">
        <span>Showing {filteredProducts.length} of {products.length} bespoke outfits</span>
        {userFitSize && (
          <span className="text-sage font-medium flex items-center space-x-1">
            <Check className="w-3.5 h-3.5" />
            <span>Calibrated for size {userFitSize}</span>
          </span>
        )}
      </div>

      {/* 5. Product Grid (3-to-4 Columns) */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-beige/20 rounded-3xl p-8 border border-beige-border space-y-4">
          <p className="font-serif text-2xl font-medium text-charcoal">No outfits match your exact filters</p>
          <p className="text-sm text-charcoal-muted max-w-md mx-auto">
            Try adjusting your search query, clearing price or fabric filters, or reset all filters to view our full collection.
          </p>
          <button
            onClick={resetFilters}
            className="bg-burgundy text-white text-xs font-medium px-5 py-2.5 rounded-full hover:bg-burgundy-hover transition shadow-sm"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
              onAddToCart={onAddToCart}
              onBuyNow={onBuyNow}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={wishlistIds.includes(product.id)}
              recommendedSize={userFitSize}
            />
          ))}
        </div>
      )}

      {/* 6. Comprehensive Filter Modal / Drawer */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="bg-[#F8F4EC] w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-200 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-beige-border">
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="w-4 h-4 text-burgundy" />
                  <h3 className="font-serif text-2xl font-medium text-charcoal">Filter Atelier</h3>
                </div>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-1.5 rounded-full hover:bg-beige text-charcoal transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-2.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-charcoal font-sans">
                  Price Range
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                  {[
                    { label: 'All Prices', val: 'All' },
                    { label: 'Under ₹1,000', val: 'under-1000' },
                    { label: '₹1,000 - ₹1,500', val: '1000-1500' },
                    { label: 'Above ₹1,500', val: 'above-1500' },
                  ].map((pr) => (
                    <button
                      key={pr.val}
                      onClick={() => setSelectedPriceRange(pr.val)}
                      className={`p-2 rounded-xl text-left border transition ${
                        selectedPriceRange === pr.val
                          ? 'border-burgundy bg-burgundy-light text-burgundy font-medium'
                          : 'border-beige-border bg-white/70 text-charcoal hover:bg-white'
                      }`}
                    >
                      {pr.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fabric Type */}
              <div className="space-y-2.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-charcoal font-sans">
                  Fabric & Craft
                </label>
                <div className="flex flex-wrap gap-2 text-xs">
                  {fabrics.map((f) => (
                    <button
                      key={f}
                      onClick={() => setSelectedFabric(f)}
                      className={`px-3 py-1.5 rounded-full border transition ${
                        selectedFabric === f
                          ? 'border-burgundy bg-burgundy text-white font-medium'
                          : 'border-beige-border bg-white/70 text-charcoal hover:bg-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Undertone */}
              <div className="space-y-2.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-charcoal font-sans">
                  Undertone & Palette
                </label>
                <div className="flex flex-wrap gap-2 text-xs">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-3 py-1.5 rounded-full border transition ${
                        selectedColor === c
                          ? 'border-gold bg-gold text-white font-medium'
                          : 'border-beige-border bg-white/70 text-charcoal hover:bg-white'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modest Fashion Specifications */}
              <div className="space-y-2.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-charcoal font-sans">
                  Modest Fashion Details
                </label>
                <div className="space-y-2 text-xs">
                  <button
                    onClick={() => setSelectedModesty(selectedModesty === 'opaque' ? 'All' : 'opaque')}
                    className={`w-full p-2.5 rounded-xl text-left border transition flex items-center justify-between ${
                      selectedModesty === 'opaque'
                        ? 'border-sage bg-sage-light text-sage font-medium'
                        : 'border-beige-border bg-white/70 text-charcoal'
                    }`}
                  >
                    <span>100% Zero-Sheer Opaque Certified</span>
                    {selectedModesty === 'opaque' && <Check className="w-4 h-4 text-sage" />}
                  </button>
                  <button
                    onClick={() => setSelectedModesty(selectedModesty === 'modest-collar' ? 'All' : 'modest-collar')}
                    className={`w-full p-2.5 rounded-xl text-left border transition flex items-center justify-between ${
                      selectedModesty === 'modest-collar'
                        ? 'border-sage bg-sage-light text-sage font-medium'
                        : 'border-beige-border bg-white/70 text-charcoal'
                    }`}
                  >
                    <span>High Modest Neckline & Collars</span>
                    {selectedModesty === 'modest-collar' && <Check className="w-4 h-4 text-sage" />}
                  </button>
                </div>
              </div>

              {/* In Stock Toggle */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-charcoal uppercase tracking-wider">In Stock Only</span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 accent-burgundy cursor-pointer"
                />
              </div>

            </div>

            {/* Bottom Drawer Actions */}
            <div className="pt-6 border-t border-beige-border flex gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 py-2.5 text-xs font-medium text-charcoal-muted hover:text-charcoal bg-beige/40 rounded-full transition"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="flex-[2] py-2.5 text-xs font-medium bg-burgundy hover:bg-burgundy-hover text-white rounded-full transition shadow-md"
              >
                Show {filteredProducts.length} Results
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
