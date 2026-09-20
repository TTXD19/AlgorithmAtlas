"use client";

import { createSyncedSet } from "./synced-set";

/**
 * 已學會的課程。同步規則見 synced-set.ts。
 *
 * 三個消費端（Sidebar、ProgressBits、RoadmapView）只用 isDone / done 的 truthiness，
 * 值本身是標記時間，給複習提醒（review.ts）用。
 */
const store = createSyncedSet({ storageKey: "atlas-done", table: "progress", flag: "is_done" });

export function useProgress() {
  const { map, has, at, toggle } = store.use();
  return { done: map, isDone: has, doneAt: at, toggle };
}

export const setSyncUser = store.setUser;
