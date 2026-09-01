import React from 'react';
import { Sparkles, ArrowRight, Bot } from 'lucide-react';

export default function CTASection({ onTriggerAISearch }) {
  return (
    <section className="py-12 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
      <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-r from-[#0F4C5C] via-[#092D36] to-[#064E3B] p-8 sm:p-12 md:p-16 text-center text-white shadow-2xl shadow-[#0F4C5C]/30 border border-[#00BFA5]/30">
        
        {/* Background Ambient Glow & Neural Ring Pattern */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#00BFA5]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,191,165,0.15)_0%,transparent_70%)] pointer-events-none" />

        {/* Content Box */}
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-teal-200 text-xs sm:text-sm font-semibold">
            <Bot className="w-4 h-4 text-[#00BFA5]" />
            <span>AI-Driven Commerce Protocol</span>
          </div>

          <h2 className="font-anton text-4xl sm:text-6xl md:text-7xl tracking-wide uppercase leading-tight text-white">
            SHOP SMARTER WITH AI
          </h2>

          <p className="text-slate-200 text-base sm:text-xl max-w-2xl mx-auto font-medium leading-relaxed">
            Stop searching items one by one. Let BundleAI compare compatibility, pricing history, and stack discounts into a single checkout.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onTriggerAISearch("Top AI Recommended Bundle")}
              className="w-full sm:w-auto bg-[#00BFA5] hover:bg-[#00A892] text-white px-8 py-4 rounded-full font-extrabold text-sm sm:text-base tracking-wider uppercase flex items-center justify-center gap-3 shadow-lg shadow-[#00BFA5]/40 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>TRY AI SEARCH</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}
