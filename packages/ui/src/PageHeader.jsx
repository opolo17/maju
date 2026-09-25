export function PageHeader({
  back,
  eyebrow,
  title,
  description,
  actions,
  className = '',
}) {
  return (
    <header className={`space-y-4 ${className}`}>
      {back ? (
        <button
          type="button"
          onClick={back.onClick}
          className="text-sm font-medium text-maju-muted transition-colors hover:text-maju-text"
        >
          {back.label}
        </button>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-sm font-semibold text-maju-muted">{eyebrow}</p>
          ) : null}
          {title ? (
            <h1
              className={`font-semibold tracking-tight text-maju-text ${
                eyebrow ? 'mt-2 text-2xl sm:text-3xl' : 'text-2xl sm:text-3xl'
              }`}
            >
              {title}
            </h1>
          ) : null}
          {description ? (
            <p className="mt-2 max-w-xl text-sm text-maju-muted">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
