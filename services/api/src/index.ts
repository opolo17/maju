import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { env } from './env.js';
import { routes } from './routes/index.js';

const app = new Hono();

app.use('*', logger());
app.use(
  '*',
  cors({
    origin: env.corsOrigin,
    credentials: true,
  }),
);

app.route('/', routes);

app.notFound((c) => c.json({ error: 'not_found' }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'internal_error', message: err.message }, 500);
});

serve(
  {
    fetch: app.fetch,
    port: env.port,
  },
  (info) => {
    console.log(`MAJU API listening on http://localhost:${info.port}`);
    console.log(`  Supabase: ${env.supabaseConfigured ? 'ok' : 'missing env'}`);
    console.log(`  OpenAI:   ${env.openaiConfigured ? 'ok' : 'missing OPENAI_API_KEY'}`);
  },
);
