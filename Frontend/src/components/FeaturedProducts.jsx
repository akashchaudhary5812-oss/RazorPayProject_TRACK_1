import React, { useState, useEffect, useMemo } from 'react';
import { Star, Filter, ArrowUpDown, ChevronDown, Sparkles, SlidersHorizontal, PackageSearch, Layers } from 'lucide-react';
import { FEATURED_PRODUCTS as FALLBACK_PRODUCTS, CATEGORIES, SUBCATEGORIES_BY_CATEGORY } from '../data/products';
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
  const [activeSubcategory, setActiveSubcategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'price-asc', 'price-desc', 'rating', 'discount'
  const [visibleCount, setVisibleCount] = useState(32);

  // Synchronize category if passed from props
  useEffect(() => {
    if (selectedCategory) {
      setActiveCategory(selectedCategory);
      setActiveSubcategory('all');
      setVisibleCount(32);
    }
  }, [selectedCategory]);

  // Reset pagination when search query or subcategory changes
  useEffect(() => {
    setVisibleCount(32);
  }, [searchQuery, activeSubcategory]);

  useEffect(() => {
    // Fetch live products from backend MongoDB API if available
    fetch('http://localhost:3000/api/products/products')
      .then((res) => res.json())
      .then((data) => {
        let liveProducts = [];
        if (Array.isArray(data)) liveProducts = data;
        else if (data && Array.isArray(data.products)) liveProducts = data.products;
        else if (data && Array.isArray(data.data)) liveProducts = data.data;

        if (liveProducts.length >= 500) {
          // If backend has loaded the expanded catalog, format smoothly
          const formatted = liveProducts.map((p, idx) => {
            const fallbackMatch = FALLBACK_PRODUCTS[idx % FALLBACK_PRODUCTS.length];
            return {
              id: p._id || p.id || `prod-${idx}`,
              name: p.productName || p.name || fallbackMatch.name,
              brand: p.brandName || p.brand || fallbackMatch.brand,
              category: p.category || fallbackMatch.category,
              subcategory: p.subcategory || fallbackMatch.subcategory,
              price: p.price || fallbackMatch.price,
              oldPrice: p.oldPrice || Math.round((p.price || fallbackMatch.price) * (1 + ((p.discount || 15) / 100))),
              discount: p.discount || fallbackMatch.discount || 15,
              rating: p.rating || fallbackMatch.rating || 4.5,
              reviewsCount: p.reviewsCount || fallbackMatch.reviewsCount || 450,
              badge: p.badge || fallbackMatch.badge || '',
              image: p.image || fallbackMatch.image,
              description: p.description || fallbackMatch.description,
              specs: p.specs || fallbackMatch.specs || [],
              deliveryDate: p.deliveryDate || "Tomorrow, 2 PM"
            };
          });
          setProducts(formatted);
        }
      })
      .catch((err) => {
        console.log("Using primary marketplace catalog:", err.message);
      });
  }, []);

  // Filter & Search Logic
  const filteredProducts = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();

    return products.filter((p) => {
      // 1. Category match
      let categoryMatch = false;
      if (activeCategory === 'all') {
        categoryMatch = true;
      } else {
        const catLower = (p.category || '').toLowerCase();
        const activeLower = activeCategory.toLowerCase();
        categoryMatch = catLower === activeLower ||
          (activeLower === 'electronics' && (catLower.includes('phone') || catLower.includes('laptop') || catLower.includes('audio'))) ||
          (activeLower === 'grocery & food' && catLower.includes('groc')) ||
          (activeLower === "women's fashion" && (catLower.includes('women') || catLower.includes('saree') || catLower.includes('kurti'))) ||
          (activeLower === "men's fashion" && catLower.includes('men')) ||
          (activeLower === "fashion accessories" && (catLower.includes('access') || catLower.includes('bag'))) ||
          (activeLower === "jewellery" && catLower.includes('jewel')) ||
          (activeLower === "beauty & personal care" && (catLower.includes('beauty') || catLower.includes('care'))) ||
          (activeLower === "footwear" && (catLower.includes('foot') || catLower.includes('shoe'))) ||
          (activeLower === "home & kitchen" && (catLower.includes('home') || catLower.includes('kitchen'))) ||
          (activeLower === "sports & fitness" && (catLower.includes('sport') || catLower.includes('fitness'))) ||
          (activeLower === "books & stationery" && (catLower.includes('book') || catLower.includes('stationery'))) ||
          (activeLower === "toys & games" && catLower.includes('toy')) ||
          (activeLower === "travel & luggage" && (catLower.includes('travel') || catLower.includes('luggage')));
      }

      if (!categoryMatch) return false;

      // 2. Subcategory match
      if (activeSubcategory !== 'all' && p.subcategory) {
        if (p.subcategory.toLowerCase() !== activeSubcategory.toLowerCase()) {
          return false;
        }
      }

      // 3. Search query match across multiple fields
      if (q) {
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchBrand = (p.brand || '').toLowerCase().includes(q);
        const matchCategory = (p.category || '').toLowerCase().includes(q);
        const matchSub = (p.subcategory || '').toLowerCase().includes(q);
        const matchDesc = (p.description || '').toLowerCase().includes(q);
        const matchSpecs = Array.isArray(p.specs) && p.specs.some(s => s.toLowerCase().includes(q));

        if (!matchName && !matchBrand && !matchCategory && !matchSub && !matchDesc && !matchSpecs) {
          return false;
        }
      }

      return true;
    });
  }, [products, activeCategory, activeSubcategory, searchQuery]);

  // Sorting
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === 'price-asc') return list.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') return list.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sortBy === 'discount') return list.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    return list; // 'featured' keeps original catalog order
  }, [filteredProducts, sortBy]);

  // Current subcategory list for active category
  const availableSubcategories = useMemo(() => {
    if (activeCategory === 'all' || !SUBCATEGORIES_BY_CATEGORY[activeCategory]) {
      return [];
    }
    return SUBCATEGORIES_BY_CATEGORY[activeCategory];
  }, [activeCategory]);

  const displayedProducts = sortedProducts.slice(0, visibleCount);

  return (
    <section id="products" className="py-10 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-teal-700 tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" /> 1,000+ Verified Marketplace Products
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore All Categories & Best Sellers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showing <strong className="text-slate-800">{displayedProducts.length}</strong> of <strong className="text-slate-800">{sortedProducts.length}</strong> products
            {activeCategory !== 'all' ? ` in ${activeCategory}` : ' across all departments'}
            {searchQuery ? ` matching "${searchQuery}"` : ''}
          </p>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="featured">Featured Deals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Customer Rating</option>
            <option value="discount">Biggest Discount %</option>
          </select>
        </div>
      </div>

      {/* 13 CATEGORY PILLS BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-3 no-scrollbar scroll-smooth">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory.toLowerCase() === cat.id.toLowerCase();
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setActiveSubcategory('all');
                setVisibleCount(32);
                if (onSelectCategory) onSelectCategory(cat.id);
              }}
              className={`text-xs px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all duration-200 shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md ring-2 ring-slate-900/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* SUBCATEGORY PILLS (Shown when a specific category is chosen) */}
      {availableSubcategories.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-6 no-scrollbar bg-slate-50/70 p-2 rounded-2xl border border-slate-200/60">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-2 shrink-0 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" /> Subcategory:
          </span>
          <button
            onClick={() => setActiveSubcategory('all')}
            className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap transition-all shrink-0 ${
              activeSubcategory === 'all'
                ? 'bg-teal-700 text-white font-bold'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Subcategories
          </button>
          {availableSubcategories.map((sub) => {
            const isSubActive = activeSubcategory.toLowerCase() === sub.toLowerCase();
            return (
              <button
                key={sub}
                onClick={() => {
                  setActiveSubcategory(sub);
                  setVisibleCount(32);
                }}
                className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap transition-all shrink-0 ${
                  isSubActive
                    ? 'bg-teal-700 text-white font-bold'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>
      )}

      {/* PRODUCT GRID */}
      {displayedProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 my-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <PackageSearch className="w-6 h-6" />
          </div>
          <p className="text-base font-bold text-slate-700">No products found matching your criteria.</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting the category filter or searching for another term.</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setActiveCategory('all');
                setActiveSubcategory('all');
                if (onSelectCategory) onSelectCategory('all');
              }}
              className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-full text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Show All 1,000+ Products
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {displayedProducts.map((product) => {
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

          {/* PAGINATION / LOAD MORE CONTROLS */}
          {visibleCount < sortedProducts.length && (
            <div className="mt-10 flex flex-col items-center justify-center gap-3">
              <div className="text-xs font-semibold text-slate-500">
                Viewing {displayedProducts.length} of {sortedProducts.length} items
              </div>
              <div className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (displayedProducts.length / sortedProducts.length) * 100)}%` }}
                />
              </div>

              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setVisibleCount((prev) => Math.min(prev + 32, sortedProducts.length))}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-lg active:scale-98"
                >
                  Load More Products (+32)
                </button>

                {sortedProducts.length > visibleCount + 32 && (
                  <button
                    type="button"
                    onClick={() => setVisibleCount(sortedProducts.length)}
                    className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    Show All ({sortedProducts.length})
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}

    </section>
  );
}
