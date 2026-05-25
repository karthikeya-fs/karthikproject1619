export default function TypingIndicator({ name }) {
  if (!name) return null;
  return (
    <div className="px-4 py-2 text-sm text-[var(--text-muted)] italic flex items-center gap-2">
      <span className="flex gap-0.5" aria-hidden>
        <span
          className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </span>
      <span>
        <span className="font-medium text-cyan-400 not-italic">{name}</span> is typing…
      </span>
    </div>
  );
}
