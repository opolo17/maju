export function EmptyState({ title, description, children, className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-gray-200 bg-maju-surface p-8 text-center ${className}`}
    >
      {title ? <p className="text-sm font-semibold text-maju-text">{title}</p> : null}
      {description ? (
        <p className={`text-sm text-maju-muted ${title ? 'mt-2' : ''}`}>{description}</p>
      ) : null}
      {children ? <div className="mt-4 flex flex-wrap justify-center gap-3">{children}</div> : null}
    </div>
  );
}
