import React, { useState } from 'react';
import { X, Star, Heart, ShieldCheck, Truck, RotateCcw, Check, Plus, ShoppingBag, Zap, Sparkles, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ProductDetailsModal({
  product,
  isOpen,
  onClose,
  isWishlisted = false,
  onToggleWishlist,
  onAddToCart,
  onBuyNow
}) {
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  if (!isOpen || !product) return null;

  const images = [
    product.image,
    // Add variations / angles if single image
    product.image,
    product.image
  ];

  const formattedPrice = product.price ? product.price.toLocaleString('en-IN') : '0';
  const formattedOldPrice = product.oldPrice ? product.oldPrice.toLocaleString('en-IN') : null;
  const rating = product.rating || 4.8;
  const reviewsCount = product.reviewsCount || 1240;

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }
    setAdded(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuy = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }
    onClose();
    if (onBuyNow) onBuyNow();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative flex flex-col justify-between">
        
        {/* Sticky Header with Close Button */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-20">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Home</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>{product.category || 'Electronics'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 font-bold">{product.brand}</span>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Body: Amazon 3-Column Layout */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: PRODUCT GALLERY (col-span-5) */}
          <div className="md:col-span-5 flex flex-col items-center">
            {/* Main Stage Image */}
            <div className="w-full h-72 sm:h-96 rounded-2xl bg-slate-50 border border-slate-100 p-6 flex items-center justify-center relative overflow-hidden group">
              <img
                src={images[activeImage]}
                alt={product.name}
                className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
              />

              {product.discount > 0 && (
                <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-sm">
                  {product.discount}% OFF
                </span>
              )}

              <button
                onClick={() => onToggleWishlist(product)}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all ${
                  isWishlisted
                    ? 'bg-rose-50 text-rose-500'
                    : 'bg-white text-slate-400 hover:text-rose-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>

            {/* Thumbnail Strip */}
            <div className="flex items-center gap-3 mt-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-16 h-16 rounded-xl border-2 p-1 bg-slate-50 transition-all ${
                    activeImage === idx ? 'border-teal-600 shadow-sm' : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-contain mix-blend-multiply" />
                </button>
              ))}
            </div>
          </div>

          {/* MIDDLE COLUMN: PRODUCT INFO & SPECS (col-span-4) */}
          <div className="md:col-span-4 space-y-4">
            <div>
              <span className="text-xs font-extrabold text-teal-700 tracking-widest uppercase block mb-1">
                Brand: {product.brand}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {product.name}
              </h1>
            </div>

            {/* Ratings & Reviews */}
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(rating)
                        ? 'fill-amber-400 text-amber-400'
                        : i < rating
                        ? 'fill-amber-200 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-800">{rating}</span>
              <span className="text-xs text-teal-700 font-semibold hover:underline cursor-pointer">
                {reviewsCount.toLocaleString()} ratings
              </span>
            </div>

            {/* Pricing Section */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-rose-600 font-bold text-lg">-{product.discount}%</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  ₹{formattedPrice}
                </span>
              </div>
              {formattedOldPrice && (
                <div className="text-xs text-slate-400 font-medium">
                  M.R.P.: <span className="line-through">₹{formattedOldPrice}</span> (Inclusive of all taxes)
                </div>
              )}
              <div className="text-xs text-slate-600 font-medium">
                EMI starts at <span className="font-bold text-slate-900">₹{Math.round(product.price / 12).toLocaleString('en-IN')}/month</span>. No Cost EMI available.
              </div>
            </div>

            {/* About Item / Key Specs */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                About This Item
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {product.description || "Designed with cutting-edge materials and state-of-the-art silicon architecture. Engineered for demanding productivity and everyday reliability."}
              </p>

              {product.specs && product.specs.length > 0 && (
                <ul className="space-y-1.5 pt-2">
                  {product.specs.map((spec, i) => (
                    <li key={i} className="text-xs text-slate-700 font-medium flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: AMAZON BUY BOX (col-span-3) */}
          <div className="md:col-span-3 bg-slate-50/80 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm space-y-4">
            <div>
              <div className="text-xl font-extrabold text-slate-900">
                ₹{formattedPrice}
              </div>

              <div className="text-xs text-slate-600 mt-2 space-y-1.5">
                <div className="flex items-center gap-1.5 text-teal-700 font-bold">
                  <Truck className="w-4 h-4" />
                  <span>FREE Delivery {product.deliveryDate || 'Tomorrow'}</span>
                </div>
                <div className="text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>In Stock</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  Ships from: <strong className="text-slate-800">IntentCartAI Express</strong>
                </div>
                <div className="text-[11px] text-slate-500">
                  Sold by: <strong className="text-slate-800">Verified Direct Brand Retail</strong>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mt-4">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Quantity:
                </label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'unit' : 'units'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleAdd}
                className={`w-full py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-400 hover:bg-amber-500 active:scale-98 text-slate-950 shadow-amber-400/20'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuy}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all shadow-orange-500/20"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Buy Now</span>
              </button>
            </div>

            {/* Security Guarantee Strip */}
            <div className="pt-2 border-t border-slate-200 text-center text-[10px] font-semibold text-slate-500 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>Secure transaction • 7-day returnable</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
