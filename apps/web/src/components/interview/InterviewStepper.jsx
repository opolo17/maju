import { getFlowSteps } from '../../i18n/interviewLabels.js';
import { useI18n } from '../../i18n/LanguageContext.jsx';

export default function InterviewStepper({ currentStep, dark = false }) {
  const { t } = useI18n();
  const steps = getFlowSteps(t);

  return (
    <nav aria-label={t('interview.flow.stepperAria')} className="w-full">
      <ol className="flex items-center gap-1 sm:gap-2">
        {steps.map((step, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <li key={step.id} className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
              <div className="flex min-w-0 flex-col items-center gap-1 text-center">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-medium ${
                    isCurrent
                      ? 'bg-maju-accent text-maju-text'
                      : isComplete
                        ? dark
                          ? 'bg-maju-accent/25 text-maju-accent'
                          : 'bg-maju-highlight/50 text-maju-text'
                        : dark
                          ? 'bg-white/10 text-white/40'
                          : 'border border-gray-200 bg-white text-maju-subtle'
                  }`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isComplete ? '✓' : index + 1}
                </span>
                <span
                  className={`hidden max-w-[5rem] truncate text-[10px] font-medium sm:block sm:max-w-none sm:text-xs ${
                    isCurrent
                      ? dark
                        ? 'text-maju-accent'
                        : 'text-maju-text'
                      : dark
                        ? 'text-white/50'
                        : 'text-maju-subtle'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 ? (
                <span
                  className={`mb-4 hidden h-px flex-1 sm:block ${
                    isComplete
                      ? dark
                        ? 'bg-maju-accent/40'
                        : 'bg-maju-accent/35'
                      : dark
                        ? 'bg-white/10'
                        : 'bg-gray-200'
                  }`}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
