/**
 * Rule-based AI match verification (no external API).
 * Compares claimant submission with found item metadata.
 */

const COLORS = [
  "black", "white", "red", "blue", "green", "yellow", "purple", "pink",
  "orange", "grey", "gray", "brown", "silver", "gold", "navy", "teal",
];

const BRANDS = [
  "samsung", "apple", "iphone", "oneplus", "realme", "oppo", "vivo", "nokia",
  "mi", "xiaomi", "hp", "dell", "lenovo", "asus", "sony", "jbl", "boat",
  "nike", "adidas", "puma", "wallet", "keys",
];

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text) {
  const stop = new Set([
    "the", "a", "an", "and", "or", "is", "was", "were", "my", "it", "this",
    "that", "with", "for", "on", "in", "at", "to", "of", "item", "found",
  ]);
  return normalize(text)
    .split(" ")
    .filter((w) => w.length > 2 && !stop.has(w));
}

function jaccardSimilarity(a, b) {
  const setA = new Set(a);
  const setB = new Set(b);
  if (!setA.size && !setB.size) return 0;
  let inter = 0;
  for (const t of setA) {
    if (setB.has(t)) inter += 1;
  }
  const union = setA.size + setB.size - inter;
  return union ? inter / union : 0;
}

function extractClaimText(claimData) {
  const parts = [
    claimData.message,
    ...(claimData.verificationAnswers || []),
    claimData.claimantNotes,
  ].filter(Boolean);
  return parts.join(" ");
}

function extractColor(text) {
  const n = normalize(text);
  return COLORS.find((c) => n.includes(c)) || null;
}

function extractBrand(text) {
  const n = normalize(text);
  return BRANDS.find((b) => n.includes(b)) || null;
}

function scoreCategory(item, claimText) {
  const cat = normalize(item.category);
  const ct = normalize(claimText);
  if (!cat) return { score: 0, matched: false, label: "Category" };
  if (ct.includes(cat) || cat.split(" ").some((w) => w.length > 3 && ct.includes(w))) {
    return { score: 100, matched: true, label: "Category" };
  }
  const synonyms = {
    electronics: ["phone", "laptop", "charger", "earphone", "device"],
    accessories: ["bag", "wallet", "watch", "keys", "id"],
    clothing: ["shirt", "jacket", "hoodie", "cap"],
    documents: ["card", "id", "license", "passport"],
  };
  for (const [key, words] of Object.entries(synonyms)) {
    if (cat.includes(key) && words.some((w) => ct.includes(w))) {
      return { score: 75, matched: true, label: "Category" };
    }
  }
  return { score: 25, matched: false, label: "Category" };
}

function scoreColor(item, claimText) {
  const itemColor = extractColor(`${item.title} ${item.description}`);
  const claimColor = extractColor(claimText);
  if (!itemColor && !claimColor) return { score: 50, matched: false, label: "Color" };
  if (itemColor && claimColor && itemColor === claimColor) {
    return { score: 100, matched: true, label: "Color" };
  }
  if (itemColor && claimColor) return { score: 15, matched: false, label: "Color" };
  return { score: 40, matched: false, label: "Color" };
}

function scoreBrand(item, claimText) {
  const itemBrand = extractBrand(`${item.title} ${item.description}`);
  const claimBrand = extractBrand(claimText);
  if (!itemBrand && !claimBrand) return { score: 55, matched: false, label: "Brand / model" };
  if (itemBrand && claimBrand && itemBrand === claimBrand) {
    return { score: 100, matched: true, label: "Brand / model" };
  }
  if (itemBrand && claimText.includes(itemBrand)) {
    return { score: 90, matched: true, label: "Brand / model" };
  }
  return { score: 30, matched: false, label: "Brand / model" };
}

function scoreDescription(item, claimText) {
  const itemTokens = tokenize(`${item.title} ${item.description}`);
  const claimTokens = tokenize(claimText);
  const sim = jaccardSimilarity(itemTokens, claimTokens);
  const titleSim = jaccardSimilarity(tokenize(item.title), claimTokens);
  const combined = Math.min(1, sim * 0.7 + titleSim * 0.3);
  const score = Math.round(combined * 100);
  return {
    score,
    matched: score >= 55,
    label: "Description & keywords",
  };
}

function scoreLocation(item, claimText) {
  const loc = normalize(item.location);
  const ct = normalize(claimText);
  if (!loc) return { score: 50, matched: false, label: "Location" };
  const locParts = loc.split(" ").filter((w) => w.length > 3);
  const hits = locParts.filter((p) => ct.includes(p)).length;
  if (hits >= 2 || ct.includes(loc)) {
    return { score: 100, matched: true, label: "Location" };
  }
  if (hits === 1) return { score: 65, matched: true, label: "Location" };
  return { score: 20, matched: false, label: "Location" };
}

function scoreDate(item, claimText) {
  if (!item.date) return { score: 50, matched: false, label: "Date proximity" };
  const itemDate = new Date(item.date);
  const now = new Date();
  const daysDiff = Math.abs(now - itemDate) / (1000 * 60 * 60 * 24);
  let score = 100;
  if (daysDiff > 30) score = 40;
  else if (daysDiff > 14) score = 60;
  else if (daysDiff > 7) score = 75;
  const ct = normalize(claimText);
  const dateMentioned =
    ct.includes("yesterday") ||
    ct.includes("today") ||
    ct.includes("last week") ||
    /\d{1,2}[/-]\d{1,2}/.test(ct);
  if (dateMentioned) score = Math.min(100, score + 15);
  return {
    score,
    matched: score >= 60,
    label: "Date proximity",
  };
}

function scoreTitle(item, claimText) {
  const titleTokens = tokenize(item.title);
  const claimTokens = tokenize(claimText);
  const sim = jaccardSimilarity(titleTokens, claimTokens);
  const score = Math.round(sim * 100);
  return {
    score: Math.max(score, titleTokens.some((t) => claimTokens.includes(t)) ? 70 : score),
    matched: score >= 50 || titleTokens.some((t) => t.length > 4 && normalize(claimText).includes(t)),
    label: "Title overlap",
  };
}

const WEIGHTS = {
  category: 0.2,
  color: 0.15,
  description: 0.25,
  location: 0.2,
  date: 0.1,
  title: 0.1,
};

function generateConfidenceLevel(percentage) {
  if (percentage >= 85) return "high";
  if (percentage >= 70) return "medium";
  if (percentage >= 50) return "low";
  return "very_low";
}

function generateVerificationStatus(percentage) {
  if (percentage >= 85) return "auto_verified";
  if (percentage >= 70) return "high_confidence";
  if (percentage >= 50) return "needs_review";
  return "low_match";
}

function generateSummary(percentage, confidence, matchedFields) {
  const matched = matchedFields.filter((f) => f.matched).map((f) => f.label.toLowerCase());
  const partial = matchedFields.filter((f) => !f.matched && f.score >= 45);

  let tone =
    percentage >= 85
      ? "High confidence"
      : percentage >= 70
        ? "Good confidence"
        : percentage >= 50
          ? "Moderate confidence"
          : "Low confidence";

  let detail = "";
  if (matched.length) {
    detail = `Strong signals from ${matched.slice(0, 3).join(", ")}.`;
  } else if (partial.length) {
    detail = `Partial overlap on ${partial.map((p) => p.label.toLowerCase()).join(", ")}.`;
  } else {
    detail = "Limited overlap — manual review recommended.";
  }

  return `${tone} — ${percentage}% AI match. ${detail}`;
}

function generateRecommendation(percentage, verificationStatus) {
  if (verificationStatus === "auto_verified") {
    return "Strong ownership signals detected. Owner review recommended for final approval.";
  }
  if (verificationStatus === "high_confidence") {
    return "Likely match. Finder should review claim details before approving.";
  }
  if (verificationStatus === "needs_review") {
    return "Mixed signals — manual review required before approval.";
  }
  return "Weak match — verify carefully or request more proof from claimant.";
}

/**
 * @param {object} item - Mongoose item or plain object
 * @param {object} claimData - { message, verificationAnswers, ... }
 */
function runAIVerification(item, claimData) {
  const claimText = extractClaimText(claimData);

  const category = scoreCategory(item, claimText);
  const color = scoreColor(item, claimText);
  const brand = scoreBrand(item, claimText);
  const description = scoreDescription(item, claimText);
  const location = scoreLocation(item, claimText);
  const date = scoreDate(item, claimText);
  const title = scoreTitle(item, claimText);

  const fields = [
    { ...category, weight: WEIGHTS.category },
    { ...color, weight: WEIGHTS.color },
    { ...description, weight: WEIGHTS.description },
    { ...location, weight: WEIGHTS.location },
    { ...date, weight: WEIGHTS.date },
    { ...title, weight: WEIGHTS.title },
  ];

  if (brand.matched || brand.score >= 80) {
    fields.push({ ...brand, weight: 0.05, label: "Brand (bonus)" });
  }

  const totalWeight = fields.reduce((s, f) => s + (f.weight || 0), 0);
  const weighted =
    fields.reduce((s, f) => s + f.score * (f.weight || 0), 0) / (totalWeight || 1);

  const aiMatchPercentage = Math.round(Math.min(100, Math.max(0, weighted)));
  const confidenceLevel = generateConfidenceLevel(aiMatchPercentage);
  const verificationStatus = generateVerificationStatus(aiMatchPercentage);

  const matchedFields = fields.map(({ label, matched, score }) => ({
    label,
    matched: Boolean(matched),
    score,
  }));

  const aiSummary = generateSummary(aiMatchPercentage, confidenceLevel, fields);
  const aiRecommendation = generateRecommendation(aiMatchPercentage, verificationStatus);

  return {
    aiMatchPercentage,
    confidenceLevel,
    verificationStatus,
    aiSummary,
    aiRecommendation,
    matchedFields,
    imageVerification: {
      enabled: false,
      placeholder: true,
      score: null,
      note: "Image similarity analysis will be available in a future update (OCR & visual matching).",
    },
    reviewedByOwner: false,
  };
}

module.exports = {
  runAIVerification,
  normalize,
  tokenize,
};
