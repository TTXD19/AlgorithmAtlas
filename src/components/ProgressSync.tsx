"use client";

import { useEffect } from "react";
import { useUser } from "@/lib/auth";
import { setSyncUser } from "@/lib/progress";
import { setBookmarksUser } from "@/lib/bookmarks";
import { setNotesUser } from "@/lib/notes";
import { setProblemsUser } from "@/lib/problems";

/**
 * 把登入狀態接到進度、收藏、筆記、練習題四個 store 上。不渲染任何東西。
 *
 * 放在 root layout，因為 Sidebar 每一頁都在顯示進度數字，同步必須全站生效。
 */
export function ProgressSync() {
  const { user, loading } = useUser();

  useEffect(() => {
    if (loading) return;
    const id = user?.id ?? null;
    setSyncUser(id);
    setBookmarksUser(id);
    setNotesUser(id);
    setProblemsUser(id);
  }, [user, loading]);

  return null;
}
