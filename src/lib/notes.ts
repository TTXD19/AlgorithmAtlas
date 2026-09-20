"use client";

import { useSyncExternalStore } from "react";
import { getSupabase } from "./supabase";

/**
 * 每篇課程一份純文字筆記。
 *
 * 跟 progress 一樣：localStorage 是同步的真相來源，登入後在背景跟 Supabase 合併。
 * 差別在值是文字不是布林，所以合併不能用「遠端為準」——兩邊都可能有較新的內容，
 * 用每篇各自的時間戳裁決（last-write-wins）。本機時間來自客戶端時鐘，
 * 只用來跟同一篇的遠端時間比大小，誤差幾分鐘不影響結果。
 */
export interface Note {
  body: string;
  /** 最後編輯時間（毫秒） */
  at: number;
}
export type NoteMap = Record<string, Note>;

const KEY = "atlas-notes";
const listeners = new Set<() => void>();
let cache: NoteMap | null = null;
let cacheRaw: string | null = null;
let userId: string | null = null;
const EMPTY: NoteMap = {};

function read(): NoteMap {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === cacheRaw && cache) return cache;
    cacheRaw = raw;
    cache = raw ? (JSON.parse(raw) as NoteMap) : {};
    return cache;
  } catch {
    return cache ?? (cache = {});
  }
}
function write(o: NoteMap) {
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

interface Row {
  lesson_key: string;
  body: string;
  updated_at: string;
}

/** 空字串代表刪除筆記：列保留、body 清空，這樣另一台裝置的舊內容不會把它復活。 */
async function push(uid: string, lessonKey: string, body: string) {
  try {
    await getSupabase()
      .from("notes")
      .upsert({ user_id: uid, lesson_key: lessonKey, body }, { onConflict: "user_id,lesson_key" });
  } catch {
    // 下次 merge 時，本機較新的內容會再推一次
  }
}

async function merge(uid: string) {
  try {
    const sb = getSupabase();
    const { data, error } = await sb.from("notes").select("lesson_key, body, updated_at").eq("user_id", uid);
    if (error || !data) return;
    const rows = data as Row[];
    const local = read();
    const merged: NoteMap = {};
    const toPush: { user_id: string; lesson_key: string; body: string }[] = [];

    for (const r of rows) {
      const remoteAt = Date.parse(r.updated_at) || 0;
      const mine = local[r.lesson_key];
      if (mine && mine.body !== r.body && mine.at > remoteAt) {
        merged[r.lesson_key] = mine;
        toPush.push({ user_id: uid, lesson_key: r.lesson_key, body: mine.body });
      } else if (r.body) {
        merged[r.lesson_key] = { body: r.body, at: remoteAt };
      }
    }
    const remoteKeys = new Set(rows.map((r) => r.lesson_key));
    for (const [k, v] of Object.entries(local)) {
      if (remoteKeys.has(k) || !v.body) continue;
      merged[k] = v;
      toPush.push({ user_id: uid, lesson_key: k, body: v.body });
    }
    if (toPush.length) await sb.from("notes").upsert(toPush, { onConflict: "user_id,lesson_key" });
    write(merged);
  } catch {
    // 同步失敗就維持本機狀態
  }
}

const timers = new Map<string, ReturnType<typeof setTimeout>>();

export function useNotes() {
  const notes = useSyncExternalStore(subscribe, read, () => EMPTY);
  return {
    notes,
    get: (key: string) => notes[key]?.body ?? "",
    /** 本機立即寫入；遠端寫回延遲 800ms，打字中不會每個字都送一次。 */
    set: (key: string, body: string) => {
      const next = { ...read() };
      if (body) next[key] = { body, at: Date.now() };
      else delete next[key];
      write(next);
      const uid = userId;
      if (!uid) return;
      clearTimeout(timers.get(key));
      timers.set(key, setTimeout(() => void push(uid, key, body), 800));
    },
  };
}

export function setNotesUser(id: string | null) {
  if (id === userId) return;
  const had = userId;
  userId = id;
  if (id) void merge(id);
  else if (had) write({});
}
