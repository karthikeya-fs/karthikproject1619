export function ConfirmDeleteModal({ isOpen, onConfirm, onCancel, itemType, isDeleting }) {
  if (!isOpen) return null;

  const isLost = itemType === "lost";

  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface, #0f172a)",
          border: "1px solid var(--border, #1e293b)",
          borderRadius: "16px",
          padding: "32px",
          maxWidth: "420px",
          width: "100%",
          boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
        }}
      >
        {/* Icon */}
        <div style={{ fontSize: "40px", textAlign: "center", marginBottom: "16px" }}>
          {isLost ? "✅" : "📦"}
        </div>

        {/* Title */}
        <h3 style={{
          textAlign: "center", fontWeight: "700", fontSize: "18px",
          color: "var(--text, #f1f5f9)", marginBottom: "12px",
        }}>
          {isLost ? "Item Retrieved?" : "Item Delivered?"}
        </h3>

        {/* Message */}
        <p style={{
          textAlign: "center", fontSize: "14px", lineHeight: "1.6",
          color: "var(--text-muted, #94a3b8)", marginBottom: "28px",
        }}>
          {isLost
            ? "Have you successfully retrieved your lost item? This will permanently remove the post from the listings."
            : "Has this found item been delivered to its owner? This will permanently remove the post from the listings."}
        </p>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            style={{
              flex: 1, padding: "11px", borderRadius: "10px",
              border: "1px solid var(--border, #1e293b)",
              background: "transparent", color: "var(--text-muted, #94a3b8)",
              fontSize: "14px", fontWeight: "600", cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            style={{
              flex: 1, padding: "11px", borderRadius: "10px", border: "none",
              background: isLost
                ? "linear-gradient(135deg, #1d9e75, #0d7a5a)"
                : "linear-gradient(135deg, #2563eb, #1d4ed8)",
              color: "#fff", fontSize: "14px", fontWeight: "600",
              cursor: isDeleting ? "not-allowed" : "pointer",
              opacity: isDeleting ? 0.7 : 1,
              transition: "opacity 0.15s",
            }}
          >
            {isDeleting ? "Removing…" : isLost ? "Yes, Item Retrieved" : "Yes, Item Delivered"}
          </button>
        </div>
      </div>
    </div>
  );
}
