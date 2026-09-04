const genAI = require("../config/openai");
const AiModel = require("../models/ai.model");
const Product = require("../models/product.model");

const MIN_INTERSECTION_RATE = 1; // Show and consider all products with even >= 1% intersection
const MAX_CANDIDATES = 40;
const MIN_BUNDLE_PRODUCTS = 2;
const MAX_BUNDLE_PRODUCTS = 4;

const SYNONYMS = {
  phone:       ["mobile", "smartphone", "iphone", "galaxy", "pixel", "nord", "redmi", "edge", "phone", "pro max", "ultra", "poco", "iqoo"],
  mobile:      ["mobile", "smartphone", "iphone", "galaxy", "pixel", "nord", "redmi", "edge", "phone", "pro max", "ultra"],
  laptop:      ["laptop", "macbook", "xps", "spectre", "ideapad", "zephyrus", "notebook", "zenbook", "vivobook", "inspiron", "thinkpad", "tuf", "legion", "pavilion", "omen", "victus"],
  gaming:      ["gaming", "ps5", "playstation", "xbox", "switch", "rog", "zephyrus", "controller", "headset", "razer", "ultra", "gamepad", "console", "joystick"],
  earbuds:     ["earbuds", "airpods", "buds", "earphones", "wf-", "freebuds", "airdopes", "tws"],
  headphones:  ["headphones", "wh-", "wh1000", "momentum", "pulse", "rockerz", "headset"],
  audio:       ["earbuds", "airpods", "buds", "headphones", "earphones", "audio", "wh-1000", "speaker", "soundbar"],
  watch:       ["watch", "smartwatch", "fitbit", "series 9", "watch6", "galaxy watch", "apple watch", "wave", "colorfit"],
  smartwatch:  ["watch", "smartwatch", "fitbit", "series 9", "watch6", "galaxy watch", "apple watch", "wave", "colorfit"],
  sports:      ["running", "shoes", "pegasus", "ultraboost", "boots", "duffle", "dumbbell", "fitbit", "sports", "jersey", "gloves", "fitness"],
  jewellery:   ["pendant", "necklace", "earrings", "bracelet", "choker", "gold", "diamond", "jewellery", "ring", "bangle", "silver"],
  toy:         ["lego", "hot wheels", "barbie", "nerf", "toys", "kids", "puzzle", "rc car", "board game"],
  food:        ["coconut oil", "chocolate", "almonds", "cashews", "matcha", "food", "snack", "protein", "organic", "grocery"],
  accessories: ["case", "cover", "charger", "cable", "stand", "mouse", "keyboard", "hub", "bag", "backpack", "adapter", "dock"],
  console:     ["ps5", "playstation", "xbox", "switch", "console"]
};

const PRODUCT_TYPE_TO_CATEGORY = {
  phone:       ["mobile phones", "smartphones", "phone", "mobile"],
  mobile:      ["mobile phones", "smartphones", "phone", "mobile"],
  smartphone:  ["mobile phones", "smartphones"],
  laptop:      ["laptops", "laptop", "computers", "notebook"],
  gaming:      ["gaming", "gaming consoles", "gaming laptops", "gaming accessories", "consoles"],
  earbuds:     ["accessories", "audio", "headphones", "earbuds"],
  headphones:  ["accessories", "audio", "headphones"],
  audio:       ["accessories", "audio", "headphones", "earbuds"],
  watch:       ["accessories", "smartwatches", "watches", "wearables"],
  smartwatch:  ["accessories", "smartwatches", "wearables"],
  sports:      ["sports", "footwear", "fitness", "sports & fitness"],
  jewellery:   ["jewellery", "jewelry", "accessories"],
  toy:         ["kids toys", "toys", "kids", "kids & toys"],
  food:        ["food", "groceries", "snacks", "nutrition"],
  accessories: ["accessories", "mobile accessories", "laptop accessories"]
};

const COMPATIBLE_CATEGORIES = {
  "mobile phones":       ["accessories", "gaming"],
  "laptops":             ["accessories", "gaming"],
  "gaming":              ["accessories", "laptops", "mobile phones"],
  "sports":              ["accessories"],
  "jewellery":           ["accessories"],
  "kids toys":           ["gaming"],
  "food":                [],
  "accessories":         ["mobile phones", "laptops", "gaming", "sports", "jewellery"]
};

const HARD_BRAND_PHRASES = [
  "i need", "i want", "must be", "only", "strictly", "has to be",
  "should be", "looking for", "give me", "i require", "exclusively"
];

const RELEASE_KEYWORDS = {
  latest:  ["2024", "2025", "2026", "v2", "gen 2", "series 9", "15th gen", "new", "latest"],
  budget:  ["budget", "affordable", "lite", "se", "value", "cheap", "entry"],
  premium: ["pro", "ultra", "max", "plus", "flagship", "premium", "deluxe"]
};

/**
 * Parses free text prompt and extracts semantic user requirements
 */
function parseNaturalText(naturalText, prefs) {
  if (!naturalText || typeof naturalText !== "string") return prefs;
  const text = naturalText.toLowerCase();

  const knownBrands = [
    "apple", "samsung", "google", "oneplus", "xiaomi", "mi", "motorola",
    "nothing", "realme", "sony", "nike", "adidas", "dell", "hp",
    "lenovo", "asus", "logitech", "microsoft", "nintendo", "lego",
    "barbie", "bose", "jbl", "sennheiser", "razer", "corsair",
    "fitbit", "garmin", "boat", "noise", "redmi", "vivo", "oppo",
    "huawei", "honor", "lg", "panasonic", "philips", "msi", "acer", "alienware"
  ];

  knownBrands.forEach((b) => {
    const regex = new RegExp(`\\b${b}\\b`, "i");
    if (regex.test(text) && !prefs.preferredBrands.some((pb) => pb.toLowerCase() === b)) {
      const formatted = b === "mi" ? "Xiaomi" : (b.charAt(0).toUpperCase() + b.slice(1));
      if (!prefs.preferredBrands.includes(formatted)) {
        prefs.preferredBrands.push(formatted);
      }
    }
  });

  // Price parsing
  if (!prefs.endingPrice) {
    if (text.includes("lakh") || text.includes("lac") || text.includes("k")) {
      const lakhMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac)/i);
      const kMatch = text.match(/(?:under|below|less than|max|upto|up to|<|budget(?:\s*of)?)\s*(?:rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*k\b/i);
      if (lakhMatch) {
        prefs.endingPrice = parseFloat(lakhMatch[1]) * 100000;
      } else if (kMatch) {
        prefs.endingPrice = parseFloat(kMatch[1]) * 1000;
      }
    }
    if (!prefs.endingPrice) {
      const m = text.match(/(?:under|below|less than|max|upto|up to|<|budget(?:\s*of)?)\s*(?:rs\.?|inr)?\s*(\d[\d,]*)/i);
      if (m) prefs.endingPrice = parseInt(m[1].replace(/,/g, ""), 10);
    }
  }

  if (!prefs.startingPrice) {
    const m = text.match(/(?:above|over|minimum|min|from|starting)\s*(?:rs\.?|inr)?\s*(\d[\d,]*)/i);
    if (m) prefs.startingPrice = parseInt(m[1].replace(/,/g, ""), 10);
  }

  // Device/Category extraction
  Object.keys(PRODUCT_TYPE_TO_CATEGORY).forEach((k) => {
    const regex = new RegExp(`\\b${k}\\b`, "i");
    if (regex.test(text) && !prefs.products.map((p) => p.toLowerCase()).includes(k)) {
      prefs.products.push(k);
    }
  });

  Object.keys(SYNONYMS).forEach((key) => {
    const synonymsList = SYNONYMS[key];
    if (synonymsList.some((syn) => {
      const r = new RegExp(`\\b${syn}\\b`, "i");
      return r.test(text);
    })) {
      if (!prefs.products.map((p) => p.toLowerCase()).includes(key)) {
        prefs.products.push(key);
      }
    }
  });

  if (!prefs.discount) {
    const discMatch = text.match(/(\d+)\s*%\s*(?:off|discount)/i);
    if (discMatch) {
      prefs.discount = parseInt(discMatch[1], 10);
    } else if (text.includes("discount") || text.includes("offer") || text.includes("deal") || text.includes("sale")) {
      prefs.discount = 5;
    }
  }

  if (!prefs.releaseCategory || prefs.releaseCategory.length === 0) {
    if (text.includes("latest") || text.includes("new") || text.includes("newest") || text.includes("recent") || text.includes("2024") || text.includes("2025") || text.includes("2026")) {
      prefs.releaseCategory = ["latest"];
    } else if (text.includes("budget") || text.includes("affordable") || text.includes("cheap")) {
      prefs.releaseCategory = ["budget"];
    } else if (text.includes("premium") || text.includes("flagship") || text.includes("pro") || text.includes("ultra")) {
      prefs.releaseCategory = ["premium"];
    }
  }

  return prefs;
}

function detectHardBrandRequirement(naturalText, brand) {
  if (!naturalText || !brand) return false;
  const textLower = naturalText.toLowerCase();
  const brandLower = brand.toLowerCase();
  for (const phrase of HARD_BRAND_PHRASES) {
    const idx = textLower.indexOf(phrase);
    if (idx !== -1) {
      const window = textLower.slice(idx, idx + 80);
      if (window.includes(brandLower)) return true;
    }
  }
  return false;
}

/**
 * Calculates the exact intersection score (0 - 100%) of a product against user requirements
 * Following the algorithm from user specification:
 * 1. Look for requested products/devices. Stick strictly to requested devices.
 * 2. Look for chosen or preferred brands first and budget simultaneously.
 * 3. Award intersection score accordingly. Non-matching brands get lower score / 0% brand bonus.
 */
function computeProductIntersection(p, preferences, hardBrands) {
  const {
    products: requestedProducts = [],
    preferredBrands = [],
    startingPrice,
    endingPrice,
    discount: discountPref,
    releaseCategory = [],
    naturalText = ""
  } = preferences;

  const nameLower    = (p.productName || "").toLowerCase();
  const catLower     = (p.category    || "").toLowerCase();
  const brandLower   = (p.brandName   || "").toLowerCase();
  const textLower    = (naturalText   || "").toLowerCase();
  const releaseLower = (p.releaseDate || "").toLowerCase();

  let intersectionScore = 0;
  let categoryScore = 0;

  const hasDevicePreference = requestedProducts.length > 0;

  if (hasDevicePreference) {
    let matchesDevice = false;
    requestedProducts.forEach((reqProd) => {
      const reqLower = reqProd.toLowerCase();
      if (catLower.includes(reqLower) || nameLower.includes(reqLower)) {
        categoryScore = Math.max(categoryScore, 50);
        matchesDevice = true;
      }
      const mappedCats = PRODUCT_TYPE_TO_CATEGORY[reqLower] || [];
      if (mappedCats.some((mc) => catLower.includes(mc.toLowerCase()) || mc.toLowerCase().includes(catLower))) {
        categoryScore = Math.max(categoryScore, 48);
        matchesDevice = true;
      }
      const syns = SYNONYMS[reqLower] || [];
      if (syns.some((syn) => nameLower.includes(syn) || catLower.includes(syn))) {
        categoryScore = Math.max(categoryScore, 42);
        matchesDevice = true;
      }
    });

    // If strictly requested specific devices and this product is unrelated, give minimal baseline
    if (!matchesDevice) {
      // Check if it's a compatible accessory/peripheral
      const isCompatibleAccessory = catLower.includes("accessories");
      if (isCompatibleAccessory) {
        categoryScore = 20;
      } else {
        categoryScore = 1; // Keep >= 1% as nearest match baseline
      }
    }
  } else {
    // Broad search: no specific device requested, all products eligible
    categoryScore = 40;
    if (textLower) {
      const textWords = textLower.split(/\s+/).filter((w) => w.length > 3);
      if (textWords.some((w) => nameLower.includes(w) || catLower.includes(w))) {
        categoryScore += 10;
      }
    }
  }

  intersectionScore += categoryScore;

  // 2. Brand matching
  let brandScore = 0;
  if (preferredBrands.length > 0) {
    const brandIdx = preferredBrands.findIndex((b) => b.toLowerCase() === brandLower || brandLower.includes(b.toLowerCase()) || b.toLowerCase().includes(brandLower));
    if (brandIdx === 0) {
      brandScore = 30; // 1st preferred brand
    } else if (brandIdx === 1) {
      brandScore = 20; // 2nd preferred brand
    } else if (brandIdx >= 2) {
      brandScore = 12; // 3rd+ preferred brand
    } else {
      brandScore = 0; // Other brands have 0% brand intersection bonus
    }
  } else {
    brandScore = 15; // No brand restriction
  }
  intersectionScore += brandScore;

  // 3. Budget matching
  let budgetScore = 0;
  if (endingPrice) {
    if (p.price <= endingPrice) {
      budgetScore += 15;
    } else if (p.price <= endingPrice * 1.15) {
      budgetScore += 5;
    } else {
      budgetScore -= 10;
    }
  } else {
    budgetScore += 8;
  }

  if (startingPrice && p.price >= startingPrice) {
    budgetScore += 5;
  }
  intersectionScore += budgetScore;

  // 4. Discount & Offers matching
  if (discountPref && p.discount >= discountPref) {
    intersectionScore += 10;
  } else if (p.discount >= 10) {
    intersectionScore += 5;
  }

  // 5. Version / Release category matching
  if (releaseCategory && releaseCategory.length > 0) {
    releaseCategory.forEach((rc) => {
      const rcLower = (rc || "").toLowerCase();
      const keywords = RELEASE_KEYWORDS[rcLower] || [];
      if (keywords.some((kw) => releaseLower.includes(kw) || nameLower.includes(kw))) {
        intersectionScore += 10;
      }
    });
  }

  // Hard brand enforcement (if user strictly stated only this brand)
  if (hardBrands && hardBrands.size > 0) {
    const matchesHard = [...hardBrands].some((hb) => brandLower.includes(hb.toLowerCase()) || hb.toLowerCase().includes(brandLower));
    if (!matchesHard) {
      intersectionScore = Math.max(1, intersectionScore - 40);
    }
  }

  // Normalized score: minimum 1%, maximum 100%
  const finalScore = Math.max(1, Math.min(100, Math.round(intersectionScore)));
  return finalScore;
}

/**
 * Filter and rank products by intersection score (>= 1%) in descending order
 */
function rankAndFilterCandidates(preferences, availableProducts, hardBrands) {
  const scored = availableProducts.map((p) => {
    const intersectionScore = computeProductIntersection(p, preferences, hardBrands);
    return {
      ...p,
      intersectionScore,
      relevanceScore: intersectionScore
    };
  });

  // Keep all products with >= 1% intersection rate
  const eligible = scored.filter((p) => p.intersectionScore >= MIN_INTERSECTION_RATE);

  // Sort strictly in descending order of intersection rate
  eligible.sort((a, b) => b.intersectionScore - a.intersectionScore);

  // Guarantee nearest match: if somehow empty, return top products
  if (eligible.length === 0) {
    return scored.slice(0, MAX_CANDIDATES);
  }

  return eligible.slice(0, MAX_CANDIDATES);
}

function areCategoriesCompatible(cat1, cat2) {
  if (!cat1 || !cat2) return true;
  const c1 = cat1.toLowerCase().trim();
  const c2 = cat2.toLowerCase().trim();
  if (c1 === c2) return true;
  const compat1 = COMPATIBLE_CATEGORIES[c1] || [];
  const compat2 = COMPATIBLE_CATEGORIES[c2] || [];
  return (
    compat1.some((c) => c2.includes(c) || c.includes(c2)) ||
    compat2.some((c) => c1.includes(c) || c.includes(c1))
  );
}

function areBundleProductsCompatible(items) {
  if (items.length <= 1) return true;
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (!areCategoriesCompatible(items[i].category, items[j].category)) return false;
    }
  }
  return true;
}

function computeBundleSavings(items) {
  const individualTotal = items.reduce((s, p) => s + (p.price || 0), 0);
  const bundleTotal = items.reduce((s, p) => {
    const discount = p.discount || 0;
    const discountedPrice = Math.round(p.price * (1 - discount / 100));
    return s + discountedPrice;
  }, 0);
  const savings = Math.max(0, individualTotal - bundleTotal);
  const savingsPercentage = individualTotal > 0
    ? parseFloat(((savings / individualTotal) * 100).toFixed(2))
    : 0;
  return { individualTotal, bundleTotal, savings, savingsPercentage };
}

function getPreferredBrandMatches(items, preferredBrands) {
  const matches = [];
  const seenBrands = new Set();
  preferredBrands.forEach((brand, idx) => {
    const brandLower = brand.toLowerCase();
    const hasIt = items.some((p) => (p.brandName || "").toLowerCase() === brandLower || (p.brandName || "").toLowerCase().includes(brandLower));
    if (hasIt && !seenBrands.has(brandLower)) {
      seenBrands.add(brandLower);
      const position = idx + 1;
      const suffix = position === 1 ? "st" : position === 2 ? "nd" : position === 3 ? "rd" : "th";
      matches.push({
        brand,
        preferenceIndex: position,
        message: `You are getting your ${position}${suffix} preferred brand: ${brand}`
      });
    }
  });
  return matches;
}

function buildMatchedPreferences(items, preferences, math) {
  const { preferredBrands = [], endingPrice, releaseCategory = [], discount: discountPref } = preferences;
  const tags = [];
  const brandMatches = getPreferredBrandMatches(items, preferredBrands);
  brandMatches.forEach((m) => tags.push(`Preferred Brand: ${m.brand}`));

  if (endingPrice && math.bundleTotal <= endingPrice) {
    tags.push(`Within Budget (<= Rs.${endingPrice.toLocaleString("en-IN")})`);
  }

  if (releaseCategory.length > 0) {
    const rcLabel = releaseCategory.map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(", ");
    tags.push(`${rcLabel} Release`);
  }

  if (discountPref) {
    const hasDiscount = items.some((p) => (p.discount || 0) >= discountPref);
    if (hasDiscount) tags.push(`Discount >= ${discountPref}%`);
  }

  if (tags.length === 0) tags.push("Optimal Intersection Match");
  return tags;
}

function scoreBundleAgainstPreferences(bundleProducts, preferences, candidateScores) {
  const { products: requestedProducts = [], preferredBrands = [], endingPrice } = preferences;
  let score = 0;

  // 1. Average product intersection score (up to 40 pts)
  const bundleIds = bundleProducts.map((p) => (p._id || p.productId || "").toString());
  const productScores = bundleIds.map((id) => {
    const found = candidateScores.find((c) => (c._id || c.productId || "").toString() === id);
    return found ? (found.intersectionScore || found.relevanceScore || 50) : 50;
  });
  if (productScores.length > 0) {
    const avgScore = productScores.reduce((a, b) => a + b, 0) / productScores.length;
    score += Math.round((avgScore / 100) * 40);
  }

  // 2. Brand preference bonus (up to 30 pts)
  if (preferredBrands.length > 0) {
    let brandBonus = 0;
    bundleProducts.forEach((p) => {
      const brandLower = (p.brandName || "").toLowerCase();
      const idx = preferredBrands.findIndex((b) => b.toLowerCase() === brandLower || brandLower.includes(b.toLowerCase()));
      if (idx === 0)      brandBonus = Math.max(brandBonus, 30);
      else if (idx === 1) brandBonus = Math.max(brandBonus, 20);
      else if (idx >= 2)  brandBonus = Math.max(brandBonus, 10);
    });
    score += brandBonus;
  } else {
    score += 15;
  }

  // 3. Budget compliance (up to 20 pts)
  const bundleTotal = bundleProducts.reduce((s, p) => s + (p.price || 0), 0);
  if (endingPrice) {
    if (bundleTotal <= endingPrice) {
      score += 20;
    } else if (bundleTotal <= endingPrice * 1.15) {
      score += 8;
    } else {
      score -= 15;
    }
  } else {
    score += 10;
  }

  // 4. Savings bonus (up to 10 pts)
  const math = computeBundleSavings(bundleProducts);
  score += Math.min(10, Math.round(math.savingsPercentage / 5));

  return Math.max(1, Math.min(100, score));
}

function bundleFingerprint(items) {
  return items.map((p) => (p._id || p.productId || p.productName || "").toString()).sort().join("|");
}

function createBundle(name, items, preferences, candidateScores, reason) {
  const math = computeBundleSavings(items);
  const { preferredBrands = [] } = preferences;

  const productsForBundle = items.map((p) => ({
    productId:      (p._id || p.productId || "").toString(),
    productName:    p.productName,
    brandName:      p.brandName,
    price:          p.price,
    discount:       p.discount || 0,
    category:       p.category,
    releaseDate:    p.releaseDate || "",
    stockAvailable: p.stockAvailable || 1
  }));

  const bundleScore = scoreBundleAgainstPreferences(items, preferences, candidateScores);
  const preferredBrandMatches = getPreferredBrandMatches(items, preferredBrands);
  const matchedPreferences    = buildMatchedPreferences(items, preferences, math);

  return {
    name,
    products: productsForBundle,
    individualTotal:   math.individualTotal,
    bundleTotal:       math.bundleTotal,
    savings:           math.savings,
    savingsPercentage: math.savingsPercentage,
    preferredBrandMatches,
    matchedPreferences,
    reason,
    score: bundleScore
  };
}

/**
 * Algorithmic bundle generation strictly following the algorithm rules
 */
function generateAlgorithmicBundles(preferences, candidates) {
  const { preferredBrands = [], endingPrice } = preferences;
  const bundlesList = [];
  const seenFingerprints = new Set();

  function tryAddBundle(name, items, reason) {
    if (!items || items.length < MIN_BUNDLE_PRODUCTS) return;
    const bundleItems = items.slice(0, MAX_BUNDLE_PRODUCTS);
    if (!areBundleProductsCompatible(bundleItems)) return;
    const fp = bundleFingerprint(bundleItems);
    if (seenFingerprints.has(fp)) return;
    seenFingerprints.add(fp);
    const bundle = createBundle(name, bundleItems, preferences, candidates, reason);
    if (bundle) bundlesList.push(bundle);
  }

  // 1. Top Ranked Highest-Intersection Bundle
  if (candidates.length >= MIN_BUNDLE_PRODUCTS) {
    const bestItems = [];
    for (const c of candidates) {
      if (bestItems.length === 0) { bestItems.push(c); continue; }
      if (bestItems.length < MAX_BUNDLE_PRODUCTS && bestItems.every((prev) => areCategoriesCompatible(prev.category, c.category))) {
        bestItems.push(c);
      }
    }
    tryAddBundle(
      "Optimal Match Bundle",
      bestItems,
      "Highest intersection rate products matching your requested devices, preferred brands, and budget."
    );
  }

  // 2. Preferred Brand #1 Focused Bundle
  if (preferredBrands.length > 0) {
    const topBrand = preferredBrands[0];
    const brandItems = candidates.filter((c) => (c.brandName || "").toLowerCase().includes(topBrand.toLowerCase()) || topBrand.toLowerCase().includes((c.brandName || "").toLowerCase()));
    if (brandItems.length >= MIN_BUNDLE_PRODUCTS) {
      const subset = [];
      for (const bi of brandItems) {
        if (subset.length === 0) { subset.push(bi); continue; }
        if (subset.length < MAX_BUNDLE_PRODUCTS && subset.every((prev) => areCategoriesCompatible(prev.category, bi.category))) {
          subset.push(bi);
        }
      }
      tryAddBundle(
        `${topBrand} Preferred Ecosystem Bundle`,
        subset,
        `All-${topBrand} setup designed around your primary brand preference.`
      );
    }

    if (brandItems.length >= 1) {
      const mixItems = [brandItems[0]];
      for (const c of candidates) {
        if (mixItems.length >= MAX_BUNDLE_PRODUCTS) break;
        const alreadyAdded = mixItems.some((m) => (m._id || m.productId || "").toString() === (c._id || c.productId || "").toString());
        if (!alreadyAdded && mixItems.every((prev) => areCategoriesCompatible(prev.category, c.category))) {
          mixItems.push(c);
        }
      }
      if (mixItems.length >= MIN_BUNDLE_PRODUCTS) {
        tryAddBundle(
          `${topBrand} Value Synergy Bundle`,
          mixItems,
          `Features your #1 preferred brand (${topBrand}) paired with top complementary products.`
        );
      }
    }
  }

  // 3. Maximum Savings & Discount Bundle
  const highDiscountItems = [...candidates].sort((a, b) => (b.discount || 0) - (a.discount || 0));
  if (highDiscountItems.length >= MIN_BUNDLE_PRODUCTS) {
    const subset = [];
    for (const hi of highDiscountItems) {
      if (subset.length === 0) { subset.push(hi); continue; }
      if (subset.length < MAX_BUNDLE_PRODUCTS && subset.every((prev) => areCategoriesCompatible(prev.category, hi.category))) {
        subset.push(hi);
      }
    }
    tryAddBundle(
      "Maximum Savings Bundle",
      subset,
      "Combines highest-discount products from your filtered results to maximize total savings."
    );
  }

  // 4. Budget-Optimized Bundle
  if (endingPrice) {
    const budgetItems = candidates.filter((c) => c.price <= endingPrice);
    if (budgetItems.length >= MIN_BUNDLE_PRODUCTS) {
      const subset = [];
      for (const bi of budgetItems) {
        if (subset.length === 0) { subset.push(bi); continue; }
        if (subset.length < MAX_BUNDLE_PRODUCTS && subset.every((prev) => areCategoriesCompatible(prev.category, bi.category))) {
          subset.push(bi);
        }
      }
      tryAddBundle(
        "Budget Value Bundle",
        subset,
        `Curated options within your budget of Rs.${endingPrice.toLocaleString("en-IN")}.`
      );
    }
  }

  // 5. Complete Setup Multi-Category Bundle
  const seenCategories = new Set();
  const completeItems = [];
  for (const c of candidates) {
    const catKey = (c.category || "").toLowerCase();
    if (!seenCategories.has(catKey) && completeItems.length < MAX_BUNDLE_PRODUCTS) {
      if (completeItems.length === 0 || completeItems.every((prev) => areCategoriesCompatible(prev.category, c.category))) {
        seenCategories.add(catKey);
        completeItems.push(c);
      }
    }
  }
  if (completeItems.length >= MIN_BUNDLE_PRODUCTS && seenCategories.size >= 2) {
    tryAddBundle(
      "Complete Setup Bundle",
      completeItems,
      "Diverse multi-category bundle covering your complete setup requirements."
    );
  }

  // 6. Category-focused bundle for dominant category
  const categoryCounts = {};
  candidates.forEach((c) => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });
  const topCategory = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a])[0];
  if (topCategory) {
    const catItems = candidates.filter((c) => c.category === topCategory).slice(0, MAX_BUNDLE_PRODUCTS);
    if (catItems.length >= MIN_BUNDLE_PRODUCTS) {
      tryAddBundle(
        `${topCategory} Collection Bundle`,
        catItems,
        `Top curated products in ${topCategory} for maximum value.`
      );
    }
  }

  // 7. Alternative / Nearest Match Bundle (for exploring alternatives)
  if (candidates.length >= MIN_BUNDLE_PRODUCTS * 2) {
    const altItems = candidates.slice(MIN_BUNDLE_PRODUCTS, MIN_BUNDLE_PRODUCTS + MAX_BUNDLE_PRODUCTS);
    if (altItems.length >= MIN_BUNDLE_PRODUCTS) {
      const compatibleAlt = [];
      for (const item of altItems) {
        if (compatibleAlt.length === 0 || compatibleAlt.every((prev) => areCategoriesCompatible(prev.category, item.category))) {
          compatibleAlt.push(item);
        }
      }
      if (compatibleAlt.length >= MIN_BUNDLE_PRODUCTS) {
        tryAddBundle(
          "Alternative Best Match Bundle",
          compatibleAlt,
          "If you wish to explore alternative options, this combination provides high value and strong synergy."
        );
      }
    }
  }

  // Sort bundles descending by match score
  bundlesList.sort((a, b) => b.score - a.score);
  return bundlesList;
}

/**
 * Main bundle generation orchestrator
 * Feeds the exact algorithm to Gemini AI, with algorithmic engine guarantee
 */
const generateBundles = async (userInput) => {
  let preferences = {
    products: [],
    preferredBrands: [],
    startingPrice: null,
    endingPrice: null,
    releaseCategory: [],
    discount: null,
    naturalText: ""
  };

  if (typeof userInput === "object" && userInput !== null) {
    preferences = {
      products: Array.isArray(userInput.products)
        ? userInput.products : userInput.products ? [userInput.products] : [],
      preferredBrands: Array.isArray(userInput.preferredBrands)
        ? userInput.preferredBrands : userInput.preferredBrands ? [userInput.preferredBrands] : [],
      startingPrice: userInput.startingPrice ? Number(userInput.startingPrice) : null,
      endingPrice:   userInput.endingPrice   ? Number(userInput.endingPrice)   : null,
      releaseCategory: Array.isArray(userInput.releaseCategory)
        ? userInput.releaseCategory : userInput.releaseCategory ? [userInput.releaseCategory] : [],
      discount:    userInput.discount    ? Number(userInput.discount) : null,
      naturalText: userInput.naturalText || ""
    };
    preferences = parseNaturalText(preferences.naturalText, preferences);
  }

  const hardBrands = new Set();
  if (preferences.naturalText && preferences.preferredBrands.length > 0) {
    preferences.preferredBrands.forEach((brand) => {
      if (detectHardBrandRequirement(preferences.naturalText, brand)) {
        hardBrands.add(brand);
      }
    });
  }

  const availableProducts = await Product.find({ stockAvailable: { $gt: 0 } }).lean();
  if (!availableProducts.length) {
    return { preferences, bundles: [] };
  }

  // Step 1 & 2: Filter and score all candidate products with >= 1% intersection rate in sorted order
  const candidates = rankAndFilterCandidates(preferences, availableProducts, hardBrands);

  if (candidates.length === 0) {
    return { preferences, bundles: [] };
  }

  if (candidates.length === 1) {
    const solo = candidates[0];
    const math = computeBundleSavings([solo]);
    return {
      preferences,
      bundles: [{
        name: "Best Match",
        products: [{
          productId:      (solo._id || "").toString(),
          productName:    solo.productName,
          brandName:      solo.brandName,
          price:          solo.price,
          discount:       solo.discount || 0,
          category:       solo.category,
          releaseDate:    solo.releaseDate || "",
          stockAvailable: solo.stockAvailable || 1
        }],
        individualTotal:   math.individualTotal,
        bundleTotal:       math.bundleTotal,
        savings:           math.savings,
        savingsPercentage: math.savingsPercentage,
        preferredBrandMatches: getPreferredBrandMatches([solo], preferences.preferredBrands),
        matchedPreferences: ["Nearest Available Match"],
        reason: "The closest matching product to your requirements in our catalog.",
        score: solo.intersectionScore || 50
      }]
    };
  }

  // Step 3: Pass the full algorithm to Mistral AI (or Gemini as fallback)
  const mistralKey = (process.env.MISTRAL_API || process.env.mistral_api || process.env.MISTRAL_API_KEY || "").trim();
  const geminiKey = (process.env.GEMINI_API || process.env.OPENAI_API || "").trim();

  const algorithmPrompt = `You are an AI shopping bundle recommendation engine that creates named product bundles following this EXACT ALGORITHM:

=== ALGORITHM RULES ===
1. DEVICE FILTERING: If user requested specific devices (e.g., laptops, mobiles, gaming), only group those devices and compatible accessories. Do not mix unrelated categories.
2. PREFERRED BRANDS & INTERSECTION:
   - Products with user's preferred brands have higher intersection and MUST be prioritized in bundles.
   - If non-preferred brands are included as alternatives, place them after preferred brands and explain in reason: "If you wish to change your requirements, this is the best alternative option."
3. BUDGET & SAVINGS:
   - Combine products to maximize user discount and stay within the specified budget (both independently and as a bundle total).
4. NEVER RETURN NULL/EMPTY: If exact match is unavailable, provide the nearest matching bundles based on highest intersection rates.
5. BUNDLE MATCH SCORE: Score each bundle from 1 to 100 based on how well it satisfies brand preferences, device needs, budget, and savings. Sort bundles in descending order of score.

USER REQUIREMENTS:
${JSON.stringify({
  products: preferences.products,
  preferredBrands: preferences.preferredBrands,
  startingPrice: preferences.startingPrice,
  endingPrice: preferences.endingPrice,
  releaseCategory: preferences.releaseCategory,
  discount: preferences.discount,
  naturalText: preferences.naturalText
})}

PRE-SCORED CANDIDATE PRODUCTS (Filtered & Sorted by Intersection Rate >= 1%):
${JSON.stringify(candidates.slice(0, 25).map((p) => ({
  id: (p._id || "").toString(),
  productName: p.productName,
  brandName: p.brandName,
  price: p.price,
  discount: p.discount || 0,
  category: p.category,
  releaseDate: p.releaseDate,
  intersectionScore: p.intersectionScore
})))}

OUTPUT SPECIFICATION:
Return ONLY a valid JSON object with a "bundles" array. Each bundle must include:
- "name": descriptive bundle name (e.g. "Optimal Xiaomi Ecosystem Bundle", "Maximum Savings Setup", "Budget Value Bundle")
- "productIds": array of 2 to 4 product ID strings (from the candidate IDs provided)
- "reason": 1-2 sentence explanation of why this bundle was created, mentioning brand matches, savings, and compatibility
- "score": integer score between 1 and 100 based on algorithm match

JSON Format:
{
  "bundles": [
    {
      "name": "...",
      "productIds": ["...", "..."],
      "reason": "...",
      "score": 95
    }
  ]
}`;

  // Try Mistral AI First
  if (mistralKey) {
    try {
      console.log("[Mistral AI] Calling Mistral API with Algorithm specification...");
      const mistralModels = [
        process.env.MISTRAL_MODEL || "mistral-small-latest",
        "open-mistral-nemo",
        "mistral-large-latest"
      ];
      const uniqueMistralModels = [...new Set(mistralModels)];

      let responseText = null;
      for (const modelName of uniqueMistralModels) {
        try {
          const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
            method: "POST",
            signal: AbortSignal.timeout(10000),
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${mistralKey}`
            },
            body: JSON.stringify({
              model: modelName,
              response_format: { type: "json_object" },
              temperature: 0.2,
              messages: [
                {
                  role: "system",
                  content: "You are an AI shopping bundle recommendation engine that outputs strictly valid JSON matching the requested schema."
                },
                {
                  role: "user",
                  content: algorithmPrompt
                }
              ]
            })
          });

          if (!res.ok) {
            const errText = await res.text();
            console.log(`[Mistral AI] Model ${modelName} error (${res.status}):`, errText);
            continue;
          }

          const data = await res.json();
          responseText = data.choices?.[0]?.message?.content;
          if (responseText) {
            console.log(`[Mistral AI] Successfully generated bundles using: ${modelName}`);
            break;
          }
        } catch (mErr) {
          console.log(`[Mistral AI] Model ${modelName} call exception:`, mErr.message);
        }
      }

      if (responseText) {
        const parsed = JSON.parse(responseText);
        if (parsed && Array.isArray(parsed.bundles) && parsed.bundles.length > 0) {
          const seenFps = new Set();
          const aiBundles = [];

          for (const aib of parsed.bundles) {
            const productIds = aib.productIds || [];
            const bundleProducts = productIds
              .map((id) => candidates.find((c) => (c._id || "").toString() === id.toString()))
              .filter(Boolean);

            if (bundleProducts.length < MIN_BUNDLE_PRODUCTS) continue;
            if (!areBundleProductsCompatible(bundleProducts)) continue;

            const fp = bundleFingerprint(bundleProducts);
            if (seenFps.has(fp)) continue;
            seenFps.add(fp);

            const bundle = createBundle(
              aib.name || "Mistral AI Recommended Bundle",
              bundleProducts,
              preferences,
              candidates,
              aib.reason || "Curated based on your requirements and highest intersection rate."
            );

            if (bundle) {
              if (aib.score && typeof aib.score === "number") {
                bundle.score = Math.max(1, Math.min(100, Math.round((bundle.score + aib.score) / 2)));
              }
              aiBundles.push(bundle);
            }
          }

          if (aiBundles.length >= 1) {
            aiBundles.sort((a, b) => b.score - a.score);
            console.log(`[Mistral AI] ${aiBundles.length} AI bundles produced according to algorithm.`);
            return { preferences, bundles: aiBundles };
          }
        }
      }
    } catch (err) {
      console.log("[Mistral AI] Falling back:", err.message);
    }
  }

  // Fallback to Gemini AI if Mistral is not configured or fails
  if (geminiKey && !geminiKey.startsWith("AQ.Ab8RN6")) {
    try {
      console.log("[Gemini AI] Instructing Gemini with Algorithm to generate bundles...");
      const targetModel = process.env.GEMINI_MODEL || "gemini-1.5-flash";
      const modelsToTry = [targetModel, "gemini-1.5-flash", "gemini-2.0-flash"];
      const uniqueModels = [...new Set(modelsToTry)];

      let responseText = null;
      for (const modelName of uniqueModels) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { responseMimeType: "application/json" }
          });

          const result = await model.generateContent(algorithmPrompt);
          responseText = result.response.text();
          if (responseText) {
            console.log(`[Gemini AI] Successfully generated bundles using: ${modelName}`);
            break;
          }
        } catch (mErr) {
          console.log(`[Gemini AI] Model ${modelName} call:`, mErr.message);
        }
      }

      if (responseText) {
        const parsed = JSON.parse(responseText);
        if (parsed && Array.isArray(parsed.bundles) && parsed.bundles.length > 0) {
          const seenFps = new Set();
          const aiBundles = [];

          for (const aib of parsed.bundles) {
            const productIds = aib.productIds || [];
            const bundleProducts = productIds
              .map((id) => candidates.find((c) => (c._id || "").toString() === id.toString()))
              .filter(Boolean);

            if (bundleProducts.length < MIN_BUNDLE_PRODUCTS) continue;
            if (!areBundleProductsCompatible(bundleProducts)) continue;

            const fp = bundleFingerprint(bundleProducts);
            if (seenFps.has(fp)) continue;
            seenFps.add(fp);

            const bundle = createBundle(
              aib.name || "AI Recommended Bundle",
              bundleProducts,
              preferences,
              candidates,
              aib.reason || "Curated based on your requirements and highest intersection rate."
            );

            if (bundle) {
              if (aib.score && typeof aib.score === "number") {
                bundle.score = Math.max(1, Math.min(100, Math.round((bundle.score + aib.score) / 2)));
              }
              aiBundles.push(bundle);
            }
          }

          if (aiBundles.length >= 1) {
            aiBundles.sort((a, b) => b.score - a.score);
            console.log(`[Gemini AI] ${aiBundles.length} AI bundles produced according to algorithm.`);
            return { preferences, bundles: aiBundles };
          }
        }
      }
    } catch (err) {
      console.log("[Gemini AI] Falling back to algorithmic engine:", err.message);
    }
  }

  // Algorithmic Fallback Engine (Executes the exact same algorithm rules)
  console.log("[Algorithmic Engine] Generating bundles using algorithm specification...");
  const algorithmicBundles = generateAlgorithmicBundles(preferences, candidates);

  if (algorithmicBundles.length === 0 && candidates.length >= 2) {
    const fallbackBundle = createBundle(
      "Nearest Match Bundle",
      candidates.slice(0, 2),
      preferences,
      candidates,
      "The closest matching products in our catalog for your requirements."
    );
    if (fallbackBundle) algorithmicBundles.push(fallbackBundle);
  }

  return { preferences, bundles: algorithmicBundles };
};

module.exports = { generateBundles, computeProductIntersection, rankAndFilterCandidates };
