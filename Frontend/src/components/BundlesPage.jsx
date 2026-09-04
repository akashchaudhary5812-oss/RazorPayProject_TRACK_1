import React, { useState, useEffect } from 'react';
import { ArrowLeft, SlidersHorizontal, ArrowUpDown, Package, RefreshCw, AlertCircle } from 'lucide-react';
import AmazonBundleSection from './AmazonBundleSection';
import BundleSkeletonGrid from './BundleSkeletonGrid';

export default function BundlesPage({ requirementId, onBackToHome, onAddToCart, onViewDetails }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bundles, setBundles] = useState([]);
  const [preferences, setPreferences] = useState(null);
  
  // Filter & Sort State
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('All');
  const [sortBy, setSortBy] = useState('savings'); // 'savings', 'discount', 'price_low', 'price_high'

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
        setError("No bundles currently match these preferences. Please adjust your criteria or browse our featured packages.");
      }
    } catch (err) {
      console.error("Bundles Page API Error:", err);
      setError("Unable to connect to the bundle service. Please ensure the server is active or try again shortly.");
    } finally {
      setLoading(false);
    }
  };

  // Collect unique brands from bundles
  const availableBrands = ['All', ...new Set(
    bundles.flatMap((b) => (b.products || []).map((p) => p.brandName || p.brand)).filter(Boolean)
  )];

  // Filter & Sort Logic
  const displayedBundles = [...bundles]
    .filter((b) => {
      if (selectedBrandFilter === 'All') return true;
      return (b.products || []).some(
        (p) => (p.brandName || p.brand || '').toLowerCase() === selectedBrandFilter.toLowerCase()
      );
    })
    .sort((a, b) => {
      if (sortBy === 'savings') return (b.savings || 0) - (a.savings || 0);
      if (sortBy === 'discount') return (b.savingsPercentage || 0) - (a.savingsPercentage || 0);
      if (sortBy === 'price_low') return (a.bundleTotal || 0) - (b.bundleTotal || 0);
      if (sortBy === 'price_high') return (b.bundleTotal || 0) - (a.bundleTotal || 0);
      return 0;
    });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-24">
      
      {/* 1. TOP STICKY NAVIGATION BAR */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs font-bold text-teal-700 hover:text-teal-900 uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Shopping</span>
          </button>

          {/* Filter & Sort Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {availableBrands.length > 2 && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                <span>Brand:</span>
                <select
                  value={selectedBrandFilter}
                  onChange={(e) => setSelectedBrandFilter(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {availableBrands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="savings">Highest Savings (₹)</option>
                <option value="discount">Highest Discount (%)</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* 2. AMAZON-STYLE BUNDLE HEADER */}
      <div className="bg-[#0F172A] text-white py-10 px-4 sm:px-6 mb-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
            <Package className="w-3.5 h-3.5 text-amber-400" /> Recommended Product Bundles
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Curated Shopping Bundles
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Pre-configured product bundles designed to work together seamlessly with stackable package discounts.
          </p>
        </div>
      </div>

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {loading ? (
          /* Multi-phase skeleton loading state with customer-friendly messages */
          <BundleSkeletonGrid cardCount={5} />
        ) : error ? (
          /* Clean Customer-friendly Error / Empty State */
          <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-slate-200 max-w-lg mx-auto space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Notice</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{error}</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={fetchBundles}
                className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
              <button
                type="button"
                onClick={onBackToHome}
                className="px-5 py-2.5 bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-amber-500 transition-colors"
              >
                Back to Store
              </button>
            </div>
          </div>
        ) : displayedBundles.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 max-w-md mx-auto space-y-3">
            <p className="text-sm text-slate-600">No bundles match the selected brand filter.</p>
            <button
              onClick={() => setSelectedBrandFilter('All')}
              className="text-xs font-bold text-teal-700 underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          /* 4. RENDER AMAZON BUNDLE SECTIONS */
          <div className="space-y-8">
            <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>Showing <strong>{displayedBundles.length}</strong> recommended bundles</span>
            </div>

            {displayedBundles.map((bundle, idx) => (
              <AmazonBundleSection
                key={bundle.bundleId || idx}
                bundle={bundle}
                bundleIndex={idx}
                onAddToCart={onAddToCart}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
