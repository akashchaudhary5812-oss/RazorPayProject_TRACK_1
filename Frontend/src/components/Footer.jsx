import React from 'react';
import { ShoppingBag, Sparkles, ArrowRight, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 bg-[#0B192C] text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800">
          
          {/* BRAND COLUMN */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#00BFA5] flex items-center justify-center shadow-md shadow-[#00BFA5]/30">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="font-anton text-3xl text-white tracking-wide">
                BUNDLE<span className="text-[#00BFA5]">AI</span>
              </span>
            </div>
            
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed font-medium">
              Next-generation AI commerce platform designed to build, compare, and deliver hyper-discounted product bundles tailored to your lifestyle.
            </p>

            <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-[#00BFA5]" /> 100% Authentic Products & Verified AI Savings
            </div>
          </div>

          {/* NAVIGATION LINKS */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-anton text-lg text-white uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-sm text-slate-400 font-medium">
              <li><a href="#hero" className="hover:text-[#00BFA5] transition-colors">AI Efficient Search</a></li>
              <li><a href="#products" className="hover:text-[#00BFA5] transition-colors">Top Featured Products</a></li>
              <li><a href="#how-it-works" className="hover:text-[#00BFA5] transition-colors">How Neural Bundling Works</a></li>
              <li><a href="#deals" className="hover:text-[#00BFA5] transition-colors">Exclusive Deals</a></li>
            </ul>
          </div>

          {/* NEWSLETTER SUBSCRIBE */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-anton text-lg text-white uppercase tracking-wider">Stay Updated on AI Deals</h4>
            <p className="text-slate-400 text-xs font-medium">
              Get notified when AI algorithms detect flash bundle discounts on top brands.
            </p>
            <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-full border border-slate-800">
              <input
                type="email"
                placeholder="Enter your email..."
                className="bg-transparent text-sm px-3 text-white placeholder-slate-500 focus:outline-none w-full font-medium"
              />
              <button
                onClick={() => alert("Subscribed to BundleAI Deal alerts!")}
                className="bg-[#00BFA5] hover:bg-[#00A892] text-white px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider shrink-0 transition-colors"
              >
                Join
              </button>
            </div>
          </div>

        </div>

        {/* COPYRIGHT BOTTOM BAR */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-medium gap-4">
          <p>© {new Date().getFullYear()} BundleAI Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <a href="#contact" className="hover:text-slate-400 transition-colors">Contact Support</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
