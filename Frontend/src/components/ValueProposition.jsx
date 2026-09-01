import React from 'react';
import { Sparkles, Tag, ShieldCheck, Truck } from 'lucide-react';
import { VALUE_PROPS } from '../data/products';

export default function ValueProposition() {
  const iconMap = {
    Sparkles: <Sparkles className="w-5 h-5 text-[#00BFA5]" />,
    Tag: <Tag className="w-5 h-5 text-[#00BFA5]" />,
    ShieldCheck: <ShieldCheck className="w-5 h-5 text-[#00BFA5]" />,
    Truck: <Truck className="w-5 h-5 text-[#00BFA5]" />
  };

  return (
    <section className="py-8 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
      <div className="bg-white/80 backdrop-blur-md rounded-[28px] p-4 sm:p-6 border border-slate-200/80 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VALUE_PROPS.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-3.5 rounded-2xl hover:bg-[#00BFA5]/5 transition-colors duration-200 group"
            >
              {/* Icon Orb */}
              <div className="w-12 h-12 rounded-2xl bg-[#00BFA5]/10 flex items-center justify-center shrink-0 group-hover:bg-[#00BFA5] group-hover:text-white transition-all duration-300 shadow-sm">
                {React.cloneElement(iconMap[item.icon], {
                  className: "w-6 h-6 text-[#00BFA5] group-hover:text-white transition-colors"
                })}
              </div>

              {/* Text */}
              <div>
                <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase font-sans">
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
