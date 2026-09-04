import React, { useState, useEffect } from 'react';
import { Star, Filter, ArrowUpDown, ChevronDown, Sparkles } from 'lucide-react';
import { FEATURED_PRODUCTS as FALLBACK_PRODUCTS, CATEGORIES } from '../data/products';
import ProductCard from './ProductCard';

export default function FeaturedProducts({
  wishlist = [],
  toggleWishlist,
  onAddToCart,
  onViewDetails,
  selectedCategory = 'all',
  onSelectCategory,
  searchQuery = ''
}) {
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [activeCategory, setActiveCategory] = useState(selectedCategory || 'all');
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'price-asc', 'price-desc', 'rating'

  // Synchronize category if passed from props
  useEffect(() => {
    if (selectedCategory) {
      setActiveCategory(selectedCategory);
    }
  }, [selectedCategory]);

  useEffect(() => {
    // Fetch live products from backend MongoDB API
    fetch('http://localhost:3000/api/products/products')
      .then((res) => res.json())
      .then((data) => {
        let liveProducts = [];
        if (Array.isArray(data)) liveProducts = data;
        else if (data && Array.isArray(data.products)) liveProducts = data.products;
        else if (data && Array.isArray(data.data)) liveProducts = data.data;

        if (liveProducts.length > 0) {
          const formatted = liveProducts.map((p, idx) => {
            const fallbackMatch = FALLBACK_PRODUCTS[idx % FALLBACK_PRODUCTS.length];
            return {
              id: p._id || p.id || `prod-${idx}`,
              name: p.productName || p.name || fallbackMatch.name,
              brand: p.brandName || p.brand || fallbackMatch.brand,
              category: p.category || fallbackMatch.category || 'Tech',
              price: p.price || fallbackMatch.price,
              oldPrice: Math.round((p.price || fallbackMatch.price) * (1 + ((p.discount || 15) / 100))),
              discount: p.discount || 15,
              rating: fallbackMatch.rating || 4.8,
              reviewsCount: fallbackMatch.reviewsCount || 850,
              badge: fallbackMatch.badge || "Amazon's Choice",
              image: fallbackMatch.image,
              description: fallbackMatch.description,
              specs: fallbackMatch.specs,
              deliveryDate: "Tomorrow, 2 PM"
            };
          });
          setProducts(formatted);
        }
      })
      .catch((err) => {
        console.log("Using fallback featured products catalog:", err.message);
      });
  }, []);

  // Filter & Sort Logic
  const filteredProducts = products.filter((p) => {
    // Category match
    const categoryMatch =
      activeCategory === 'all' ||
      p.category?.toLowerCase() === activeCategory.toLowerCase() ||
      (activeCategory === 'Smartphones' && (p.category === 'Mobile Phones' || p.category === 'Smartphones')) ||
      (activeCategory === 'Laptops' && (p.category === 'Laptops & PCs' || p.category === 'Laptops'));

    // Search query match
    const searchMatch = !searchQuery ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase());

    return categoryMatch && searchMatch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0; // 'featured' keeps original order
  });

  return (
    <section id="products" className="py-10 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
      
      {/* SECTION HEADER: Title, Category Pills & Sort Dropdown */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-teal-700 tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Handpicked Quality Hardware
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Best Sellers & Featured Electronics
          </h2>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-2xs"
          >
            <option value="featured">Featured Deals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Customer Rating</option>
          </select>
        </div>

      </div>

      {/* CATEGORY TABS PILL BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory.toLowerCase() === cat.id.toLowerCase();
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                if (onSelectCategory) onSelectCategory(cat.id);
              }}
              className={`text-xs px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* PRODUCT GRID */}
      {sortedProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <p className="text-base font-bold text-slate-700">No products found matching your filter.</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting the category or search query.</p>
          <button
            onClick={() => {
              setActiveCategory('all');
              if (onSelectCategory) onSelectCategory('all');
            }}
            className="mt-4 px-5 py-2 bg-amber-400 text-slate-950 rounded-full text-xs font-bold uppercase tracking-wider"
          >
            Show All Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {sortedProducts.map((product) => {
            const isWishlisted = wishlist.some((item) => item.id === product.id);
            return (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={isWishlisted}
                onToggleWishlist={toggleWishlist}
                onAddToCart={onAddToCart}
                onViewDetails={onViewDetails}
              />
            );
          })}
        </div>
      )}

    </section>
  );
}
