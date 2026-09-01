import React, { useState } from 'react';
import { ShoppingBag, Heart, User, Sparkles, Menu, X, ChevronDown } from 'lucide-react';

export default function Navbar({ cartCount = 0, wishlistCount = 0, onOpenCart, onOpenWishlist, onOpenProfile }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('Home');

  const navLinks = [
    { name: 'Home', href: '#hero' },
    { name: 'Categories', href: '#products' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Deals', href: '#deals' },
  ];

  return (
    <header className="sticky top-3 z-50 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto transition-all">
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-full shadow-lg shadow-slate-900/5 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
        
        {/* LOGO */}
        <a href="#hero" className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00BFA5] via-[#0D9488] to-[#064E3B] flex items-center justify-center shadow-md shadow-[#00BFA5]/25 group-hover:scale-105 transition-transform duration-300">
            <ShoppingBag className="w-5 h-5 text-white" />
            <Sparkles className="w-3 h-3 text-amber-300 absolute top-1 right-1 animate-pulse" />
          </div>
          <span className="font-anton text-2xl sm:text-3xl tracking-wide text-[#0F172A] group-hover:text-[#00BFA5] transition-colors">
            BUNDLE<span className="text-[#00BFA5]">AI</span>
          </span>
        </a>

        {/* NAVIGATION LINKS - Desktop */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/70 p-1.5 rounded-full border border-slate-200/50">
          {navLinks.map((link) => {
            const isActive = activeNav === link.name;
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setActiveNav(link.name)}
                className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-[#00BFA5] shadow-sm font-bold'
                    : 'text-slate-600 hover:text-[#0F172A] hover:bg-white/50'
                }`}
              >
                {link.name}
              </a>
            );
          })}
        </nav>

        {/* RIGHT ACTION ICONS */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Wishlist Icon */}
          <button
            onClick={onOpenWishlist}
            className="relative p-2.5 rounded-full text-slate-700 hover:text-[#00BFA5] hover:bg-slate-100 transition-all duration-200 group"
            title="Wishlist"
          >
            <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Cart Icon */}
          <button
            onClick={onOpenCart}
            className="relative p-2.5 rounded-full text-slate-700 hover:text-[#00BFA5] hover:bg-slate-100 transition-all duration-200 group"
            title="Cart"
          >
            <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-[#00BFA5] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          {/* Profile Icon */}
          <button
            onClick={onOpenProfile}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#00BFA5]/10 text-[#00BFA5] hover:bg-[#00BFA5] hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm border border-[#00BFA5]/30 group"
            title="Account Profile"
          >
            <User className="w-5 h-5 group-hover:scale-105 transition-transform" />
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl flex flex-col gap-2 animate-in slide-in-from-top-4 duration-200">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => {
                setActiveNav(link.name);
                setMobileMenuOpen(false);
              }}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                activeNav === link.name
                  ? 'bg-[#00BFA5]/10 text-[#00BFA5]'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.name}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
