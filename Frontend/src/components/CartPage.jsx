import React from 'react';
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck, CheckCircle2, Sparkles, Plus, Minus, ArrowLeft, Heart } from 'lucide-react';

export default function CartPage({
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onSaveForLater,
  onProceedToCheckout,
  onBackToShopping
}) {
  // Aggregate items by id if duplicates exist, or map each item
  // To give full Amazon feel, each unique cart entry can have a quantity
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const totalOriginal = cartItems.reduce((acc, item) => acc + ((item.oldPrice || item.price * 1.2) * (item.quantity || 1)), 0);
  const savings = Math.max(0, totalOriginal - subtotal);
  const totalItemCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const freeDeliveryThreshold = 499;
  const isFreeDelivery = subtotal >= freeDeliveryThreshold;

  return (
    <div className="py-8 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
      
      {/* Top Breadcrumb / Back button */}
      <button
        onClick={onBackToShopping}
        className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 hover:text-teal-800 uppercase tracking-wider mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Continue Shopping</span>
      </button>

      {cartItems.length === 0 ? (
        /* Empty Cart State */
        <div className="bg-white rounded-3xl p-10 sm:p-16 border border-slate-200/90 shadow-sm text-center max-w-2xl mx-auto space-y-4">
          <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Your Amazon-style Cart is empty
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Your shopping cart is waiting. Give it purpose — fill it with smartphones, laptops, audio gear, or use our AI to find the smartest bundles!
          </p>
          <div className="pt-2">
            <button
              onClick={onBackToShopping}
              className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold px-8 py-3 rounded-full text-sm uppercase tracking-wider shadow-md shadow-amber-400/20 active:scale-95 transition-all"
            >
              Explore Today's Deals
            </button>
          </div>
        </div>
      ) : (
        /* 2-Column Desktop / Stacked Mobile Cart Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: CART ITEMS (col-span-8) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Shopping Cart
                </h1>
                <span className="text-xs text-slate-500 font-medium">
                  {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} in your cart
                </span>
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:block">
                Price
              </span>
            </div>

            {/* Free Delivery Bar Banner */}
            <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
              isFreeDelivery
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <CheckCircle2 className={`w-5 h-5 shrink-0 ${isFreeDelivery ? 'text-emerald-600' : 'text-amber-600'}`} />
              <div className="text-xs font-semibold">
                {isFreeDelivery ? (
                  <span>
                    Your order qualifies for <strong>FREE Delivery</strong>. Choose this option at checkout.
                  </span>
                ) : (
                  <span>
                    Add ₹{(freeDeliveryThreshold - subtotal).toLocaleString('en-IN')} more to be eligible for <strong>FREE Delivery</strong>.
                  </span>
                )}
              </div>
            </div>

            {/* List of Cart Items */}
            <div className="divide-y divide-slate-100">
              {cartItems.map((item, index) => {
                const qty = item.quantity || 1;
                const itemTotal = item.price * qty;

                return (
                  <div key={`${item.id}-${index}`} className="py-6 flex flex-col sm:flex-row gap-5 items-start justify-between">
                    
                    {/* Item Image & Description */}
                    <div className="flex gap-4 items-start flex-1">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain mix-blend-multiply"
                        />
                      </div>

                      <div className="space-y-1.5 flex-1">
                        <span className="text-[10px] font-extrabold text-teal-700 uppercase tracking-widest block">
                          {item.brand || 'BRAND'}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                          {item.name}
                        </h3>

                        <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
                        </div>

                        <div className="text-[11px] text-slate-500 font-medium">
                          Eligible for FREE Express Shipping
                        </div>

                        {/* Controls: Quantity, Delete, Save for Later */}
                        <div className="flex flex-wrap items-center gap-4 pt-2">
                          {/* Quantity Selector Box */}
                          <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 overflow-hidden shadow-2xs">
                            <button
                              onClick={() => onUpdateQuantity && onUpdateQuantity(index, Math.max(1, qty - 1))}
                              className="p-1.5 hover:bg-slate-200 text-slate-600 transition-colors"
                              title="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 text-xs font-bold text-slate-800">
                              {qty}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity && onUpdateQuantity(index, qty + 1)}
                              className="p-1.5 hover:bg-slate-200 text-slate-600 transition-colors"
                              title="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="text-slate-300">|</span>

                          {/* Delete Action */}
                          <button
                            onClick={() => onRemoveItem(index)}
                            className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>

                          <span className="text-slate-300">|</span>

                          {/* Save For Later */}
                          <button
                            onClick={() => onSaveForLater && onSaveForLater(item, index)}
                            className="text-xs font-semibold text-teal-700 hover:text-teal-800 transition-colors flex items-center gap-1"
                          >
                            <Heart className="w-3.5 h-3.5" />
                            <span>Save for later</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Price Column */}
                    <div className="text-left sm:text-right shrink-0">
                      <div className="text-lg sm:text-xl font-extrabold text-slate-900">
                        ₹{itemTotal.toLocaleString('en-IN')}
                      </div>
                      {item.oldPrice && (
                        <div className="text-xs text-slate-400 line-through">
                          ₹{(item.oldPrice * qty).toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Subtotal Bottom Line */}
            <div className="pt-4 border-t border-slate-200 text-right">
              <span className="text-sm font-semibold text-slate-600">
                Subtotal ({totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}):{' '}
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>

          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY CARD (col-span-4) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-5 sticky top-24">
            
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Order Summary
              </div>
              <div className="flex items-baseline justify-between pt-2">
                <span className="text-sm font-semibold text-slate-600">
                  Subtotal ({totalItemCount} items)
                </span>
                <span className="text-2xl font-extrabold text-slate-900">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Savings Banner */}
            {savings > 0 && (
              <div className="bg-teal-50 border border-teal-200/80 rounded-2xl p-3.5 flex items-center justify-between text-xs">
                <span className="font-bold text-teal-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600" /> Total Bundle Savings
                </span>
                <span className="font-extrabold text-teal-700 text-sm">
                  -₹{savings.toLocaleString('en-IN')}
                </span>
              </div>
            )}

            {/* Delivery Promise */}
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Standard Delivery:</span>
                <span className="font-bold text-teal-700">FREE</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Estimated Delivery:</span>
                <span className="font-semibold text-slate-800">Tomorrow by 2:00 PM</span>
              </div>
            </div>

            {/* Proceed to Checkout CTA */}
            <button
              onClick={onProceedToCheckout}
              className="w-full bg-amber-400 hover:bg-amber-500 active:scale-98 text-slate-950 font-extrabold py-4 rounded-full text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 transition-all"
            >
              <span>Proceed to Buy</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Security Guarantee Box */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500 font-semibold">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>100% Safe & Secure Checkout</span>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
