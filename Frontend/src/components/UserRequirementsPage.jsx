import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Mic, MicOff, Package, RefreshCw, AlertCircle, ChevronRight, SlidersHorizontal, CheckCircle2 } from 'lucide-react';
import { aiApi } from '../services/api';

export default function UserRequirementsPage({ initialQuery = '' }) {
  const navigate = useNavigate();

  // Form State
  const [naturalText, setNaturalText] = useState(initialQuery || '');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [startingPrice, setStartingPrice] = useState('');
  const [endingPrice, setEndingPrice] = useState('');
  const [releaseCategory, setReleaseCategory] = useState('Latest Version');
  const [discount, setDiscount] = useState('');

  // Voice Assistant State
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [voiceStatus, setVoiceStatus] = useState('');
  const recognitionRef = useRef(null);

  // Processing State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableCategories = [
    "Electronics",
    "Grocery & Food",
    "Women's Fashion",
    "Jewellery",
    "Beauty & Care",
    "Men's Fashion",
    "Footwear",
    "Home & Kitchen",
    "Sports & Fitness",
    "Books & Stationery",
    "Toys & Games",
    "Travel & Luggage"
  ];

  const availableBrands = [
    "Apple", "Samsung", "Sony", "OnePlus", "Tata", "Fortune", "Biba", "GIVA", "Maybelline", "Nike", "Adidas", "Levi's", "Prestige", "Puma", "Lego", "American Tourister"
  ];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceStatus('Listening to your voice... Speak your requirements');
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      const spokenText = (final || interim).trim();
      if (spokenText) {
        setNaturalText(spokenText);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech Recognition Error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        setVoiceStatus('Microphone access blocked. Please allow mic permissions.');
      } else {
        setVoiceStatus('Voice input stopped. Click mic to speak again.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setVoiceStatus('');
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch { }
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    if (!voiceSupported) {
      alert("Voice speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      setVoiceStatus('');
    } else {
      try {
        if (recognitionRef.current) recognitionRef.current.start();
      } catch (err) {
        console.warn("Speech start error", err);
      }
    }
  };

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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      products: selectedProducts,
      preferredBrands: selectedBrands,
      startingPrice: startingPrice ? Number(startingPrice) : null,
      endingPrice: endingPrice ? Number(endingPrice) : null,
      releaseCategory: releaseCategory ? [releaseCategory] : [],
      discount: discount ? Number(discount) : null,
      naturalText: naturalText || ""
    };

    try {
      // Step 1: Submit requirements POST /api/ai/userRequirements
      const res = await aiApi.submitRequirements(payload);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();

      const requirementId = data.requirementId || (data.requirements && data.requirements._id);
      if (requirementId) {
        // Step 2: Navigate to GET /aiEfficientSearch/:id
        navigate(`/aiEfficientSearch/${requirementId}`);
      } else {
        navigate('/bundles');
      }
    } catch (err) {
      console.error("User Requirements submission error:", err);
      setError("Unable to submit requirements to the AI bundle engine. Please verify the backend server is running and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 text-slate-900">
      
      {/* BREADCRUMB */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-2 text-xs text-slate-500">
          <button onClick={() => navigate('/')} className="hover:text-teal-700 font-medium cursor-pointer">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-900 font-bold">AI Smart Bundle Finder</span>
        </div>
      </div>

      {/* HEADER BANNER */}
      <div className="bg-[#0F172A] text-white py-10 px-4 sm:px-6 border-b border-slate-800">
        <div className="max-w-5xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Neural Bundling Engine
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Find Your Recommended Bundle
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Tell us your budget, preferred brands, and shopping goal. Our AI analyzes 1,000+ catalog items to assemble maximum-savings packages.
          </p>
        </div>
      </div>

      {/* MAIN FORM CONTAINER */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/90 space-y-6"
        >
          {/* 1. NATURAL TEXT / PROMPT & VOICE */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <span>What are you looking for?</span>
                <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full font-bold">Natural Query or Voice</span>
              </label>

              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                    : 'bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200'
                }`}
                title={isListening ? "Stop listening" : "Speak your search query"}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-3.5 h-3.5" />
                    <span>Listening... (Tap to stop)</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-teal-600" />
                    <span>Voice Assistant</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <textarea
                rows={3}
                value={naturalText}
                onChange={(e) => setNaturalText(e.target.value)}
                placeholder="e.g. Work-from-home setup with laptop, wireless mouse, and ANC headphones under ₹1,20,000"
                className={`w-full bg-slate-50 text-sm text-slate-900 p-3.5 pr-12 rounded-2xl border font-medium transition-all ${
                  isListening
                    ? 'border-rose-400 ring-2 ring-rose-400/40 bg-rose-50/20'
                    : 'border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400'
                }`}
              />
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`absolute right-3 top-3.5 p-2 rounded-xl transition-colors cursor-pointer ${
                  isListening
                    ? 'bg-rose-500 text-white animate-bounce'
                    : 'text-slate-400 hover:text-teal-600 hover:bg-slate-100'
                }`}
                title={isListening ? "Stop Voice Recognition" : "Start Voice Assistant"}
              >
                {isListening ? <Mic className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </div>

            {/* Live Voice Status Animation */}
            {isListening && (
              <div className="mt-2 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex items-center gap-2 text-rose-700 text-xs font-bold">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
                  <span>{voiceStatus || "Transcribing speech in real-time..."}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1 h-3.5 bg-rose-500 rounded-full animate-[pulse_0.6s_ease-in-out_infinite]"></span>
                  <span className="w-1 h-6 bg-rose-600 rounded-full animate-[pulse_0.4s_ease-in-out_infinite]"></span>
                  <span className="w-1 h-2.5 bg-rose-400 rounded-full animate-[pulse_0.7s_ease-in-out_infinite]"></span>
                  <span className="w-1 h-5 bg-rose-500 rounded-full animate-[pulse_0.5s_ease-in-out_infinite]"></span>
                </div>
              </div>
            )}
          </div>

          {/* 2. CATEGORIES SELECTION */}
          <div>
            <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block mb-2">
              Product Categories:
            </label>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((cat) => {
                const isSelected = selectedProducts.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. PREFERRED BRANDS SELECTION */}
          <div>
            <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block mb-2">
              Preferred Brands:
            </label>
            <div className="flex flex-wrap gap-2">
              {availableBrands.map((brand) => {
                const isSelected = selectedBrands.includes(brand);
                return (
                  <button
                    key={brand}
                    type="button"
                    onClick={() => toggleBrand(brand)}
                    className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-700 text-white shadow-sm ring-2 ring-teal-700/20'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {brand}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. BUDGET & DISCOUNT FILTERS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="text-xs font-extrabold text-slate-700 uppercase block mb-1">
                Min Budget (₹):
              </label>
              <input
                type="number"
                value={startingPrice}
                onChange={(e) => setStartingPrice(e.target.value)}
                placeholder="10000"
                className="w-full bg-slate-50 text-sm text-slate-900 p-3 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 uppercase block mb-1">
                Max Budget (₹):
              </label>
              <input
                type="number"
                value={endingPrice}
                onChange={(e) => setEndingPrice(e.target.value)}
                placeholder="150000"
                className="w-full bg-slate-50 text-sm text-slate-900 p-3 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 uppercase block mb-1">
                Min Discount (%):
              </label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="15"
                className="w-full bg-slate-50 text-sm text-slate-900 p-3 rounded-xl border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold"
              />
            </div>
          </div>

          {/* ERROR DISPLAY */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <strong className="block text-sm">Notice</strong>
                {error}
              </div>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 bg-amber-400 hover:bg-amber-500 active:scale-98 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-400/25 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Generating AI Bundles...</span>
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 text-slate-950" />
                  <span>Find Best Bundle</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
