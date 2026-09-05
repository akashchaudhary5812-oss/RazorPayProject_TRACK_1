import React, { useEffect, useState } from 'react';
import { CheckCircle, ShieldCheck, Copy, Check, ShoppingBag, ArrowRight, Package, Truck, Calendar, CreditCard } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PaymentSuccess({ reference, onBackToShopping }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fire festive celebration confetti on load
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 300);
    } catch (e) {
      console.warn("Confetti error", e);
    }
  }, []);

  const handleCopyReference = () => {
    if (reference) {
      navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const today = new Date();
  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + 2);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="bg-white max-w-xl w-full rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-200/80 text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Subtle top decoration badge */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-100/50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-100/50 rounded-full blur-2xl pointer-events-none" />

        {/* Success Icon */}
        <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-30" />
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <CheckCircle className="w-10 h-10 stroke-[2.5]" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
          Payment Successful!
        </h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto mb-6 font-medium">
          Thank you for your order! Your payment has been processed securely via Razorpay and verified by our system.
        </p>

        {/* Reference ID Card */}
        {reference && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 text-left">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Razorpay Payment Reference</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified
              </span>
            </div>
            <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-slate-200/80">
              <span className="font-mono text-sm font-bold text-slate-800 break-all">
                {reference}
              </span>
              <button
                onClick={handleCopyReference}
                className="ml-2 p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors shrink-0"
                title="Copy Reference ID"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Delivery & Order Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-8 text-left text-xs">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-start gap-2.5">
            <Truck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <div className="font-extrabold text-slate-900">Estimated Delivery</div>
              <div className="text-slate-600 text-[11px] mt-0.5">{formattedDeliveryDate}</div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-start gap-2.5">
            <CreditCard className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-extrabold text-slate-900">Payment Status</div>
              <div className="text-emerald-700 font-bold text-[11px] mt-0.5">100% Paid (Razorpay)</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onBackToShopping}
            className="w-full sm:w-auto flex-1 bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold px-8 py-3.5 rounded-full text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 active:scale-95 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
