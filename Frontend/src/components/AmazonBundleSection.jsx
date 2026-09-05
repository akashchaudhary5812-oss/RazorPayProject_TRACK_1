import React, { useState, useMemo } from 'react';
import { ShoppingCart, Check, ShieldCheck, Sparkles, Bot } from 'lucide-react';
import confetti from 'canvas-confetti';
import AmazonProductCard from './AmazonProductCard';
import { FEATURED_PRODUCTS } from '../data/products';

export default function AmazonBundleSection({
  bundle,
  bundleIndex = 0,
  onAddToCart,
  onViewDetails
}) {
  const rawProducts = bundle?.products || [];

  // Enrich bundle products with catalog images & authentic ratings where matching
  const enrichedProducts = useMemo(() => {
    return rawProducts.map((p, pIdx) => {
      const pId = p.productId || p._id || p.id || `bprod-${bundleIndex}-${pIdx}`;
      const pName = p.productName || p.name || '';
      const pBrand = p.brandName || p.brand || '';

      // Check if product matches one in FEATURED_PRODUCTS catalog
      const catalogMatch = FEATURED_PRODUCTS.find((catItem) => {
        if (catItem.id === pId) return true;
        const cName = (catItem.name || '').toLowerCase();
        const queryName = pName.toLowerCase();
        return queryName && (cName.includes(queryName) || queryName.includes(cName));
      });

      return {
        id: pId,
        productId: pId,
        name: pName,
        productName: pName,
        brand: pBrand,
        brandName: pBrand,
        category: p.category || (catalogMatch ? catalogMatch.category : 'Electronics'),
        price: p.price != null ? Number(p.price) : (catalogMatch ? catalogMatch.price : null),
        oldPrice: p.oldPrice != null ? Number(p.oldPrice) : (catalogMatch ? catalogMatch.oldPrice : null),
        discount: p.discount != null ? Number(p.discount) : (catalogMatch ? catalogMatch.discount : null),
        image: p.image || (catalogMatch ? catalogMatch.image : null),
        description: p.description || (catalogMatch ? catalogMatch.description : null),
        specs: p.specs || (catalogMatch ? catalogMatch.specs : null),
        rating: p.rating != null ? p.rating : (catalogMatch ? catalogMatch.rating : null),
        reviewsCount: p.reviewsCount != null ? p.reviewsCount : (catalogMatch ? catalogMatch.reviewsCount : null),
        badge: p.badge || (catalogMatch ? catalogMatch.badge : null),
        stockAvailable: p.stockAvailable
      };
    });
  }, [rawProducts, bundleIndex]);

  // Product Selection State (all selected by default)
  const [selectedIds, setSelectedIds] = useState(() => {
    return new Set(enrichedProducts.map((p) => p.id));
  });

  // Quantity State (default 1 each)
  const [quantities, setQuantities] = useState(() => {
    const map = {};
    enrichedProducts.forEach((p) => {
      map[p.id] = 1;
    });
    return map;
  });

  const [addedAll, setAddedAll] = useState(false);

  const handleToggleSelect = (productId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        if (next.size > 1) {
          next.delete(productId);
        }
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const handleQuantityChange = (productId, newQty) => {
    if (newQty < 1) return;
    setQuantities((prev) => ({ ...prev, [productId]: newQty }));
  };

  // Selected products
  const selectedProducts = enrichedProducts.filter((p) => selectedIds.has(p.id));

  // Compute live bundle total based on selected items & their quantities
  const dynamicTotal = useMemo(() => {
    const allSelectedAtQtyOne =
      selectedIds.size === enrichedProducts.length &&
      Object.values(quantities).every((q) => q === 1);

    if (allSelectedAtQtyOne && bundle?.bundleTotal != null) {
      return bundle.bundleTotal;
    }

    return selectedProducts.reduce((acc, p) => {
      const qty = quantities[p.id] || 1;
      const effectivePrice = p.price != null ? p.price : 999;
      const discount = p.discount || 0;
      const discountedItemPrice = Math.round(effectivePrice * (1 - discount / 100));
      return acc + discountedItemPrice * qty;
    }, 0);
  }, [selectedProducts, quantities, bundle, selectedIds, enrichedProducts]);

  // Original total without bundle discount
  const dynamicOriginalTotal = useMemo(() => {
    return selectedProducts.reduce((acc, p) => {
      const qty = quantities[p.id] || 1;
      const effectivePrice = p.oldPrice || (p.price != null ? Math.round(p.price * 1.15) : 1299);
      return acc + effectivePrice * qty;
    }, 0);
  }, [selectedProducts, quantities]);

  const dynamicSavings = Math.max(0, dynamicOriginalTotal - dynamicTotal);
  const dynamicSavingsPercent =
    dynamicOriginalTotal > 0
      ? Math.round((dynamicSavings / dynamicOriginalTotal) * 100)
      : bundle?.savingsPercentage || 15;

  // Add All to Cart handler
  const handleAddAllToCart = () => {
    if (!onAddToCart || selectedProducts.length === 0) return;

    selectedProducts.forEach((p) => {
      const qty = quantities[p.id] || 1;
      onAddToCart(p, qty);
    });

    setAddedAll(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    setTimeout(() => setAddedAll(false), 2200);
  };

  // Add individual product
  const handleAddIndividual = (product, qty) => {
    if (onAddToCart) {
      onAddToCart(product, qty || quantities[product.id] || 1);
    }
  };

  if (!bundle || enrichedProducts.length === 0) {
    return null;
  }

  const bundleTitle = bundle.name || "Mistral AI Recommended Bundle";
  const bundleDescription = bundle.reason || "Curated by Mistral AI based on your exact requirements and algorithm.";

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-8 transition-shadow hover:shadow-md">
      
      {/* 1. TOP BUNDLE SUMMARY HEADER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2.5 py-0.5 rounded tracking-wider shadow-2xs flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-950" /> Mistral AI Curated
              </span>
              <span className="text-slate-300 text-xs font-semibold">
                {enrichedProducts.length} Products in Package
              </span>
              {bundle.savingsPercentage ? (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded">
                  Save {bundle.savingsPercentage}%
                </span>
              ) : null}
            </div>

            <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              {bundleTitle}
            </h3>
            
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {bundleDescription}
            </p>
          </div>

          {/* Top Bundle Pricing & Add All Action */}
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-4 border border-white/15 shrink-0 flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3">
            <div className="text-left md:text-right">
              <div className="text-[11px] text-slate-300 font-medium">
                Bundle Total ({selectedProducts.length} items):
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  ₹{dynamicTotal.toLocaleString('en-IN')}
                </span>
                {dynamicOriginalTotal > dynamicTotal && (
                  <span className="text-xs text-slate-400 line-through">
                    ₹{dynamicOriginalTotal.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              {dynamicSavings > 0 && (
                <span className="text-xs font-bold text-emerald-400 block mt-0.5">
                  You Save: ₹{dynamicSavings.toLocaleString('en-IN')} ({dynamicSavingsPercent}% off)
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleAddAllToCart}
              className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${
                addedAll
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#FFD814] hover:bg-[#F7CA00] active:scale-98 text-slate-950'
              }`}
            >
              {addedAll ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>All Items Added</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 text-slate-950" />
                  <span>Add All to Cart</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* 2. RESPONSIVE PRODUCT CARDS GRID */}
      <div className="p-4 sm:p-6 bg-slate-50/50">
        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-3">
          <span>Individual Products in this Bundle:</span>
          <span className="text-[11px] text-teal-700">
            {selectedIds.size} of {enrichedProducts.length} items selected
          </span>
        </div>

        {/* Responsive Grid: 4-5 on desktop, 2-3 on tablet, 1-2 on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
          {enrichedProducts.map((prod) => (
            <AmazonProductCard
              key={prod.id}
              product={prod}
              isSelected={selectedIds.has(prod.id)}
              onToggleSelect={handleToggleSelect}
              quantity={quantities[prod.id] || 1}
              onQuantityChange={handleQuantityChange}
              onAddToCart={handleAddIndividual}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      </div>

      {/* 3. BOTTOM BUNDLE CHECKOUT ACTION STRIP */}
      <div className="bg-white border-t border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900">
              Bundle Guarantee & 1-Click Fast Dispatch
            </div>
            <div className="text-[11px] text-slate-500">
              All items verified for compatibility and eligible for Free Fast Delivery.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right">
            <div className="text-[11px] text-slate-400">Total Price:</div>
            <div className="text-xl font-black text-slate-900">
              ₹{dynamicTotal.toLocaleString('en-IN')}
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddAllToCart}
            className={`py-2.5 px-6 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm ${
              addedAll
                ? 'bg-emerald-600 text-white'
                : 'bg-[#FFD814] hover:bg-[#F7CA00] active:scale-98 text-slate-950'
            }`}
          >
            {addedAll ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added All to Cart</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Add {selectedProducts.length} Items to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>

    </section>
  );
}
