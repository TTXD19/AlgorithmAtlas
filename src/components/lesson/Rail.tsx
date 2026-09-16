"use client";

import { useEffect, useState } from "react";
import { SECTIONS } from "./parts";
import { MarkDone } from "../ProgressBits";
import { useT } from "../LocaleProvider";

export function Rail({ lessonId }: { lessonId: string }) {
  const [on, setOn] = useState<string>(SECTIONS[0]);
  const t = useT();

  useEffect(() => {
    const els = SECTIONS.map((id) => document.getElementById(`sec-${id}`)).filter(Boolean) as HTMLElement[];
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setOn(e.target.id.replace("sec-", ""))),
      { rootMargin: "-20% 0px -70% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [lessonId]);

  return (
    <aside className="sticky top-20 hidden self-start text-[13px] lg:block">
      <div className="eyebrow mb-2">{t.lesson.onThisPage}</div>
      {SECTIONS.map((id) => (
        <a
          key={id}
          href={`#sec-${id}`}
          className={`block border-l-2 py-1 pl-3 hover:text-ink ${on === id ? "border-accent text-accent" : "border-line text-ink-3"}`}
        >
          {t.sections[id]}
        </a>
      ))}
      <MarkDone lessonId={lessonId} full />
    </aside>
  );
}
