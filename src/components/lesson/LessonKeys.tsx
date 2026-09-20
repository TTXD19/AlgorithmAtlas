"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/lib/progress";
import { useT } from "../LocaleProvider";
import { isTyping } from "./demos/StepBar";

/**
 * 課程頁的鍵盤快捷鍵：← → 上一篇／下一篇、D 標記已學會。
 *
 * 示範元件在 capture 階段先處理過的 ← → 會帶 defaultPrevented，這裡讓開；
 * 所以滑鼠停在示範上時是步進，離開示範才是翻頁。
 */
export function LessonKeys({ lessonId, prevHref, nextHref }: { lessonId: string; prevHref?: string; nextHref?: string }) {
  const router = useRouter();
  const { toggle } = useProgress();
  const t = useT();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || isTyping(e)) return;
      if (e.key === "ArrowRight" && nextHref) router.push(nextHref);
      else if (e.key === "ArrowLeft" && prevHref) router.push(prevHref);
      else if (e.key === "d" || e.key === "D") toggle(lessonId);
      else return;
      e.preventDefault();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [router, toggle, lessonId, prevHref, nextHref]);

  return <p className="mt-3 hidden text-[11.5px] leading-[1.5] text-ink-3 lg:block">{t.lesson.keys}</p>;
}
