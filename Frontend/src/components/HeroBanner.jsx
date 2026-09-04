import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, ShieldCheck, Zap, Laptop, Smartphone, Headphones, ShoppingBag } from 'lucide-react';

export default function HeroBanner({ onTriggerAISearch, onSelectCategory, onViewDetails, featuredProducts = [] }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 0,
      tag: "EXCLUSIVE AI SHOPPING EVENT",
      title: "Smart AI Bundles, Bigger Savings",
      subtitle: "Let neural algorithms match your gear and unlock stackable discounts up to 30% on top brands.",
      ctaText: "Explore AI Bundles",
      ctaAction: () => onTriggerAISearch("Top AI Recommended Bundle"),
      bgGradient: "from-[#0F172A] via-[#1E293B] to-[#0D9488]",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80",
      badge: "Save Up To ₹64,800"
    },
    {
      id: 1,
      tag: "FLAGSHIP SMARTPHONES & ACCESSORIES",
      title: "Upgrade to Titanium & Pro Power",
      subtitle: "iPhone 15 Pro, Galaxy S24 Ultra, OnePlus 12 with Next-Day Prime Delivery & No-Cost EMI.",
      ctaText: "Shop Flagship Deals",
      ctaAction: () => onSelectCategory && onSelectCategory("Smartphones"),
      bgGradient: "from-[#064E3B] via-[#0D9488] to-[#0F172A]",
      image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80",
      badge: "Up to 25% Off"
    },
    {
      id: 2,
      tag: "CREATOR & WORK FROM HOME ECOSYSTEM",
      title: "High-Performance Workstations",
      subtitle: "M3 MacBooks, Sony WH-1000XM5 studio headphones and iPads engineered for peak productivity.",
      ctaText: "Build Your Setup",
      ctaAction: () => onTriggerAISearch("WFH Creator Workstation"),
      bgGradient: "from-[#1E1B4B] via-[#312E81] to-[#0D9488]",
      image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80",
      badge: "Free Next-Day Delivery"
    }
  ];

  // Auto advance slide every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  // Quick 4-card data
  const phoneProducts = featuredProducts.filter(p => p.category === 'Smartphones').slice(0, 4);
  const audioProducts = featuredProducts.filter(p => p.category === 'Audio').slice(0, 4);
  const laptopProducts = featuredProducts.filter(p => p.category === 'Laptops' || p.category === 'Tablets').slice(0, 4);

  return (
    <div className="relative mb-6">
      {/* HERO PANORAMIC SLIDER */}
      <div className="relative w-full h-[360px] sm:h-[440px] md:h-[500px] overflow-hidden">
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background gradient & image overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient} opacity-95`} />
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute right-0 top-0 w-full lg:w-3/5 h-full object-cover mix-blend-overlay opacity-35 filter brightness-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

              {/* Slide Content */}
              <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 md:px-8 flex flex-col justify-center text-white max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-teal-300 text-xs font-bold tracking-wider uppercase mb-3 w-fit">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  {slide.tag}
                  <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-extrabold ml-1">
                    {slide.badge}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white mb-3">
                  {slide.title}
                </h1>

                <p className="text-sm sm:text-base md:text-lg text-slate-200 font-medium line-clamp-2 max-w-xl mb-6 leading-relaxed">
                  {slide.subtitle}
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={slide.ctaAction}
                    className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold px-6 py-3 rounded-full text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-400/20 active:scale-95 transition-all"
                  >
                    <span>{slide.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onTriggerAISearch()}
                    className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/30 font-bold px-5 py-3 rounded-full text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <span>Try AI Search</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
          title="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
          title="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === idx ? 'w-8 bg-amber-400' : 'w-2 bg-white/50 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </div>

      {/* AMAZON-STYLE 4-QUADRANT FEATURE CARDS (Overlaying bottom of hero) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-20 -mt-16 sm:-mt-24 md:-mt-28">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Flagship Smartphones */}
          <div className="bg-white rounded-2xl p-5 shadow-xl border border-slate-200/80 flex flex-col justify-between hover:shadow-2xl transition-all">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg mb-1">
                Top Deals in Mobiles
              </h3>
              <p className="text-xs text-slate-500 mb-3 font-medium">Up to 25% off latest flagships</p>
              
              <div className="grid grid-cols-2 gap-2 mb-3">
                {(phoneProducts.length > 0 ? phoneProducts : featuredProducts.slice(0, 4)).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onViewDetails && onViewDetails(item)}
                    className="bg-slate-50 hover:bg-slate-100 p-2 rounded-xl cursor-pointer transition-colors text-center group"
                  >
                    <div className="w-full h-16 sm:h-20 flex items-center justify-center mb-1">
                      <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 line-clamp-1">{item.brand}</span>
                    <span className="text-[10px] text-teal-700 font-extrabold">₹{item.price.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onSelectCategory && onSelectCategory("Smartphones")}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 mt-1 uppercase tracking-wider"
            >
              See all smartphones &rarr;
            </button>
          </div>

          {/* Card 2: AI Smart Bundles */}
          <div className="bg-white rounded-2xl p-5 shadow-xl border border-slate-200/80 flex flex-col justify-between hover:shadow-2xl transition-all">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-extrabold text-slate-900 text-lg">
                  AI Smart Bundles
                </h3>
                <span className="bg-teal-500/15 text-teal-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  AI Match
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3 font-medium">Extra savings when paired</p>

              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 rounded-xl p-3.5 space-y-2 mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-bold text-teal-900">Apple Ecosystem Kit</span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">iPhone 15 Pro + MacBook Air + AirPods Pro</p>
                <div className="flex items-center justify-between pt-1 border-t border-teal-200/60">
                  <span className="text-xs font-bold text-slate-500 line-through">₹2,93,700</span>
                  <span className="text-sm font-extrabold text-teal-900">₹2,28,900</span>
                </div>
                <span className="inline-block bg-teal-700 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                  Save ₹64,800 (22% off)
                </span>
              </div>
            </div>

            <button
              onClick={() => onTriggerAISearch("Apple Ecosystem Bundle")}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 mt-1 uppercase tracking-wider"
            >
              Build custom bundle &rarr;
            </button>
          </div>

          {/* Card 3: Noise Canceling Audio */}
          <div className="bg-white rounded-2xl p-5 shadow-xl border border-slate-200/80 flex flex-col justify-between hover:shadow-2xl transition-all">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg mb-1">
                Studio & ANC Audio
              </h3>
              <p className="text-xs text-slate-500 mb-3 font-medium">Crystal clear sound & deep bass</p>

              <div className="grid grid-cols-2 gap-2 mb-3">
                {(audioProducts.length > 0 ? audioProducts : featuredProducts.slice(2, 6)).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onViewDetails && onViewDetails(item)}
                    className="bg-slate-50 hover:bg-slate-100 p-2 rounded-xl cursor-pointer transition-colors text-center group"
                  >
                    <div className="w-full h-16 sm:h-20 flex items-center justify-center mb-1">
                      <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 line-clamp-1">{item.name}</span>
                    <span className="text-[10px] text-teal-700 font-extrabold">₹{item.price.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onSelectCategory && onSelectCategory("Audio")}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 mt-1 uppercase tracking-wider"
            >
              Explore audio gear &rarr;
            </button>
          </div>

          {/* Card 4: Laptops & Performance */}
          <div className="bg-white rounded-2xl p-5 shadow-xl border border-slate-200/80 flex flex-col justify-between hover:shadow-2xl transition-all">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg mb-1">
                Laptops & Computing
              </h3>
              <p className="text-xs text-slate-500 mb-3 font-medium">M3 chips, Intel i7 & OLED screens</p>

              <div className="grid grid-cols-2 gap-2 mb-3">
                {(laptopProducts.length > 0 ? laptopProducts : featuredProducts.slice(1, 5)).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onViewDetails && onViewDetails(item)}
                    className="bg-slate-50 hover:bg-slate-100 p-2 rounded-xl cursor-pointer transition-colors text-center group"
                  >
                    <div className="w-full h-16 sm:h-20 flex items-center justify-center mb-1">
                      <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 line-clamp-1">{item.brand}</span>
                    <span className="text-[10px] text-teal-700 font-extrabold">₹{item.price.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onSelectCategory && onSelectCategory("Laptops")}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 mt-1 uppercase tracking-wider"
            >
              View all laptops &rarr;
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
