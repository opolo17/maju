const baseClass =
  'w-full rounded-xl px-4 tracking-tight outline-none transition-shadow disabled:opacity-60';

const variants = {
  default:
    'border-2 border-gray-200 bg-white py-3 text-base font-medium text-[#2A2A2A] shadow-sm placeholder:font-normal placeholder:text-[#64748B] focus:border-[#2AD175] focus:ring-2 focus:ring-[#2AD175]/25',
  subtle:
    'border border-dashed border-gray-200 bg-[#F8FAFC] py-2.5 text-sm text-[#64748B] placeholder:text-[#94A3B8] focus:border-[#2AD175]/60 focus:ring-1 focus:ring-[#2AD175]/15',
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
