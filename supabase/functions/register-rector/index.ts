import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ success: false, error: "Method not allowed" }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const expectedCode = Deno.env.get("RECTOR_REGISTRATION_CODE");
  if (!url || !serviceRoleKey || !expectedCode) return json({ success: false, error: "Rector registration is not configured. Set server-side secrets." }, 500);

  let body: { username?: string; fullName?: string; email?: string; phone?: string; hostelName?: string; password?: string; code?: string };
  try { body = await req.json(); } catch { return json({ success: false, error: "Invalid request body." }, 400); }
  const username = String(body.username ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const fullName = String(body.fullName ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const phone = String(body.phone ?? "").trim();
  const hostelName = String(body.hostelName ?? "").trim();
  const code = String(body.code ?? "");
  if (code.length < 1 || code !== expectedCode) return json({ success: false, error: "The rector verification code is incorrect." }, 403);
  if (!/^@[a-z0-9._-]{3,32}$/.test(username)) return json({ success: false, error: "Username must start with @ and contain 3–32 letters, numbers, dots, underscores, or hyphens." }, 400);
  if (!fullName || fullName.length > 100) return json({ success: false, error: "Enter your full name (up to 100 characters)." }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ success: false, error: "Enter a valid email address." }, 400);
  if (password.length < 12 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) return json({ success: false, error: "Use a strong password of at least 12 characters with letters, numbers, and a symbol. Do not use a mobile number alone." }, 400);

  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const normalizedName = username.slice(1);
  const authEmail = `${normalizedName}@rector.als.invalid`;
  const { data: existing, error: lookupError } = await admin.from("profiles").select("id").eq("username", username).maybeSingle();
  if (lookupError) return json({ success: false, error: "Could not check username uniqueness. Apply the database schema first." }, 500);
  if (existing) return json({ success: false, error: "That rector username is already registered." }, 409);

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: authEmail,
    password,
    email_confirm: true,
    app_metadata: { role: "rector" },
    user_metadata: { username, full_name: fullName },
  });
  if (createError || !created.user) return json({ success: false, error: createError?.message ?? "Could not create rector account." }, 400);

  const { error: profileError } = await admin.from("profiles").insert({
    id: created.user.id,
    username,
    full_name: fullName,
    role: "rector",
    email,
    phone: phone || null,
    hostel_name: hostelName || null,
  });
  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return json({ success: false, error: "The account could not be linked to its profile. No account was retained." }, 500);
  }
  return json({ success: true });
});
