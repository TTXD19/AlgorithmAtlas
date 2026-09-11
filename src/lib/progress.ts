"use client";

import { useSyncExternalStore } from "react";

const KEY = "atlas-done";
const listeners = new Set<() => void>();
let cache: Record<string, 1> | null = null;
let cacheRaw: string | null = null;

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

/** 已學會的課程 key 集合，SSR 時為空，掛載後讀取 localStorage。 */
export function useProgress() {
  const done = useSyncExternalStore(subscribe, read, () => EMPTY);
  return {
    done,
    isDone: (key: string) => !!done[key],
    toggle: (key: string) => {
      const next = { ...read() };
      if (next[key]) delete next[key];
      else next[key] = 1;
      write(next);
    },
  };
}
