"use client";

import { useBookmarks } from "@/lib/bookmarks";
import { useT } from "./LocaleProvider";

/** 收藏切換。跟 MarkDone 一樣提供側欄滿寬版與內文版。 */
export function BookmarkButton({ lessonId, full }: { lessonId: string; full?: boolean }) {
  const { isBookmarked, toggle } = useBookmarks();
  const t = useT();
  const on = isBookmarked(lessonId);
  return (
    <button
      type="button"
      onClick={() => toggle(lessonId)}
      aria-pressed={on}
      title={on ? t.bookmark.remove : t.bookmark.add}
      className={`cursor-pointer rounded-[7px] border font-medium ${
        full ? "mt-2 h-[34px] w-full text-[13px]" : "inline-flex h-9 items-center px-4 text-[14px]"
      } ${on ? "border-amber bg-amber-soft text-amber" : "border-line bg-surface hover:bg-surface-2"}`}
    >
      {on ? t.bookmark.on : t.bookmark.off}
    </button>
  );
}
