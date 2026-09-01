import React, { useState, useEffect } from 'react';
import { Star, Heart, ArrowRight, ChevronRight, Plus, Check } from 'lucide-react';
import { FEATURED_PRODUCTS as FALLBACK_PRODUCTS } from '../data/products';

export default function FeaturedProducts({ wishlist, toggleWishlist, onAddToCart }) {
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [addedItems, setAddedItems] = useState({});

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
          const formatted = liveProducts.slice(0, 8).map((p, idx) => ({
            id: p._id || p.id || `prod-${idx}`,
            name: p.productName || p.name,
            brand: p.brandName || p.brand || 'BRAND',
            category: p.category || 'Tech',
            price: p.price || 9999,
            oldPrice: Math.round((p.price || 9999) * 1.25),
            discount: p.discount || 15,
            image: FALLBACK_PRODUCTS[idx % FALLBACK_PRODUCTS.length].image
          }));
          setProducts(formatted);
        }
      })
      .catch((err) => {
        console.log("Using fallback featured products catalog:", err.message);
      });
  }, []);

  const handleAddToCart = (product) => {
    onAddToCart(product);
    setAddedItems((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  return (
    <section id="products" className="py-10 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
      
      {/* SECTION HEADER */}
      <div className="flex items-center justify-between mb-8">
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#00BFA5]/15 flex items-center justify-center text-[#00BFA5]">
            <Star className="w-5 h-5 fill-[#00BFA5]" />
          </div>
          <h2 className="font-anton text-3xl sm:text-4xl text-[#0F172A] uppercase tracking-wide">
            TOP FEATURED PRODUCTS
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <a 
            href="#all-products" 
            className="text-xs sm:text-sm font-bold text-[#0D9488] hover:text-[#064E3B] flex items-center gap-1 uppercase tracking-wider transition-colors"
          >
            VIEW ALL ({products.length}) <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* PRODUCT CARDS GRID */}
      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const isWishlisted = wishlist.some((item) => item.id === product.id);
            const isAdded = addedItems[product.id];

            return (
              <div
                key={product.id}
                className="bg-white rounded-[24px] p-5 shadow-card hover:shadow-xl hover:shadow-slate-200/80 border border-slate-100 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 relative group/card"
              >
                
                {/* TOP IMAGE & BADGES AREA */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-[#00BFA5] text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-sm">
                      -{product.discount}%
                    </span>

                    <button
                      onClick={() => toggleWishlist(product)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isWishlisted
                          ? 'bg-rose-50 text-rose-500 shadow-sm'
                          : 'bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50'
                      }`}
                      title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                    </button>
                  </div>

                  <div className="w-full h-44 sm:h-48 rounded-2xl bg-slate-50 mb-4 overflow-hidden flex items-center justify-center p-3 relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain group-hover/card:scale-105 transition-transform duration-500 mix-blend-multiply"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold text-[#0D9488] tracking-widest uppercase block">
                      {product.brand}
                    </span>
                    <h3 className="font-bold text-slate-800 text-base sm:text-lg line-clamp-1 group-hover/card:text-[#00BFA5] transition-colors">
                      {product.name}
                    </h3>
                  </div>
                </div>

                {/* BOTTOM PRICE & ACTION AREA */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-lg sm:text-xl font-extrabold text-[#0F172A] tracking-tight">
                      ₹{product.price ? product.price.toLocaleString('en-IN') : 0}
                    </div>
                    <div className="text-xs font-semibold text-slate-400 line-through">
                      ₹{product.oldPrice ? product.oldPrice.toLocaleString('en-IN') : 0}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    className={`p-2.5 rounded-full transition-all duration-200 flex items-center gap-1 font-bold text-xs ${
                      isAdded
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 hover:bg-[#00BFA5] text-slate-700 hover:text-white'
                    }`}
                    title="Add to Bundle"
                  >
                    {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
