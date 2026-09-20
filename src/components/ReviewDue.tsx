"use client";

import Link from "next/link";
import { getSubtopicBy } from "@/lib/topics-text";
import { useReviewDue } from "@/lib/review";
import { useHref, useLocale, useT } from "./LocaleProvider";

/** 首頁的「該複習了」。沒有到期的課程就什麼都不渲染，SSR 時也是空的。 */
export function ReviewDue() {
  const due = useReviewDue();
  const locale = useLocale();
  const h = useHref();
  const t = useT();
  if (!due.length) return null;
  const shown = due.slice(0, 5);
  return (
    <section className="mb-10 rounded-xl border border-amber bg-amber-soft/40 p-4">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="m-0 text-[17px] font-bold">{t.me.review} · {due.length}</h2>
        <Link href={h("/me")} className="text-[13px] font-semibold text-accent hover:underline">{t.me.reviewAll} →</Link>
      </div>
      <div className="flex flex-wrap gap-2">
        {shown.map((d) => {
          const [tid, sid] = d.key.split("/");
          const hit = getSubtopicBy(locale, tid, sid);
          if (!hit) return null;
          return (
            <Link key={d.key} href={h(`/${tid}/${sid}`)} className="rounded-full border border-line bg-surface px-3 py-1 text-[13px] font-medium hover:border-line-strong">
              {hit.sub.name} <span className="text-ink-3">· {d.days} {t.me.daysAgo}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
