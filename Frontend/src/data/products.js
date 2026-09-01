export const FEATURED_PRODUCTS = [
  {
    id: "prod-1",
    name: "iPhone 15 Pro",
    brand: "APPLE",
    category: "Smartphones",
    price: 119900,
    oldPrice: 141900,
    discount: 15,
    rating: 4.9,
    reviewsCount: 1240,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80",
    description: "Titanium design, A17 Pro chip, customizable Action button, and versatile 48MP main camera system.",
    specs: ["128GB Storage", "Titanium Frame", "A17 Pro Chip"]
  },
  {
    id: "prod-2",
    name: "MacBook Air M3",
    brand: "APPLE",
    category: "Laptops",
    price: 99900,
    oldPrice: 124900,
    discount: 20,
    rating: 4.8,
    reviewsCount: 890,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
    description: "Incredibly thin and fast laptop with M3 chip, Liquid Retina display, and up to 18 hours battery life.",
    specs: ["8GB Unified Memory", "256GB SSD", "13.6-inch Display"]
  },
  {
    id: "prod-3",
    name: "AirPods Pro (2nd Gen)",
    brand: "APPLE",
    category: "Audio",
    price: 23900,
    oldPrice: 26900,
    discount: 10,
    rating: 4.9,
    reviewsCount: 2350,
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80",
    description: "Up to 2x more Active Noise Cancellation, Adaptive Audio, and Personalized Spatial Audio.",
    specs: ["H2 Chip", "USB-C MagSafe Case", "30 hrs Battery"]
  },
  {
    id: "prod-4",
    name: "Galaxy S24 Ultra",
    brand: "SAMSUNG",
    category: "Smartphones",
    price: 108900,
    oldPrice: 144900,
    discount: 25,
    rating: 4.7,
    reviewsCount: 940,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80",
    description: "Galaxy AI powered camera, titanium frame, built-in S Pen, and Snapdragon 8 Gen 3 Processor.",
    specs: ["12GB RAM", "256GB Storage", "200MP Camera"]
  },
  {
    id: "prod-5",
    name: "Sony WH-1000XM5",
    brand: "SONY",
    category: "Audio",
    price: 26990,
    oldPrice: 32990,
    discount: 18,
    rating: 4.9,
    reviewsCount: 1560,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80",
    description: "Industry-leading noise cancellation with two processors and 8 microphones for superior calls.",
    specs: ["30-hour Battery", "Speak-to-Chat", "Multipoint Connect"]
  },
  {
    id: "prod-6",
    name: "iPad Air M2 11\"",
    brand: "APPLE",
    category: "Tablets",
    price: 54900,
    oldPrice: 59900,
    discount: 8,
    rating: 4.8,
    reviewsCount: 620,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80",
    description: "Fresh M2 chip performance with Liquid Retina display and support for Apple Pencil Pro.",
    specs: ["128GB Storage", "Liquid Retina", "M2 Chip"]
  }
];

export const PRESET_BUNDLES = [
  {
    id: "bundle-apple-pro",
    title: "Ultimate Apple Ecosystem Bundle",
    subtitle: "Matched by BundleAI for maximum productivity & ecosystem synergy",
    items: ["prod-1", "prod-2", "prod-3"],
    totalOriginal: 293700,
    bundlePrice: 228900,
    savings: 64800,
    discountPercent: 22,
    badge: "TOP AI MATCH"
  },
  {
    id: "bundle-wfh",
    title: "Pro Creator & WFH Setup",
    subtitle: "Complete laptop, noise-canceling audio & tablet workstation",
    items: ["prod-2", "prod-5", "prod-6"],
    totalOriginal: 217790,
    bundlePrice: 169990,
    savings: 47800,
    discountPercent: 21,
    badge: "POPULAR BUNDLE"
  },
  {
    id: "bundle-mobile",
    title: "Flagship Mobile & Audio Kit",
    subtitle: "Premium smartphone + studio noise cancelling wireless sound",
    items: ["prod-4", "prod-5"],
    totalOriginal: 177890,
    bundlePrice: 129900,
    savings: 47990,
    discountPercent: 27,
    badge: "BEST VALUE"
  }
];

export const VALUE_PROPS = [
  {
    id: 1,
    title: "SMART BUNDLES",
    desc: "AI creates the best value bundles tailored to your needs",
    icon: "Sparkles"
  },
  {
    id: 2,
    title: "BIG SAVINGS",
    desc: "Save more with exclusive AI-calculated bundle discounts",
    icon: "Tag"
  },
  {
    id: 3,
    title: "TOP BRANDS",
    desc: "Get your favorite authentic brands all in one smart place",
    icon: "ShieldCheck"
  },
  {
    id: 4,
    title: "FAST DELIVERY",
    desc: "Quick, insured & reliable door-to-door delivery guaranteed",
    icon: "Truck"
  }
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Tell us what you need",
    desc: "Type any prompt, product name, budget limit, or bundle goal into our AI search engine.",
    icon: "MessageSquareText"
  },
  {
    step: "02",
    title: "AI compares products",
    desc: "Our neural algorithms analyze compatibility, price histories, and stackable discounts across 10,000+ top products.",
    icon: "Cpu"
  },
  {
    step: "03",
    title: "Get best bundle & savings",
    desc: "Review your personalized multi-product bundle with unlocked savings up to 30% and checkout in one click.",
    icon: "Sparkles"
  }
];
