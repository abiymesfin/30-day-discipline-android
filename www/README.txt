30 DAY CHALLENGE — VERSION 16

This ZIP contains the existing 30 DAY Challenge app source, PWA/web files, Capacitor Android project, AI Coach UI, Supabase Edge Function source, and Manus AI setup prompt.

V16 CHANGES
- Fixed AI Coach English/Amharic switch layout: the language picker is kept visible; long mode/status text is constrained and ellipsized rather than squeezing buttons outside the screen.
- Uses the OpenAI Responses API Edge Function (default model `gpt-6-luna`) instead of the old deprecated `gpt-4o-mini` Chat Completions default.
- Root, www, and Android public assets are synchronized. Service worker cache: `discipline30-static-v16-language-ai`; package version: `16.0.0`.
- Retains v15 per-day habit edit and floating Coach button fixes.

LIVE AI STATUS
This ZIP is source code only, not proof of a live deployment. `ai-coach-config.js` deliberately has blank Supabase URL/key. To activate it, configure the Supabase Project URL and publishable/anon key, deploy the Edge Function with JWT verification enabled, and set `AI_API_KEY` to an OpenAI API key in Supabase Edge Function Secrets. OpenAI API usage/billing is separate from a ChatGPT subscription. A Gemini or Claude key will not work without a provider-specific integration.

FILES
- `MANUS_AI_PROMPT_v16.txt`: prompt to use in Manus AI.
- `AI_COACH_SETUP_v16.txt`: provider choice, secure setup, and test checklist.
- `ai-coach-config.js`: public Supabase URL/key config, blank until project owner configures it.
- `supabase/functions/ai-coach/index.ts`: server-side OpenAI Responses API Edge Function.

BUILD NOTES
Preview using HTTP rather than `file://`. On a machine with Android SDK: `npm install`, `npm run cap:sync`, then `npm run cap:build`.

Verified locally: HTML files synchronized, JavaScript syntax checks, ZIP integrity, no real user/provider credentials embedded. Not verified here: Supabase deployment, authenticated live AI responses, or provider billing/model access, because the project owner's credentials are not present.
