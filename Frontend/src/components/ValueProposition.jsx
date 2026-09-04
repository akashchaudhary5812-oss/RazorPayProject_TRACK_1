import React from 'react';
import { Sparkles, Tag, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { VALUE_PROPS } from '../data/products';

export default function ValueProposition() {
  const iconMap = {
    Truck: <Truck className="w-5 h-5 text-teal-700" />,
    Tag: <Tag className="w-5 h-5 text-teal-700" />,
    ShieldCheck: <ShieldCheck className="w-5 h-5 text-teal-700" />,
    RotateCcw: <RotateCcw className="w-5 h-5 text-teal-700" />
  };

  return (
    <section className="py-6 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {VALUE_PROPS.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3.5 pt-3 sm:pt-0 sm:px-4 first:pt-0 first:px-0"
            >
              {/* Icon Bubble */}
              <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
                {iconMap[item.icon] || <ShieldCheck className="w-5 h-5 text-teal-700" />}
              </div>

              {/* Text */}
              <div>
                <h3 className="font-extrabold text-slate-900 text-xs tracking-wider uppercase">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-snug mt-0.5">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
