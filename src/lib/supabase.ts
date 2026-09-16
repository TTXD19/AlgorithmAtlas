"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * 瀏覽器端的 Supabase client。
 *
 * 用 @supabase/ssr 而不是 supabase-js 的預設 client，差別只在 session 存 cookie
 * 而不是 localStorage。對現在完全沒有成本（115 頁照樣全靜態），但之後要做付費牆時
 * server 端讀得到 session，不必重寫整個 auth 層。
 *
 * anon key 是設計成公開的，會出現在 client bundle 裡。資料安全完全靠 RLS，
 * 不是靠藏這把 key。
 */
let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabase() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }
  return client;
}
