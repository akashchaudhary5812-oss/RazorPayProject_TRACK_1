import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Star, Heart, ShieldCheck, Truck, RotateCcw,
  Check, ShoppingBag, Zap, ChevronRight, AlertCircle, RefreshCw, Package
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { productApi } from '../services/api';
import { FEATURED_PRODUCTS } from '../data/products';
import LogoLoader from './LogoLoader';

export default function ProductDetailPage({
  onAddToCart,
  onToggleWishlist,
  wishlist = [],
  onBuyNow,
  onOpenCart
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  const isWishlisted = product ? wishlist.some(w => w.id === product.id || w.id === product._id) : false;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    setError('');

    // First try local data (instant, no network needed)
    const local = FEATURED_PRODUCTS.find(p =>
      String(p.id) === String(id) || String(p._id) === String(id)
    );
    if (local) {
      setProduct(local);
      setLoading(false);
    }

    // Also try backend API for live data
    try {
      const res = await productApi.getProductById(id);
      if (res.ok) {
        const data = await res.json();
        const p = data.product || data.data || data;
        if (p && (p._id || p.id)) {
          setProduct({
            id: p._id || p.id,
            name: p.productName || p.name,
            brand: p.brandName || p.brand,
            category: p.category,
            subcategory: p.subcategory,
            price: p.price,
            oldPrice: p.oldPrice,
            discount: p.discount,
            rating: p.rating,
            reviewsCount: p.reviewsCount,
            image: p.image,
            description: p.description,
            specs: p.specs || [],
            badge: p.badge,
            deliveryDate: p.deliveryDate || 'Tomorrow, 2 PM'
          });
        }
      }
    } catch {
      // Silently use local data if available
      if (!local) {
        setError('Unable to load product details. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }
    setAdded(true);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product);
    }
    if (onBuyNow) onBuyNow();
    else navigate('/cart');
  };

  // ── LOADING STATE ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          {/* Centered LogoLoader */}
          <div className="mb-6 flex items-center justify-center">
            <LogoLoader
              size="md"
              text="Loading product details..."
              subtext="Retrieving specifications, pricing, and availability"
            />
          </div>
          {/* Breadcrumb skeleton */}
          <div className="h-4 w-48 bg-slate-200/80 rounded animate-pulse mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-5 h-96 bg-slate-200/80 rounded-2xl animate-pulse" />
            <div className="md:col-span-4 space-y-4">
              <div className="h-4 w-24 bg-slate-200/80 rounded animate-pulse" />
              <div className="h-8 w-full bg-slate-200/80 rounded animate-pulse" />
              <div className="h-8 w-3/4 bg-slate-200/80 rounded animate-pulse" />
              <div className="h-4 w-32 bg-slate-200/80 rounded animate-pulse" />
              <div className="h-16 w-full bg-slate-200/80 rounded animate-pulse" />
            </div>
            <div className="md:col-span-3 h-64 bg-slate-200/80 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // ── ERROR STATE ────────────────────────────────────────────────────────────
  if (error && !product) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-10 text-center max-w-md w-full border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Product Not Found</h3>
          <p className="text-xs text-slate-500 leading-relaxed">{error}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={fetchProduct}
              className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
            <button
              onClick={() => navigate('/products')}
              className="px-5 py-2.5 bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-amber-500 transition-colors"
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const formattedPrice = product.price ? Number(product.price).toLocaleString('en-IN') : '0';
  const formattedOldPrice = product.oldPrice ? Number(product.oldPrice).toLocaleString('en-IN') : null;
  const rating = product.rating || 4.8;
  const reviewsCount = product.reviewsCount || 1240;
  const images = [product.image, product.image, product.image];

  // ── PRODUCT DETAIL PAGE ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 animate-fade-in-slide">

      {/* BREADCRUMB NAV */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-slate-500">
          <button
            onClick={() => navigate('/')}
            className="hover:text-teal-700 transition-colors font-medium"
          >
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <button
            onClick={() => navigate('/products')}
            className="hover:text-teal-700 transition-colors font-medium"
          >
            Products
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          {product.category && (
            <>
              <span className="text-slate-400">{product.category}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            </>
          )}
          <span className="text-slate-900 font-semibold line-clamp-1 max-w-xs">{product.name}</span>
        </div>
      </div>

      {/* BACK BUTTON */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold text-teal-700 hover:text-teal-900 uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* MAIN PRODUCT LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

          {/* LEFT: IMAGE GALLERY */}
          <div className="md:col-span-5 flex flex-col items-center">
            {/* Main stage */}
            <div className="w-full h-72 sm:h-96 rounded-2xl bg-white border border-slate-200 p-6 flex items-center justify-center relative overflow-hidden group shadow-sm">
              <img
                src={images[activeImage]}
                alt={product.name}
                className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
              />

              {product.discount > 0 && (
                <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-sm">
                  -{product.discount}% OFF
                </span>
              )}

              <button
                onClick={() => product && onToggleWishlist(product)}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all ${
                  isWishlisted
                    ? 'bg-rose-50 text-rose-500'
                    : 'bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50'
                }`}
                title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>

            {/* Thumbnail strip */}
            <div className="flex items-center gap-3 mt-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-16 h-16 rounded-xl border-2 p-1 bg-white transition-all ${
                    activeImage === idx
                      ? 'border-teal-600 shadow-sm'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-contain mix-blend-multiply" />
                </button>
              ))}
            </div>
          </div>

          {/* MIDDLE: PRODUCT INFO */}
          <div className="md:col-span-4 space-y-4">
            <div>
              <span className="text-xs font-extrabold text-teal-700 tracking-widest uppercase block mb-1">
                Brand: {product.brand}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {product.name}
              </h1>
            </div>

            {/* Ratings */}
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(rating)
                        ? 'fill-amber-400 text-amber-400'
                        : i < rating
                        ? 'fill-amber-200 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-slate-800">{rating}</span>
              <span className="text-xs text-teal-700 font-semibold">
                {Number(reviewsCount).toLocaleString()} ratings
              </span>
            </div>

            {/* Pricing */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                {product.discount > 0 && (
                  <span className="text-rose-600 font-bold text-lg">-{product.discount}%</span>
                )}
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  ₹{formattedPrice}
                </span>
              </div>
              {formattedOldPrice && (
                <div className="text-xs text-slate-400 font-medium">
                  M.R.P.: <span className="line-through">₹{formattedOldPrice}</span> (Inclusive of all taxes)
                </div>
              )}
              <div className="text-xs text-slate-600 font-medium">
                EMI starts at{' '}
                <span className="font-bold text-slate-900">
                  ₹{Math.round(product.price / 12).toLocaleString('en-IN')}/month
                </span>
                . No Cost EMI available.
              </div>
            </div>

            {/* About */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                About This Item
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {product.description ||
                  'Designed with cutting-edge materials and state-of-the-art architecture. Engineered for demanding productivity and everyday reliability.'}
              </p>

              {product.specs && product.specs.length > 0 && (
                <ul className="space-y-1.5 pt-2">
                  {product.specs.map((spec, i) => (
                    <li key={i} className="text-xs text-slate-700 font-medium flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { icon: ShieldCheck, label: '1 Year Warranty' },
                { icon: RotateCcw, label: '7-Day Returns' },
                { icon: Package, label: 'Authentic Brand' }
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg"
                >
                  <Icon className="w-3.5 h-3.5 text-teal-700" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: BUY BOX */}
          <div className="md:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-4 shadow-sm h-fit sticky top-24">
            <div className="text-xl font-extrabold text-slate-900">
              ₹{formattedPrice}
            </div>

            <div className="text-xs text-slate-600 space-y-1.5">
              <div className="flex items-center gap-1.5 text-teal-700 font-bold">
                <Truck className="w-4 h-4" />
                <span>FREE Delivery {product.deliveryDate || 'Tomorrow'}</span>
              </div>
              <div className="text-emerald-700 font-bold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                <span>In Stock</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                Ships from: <strong className="text-slate-800">IntentCartAI Express</strong>
              </div>
              <div className="text-[11px] text-slate-500">
                Sold by: <strong className="text-slate-800">Verified Direct Brand Retail</strong>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Quantity:</label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'unit' : 'units'}
                  </option>
                ))}
              </select>
            </div>

            {/* CTAs */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleAdd}
                className={`w-full py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-400 hover:bg-amber-500 active:scale-98 text-slate-950 shadow-amber-400/20'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-98 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all shadow-orange-500/20"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Buy Now</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 text-center text-[10px] font-semibold text-slate-500 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>Secure transaction • 7-day returnable</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
