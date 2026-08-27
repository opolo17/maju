import type { Context, Next } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { env } from '../env.js';

export type AuthVariables = {
  userId: string;
  accessToken: string;
};

export async function requireAuth(c: Context, next: Next) {
  if (!env.supabaseConfigured) {
    return c.json(
      {
        error: 'server_misconfigured',
        message: 'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in services/api/.env',
      },
      503,
    );
  }

  const authorization = c.req.header('Authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return c.json({ error: 'unauthorized', message: 'Missing Bearer token' }, 401);
  }

  const accessToken = authorization.slice('Bearer '.length);
  const { url, serviceRoleKey } = env.requireSupabase();
  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) {
    return c.json({ error: 'unauthorized', message: 'Invalid or expired token' }, 401);
  }

  c.set('userId', data.user.id);
  c.set('accessToken', accessToken);
  await next();
}
