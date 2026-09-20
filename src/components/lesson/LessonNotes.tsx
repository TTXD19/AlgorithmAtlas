"use client";

import { useEffect } from "react";
import { useNotes } from "@/lib/notes";
import { useUser } from "@/lib/auth";
import { markSeen } from "@/lib/review";
import { useT } from "../LocaleProvider";

/**
 * 課程結尾的筆記區。不需要登入就能寫（存本機），登入後同步。
 *
 * 也負責記下「這篇被打開過」給複習提醒用——它在每篇課程頁都會掛載，
 * 不必再多一個空元件。
 */
export function LessonNotes({ lessonId }: { lessonId: string }) {
  const { get, set } = useNotes();
  const { user } = useUser();
  const t = useT();
  const body = get(lessonId);

  useEffect(() => markSeen(lessonId), [lessonId]);

  return (
    <div className="mt-3 border-t border-line pt-[22px]">
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="m-0 text-[17px] font-bold">{t.notes.title}</h2>
        <span className="text-[12px] text-ink-3">{user ? t.notes.synced : t.notes.local}</span>
      </div>
      <textarea
        value={body}
        onChange={(e) => set(lessonId, e.target.value)}
        placeholder={t.notes.placeholder}
        rows={Math.min(14, Math.max(4, body.split("\n").length + 1))}
        maxLength={20000}
        className="w-full max-w-[66ch] resize-y rounded-[10px] border border-line bg-surface px-3.5 py-3 text-[14px] leading-[1.6] text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
      />
      {body.length > 0 && (
        <div className="mt-1 text-right text-[11.5px] text-ink-3 tabular-nums">{body.length} {t.notes.chars}</div>
      )}
    </div>
  );
}
