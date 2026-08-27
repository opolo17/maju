export function MarkerHighlight({ children }) {
  return (
    <span className="relative inline whitespace-nowrap">
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden
        className="absolute bottom-[0.06em] left-[-0.05em] right-[-0.05em] z-0 h-[0.52em] -skew-x-3 rounded-[2px] bg-[#E3F58F]"
      />
    </span>
  );
}
