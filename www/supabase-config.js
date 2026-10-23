// Supabase browser client configuration. This key is publishable/anon only.
window.SUPABASE_CONFIG = Object.freeze({
  url: 'https://fdzocxwwdpovkfdlihws.supabase.co',
  publishableKey: 'sb_publishable_6Yu0RC-0gY_UeAtu1CpKtg_frCsPkaD'
});
// Module scripts are deferred; keep the app initializer waiting until the client exists.
window.__supabaseReady = new Promise(resolve => { window.__resolveSupabaseReady = resolve; });
