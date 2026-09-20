"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { getSubtopicBy } from "@/lib/topics-text";
import { useProgress } from "@/lib/progress";
import { useBookmarks } from "@/lib/bookmarks";
import { useNotes } from "@/lib/notes";
import { useReviewDue, useNow } from "@/lib/review";
import { useUser } from "@/lib/auth";
import { useHref, useLocale, useT } from "./LocaleProvider";
import { TopicGlyph } from "./TopicGlyph";

/** 一列課程：名稱、副標、右側附註。key 指到已經不存在的課程就不顯示。 */
function LessonRow({ lessonKey, aside }: { lessonKey: string; aside?: ReactNode }) {
  const locale = useLocale();
  const h = useHref();
  const [t, s] = lessonKey.split("/");
  const hit = getSubtopicBy(locale, t, s);
  if (!hit) return null;
  return (
    <li className="border-t border-line first:border-t-0">
      <Link href={h(`/${t}/${s}`)} className="flex items-center gap-2.5 py-2.5 hover:text-accent">
        <TopicGlyph id={hit.topic.glyph} className="h-4 w-4 shrink-0 text-ink-3" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-semibold">{hit.sub.name}</span>
          <span className="block truncate text-[12px] text-ink-3">{hit.sub.zh}</span>
        </span>
        {aside && <span className="shrink-0 text-[12px] text-ink-3 tabular-nums">{aside}</span>}
      </Link>
    </li>
  );
}

function Block({ title, hint, empty, children }: { title: string; hint?: string; empty: string; children: ReactNode[] }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <h2 className="m-0 text-[17px] font-bold">{title}</h2>
        {hint && <span className="text-right text-[12px] text-ink-3">{hint}</span>}
      </div>
      {children.length ? <ul className="m-0 list-none p-0">{children}</ul> : <p className="m-0 py-2 text-[13.5px] text-ink-3">{empty}</p>}
    </section>
  );
}

export function MyLearning() {
  const t = useT();
  const { user, loading } = useUser();
  const { done } = useProgress();
  const { bookmarks } = useBookmarks();
  const { notes } = useNotes();
  const due = useReviewDue();
  const now = useNow();

  const ago = (ms: number) => {
    const d = Math.floor((now - ms) / 86400000);
    return d <= 0 ? t.me.today : `${d} ${t.me.daysAgo}`;
  };
  const recent = Object.entries(done)
    .filter(([, at]) => at > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);
  const marked = Object.entries(bookmarks).sort((a, b) => b[1] - a[1]);
  const noted = Object.entries(notes).filter(([, n]) => n.body).sort((a, b) => b[1].at - a[1].at);

  return (
    <>
      {!loading && !user && (
        <p className="mb-5 max-w-[66ch] rounded-lg border border-line bg-surface-2 px-4 py-2.5 text-[13.5px] text-ink-2">{t.me.signInHint}</p>
      )}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Block title={t.me.review} hint={t.me.reviewHint} empty={t.me.reviewEmpty}>
          {due.map((d) => <LessonRow key={d.key} lessonKey={d.key} aside={`${d.days} ${t.me.daysAgo}`} />)}
        </Block>
        <Block title={t.me.bookmarks} empty={t.me.bookmarksEmpty}>
          {marked.map(([k]) => <LessonRow key={k} lessonKey={k} />)}
        </Block>
        <Block title={t.me.notes} empty={t.me.notesEmpty}>
          {noted.map(([k, n]) => (
            <LessonRow key={k} lessonKey={k} aside={<span className="block max-w-[22ch] truncate">{n.body.split("\n")[0]}</span>} />
          ))}
        </Block>
        <Block title={t.me.recent} empty={t.me.recentEmpty}>
          {recent.map(([k, at]) => <LessonRow key={k} lessonKey={k} aside={ago(at)} />)}
        </Block>
      </div>
    </>
  );
}
