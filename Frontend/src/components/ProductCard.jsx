import React, { useState } from 'react';
import { Star, Heart, Check, Plus, Eye, Zap, ShieldCheck } from 'lucide-react';

export default function ProductCard({
  product,
  isWishlisted = false,
  onToggleWishlist,
  onAddToCart,
  onViewDetails
}) {
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    onToggleWishlist(product);
  };

  const formattedPrice = product.price ? product.price.toLocaleString('en-IN') : '0';
  const formattedOldPrice = product.oldPrice ? product.oldPrice.toLocaleString('en-IN') : null;
  const rating = product.rating || 4.7;
  const reviewsCount = product.reviewsCount || 450;

  return (
    <div
      onClick={() => onViewDetails && onViewDetails(product)}
      className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col justify-between hover:shadow-xl hover:border-slate-300 transition-all duration-300 hover:-translate-y-1 relative group cursor-pointer"
    >
      {/* Top Header: Badge & Wishlist */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2 min-h-[26px]">
          {product.badge ? (
            <span className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full tracking-wider shadow-xs ${
              product.badge.toLowerCase().includes('choice')
                ? 'bg-[#0F172A] text-amber-400'
                : product.badge.toLowerCase().includes('deal')
                ? 'bg-rose-600 text-white'
                : product.badge.toLowerCase().includes('seller')
                ? 'bg-amber-500 text-slate-950'
                : 'bg-teal-700 text-white'
            }`}>
              {product.badge}
            </span>
          ) : (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {product.category || 'Tech'}
            </span>
          )}

          <button
            type="button"
            onClick={handleWishlist}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isWishlisted
                ? 'bg-rose-50 text-rose-500'
                : 'bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50'
            }`}
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Product Image */}
        <div className="w-full h-48 sm:h-52 bg-slate-50/80 rounded-xl overflow-hidden flex items-center justify-center p-3 relative mb-3 group-hover:bg-slate-50 transition-colors">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
          />

          {/* Discount Ribbon Tag */}
          {product.discount > 0 && (
            <span className="absolute bottom-2 left-2 bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-sm">
              -{product.discount}% OFF
            </span>
          )}

          {/* Quick View Button on Hover */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails && onViewDetails(product);
            }}
            className="absolute inset-x-4 bottom-3 bg-slate-900/90 text-white text-xs font-bold py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center gap-1.5 shadow-lg backdrop-blur-xs hover:bg-slate-900"
          >
            <Eye className="w-3.5 h-3.5 text-teal-400" />
            <span>Quick View</span>
          </button>
        </div>

        {/* Brand & Title */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-extrabold text-[#0D9488] tracking-wider uppercase text-[11px]">
              {product.brand}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5">
              <ShieldCheck className="w-3 h-3" /> In Stock
            </span>
          </div>

          <h3 className="font-semibold text-slate-900 text-sm sm:text-base line-clamp-2 leading-snug group-hover:text-[#0D9488] transition-colors" title={product.name}>
            {product.name}
          </h3>

          {/* Star Rating & Reviews */}
          <div className="flex items-center gap-1.5 pt-1">
            <div className="flex items-center text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(rating)
                      ? 'fill-amber-400 text-amber-400'
                      : i < rating
                      ? 'fill-amber-200 text-amber-400'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-700">{rating}</span>
            <span className="text-[11px] text-slate-400">({reviewsCount.toLocaleString()})</span>
          </div>
        </div>
      </div>

      {/* Bottom Area: Pricing, Delivery & Add To Cart */}
      <div className="pt-3 mt-3 border-t border-slate-100">
        <div className="flex items-baseline gap-2">
          <span className="text-xs text-slate-500 font-medium">₹</span>
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {formattedPrice}
          </span>
          {formattedOldPrice && (
            <span className="text-xs text-slate-400 line-through">
              ₹{formattedOldPrice}
            </span>
          )}
        </div>

        {/* Amazon-style Delivery Guarantee */}
        <div className="text-[11px] text-slate-600 mt-1 flex items-center gap-1">
          <span className="font-bold text-teal-700">FREE delivery</span>
          <span className="font-medium text-slate-500">
            {product.deliveryDate || 'Tomorrow'}
          </span>
        </div>

        {/* CTA Buttons */}
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={handleAdd}
            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 shadow-sm ${
              added
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-400 hover:bg-amber-500 active:scale-98 text-slate-950 font-extrabold shadow-amber-400/20'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" /> Added to Cart
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
