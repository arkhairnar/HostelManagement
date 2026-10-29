import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ valid: false, error: "Method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const expectedCode = Deno.env.get("RECTOR_REGISTRATION_CODE");
  const authorization = req.headers.get("Authorization");
  if (!url || !anonKey || !expectedCode || !authorization) return json({ valid: false, error: "Rector validation is not configured." }, 500);

  const token = authorization.replace(/^Bearer\s+/i, "");
  const client = createClient(url, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false, autoRefreshToken: false } });
  const { data: userData, error: userError } = await client.auth.getUser(token);
  if (userError || !userData.user) return json({ valid: false, error: "A valid signed-in account is required." }, 401);
  if (userData.user.app_metadata?.role !== "rector") return json({ valid: false, error: "This account is not authorized as a rector." }, 403);

  let suppliedCode = "";
  try { suppliedCode = String((await req.json()).code ?? ""); } catch { return json({ valid: false, error: "Invalid request body." }, 400); }
  if (!suppliedCode || suppliedCode !== expectedCode) return json({ valid: false, error: "Invalid rector access code." }, 403);
  return json({ valid: true });
});
