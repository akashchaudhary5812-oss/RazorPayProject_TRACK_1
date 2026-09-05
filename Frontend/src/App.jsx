import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import LightningDeals from './components/LightningDeals';
import FeaturedProducts from './components/FeaturedProducts';
import ValueProposition from './components/ValueProposition';
import HowItWorks from './components/HowItWorks';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import AISearchModal from './components/AISearchModal';
import CartWishlistModal from './components/CartWishlistModal';
import BundlesPage from './components/BundlesPage';
import ProductDetailsModal from './components/ProductDetailsModal';
import CategoryDrawer from './components/CategoryDrawer';
import CartPage from './components/CartPage';
import CheckoutModal from './components/CheckoutModal';
import AuthModal from './components/AuthModal';
import PaymentSuccess from './components/PaymentSuccess';
import { FEATURED_PRODUCTS } from './data/products';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL-driven states
  const pathname = location.pathname;
  const isRegisterRoute = pathname === '/register' || pathname === '/signup' || pathname === '/api/register';
  const isLoginRoute = pathname === '/login' || pathname === '/signin' || pathname === '/api/login';
  const isAuthRoute = isRegisterRoute || isLoginRoute;

  const isCartRoute = pathname === '/cart';
  const isBundlesRoute = pathname.startsWith('/bundles');
  const bundlesParamId = isBundlesRoute ? pathname.replace('/bundles/', '').replace('/bundles', '') : null;

  const referenceParam = searchParams.get('reference');
  const isPaymentSuccessRoute = pathname === '/paymentsuccess' || !!referenceParam;

  const [activeRequirementId, setActiveRequirementId] = useState(bundlesParamId || null);

  // Cart & Wishlist State
  const [cart, setCart] = useState(() => {
    try {
      if (isPaymentSuccessRoute) {
        localStorage.removeItem('intentcartai_cart');
        localStorage.removeItem('bundleai_cart');
        return [];
      }
      const saved = localStorage.getItem('intentcartai_cart') || localStorage.getItem('bundleai_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('intentcartai_wishlist') || localStorage.getItem('bundleai_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // User Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('intentcartai_user') || localStorage.getItem('bundleai_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Modals & Drawers State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeProduct, setActiveProduct] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerType, setDrawerType] = useState('cart'); // 'cart' or 'wishlist'

  // Clear cart on payment success
  useEffect(() => {
    if (isPaymentSuccessRoute) {
      setCart([]);
      localStorage.removeItem('intentcartai_cart');
      localStorage.removeItem('bundleai_cart');
    }
  }, [isPaymentSuccessRoute]);

  // Persist Cart & Wishlist & User in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('intentcartai_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn("Storage error", e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('intentcartai_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.warn("Storage error", e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('intentcartai_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('intentcartai_user');
        localStorage.removeItem('bundleai_user');
      }
    } catch (e) {
      console.warn("Storage error", e);
    }
  }, [currentUser]);

  // Cart Handlers
  const handleAddToCart = (product, quantity = 1) => {
    const qtyToAdd = typeof quantity === 'number' && quantity > 0 ? quantity : 1;
    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === product.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: (updated[existingIdx].quantity || 1) + qtyToAdd
        };
        return updated;
      }
      return [...prev, { ...product, quantity: qtyToAdd }];
    });
  };

  const handleUpdateQuantity = (index, newQty) => {
    setCart((prev) => {
      const updated = [...prev];
      if (newQty <= 0) {
        return updated.filter((_, idx) => idx !== index);
      }
      updated[index] = { ...updated[index], quantity: newQty };
      return updated;
    });
  };

  const handleRemoveFromCart = (index) => {
    setCart((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Wishlist Handlers
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

  const handleRemoveFromWishlist = (productId) => {
    setWishlist((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleSaveForLater = (product, index) => {
    handleToggleWishlist(product);
    handleRemoveFromCart(index);
  };

  // Product View Details
  const handleViewDetails = (product) => {
    setActiveProduct(product);
    setDetailsModalOpen(true);
  };

  // Trigger AI Search
  const handleTriggerAISearch = (query) => {
    setSearchQuery(query || '');
    setAiModalOpen(true);
  };

  // Open /bundles page view
  const handleOpenBundlesPage = (requirementId) => {
    setActiveRequirementId(requirementId || null);
    setAiModalOpen(false);
    navigate(requirementId ? `/bundles/${requirementId}` : '/bundles');
  };

  // Search Submission from Navbar
  const handleSearchSubmit = (query, category) => {
    setSearchQuery(query);
    if (category && category !== 'all') {
      setSelectedCategory(category);
    }
    if (pathname !== '/') {
      navigate('/');
    }
    const elem = document.getElementById('products');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const cartTotalAmount = cart.reduce(
    (acc, item) => acc + (item.price * (item.quantity || 1)),
    0
  );
  const totalCartItemCount = cart.reduce(
    (acc, item) => acc + (item.quantity || 1),
    0
  );

  // If in bundles page view
  if (isBundlesRoute) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between">
        <BundlesPage
          requirementId={bundlesParamId || activeRequirementId}
          onBackToHome={() => navigate('/')}
          onAddToCart={handleAddToCart}
          onViewDetails={handleViewDetails}
        />

        {/* Cart & Wishlist Modal Drawer */}
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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950">
      
      <div>
        {/* Amazon-style Multi-tier E-commerce Header */}
        <Navbar
          cartCount={totalCartItemCount}
          wishlistCount={wishlist.length}
          cartTotal={cartTotalAmount}
          onOpenCart={() => navigate('/cart')}
          onOpenWishlist={() => {
            setDrawerType('wishlist');
            setDrawerOpen(true);
          }}
          onOpenProfile={() => navigate('/signin')}
          onOpenCategoryDrawer={() => setCategoryDrawerOpen(true)}
          onTriggerAISearch={handleTriggerAISearch}
          onSearchSubmit={handleSearchSubmit}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            if (pathname !== '/') navigate('/');
            const elem = document.getElementById('products');
            if (elem) elem.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenDeals={() => {
            if (pathname !== '/') navigate('/');
            const elem = document.getElementById('deals');
            if (elem) elem.scrollIntoView({ behavior: 'smooth' });
          }}
          currentUser={currentUser}
        />

        {/* VIEW CONDITIONAL ROUTE RENDERING */}
        {isPaymentSuccessRoute ? (
          /* Razorpay Payment Success Screen */
          <PaymentSuccess
            reference={referenceParam}
            onBackToShopping={() => navigate('/')}
          />
        ) : isCartRoute ? (
          /* Full 2-Column Amazon Cart Page */
          <CartPage
            cartItems={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveFromCart}
            onSaveForLater={handleSaveForLater}
            onProceedToCheckout={() => setCheckoutModalOpen(true)}
            onBackToShopping={() => navigate('/')}
          />
        ) : (
          /* Homepage E-Commerce Layout */
          <>
            {/* Amazon-style Panoramic Hero Slider & 4-Quadrant Category Feature Cards */}
            <HeroBanner
              onTriggerAISearch={handleTriggerAISearch}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                const elem = document.getElementById('products');
                if (elem) elem.scrollIntoView({ behavior: 'smooth' });
              }}
              onViewDetails={handleViewDetails}
              featuredProducts={FEATURED_PRODUCTS}
            />

            {/* Value Proposition Trust Strip */}
            <ValueProposition />

            {/* Today's Lightning Deals with Live Countdown */}
            <LightningDeals
              onAddToCart={handleAddToCart}
              onViewDetails={handleViewDetails}
            />

            {/* Featured & Best Sellers Product Grid with Category Pills & Sorting */}
            <FeaturedProducts
              wishlist={wishlist}
              toggleWishlist={handleToggleWishlist}
              onAddToCart={handleAddToCart}
              onViewDetails={handleViewDetails}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
            />

            {/* How Neural Bundling Works */}
            <HowItWorks onTriggerAISearch={handleTriggerAISearch} />

            {/* AI Commerce Call To Action */}
            <CTASection onTriggerAISearch={handleTriggerAISearch} />
          </>
        )}
      </div>

      {/* Multi-Section Amazon Footer */}
      <Footer />

      {/* AI Search Modal */}
      <AISearchModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        searchQuery={searchQuery}
        onAddBundleToCart={handleAddToCart}
        onOpenBundlesPage={handleOpenBundlesPage}
        onViewDetails={handleViewDetails}
      />

      {/* Product Details Modal (Amazon-style 3-column view) */}
      <ProductDetailsModal
        product={activeProduct}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        isWishlisted={activeProduct ? wishlist.some((item) => item.id === activeProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onBuyNow={() => setCheckoutModalOpen(true)}
      />

      {/* Amazon-style "All" Category Drawer */}
      <CategoryDrawer
        isOpen={categoryDrawerOpen}
        onClose={() => setCategoryDrawerOpen(false)}
        currentUser={currentUser}
        onOpenAuth={() => navigate('/signin')}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          if (pathname !== '/') navigate('/');
          const elem = document.getElementById('products');
          if (elem) elem.scrollIntoView({ behavior: 'smooth' });
        }}
        onTriggerAISearch={handleTriggerAISearch}
        onOpenDeals={() => {
          if (pathname !== '/') navigate('/');
          const elem = document.getElementById('deals');
          if (elem) elem.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Checkout Modal (Address -> Payment -> Review -> Confirmation) */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        cartItems={cart}
        currentUser={currentUser}
        onOrderSuccess={() => {
          setCart([]);
          localStorage.removeItem('intentcartai_cart');
          localStorage.removeItem('bundleai_cart');
        }}
      />

      {/* Auth Modal with React Router URL Sync (e.g. /signin or /register) */}
      <AuthModal
        isOpen={isAuthRoute}
        initialTab={isRegisterRoute ? 'signup' : 'signin'}
        onTabChange={(tab) => {
          navigate(tab === 'signup' ? '/register' : '/signin', { replace: true });
        }}
        onClose={() => navigate('/')}
        currentUser={currentUser}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          navigate('/');
        }}
        onSignOut={() => {
          setCurrentUser(null);
          navigate('/');
        }}
      />

      {/* Cart & Wishlist Quick Drawer */}
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
