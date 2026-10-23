/* 30 DAY Challenge v16 public client config. Do NOT put AI_API_KEY or Supabase service_role/secret keys here. */
window.__30DAY_SUPABASE_URL = window.SUPABASE_CONFIG?.url || ''; // Public project URL only.
window.__30DAY_SUPABASE_ANON_KEY = window.SUPABASE_CONFIG?.publishableKey || ''; // Publishable/anon key only.
window.__30DAY_AI_COACH_ENDPOINT = window.__30DAY_SUPABASE_URL
  ? window.__30DAY_SUPABASE_URL.replace(/\/$/, '') + '/functions/v1/ai-coach'
  : '';
