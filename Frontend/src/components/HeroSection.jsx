import React, { useState } from 'react';
import { Search, Sparkles, ShoppingBag, ArrowRight, Zap, Cpu, Bot } from 'lucide-react';

export default function HeroSection({ onTriggerAISearch }) {
  const [query, setQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onTriggerAISearch) {
      onTriggerAISearch(query || "Apple Ecosystem & WFH Bundle");
    }
  };

  const presetQueries = [
    "Apple Ecosystem setup under ₹2.5L",
    "MacBook Air + AirPods Pro bundle",
    "Galaxy S24 Ultra & Wireless audio",
    "WFH Creator Workstation"
  ];

  return (
    <section id="hero" className="pt-6 sm:pt-10 pb-12 sm:pb-20 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* LEFT COLUMN: HERO HEADLINE & AI SEARCH BAR */}
        <div className="lg:col-span-7 flex flex-col items-start space-y-6 text-left">
          
          {/* AI Badge Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00BFA5]/10 border border-[#00BFA5]/30 text-[#064E3B] text-xs sm:text-sm font-semibold shadow-sm">
            <Sparkles className="w-4 h-4 text-[#00BFA5] animate-spin-slow" />
            <span>Next-Gen Smart Shopping Engine</span>
            <span className="bg-[#00BFA5] text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">v2.4 AI</span>
          </div>

          {/* Bold Anton Heading */}
          <h1 className="font-anton text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-[#0F172A] leading-[0.95] uppercase">
            AI EFFICIENT <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00BFA5] via-[#0D9488] to-[#064E3B]">
              SHOPPING
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg md:text-xl text-slate-600 font-medium max-w-2xl leading-relaxed">
            Tell us what you need. Our AI finds the best products and builds the smartest bundles for you.
          </p>

          {/* Large Rounded AI Search Bar */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="w-full max-w-2xl bg-white p-2 sm:p-2.5 rounded-full border border-slate-200/90 shadow-xl shadow-slate-200/60 flex items-center gap-2 transition-all hover:border-[#00BFA5]/50 focus-within:ring-4 focus-within:ring-[#00BFA5]/15 focus-within:border-[#00BFA5]"
          >
            <div className="pl-3 text-slate-400">
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, brands, categories..."
              className="w-full bg-transparent text-sm sm:text-base text-slate-800 placeholder-slate-400 font-medium focus:outline-none px-2"
            />
            <button
              type="submit"
              className="shrink-0 bg-gradient-to-r from-[#00BFA5] to-[#0D9488] hover:from-[#00A892] hover:to-[#064E3B] text-white px-5 sm:px-7 py-3 sm:py-3.5 rounded-full font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center gap-2 shadow-md shadow-[#00BFA5]/30 hover:scale-[1.02] active:scale-95 transition-all duration-200"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>AI SEARCH</span>
            </button>
          </form>

          {/* Quick Preset Prompts */}
          <div className="w-full pt-1 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-[#00BFA5]" /> Try Prompts:
            </span>
            {presetQueries.map((promptText, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(promptText);
                  onTriggerAISearch(promptText);
                }}
                className="text-xs bg-white/80 hover:bg-[#00BFA5]/10 hover:text-[#064E3B] text-slate-600 border border-slate-200/80 hover:border-[#00BFA5]/40 px-3 py-1.5 rounded-full font-semibold transition-all duration-200 shadow-2xs"
              >
                {promptText}
              </button>
            ))}
          </div>

        </div>

        {/* RIGHT COLUMN: FUTURISTIC CIRCULAR AI VISUAL / BADGE */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end relative mt-6 lg:mt-0">
          
          {/* Main Visual Container */}
          <div className="relative w-72 sm:w-80 md:w-96 h-72 sm:h-80 md:h-96 flex items-center justify-center">
            
            {/* Outer Glowing Teal Atmosphere */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#00BFA5]/40 via-[#0D9488]/30 to-[#064E3B]/20 blur-3xl animate-pulse-glow" />

            {/* Glowing Network / Particle Grid Background */}
            <div className="absolute -inset-4 rounded-full border border-[#00BFA5]/20 bg-[radial-gradient(circle_at_center,rgba(0,191,165,0.12)_0%,transparent_70%)] flex items-center justify-center">
              {/* Outer Orbit Ring with glowing dots */}
              <div className="absolute inset-0 rounded-full border border-dashed border-[#00BFA5]/40 animate-spin-slow" />
              <div className="absolute inset-3 rounded-full border border-teal-500/20 animate-spin-reverse" />
              
              {/* Orbiting particles */}
              <div className="absolute w-full h-full animate-spin-slow">
                <span className="absolute top-2 left-1/2 w-3 h-3 bg-[#00BFA5] rounded-full shadow-[0_0_12px_#00BFA5]" />
                <span className="absolute bottom-4 right-1/4 w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_8px_#F59E0B]" />
                <span className="absolute top-1/3 left-4 w-2.5 h-2.5 bg-teal-300 rounded-full shadow-[0_0_10px_#5EEAD4]" />
              </div>
            </div>

            {/* Center Circular Dark Teal Badge (Matching user's image exactly!) */}
            <div 
              onClick={() => onTriggerAISearch("AI Efficient Search")}
              className="relative w-56 sm:w-64 md:w-72 h-56 sm:h-64 md:h-72 rounded-full bg-gradient-to-b from-[#0F4C5C] via-[#092D36] to-[#041E24] border-4 border-[#00BFA5] shadow-[0_0_40px_rgba(0,191,165,0.45)] flex flex-col items-center justify-center p-6 text-center cursor-pointer group hover:scale-105 transition-all duration-300"
            >
              {/* Internal Cyan Glow Ring */}
              <div className="absolute inset-2 rounded-full border border-[#00BFA5]/40 group-hover:border-[#00BFA5] transition-colors" />

              {/* Center Shopping Bag Icon */}
              <div className="relative mb-3 p-4 rounded-2xl bg-[#00BFA5]/20 border border-[#00BFA5]/50 group-hover:bg-[#00BFA5] transition-all duration-300 shadow-lg shadow-[#00BFA5]/30">
                <ShoppingBag className="w-9 h-9 sm:w-11 sm:h-11 text-[#00BFA5] group-hover:text-white transition-colors" />
                <Sparkles className="w-5 h-5 text-amber-300 absolute -top-1 -right-1 animate-bounce" />
              </div>

              {/* Label matching image: AI EFFICIENT SEARCH */}
              <h2 className="font-anton text-2xl sm:text-3xl text-white tracking-wider leading-tight uppercase group-hover:text-[#00BFA5] transition-colors">
                AI EFFICIENT <br /> SEARCH
              </h2>
              
              <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-teal-200 bg-[#00BFA5]/20 px-3 py-1 rounded-full border border-[#00BFA5]/30">
                <Cpu className="w-3 h-3 text-[#00BFA5]" /> Neural Bundling Engine
              </div>
            </div>

            {/* Floating Live AI Chip Badges */}
            <div className="absolute -top-2 right-2 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-2 animate-float">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold text-slate-800">24% Avg. Savings</span>
            </div>

            <div className="absolute -bottom-2 -left-2 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-2 animate-float [animation-delay:1.5s]">
              <Bot className="w-4 h-4 text-[#00BFA5]" />
              <span className="text-xs font-bold text-slate-800">10,000+ AI Match Scans</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
