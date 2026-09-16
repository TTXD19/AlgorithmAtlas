"use client";

import { useEffect, useState } from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";

export interface AuthState {
  user: User | null;
  /** 首次解析 session 完成前為 true。用來避免「登入」閃一下才變成頭像。 */
  loading: boolean;
}

/**
 * 目前登入的使用者。
 *
 * 只掛 onAuthStateChange，不另外呼叫 getUser()：supabase-js 掛載時會先送出一個
 * INITIAL_SESSION 事件，初始狀態與後續變化都由它涵蓋，省掉一次多餘的網路往返。
 */
export function useUser(): AuthState {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    const { data } = getSupabase().auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setState({ user: session?.user ?? null, loading: false });
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return state;
}

export type Provider = "github" | "google";

export async function signIn(provider: Provider) {
  await getSupabase().auth.signInWithOAuth({
    provider,
    // 登入後回到使用者原本在看的那一頁，不是首頁。
    // 這需要 Supabase 後台的 Redirect URLs 有設 /** 萬用字元。
    options: { redirectTo: window.location.href },
  });
}

export async function signOut() {
  await getSupabase().auth.signOut();
}

/** 顯示用的名稱：優先用 OAuth 帶回來的名字，退回 email，再退回「使用者」。 */
export function displayName(user: User) {
  const meta = user.user_metadata ?? {};
  return (meta.name as string) || (meta.user_name as string) || user.email || "使用者";
}
