import React, { useState, useEffect } from 'react';
import loaderCartImg from '../assets/loader-cart.jpg';

/**
 * LogoLoader - Reusable Reddit-inspired loading animation component.
 * Features:
 * - Centered attached cart illustration
 * - Gentle vertical float + subtle breathing pulse
 * - Smooth orbital ring animation
 * - Dynamic ground shadow responding to vertical float
 * - AI Smart Bundle 2-stage progressive messaging
 * - Reduced motion support (prefers-reduced-motion)
 */
export default function LogoLoader({
  size = 'md',
  text,
  subtext,
  bundleMode = false,
  fullscreen = false,
  showRing = true,
  showShadow = true,
  className = ''
}) {
  // Bundle mode timed progressive messaging
  const [isDelayed, setIsDelayed] = useState(false);

  useEffect(() => {
    if (!bundleMode) return;
    // Transition to delayed message after 4.5 seconds
    const timer = setTimeout(() => {
      setIsDelayed(true);
    }, 4500);

    return () => clearTimeout(timer);
  }, [bundleMode]);

  // Size mapping
  const sizeConfig = {
    sm: {
      image: 'w-24 sm:w-28',
      ringSize: 130,
      shadow: 'w-20 h-2 -mt-1',
      title: 'text-xs sm:text-sm',
      sub: 'text-[11px]',
      container: 'p-3'
    },
    md: {
      image: 'w-36 sm:w-44',
      ringSize: 180,
      shadow: 'w-32 h-2.5 -mt-1.5',
      title: 'text-sm sm:text-base',
      sub: 'text-xs',
      container: 'p-4 sm:p-6'
    },
    lg: {
      image: 'w-48 sm:w-56',
      ringSize: 220,
      shadow: 'w-40 h-3 -mt-2',
      title: 'text-base sm:text-lg',
      sub: 'text-xs sm:text-sm',
      container: 'p-6 sm:p-8'
    },
    fullscreen: {
      image: 'w-44 sm:w-52 md:w-60',
      ringSize: 220,
      shadow: 'w-44 h-3 -mt-2',
      title: 'text-base sm:text-lg',
      sub: 'text-xs sm:text-sm',
      container: 'p-8'
    }
  };

  const currentSize = fullscreen ? sizeConfig.fullscreen : (sizeConfig[size] || sizeConfig.md);

  // Determine text based on bundleMode or direct props
  let primaryText = text;
  let secondaryText = subtext;

  if (bundleMode) {
    if (isDelayed) {
      primaryText = 'It is taking a little longer than expected. Please wait...';
      secondaryText = secondaryText || 'Finalizing the best discount combinations for you.';
    } else {
      primaryText = 'Your bundle will be ready shortly.';
      secondaryText = secondaryText || "We're curating the best matching products for you.";
    }
  }

  const content = (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center text-center select-none ${currentSize.container} ${className}`}
    >
      {/* Visual Centerpiece: Orbital Ring + Floating Cart Illustration */}
      <div className="relative flex items-center justify-center">
        {/* Reddit-inspired Orbital Ring */}
        {showRing && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ width: currentSize.ringSize, height: currentSize.ringSize, margin: 'auto' }}
          >
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full animate-loader-orbit"
            >
              <defs>
                <linearGradient id="loaderRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="1" />
                  <stop offset="50%" stopColor="#00BFA5" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0F172A" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              {/* Subtle background track */}
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="2"
                strokeDasharray="4 6"
                opacity="0.6"
              />
              {/* Vibrant sweeping orbit ring */}
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="url(#loaderRingGrad)"
                strokeWidth="3.5"
                strokeDasharray="90 190"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}

        {/* Floating Cartoon Cart Image */}
        <div className="relative z-10 animate-loader-float px-3 py-2">
          <img
            src={loaderCartImg}
            alt="Loading..."
            className={`${currentSize.image} h-auto object-contain rounded-xl drop-shadow-sm transition-transform duration-300`}
            loading="eager"
          />
        </div>
      </div>

      {/* Dynamic Ground Shadow */}
      {showShadow && (
        <div
          className={`${currentSize.shadow} bg-slate-400/25 rounded-full blur-[2px] animate-loader-shadow mx-auto mb-3 pointer-events-none`}
        />
      )}

      {/* Status Messages with Smooth Fade Transition */}
      {(primaryText || secondaryText) && (
        <div className="mt-3 space-y-1 max-w-sm px-4">
          {primaryText && (
            <h3
              key={primaryText}
              className={`${currentSize.title} font-extrabold text-slate-900 tracking-tight transition-all duration-300 animate-fade-in-slide`}
            >
              {primaryText}
            </h3>
          )}
          {secondaryText && (
            <p className={`${currentSize.sub} text-slate-500 font-medium transition-opacity duration-300`}>
              {secondaryText}
            </p>
          )}

          {/* Micro Progress Indicator */}
          <div className="w-28 h-1 bg-slate-100 rounded-full mx-auto mt-3 overflow-hidden">
            <div className="h-full bg-linear-to-r from-amber-400 to-teal-500 rounded-full animate-[progress_1.6s_ease-in-out_infinite] w-2/3" />
          </div>
        </div>
      )}
    </div>
  );

  // If fullscreen, wrap in fixed overlay
  if (fullscreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#F8FAFC]/90 backdrop-blur-sm transition-all duration-300 animate-in fade-in"
      >
        {content}
      </div>
    );
  }

  return content;
}
