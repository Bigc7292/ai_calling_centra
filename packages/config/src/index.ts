export function loadEnv() {
  const env = {
    PORT: process.env.PORT || "4000",
    SUPABASE_URL: process.env.SUPABASE_URL || "",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  };
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("[config] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return env;
}
