const variants = {
  error: 'border-red-200 bg-red-50 text-red-800',
  success: 'border-maju-accent/25 bg-maju-highlight/15 text-maju-text',
  info: 'border-gray-200 bg-maju-surface text-maju-muted',
};

export function Alert({ variant = 'error', className = '', children, ...props }) {
  if (!children) return null;

  return (
    <p
      role={variant === 'error' ? 'alert' : 'status'}
      className={`rounded-lg border px-4 py-3 text-sm leading-relaxed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}
