export function Logo({ className = '', variant = 'dark' }) {
  const toneClass = variant === 'light' ? 'brightness-0 invert' : '';

  return (
    <img
      src="/logo.png"
      alt="MAJU"
      className={`h-7 w-auto object-contain sm:h-8 ${toneClass} ${className}`}
    />
  );
}
