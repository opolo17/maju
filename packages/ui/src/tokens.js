/** Semantic Tailwind class fragments shared across @maju/ui */
export const colors = {
  text: 'maju-text',
  muted: 'maju-muted',
  subtle: 'maju-subtle',
  surface: 'maju-surface',
  accent: 'maju-accent',
  highlight: 'maju-highlight',
};

/** Primary CTA — brand gradient, used sparingly (buttons only) */
export const gradientBtnClass =
  'bg-gradient-to-r from-maju-accent to-maju-highlight text-maju-text font-medium shadow-sm hover:opacity-95 active:opacity-90';

export const primaryBtnClass = gradientBtnClass;

export const focusRingClass =
  'focus-visible:ring-2 focus-visible:ring-maju-accent/35 focus-visible:ring-offset-2';

export const inputFocusClass =
  'focus:border-maju-accent focus:ring-2 focus:ring-maju-accent/20';

export const optionSelectedClass =
  'border-maju-accent bg-maju-highlight/10 ring-1 ring-maju-accent/15';

export const optionIdleClass =
  'border-gray-200 bg-white hover:border-maju-accent/35 hover:bg-maju-surface/80';

export const cardClass = 'rounded-xl border border-gray-200 bg-white';

export const panelClass = 'rounded-xl border border-gray-200 bg-white';

export const accentGradientClass = 'bg-gradient-to-r from-maju-accent to-maju-highlight';
