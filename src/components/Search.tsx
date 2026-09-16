"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { TOPICS, KIND_LABEL, type GlyphId, type Level as LevelNum } from "@/lib/topics";
import { TopicGlyph } from "./TopicGlyph";
import { useHref } from "./LocaleProvider";
import { Level } from "./Level";

interface Entry {
  kind: "topic" | "sub";
  href: string;
  glyph: GlyphId;
  /** 主標題，用英文名 */
  title: string;
  /** 副標題：中文名加一句說明 */
  sub: string;
  /** 右側脈絡：所屬主題，或分類 */
  context: string;
  lvl?: LevelNum;
  draft?: boolean;
  /** 搜得到但不顯示的欄位，已轉小寫 */
  hay: string;
}

/** 資料是靜態的，索引在模組載入時建一次就好。 */
const INDEX: Entry[] = TOPICS.flatMap((t): Entry[] => [
  {
    kind: "topic",
    href: `/${t.id}`,
    glyph: t.glyph,
    title: t.en,
    sub: `${t.zh} · ${t.desc}`,
    context: KIND_LABEL[t.kind],
    hay: [t.id, t.zh, t.desc, t.intro ?? "", ...t.applications.map((a) => `${a.title} ${a.desc}`)].join(" ").toLowerCase(),
  },
  ...t.subs.map((s): Entry => ({
    kind: "sub",
    href: `/${t.id}/${s.id}`,
    glyph: t.glyph,
    title: s.name,
    sub: `${s.zh} · ${s.desc ?? s.apply}`,
    context: t.en,
    lvl: s.lvl,
    draft: s.state === "draft",
    hay: [s.id, s.zh, s.desc ?? "", s.apply, t.en, t.zh].join(" ").toLowerCase(),
  })),
]);

const TOPIC_ENTRIES = INDEX.filter((e) => e.kind === "topic");

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** 每個關鍵字都要命中，命中的位置越前面分數越高；有一個沒中就回傳 -1。 */
function score(e: Entry, tokens: string[]) {
  const title = e.title.toLowerCase();
  const words = title.split(/[\s&-]+/);
  const sub = e.sub.toLowerCase();
  let total = 0;
  for (const q of tokens) {
    let best = 0;
    if (title.startsWith(q)) best = 100;
    else if (words.some((w) => w.startsWith(q))) best = 80;
    else if (sub.startsWith(q)) best = 70;
    else if (title.includes(q)) best = 50;
    else if (sub.includes(q)) best = 35;
    else if (e.hay.includes(q)) best = 15;
    if (!best) return -1;
    total += best;
  }
  // 主題略優先於細項，短標題略優先於長標題
  return total + (e.kind === "topic" ? 6 : 0) - Math.min(e.title.length, 40) / 40;
}

/** 把命中的關鍵字標成強調色。 */
function Mark({ text, tokens }: { text: string; tokens: string[] }) {
  if (!tokens.length) return <>{text}</>;
  const parts = text.split(new RegExp(`(${tokens.map(esc).join("|")})`, "gi"));
  return <>{parts.map((p, i) => (i % 2 ? <mark key={i} className="bg-transparent font-bold text-accent">{p}</mark> : p))}</>;
}

export function Search() {
  const router = useRouter();
  const h = useHref();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const listId = useId();

  const tokens = useMemo(() => q.trim().toLowerCase().split(/\s+/).filter(Boolean), [q]);

  const results = useMemo(() => {
    if (!tokens.length) return TOPIC_ENTRIES;
    return INDEX.map((e) => ({ e, s: score(e, tokens) }))
      .filter((r) => r.s >= 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 24)
      .map((r) => r.e);
  }, [tokens]);

  const reset = () => {
    setQ("");
    setActive(0);
  };
  const close = useCallback(() => {
    setOpen(false);
    reset();
    openerRef.current?.focus();
  }, []);
  const openFrom = (el: HTMLElement) => {
    openerRef.current = el;
    setOpen(true);
  };
  const go = (href: string) => {
    setOpen(false);
    reset();
    router.push(h(href));
  };

  // ⌘K / Ctrl+K 開關
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey || e.key.toLowerCase() !== "k") return;
      e.preventDefault();
      setOpen((v) => {
        if (v) reset();
        else openerRef.current = document.activeElement as HTMLElement | null;
        return !v;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // 開啟時聚焦輸入框，並鎖住背景捲動
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    listRef.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active, results]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    // 中文輸入法選字中，方向鍵與 Enter 是給輸入法的，不要攔
    if (e.nativeEvent.isComposing) return;
    const n = results.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (n ? (i + 1) % n : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (n ? (i - 1 + n) % n : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = results[active];
      if (hit) go(hit.href);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => openFrom(e.currentTarget)}
        aria-label="搜尋演算法"
        className="hidden h-8 min-w-[220px] cursor-pointer items-center gap-2 rounded-[7px] border border-line bg-surface px-2.5 text-[13px] text-ink-3 hover:border-line-strong hover:text-ink-2 md:flex"
      >
        <SearchIcon />
        搜尋演算法⋯
        <kbd className="ml-auto rounded border border-line px-1.5 font-sans text-[11px]">⌘K</kbd>
      </button>

      <button
        type="button"
        onClick={(e) => openFrom(e.currentTarget)}
        aria-label="搜尋演算法"
        className="flex cursor-pointer items-center rounded-md p-1.5 text-ink-2 hover:bg-surface-2 hover:text-ink md:hidden"
      >
        <SearchIcon size={17} />
      </button>

      {/* header 有 backdrop-blur，會成為 fixed 子元素的定位基準，所以掛到 body */}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh]" onKeyDown={onKeyDown}>
            <div className="fixed inset-0 bg-black/40" onClick={close} aria-hidden="true" />

            <div
              role="dialog"
              aria-modal="true"
              aria-label="搜尋演算法"
              className="relative flex max-h-[min(70vh,540px)] w-full max-w-[580px] flex-col overflow-hidden rounded-[12px] border border-line bg-surface shadow-card"
            >
              <div className="flex h-12 shrink-0 items-center gap-2.5 border-b border-line px-3.5 text-ink-3">
                <SearchIcon size={16} />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setActive(0);
                  }}
                  placeholder="搜尋演算法、資料結構、主題⋯"
                  aria-label="搜尋演算法"
                  role="combobox"
                  aria-expanded="true"
                  aria-controls={listId}
                  aria-autocomplete="list"
                  aria-activedescendant={results[active] ? `${listId}-${active}` : undefined}
                  className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-3"
                />
                <kbd className="hidden rounded border border-line px-1.5 text-[11px] sm:block">esc</kbd>
              </div>

              {results.length === 0 ? (
                <div className="px-4 py-10 text-center text-[14px] text-ink-3">
                  找不到「{q.trim()}」相關的內容。<br />
                  試試 <span className="inl">BFS</span>、<span className="inl">二分</span> 或 <span className="inl">dp</span>。
                </div>
              ) : (
                <>
                  <div className="eyebrow shrink-0 px-4 pt-3 pb-1">{tokens.length ? `${results.length} 個結果` : "全部主題"}</div>
                  <ul ref={listRef} id={listId} role="listbox" aria-label="搜尋結果" className="m-0 min-h-0 flex-1 list-none overflow-y-auto p-1.5 pt-0">
                    {results.map((e, i) => {
                      const on = i === active;
                      return (
                        <li key={e.href} id={`${listId}-${i}`} role="option" aria-selected={on}>
                          <button
                            type="button"
                            onMouseEnter={() => setActive(i)}
                            onClick={() => go(e.href)}
                            className={`flex w-full cursor-pointer items-center gap-3 rounded-[7px] px-2.5 py-2 text-left ${on ? "bg-accent-soft" : ""}`}
                          >
                            <TopicGlyph id={e.glyph} className={`h-4 w-4 shrink-0 ${on ? "text-accent" : "text-ink-3"}`} />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[14px] font-semibold text-ink">
                                <Mark text={e.title} tokens={tokens} />
                                {e.draft && <span className="ml-1.5 align-middle text-[11px] font-medium text-ink-3">撰寫中</span>}
                              </span>
                              <span className="block truncate text-[12.5px] text-ink-3">
                                <Mark text={e.sub} tokens={tokens} />
                              </span>
                            </span>
                            <span className="flex shrink-0 items-center gap-2.5">
                              <span className="hidden max-w-[110px] truncate text-[11.5px] text-ink-3 sm:block">{e.context}</span>
                              {e.lvl && <Level n={e.lvl} />}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}

              <div className="flex shrink-0 items-center gap-3 border-t border-line px-3.5 py-2 text-[11.5px] text-ink-3">
                <span><kbd className="font-sans">↑↓</kbd> 移動</span>
                <span><kbd className="font-sans">↵</kbd> 前往</span>
                <span><kbd className="font-sans">esc</kbd> 關閉</span>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

function SearchIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
