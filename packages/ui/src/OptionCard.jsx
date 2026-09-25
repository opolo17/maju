import { optionIdleClass, optionSelectedClass } from './tokens.js';

export function OptionCard({ selected, title, description, onSelect, className = '' }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`rounded-lg border p-4 text-left transition-colors ${selected ? optionSelectedClass : optionIdleClass} ${className}`}
    >
      <p className="text-sm font-medium text-maju-text">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-maju-muted">{description}</p>
      ) : null}
    </button>
  );
}
