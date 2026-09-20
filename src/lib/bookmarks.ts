"use client";

import { createSyncedSet } from "./synced-set";

/** 收藏的課程。形狀與 progress 完全相同，只是另一張表。 */
const store = createSyncedSet({ storageKey: "atlas-bookmarks", table: "bookmarks", flag: "is_on" });

export function useBookmarks() {
  const { map, has, at, toggle } = store.use();
  return { bookmarks: map, isBookmarked: has, bookmarkedAt: at, toggle };
}

export const setBookmarksUser = store.setUser;
