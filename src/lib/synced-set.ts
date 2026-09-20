"use client";

import { useSyncExternalStore } from "react";
import { getSupabase } from "./supabase";

/**
 * 「每篇課程一個布林」的同步集合：已學會、收藏都是這個形狀。
 *
 * 值是標記當下的時間戳（毫秒）。舊版 localStorage 存的是 1，讀到就當成
 * 「不知道何時」，消費端只該用 truthiness 判斷有沒有，時間另外用 `at()` 取。
 */
export type FlagMap = Record<string, number>;

export interface SyncedSetOptions {
  /** localStorage 的 key */
  storageKey: string;
  /** Supabase 的表名 */
  table: string;
  /** 表上的布林欄位名（progress 是 is_done，bookmarks 是 is_on） */
  flag: string;
  /** 表上的 key 欄位名。預設 lesson_key；練習題用 problem_key */
  keyColumn?: string;
}

interface Row {
  updated_at: string;
  [column: string]: string | boolean;
}

const EMPTY: FlagMap = {};

/**
 * 建立一個 localStorage 為真相來源、登入後在背景跟 Supabase 合併的集合。
 *
 * localStorage 永遠是同步的，所以消費端不需要處理 loading。登入後它退居本機
 * 快取，遠端同步在背景進行。合併與寫回的規則見下方各函式的註解。
 */
export function createSyncedSet({ storageKey, table, flag, keyColumn = "lesson_key" }: SyncedSetOptions) {
  const listeners = new Set<() => void>();
  let cache: FlagMap | null = null;
  let cacheRaw: string | null = null;
  /** 目前登入者。null 代表未登入，只用 localStorage。 */
  let userId: string | null = null;

  function read(): FlagMap {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw === cacheRaw && cache) return cache;
      cacheRaw = raw;
      cache = raw ? (JSON.parse(raw) as FlagMap) : {};
      return cache;
    } catch {
      return cache ?? (cache = {});
    }
  }
  function write(o: FlagMap) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(o));
    } catch {}
    cache = null;
    listeners.forEach((l) => l());
  }
  function subscribe(l: () => void) {
    listeners.add(l);
    const onStorage = (e: StorageEvent) => e.key === storageKey && l();
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(l);
      window.removeEventListener("storage", onStorage);
    };
  }

  /** 單筆寫回遠端。updated_at 由資料庫 trigger 決定，不送前端時間。 */
  async function push(uid: string, lessonKey: string, on: boolean) {
    try {
      await getSupabase()
        .from(table)
        .upsert({ user_id: uid, [keyColumn]: lessonKey, [flag]: on }, { onConflict: `user_id,${keyColumn}` });
    } catch {
      // 寫入失敗不擋 UI。下次開頁面的 merge 會把本機獨有的項目補推上去。
    }
  }

  /**
   * 把本機與遠端合併。**每次登入狀態確立時都會跑，不是只有第一次**，
   * 所以上面 push() 失敗的項目會在下次開頁面時自動補上，不必做離線佇列。
   *
   * 合併規則：遠端已有的 key 以遠端為準（本機的時間戳來自客戶端時鐘，不該
   * 覆蓋資料庫裁決過的列）；本機獨有的 key 推上去。
   */
  async function merge(uid: string) {
    try {
      const sb = getSupabase();
      const { data, error } = await sb.from(table).select(`${keyColumn}, ${flag}, updated_at`).eq("user_id", uid);
      if (error || !data) return;
      const rows = data as unknown as Row[];

      const remoteKeys = new Set(rows.map((r) => r[keyColumn] as string));
      const local = read();
      const localOnly = Object.keys(local).filter((k) => !remoteKeys.has(k));

      if (localOnly.length) {
        await sb.from(table).upsert(
          localOnly.map((k) => ({ user_id: uid, [keyColumn]: k, [flag]: true })),
          { onConflict: `user_id,${keyColumn}`, ignoreDuplicates: true },
        );
      }

      const merged: FlagMap = {};
      for (const r of rows) if (r[flag]) merged[r[keyColumn] as string] = Date.parse(r.updated_at) || 1;
      for (const k of localOnly) merged[k] = local[k];
      write(merged);
    } catch {
      // 同步失敗就維持本機狀態，使用者照樣能用。
    }
  }

  return {
    /** React hook：集合本身與讀寫方法。SSR 時為空，掛載後讀取 localStorage。 */
    use() {
      const map = useSyncExternalStore(subscribe, read, () => EMPTY);
      return {
        map,
        has: (key: string) => !!map[key],
        /** 標記的時間（毫秒）；舊資料或沒標記回傳 null */
        at: (key: string) => (map[key] > 1 ? map[key] : null),
        toggle: (key: string) => {
          const next = { ...read() };
          const nowOn = !next[key];
          if (nowOn) next[key] = Date.now();
          else delete next[key];
          write(next); // 先更新本機，UI 立即反應
          const uid = userId;
          if (uid) void push(uid, key, nowOn);
        },
      };
    },
    /**
     * 由 <ProgressSync /> 呼叫。
     *
     * 登出時清掉本機資料：不是為了隱私，是為了正確性 —— 否則同一台瀏覽器換人登入時，
     * 上一個人的資料會被 merge 上傳到新帳號。
     */
    setUser(id: string | null) {
      if (id === userId) return;
      const had = userId;
      userId = id;
      if (id) void merge(id);
      else if (had) write({});
    },
  };
}
