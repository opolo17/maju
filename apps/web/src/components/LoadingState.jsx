export default function LoadingState({ message, dark = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-16 ${
        dark ? 'text-white/70' : 'text-maju-muted'
      }`}
      role="status"
      aria-live="polite"
    >
      <div
        className={`h-7 w-7 animate-spin rounded-full border border-gray-200 border-t-maju-accent ${dark ? 'border-white/15 border-t-maju-accent' : ''}`}
        aria-hidden
      />
      <p className="text-sm">{message}</p>
    </div>
  );
}
