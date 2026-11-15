import React, { useState } from 'react';
import { FolderHeart, Plus, Trash2, Sparkles, Check, ArrowRight, ShoppingBag, X } from 'lucide-react';
import { Product, User, WardrobeVaultItem } from '../types';

interface DigitalWardrobeViewProps {
  user: User | null;
  vaultItems: WardrobeVaultItem[];
  products: Product[];
  onAddNewVaultItem: (item: Partial<WardrobeVaultItem>) => void;
  onDeleteVaultItem: (id: string) => void;
  onAddToCart: (product: Product, size?: string) => void;
  onOrderCapsule: (items: Product[]) => void;
  userFitSize?: string | null;
}

export const DigitalWardrobeView: React.FC<DigitalWardrobeViewProps> = ({
  user,
  vaultItems,
  products,
  onAddNewVaultItem,
  onDeleteVaultItem,
  onAddToCart,
  onOrderCapsule,
  userFitSize,
}) => {
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVaultItem, setSelectedVaultItem] = useState<WardrobeVaultItem | null>(vaultItems[0] || null);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([
    products[0]?.id || '',
    products[1]?.id || '',
  ]);

  // Add Item Form State
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Tops');
  const [newItemColor, setNewItemColor] = useState('Ivory');
  const [newItemFabric, setNewItemFabric] = useState('Cotton');
  const [newItemImage, setNewItemImage] = useState('');

  const categories = ['All', 'Tops', 'Shirts', 'Trousers', 'Jeans', 'Dresses', 'Kurtas', 'Co-ords', 'Footwear'];

  const filteredVaultItems = vaultItems.filter((item) => {
    if (selectedCategoryTab === 'All') return true;
    return item.category.toLowerCase().includes(selectedCategoryTab.toLowerCase());
  });

  const selectedProducts = products.filter((p) => selectedProductIds.includes(p.id));
  const subtotal = selectedProducts.reduce((sum, p) => sum + p.price, 0);
  const capsuleDiscount = Math.round(subtotal * 0.15);
  const finalCapsulePrice = subtotal - capsuleDiscount;

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

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    onAddNewVaultItem({
      item_name: newItemName.trim(),
      category: newItemCategory,
      color_name: newItemColor,
      color_hex: '#B58C50',
      image_url:
        newItemImage.trim() ||
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80',
      tags: [newItemFabric, 'Personal Closet'],
    });

    setNewItemName('');
    setNewItemImage('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-beige-border">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-widest text-burgundy font-medium mb-1 font-sans">
            <FolderHeart className="w-3.5 h-3.5 text-gold" />
            <span>Smart Closet Organiser</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-charcoal">
            My TARVEQ Wardrobe
          </h1>
          <p className="text-sm text-charcoal-muted mt-1 font-sans">
            Digitize your personal clothes and discover seamless outfit combinations with new TARVEQ atelier pieces.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="self-start md:self-auto bg-burgundy hover:bg-burgundy-hover text-white text-xs sm:text-sm font-sans font-medium py-2.5 px-5 rounded-full transition shadow-md flex items-center space-x-1.5 border border-gold/30"
        >
          <Plus className="w-4 h-4 text-gold" />
          <span>Add Piece to Wardrobe</span>
        </button>
      </div>

      {/* 2. Category Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategoryTab(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-sans font-medium whitespace-nowrap transition ${
              selectedCategoryTab === cat
                ? 'bg-burgundy text-white shadow-sm'
                : 'bg-beige/50 text-charcoal hover:bg-beige border border-beige-border'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. Personal Wardrobe Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-charcoal-muted font-sans">
          <span>Personal Pieces ({filteredVaultItems.length})</span>
          <span className="text-gold font-medium">Click an item to pair with TARVEQ collection</span>
        </div>

        {filteredVaultItems.length === 0 ? (
          <div className="text-center py-16 bg-beige/20 rounded-3xl p-8 border border-beige-border space-y-3">
            <p className="font-serif text-xl font-medium text-charcoal">No pieces saved in this category</p>
            <p className="text-xs text-charcoal-muted max-w-sm mx-auto font-sans">
              Add your existing trousers, skirts, or blazers to see how they coordinate with TARVEQ cambric tunics and co-ords.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-burgundy text-white text-xs font-sans font-medium px-5 py-2.5 rounded-full hover:bg-burgundy-hover transition shadow-sm"
            >
              Add First Piece
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {filteredVaultItems.map((item) => {
              const isSelected = selectedVaultItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedVaultItem(item)}
                  className={`relative bg-white rounded-2xl p-2.5 border transition cursor-pointer group shadow-sm flex flex-col justify-between ${
                    isSelected
                      ? 'border-burgundy ring-2 ring-burgundy/20 bg-burgundy-light/20'
                      : 'border-beige-border hover:border-gold'
                  }`}
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-beige mb-2 relative">
                    <img src={item.image_url} alt={item.item_name} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute top-1.5 left-1.5 bg-burgundy text-white p-1 rounded-full shadow">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteVaultItem(item.id);
                      }}
                      className="absolute top-1.5 right-1.5 bg-charcoal/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-burgundy"
                      title="Delete item"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  <div>
                    <span className="text-[10px] text-charcoal-muted uppercase tracking-wider font-sans">
                      {item.category}
                    </span>
                    <p className="font-serif text-sm font-medium text-charcoal truncate">
                      {item.item_name}
                    </p>
                    <p className="text-[11px] text-charcoal-muted font-sans mt-0.5">
                      {item.color_name}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Interactive Capsule Outfit Mixer with TARVEQ (15% Capsule Discount) */}
      {selectedVaultItem && (
        <div className="bg-[#E8E0D3]/40 border border-beige-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-soft-luxe font-sans">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-beige-border gap-2">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs uppercase tracking-widest text-burgundy font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span>Pair with TARVEQ Collection</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-medium text-charcoal mt-0.5">
                Styling "{selectedVaultItem.item_name}"
              </h3>
            </div>

            <div className="bg-gold text-white font-serif text-xs uppercase tracking-wider font-semibold px-3 py-1.5 rounded-full shadow-sm self-start sm:self-auto">
              15% Capsule Discount Active
            </div>
          </div>

          <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed">
            Select up to 3 complementary TARVEQ garments below to complete your capsule wardrobe with an automatic 15% styling bundle discount.
          </p>

          {/* Selectable TARVEQ Outfits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {products.map((prod) => {
              const isPicked = selectedProductIds.includes(prod.id);
              return (
                <div
                  key={prod.id}
                  onClick={() => toggleProduct(prod.id)}
                  className={`bg-white p-3.5 rounded-2xl border transition cursor-pointer flex space-x-3 items-center shadow-sm ${
                    isPicked
                      ? 'border-burgundy ring-2 ring-burgundy/20 bg-burgundy-light/10'
                      : 'border-beige-border hover:bg-beige/20'
                  }`}
                >
                  <img
                    src={prod.image_url}
                    alt={prod.name}
                    className="w-16 h-20 object-cover rounded-xl shrink-0"
                  />
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gold uppercase tracking-wider font-medium">
                        {prod.category}
                      </span>
                      {isPicked && <Check className="w-4 h-4 text-burgundy" />}
                    </div>
                    <h4 className="font-serif text-sm font-medium text-charcoal truncate">
                      {prod.name}
                    </h4>
                    <p className="text-xs text-charcoal-muted mt-0.5">
                      ₹{prod.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Capsule Calculation Strip & Action */}
          <div className="pt-4 border-t border-beige-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline space-x-3">
                <span className="text-xs text-charcoal-muted line-through">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
                <span className="font-serif text-2xl font-medium text-burgundy">
                  ₹{finalCapsulePrice.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-sage font-medium bg-sage-light px-2 py-0.5 rounded-full">
                  You Save ₹{capsuleDiscount.toLocaleString('en-IN')} (15%)
                </span>
              </div>
              <p className="text-[11px] text-charcoal-muted mt-0.5">
                Includes {selectedProducts.length} TARVEQ pieces coordinated with your personal {selectedVaultItem.item_name}.
              </p>
            </div>

            <button
              onClick={() => onOrderCapsule(selectedProducts)}
              disabled={selectedProducts.length === 0}
              className="w-full sm:w-auto bg-burgundy hover:bg-burgundy-hover text-white text-xs sm:text-sm font-medium py-3 px-8 rounded-full transition shadow-md flex items-center justify-center space-x-2 border border-gold/30 disabled:opacity-50"
            >
              <ShoppingBag className="w-4 h-4 text-gold" />
              <span>Order Capsule Wardrobe (15% Off)</span>
            </button>
          </div>

        </div>
      )}

      {/* 5. Add Piece Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#F8F4EC] w-full max-w-md rounded-3xl shadow-modal-luxe border border-beige-border p-6 space-y-5 animate-in zoom-in-95 duration-200 font-sans">
            
            <div className="flex items-center justify-between pb-3 border-b border-beige-border">
              <h3 className="font-serif text-2xl font-medium text-charcoal">
                Add Wardrobe Piece
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-beige text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-charcoal block mb-1">
                  Garment Name
                </label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Vintage Beige Linen Blazer"
                  className="w-full px-3 py-2 bg-white border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-charcoal block mb-1">
                    Category
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                  >
                    <option value="Tops">Tops</option>
                    <option value="Shirts">Shirts</option>
                    <option value="Trousers">Trousers</option>
                    <option value="Jeans">Jeans</option>
                    <option value="Dresses">Dresses</option>
                    <option value="Kurtas">Kurtas</option>
                    <option value="Co-ords">Co-ords</option>
                    <option value="Footwear">Footwear</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-charcoal block mb-1">
                    Dominant Colour
                  </label>
                  <input
                    type="text"
                    value={newItemColor}
                    onChange={(e) => setNewItemColor(e.target.value)}
                    placeholder="e.g. Cream, Olive, Black"
                    className="w-full px-3 py-2 bg-white border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal block mb-1">
                  Fabric Specification (Optional)
                </label>
                <input
                  type="text"
                  value={newItemFabric}
                  onChange={(e) => setNewItemFabric(e.target.value)}
                  placeholder="e.g. 100% Linen, Raw Silk, Cambric"
                  className="w-full px-3 py-2 bg-white border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal block mb-1">
                  Photo URL (Optional)
                </label>
                <input
                  type="url"
                  value={newItemImage}
                  onChange={(e) => setNewItemImage(e.target.value)}
                  placeholder="Leave empty to use studio placeholder"
                  className="w-full px-3 py-2 bg-white border border-beige-border rounded-xl text-xs text-charcoal focus:outline-none focus:border-burgundy"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-charcoal-muted hover:text-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-burgundy hover:bg-burgundy-hover text-white text-xs font-medium px-5 py-2 rounded-full transition shadow-sm"
                >
                  Save Piece
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
