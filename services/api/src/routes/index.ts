import type { ApiHealthResponse, ApiMeResponse, Profile } from '@maju/types';
import { Hono } from 'hono';
import { getSupabaseAdmin } from '../lib/supabase.js';
import { env } from '../env.js';
import { requireAuth, type AuthVariables } from '../middleware/auth.js';
import { sessions } from './sessions.js';
import { poc } from './poc.js';

const app = new Hono<{ Variables: AuthVariables }>();

app.get('/health', (c) => {
  const body: ApiHealthResponse = {
    status: 'ok',
    service: 'maju-api',
    openaiConfigured: env.openaiConfigured,
    supabaseConfigured: env.supabaseConfigured,
  };
  return c.json(body);
});

app.get('/me', requireAuth, async (c) => {
  const userId = c.get('userId');
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, locale, onboarding_done, plan, created_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    return c.json({ error: 'profile_fetch_failed', message: error.message }, 500);
  }

  if (!data) {
    return c.json({ error: 'profile_not_found', message: 'Profile row missing' }, 404);
  }

  const profile: Profile = {
    id: data.id,
    displayName: data.display_name,
    locale: data.locale,
    onboardingDone: data.onboarding_done,
    plan: data.plan,
    createdAt: data.created_at,
  };

  const body: ApiMeResponse = { profile };
  return c.json(body);
});

app.route('/sessions', sessions);
app.route('/poc', poc);

export { app as routes };
