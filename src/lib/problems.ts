"use client";

import { createSyncedSet } from "./synced-set";

/**
 * 做過的練習題。key 是題目來源（"LeetCode 50"）而不是課程＋題目：
 * 同一題出現在好幾篇課程裡（521 個項目、441 個不同題號），
 * 解過一次就該在每一篇都打勾。
 */
const store = createSyncedSet({ storageKey: "atlas-problems", table: "problems", flag: "is_done", keyColumn: "problem_key" });

export function useProblems() {
  const { map, has, toggle } = store.use();
  return { solved: map, isSolved: has, toggle };
}

export const setProblemsUser = store.setUser;
