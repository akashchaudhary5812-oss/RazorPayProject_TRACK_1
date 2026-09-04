import React, { useState, useEffect } from 'react';
import { X, Sparkles, ShoppingBag, ArrowRight, RefreshCw, AlertCircle, Package } from 'lucide-react';
import AmazonBundleSection from './AmazonBundleSection';
import BundleSkeletonGrid from './BundleSkeletonGrid';

const API_BASE_URL = 'http://localhost:3000/api/ai';

export default function AISearchModal({
  isOpen,
  onClose,
  searchQuery,
  onAddBundleToCart,
  onOpenBundlesPage,
  onViewDetails
}) {
  // Form Input State
  const [naturalText, setNaturalText] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [startingPrice, setStartingPrice] = useState('');
  const [endingPrice, setEndingPrice] = useState('');
  const [releaseCategory, setReleaseCategory] = useState('Latest Version');
  const [discount, setDiscount] = useState('');

  // Processing State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bundles, setBundles] = useState([]);
  const [activeBundleIndex, setActiveBundleIndex] = useState(0);
  const [lastRequirementId, setLastRequirementId] = useState(null);

  const availableCategories = ["Mobile Phones", "Laptops", "Gaming", "Sports", "Jewellery", "Kids Toys", "Food"];
  const availableBrands = ["Apple", "Samsung", "Google", "OnePlus", "Xiaomi", "Motorola", "Nothing", "Realme", "Sony", "Nike", "Adidas", "Dell", "HP", "Lenovo"];

  useEffect(() => {
    if (isOpen) {
      if (searchQuery) {
        setNaturalText(searchQuery);
        handleExecuteSearch(searchQuery);
      } else {
        setBundles([]);
        setError('');
      }
    }
  }, [isOpen, searchQuery]);

  const toggleCategory = (cat) => {
    setSelectedProducts((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleExecuteSearch = async (promptOverride) => {
    setLoading(true);
    setError('');
    setBundles([]);
    setActiveBundleIndex(0);

    const payload = {
      products: selectedProducts.length > 0 ? selectedProducts : ["Mobile Phones"],
      preferredBrands: selectedBrands.length > 0 ? selectedBrands : ["Apple", "Samsung"],
      startingPrice: startingPrice ? Number(startingPrice) : null,
      endingPrice: endingPrice ? Number(endingPrice) : null,
      releaseCategory: releaseCategory ? [releaseCategory] : ["Latest Version"],
      discount: discount ? Number(discount) : null,
      naturalText: promptOverride !== undefined ? promptOverride : naturalText
    };

    try {
      // Step 1: Submit requirements
      const reqRes = await fetch(`${API_BASE_URL}/userRequirements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!reqRes.ok) throw new Error(`Requirements service returned ${reqRes.status}`);
      const reqData = await reqRes.json();
      const requirementId = reqData.requirementId;
      setLastRequirementId(requirementId);

      // Step 2: Fetch bundles
      const searchRes = await fetch(`${API_BASE_URL}/aiEfficientSearch/${requirementId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!searchRes.ok) throw new Error(`Bundle service returned ${searchRes.status}`);
      const searchData = await searchRes.json();

      if (searchData.bundles && searchData.bundles.length > 0) {
        setBundles(searchData.bundles);
        setActiveBundleIndex(0);
      } else {
        setError("No matching bundles could be found for your exact criteria. Try adjusting the price range or brand preferences.");
      }
    } catch (err) {
      console.error("Bundle Search Error:", err);
      setError("Unable to connect to the bundle service. Please ensure the backend server is running and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full p-4 sm:p-7 shadow-2xl border border-slate-200 relative overflow-hidden max-h-[94vh] flex flex-col justify-between">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <div className="pb-3 border-b border-slate-100 pr-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 text-[11px] font-extrabold uppercase tracking-wider mb-1">
            <Package className="w-3.5 h-3.5 text-amber-600" /> Smart Bundle Finder
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Find Your Recommended Bundle
          </h2>
          <p className="text-xs text-slate-500 font-normal">
            Describe what you need. We'll find compatible products and build a tailored package with maximum savings.
          </p>
        </div>

        {/* CONTENT BODY */}
        <div className="py-3 overflow-y-auto space-y-5 flex-1 pr-1">
          
          {/* USER REQUIREMENTS FORM */}
          <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                What are you looking for?
              </label>
              <input
                type="text"
                value={naturalText}
                onChange={(e) => setNaturalText(e.target.value)}
                placeholder="e.g. Work-from-home setup with laptop, wireless mouse, and keyboard under 80000"
                className="w-full bg-white text-xs sm:text-sm text-slate-900 p-2.5 sm:p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium shadow-2xs"
              />
            </div>

            {/* Quick Categories & Brands */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Product Categories:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableCategories.map((cat) => {
                    const isSelected = selectedProducts.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-2xs'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                  Preferred Brands:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableBrands.slice(0, 8).map((brand) => {
                    const isSelected = selectedBrands.includes(brand);
                    return (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => toggleBrand(brand)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all ${
                          isSelected
                            ? 'bg-teal-700 text-white shadow-2xs'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {brand}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Price Range & Min Discount */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-0.5">
              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase">Min Budget (₹):</label>
                <input
                  type="number"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(e.target.value)}
                  placeholder="10000"
                  className="w-full bg-white text-xs text-slate-900 p-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400 font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase">Max Budget (₹):</label>
                <input
                  type="number"
                  value={endingPrice}
                  onChange={(e) => setEndingPrice(e.target.value)}
                  placeholder="150000"
                  className="w-full bg-white text-xs text-slate-900 p-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400 font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 uppercase">Min Discount (%):</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="15"
                  className="w-full bg-white text-xs text-slate-900 p-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400 font-semibold"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => handleExecuteSearch()}
                disabled={loading}
                className="w-full bg-[#FFD814] hover:bg-[#F7CA00] active:scale-98 text-slate-950 font-extrabold py-2.5 sm:py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Preparing your bundle...</span>
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4 text-slate-950" />
                    <span>Find Best Bundle</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* SKELETON LOADING STATE WITH CUSTOMER-FRIENDLY PROGRESSIVE MESSAGES */}
          {loading && (
            <div className="py-2">
              <BundleSkeletonGrid cardCount={4} />
            </div>
          )}

          {/* ERROR DISPLAY */}
          {error && !loading && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <strong className="block text-sm">Notice</strong>
                {error}
              </div>
            </div>
          )}

          {/* RESULTS: AMAZON-STYLE BUNDLE SECTION */}
          {bundles.length > 0 && !loading && (
            <div className="space-y-4 pt-1">
              
              {/* Bundle Navigation Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">
                    Found {bundles.length} Bundle{bundles.length > 1 ? 's' : ''}:
                  </span>
                  {bundles.length > 1 && (
                    <div className="flex items-center gap-1">
                      {bundles.map((_, bIdx) => (
                        <button
                          key={bIdx}
                          type="button"
                          onClick={() => setActiveBundleIndex(bIdx)}
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-extrabold transition-all ${
                            activeBundleIndex === bIdx
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Option #{bIdx + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {lastRequirementId && onOpenBundlesPage && (
                  <button
                    type="button"
                    onClick={() => onOpenBundlesPage(lastRequirementId)}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 uppercase tracking-wider"
                  >
                    <span>View in Full Store Page</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Active Amazon Bundle Display */}
              <AmazonBundleSection
                bundle={bundles[activeBundleIndex]}
                bundleIndex={activeBundleIndex}
                onAddToCart={onAddBundleToCart}
                onViewDetails={onViewDetails}
                compact={true}
              />

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
