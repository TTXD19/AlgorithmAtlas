"use client";

import { useSyncExternalStore } from "react";
import { getSupabase } from "./supabase";

const KEY = "atlas-done";
const listeners = new Set<() => void>();
let cache: Record<string, 1> | null = null;
let cacheRaw: string | null = null;

/** 目前登入者。由 <ProgressSync /> 設定；null 代表未登入，只用 localStorage。 */
let userId: string | null = null;

function read(): Record<string, 1> {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === cacheRaw && cache) return cache;
    cacheRaw = raw;
    cache = raw ? (JSON.parse(raw) as Record<string, 1>) : {};
    return cache;
  } catch {
    return cache ?? (cache = {});
  }
}
function write(o: Record<string, 1>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(o));
  } catch {}
  cache = null;
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => e.key === KEY && l();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}
const EMPTY: Record<string, 1> = {};

/**
 * 已學會的課程 key 集合，SSR 時為空，掛載後讀取 localStorage。
 *
 * localStorage 永遠是同步的真相來源，所以三個消費端（Sidebar、ProgressBits、
 * RoadmapView）不需要處理 loading 狀態。登入後它退居本機快取，遠端同步在背景進行。
 */
export function useProgress() {
  const done = useSyncExternalStore(subscribe, read, () => EMPTY);
  return {
    done,
    isDone: (key: string) => !!done[key],
    toggle: (key: string) => {
      const next = { ...read() };
      const nowDone = !next[key];
      if (nowDone) next[key] = 1;
      else delete next[key];
      write(next); // 先更新本機，UI 立即反應
      const uid = userId;
      if (uid) void push(uid, key, nowDone);
    },
  };
}

/** 單筆寫回遠端。updated_at 由資料庫 trigger 決定，不送前端時間。 */
async function push(uid: string, lessonKey: string, isDone: boolean) {
  try {
    await getSupabase()
      .from("progress")
      .upsert({ user_id: uid, lesson_key: lessonKey, is_done: isDone }, { onConflict: "user_id,lesson_key" });
  } catch {
    // 寫入失敗不擋 UI。下次開頁面的 merge 會把本機獨有的項目補推上去。
  }
}

/**
 * 把本機與遠端合併。**每次登入狀態確立時都會跑，不是只有第一次**，
 * 所以上面 push() 失敗的項目會在下次開頁面時自動補上，不必做離線佇列。
 *
 * 合併規則：遠端已有的 key 以遠端為準（本機沒有時間戳，不該覆蓋有時間戳的列）；
 * 本機獨有的 key 推上去。
 */
interface ProgressRow {
  lesson_key: string;
  is_done: boolean;
}

async function merge(uid: string) {
  try {
    const sb = getSupabase();
    const { data, error } = await sb.from("progress").select("lesson_key, is_done").eq("user_id", uid);
    if (error || !data) return;
    const rows = data as ProgressRow[];

    const remoteKeys = new Set(rows.map((r) => r.lesson_key));
    const local = read();
    const localOnly = Object.keys(local).filter((k) => !remoteKeys.has(k));

    if (localOnly.length) {
      await sb.from("progress").upsert(
        localOnly.map((k) => ({ user_id: uid, lesson_key: k, is_done: true })),
        { onConflict: "user_id,lesson_key", ignoreDuplicates: true },
      );
    }

    const merged: Record<string, 1> = {};
    for (const r of rows) if (r.is_done) merged[r.lesson_key] = 1;
    for (const k of localOnly) merged[k] = 1;
    write(merged);
  } catch {
    // 同步失敗就維持本機狀態，使用者照樣能用。
  }
}

/**
 * 由 <ProgressSync /> 呼叫。
 *
 * 登出時清掉本機進度：不是為了隱私，是為了正確性 —— 否則同一台瀏覽器換人登入時，
 * 上一個人的進度會被 merge 上傳到新帳號。
 */
export function setSyncUser(id: string | null) {
  if (id === userId) return;
  const had = userId;
  userId = id;
  if (id) void merge(id);
  else if (had) write({});
}
