import { focusRingClass, gradientBtnClass } from './tokens.js';

const variants = {
  primary: `${gradientBtnClass} disabled:opacity-50 disabled:shadow-none`,
  secondary:
    'border border-gray-200 bg-white text-maju-text font-medium hover:border-maju-accent/40 hover:bg-maju-surface active:bg-maju-highlight/10 disabled:opacity-50',
  ghost:
    'text-maju-muted font-medium hover:bg-maju-surface hover:text-maju-text disabled:opacity-50',
  danger:
    'border border-red-200 bg-white text-red-700 font-medium hover:bg-red-50 active:bg-red-100 disabled:opacity-50',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2 text-sm rounded-md',
  lg: 'px-5 py-2.5 text-sm rounded-md',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center transition-all outline-none disabled:cursor-not-allowed ${focusRingClass} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
