/**
 * AI-Based Security Question Generator
 * Generates 1-2 ownership verification questions from item description
 * using rule-based NLP (no external API key required).
 */

/**
 * Extract meaningful tokens from description for question generation.
 */
function extractFeatures(description) {
  const text = description.toLowerCase();
  const features = [];

  // Color detection
  const colors = ["black", "white", "red", "blue", "green", "yellow", "purple", "pink", "orange", "grey", "gray", "brown", "silver", "gold"];
  const foundColors = colors.filter((c) => text.includes(c));
  if (foundColors.length) features.push({ type: "color", value: foundColors[0] });

  // Brand detection
  const brands = ["samsung", "apple", "iphone", "oneplus", "realme", "oppo", "vivo", "nokia", "mi", "xiaomi", "hp", "dell", "lenovo", "asus", "sony", "jbl", "boat", "nike", "adidas", "puma"];
  const foundBrand = brands.find((b) => text.includes(b));
  if (foundBrand) features.push({ type: "brand", value: foundBrand });

  // Sticker / wallpaper / label
  if (text.includes("sticker")) features.push({ type: "sticker", value: "sticker" });
  if (text.includes("wallpaper")) features.push({ type: "wallpaper", value: "wallpaper" });
  if (text.includes("label") || text.includes("name written") || text.includes("name on")) features.push({ type: "label", value: "label" });

  // Damage / physical marks
  if (text.includes("crack") || text.includes("cracked")) features.push({ type: "crack", value: "crack" });
  if (text.includes("scratch") || text.includes("scratched")) features.push({ type: "scratch", value: "scratch" });
  if (text.includes("broken")) features.push({ type: "broken", value: "broken" });
  if (text.includes("dent") || text.includes("dented")) features.push({ type: "dent", value: "dent" });

  // Accessories / attachments
  if (text.includes("keychain")) features.push({ type: "keychain", value: "keychain" });
  if (text.includes("case") || text.includes("cover")) features.push({ type: "case", value: "case" });
  if (text.includes("pouch") || text.includes("bag")) features.push({ type: "pouch", value: "pouch" });
  if (text.includes("strap")) features.push({ type: "strap", value: "strap" });

  // Content inside
  if (text.includes("id card") || text.includes("student id")) features.push({ type: "id_card", value: "ID card" });
  if (text.includes("cash") || text.includes("money")) features.push({ type: "cash", value: "cash" });
  if (text.includes("card")) features.push({ type: "card", value: "card" });

  // Location-specific marks
  if (text.includes("corner")) features.push({ type: "corner", value: "corner" });
  if (text.includes("side")) features.push({ type: "side", value: "side" });
  if (text.includes("back")) features.push({ type: "back", value: "back" });
  if (text.includes("front")) features.push({ type: "front", value: "front" });

  return features;
}

/**
 * Build questions from extracted features.
 * Priority: unique identifiers (stickers, wallpaper, labels) > damage > color/brand
 */
function buildQuestions(description, features) {
  const questions = [];
  const text = description.toLowerCase();

  // Sticker question
  if (features.some((f) => f.type === "sticker")) {
    questions.push("What stickers are on the item, and where are they placed?");
  }

  // Wallpaper question
  if (features.some((f) => f.type === "wallpaper")) {
    questions.push("What is the wallpaper or lock screen image on the device?");
  }

  // Label / name written
  if (features.some((f) => f.type === "label")) {
    questions.push("What name or text is written/labeled on the item?");
  }

  // Crack location
  if (features.some((f) => f.type === "crack")) {
    const cornerMatch = text.match(/(\w+[\s-]?\w*)\s+corner/);
    const sideMatch = text.match(/(\w+)\s+side/);
    if (cornerMatch) {
      questions.push(`Which corner of the item is cracked or damaged?`);
    } else if (sideMatch) {
      questions.push(`Which side of the item has the crack or damage?`);
    } else {
      questions.push("Where exactly is the crack or damage on the item?");
    }
  }

  // Keychain
  if (features.some((f) => f.type === "keychain")) {
    questions.push("Describe the keychain(s) attached to the item.");
  }

  // Case / cover
  if (features.some((f) => f.type === "case")) {
    questions.push("What does the case or cover look like (color, design, material)?");
  }

  // ID card inside
  if (features.some((f) => f.type === "id_card")) {
    questions.push("What is the name on the ID card inside the item?");
  }

  // Card inside
  if (questions.length < 2 && features.some((f) => f.type === "card")) {
    questions.push("What cards are stored inside the item?");
  }

  // Color fallback (only if not already 2 questions)
  if (questions.length < 2 && features.some((f) => f.type === "color")) {
    questions.push(`What is the primary color of the item?`);
  }

  // Brand fallback
  if (questions.length < 2 && features.some((f) => f.type === "brand")) {
    const brand = features.find((f) => f.type === "brand").value;
    questions.push(`What brand or model is the item (e.g. ${brand})?`);
  }

  // Generic fallback if no features matched
  if (questions.length === 0) {
    questions.push("Describe any unique physical marks, engravings, or identifiers on the item.");
    questions.push("What is stored inside or attached to the item that only the owner would know?");
  }

  // Return max 2 questions
  return questions.slice(0, 2);
}

/**
 * POST /api/ai/generate-questions
 * Body: { description: string }
 */
const generateQuestions = (req, res) => {
  const { description } = req.body;

  if (!description || typeof description !== "string" || description.trim().length < 5) {
    return res.status(400).json({ message: "A valid item description is required." });
  }

  const features = extractFeatures(description.trim());
  const questions = buildQuestions(description.trim(), features);

  res.json({ questions });
};

module.exports = { generateQuestions };
