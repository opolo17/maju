export function MarkerHighlight({ children }) {
  return (
    <span className="relative inline whitespace-nowrap">
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden
        className="absolute bottom-[0.08em] left-0 right-0 z-0 h-[0.45em] rounded-sm bg-maju-highlight/80"
      />
    </span>
  );
}
