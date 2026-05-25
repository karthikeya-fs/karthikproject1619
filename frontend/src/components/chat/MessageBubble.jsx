import { assetUrl } from "../../services/api";

function formatTime(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function DeliveryTicks({ isOwn, deliveryStatus }) {
  if (!isOwn) return null;
  if (deliveryStatus === "read")
    return <span className="text-sky-200 ml-1 text-xs" aria-label="Read">✓✓</span>;
  if (deliveryStatus === "delivered")
    return <span className="text-white/70 ml-1 text-xs" aria-label="Delivered">✓✓</span>;
  return <span className="text-white/50 ml-1 text-xs" aria-label="Sent">✓</span>;
}

function SenderAvatar({ sender, onClick }) {
  const initial = sender?.name?.charAt(0).toUpperCase() || "?";
  const imgSrc = sender?.profileImage ? assetUrl(sender.profileImage) : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold text-white transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }}
      title={`View ${sender?.name || "user"}'s profile`}
      aria-label={`View ${sender?.name || "user"}'s profile`}
    >
      {imgSrc ? (
        <img src={imgSrc} alt={sender.name} className="w-full h-full object-cover" />
      ) : (
        initial
      )}
    </button>
  );
}

export default function MessageBubble({ message, isOwn, onAvatarClick }) {
  if (!message) return null;

  const name = message.sender?.name || "User";
  const time = formatTime(message.timestamp || message.createdAt);

  return (
    <div className={`flex w-full mb-2 items-end gap-2 ${isOwn ? "justify-end" : "justify-start"}`}>
      {/* Avatar — only for received messages */}
      {!isOwn && (
        <SenderAvatar
          sender={message.sender}
          onClick={() => onAvatarClick?.(message.sender)}
        />
      )}

      <div
        className={`max-w-[75%] sm:max-w-[65%] rounded-2xl px-3 py-2 shadow-md ${
          isOwn
            ? "bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-br-md"
            : "bg-[var(--surface-elevated)] text-[var(--text)] border border-[var(--border)] rounded-bl-md"
        }`}
      >
        {!isOwn && (
          <p className="text-[11px] font-semibold text-cyan-500 mb-0.5">{name}</p>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.text || message.content || message.body || message.message || ""}
        </p>
        <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isOwn ? "text-emerald-100/90" : "text-[var(--text-muted)]"}`}>
          <span>{time}</span>
          <DeliveryTicks isOwn={isOwn} deliveryStatus={message.deliveryStatus} />
        </div>
      </div>
    </div>
  );
}
