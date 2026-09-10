import React from 'react';
import LogoLoader from './LogoLoader';

export default function BundleSkeletonGrid({ cardCount = 4 }) {
  return (
    <div className="w-full space-y-6">
      {/* Customer-friendly Status Header with LogoLoader */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 text-center shadow-xs">
        <LogoLoader
          size="md"
          bundleMode={true}
          subtext="Finding compatible products and verifying available bundle discounts..."
        />
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
