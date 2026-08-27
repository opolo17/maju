import { gradientBtnClass } from './tokens.js';

const variants = {
  primary: `${gradientBtnClass} hover:opacity-95 disabled:opacity-60`,
  secondary:
    'border-2 border-gray-200 bg-white text-[#2A2A2A] font-semibold hover:border-[#2AD175]/60 disabled:opacity-60',
  ghost: 'text-[#64748B] font-medium hover:text-[#2A2A2A] disabled:opacity-60',
};

const sizes = {
  sm: 'px-3 py-2 text-sm rounded-lg',
  md: 'px-5 py-3 text-sm rounded-xl',
  lg: 'px-6 py-4 text-base rounded-xl',
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
      className={`inline-flex items-center justify-center tracking-tight transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-[#2AD175]/40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
