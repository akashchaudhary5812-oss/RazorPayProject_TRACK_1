import React, { useState } from 'react';
import { ShoppingBag, Heart, User, Sparkles, Menu, X, Search, MapPin, ChevronDown, Flame, Globe } from 'lucide-react';
import { CATEGORIES } from '../data/products';

export default function Navbar({
  cartCount = 0,
  wishlistCount = 0,
  cartTotal = 0,
  onOpenCart,
  onOpenWishlist,
  onOpenProfile,
  onOpenCategoryDrawer,
  onTriggerAISearch,
  onSearchSubmit,
  onSelectCategory,
  onOpenDeals,
  currentUser
}) {
  const [searchInput, setSearchInput] = useState('');
  const [selectedSearchCategory, setSelectedSearchCategory] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(searchInput, selectedSearchCategory);
    }
  };

  const navLinks = [
    { name: "Today's Deals", action: onOpenDeals },
    { name: "Mobile Phones", action: () => onSelectCategory && onSelectCategory('Smartphones') },
    { name: "Laptops & PCs", action: () => onSelectCategory && onSelectCategory('Laptops') },
    { name: "Headphones & Audio", action: () => onSelectCategory && onSelectCategory('Audio') },
    { name: "Tablets", action: () => onSelectCategory && onSelectCategory('Tablets') },
    { name: "AI Smart Bundles", action: () => onTriggerAISearch && onTriggerAISearch("Top AI Recommended Bundle") },
    { name: "Customer Service", action: () => alert("BundleAI 24/7 Customer Support: 1800-BUNDLE-AI (toll-free)") }
  ];

  return (
    <header className="sticky top-0 z-40 w-full shadow-md">
      
      {/* 1. TOP UTILITY STRIP (Amazon-style deliver-to, language, help) */}
      <div className="bg-[#0F172A] text-slate-300 text-xs px-4 sm:px-6 py-1.5 flex items-center justify-between border-b border-slate-800 hidden md:flex">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-300 hover:text-white cursor-pointer transition-colors">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Deliver to <strong>Abhishek</strong> - New Delhi 110001</span>
          </div>
          <span className="text-slate-700">|</span>
          <span className="text-teal-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Guaranteed Authentic Brand Warranties
          </span>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1 hover:text-white cursor-pointer">
            <Globe className="w-3.5 h-3.5" />
            <span>EN / INR ₹</span>
          </div>
          <a href="#how-it-works" className="hover:text-white transition-colors">How Bundling Works</a>
          <button onClick={() => alert("Customer Support: support@bundleai.com")} className="hover:text-white transition-colors">Help & FAQ</button>
        </div>
      </div>

      {/* 2. MAIN HEADER BAR (Dark Slate/Navy high-contrast e-commerce bar) */}
      <div className="bg-[#1E293B] px-4 sm:px-6 py-2.5 sm:py-3 text-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
          
          {/* LOGO */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenCategoryDrawer}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-lg md:hidden"
              title="Open Navigation"
            >
              <Menu className="w-6 h-6" />
            </button>

            <a href="#" className="flex items-center gap-2 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#00BFA5] via-[#0D9488] to-emerald-600 flex items-center justify-center shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-anton text-2xl sm:text-3xl tracking-wide text-white leading-none">
                  BUNDLE<span className="text-[#00BFA5]">AI</span>
                </span>
                <span className="text-[9px] text-teal-300 font-bold uppercase tracking-widest hidden sm:block">
                  Smart E-Commerce
                </span>
              </div>
            </a>
          </div>

          {/* PROMINENT CENTRAL SEARCH BAR */}
          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-2xl hidden md:flex items-center bg-white rounded-xl overflow-hidden shadow-inner border border-transparent focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/40"
          >
            {/* Category Dropdown */}
            <select
              value={selectedSearchCategory}
              onChange={(e) => setSelectedSearchCategory(e.target.value)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2.5 border-r border-slate-300 focus:outline-none cursor-pointer shrink-0"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Input */}
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search BundleAI, brands, products or ask for deals..."
              className="w-full px-3 py-2 text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-none"
            />

            {/* Search Button */}
            <button
              type="submit"
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 px-4 py-2.5 flex items-center justify-center transition-colors shrink-0"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* AI Assistant Quick Pill */}
            <button
              type="button"
              onClick={() => onTriggerAISearch && onTriggerAISearch(searchInput)}
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-extrabold px-3 py-2.5 flex items-center gap-1 shrink-0 transition-colors"
              title="Ask AI to bundle deals"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden lg:inline">AI SEARCH</span>
            </button>
          </form>

          {/* RIGHT ACTION CLUSTER */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            
            {/* Account & Lists Area */}
            <button
              onClick={onOpenProfile}
              className="text-left px-2 sm:px-3 py-1.5 rounded-xl hover:bg-slate-700/60 transition-colors flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-700 text-teal-300 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:block">
                <span className="text-[11px] text-slate-300 block leading-tight">
                  {currentUser ? `Hello, ${currentUser.userName || 'Shopper'}` : 'Hello, Sign in'}
                </span>
                <span className="text-xs font-extrabold text-white flex items-center gap-0.5 leading-tight">
                  Account & Lists <ChevronDown className="w-3 h-3 text-slate-400" />
                </span>
              </div>
            </button>

            {/* Wishlist */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Icon & Total Preview */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-2 p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors group"
              title="Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-6 h-6 text-white group-hover:scale-105 transition-transform" />
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 text-slate-950 text-xs font-black rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              </div>
              <div className="hidden lg:block text-left">
                <span className="text-[10px] text-slate-300 block uppercase font-bold leading-none">Cart</span>
                <span className="text-xs font-extrabold text-amber-400 leading-tight">
                  ₹{cartTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </button>

          </div>

        </div>

        {/* MOBILE SEARCH BAR */}
        <form onSubmit={handleSearch} className="mt-2.5 md:hidden flex items-center bg-white rounded-xl overflow-hidden shadow-inner">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products or ask AI..."
            className="w-full px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          <button type="submit" className="bg-amber-400 text-slate-950 p-2 px-3">
            <Search className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onTriggerAISearch && onTriggerAISearch(searchInput)}
            className="bg-teal-600 text-white p-2 px-3"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
          </button>
        </form>
      </div>

      {/* 3. SECONDARY SUB-NAV BAR (Amazon "All" & Quick department links) */}
      <div className="bg-[#0F172A] px-4 sm:px-6 py-1.5 text-white border-t border-slate-750 flex items-center justify-between overflow-x-auto text-xs font-semibold no-scrollbar">
        <div className="flex items-center gap-2 shrink-0">
          
          {/* "☰ All" Drawer Trigger */}
          <button
            onClick={onOpenCategoryDrawer}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-slate-700/60 font-bold transition-colors shrink-0 text-white"
          >
            <Menu className="w-4 h-4" />
            <span>All</span>
          </button>

          {/* Quick Department Links */}
          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={link.action}
                className="px-2.5 py-1 rounded-md hover:bg-slate-700/60 text-slate-200 hover:text-white transition-colors whitespace-nowrap"
              >
                {link.name}
              </button>
            ))}
          </div>

        </div>

        {/* Right side promo pill */}
        <button
          onClick={() => onTriggerAISearch && onTriggerAISearch("Top AI Recommended Bundle")}
          className="hidden md:flex items-center gap-1 text-teal-400 hover:text-teal-300 shrink-0 font-bold"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Save up to 30% with AI Bundles</span>
        </button>
      </div>

    </header>
  );
}
