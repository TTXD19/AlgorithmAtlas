"use client";

import { useEffect } from "react";
import { useUser } from "@/lib/auth";
import { setSyncUser } from "@/lib/progress";

/**
 * 把登入狀態接到進度 store 上。不渲染任何東西。
 *
 * 放在 root layout，因為 Sidebar 每一頁都在顯示進度數字，同步必須全站生效。
 */
export function ProgressSync() {
  const { user, loading } = useUser();

  useEffect(() => {
    if (loading) return;
    setSyncUser(user?.id ?? null);
  }, [user, loading]);

  return null;
}
