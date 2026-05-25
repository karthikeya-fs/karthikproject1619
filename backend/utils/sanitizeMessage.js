/**
 * Strip dangerous characters and bound length to reduce XSS / abuse.
 * React still escapes text when rendering; this is defense in depth.
 */
function sanitizeMessageText(raw) {
  if (typeof raw !== "string") return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  // Remove angle brackets and null bytes; collapse excessive whitespace
  const cleaned = trimmed
    .replace(/[\u0000<>]/g, "")
    .replace(/\s{3,}/g, "  ")
    .slice(0, 2000);
  return cleaned;
}

module.exports = sanitizeMessageText;
