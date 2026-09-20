"use client";

import { useState, useSyncExternalStore } from "react";
import { highlight, LANG_LABEL, LANG_ORDER, type Lang } from "@/lib/highlight";
import { useT } from "../LocaleProvider";

const PREF_KEY = "atlas-code-lang";

// 偏好語言的小 store：SSR 時為 null，掛載後讀 localStorage
const listeners = new Set<() => void>();
function readPref(): Lang | null {
  try {
    return localStorage.getItem(PREF_KEY) as Lang | null;
  } catch {
    return null;
  }
}
function writePref(l: Lang) {
  try {
    localStorage.setItem(PREF_KEY, l);
  } catch {}
  listeners.forEach((f) => f());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/**
 * 程式碼分頁。
 *
 * 選過的語言記在本機：讀 Java 的人不用每篇都重新點一次。這篇沒有那個語言時
 * 退回這篇有的第一個（順序照 LANG_ORDER），不會顯示空白。
 */
export function CodeTabs({ samples }: { samples: Partial<Record<Lang, string>> }) {
  const t = useT();
  const langs = LANG_ORDER.filter((l) => samples[l]);
  const pref = useSyncExternalStore(subscribe, readPref, () => null);
  const lang: Lang = pref && samples[pref] ? pref : langs[0];
  const [copied, setCopied] = useState(false);
  const pick = writePref;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(samples[lang] ?? "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="overflow-hidden rounded-[10px] border border-line/40 bg-code-bg text-code-ink">
      <div className="flex items-end gap-0.5 border-b border-white/10 px-2 pt-1.5">
        {langs.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => pick(l)}
            className={`cursor-pointer rounded-t-md px-2.5 py-1.5 font-mono text-[12.5px] ${
              l === lang ? "bg-white/[0.06] text-code-ink" : "text-code-cm hover:text-code-ink"
            }`}
          >
            {LANG_LABEL[l]}
          </button>
        ))}
        <button
          type="button"
          onClick={copy}
          className="mb-1 ml-auto cursor-pointer rounded-md px-2 py-1 font-mono text-[11.5px] text-code-cm hover:bg-white/[0.06] hover:text-code-ink"
          aria-live="polite"
        >
          {copied ? t.code.copied : t.code.copy}
        </button>
      </div>
      <pre className="m-0 overflow-x-auto px-4 py-3.5 font-mono text-[13px] leading-[1.6]">
        <code>{highlight(samples[lang] ?? "", lang)}</code>
      </pre>
    </div>
  );
}
