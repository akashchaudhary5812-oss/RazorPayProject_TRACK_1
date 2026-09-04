import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, CreditCard, Truck, ArrowRight, Check, MapPin, Sparkles, Building, Phone, User } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems = [],
  onOrderSuccess
}) {
  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review, 4: Confirmation
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [orderId, setOrderId] = useState('');

  // Address Form State
  const [address, setAddress] = useState({
    fullName: 'Abhishek Yadav',
    street: 'Sector 62, Electronic City Phase 1',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pinCode: '201301',
    phone: '+91 98765 43210'
  });

  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const totalItemCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const handlePlaceOrder = () => {
    const generatedId = `BNDL-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderId(generatedId);
    setStep(4);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    if (onOrderSuccess) onOrderSuccess();
  };

  const stepsList = [
    { num: 1, title: 'Address' },
    { num: 2, title: 'Payment' },
    { num: 3, title: 'Review' },
    { num: 4, title: 'Confirmed' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden flex flex-col justify-between max-h-[92vh]">
        
        {/* Modal Close Button */}
        {step !== 4 && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* TOP: Amazon-style Multi-step Progress Bar */}
        <div className="pb-6 border-b border-slate-100">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {stepsList.map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step === s.num
                        ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-100'
                        : step > s.num
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span className={`text-[11px] mt-1 font-semibold ${step >= s.num ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                    {s.title}
                  </span>
                </div>

                {idx < stepsList.length - 1 && (
                  <div className={`w-12 sm:w-16 h-0.5 mx-2 -mt-4 transition-all ${step > s.num ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* STEP CONTENT BODY */}
        <div className="py-6 overflow-y-auto flex-1">
          
          {/* STEP 1: DELIVERY ADDRESS */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-lg">
                  1. Confirm Delivery Address
                </h3>
                <span className="text-xs text-teal-700 font-bold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> India
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={address.fullName}
                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-600 block mb-1">Flat, House no., Building, Street</label>
                  <input
                    type="text"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">City</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={address.pinCode}
                    onChange={(e) => setAddress({ ...address, pinCode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold py-3.5 rounded-full text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span>Deliver to this Address</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PAYMENT METHOD */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-slate-900 text-lg">
                2. Select a Payment Method
              </h3>

              <div className="space-y-2.5">
                {[
                  { id: 'upi', name: 'UPI / Instant QR (Google Pay, PhonePe, Paytm)', desc: 'Fastest checkout with 0 transaction fees' },
                  { id: 'card', name: 'Credit or Debit Card', desc: 'Visa, MasterCard, RuPay, American Express' },
                  { id: 'netbanking', name: 'Net Banking', desc: 'All Indian major banks supported' },
                  { id: 'cod', name: 'Cash on Delivery / Pay on Delivery', desc: 'Pay via cash or UPI at delivery doorstep' }
                ].map((m) => (
                  <label
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === m.id
                        ? 'bg-amber-50/50 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === m.id}
                      onChange={() => setPaymentMethod(m.id)}
                      className="mt-1 text-amber-500 focus:ring-amber-400"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-sm text-slate-900">{m.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{m.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold py-3.5 rounded-full text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span>Use This Payment Method</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW ORDER */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-slate-900 text-lg">
                3. Review Order & Place
              </h3>

              {/* Address & Payment summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Delivering to</span>
                  <strong className="text-slate-800 block text-sm">{address.fullName}</strong>
                  <span className="text-slate-600">{address.street}, {address.city} - {address.pinCode}</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Payment Method</span>
                  <strong className="text-slate-800 block text-sm uppercase">{paymentMethod}</strong>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Secure Encryption
                  </span>
                </div>
              </div>

              {/* Items Summary Table */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="font-extrabold text-slate-400 uppercase tracking-wider block text-xs">
                  Items ({totalItemCount})
                </span>
                <div className="max-h-36 overflow-y-auto space-y-2">
                  {cartItems.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 line-clamp-1 flex-1 pr-2">
                        {item.name} × {item.quantity || 1}
                      </span>
                      <span className="font-bold text-slate-900 shrink-0">
                        ₹{(item.price * (item.quantity || 1)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
                  <span className="font-extrabold text-slate-800 text-sm">Order Total:</span>
                  <span className="font-extrabold text-xl text-slate-950">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-3 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  className="flex-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold py-3.5 rounded-full text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 active:scale-98 transition-all"
                >
                  <span>Place Your Order and Pay</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ORDER CONFIRMED */}
          {step === 4 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Order Confirmed!
              </h2>

              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Thank you for your purchase. We have received your order and sent a confirmation SMS to <strong className="text-slate-800">{address.phone}</strong>.
              </p>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 max-w-sm mx-auto space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Order ID:</span>
                  <span className="font-mono font-bold text-slate-800">{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Paid:</span>
                  <span className="font-bold text-slate-800">₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated Delivery:</span>
                  <span className="font-bold text-teal-700">Tomorrow by 2:00 PM</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold px-8 py-3.5 rounded-full text-sm uppercase tracking-wider shadow-md shadow-amber-400/20 active:scale-95 transition-all"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
