import { scoreAccentClass } from '../../constants/interview.js';
import { RUBRIC_KEYS } from '../../lib/growth-stats.js';

export default function RubricMiniBars({
  rubric,
  labels,
  highlightKey = null,
  averages = null,
  compact = false,
}) {
  const source = averages ?? rubric;
  if (!source) return null;

  return (
    <div className={`grid gap-1.5 ${compact ? 'gap-1' : ''}`}>
      {RUBRIC_KEYS.map((key) => {
        const score = source[key] ?? 0;
        const isLowest = highlightKey === key;
        return (
          <div key={key} className="flex items-center gap-2">
            <span
              className={`w-14 shrink-0 truncate text-[10px] font-medium ${
                isLowest ? 'text-maju-accent' : 'text-maju-subtle'
              }`}
            >
              {labels[key] ?? key}
            </span>
            <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-all ${
                  isLowest ? 'bg-maju-accent' : 'bg-maju-accent/45'
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
            <span
              className={`w-6 shrink-0 text-right text-[10px] font-semibold tabular-nums ${
                isLowest ? scoreAccentClass(score) : 'text-maju-muted'
              }`}
            >
              {score}
            </span>
          </div>
        );
      })}
    </div>
  );
}
