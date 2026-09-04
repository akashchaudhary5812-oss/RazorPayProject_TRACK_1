import React, { useState } from 'react';
import { Star, Check, Plus, Minus, ShoppingCart, Eye, Package, ShieldCheck } from 'lucide-react';

export default function AmazonProductCard({
  product,
  isSelected = true,
  onToggleSelect,
  onAddToCart,
  onViewDetails,
  onQuantityChange,
  quantity = 1
}) {
  const [imgError, setImgError] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product, quantity);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1600);
    }
  };

  const handleQtyMinus = (e) => {
    e.stopPropagation();
    if (quantity > 1 && onQuantityChange) {
      onQuantityChange(product.id || product.productId, quantity - 1);
    }
  };

  const handleQtyPlus = (e) => {
    e.stopPropagation();
    if (onQuantityChange) {
      onQuantityChange(product.id || product.productId, quantity + 1);
    }
  };

  // Determine pricing & discount
  const price = product.price != null ? Number(product.price) : null;
  const discount = product.discount != null && Number(product.discount) > 0 ? Number(product.discount) : null;
  const originalPrice = product.oldPrice != null
    ? Number(product.oldPrice)
    : (price != null && discount ? Math.round(price / (1 - (discount / 100))) : null);

  // Derive badge only when data actually supports it
  let derivedBadge = null;
  if (product.badge) {
    derivedBadge = product.badge;
  } else if (discount && discount >= 20) {
    derivedBadge = "Great Value";
  } else if (product.isTopPick || product.recommended) {
    derivedBadge = "Recommended";
  } else if (product.stockAvailable && product.stockAvailable < 15) {
    derivedBadge = "Only a few left";
  }

  // Authentic rating (only show if data is actually present in product)
  const hasRating = product.rating != null && !isNaN(Number(product.rating));
  const ratingVal = hasRating ? Number(product.rating) : null;
  const reviewsCount = product.reviewsCount != null ? Number(product.reviewsCount) : null;

  return (
    <div
      onClick={() => {
        if (onViewDetails) onViewDetails(product);
      }}
      className={`bg-white rounded-xl border transition-all duration-200 flex flex-col justify-between p-3.5 relative group cursor-pointer ${
        isSelected
          ? 'border-slate-200 hover:border-slate-400 hover:shadow-md'
          : 'border-slate-200 opacity-60 bg-slate-50/50'
      }`}
    >
      <div>
        {/* Top bar: Selection checkbox & Badge */}
        <div className="flex items-center justify-between gap-2 mb-2 min-h-[22px]">
          {onToggleSelect ? (
            <label
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelect(product.id || product.productId)}
                className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer accent-teal-700"
              />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Include
              </span>
            </label>
          ) : (
            <span />
          )}

          {derivedBadge && (
            <span
              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-wider shadow-2xs ${
                derivedBadge === "Great Value"
                  ? "bg-rose-600 text-white"
                  : derivedBadge === "Recommended"
                  ? "bg-teal-700 text-white"
                  : derivedBadge.toLowerCase().includes("left")
                  ? "bg-amber-600 text-white"
                  : "bg-slate-900 text-amber-400"
              }`}
            >
              {derivedBadge}
            </span>
          )}
        </div>

        {/* Product Image Stage */}
        <div className="w-full h-44 sm:h-48 bg-white rounded-lg flex items-center justify-center p-2 mb-2.5 relative overflow-hidden">
          {product.image && !imgError ? (
            <img
              src={product.image}
              alt={product.name || product.productName || "Product"}
              loading="lazy"
              onError={() => setImgError(true)}
              className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            /* Clean SVG Placeholder for missing or failed images */
            <div className="w-full h-full rounded-lg bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center text-slate-400 border border-slate-200/60 p-3">
              <Package className="w-10 h-10 stroke-1 text-slate-400 mb-1" />
              <span className="text-[11px] font-semibold text-slate-500 text-center line-clamp-1">
                {product.brand || product.brandName || "Amazon"}
              </span>
              <span className="text-[9px] text-slate-400">Authentic Catalog Item</span>
            </div>
          )}

          {/* Quick View Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onViewDetails) {
                onViewDetails(product);
              }
            }}
            className="absolute inset-x-3 bottom-2 bg-slate-900/90 text-white text-[11px] font-bold py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center gap-1.5 shadow-md backdrop-blur-xs"
          >
            <Eye className="w-3.5 h-3.5 text-teal-400" />
            <span>Quick Look</span>
          </button>
        </div>

        {/* Brand & Category */}
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 mb-0.5 flex items-center justify-between">
          <span>{product.brand || product.brandName || "Brand"}</span>
          {product.category && (
            <span className="text-slate-400 font-medium lowercase">in {product.category}</span>
          )}
        </div>

        {/* Title */}
        <h4
          className="font-medium text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-teal-700 transition-colors"
          title={product.name || product.productName}
        >
          {product.name || product.productName}
        </h4>

        {/* Short Description (if present) */}
        {product.description && (
          <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 font-normal">
            {product.description}
          </p>
        )}

        {/* Authentic Rating & Reviews - ONLY rendered when data exists */}
        {hasRating && (
          <div className="flex items-center gap-1 pt-1.5">
            <div className="flex items-center text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(ratingVal)
                      ? 'fill-amber-400 text-amber-400'
                      : i < ratingVal
                      ? 'fill-amber-200 text-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-bold text-slate-700">{ratingVal}</span>
            {reviewsCount != null && (
              <span className="text-[10px] text-slate-400">({reviewsCount.toLocaleString()})</span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Area: Pricing, Delivery & CTA */}
      <div className="pt-2.5 mt-2 border-t border-slate-100">
        {price != null ? (
          <div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xs font-normal text-slate-600">₹</span>
              <span className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                {price.toLocaleString('en-IN')}
              </span>
              {originalPrice && originalPrice > price && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              {discount && (
                <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {discount}% off
                </span>
              )}
            </div>

            <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-teal-700 shrink-0" />
              <span>Free delivery eligible</span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 italic">Price not listed</div>
        )}

        {/* Quantity Controls & Add to Cart Button */}
        <div className="mt-2.5 flex items-center gap-2">
          {onQuantityChange && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center border border-slate-300 rounded-lg bg-slate-50 overflow-hidden shrink-0"
            >
              <button
                type="button"
                onClick={handleQtyMinus}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="w-7 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition-colors"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-6 text-center text-xs font-bold text-slate-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleQtyPlus}
                aria-label="Increase quantity"
                className="w-7 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleAdd}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-[#FFD814] hover:bg-[#F7CA00] active:scale-98 text-slate-950'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5 text-slate-900" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
