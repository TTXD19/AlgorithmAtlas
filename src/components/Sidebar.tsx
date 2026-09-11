"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TOPICS, KIND_LABEL, lessonKey, type TopicKind } from "@/lib/topics";
import { useProgress } from "@/lib/progress";
import { TopicGlyph } from "./TopicGlyph";

export function Sidebar() {
  const path = usePathname();
  const [, topicId, subId] = path.split("/");
  const { isDone } = useProgress();

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-56px)] overflow-y-auto border-r border-line bg-surface/55 px-3.5 pt-5 pb-10 md:block">
      <Link
        href="/roadmap"
        className={`mb-4 flex items-center gap-2.5 rounded-md border px-2.5 py-1.5 text-[14px] font-semibold ${
          topicId === "roadmap" ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface hover:bg-surface-2"
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0" aria-hidden="true">
          <circle cx="6" cy="5" r="2.2" /><circle cx="18" cy="12" r="2.2" /><circle cx="6" cy="19" r="2.2" />
          <path d="M8 6.2c4 0 4 4.8 8 4.8M8 17.8c4 0 4-4.8 8-4.8" />
        </svg>
        學習路線
      </Link>
      {(["ds", "algo"] as TopicKind[]).map((kind) => (
        <div key={kind} className="mb-4">
          <div className="eyebrow px-2.5 pb-2">{KIND_LABEL[kind]}</div>
          <ul className="m-0 list-none p-0">
        {TOPICS.filter((t) => t.kind === kind).map((t) => {
          const open = topicId === t.id;
          const doneCount = t.subs.filter((s) => isDone(lessonKey(t.id, s.id))).length;
          const active = open && !subId;
          return (
            <li key={t.id}>
              <Link
                href={`/${t.id}`}
                className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[14px] font-semibold ${
                  active ? "bg-accent-soft text-accent" : "hover:bg-surface-2"
                }`}
              >
                <TopicGlyph id={t.glyph} className={`h-4 w-4 shrink-0 ${active ? "text-accent" : "text-ink-3"}`} />
                {t.en}
                <span className="ml-auto text-[12px] font-medium text-ink-3 tabular-nums">
                  {doneCount}/{t.subs.length}
                </span>
              </Link>
              {open && (
                <ul className="mt-0.5 mb-1.5 ml-[17px] list-none border-l border-line pl-[22px]">
                  {t.subs.map((s) => {
                    const cur = subId === s.id;
                    const done = isDone(lessonKey(t.id, s.id));
                    return (
                      <li key={s.id}>
                        <Link
                          href={`/${t.id}/${s.id}`}
                          className={`flex items-center gap-2 rounded-[5px] px-2.5 py-1 text-[13.5px] hover:bg-surface-2 hover:text-ink ${
                            cur ? "font-semibold text-accent" : s.state === "draft" ? "text-ink-3" : "text-ink-2"
                          }`}
                        >
                          <i className={`h-1.5 w-1.5 shrink-0 rounded-full ${done ? "bg-green" : "bg-line-strong"}`} />
                          {s.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
          </ul>
        </div>
      ))}
    </aside>
  );
}
