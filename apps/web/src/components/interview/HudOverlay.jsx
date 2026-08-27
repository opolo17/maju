import { AlertTriangle, Eye, Gauge } from 'lucide-react';

const ICONS = {
  speed: Gauge,
  gaze: Eye,
};

export default function HudOverlay({ alerts = [] }) {
  if (alerts.length === 0) return null;

  return (
    <div className="absolute -right-2 top-8 z-10 flex max-w-[11rem] flex-col gap-2 sm:block lg:-right-4">
      {alerts.map((alert) => {
        const Icon = ICONS[alert.type] ?? AlertTriangle;
        return (
          <div
            key={alert.id}
            className="rounded-lg border border-amber-200/50 bg-amber-50 px-3 py-2 shadow-lg"
          >
            <div className="flex items-start gap-2">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p className="text-[10px] font-medium leading-snug tracking-tight text-amber-900">
                {alert.message}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
