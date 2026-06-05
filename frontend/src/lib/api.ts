import { supabase } from "./supabase";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const getApiUrl = (path: string) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const finalPath = cleanPath.startsWith('/api') ? cleanPath : `/api${cleanPath}`;
  return `${API_URL}${finalPath}`;
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log("🔍 [FRONTEND AUTH] Current Session Token:", session?.access_token);

  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  if (session?.access_token) {
    headers.set("Authorization", `Bearer ${session.access_token}`);
  } else {
    console.warn("⚠️ [FRONTEND AUTH] No session token found for request:", url);
  }

  return fetch(url, { ...options, headers });
};
