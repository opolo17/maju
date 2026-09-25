/**
 * Dev-only routes/UI (PoC, demo).
 * NOT tied to user account — requires both:
 * - Vite dev server (`npm run dev`), AND
 * - VITE_ENABLE_DEV_TOOLS=true in apps/web/.env.local
 */
export const isDevToolsEnabled =
  import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true';
