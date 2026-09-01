import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturedProducts from './components/FeaturedProducts';
import ValueProposition from './components/ValueProposition';
import HowItWorks from './components/HowItWorks';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import AISearchModal from './components/AISearchModal';
import CartWishlistModal from './components/CartWishlistModal';
import BundlesPage from './components/BundlesPage';

export default function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' or 'bundles'
  const [activeRequirementId, setActiveRequirementId] = useState(null);

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  
  // Modals state
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState('cart'); // 'cart' or 'wishlist'

  // Trigger AI Search Modal
  const handleTriggerAISearch = (query) => {
    setSearchQuery(query || '');
    setAiModalOpen(true);
  };

  // Open /bundles page view
  const handleOpenBundlesPage = (requirementId) => {
    setActiveRequirementId(requirementId || null);
    setCurrentView('bundles');
    setAiModalOpen(false);
  };

  // Toggle Wishlist
  const handleToggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  // Add to Cart
  const handleAddToCart = (product) => {
    setCart((prev) => [...prev, product]);
  };

  // Remove item from Cart by index
  const handleRemoveFromCart = (index) => {
    setCart((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Remove item from Wishlist by ID
  const handleRemoveFromWishlist = (productId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  };

  if (currentView === 'bundles') {
    return (
      <div className="min-h-screen bg-[#F4FAF8] text-[#0F172A]">
        <BundlesPage
          requirementId={activeRequirementId}
          onBackToHome={() => setCurrentView('home')}
          onAddToCart={handleAddToCart}
        />

        {/* Cart & Wishlist Drawer */}
        <CartWishlistModal
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          type={drawerType}
          cartItems={cart}
          wishlistItems={wishlist}
          onRemoveFromCart={handleRemoveFromCart}
          onRemoveFromWishlist={handleRemoveFromWishlist}
          onAddToCartFromWishlist={handleAddToCart}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4FAF8] text-[#0F172A] flex flex-col justify-between selection:bg-[#00BFA5]/20 selection:text-[#064E3B]">
      
      <div>
        {/* Sticky Top Navbar */}
        <Navbar
          cartCount={cart.length}
          wishlistCount={wishlist.length}
          onOpenCart={() => {
            setDrawerType('cart');
            setDrawerOpen(true);
          }}
          onOpenWishlist={() => {
            setDrawerType('wishlist');
            setDrawerOpen(true);
          }}
          onOpenProfile={() => alert("Profile Modal: Logged in as AI Premium Shopper")}
        />

        {/* Hero Section */}
        <HeroSection onTriggerAISearch={handleTriggerAISearch} />

        {/* Value Proposition Strip */}
        <ValueProposition />

        {/* Top Featured Products */}
        <FeaturedProducts
          wishlist={wishlist}
          toggleWishlist={handleToggleWishlist}
          onAddToCart={handleAddToCart}
        />

        {/* How It Works */}
        <HowItWorks onTriggerAISearch={handleTriggerAISearch} />

        {/* CTA Section */}
        <CTASection onTriggerAISearch={handleTriggerAISearch} />
      </div>

      {/* Footer */}
      <Footer />

      {/* AI Search Modal */}
      <AISearchModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        searchQuery={searchQuery}
        onAddBundleToCart={handleAddToCart}
        onOpenBundlesPage={handleOpenBundlesPage}
      />

      {/* Cart & Wishlist Drawer */}
      <CartWishlistModal
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        type={drawerType}
        cartItems={cart}
        wishlistItems={wishlist}
        onRemoveFromCart={handleRemoveFromCart}
        onRemoveFromWishlist={handleRemoveFromWishlist}
        onAddToCartFromWishlist={handleAddToCart}
      />

    </div>
  );
}
