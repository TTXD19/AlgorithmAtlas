"use client";

import { usePathname } from "next/navigation";
import { LOCALES, LOCALE_LABEL, isLocale, type Locale } from "@/lib/i18n";
import { useLocale, useT } from "./LocaleProvider";

/**
 * 切換語言時停在同一頁：把路徑的第一段換成新語言。
 * 例如 /zh-Hant/graph/bfs → /en/graph/bfs。
 *
 * 用整頁導航而不是 router.push：換語言會換掉 <html lang>、metadata 與整份內容，
 * 而 root layout 在 [lang] 底下，client 端導航會讓它連同 <html>/<head> 一起
 * 重新渲染，實測會噴 React #418。整頁導航語意上也更正確。
 */
export function LocaleSwitcher() {
  const pathname = usePathname();
  const current = useLocale();
  const t = useT();

  const go = (next: Locale) => {
    const parts = pathname.split("/");
    if (isLocale(parts[1])) parts[1] = next;
    else parts.splice(1, 0, next);
    window.location.assign(parts.join("/") || `/${next}`);
  };

  return (
    <div className="flex items-center rounded-md border border-line" role="group" aria-label={t.nav.language}>
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => go(l)}
          aria-current={l === current ? "true" : undefined}
          title={LOCALE_LABEL[l]}
          className={`cursor-pointer px-1.5 py-1 text-[11.5px] font-semibold first:rounded-l-[5px] last:rounded-r-[5px] ${
            l === current ? "bg-accent-soft text-accent" : "text-ink-3 hover:bg-surface-2 hover:text-ink-2"
          }`}
        >
          {l === "zh-Hant" ? "中" : "EN"}
        </button>
      ))}
    </div>
  );
}
