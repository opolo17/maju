import { inputFocusClass } from './tokens.js';

const baseClass =
  'w-full rounded-lg px-3.5 outline-none transition-colors disabled:opacity-60';

const variants = {
  default: `border border-gray-200 bg-white py-2.5 text-sm text-maju-text placeholder:text-maju-subtle ${inputFocusClass}`,
  subtle:
    'border border-gray-200 bg-maju-surface py-2.5 text-sm text-maju-text placeholder:text-maju-subtle focus:border-maju-text/30 focus:ring-2 focus:ring-maju-text/10',
};

export function Input({ variant = 'default', className = '', ...props }) {
  return (
    <input className={`${baseClass} ${variants[variant]} ${className}`} {...props} />
  );
}

export function Textarea({ variant = 'subtle', className = '', rows = 4, ...props }) {
  return (
    <textarea
      rows={rows}
      className={`${baseClass} resize-none ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
