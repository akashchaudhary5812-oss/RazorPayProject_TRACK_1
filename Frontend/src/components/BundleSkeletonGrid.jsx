import React, { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';

export default function BundleSkeletonGrid({ cardCount = 4 }) {
  const [loadingPhase, setLoadingPhase] = useState(0);

  useEffect(() => {
    // Stage 1 -> Stage 2 after 3.5s
    const timer1 = setTimeout(() => {
      setLoadingPhase(1);
    }, 3500);

    // Stage 2 -> Stage 3 after 7.5s
    const timer2 = setTimeout(() => {
      setLoadingPhase(2);
    }, 7500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Customer-friendly Timed Status Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 text-center shadow-xs">
        <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
          <ShoppingBag className="w-5 h-5 animate-bounce" />
        </div>

        {loadingPhase === 0 && (
          <div className="space-y-1 transition-all duration-300">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Your bundle will be ready shortly.
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              We're putting together the best products for you.
            </p>
          </div>
        )}

        {loadingPhase === 1 && (
          <div className="space-y-1 transition-all duration-300">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              It's taking a little longer than usual.
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Finding compatible products and verifying available bundle discounts...
            </p>
          </div>
        )}

        {loadingPhase >= 2 && (
          <div className="space-y-1 transition-all duration-300">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              We're still preparing your bundle. Please wait a moment.
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Finalizing your custom product combination and pricing...
            </p>
          </div>
        )}

        {/* Subtle Progress Bar */}
        <div className="w-48 h-1 bg-slate-100 rounded-full mx-auto mt-4 overflow-hidden">
          <div className="h-full bg-amber-400 rounded-full animate-[progress_1.8s_ease-in-out_infinite] w-2/3" />
        </div>
      </div>

      {/* Top Summary Bar Skeleton */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-36 bg-slate-200 rounded" />
          <div className="h-3 w-24 bg-slate-100 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-6 w-24 bg-slate-200 rounded" />
          <div className="h-9 w-32 bg-slate-200 rounded-lg" />
        </div>
      </div>

      {/* Amazon-Style Skeleton Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
        {[...Array(cardCount)].map((_, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border border-slate-200 p-3.5 flex flex-col justify-between space-y-3"
          >
            <div>
              {/* Checkbox & Badge placeholder */}
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-14 bg-slate-100 rounded" />
                <div className="h-4 w-16 bg-slate-200 rounded" />
              </div>

              {/* Image Placeholder */}
              <div className="w-full h-44 sm:h-48 bg-slate-100 rounded-lg flex items-center justify-center mb-2.5">
                <div className="w-12 h-12 rounded-full bg-slate-200/70" />
              </div>

              {/* Brand & Title Placeholders */}
              <div className="h-3 w-16 bg-slate-200 rounded mb-1.5" />
              <div className="space-y-1.5 mb-2">
                <div className="h-3.5 w-full bg-slate-200 rounded" />
                <div className="h-3.5 w-4/5 bg-slate-200 rounded" />
              </div>

              {/* Rating Placeholder */}
              <div className="flex items-center gap-1.5 pt-1">
                <div className="h-3 w-20 bg-slate-200 rounded" />
                <div className="h-3 w-8 bg-slate-100 rounded" />
              </div>
            </div>

            {/* Price & Button Placeholder */}
            <div className="pt-2.5 border-t border-slate-100 space-y-2.5">
              <div className="flex items-baseline gap-2">
                <div className="h-5 w-20 bg-slate-200 rounded" />
                <div className="h-3 w-12 bg-slate-100 rounded" />
              </div>
              <div className="h-3 w-28 bg-slate-100 rounded" />
              <div className="h-8 w-full bg-slate-200 rounded-lg mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
