"use client";

import type { ReactNode } from "react";
import { useT } from "../LocaleProvider";
import { SECTIONS, type SectionId } from "./sections";

export { SECTIONS, type SectionId };

/**
 * 段落標題。
 *
 * 這是 client 元件，因為還沒遷移到新模型的課程直接呼叫 <Section id="…">、
 * 不會傳 locale 進來。用 hook 取語言，那些課程的標題也能跟著語言走，
 * 不必等它們全部遷移完。children 仍然是 server 渲染的內容。
 */
export function Section({ id, n, children }: { id: SectionId; n?: number; children: ReactNode }) {
  const idx = n ?? SECTIONS.indexOf(id) + 1;
  const title = useT().sections[id];
  return (
    <section id={`sec-${id}`} className="prose-lesson mb-10">
      <h2 className="mb-3 scroll-mt-[72px] text-[21px] font-bold">
        <span className="mr-2.5 font-mono text-[12px] font-medium text-ink-3">{String(idx).padStart(2, "0")}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}
