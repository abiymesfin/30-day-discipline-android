// Supabase Edge Function: ai-coach
// OpenAI API via the Responses API. Requires a valid Supabase Auth session and server-side AI_API_KEY secret.
// Keep JWT verification enabled for this function.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Best-effort per-user rate limit (in-memory; resets when the function instance restarts).
// For a hard guarantee, also set a monthly budget cap at your AI provider.
const RATE_WINDOW_MS = 60 * 60 * 1000;
const RATE_MAX_REQUESTS = Number(Deno.env.get("AI_RATE_LIMIT_PER_HOUR")) || 30;
const rateBuckets = new Map<string, number[]>();
function rateLimited(userId: string): boolean {
  const now = Date.now();
  const recent = (rateBuckets.get(userId) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX_REQUESTS) { rateBuckets.set(userId, recent); return true; }
  recent.push(now);
  rateBuckets.set(userId, recent);
  if (rateBuckets.size > 5000) for (const [k, v] of rateBuckets) if (!v.some((t) => now - t < RATE_WINDOW_MS)) rateBuckets.delete(k);
  return false;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const authorization = req.headers.get("Authorization");
    if (!supabaseUrl || !anonKey || !authorization?.startsWith("Bearer ")) return json({ error: "Authentication required. Sign in first." }, 401);

    const supabase = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return json({ error: "Invalid session" }, 401);
    if (rateLimited(user.id)) return json({ error: "Too many requests. Please try again later." }, 429);

    const apiKey = Deno.env.get("AI_API_KEY");
    if (!apiKey) return json({ error: "AI service is not configured yet. Set AI_API_KEY as an Edge Function secret." }, 503);
    const apiUrl = Deno.env.get("AI_API_URL") || "https://api.openai.com/v1/responses";
    const model = Deno.env.get("AI_MODEL") || "gpt-6-luna";

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return json({ error: "Invalid JSON body" }, 400);
    const mode = body?.mode === "plan" ? "plan" : "chat";
    const message = typeof body?.message === "string" ? body.message.trim().slice(0, 1200) : "";
    const goal = typeof body?.goal === "string" ? body.goal.trim().slice(0, 600) : message;
    const language = body?.language === "am" ? "Amharic" : "English";
    const durationDays = body?.durationDays === 7 ? 7 : 30;
    const c = body?.context && typeof body.context === "object" ? body.context : {};
    if (!(mode === "plan" ? goal : message)) return json({ error: mode === "plan" ? "Goal required" : "Message required" }, 400);

    const context = {
      challengeDay: safeNum(c.day), challengeDuration: safeNum(c.duration), progressPercent: safeNum(c.progressPercent),
      habitsCount: safeNum(c.habitsCount), completedToday: safeNum(c.completedToday), todayTotal: safeNum(c.todayTotal),
      currentStreak: safeNum(c.currentStreak), bestStreak: safeNum(c.bestStreak), completedDays: safeNum(c.completedDays),
    };
    let instructions = "";
    let input = "";
    if (mode === "plan") {
      instructions = `You are a thoughtful, practical personal-goal coach for a habit app. Output valid JSON only, no markdown fences. Write every user-facing field in ${language}. Build exactly a ${durationDays}-day plan whose daily habits are concrete, varied by day, and realistically achievable. Return this shape: {"title": string, "summary": string, "durationDays": ${durationDays}, "nutritionGuidance": string[], "activityGuidance": string[], "safetyNote": string, "habits": [{"dayOffset": integer from 0 to ${durationDays - 1}, "name": string, "details": string, "emoji": string, "color": one of yellow|blue|mint|pink|lav}]}. Create 1-3 unique habit tasks for each day, up to 4 if necessary. Include meal/nutrition habits and safe movement tasks when relevant. Each day's item must be a separate habit; do not return one recurring task for all days. Keep titles and details short. For weight, nutrition, exercise or health-adjacent goals, provide general balanced guidance only: no diagnosis, extreme diets, drug/supplement prescriptions, unsafe exercise, or guaranteed results. If the user mentions gaining weight, suggest regular balanced meals/snacks and gradual strength-building only as general ideas, avoid exact calorie targets without personal context, and recommend a clinician/dietitian if medically underweight, symptoms, or significant health concerns. Include a concise safetyNote. If the goal is unclear, make a safe, modest assumption and state it in the summary. Never ask for passwords or payment details.`;
      input = `Goal: ${goal}\nPlan duration: ${durationDays} days\nPlan should begin at challenge day ${safeNum(body?.startDay) || safeNum(c.day) || 1}. Current challenge data (numbers only): ${JSON.stringify(context)}. Generate the JSON plan now.`;
    } else {
      instructions = `You are a kind, practical habit-building coach for a 30-day personal challenge. Reply ONLY in ${language}. Personalize advice using the aggregate progress data. Give empathetic, actionable steps; avoid shame, guarantees, diagnosis, or medical/mental-health treatment claims. Do not ask for passwords, payment details, or sensitive personal data. If distress is severe, encourage reaching out to a trusted person or qualified professional. Never claim to have accessed journal entries or other private data.`;
      input = `${message}\n\nProgress data (numbers only): ${JSON.stringify(context)}.`;
    }

    const requestBody: Record<string, unknown> = {
      model,
      instructions,
      input,
      max_output_tokens: mode === "plan" ? 4500 : 650,
      store: false,
    };
    if (mode === "plan") requestBody.text = { format: { type: "json_object" } };

    const aiResp = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify(requestBody),
    });
    const result = await aiResp.json().catch(() => ({}));
    if (!aiResp.ok) return json({ error: `AI provider request failed (${aiResp.status}). Check provider API key, model, and billing.` }, 502);
    const output = extractOutputText(result);
    if (!output) return json({ error: "No AI response returned" }, 502);
    if (mode === "chat") return json({ reply: output.trim() }, 200);

    let plan: unknown;
    try { plan = JSON.parse(output.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")); }
    catch { return json({ error: "AI returned a plan that could not be parsed. Please try again." }, 502); }
    if (!plan || typeof plan !== "object" || !Array.isArray((plan as { habits?: unknown }).habits)) return json({ error: "AI returned an invalid plan" }, 502);
    return json({ plan }, 200);
  } catch (_error) {
    return json({ error: "Unexpected coach service error" }, 500);
  }
});

function extractOutputText(result: any): string {
  if (typeof result?.output_text === "string" && result.output_text.trim()) return result.output_text;
  const chunks: string[] = [];
  if (Array.isArray(result?.output)) {
    for (const item of result.output) {
      if (item?.type !== "message" || !Array.isArray(item.content)) continue;
      for (const part of item.content) {
        if ((part?.type === "output_text" || part?.type === "text") && typeof part.text === "string") chunks.push(part.text);
      }
    }
  }
  return chunks.join("\n").trim();
}

function safeNum(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.min(100000, n)) : 0;
}
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
