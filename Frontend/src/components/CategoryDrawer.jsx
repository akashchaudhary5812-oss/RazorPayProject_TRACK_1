import React from 'react';
import { X, User, ChevronRight, Sparkles, Flame, Smartphone, Laptop, Headphones, Tablet, Watch, Gamepad2, HelpCircle, LogIn, ShoppingBag, ShieldCheck } from 'lucide-react';
import { CATEGORIES } from '../data/products';

export default function CategoryDrawer({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
  onSelectCategory,
  onTriggerAISearch,
  onOpenDeals
}) {
  if (!isOpen) return null;

  const iconMap = {
    Smartphone: <Smartphone className="w-4 h-4 text-teal-600" />,
    Laptop: <Laptop className="w-4 h-4 text-teal-600" />,
    Headphones: <Headphones className="w-4 h-4 text-teal-600" />,
    Tablet: <Tablet className="w-4 h-4 text-teal-600" />,
    Watch: <Watch className="w-4 h-4 text-teal-600" />,
    Gamepad2: <Gamepad2 className="w-4 h-4 text-teal-600" />
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300">
        
        {/* Top Header: User Profile Greeting */}
        <div>
          <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
            <div
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center border border-teal-400/40 group-hover:scale-105 transition-transform">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-300 block">Hello,</span>
                <span className="font-bold text-base text-white group-hover:text-amber-400 transition-colors">
                  {currentUser ? currentUser.userName || currentUser.email : "Sign In / Register"}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Menu Sections */}
          <div className="p-4 space-y-6">
            
            {/* Section 1: Trending & Highlights */}
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-3 pb-1">
                Trending & Deals
              </h4>

              <button
                onClick={() => {
                  onClose();
                  onOpenDeals && onOpenDeals();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 transition-colors text-left text-sm font-semibold text-slate-800"
              >
                <div className="flex items-center gap-3">
                  <Flame className="w-4 h-4 text-rose-600" />
                  <span>Today's Lightning Deals</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  onTriggerAISearch("Top AI Recommended Bundle");
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 transition-colors text-left text-sm font-semibold text-slate-800"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>AI Smart Bundles (Up to 30% Off)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <hr className="border-slate-100" />

            {/* Section 2: Shop by Department */}
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-3 pb-1">
                Shop By Department
              </h4>

              {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onClose();
                    onSelectCategory && onSelectCategory(cat.id);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 transition-colors text-left text-sm font-semibold text-slate-800"
                >
                  <div className="flex items-center gap-3">
                    {iconMap[cat.icon] || <ShoppingBag className="w-4 h-4 text-teal-600" />}
                    <span>{cat.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>

            <hr className="border-slate-100" />

            {/* Section 3: Programs & AI Features */}
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-3 pb-1">
                Programs & Features
              </h4>

              <button
                onClick={() => {
                  onClose();
                  onTriggerAISearch();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-teal-50 text-teal-800 transition-colors text-left text-sm font-bold"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>AI Semantic Search Engine</span>
                </div>
                <span className="bg-teal-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">v2.4</span>
              </button>

              <div className="p-3 text-xs text-slate-500 font-medium flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Verified Authentic Products</span>
              </div>
            </div>

          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 font-medium flex items-center justify-between">
          <span>BundleAI E-Commerce v2.4</span>
          <button
            onClick={() => {
              onClose();
              onOpenAuth();
            }}
            className="text-teal-700 font-bold hover:underline"
          >
            {currentUser ? "Account Details" : "Sign In"}
          </button>
        </div>

      </div>
    </div>
  );
}
