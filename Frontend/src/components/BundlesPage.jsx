import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, ShoppingBag, Check, Filter, SlidersHorizontal, ShieldCheck, Tag, Zap, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function BundlesPage({ requirementId, onBackToHome, onAddToCart }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bundles, setBundles] = useState([]);
  const [preferences, setPreferences] = useState(null);
  
  // Filter & Sort State
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('All');
  const [sortBy, setSortBy] = useState('savings'); // 'savings', 'discount', 'price_low', 'price_high'
  const [addedBundles, setAddedBundles] = useState({});

  useEffect(() => {
    fetchBundles();
  }, [requirementId]);

  const fetchBundles = async () => {
    setLoading(true);
    setError('');
    
    const endpoint = requirementId
      ? `http://localhost:3000/api/ai/bundles/${requirementId}`
      : `http://localhost:3000/api/ai/bundles`;

    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to load bundles`);
      
      const data = await res.json();
      if (data.bundles && data.bundles.length > 0) {
        setBundles(data.bundles);
        setPreferences(data.preferences || null);
      } else {
        setError("No bundles generated for this request.");
      }
    } catch (err) {
      console.error("Bundles Page API Error:", err);
      setError(`Failed to connect to /api/ai/bundles API (${err.message}). Ensure backend server is running.`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBundleToCart = (bundleObj, idx) => {
    if (!bundleObj) return;

    bundleObj.products.forEach((p) => {
      onAddToCart({
        id: p.productId || p._id || `prod-${Math.random()}`,
        name: p.productName,
        brand: p.brandName,
        price: p.price,
        oldPrice: Math.round(p.price * 1.25),
        discount: p.discount || 15,
        image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80"
      });
    });

    setAddedBundles((prev) => ({ ...prev, [idx]: true }));
    confetti({ particleCount: 110, spread: 85, origin: { y: 0.5 } });
  };

  // Filter & Sort Logic
  const getFilteredAndSortedBundles = () => {
    let list = [...bundles];

    // Filter by Brand
    if (selectedBrandFilter !== 'All') {
      list = list.filter((b) =>
        b.products.some((p) => p.brandName.toLowerCase() === selectedBrandFilter.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'savings') {
      list.sort((a, b) => b.savings - a.savings);
    } else if (sortBy === 'discount') {
      list.sort((a, b) => b.savingsPercentage - a.savingsPercentage);
    } else if (sortBy === 'price_low') {
      list.sort((a, b) => a.bundleTotal - b.bundleTotal);
    } else if (sortBy === 'price_high') {
      list.sort((a, b) => b.bundleTotal - a.bundleTotal);
    }

    return list;
  };

  const displayedBundles = getFilteredAndSortedBundles();

  return (
    <div className="min-h-screen bg-[#F4FAF8] text-[#0F172A] pb-20">
      
      {/* TOP STICKY BAR */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 hover:text-[#00BFA5] transition-colors bg-slate-100 px-4 py-2 rounded-full"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Search
          </button>

          <div className="flex items-center gap-2">
            <span className="font-anton text-2xl tracking-wide text-[#0F172A]">
              BUNDLE<span className="text-[#00BFA5]">AI</span>
            </span>
            <span className="bg-[#00BFA5] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
              /api/ai/bundles
            </span>
          </div>

          <button
            onClick={fetchBundles}
            className="p-2 rounded-full text-slate-500 hover:text-[#00BFA5] hover:bg-slate-100 transition-colors"
            title="Refresh Bundles API"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-8 space-y-8">
        
        {/* PAGE HERO HEADER */}
        <div className="bg-gradient-to-r from-[#0F4C5C] via-[#092D36] to-[#064E3B] rounded-[32px] p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-[#00BFA5]/30">
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-teal-200 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-[#00BFA5]" /> Multi-Intersection Neural Engine
            </div>

            <h1 className="font-anton text-3xl sm:text-5xl md:text-6xl tracking-wide uppercase">
              ALL GENERATED AI BUNDLES ({bundles.length})
            </h1>

            <p className="text-slate-200 text-sm sm:text-base font-medium max-w-2xl">
              Calculated across 550+ real MongoDB products. Every bundle represents a &gt;1% relevance intersection match tailored to your parameters.
            </p>

            {/* Preference Chips */}
            {preferences && (
              <div className="pt-2 flex flex-wrap items-center gap-2">
                {preferences.preferredBrands && preferences.preferredBrands.map((b, i) => (
                  <span key={i} className="text-xs bg-[#00BFA5]/20 text-teal-200 px-3 py-1 rounded-full border border-[#00BFA5]/40 font-bold">
                    ✓ Preferred Brand: {b}
                  </span>
                ))}
                {preferences.endingPrice && (
                  <span className="text-xs bg-white/10 text-white px-3 py-1 rounded-full border border-white/20 font-medium">
                    Max Budget: ₹{preferences.endingPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-[#00BFA5]/20 border-t-[#00BFA5] animate-spin mx-auto" />
            <h3 className="font-anton text-2xl text-slate-800 uppercase">FETCHING BUNDLES API...</h3>
            <p className="text-slate-500 text-sm font-medium">Reading /api/ai/bundles endpoint</p>
          </div>
        )}

        {/* ERROR STATE */}
        {error && !loading && (
          <div className="bg-rose-50 p-6 rounded-2xl border border-rose-200 text-rose-800 space-y-2">
            <h3 className="font-bold text-base">Notice</h3>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* FILTER & SORT TOOLBAR */}
        {!loading && bundles.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Filter Brand:</span>
              <select
                value={selectedBrandFilter}
                onChange={(e) => setSelectedBrandFilter(e.target.value)}
                className="bg-slate-50 text-xs font-bold text-slate-800 p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#00BFA5]"
              >
                <option value="All">All Brands</option>
                <option value="Apple">Apple</option>
                <option value="Samsung">Samsung</option>
                <option value="OnePlus">OnePlus</option>
                <option value="Google">Google</option>
                <option value="Sony">Sony</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 text-xs font-bold text-slate-800 p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#00BFA5]"
              >
                <option value="savings">Highest Savings (₹)</option>
                <option value="discount">Highest Discount (%)</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          </div>
        )}

        {/* BUNDLES LIST SHOWCASE */}
        {!loading && displayedBundles.length > 0 && (
          <div className="space-y-8">
            {displayedBundles.map((bundle, idx) => (
              <div
                key={idx}
                className="bg-white rounded-[28px] border border-slate-200/90 shadow-card hover:shadow-xl transition-all duration-300 p-6 sm:p-8 space-y-6"
              >
                {/* BUNDLE HEADER */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-[#00BFA5] text-white text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                        {idx === 0 ? 'BEST VALUE MATCH' : idx === 1 ? 'MAX SAVINGS' : 'DYNAMIC INTERSECTION BUNDLE'}
                      </span>
                      <span className="text-xs font-bold text-slate-400">Bundle #{idx + 1}</span>
                    </div>

                    <h2 className="font-anton text-2xl sm:text-4xl text-slate-900 mt-2 uppercase tracking-wide">
                      {bundle.name}
                    </h2>
                  </div>

                  {/* Savings Pill */}
                  <div className="bg-emerald-50 border border-emerald-200 px-5 py-2.5 rounded-2xl text-right">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verified Bundle Savings</div>
                    <div className="text-xl font-extrabold text-emerald-700">
                      YOU SAVE ₹{bundle.savings ? bundle.savings.toLocaleString('en-IN') : '0'} ({bundle.savingsPercentage || 0}% OFF)
                    </div>
                  </div>
                </div>

                {/* AI REASON BOX */}
                <div className="bg-[#00BFA5]/10 p-4 rounded-2xl border border-[#00BFA5]/25 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-[#00BFA5] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-extrabold text-[#064E3B] uppercase block">AI Recommendation Reason:</span>
                    <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed mt-0.5">
                      "{bundle.reason}"
                    </p>
                  </div>
                </div>

                {/* PREFERENCES MATCH BADGES */}
                <div className="flex flex-wrap items-center gap-2">
                  {bundle.preferredBrandMatches && bundle.preferredBrandMatches.map((m, i) => (
                    <span key={i} className="text-xs bg-[#0F4C5C]/10 text-[#0F4C5C] font-extrabold px-3 py-1 rounded-full border border-[#0F4C5C]/20 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-[#00BFA5]" /> {m.message || `Brand Match: ${m.brand}`}
                    </span>
                  ))}

                  {bundle.matchedPreferences && bundle.matchedPreferences.map((pref, i) => (
                    <span key={i} className="text-xs bg-slate-100 text-slate-700 font-semibold px-3 py-1 rounded-full border border-slate-200 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> {pref}
                    </span>
                  ))}
                </div>

                {/* PRODUCTS INCLUDED GRID */}
                <div>
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-3">
                    Included Products ({bundle.products ? bundle.products.length : 0}):
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bundle.products && bundle.products.map((p, i) => (
                      <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3.5 hover:bg-white transition-colors shadow-2xs">
                        <div className="w-12 h-12 rounded-xl bg-white p-1 shrink-0 flex items-center justify-center border border-slate-100">
                          <ShoppingBag className="w-6 h-6 text-[#00BFA5]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-extrabold text-[#0D9488] uppercase tracking-wider block">
                            {p.brandName}
                          </span>
                          <h4 className="font-bold text-slate-800 text-sm line-clamp-1">
                            {p.productName}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-extrabold text-slate-900 text-xs">₹{p.price ? p.price.toLocaleString('en-IN') : 0}</span>
                            {p.discount > 0 && (
                              <span className="text-[9px] bg-[#00BFA5] text-white px-1.5 py-0.2 rounded font-extrabold">
                                -{p.discount}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PRICE & ADD BUNDLE ACTION BAR */}
                <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="text-xs text-slate-400 font-medium">
                      Individual Total Price: <span className="line-through">₹{bundle.individualTotal ? bundle.individualTotal.toLocaleString('en-IN') : 0}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-300 font-bold uppercase">AI Bundle Price:</span>
                      <span className="font-anton text-3xl sm:text-4xl text-[#00BFA5] tracking-tight">
                        ₹{bundle.bundleTotal ? bundle.bundleTotal.toLocaleString('en-IN') : 0}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddBundleToCart(bundle, idx)}
                    disabled={addedBundles[idx]}
                    className={`w-full sm:w-auto px-8 py-4 rounded-full font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all duration-200 ${
                      addedBundles[idx]
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gradient-to-r from-[#00BFA5] to-[#0D9488] hover:from-[#00A892] text-white shadow-[#00BFA5]/30 hover:scale-[1.02]'
                    }`}
                  >
                    {addedBundles[idx] ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span>ADDED TO CART</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5 text-amber-300" />
                        <span>ADD BUNDLE TO CART</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
