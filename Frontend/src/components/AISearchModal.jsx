import React, { useState, useEffect } from 'react';
import { X, Sparkles, Cpu, Check, ShoppingBag, ArrowRight, RefreshCw, AlertCircle, CheckCircle2, ShieldCheck, Tag, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

const API_BASE_URL = 'http://localhost:3000/api/ai';

export default function AISearchModal({ isOpen, onClose, searchQuery, onAddBundleToCart, onOpenBundlesPage }) {
  // Form Input State
  const [naturalText, setNaturalText] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [startingPrice, setStartingPrice] = useState('');
  const [endingPrice, setEndingPrice] = useState('');
  const [releaseCategory, setReleaseCategory] = useState('Latest Version');
  const [discount, setDiscount] = useState('');

  // Processing State & Step Simulation
  const [loading, setLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState('');
  const [bundles, setBundles] = useState([]);
  const [activeBundleIndex, setActiveBundleIndex] = useState(0);
  const [addedBundles, setAddedBundles] = useState({});
  const [lastRequirementId, setLastRequirementId] = useState(null);

  const availableCategories = ["Mobile Phones", "Laptops", "Gaming", "Sports", "Jewellery", "Kids Toys", "Food"];
  const availableBrands = ["Apple", "Samsung", "Google", "OnePlus", "Xiaomi", "Motorola", "Nothing", "Realme", "Sony", "Nike", "Adidas", "Dell", "HP", "Lenovo"];

  const searchSteps = [
    { title: "Understanding your requirements", desc: "Parsing natural language & user intent" },
    { title: "Finding matching products", desc: "Searching 68+ items in MongoDB catalog" },
    { title: "Comparing products & category synergies", desc: "Evaluating specs & brand preferences" },
    { title: "Building optimal bundles", desc: "Combining compatible products into packages" },
    { title: "Calculating maximum savings", desc: "Applying stackable bundle discounts" },
    { title: "Finalizing AI recommendations", desc: "Ranking top bundles by relevance" }
  ];

  useEffect(() => {
    if (isOpen) {
      if (searchQuery) {
        setNaturalText(searchQuery);
        handleExecuteSearch(searchQuery);
      } else {
        setBundles([]);
        setError('');
      }
    }
  }, [isOpen, searchQuery]);

  const toggleCategory = (cat) => {
    setSelectedProducts((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleExecuteSearch = async (promptOverride) => {
    setLoading(true);
    setError('');
    setBundles([]);
    setCurrentStepIndex(0);

    // Animate step-by-step progress experience
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < searchSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 450);

    const payload = {
      products: selectedProducts.length > 0 ? selectedProducts : ["Mobile Phones"],
      preferredBrands: selectedBrands.length > 0 ? selectedBrands : ["Apple", "Samsung"],
      startingPrice: startingPrice ? Number(startingPrice) : null,
      endingPrice: endingPrice ? Number(endingPrice) : null,
      releaseCategory: releaseCategory ? [releaseCategory] : ["Latest Version"],
      discount: discount ? Number(discount) : null,
      naturalText: promptOverride !== undefined ? promptOverride : naturalText
    };

    try {
      // Step 1: Send user requirements to Backend API
      const reqRes = await fetch(`${API_BASE_URL}/userRequirements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!reqRes.ok) throw new Error(`Requirements API HTTP ${reqRes.status}`);
      const reqData = await reqRes.json();
      const requirementId = reqData.requirementId;
      setLastRequirementId(requirementId);

      // Step 2: Call AI Efficient Search API using requirementId
      const searchRes = await fetch(`${API_BASE_URL}/aiEfficientSearch/${requirementId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!searchRes.ok) throw new Error(`AI Search API HTTP ${searchRes.status}`);
      const searchData = await searchRes.json();

      if (searchData.bundles && searchData.bundles.length > 0) {
        setBundles(searchData.bundles);
        setActiveBundleIndex(0);
      } else {
        setError("No matching bundles could be generated for your exact preferences. Try broadening your price or brand selection.");
      }
    } catch (err) {
      console.error("Backend AI Search Error:", err);
      setError(`Connection error: ${err.message}. Make sure backend is running at http://localhost:3000.`);
    } finally {
      clearInterval(stepInterval);
      setCurrentStepIndex(searchSteps.length - 1);
      setTimeout(() => setLoading(false), 300);
    }
  };

  const handleAddBundleToCartAction = (bundleObj, idx) => {
    if (!bundleObj) return;

    bundleObj.products.forEach((p) => {
      onAddBundleToCart({
        id: p.productId || p._id || `prod-${Math.random()}`,
        name: p.productName,
        brand: p.brandName,
        price: p.price,
        oldPrice: Math.round(p.price * 1.25),
        discount: p.discount || 15,
        image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80"
      });
    });

    setAddedBundles((prev) => ({ ...prev, [idx]: true }));
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative overflow-hidden max-h-[92vh] flex flex-col justify-between">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <div className="pb-4 border-b border-slate-100 pr-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00BFA5]/10 text-[#064E3B] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#00BFA5]" /> Semantic Neural Engine
          </div>
          <h2 className="font-anton text-2xl sm:text-3xl text-slate-900 mt-1 uppercase tracking-wide">
            AI EFFICIENT BUNDLE SEARCH
          </h2>
        </div>

        {/* CONTENT BODY */}
        <div className="py-4 overflow-y-auto space-y-6 flex-1 pr-1">
          
          {/* USER REQUIREMENTS INPUT FORM */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200/80 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#00BFA5]" /> Enter your shopping request in plain text:
              </label>
              <input
                type="text"
                value={naturalText}
                onChange={(e) => setNaturalText(e.target.value)}
                placeholder="e.g. I need a gaming phone under 50000 with good discount, preferably Samsung or OnePlus"
                className="w-full bg-white text-sm text-slate-900 p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00BFA5] font-medium"
              />
            </div>

            {/* Quick Categories & Brands */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Target Categories:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableCategories.map((cat) => {
                    const isSelected = selectedProducts.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`text-xs px-3 py-1 rounded-full font-semibold transition-all ${
                          isSelected
                            ? 'bg-[#00BFA5] text-white shadow-sm'
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-[#00BFA5]'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Preferred Brands (Priority Order):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableBrands.slice(0, 8).map((brand) => {
                    const index = selectedBrands.indexOf(brand);
                    const isSelected = index !== -1;
                    return (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => toggleBrand(brand)}
                        className={`text-xs px-3 py-1 rounded-full font-semibold transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-[#0F4C5C] text-white shadow-sm'
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-[#0F4C5C]'
                        }`}
                      >
                        {isSelected && <span className="bg-[#00BFA5] text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">{index + 1}</span>}
                        {brand}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Budget & Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Max Budget (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={endingPrice}
                  onChange={(e) => setEndingPrice(e.target.value)}
                  className="w-full bg-white text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#00BFA5]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Release Version</label>
                <select
                  value={releaseCategory}
                  onChange={(e) => setReleaseCategory(e.target.value)}
                  className="w-full bg-white text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#00BFA5]"
                >
                  <option value="Latest Version">Latest Version</option>
                  <option value="Older Version">Older Version</option>
                  <option value="Any Version">Any Version</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Min Discount (%)</label>
                <input
                  type="number"
                  placeholder="e.g. 15"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full bg-white text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-[#00BFA5]"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => handleExecuteSearch()}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#00BFA5] to-[#0D9488] hover:from-[#00A892] text-white py-2.5 rounded-lg font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-[#00BFA5]/25 hover:scale-[1.01] transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>SEARCH AI BUNDLES</span>
                </button>
              </div>
            </div>

          </div>

          {/* PROFESSIONAL STEP-BY-STEP PROCESSING EXPERIENCE */}
          {loading && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#00BFA5]/15 flex items-center justify-center text-[#00BFA5] animate-spin-slow">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">AI Efficient Search Processing...</h3>
                    <p className="text-xs text-slate-500 font-medium">Analyzing MongoDB catalog & evaluating package synergies</p>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-[#00BFA5] bg-[#00BFA5]/10 px-3 py-1 rounded-full">
                  Step {currentStepIndex + 1} of {searchSteps.length}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#00BFA5] to-[#0D9488] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${((currentStepIndex + 1) / searchSteps.length) * 100}%` }}
                />
              </div>

              {/* Step Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {searchSteps.map((step, idx) => {
                  const isDone = idx < currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        isDone
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                          : isCurrent
                          ? 'bg-white border-[#00BFA5] ring-2 ring-[#00BFA5]/20 text-slate-900 shadow-sm'
                          : 'bg-slate-50 border-slate-100 text-slate-400'
                      }`}
                    >
                      <div className="shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : isCurrent ? (
                          <RefreshCw className="w-5 h-5 text-[#00BFA5] animate-spin" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold">{step.title}</div>
                        <div className="text-[10px] opacity-75">{step.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ERROR STATE */}
          {error && !loading && (
            <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Notice</span>
                {error}
              </div>
            </div>
          )}

          {/* AMAZON-STYLE E-COMMERCE BUNDLE RESULTS LIST */}
          {bundles.length > 0 && !loading && (
            <div className="space-y-6">
              
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Generated {bundles.length} Optimal Product Bundles:
                </span>

                <div className="flex items-center gap-3">
                  {onOpenBundlesPage && (
                    <button
                      onClick={() => onOpenBundlesPage(lastRequirementId)}
                      className="bg-[#00BFA5]/15 hover:bg-[#00BFA5] text-[#064E3B] hover:text-white px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all border border-[#00BFA5]/30 flex items-center gap-1.5 shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Open /bundles Page →</span>
                    </button>
                  )}

                  {/* Bundle Tabs */}
                  <div className="flex items-center gap-2">
                    {bundles.map((b, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveBundleIndex(idx)}
                        className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                          activeBundleIndex === idx
                            ? 'bg-[#0F4C5C] text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Bundle #{idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* RENDER ALL BUNDLE CARDS (Or Active Bundle Card) */}
              {bundles.map((bundle, idx) => {
                // Show selected bundle prominent or show all
                const isSelected = activeBundleIndex === idx;

                return (
                  <div
                    key={idx}
                    className={`bg-white rounded-3xl border transition-all duration-300 p-6 space-y-5 ${
                      isSelected
                        ? 'border-[#00BFA5] ring-2 ring-[#00BFA5]/20 shadow-xl'
                        : 'border-slate-200/80 opacity-90 hover:opacity-100 shadow-sm'
                    }`}
                  >
                    {/* BUNDLE HEADER */}
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-[#00BFA5] text-white text-[11px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider">
                            {idx === 0 ? 'BEST VALUE BUNDLE' : idx === 1 ? 'MAX SAVINGS BUNDLE' : 'FLAGSHIP BUNDLE'}
                          </span>
                          <span className="text-xs font-bold text-slate-400">#Bundle-{idx + 1}</span>
                        </div>

                        <h3 className="font-anton text-2xl sm:text-3xl text-slate-900 mt-2 uppercase tracking-wide">
                          {bundle.name}
                        </h3>
                      </div>

                      {/* Savings Pill */}
                      <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-2xl text-right">
                        <div className="text-xs font-bold text-slate-500 uppercase">Total Savings</div>
                        <div className="text-lg font-extrabold text-emerald-700">
                          YOU SAVE ₹{bundle.savings ? bundle.savings.toLocaleString('en-IN') : '0'} ({bundle.savingsPercentage || 0}%)
                        </div>
                      </div>
                    </div>

                    {/* AI REASON CARD */}
                    <div className="bg-[#00BFA5]/10 p-3.5 rounded-2xl border border-[#00BFA5]/20 flex items-start gap-2.5">
                      <Sparkles className="w-5 h-5 text-[#00BFA5] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-extrabold text-[#064E3B] uppercase block">AI Recommendation Reason:</span>
                        <p className="text-xs text-slate-700 font-medium leading-relaxed mt-0.5">
                          "{bundle.reason}"
                        </p>
                      </div>
                    </div>

                    {/* PREFERENCES MATCH CHECKLIST */}
                    <div className="flex flex-wrap items-center gap-2">
                      {bundle.preferredBrandMatches && bundle.preferredBrandMatches.map((m, i) => (
                        <span key={i} className="text-xs bg-[#0F4C5C]/10 text-[#0F4C5C] font-extrabold px-3 py-1 rounded-full border border-[#0F4C5C]/20 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-[#00BFA5]" /> {m.message || `Preferred Brand: ${m.brand}`}
                        </span>
                      ))}

                      {bundle.matchedPreferences && bundle.matchedPreferences.map((pref, i) => (
                        <span key={i} className="text-xs bg-slate-100 text-slate-700 font-semibold px-3 py-1 rounded-full border border-slate-200 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> {pref}
                        </span>
                      ))}
                    </div>

                    {/* AMAZON-STYLE PRODUCT PACKAGE ITEMS GRID */}
                    <div>
                      <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-3">
                        Package Products Included ({bundle.products ? bundle.products.length : 0}):
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {bundle.products && bundle.products.map((p, i) => (
                          <div key={i} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3 shadow-2xs hover:bg-white transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-white p-1 shrink-0 flex items-center justify-center border border-slate-100">
                              <ShoppingBag className="w-6 h-6 text-[#00BFA5]" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-extrabold text-[#0D9488] uppercase tracking-wider block">
                                {p.brandName}
                              </span>
                              <h4 className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-1">
                                {p.productName}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-extrabold text-slate-900 text-xs">₹{p.price ? p.price.toLocaleString('en-IN') : 0}</span>
                                {p.discount > 0 && (
                                  <span className="text-[9px] bg-[#00BFA5] text-white px-1.5 py-0.2 rounded font-extrabold">
                                    -{p.discount}%
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* PRICE SUMMARY & ACTION CTA BOX */}
                    <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                      <div className="space-y-1 text-center sm:text-left">
                        <div className="text-xs text-slate-400 font-medium">
                          Individual Total: <span className="line-through">₹{bundle.individualTotal ? bundle.individualTotal.toLocaleString('en-IN') : 0}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-300 font-bold uppercase">AI Bundle Price:</span>
                          <span className="font-anton text-3xl text-[#00BFA5] tracking-tight">
                            ₹{bundle.bundleTotal ? bundle.bundleTotal.toLocaleString('en-IN') : 0}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddBundleToCartAction(bundle, idx)}
                        disabled={addedBundles[idx]}
                        className={`w-full sm:w-auto px-6 py-3.5 rounded-full font-extrabold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all duration-200 ${
                          addedBundles[idx]
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gradient-to-r from-[#00BFA5] to-[#0D9488] hover:from-[#00A892] text-white shadow-[#00BFA5]/30 hover:scale-[1.02]'
                        }`}
                      >
                        {addedBundles[idx] ? (
                          <>
                            <Check className="w-5 h-5" />
                            <span>ADDED TO CART</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-5 h-5 text-amber-300" />
                            <span>ADD COMPLETE BUNDLE TO CART</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
