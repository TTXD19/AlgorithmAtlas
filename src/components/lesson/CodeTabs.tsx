"use client";

import { useState } from "react";
import { highlight, type Lang } from "@/lib/highlight";

const LABEL: Record<Lang, string> = { python: "Python", cpp: "C++" };

export function CodeTabs({ samples }: { samples: Partial<Record<Lang, string>> }) {
  const langs = Object.keys(samples) as Lang[];
  const [lang, setLang] = useState<Lang>(langs[0]);
  return (
    <div className="overflow-hidden rounded-[10px] border border-line/40 bg-code-bg text-code-ink">
      <div className="flex gap-0.5 border-b border-white/10 px-2 pt-1.5">
        {langs.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            className={`cursor-pointer rounded-t-md px-2.5 py-1.5 font-mono text-[12.5px] ${
              l === lang ? "bg-white/[0.06] text-code-ink" : "text-code-cm hover:text-code-ink"
            }`}
          >
            {LABEL[l]}
          </button>
        ))}
      </div>
      <pre className="m-0 overflow-x-auto px-4 py-3.5 font-mono text-[13px] leading-[1.6]">
        <code>{highlight(samples[lang] ?? "", lang)}</code>
      </pre>
    </div>
  );
}
