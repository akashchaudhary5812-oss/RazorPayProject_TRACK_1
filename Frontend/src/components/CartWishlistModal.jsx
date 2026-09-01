import React from 'react';
import { X, Trash2, ShoppingBag, Heart, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';

export default function CartWishlistModal({
  isOpen,
  onClose,
  type = 'cart', // 'cart' or 'wishlist'
  cartItems = [],
  wishlistItems = [],
  onRemoveFromCart,
  onRemoveFromWishlist,
  onAddToCartFromWishlist
}) {
  if (!isOpen) return null;

  const isCart = type === 'cart';
  const items = isCart ? cartItems : wishlistItems;

  const cartTotal = cartItems.reduce((acc, item) => acc + item.price, 0);
  const originalTotal = cartItems.reduce((acc, item) => acc + item.oldPrice, 0);
  const totalSavings = originalTotal - cartTotal;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
        
        {/* TOP HEADER */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#00BFA5]/10 text-[#00BFA5]">
                {isCart ? <ShoppingBag className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
              </div>
              <h3 className="font-anton text-2xl text-slate-900 uppercase tracking-wide">
                YOUR {isCart ? 'AI CART' : 'WISHLIST'} ({items.length})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ITEM LIST */}
          <div className="mt-6 space-y-4">
            {items.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  {isCart ? <ShoppingBag className="w-8 h-8" /> : <Heart className="w-8 h-8" />}
                </div>
                <h4 className="font-bold text-slate-700">
                  Your {isCart ? 'Cart' : 'Wishlist'} is empty
                </h4>
                <p className="text-xs text-slate-400 font-medium">
                  {isCart ? 'Use AI search to find and add smart product bundles!' : 'Save your favorite products to quickly build AI bundles later.'}
                </p>
              </div>
            ) : (
              items.map((item, idx) => (
                <div
                  key={`${item.id}-${idx}`}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 object-contain mix-blend-multiply rounded-xl bg-white p-1"
                    />
                    <div>
                      <span className="text-[10px] font-extrabold text-[#0D9488] uppercase tracking-wider block">
                        {item.brand}
                      </span>
                      <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                      <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                        ₹{item.price.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isCart && (
                      <button
                        onClick={() => {
                          onAddToCartFromWishlist(item);
                          onRemoveFromWishlist(item.id);
                        }}
                        className="p-2 rounded-lg bg-[#00BFA5] text-white hover:bg-[#00A892] transition-colors text-xs font-bold"
                        title="Move to Cart"
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => (isCart ? onRemoveFromCart(idx) : onRemoveFromWishlist(item.id))}
                      className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* BOTTOM CHECKOUT FOOTER */}
        {isCart && cartItems.length > 0 && (
          <div className="pt-6 border-t border-slate-100 space-y-4">
            
            {/* AI Discount Banner */}
            <div className="bg-[#00BFA5]/10 p-3 rounded-xl border border-[#00BFA5]/20 flex items-center justify-between text-xs">
              <span className="font-bold text-[#064E3B] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#00BFA5]" /> AI Bundle Savings
              </span>
              <span className="font-extrabold text-[#00BFA5]">
                -₹{totalSavings > 0 ? totalSavings.toLocaleString('en-IN') : '0'}
              </span>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm font-semibold">Total Amount</span>
              <span className="font-anton text-3xl text-slate-900">
                ₹{cartTotal.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => alert(`Proceeding to checkout with ₹${cartTotal.toLocaleString('en-IN')} total!`)}
              className="w-full bg-[#00BFA5] hover:bg-[#00A892] text-white py-4 rounded-full font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#00BFA5]/30 hover:scale-[1.01] active:scale-95 transition-all"
            >
              <span>CHECKOUT AI BUNDLE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
