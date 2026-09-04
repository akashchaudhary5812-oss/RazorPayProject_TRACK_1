import React from 'react';
import { ShoppingBag, ChevronUp, Globe, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-16 bg-[#0F172A] text-slate-300 border-t border-slate-800">
      
      {/* 1. BACK TO TOP BAR */}
      <button
        onClick={scrollToTop}
        className="w-full py-4 bg-[#1E293B] hover:bg-[#334155] text-white text-xs font-extrabold uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors"
      >
        <ChevronUp className="w-4 h-4" />
        <span>Back to Top</span>
      </button>

      {/* 2. MAIN 4-COLUMN LINKS CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800 text-xs">
          
          {/* Column 1: Get to Know Us */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">
              Get to Know Us
            </h4>
            <ul className="space-y-2 text-slate-400 font-medium">
              <li><a href="#" className="hover:text-white hover:underline transition-colors">About IntentCartAI</a></li>
              <li><a href="#" className="hover:text-white hover:underline transition-colors">Careers & AI Research</a></li>
              <li><a href="#" className="hover:text-white hover:underline transition-colors">Press Releases</a></li>
              <li><a href="#" className="hover:text-white hover:underline transition-colors">IntentCartAI Science & Algorithms</a></li>
            </ul>
          </div>

          {/* Column 2: Connect with Us */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">
              Connect with Us
            </h4>
            <ul className="space-y-2 text-slate-400 font-medium">
              <li><a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white hover:underline transition-colors">Twitter / X</a></li>
              <li><a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white hover:underline transition-colors">Facebook</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white hover:underline transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-white hover:underline transition-colors">Developer Community</a></li>
            </ul>
          </div>

          {/* Column 3: Make Money with Us */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">
              Make Money with Us
            </h4>
            <ul className="space-y-2 text-slate-400 font-medium">
              <li><a href="#" className="hover:text-white hover:underline transition-colors">Sell on IntentCartAI</a></li>
              <li><a href="#" className="hover:text-white hover:underline transition-colors">Protect & Build Your Brand</a></li>
              <li><a href="#" className="hover:text-white hover:underline transition-colors">Become an Affiliate</a></li>
              <li><a href="#" className="hover:text-white hover:underline transition-colors">Advertise Your Products</a></li>
            </ul>
          </div>

          {/* Column 4: Let Us Help You */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-sm uppercase tracking-wider">
              Let Us Help You
            </h4>
            <ul className="space-y-2 text-slate-400 font-medium">
              <li><a href="#" className="hover:text-white hover:underline transition-colors">Your Account & Orders</a></li>
              <li><a href="#" className="hover:text-white hover:underline transition-colors">Returns & Replacements</a></li>
              <li><a href="#" className="hover:text-white hover:underline transition-colors">100% Purchase Protection</a></li>
              <li><a href="#" className="hover:text-white hover:underline transition-colors">Help Center & Support</a></li>
            </ul>
          </div>

        </div>

        {/* 3. LOGO & REGIONAL BAR */}
        <div className="pt-8 pb-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <img
              src="https://ik.imagekit.io/8uutsqtnj/INTENT_CART_AI_LOGO.png"
              alt="IntentCartAI Logo"
              className="w-8 h-8 rounded-lg object-contain bg-white/10 p-0.5 border border-white/20"
            />
            <span className="font-anton text-2xl text-white tracking-wide">
              INTENT<span className="text-[#00BFA5]">CART</span><span className="text-amber-400 text-lg ml-0.5">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white">
              <Globe className="w-3.5 h-3.5 text-teal-400" />
              <span>English</span>
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300">
              <span className="text-amber-400 font-bold">₹</span>
              <span>INR - Indian Rupee</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300">
              <span>India</span>
            </div>
          </div>
        </div>

        {/* 4. COPYRIGHT & LEGAL NOTICES */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-medium gap-3">
          <p>© {new Date().getFullYear()} IntentCartAI Technologies Inc. or its affiliates. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-slate-300 transition-colors">Conditions of Use</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Notice</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Interest-Based Ads</a>
          </div>
        </div>

      </div>

    </footer>
  );
}
