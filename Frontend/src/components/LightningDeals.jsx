import React, { useState, useEffect } from 'react';
import { Zap, Clock, ChevronRight, Check, Plus, Flame } from 'lucide-react';
import { LIGHTNING_DEALS, FEATURED_PRODUCTS } from '../data/products';

export default function LightningDeals({ onAddToCart, onViewDetails }) {
  // Live ticking countdown timer
  const [timeLeft, setTimeLeft] = useState(5 * 3600 + 24 * 60 + 18);
  const [addedItems, setAddedItems] = useState({});

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 18000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  const pad = (n) => n.toString().padStart(2, '0');

  const handleAdd = (deal, e) => {
    e.stopPropagation();
    // Find full product object from FEATURED_PRODUCTS or use deal
    const fullProduct = FEATURED_PRODUCTS.find((p) => p.id === deal.id) || {
      id: deal.id,
      name: deal.title,
      price: deal.price,
      oldPrice: deal.oldPrice,
      discount: deal.discount,
      image: deal.image,
      brand: 'TOP BRAND',
      category: deal.category
    };

    onAddToCart(fullProduct);
    setAddedItems((prev) => ({ ...prev, [deal.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [deal.id]: false }));
    }, 1600);
  };

  const handleCardClick = (deal) => {
    const fullProduct = FEATURED_PRODUCTS.find((p) => p.id === deal.id) || {
      id: deal.id,
      name: deal.title,
      price: deal.price,
      oldPrice: deal.oldPrice,
      discount: deal.discount,
      image: deal.image,
      brand: 'TOP BRAND',
      category: deal.category
    };
    onViewDetails && onViewDetails(fullProduct);
  };

  return (
    <section id="deals" className="py-8 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-700/80 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
              <Flame className="w-6 h-6 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-amber-400" /> Limited Time Deals
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Today's Lightning Deals
              </h2>
            </div>
          </div>

          {/* Amazon-style Countdown Timer Box */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-slate-950/70 border border-slate-700/80 px-4 py-2 rounded-2xl backdrop-blur-md">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-slate-300">Ends in:</span>
            <div className="flex items-center gap-1 font-mono font-bold text-sm text-amber-400">
              <span className="bg-slate-800 px-2 py-0.5 rounded text-white">{pad(hours)}</span>
              <span>:</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded text-white">{pad(minutes)}</span>
              <span>:</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded text-white">{pad(seconds)}</span>
            </div>
          </div>
        </div>

        {/* Deals Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-6 relative z-10">
          {LIGHTNING_DEALS.map((deal) => {
            const isAdded = addedItems[deal.id];
            return (
              <div
                key={deal.id}
                onClick={() => handleCardClick(deal)}
                className="bg-white rounded-2xl p-4 text-slate-900 flex flex-col justify-between hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer group"
              >
                <div>
                  {/* Deal Header */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-rose-600 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs">
                      {deal.discount}% OFF
                    </span>
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                      {deal.badge}
                    </span>
                  </div>

                  {/* Image */}
                  <div className="w-full h-40 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-3 mb-3 group-hover:bg-slate-100 transition-colors">
                    <img
                      src={deal.image}
                      alt={deal.title}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-teal-700 transition-colors">
                    {deal.title}
                  </h3>

                  {/* Pricing */}
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-lg font-extrabold text-slate-950">
                      ₹{deal.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      ₹{deal.oldPrice.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Amazon-style Claim Progress Bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                      <span>{deal.claimedPercentage}% Claimed</span>
                      <span className="text-rose-600 font-extrabold">Hurry!</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-rose-600 rounded-full transition-all duration-500"
                        style={{ width: `${deal.claimedPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  type="button"
                  onClick={(e) => handleAdd(deal, e)}
                  className={`mt-4 w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-400 hover:bg-amber-500 text-slate-950 active:scale-98'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" /> Claimed & Added
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Claim Deal
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
