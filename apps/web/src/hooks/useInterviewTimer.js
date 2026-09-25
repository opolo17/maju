import { useEffect, useState } from 'react';

/**
 * Countdown from session start + durationMinutes.
 * @param {{ startedAt?: string | null; durationMinutes?: number; active?: boolean }}
 */
export function useInterviewTimer({ startedAt, durationMinutes, active = true }) {
  const [remainingSec, setRemainingSec] = useState(null);

  useEffect(() => {
    if (!startedAt || !durationMinutes || !active) {
      setRemainingSec(null);
      return undefined;
    }

    const totalSec = durationMinutes * 60;
    const startMs = new Date(startedAt).getTime();

    function tick() {
      const elapsed = Math.floor((Date.now() - startMs) / 1000);
      setRemainingSec(Math.max(0, totalSec - elapsed));
    }

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [startedAt, durationMinutes, active]);

  return remainingSec;
}
