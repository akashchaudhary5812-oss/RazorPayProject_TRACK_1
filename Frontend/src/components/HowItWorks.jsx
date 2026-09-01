import React, { useState } from 'react';
import { MessageSquareText, Cpu, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { HOW_IT_WORKS_STEPS } from '../data/products';

export default function HowItWorks({ onTriggerAISearch }) {
  const [activeStep, setActiveStep] = useState(0);

  const iconMap = {
    MessageSquareText: <MessageSquareText className="w-6 h-6" />,
    Cpu: <Cpu className="w-6 h-6" />,
    Sparkles: <Sparkles className="w-6 h-6" />
  };

  return (
    <section id="how-it-works" className="py-16 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto text-center">
      
      {/* Section Title */}
      <div className="max-w-3xl mx-auto space-y-3 mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00BFA5]/10 text-[#064E3B] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#00BFA5]" /> Three Simple Steps
        </div>
        <h2 className="font-anton text-4xl sm:text-5xl md:text-6xl text-[#0F172A] uppercase tracking-wide">
          HOW IT WORKS
        </h2>
        <p className="text-slate-600 text-base sm:text-lg font-medium">
          Experience frictionless smart shopping. Our AI neural engine turns complex research into instant, discounted bundles.
        </p>
      </div>

      {/* 3 STEPS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        
        {HOW_IT_WORKS_STEPS.map((item, index) => {
          const isSelected = activeStep === index;
          return (
            <div
              key={item.step}
              onClick={() => setActiveStep(index)}
              className={`cursor-pointer rounded-[24px] p-6 sm:p-8 transition-all duration-300 text-left relative flex flex-col justify-between border ${
                isSelected
                  ? 'bg-white border-[#00BFA5] shadow-xl shadow-[#00BFA5]/15 scale-102 ring-2 ring-[#00BFA5]/20'
                  : 'bg-white/60 hover:bg-white border-slate-200/80 shadow-card hover:shadow-lg'
              }`}
            >
              <div>
                {/* Step Number & Icon */}
                <div className="flex items-center justify-between mb-6">
                  <span className="font-anton text-4xl text-[#00BFA5]/30">
                    {item.step}
                  </span>
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-[#00BFA5] text-white shadow-md shadow-[#00BFA5]/30'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {iconMap[item.icon]}
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-slate-900 text-xl mb-2 font-sans">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>

              {/* Status indicator */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-[#0D9488] flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-[#00BFA5]" /> Step {item.step}
                </span>
                <span className="text-xs font-bold text-slate-400 group-hover:text-[#00BFA5] transition-colors">
                  Learn more &rarr;
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}
