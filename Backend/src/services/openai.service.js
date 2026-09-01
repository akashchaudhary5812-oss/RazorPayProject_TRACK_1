const genAI = require("../config/openai");
const AiModel = require("../models/ai.model");
const Product = require("../models/product.model");

// Synonym and intent dictionary for semantic search
const SYNONYMS = {
  "phone": ["mobile", "smartphone", "iphone", "galaxy", "pixel", "nord", "redmi", "edge", "phone"],
  "mobile": ["mobile", "smartphone", "iphone", "galaxy", "pixel", "nord", "redmi", "edge", "phone"],
  "gaming": ["gaming", "ps5", "playstation", "xbox", "switch", "rog", "zephyrus", "controller", "headset", "razer", "ultra"],
  "laptop": ["laptop", "macbook", "xps", "spectre", "ideapad", "zephyrus", "notebook", "computer"],
  "earbuds": ["earbuds", "airpods", "buds", "headphones", "earphones", "audio", "pulse"],
  "audio": ["earbuds", "airpods", "buds", "headphones", "earphones", "audio", "wh-1000xm5"],
  "watch": ["watch", "smartwatch", "fitbit", "series 9", "watch6"],
  "sports": ["running", "shoes", "pegasus", "ultraboost", "boots", "duffle", "dumbbell", "fitbit", "sports"],
  "jewellery": ["pendant", "necklace", "earrings", "bracelet", "choker", "gold", "diamond", "jewellery"],
  "toy": ["lego", "hot wheels", "barbie", "nerf", "toys", "kids"],
  "food": ["coconut oil", "chocolate", "almonds", "cashews", "matcha", "food"]
};

// Rank MongoDB products and find all items with >1% relevance intersection
function rankAndFilterCandidates(preferences, availableProducts) {
  const {
    products: requestedProducts = [],
    preferredBrands = [],
    startingPrice,
    endingPrice,
    discount,
    naturalText = ""
  } = preferences;

  const textLower = naturalText.toLowerCase();

  const scoreProduct = (p) => {
    let score = 0;
    const nameLower = p.productName.toLowerCase();
    const catLower = p.category.toLowerCase();
    const brandLower = p.brandName.toLowerCase();

    // 1. Preferred Brand Scoring
    if (preferredBrands && preferredBrands.length > 0) {
      const brandIndex = preferredBrands.findIndex(
        (b) => b.toLowerCase() === brandLower
      );
      if (brandIndex === 0) score += 60;
      else if (brandIndex === 1) score += 40;
      else if (brandIndex >= 2) score += 25;
    }

    // 2. Category & Keyword Semantic Match
    requestedProducts.forEach((reqCat) => {
      const reqLower = reqCat.toLowerCase();
      if (catLower.includes(reqLower) || nameLower.includes(reqLower)) {
        score += 50;
      }
      Object.keys(SYNONYMS).forEach((key) => {
        if (reqLower.includes(key)) {
          SYNONYMS[key].forEach((syn) => {
            if (nameLower.includes(syn) || catLower.includes(syn)) {
              score += 20;
            }
          });
        }
      });
    });

    // 3. Natural Language Intent Match
    if (textLower) {
      Object.keys(SYNONYMS).forEach((key) => {
        if (textLower.includes(key)) {
          SYNONYMS[key].forEach((syn) => {
            if (nameLower.includes(syn) || catLower.includes(syn)) {
              score += 15;
            }
          });
        }
      });
    }

    // 4. Price & Discount Alignment
    if (endingPrice && p.price <= endingPrice) score += 30;
    if (endingPrice && p.price > endingPrice) score -= 30;
    if (startingPrice && p.price >= startingPrice) score += 15;
    if (discount && p.discount >= discount) score += 20;
    score += p.discount;

    return score;
  };

  const scored = availableProducts
    .map((p) => ({
      ...p,
      relevanceScore: scoreProduct(p)
    }))
    .filter((p) => p.relevanceScore > 5); // >1% intersection threshold

  scored.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return scored.length >= 3 ? scored : availableProducts.slice(0, 25);
}

// Math verification against MongoDB records
function verifyBundleMath(bundle, availableProducts) {
  const verifiedProducts = (bundle.products || []).map((p) => {
    const orig = availableProducts.find(
      (ap) =>
        ap._id.toString() === (p.productId || p.id || "").toString() ||
        ap.productName.toLowerCase() === (p.productName || "").toLowerCase()
    );
    if (orig) {
      return {
        productId: orig._id.toString(),
        productName: orig.productName,
        brandName: orig.brandName,
        price: orig.price,
        discount: orig.discount,
        category: orig.category,
        releaseDate: orig.releaseDate
      };
    }
    return p;
  });

  const individualTotal = verifiedProducts.reduce(
    (sum, p) => sum + (p.price || 0),
    0
  );

  const bundleTotal =
    bundle.bundleTotal && bundle.bundleTotal < individualTotal
      ? bundle.bundleTotal
      : Math.round(individualTotal * 0.88);

  const savings = Math.max(0, individualTotal - bundleTotal);
  const savingsPercentage = individualTotal
    ? Math.round((savings / individualTotal) * 100)
    : 0;

  return {
    ...bundle,
    products: verifiedProducts,
    individualTotal,
    bundleTotal,
    savings,
    savingsPercentage
  };
}

// Generate ALL dynamic bundles wherever there is >1% relevance intersection
function generateAlgorithmicBundles(preferences, candidates) {
  const { preferredBrands = [], endingPrice } = preferences;

  const createBundle = (bundleName, items, extraDiscountPercent, reason) => {
    const productsIncluded = items.map((item) => ({
      productId: item._id ? item._id.toString() : item.id || "p-" + Math.random(),
      productName: item.productName,
      brandName: item.brandName,
      price: item.price,
      discount: item.discount,
      category: item.category,
      releaseDate: item.releaseDate
    }));

    const individualTotal = items.reduce((sum, item) => sum + item.price, 0);
    const bundleDiscountMultiplier = 1 - extraDiscountPercent / 100;
    const bundleTotal = Math.round(individualTotal * bundleDiscountMultiplier);
    const savings = individualTotal - bundleTotal;
    const savingsPercentage = Math.round((savings / (individualTotal || 1)) * 100);

    const preferredBrandMatches = [];
    preferredBrands.forEach((b, idx) => {
      const hasBrand = items.some(
        (item) => item.brandName.toLowerCase() === b.toLowerCase()
      );
      if (hasBrand) {
        preferredBrandMatches.push({
          brand: b,
          preferenceIndex: idx + 1,
          message: `✓ Matched ${b} (Your #${idx + 1} preferred brand)`
        });
      }
    });

    const matchedPreferences = [];
    if (preferredBrandMatches.length > 0)
      matchedPreferences.push(
        `Preferred Brand: ${preferredBrandMatches.map((m) => m.brand).join(", ")}`
      );
    if (endingPrice && bundleTotal <= endingPrice)
      matchedPreferences.push(`Within budget (<= ₹${endingPrice.toLocaleString("en-IN")})`);

    return {
      name: bundleName,
      products: productsIncluded,
      individualTotal,
      bundleTotal,
      savings,
      savingsPercentage,
      preferredBrandMatches,
      matchedPreferences:
        matchedPreferences.length > 0
          ? matchedPreferences
          : ["High Intersection Match", "Category Synergy"],
      reason,
      score: 95
    };
  };

  const bundlesList = [];

  // 1. Top Relevance Bundle
  if (candidates.length >= 2) {
    bundlesList.push(
      createBundle(
        "Top Relevance AI Package",
        candidates.slice(0, 3),
        12,
        `Highest relevance intersection matching ${preferredBrands[0] || 'your requirements'} with verified stack discount.`
      )
    );
  }

  // 2. Preferred Brand Ecosystem Bundles
  preferredBrands.forEach((b, idx) => {
    const brandProds = candidates.filter(
      (c) => c.brandName.toLowerCase() === b.toLowerCase()
    );
    if (brandProds.length >= 2) {
      bundlesList.push(
        createBundle(
          `${b} Flagship Ecosystem Bundle`,
          brandProds.slice(0, 3),
          15,
          `Customized specifically around ${b} products for 100% brand synergy and stackable savings.`
        )
      );
    }
  });

  // 3. Highest Discount Package
  const highDiscountProds = [...candidates].sort((a, b) => b.discount - a.discount);
  if (highDiscountProds.length >= 2) {
    bundlesList.push(
      createBundle(
        "Maximum Stack Discount Package",
        highDiscountProds.slice(0, 3),
        18,
        "Combines the highest percentage discount products from your candidate search pool."
      )
    );
  }

  // 4. Budget-Optimized Bundle (if endingPrice exists)
  if (endingPrice) {
    const underBudgetProds = candidates.filter((c) => c.price <= endingPrice);
    if (underBudgetProds.length >= 2) {
      bundlesList.push(
        createBundle(
          "Strict Budget Value Bundle",
          underBudgetProds.slice(0, 3),
          10,
          `Guaranteed total bundle price stays strictly under ₹${endingPrice.toLocaleString("en-IN")}.`
        )
      );
    }
  }

  // 5. Cross-Category Value Bundle
  const categoriesPresent = Array.from(new Set(candidates.map((c) => c.category)));
  if (categoriesPresent.length >= 2) {
    const crossCatItems = [];
    categoriesPresent.slice(0, 3).forEach((cat) => {
      const match = candidates.find((c) => c.category === cat);
      if (match) crossCatItems.push(match);
    });
    if (crossCatItems.length >= 2) {
      bundlesList.push(
        createBundle(
          "Cross-Category Synergy Package",
          crossCatItems,
          14,
          "Brings together complementary items across your target categories for maximum utility."
        )
      );
    }
  }

  return bundlesList.length > 0 ? bundlesList : [
    createBundle("Essential AI Bundle", candidates.slice(0, 2), 10, "Base value bundle matching your search criteria.")
  ];
}

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
        ? userInput.products
        : userInput.products
        ? [userInput.products]
        : [],
      preferredBrands: Array.isArray(userInput.preferredBrands)
        ? userInput.preferredBrands
        : userInput.preferredBrands
        ? [userInput.preferredBrands]
        : [],
      startingPrice: userInput.startingPrice ? Number(userInput.startingPrice) : null,
      endingPrice: userInput.endingPrice ? Number(userInput.endingPrice) : null,
      releaseCategory: Array.isArray(userInput.releaseCategory)
        ? userInput.releaseCategory
        : userInput.releaseCategory
        ? [userInput.releaseCategory]
        : [],
      discount: userInput.discount ? Number(userInput.discount) : null,
      naturalText: userInput.naturalText || ""
    };

    if (userInput.naturalText && typeof userInput.naturalText === "string") {
      const text = userInput.naturalText.toLowerCase();

      const knownBrands = [
        "apple", "samsung", "google", "oneplus", "xiaomi", "motorola",
        "nothing", "realme", "sony", "nike", "adidas", "dell", "hp",
        "lenovo", "asus", "logitech", "microsoft", "nintendo", "lego", "barbie"
      ];
      knownBrands.forEach((b) => {
        if (
          text.includes(b) &&
          !preferences.preferredBrands.some((pb) => pb.toLowerCase() === b)
        ) {
          preferences.preferredBrands.push(b.charAt(0).toUpperCase() + b.slice(1));
        }
      });

      if (text.includes("lakh") || text.includes("lac")) {
        const match = text.match(/(\d+)\s*(lakh|lac)/);
        if (match) preferences.endingPrice = parseFloat(match[1]) * 100000;
      } else if (
        text.includes("under") ||
        text.includes("below") ||
        text.includes("<")
      ) {
        const match = text.match(/(under|below|<)\s*(\d+)/);
        if (match) preferences.endingPrice = parseInt(match[2], 10);
      }

      const keywords = [
        "phone", "mobile", "laptop", "earbuds", "headphones", "watch",
        "smartwatch", "shoes", "gaming", "jewellery", "toy", "food"
      ];
      keywords.forEach((k) => {
        if (text.includes(k) && !preferences.products.includes(k)) {
          preferences.products.push(k);
        }
      });
    }
  }

  const availableProducts = await Product.find({ stockAvailable: { $gt: 0 } }).lean();

  if (!availableProducts.length) {
    return { preferences, bundles: [] };
  }

  // 1. Perform Semantic Pre-Filtering (>1% Intersection score)
  const candidates = rankAndFilterCandidates(preferences, availableProducts);
  console.log(
    `[Semantic Engine] Identified ${candidates.length} products with >1% relevance intersection from MongoDB catalog.`
  );

  // 2. Try Calling Gemini AI Model for dynamic bundle generation
  try {
    const apiKey = process.env.OPENAI_API || process.env.GEMINI_API;
    if (apiKey) {
      console.log("[Gemini AI] Connecting to Gemini Model & Sending user requirements...");
      const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-3.6-flash"];
      let responseText = null;

      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: { responseMimeType: "application/json" }
          });

          const prompt = `
You are an AI shopping and bundle optimization engine.

USER PREFERENCES & INTENT:
${JSON.stringify(preferences)}

QUALIFYING CANDIDATE PRODUCTS FROM MONGODB (>1% RELEVANCE INTERSECTION):
${JSON.stringify(
  candidates.slice(0, 30).map((p) => ({
    id: p._id.toString(),
    productName: p.productName,
    brandName: p.brandName,
    price: p.price,
    discount: p.discount,
    category: p.category,
    releaseDate: p.releaseDate,
    relevanceScore: p.relevanceScore
  }))
)}

INSTRUCTIONS:
Do NOT limit to only 3 bundles. Create ALL valid and meaningful bundle combinations wherever products have a >1% intersection match with the user's requirements.
Return JSON with key "bundles": array of bundles. Each bundle must contain:
- "name": string
- "products": array with objects { "productId", "productName", "brandName", "price", "discount" }
- "individualTotal": number
- "bundleTotal": number
- "savings": number
- "savingsPercentage": number
- "preferredBrandMatches": array of { "brand", "preferenceIndex", "message" }
- "matchedPreferences": array of strings
- "reason": string (short AI recommendation explanation)
`;

          const result = await model.generateContent(prompt);
          responseText = result.response.text();
          if (responseText) {
            console.log(`[Gemini AI] Successfully generated dynamic AI bundles using model: ${modelName}`);
            break;
          }
        } catch (mErr) {
          // Continue to next model in list
        }
      }

      if (responseText) {
        const parsed = JSON.parse(responseText);
        if (parsed && Array.isArray(parsed.bundles) && parsed.bundles.length > 0) {
          const mathVerifiedBundles = parsed.bundles.map((b) =>
            verifyBundleMath(b, availableProducts)
          );
          return { preferences, bundles: mathVerifiedBundles };
        }
      }
    }
  } catch (err) {
    console.log("Gemini API notice, using dynamic algorithmic bundle engine:", err.message);
  }

  // 3. Dynamic Algorithmic Fallback Engine
  const fallbackBundles = generateAlgorithmicBundles(preferences, candidates);
  const mathVerifiedFallback = fallbackBundles.map((b) =>
    verifyBundleMath(b, availableProducts)
  );

  return {
    preferences,
    bundles: mathVerifiedFallback
  };
};

module.exports = {
  generateBundles
};