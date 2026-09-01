const genAI = require("../config/openai");
const AiModel = require("../models/ai.model");
const Product = require("../models/product.model");

const MIN_RELEVANCE_SCORE = 15;
const MAX_CANDIDATES = 40;
const MIN_BUNDLE_SCORE = 20;
const MAX_BUNDLE_PRODUCTS = 4;
const MIN_BUNDLE_PRODUCTS = 2;

const SYNONYMS = {
  phone:      ["mobile", "smartphone", "iphone", "galaxy", "pixel", "nord", "redmi", "edge", "phone", "pro max", "ultra"],
  mobile:     ["mobile", "smartphone", "iphone", "galaxy", "pixel", "nord", "redmi", "edge", "phone"],
  laptop:     ["laptop", "macbook", "xps", "spectre", "ideapad", "zephyrus", "notebook", "zenbook", "vivobook", "inspiron"],
  gaming:     ["gaming", "ps5", "playstation", "xbox", "switch", "rog", "zephyrus", "controller", "headset", "razer", "ultra", "gamepad"],
  earbuds:    ["earbuds", "airpods", "buds", "earphones", "wf-", "freebuds"],
  headphones: ["headphones", "wh-", "wh1000", "momentum", "pulse"],
  audio:      ["earbuds", "airpods", "buds", "headphones", "earphones", "audio", "wh-1000", "speaker"],
  watch:      ["watch", "smartwatch", "fitbit", "series 9", "watch6", "galaxy watch", "apple watch"],
  smartwatch: ["watch", "smartwatch", "fitbit", "series 9", "watch6"],
  sports:     ["running", "shoes", "pegasus", "ultraboost", "boots", "duffle", "dumbbell", "fitbit", "sports", "jersey", "gloves"],
  jewellery:  ["pendant", "necklace", "earrings", "bracelet", "choker", "gold", "diamond", "jewellery", "ring", "bangle"],
  toy:        ["lego", "hot wheels", "barbie", "nerf", "toys", "kids", "puzzle", "rc car"],
  food:       ["coconut oil", "chocolate", "almonds", "cashews", "matcha", "food", "snack", "protein"],
  accessories:["case", "cover", "charger", "cable", "stand", "mouse", "keyboard", "hub", "bag", "backpack"],
  console:    ["ps5", "playstation", "xbox", "switch", "console"],
  camera:     ["camera", "dslr", "mirrorless", "gopro", "lens"]
};

const PRODUCT_TYPE_TO_CATEGORY = {
  phone:       ["mobile phones", "smartphones", "phone", "mobile"],
  mobile:      ["mobile phones", "smartphones", "phone", "mobile"],
  smartphone:  ["mobile phones", "smartphones"],
  laptop:      ["laptops", "laptop", "computers", "notebook"],
  gaming:      ["gaming", "gaming consoles", "gaming laptops", "gaming accessories", "consoles"],
  earbuds:     ["earbuds", "audio", "headphones", "earphones"],
  headphones:  ["headphones", "audio", "earphones"],
  audio:       ["audio", "headphones", "earbuds", "earphones", "speakers"],
  watch:       ["smartwatches", "watches", "wearables"],
  smartwatch:  ["smartwatches", "wearables"],
  sports:      ["sports", "footwear", "fitness", "sports & fitness"],
  jewellery:   ["jewellery", "jewelry", "accessories"],
  toy:         ["toys", "kids", "kids & toys"],
  food:        ["food", "groceries", "snacks", "nutrition"],
  accessories: ["accessories", "mobile accessories", "laptop accessories"],
  console:     ["gaming consoles", "consoles", "gaming"],
  camera:      ["cameras", "photography"]
};

const COMPATIBLE_CATEGORIES = {
  "mobile phones":       ["earbuds", "headphones", "audio", "smartwatches", "accessories", "mobile accessories", "wearables"],
  "smartphones":         ["earbuds", "headphones", "audio", "smartwatches", "accessories", "mobile accessories", "wearables"],
  "phone":               ["earbuds", "headphones", "audio", "smartwatches", "accessories"],
  "mobile":              ["earbuds", "headphones", "audio", "smartwatches", "accessories"],
  "laptops":             ["accessories", "laptop accessories", "audio", "headphones", "gaming accessories", "mouse", "keyboard"],
  "laptop":              ["accessories", "laptop accessories", "audio", "headphones", "gaming accessories"],
  "gaming":              ["gaming consoles", "gaming accessories", "headphones", "audio", "controllers", "laptops", "accessories"],
  "gaming consoles":     ["gaming accessories", "headphones", "audio", "controllers", "games"],
  "gaming laptops":      ["gaming accessories", "headphones", "audio", "accessories"],
  "gaming accessories":  ["gaming", "gaming consoles", "gaming laptops", "headphones"],
  "earbuds":             ["mobile phones", "smartphones", "phone", "mobile", "laptops", "smartwatches"],
  "headphones":          ["mobile phones", "smartphones", "laptops", "gaming", "gaming consoles"],
  "audio":               ["mobile phones", "smartphones", "laptops", "gaming"],
  "smartwatches":        ["mobile phones", "smartphones", "sports", "fitness"],
  "wearables":           ["mobile phones", "smartphones", "sports"],
  "sports":              ["footwear", "fitness", "sports & fitness", "wearables"],
  "footwear":            ["sports", "fitness"],
  "accessories":         ["mobile phones", "smartphones", "laptops", "audio"],
  "mobile accessories":  ["mobile phones", "smartphones"],
  "laptop accessories":  ["laptops", "laptop"],
  "jewellery":           ["jewellery", "accessories"],
  "jewelry":             ["jewellery", "accessories"],
  "toys":                ["kids", "gaming"],
  "kids":                ["toys"],
  "food":                ["food", "groceries", "snacks", "nutrition"],
  "groceries":           ["food"],
  "cameras":             ["accessories", "audio"],
  "photography":         ["cameras", "accessories"]
};

const HARD_BRAND_PHRASES = [
  "i need", "i want", "must be", "only", "strictly", "has to be",
  "should be", "looking for", "give me", "i require", "exclusively"
];

const RELEASE_KEYWORDS = {
  latest:  ["2024", "2025", "2026", "v2", "gen 2", "series 9", "15th gen", "new"],
  budget:  ["budget", "affordable", "lite", "se", "value"],
  premium: ["pro", "ultra", "max", "plus", "flagship", "premium"]
};

function parseNaturalText(naturalText, prefs) {
  if (!naturalText || typeof naturalText !== "string") return prefs;
  const text = naturalText.toLowerCase();
  const knownBrands = [
    "apple", "samsung", "google", "oneplus", "xiaomi", "motorola",
    "nothing", "realme", "sony", "nike", "adidas", "dell", "hp",
    "lenovo", "asus", "logitech", "microsoft", "nintendo", "lego",
    "barbie", "bose", "jbl", "sennheiser", "razer", "corsair",
    "fitbit", "garmin", "boat", "noise", "redmi", "vivo", "oppo",
    "huawei", "honor", "lg", "panasonic", "philips"
  ];
  knownBrands.forEach((b) => {
    if (text.includes(b) && !prefs.preferredBrands.some((pb) => pb.toLowerCase() === b)) {
      prefs.preferredBrands.push(b.charAt(0).toUpperCase() + b.slice(1));
    }
  });
  if (!prefs.endingPrice) {
    if (text.includes("lakh") || text.includes("lac")) {
      const m = text.match(/(\d+(?:\.\d+)?)\s*(lakh|lac)/);
      if (m) prefs.endingPrice = parseFloat(m[1]) * 100000;
    } else {
      const m = text.match(/(?:under|below|less than|max|upto|up to|<)\s*(?:rs\.?|inr)?\s*(\d[\d,]*)/i);
      if (m) prefs.endingPrice = parseInt(m[1].replace(/,/g, ""), 10);
    }
  }
  if (!prefs.startingPrice) {
    const m = text.match(/(?:above|over|minimum|min|from|starting)\s*(?:rs\.?|inr)?\s*(\d[\d,]*)/i);
    if (m) prefs.startingPrice = parseInt(m[1].replace(/,/g, ""), 10);
  }
  Object.keys(PRODUCT_TYPE_TO_CATEGORY).forEach((k) => {
    if (text.includes(k) && !prefs.products.map((p) => p.toLowerCase()).includes(k)) {
      prefs.products.push(k);
    }
  });
  Object.keys(SYNONYMS).forEach((key) => {
    if (text.includes(key) && !prefs.products.map((p) => p.toLowerCase()).includes(key)) {
      prefs.products.push(key);
    }
  });
  if (!prefs.discount) {
    if (text.includes("discount") || text.includes("offer") || text.includes("deal") || text.includes("sale")) {
      prefs.discount = 5;
    }
  }
  if (!prefs.releaseCategory || prefs.releaseCategory.length === 0) {
    if (text.includes("latest") || text.includes("new") || text.includes("newest") || text.includes("recent")) {
      prefs.releaseCategory = ["latest"];
    } else if (text.includes("budget") || text.includes("affordable") || text.includes("cheap")) {
      prefs.releaseCategory = ["budget"];
    } else if (text.includes("premium") || text.includes("flagship") || text.includes("best")) {
      prefs.releaseCategory = ["premium"];
    }
  }
  return prefs;
}

function getCategoryFilter(preferences) {
  const { products = [], naturalText = "" } = preferences;
  const textLower = (naturalText || "").toLowerCase();
  const allowedCategories = new Set();
  products.forEach((p) => {
    const pLower = p.toLowerCase();
    const mapped = PRODUCT_TYPE_TO_CATEGORY[pLower];
    if (mapped) {
      mapped.forEach((cat) => allowedCategories.add(cat.toLowerCase()));
      mapped.forEach((cat) => {
        (COMPATIBLE_CATEGORIES[cat.toLowerCase()] || []).forEach((c) => allowedCategories.add(c.toLowerCase()));
      });
    } else {
      Object.keys(PRODUCT_TYPE_TO_CATEGORY).forEach((key) => {
        if (pLower.includes(key) || key.includes(pLower)) {
          PRODUCT_TYPE_TO_CATEGORY[key].forEach((cat) => allowedCategories.add(cat.toLowerCase()));
        }
      });
    }
  });
  Object.keys(PRODUCT_TYPE_TO_CATEGORY).forEach((key) => {
    if (textLower.includes(key)) {
      PRODUCT_TYPE_TO_CATEGORY[key].forEach((cat) => allowedCategories.add(cat.toLowerCase()));
      PRODUCT_TYPE_TO_CATEGORY[key].forEach((cat) => {
        (COMPATIBLE_CATEGORIES[cat.toLowerCase()] || []).forEach((c) => allowedCategories.add(c.toLowerCase()));
      });
    }
  });
  return allowedCategories.size > 0 ? allowedCategories : null;
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

function scoreProduct(p, preferences, hardBrands, allowedCategories) {
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
  let score = 0;
  if (hardBrands.size > 0) {
    const matchesAnyHard = [...hardBrands].some((hb) => brandLower === hb.toLowerCase());
    if (!matchesAnyHard) { score -= 200; }
  }
  let categoryScore = 0;
  requestedProducts.forEach((reqProd) => {
    const reqLower = reqProd.toLowerCase();
    if (catLower.includes(reqLower) || nameLower.includes(reqLower)) { categoryScore = Math.max(categoryScore, 50); }
    Object.keys(SYNONYMS).forEach((key) => {
      if (reqLower.includes(key) || key.includes(reqLower)) {
        SYNONYMS[key].forEach((syn) => {
          if (nameLower.includes(syn) || catLower.includes(syn)) { categoryScore = Math.max(categoryScore, 30); }
        });
      }
    });
    const mappedCats = PRODUCT_TYPE_TO_CATEGORY[reqLower] || [];
    if (mappedCats.some((mc) => catLower.includes(mc.toLowerCase()))) { categoryScore = Math.max(categoryScore, 45); }
  });
  score += categoryScore;
  let nlScore = 0;
  if (textLower) {
    Object.keys(SYNONYMS).forEach((key) => {
      if (textLower.includes(key)) {
        SYNONYMS[key].forEach((syn) => {
          if (nameLower.includes(syn) || catLower.includes(syn)) { nlScore = Math.max(nlScore, 30); }
        });
      }
    });
    const textWords = textLower.split(/\s+/).filter((w) => w.length > 3);
    textWords.forEach((w) => {
      if (nameLower.includes(w) || catLower.includes(w)) { nlScore = Math.max(nlScore, 20); }
    });
  }
  score += nlScore;
  if (preferredBrands.length > 0) {
    const brandIdx = preferredBrands.findIndex((b) => b.toLowerCase() === brandLower);
    if (brandIdx === 0)      score += 40;
    else if (brandIdx === 1) score += 28;
    else if (brandIdx >= 2)  score += 18;
  }
  if (endingPrice) {
    if (p.price <= endingPrice) score += 25;
    else                        score -= 40;
  }
  if (startingPrice && p.price >= startingPrice) score += 10;
  if (releaseCategory && releaseCategory.length > 0) {
    releaseCategory.forEach((rc) => {
      const rcLower = (rc || "").toLowerCase();
      const keywords = RELEASE_KEYWORDS[rcLower] || [];
      keywords.forEach((kw) => {
        if (releaseLower.includes(kw) || nameLower.includes(kw)) { score += 15; }
      });
    });
  }
  if (discountPref && p.discount >= discountPref) score += 15;
  if (p.discount >= 10) score += 5;
  if (p.stockAvailable > 0) score += 5;
  return score;
}

function rankAndFilterCandidates(preferences, availableProducts, hardBrands) {
  const allowedCategories = getCategoryFilter(preferences);
  let pool = availableProducts;
  if (allowedCategories) {
    pool = availableProducts.filter((p) => {
      const catLower = (p.category || "").toLowerCase();
      for (const allowed of allowedCategories) {
        if (catLower.includes(allowed) || allowed.includes(catLower)) return true;
      }
      return false;
    });
    if (pool.length < 5) {
      console.log("[Category Filter] Too few results, relaxing to full pool.");
      pool = availableProducts;
    }
  }
  console.log(`[Category Filter] Pool: ${pool.length}/${availableProducts.length} products`);
  const scored = pool.map((p) => ({ ...p, relevanceScore: scoreProduct(p, preferences, hardBrands, allowedCategories) }));
  const filtered = scored.filter((p) => p.relevanceScore >= MIN_RELEVANCE_SCORE);
  filtered.sort((a, b) => b.relevanceScore - a.relevanceScore);
  const candidates = filtered.slice(0, MAX_CANDIDATES);
  console.log(`[Relevance Scoring] ${candidates.length} candidates retained`);
  return candidates;
}

function scoreBundleAgainstPreferences(bundleProducts, preferences, candidateScores) {
  const { products: requestedProducts = [], preferredBrands = [], endingPrice } = preferences;
  let score = 0;
  if (requestedProducts.length > 0) {
    let coveredCount = 0;
    requestedProducts.forEach((req) => {
      const reqLower = req.toLowerCase();
      const covered = bundleProducts.some((p) => {
        const nameLower = (p.productName || "").toLowerCase();
        const catLower  = (p.category    || "").toLowerCase();
        if (nameLower.includes(reqLower) || catLower.includes(reqLower)) return true;
        const syns = SYNONYMS[reqLower] || [];
        if (syns.some((s) => nameLower.includes(s) || catLower.includes(s))) return true;
        const mappedCats = PRODUCT_TYPE_TO_CATEGORY[reqLower] || [];
        if (mappedCats.some((mc) => catLower.includes(mc.toLowerCase()))) return true;
        return false;
      });
      if (covered) coveredCount++;
    });
    score += Math.round((coveredCount / requestedProducts.length) * 30);
  } else { score += 15; }
  const bundleIds = bundleProducts.map((p) => (p._id || p.productId || "").toString());
  const bundleRelScores = bundleIds.map((id) => {
    const found = candidateScores.find((c) => c._id && c._id.toString() === id);
    return found ? found.relevanceScore : 0;
  });
  if (bundleRelScores.length > 0) {
    const avg = bundleRelScores.reduce((s, v) => s + v, 0) / bundleRelScores.length;
    score += Math.min(25, Math.round((avg / 150) * 25));
  }
  if (preferredBrands.length > 0) {
    let brandBonus = 0;
    bundleProducts.forEach((p) => {
      const brandLower = (p.brandName || "").toLowerCase();
      const idx = preferredBrands.findIndex((b) => b.toLowerCase() === brandLower);
      if (idx === 0)      brandBonus = Math.max(brandBonus, 20);
      else if (idx === 1) brandBonus = Math.max(brandBonus, 14);
      else if (idx >= 2)  brandBonus = Math.max(brandBonus, 8);
    });
    score += brandBonus;
  }
  const bundleTotal = bundleProducts.reduce((s, p) => s + (p.price || 0), 0);
  if (endingPrice) {
    if (bundleTotal <= endingPrice)            score += 15;
    else if (bundleTotal <= endingPrice * 1.1) score += 5;
    else                                       score -= 20;
  } else { score += 8; }
  const totalDiscount = bundleProducts.reduce((s, p) => s + (p.discount || 0), 0);
  const avgDiscount   = bundleProducts.length > 0 ? totalDiscount / bundleProducts.length : 0;
  score += Math.min(10, Math.round(avgDiscount / 3));
  return Math.max(0, Math.min(100, score));
}

function areCategoriesCompatible(cat1, cat2) {
  if (!cat1 || !cat2) return false;
  const c1 = cat1.toLowerCase();
  const c2 = cat2.toLowerCase();
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
    const discountedPrice = Math.round(p.price * (1 - (p.discount || 0) / 100));
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
    const hasIt = items.some((p) => (p.brandName || "").toLowerCase() === brandLower);
    if (hasIt && !seenBrands.has(brandLower)) {
      seenBrands.add(brandLower);
      const position = idx + 1;
      const suffix = position === 1 ? "st" : position === 2 ? "nd" : position === 3 ? "rd" : "th";
      matches.push({ brand, preferenceIndex: position, message: `You are getting your ${position}${suffix} preferred brand: ${brand}` });
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
    const keywords = releaseCategory.flatMap((r) => RELEASE_KEYWORDS[r.toLowerCase()] || []);
    const hasRelease = items.some((p) => {
      const rel = (p.releaseDate || "").toLowerCase();
      const name = (p.productName || "").toLowerCase();
      return keywords.some((kw) => rel.includes(kw) || name.includes(kw));
    });
    if (hasRelease) tags.push(`${rcLabel} Release`);
  }
  if (discountPref) {
    const hasDiscount = items.some((p) => (p.discount || 0) >= discountPref);
    if (hasDiscount) tags.push(`Discount >= ${discountPref}%`);
  }
  if (tags.length === 0) tags.push("Best Match for Requirements");
  return tags;
}

function bundleFingerprint(items) {
  return items.map((p) => (p._id || p.productId || p.productName || "").toString()).sort().join("|");
}

function createBundle(name, items, preferences, candidateScores, reason) {
  const math = computeBundleSavings(items);
  const { preferredBrands = [], endingPrice } = preferences;
  if (endingPrice && math.bundleTotal > endingPrice) return null;
  const productsForBundle = items.map((p) => ({
    productId:      (p._id || "").toString(),
    productName:    p.productName,
    brandName:      p.brandName,
    price:          p.price,
    discount:       p.discount,
    category:       p.category,
    releaseDate:    p.releaseDate,
    stockAvailable: p.stockAvailable
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
    if (bundle && bundle.score >= MIN_BUNDLE_SCORE) bundlesList.push(bundle);
  }

  if (candidates.length >= MIN_BUNDLE_PRODUCTS) {
    const bestItems = [];
    for (const c of candidates) {
      if (bestItems.length === 0) { bestItems.push(c); continue; }
      if (bestItems.length < MAX_BUNDLE_PRODUCTS && bestItems.every((prev) => areCategoriesCompatible(prev.category, c.category))) { bestItems.push(c); }
    }
    tryAddBundle("Best Overall Bundle", bestItems, "Top-ranked products by relevance score for maximum match with your requirements.");
  }

  if (preferredBrands.length > 0) {
    const topBrand = preferredBrands[0];
    const brandItems = candidates.filter((c) => (c.brandName || "").toLowerCase() === topBrand.toLowerCase());
    if (brandItems.length >= MIN_BUNDLE_PRODUCTS) {
      const subset = [];
      for (const bi of brandItems) {
        if (subset.length === 0) { subset.push(bi); continue; }
        if (subset.length < MAX_BUNDLE_PRODUCTS && subset.every((prev) => areCategoriesCompatible(prev.category, bi.category))) { subset.push(bi); }
      }
      tryAddBundle(`${topBrand} Flagship Bundle`, subset, `All-${topBrand} bundle for complete brand ecosystem synergy.`);
    }
    if (brandItems.length >= 1) {
      const mixItems = [brandItems[0]];
      for (const c of candidates) {
        if (mixItems.length >= MAX_BUNDLE_PRODUCTS) break;
        const alreadyAdded = mixItems.some((m) => (m._id || "").toString() === (c._id || "").toString());
        if (!alreadyAdded && mixItems.every((prev) => areCategoriesCompatible(prev.category, c.category))) { mixItems.push(c); }
      }
      if (mixItems.length >= MIN_BUNDLE_PRODUCTS) {
        tryAddBundle("Best Brand Match Bundle", mixItems, `Features your #1 preferred brand (${topBrand}) paired with the most relevant complementary products.`);
      }
    }
  }

  const highDiscountItems = [...candidates].sort((a, b) => (b.discount || 0) - (a.discount || 0));
  if (highDiscountItems.length >= MIN_BUNDLE_PRODUCTS) {
    const subset = [];
    for (const hi of highDiscountItems) {
      if (subset.length === 0) { subset.push(hi); continue; }
      if (subset.length < MAX_BUNDLE_PRODUCTS && subset.every((prev) => areCategoriesCompatible(prev.category, hi.category))) { subset.push(hi); }
    }
    tryAddBundle("Maximum Savings Bundle", subset, "Combines the highest individual-discount products for the best possible total savings.");
  }

  if (endingPrice) {
    const budgetItems = candidates.filter((c) => c.price <= endingPrice);
    if (budgetItems.length >= MIN_BUNDLE_PRODUCTS) {
      const subset = [];
      for (const bi of budgetItems) {
        if (subset.length === 0) { subset.push(bi); continue; }
        if (subset.length < MAX_BUNDLE_PRODUCTS && subset.every((prev) => areCategoriesCompatible(prev.category, bi.category))) { subset.push(bi); }
      }
      tryAddBundle("Best Value Bundle", subset, `All products individually priced within your budget of Rs.${endingPrice.toLocaleString("en-IN")}, optimised for maximum value.`);
    }
  } else {
    const prices = candidates.map((c) => c.price).sort((a, b) => a - b);
    const medianPrice = prices[Math.floor(prices.length / 2)] || Infinity;
    const valueItems  = candidates.filter((c) => c.price <= medianPrice * 1.5);
    if (valueItems.length >= MIN_BUNDLE_PRODUCTS) {
      const subset = [];
      for (const vi of valueItems) {
        if (subset.length === 0) { subset.push(vi); continue; }
        if (subset.length < MAX_BUNDLE_PRODUCTS && subset.every((prev) => areCategoriesCompatible(prev.category, vi.category))) { subset.push(vi); }
      }
      tryAddBundle("Best Value Bundle", subset, "A balanced bundle of mid-range products with excellent price-to-quality ratio.");
    }
  }

  const seenCategories = new Set();
  const catCompleteItems = [];
  for (const c of candidates) {
    const catKey = (c.category || "").toLowerCase();
    if (!seenCategories.has(catKey) && catCompleteItems.length < MAX_BUNDLE_PRODUCTS) {
      if (catCompleteItems.length === 0 || catCompleteItems.every((prev) => areCategoriesCompatible(prev.category, c.category))) {
        seenCategories.add(catKey);
        catCompleteItems.push(c);
      }
    }
  }
  if (catCompleteItems.length >= MIN_BUNDLE_PRODUCTS && seenCategories.size >= 2) {
    tryAddBundle("Complete Experience Bundle", catCompleteItems, "One top-performing product from each relevant category for the most complete setup.");
  }

  if (preferredBrands.length >= 2) {
    const brand2  = preferredBrands[1];
    const b2Items = candidates.filter((c) => (c.brandName || "").toLowerCase() === brand2.toLowerCase());
    if (b2Items.length >= MIN_BUNDLE_PRODUCTS) {
      const subset = [];
      for (const bi of b2Items) {
        if (subset.length === 0) { subset.push(bi); continue; }
        if (subset.length < MAX_BUNDLE_PRODUCTS && subset.every((prev) => areCategoriesCompatible(prev.category, bi.category))) { subset.push(bi); }
      }
      tryAddBundle(`${brand2} Ecosystem Bundle`, subset, `Your #2 preferred brand (${brand2}) - a strong ecosystem bundle with excellent synergy.`);
    }
  }

  bundlesList.sort((a, b) => b.score - a.score);
  return bundlesList;
}

function verifyBundleMath(bundle, availableProducts) {
  const verifiedProducts = (bundle.products || []).map((p) => {
    const orig = availableProducts.find(
      (ap) =>
        ap._id.toString() === (p.productId || p.id || "").toString() ||
        (ap.productName || "").toLowerCase() === (p.productName || "").toLowerCase()
    );
    if (orig) {
      return {
        productId:      orig._id.toString(),
        productName:    orig.productName,
        brandName:      orig.brandName,
        price:          orig.price,
        discount:       orig.discount,
        category:       orig.category,
        releaseDate:    orig.releaseDate,
        stockAvailable: orig.stockAvailable
      };
    }
    return p;
  });
  const math = computeBundleSavings(verifiedProducts);
  return {
    ...bundle,
    products:          verifiedProducts,
    individualTotal:   math.individualTotal,
    bundleTotal:       math.bundleTotal,
    savings:           math.savings,
    savingsPercentage: math.savingsPercentage
  };
}

const generateBundles = async (userInput) => {
  let preferences = {
    products: [], preferredBrands: [], startingPrice: null,
    endingPrice: null, releaseCategory: [], discount: null, naturalText: ""
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
      if (detectHardBrandRequirement(preferences.naturalText, brand)) { hardBrands.add(brand); }
    });
  }
  if (hardBrands.size > 0) {
    console.log(`[Hard Brand] Detected hard requirements: ${[...hardBrands].join(", ")}`);
  }

  const availableProducts = await Product.find({ stockAvailable: { $gt: 0 } }).lean();
  if (!availableProducts.length) { return { preferences, bundles: [] }; }

  const candidates = rankAndFilterCandidates(preferences, availableProducts, hardBrands);

  if (candidates.length === 0) {
    console.log("[Bundle Engine] No relevant products found.");
    return { preferences, bundles: [] };
  }

  if (candidates.length === 1) {
    console.log("[Bundle Engine] Only 1 relevant product - returning as single match.");
    const solo = candidates[0];
    const math = computeBundleSavings([solo]);
    return {
      preferences,
      bundles: [{
        name: "Best Match",
        products: [{
          productId: (solo._id || "").toString(), productName: solo.productName,
          brandName: solo.brandName, price: solo.price, discount: solo.discount,
          category: solo.category, releaseDate: solo.releaseDate
        }],
        individualTotal: math.individualTotal, bundleTotal: math.bundleTotal,
        savings: math.savings, savingsPercentage: math.savingsPercentage,
        preferredBrandMatches: getPreferredBrandMatches([solo], preferences.preferredBrands),
        matchedPreferences: ["Best Match for Requirements"],
        reason: "The closest matching product to your requirements in our catalog.",
        score: solo.relevanceScore
      }]
    };
  }

  try {
    const apiKey = process.env.OPENAI_API || process.env.GEMINI_API;
    if (apiKey) {
      console.log("[Gemini AI] Sending top candidates for bundle reasoning...");
      const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-3.6-flash"];
      let responseText = null;
      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName, generationConfig: { responseMimeType: "application/json" } });
          const prompt = `You are an AI shopping assistant that creates named product bundles with reasoning.

USER PREFERENCES:
${JSON.stringify({ products: preferences.products, preferredBrands: preferences.preferredBrands, startingPrice: preferences.startingPrice, endingPrice: preferences.endingPrice, releaseCategory: preferences.releaseCategory, discount: preferences.discount, naturalText: preferences.naturalText })}

TOP RELEVANT CANDIDATE PRODUCTS (already pre-filtered and scored by backend):
${JSON.stringify(candidates.slice(0, 25).map((p) => ({ id: (p._id || "").toString(), productName: p.productName, brandName: p.brandName, price: p.price, discount: p.discount, category: p.category, releaseDate: p.releaseDate, relevanceScore: p.relevanceScore })))}

CRITICAL RULES:
1. Do NOT calculate prices, savings, or totals. The backend handles all math.
2. Only create bundles where products are COMPATIBLE (e.g., phone + earbuds = OK; phone + jewellery = NOT OK).
3. Only group products that logically make sense together.
4. Return a "bundles" array. Each bundle must have:
   - "name": descriptive bundle name (string)
   - "productIds": array of product IDs from the list above (EXACTLY the ids provided)
   - "reason": 1-2 sentence explanation of why this bundle is useful

Return JSON: { "bundles": [ { "name": "...", "productIds": [...], "reason": "..." }, ... ] }`;

          const result = await model.generateContent(prompt);
          responseText = result.response.text();
          if (responseText) { console.log(`[Gemini AI] Bundle suggestions from: ${modelName}`); break; }
        } catch (mErr) { console.log(`[Gemini AI] Model ${modelName} failed:`, mErr.message); }
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
              bundleProducts, preferences, candidates,
              aib.reason || "AI recommended bundle based on your requirements."
            );
            if (bundle && bundle.score >= MIN_BUNDLE_SCORE) aiBundles.push(bundle);
          }
          if (aiBundles.length >= 2) {
            aiBundles.sort((a, b) => b.score - a.score);
            console.log(`[Gemini AI] ${aiBundles.length} valid AI bundles generated.`);
            return { preferences, bundles: aiBundles };
          }
        }
      }
    }
  } catch (err) {
    console.log("[Gemini AI] Falling back to algorithmic engine:", err.message);
  }

  console.log("[Algorithmic Engine] Generating bundles algorithmically...");
  const algorithmicBundles = generateAlgorithmicBundles(preferences, candidates);

  if (algorithmicBundles.length === 0) {
    const math = computeBundleSavings(candidates.slice(0, 2));
    const { endingPrice } = preferences;
    if (!endingPrice || math.bundleTotal <= endingPrice) {
      const fallbackBundle = createBundle(
        "Essential Bundle", candidates.slice(0, 2), preferences, candidates,
        "The two most relevant products from our catalog for your requirements."
      );
      if (fallbackBundle) algorithmicBundles.push(fallbackBundle);
    }
  }

  return { preferences, bundles: algorithmicBundles };
};

module.exports = { generateBundles };
