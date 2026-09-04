import { ELECTRONICS_PRODUCTS } from './electronics.js';
import { GROCERY_PRODUCTS } from './grocery.js';
import { WOMENS_FASHION_PRODUCTS } from './womensFashion.js';
import { FASHION_ACCESSORIES_PRODUCTS } from './fashionAccessories.js';
import { JEWELLERY_PRODUCTS } from './jewellery.js';
import { BEAUTY_PRODUCTS } from './beauty.js';
import { MENS_FASHION_PRODUCTS } from './mensFashion.js';
import { FOOTWEAR_PRODUCTS } from './footwear.js';
import { HOME_KITCHEN_PRODUCTS } from './homeKitchen.js';
import { SPORTS_PRODUCTS } from './sports.js';
import { BOOKS_STATIONERY_PRODUCTS } from './booksStationery.js';
import { TOYS_GAMES_PRODUCTS } from './toysGames.js';
import { OTHER_PRODUCTS } from './otherProducts.js';
import { CATEGORIES as MARKETPLACE_CATEGORIES, SUBCATEGORIES_BY_CATEGORY } from './categories.js';

// Aggregate all 13 modules into the single unified marketplace catalog
export const FEATURED_PRODUCTS = [
  ...ELECTRONICS_PRODUCTS,
  ...GROCERY_PRODUCTS,
  ...WOMENS_FASHION_PRODUCTS,
  ...FASHION_ACCESSORIES_PRODUCTS,
  ...JEWELLERY_PRODUCTS,
  ...BEAUTY_PRODUCTS,
  ...MENS_FASHION_PRODUCTS,
  ...FOOTWEAR_PRODUCTS,
  ...HOME_KITCHEN_PRODUCTS,
  ...SPORTS_PRODUCTS,
  ...BOOKS_STATIONERY_PRODUCTS,
  ...TOYS_GAMES_PRODUCTS,
  ...OTHER_PRODUCTS,
];

// Re-export full 13-category hierarchy for marketplace navigation
export const CATEGORIES = MARKETPLACE_CATEGORIES;
export { SUBCATEGORIES_BY_CATEGORY };

export const LIGHTNING_DEALS = [
  {
    id: "prod-4",
    title: "Samsung Galaxy S24 Ultra 5G",
    category: "Electronics",
    discount: 24,
    price: 109999,
    oldPrice: 144900,
    claimedPercentage: 84,
    timeLeftSeconds: 14820,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80",
    badge: "Lightning Deal"
  },
  {
    id: "prod-2",
    title: "Apple MacBook Air 13.6\" M3 Chip",
    category: "Electronics",
    discount: 20,
    price: 99900,
    oldPrice: 124900,
    claimedPercentage: 91,
    timeLeftSeconds: 9340,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
    badge: "Deal of the Day"
  },
  {
    id: "prod-5",
    title: "Sony WH-1000XM5 Wireless Headphones",
    category: "Electronics",
    discount: 18,
    price: 26990,
    oldPrice: 32990,
    claimedPercentage: 76,
    timeLeftSeconds: 17200,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80",
    badge: "Limited Stock"
  },
  {
    id: "prod-10",
    title: "Sony PlayStation 5 Console (Slim Disc)",
    category: "Electronics",
    discount: 9,
    price: 49990,
    oldPrice: 54990,
    claimedPercentage: 96,
    timeLeftSeconds: 4320,
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80",
    badge: "Almost Sold Out"
  },
  {
    id: "groc-1",
    title: "India Gate Basmati Rice Classic 5kg",
    category: "Grocery & Food",
    discount: 20,
    price: 925,
    oldPrice: 1150,
    claimedPercentage: 68,
    timeLeftSeconds: 11200,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
    badge: "Lightning Deal"
  },
  {
    id: "wom-1",
    title: "BIBA Floral Print Pure Cotton Anarkali Set",
    category: "Women's Fashion",
    discount: 50,
    price: 2999,
    oldPrice: 5999,
    claimedPercentage: 88,
    timeLeftSeconds: 8400,
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80",
    badge: "Deal of the Day"
  },
  {
    id: "jew-1",
    title: "GIVA 925 Sterling Silver Solitaire Pendant",
    category: "Jewellery",
    discount: 40,
    price: 1799,
    oldPrice: 2999,
    claimedPercentage: 94,
    timeLeftSeconds: 5200,
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
    badge: "Limited Stock"
  },
  {
    id: "home-1",
    title: "Prestige Deluxe Alpha SS Pressure Cooker 3L",
    category: "Home & Kitchen",
    discount: 23,
    price: 2199,
    oldPrice: 2840,
    claimedPercentage: 79,
    timeLeftSeconds: 13500,
    image: "https://images.unsplash.com/photo-1584990347449-307f59d4c7b8?auto=format&fit=crop&w=600&q=80",
    badge: "Lightning Deal"
  }
];

export const PRESET_BUNDLES = [
  {
    id: "bundle-apple-pro",
    title: "Flagship Creator & Productivity Suite",
    subtitle: "Matched by IntentCartAI for maximum productivity & ecosystem synergy",
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
  },
  {
    id: "bundle-festive-ethnic",
    title: "Grand Festive Celebration Combo",
    subtitle: "Handcrafted Anarkali suit set + 925 silver solitaire pendant + ethnic tote",
    items: ["wom-1", "jew-1", "acc-1"],
    totalOriginal: 12988,
    bundlePrice: 5999,
    savings: 6989,
    discountPercent: 54,
    badge: "FESTIVE COMBO"
  },
  {
    id: "bundle-smart-kitchen",
    title: "Masterchef Modern Kitchen Bundle",
    subtitle: "Stainless steel pressure cooker + Rapid Air Fryer + Borosil containers",
    items: ["home-1", "home-7", "home-14"],
    totalOriginal: 14425,
    bundlePrice: 9499,
    savings: 4926,
    discountPercent: 34,
    badge: "KITCHEN ESSENTIAL"
  }
];

export const VALUE_PROPS = [
  {
    id: 1,
    title: "FREE EXPRESS DELIVERY",
    desc: "Guaranteed next-day delivery on 1,000+ Prime eligible marketplace products",
    icon: "Truck"
  },
  {
    id: 2,
    title: "AI BUNDLE SAVINGS",
    desc: "Save up to 35% extra with intelligent multi-item bundle algorithms",
    icon: "Tag"
  },
  {
    id: 3,
    title: "100% AUTHENTIC BRANDS",
    desc: "Direct brand warranties with verified manufacturer serials & seals",
    icon: "ShieldCheck"
  },
  {
    id: 4,
    title: "7-DAY REPLACEMENT",
    desc: "Hassle-free doorstep returns and instant refund protection",
    icon: "RotateCcw"
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
    desc: "Our neural algorithms analyze compatibility, price histories, and stackable discounts across 1,000+ marketplace products.",
    icon: "Cpu"
  },
  {
    step: "03",
    title: "Get best bundle & savings",
    desc: "Review your personalized multi-product bundle with unlocked savings up to 35% and checkout in one click.",
    icon: "Sparkles"
  }
];
