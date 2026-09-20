"use client";

import { useSyncExternalStore } from "react";
import { useProgress } from "./progress";

/**
 * 複習提醒。
 *
 * 一篇課程「該複習」的條件：標記已學會超過 30 天，而且之後沒再打開過。
 * 「學會時間」來自 progress 的時間戳（登入者是資料庫的 updated_at）；
 * 「上次打開」記在本機的 atlas-seen，不同步——它只是用來把剛複習過的課
 * 從清單拿掉，跨裝置漏掉幾筆只會多提醒一次，不值得多一張表。
 */
export const REVIEW_AFTER_MS = 30 * 24 * 60 * 60 * 1000;

const KEY = "atlas-seen";
type SeenMap = Record<string, number>;
const listeners = new Set<() => void>();
let cache: SeenMap | null = null;
let cacheRaw: string | null = null;
const EMPTY: SeenMap = {};

function read(): SeenMap {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === cacheRaw && cache) return cache;
    cacheRaw = raw;
    cache = raw ? (JSON.parse(raw) as SeenMap) : {};
    return cache;
  } catch {
    return cache ?? (cache = {});
  }
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/** 記下「現在打開了這篇」。由課程頁掛載時呼叫。 */
export function markSeen(key: string) {
  try {
    const next = { ...read(), [key]: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  cache = null;
  listeners.forEach((l) => l());
}

/**
 * 目前時間，每分鐘更新一次。
 *
 * 用 store 而不是在 render 裡直接 Date.now()：render 必須是純函式，
 * 而「幾天前」這種數字一分鐘一次已經綽綽有餘。SSR 時為 0，那時 progress
 * 也還是空的，不會算出任何東西。
 */
const nowListeners = new Set<() => void>();
let ticker: ReturnType<typeof setInterval> | null = null;
function subscribeNow(l: () => void) {
  nowListeners.add(l);
  if (!ticker) ticker = setInterval(() => nowListeners.forEach((f) => f()), 60_000);
  return () => {
    nowListeners.delete(l);
    if (!nowListeners.size && ticker) {
      clearInterval(ticker);
      ticker = null;
    }
  };
}
const minuteNow = () => Math.floor(Date.now() / 60_000) * 60_000;
export function useNow(): number {
  return useSyncExternalStore(subscribeNow, minuteNow, () => 0);
}

export interface ReviewItem {
  key: string;
  /** 距離上次接觸（學會或打開）的天數 */
  days: number;
}

/** 該複習的課程，最久沒碰的排最前面。 */
export function useReviewDue(): ReviewItem[] {
  const seen = useSyncExternalStore(subscribe, read, () => EMPTY);
  const { done } = useProgress();
  const now = useNow();
  const due: ReviewItem[] = [];
  for (const [key, at] of Object.entries(done)) {
    if (at <= 1) continue; // 舊資料沒有時間戳，無從判斷
    const last = Math.max(at, seen[key] ?? 0);
    if (now - last >= REVIEW_AFTER_MS) due.push({ key, days: Math.floor((now - last) / 86400000) });
  }
  return due.sort((a, b) => b.days - a.days);
}
