import { supabase } from "../components/AuthGate";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export const apiFetch = async (url: string, options?: RequestInit) => {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = new Headers(options?.headers);

  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  }

  const response = await fetch(`${API_BASE_URL}${url}`, { ...options, headers });
  return response;
};
