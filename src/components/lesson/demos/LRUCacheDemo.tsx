"use client";

import { useMemo, useState } from "react";
import { useLocale, useT } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

const CAP = 3;
const KEYS = ["A", "B", "C", "D", "E"];

const TEXT = demoText(
  {
    intro: (cap: number) => `容量 ${cap} 的 LRU 快取。雙向串列記「誰最近被用過」，雜湊表記「每個 key 的節點在哪」。`,
    putHit: (k: string) => `put(${k})：雜湊表說 ${k} 已經在快取裡，直接拿到它的節點。從原位置拆下（改 prev 和 next 兩個指標）、接到最前面。全部 O(1)。`,
    putRoom: (k: string) => `put(${k})：還有空間，新節點接到最前面，雜湊表加一筆 ${k} → 節點。O(1)。`,
    putEvict: (k: string, victim: string) => `put(${k})：快取滿了。尾端的 ${victim} 最久沒被用，拆掉它（O(1)，因為雙向所以知道它的前一個）、雜湊表刪掉 ${victim}，再把 ${k} 接到最前面。`,
    getMiss: (k: string) => `get(${k})：雜湊表裡沒有 ${k}，快取未命中（miss）。O(1)。`,
    getHit: (k: string) => `get(${k})：命中。雜湊表 O(1) 找到節點，把它移到最前面，代表「剛剛用過」。單向串列做不到 O(1) 拆節點，因為不知道前一個是誰。`,
    listTitle: "雙向串列（最近 ⇄ 最久）",
    sentinelNote: "head 和 tail 是哨兵節點，讓最前面與最後面的插入刪除不用特判。",
    mapTitle: "雜湊表（key → 節點）",
    toNode: "→ 節點",
    opsLabel: (n: number) => `操作 ${n}`,
  },
  {
    en: {
      intro: (cap: number) => `An LRU cache with capacity ${cap}. The doubly linked list records who was used most recently, and the hash table records where each key's node sits.`,
      putHit: (k: string) => `put(${k}): the hash table says ${k} is already cached, so its node is available straight away. Unlink it from its current position — two pointer rewrites, prev and next — and splice it in at the front. All O(1).`,
      putRoom: (k: string) => `put(${k}): there is still room, so the new node goes in at the front and the hash table gains one entry, ${k} → node. O(1).`,
      putEvict: (k: string, victim: string) => `put(${k}): the cache is full. ${victim} sits at the tail and is the least recently used, so unlink it — O(1), because a doubly linked list knows its predecessor — drop ${victim} from the hash table, then splice ${k} in at the front.`,
      getMiss: (k: string) => `get(${k}): the hash table has no entry for ${k}, so this is a cache miss. O(1).`,
      getHit: (k: string) => `get(${k}): a hit. The hash table finds the node in O(1), and moving it to the front marks it as just used. A singly linked list could not unlink a node in O(1), because it has no way to reach the node before it.`,
      listTitle: "Doubly linked list (most recent ⇄ least recent)",
      sentinelNote: "head and tail are sentinel nodes, so inserting or removing at either end needs no special case.",
      mapTitle: "Hash table (key → node)",
      toNode: "→ node",
      opsLabel: (n: number) => `${n} operation${n === 1 ? "" : "s"}`,
    },
  },
);

type Dict = (typeof TEXT)["zh-Hant"];

interface State {
  /** 最近使用在前、最久沒用在後 */
  order: string[];
  hi: string | null;
  evicted: string | null;
  ops: number;
  last: string;
}

const init = (t: Dict): State => ({ order: [], hi: null, evicted: null, ops: 0, last: t.intro(CAP) });

function put(t: Dict, s: State, k: string): State {
  if (s.order.includes(k)) {
    return { ...s, order: [k, ...s.order.filter((x) => x !== k)], hi: k, evicted: null, ops: s.ops + 1, last: t.putHit(k) };
  }
  if (s.order.length < CAP) {
    return { ...s, order: [k, ...s.order], hi: k, evicted: null, ops: s.ops + 1, last: t.putRoom(k) };
  }
  const victim = s.order[s.order.length - 1];
  return { ...s, order: [k, ...s.order.slice(0, -1)], hi: k, evicted: victim, ops: s.ops + 1, last: t.putEvict(k, victim) };
}

function get(t: Dict, s: State, k: string): State {
  if (!s.order.includes(k)) {
    return { ...s, hi: null, evicted: null, ops: s.ops + 1, last: t.getMiss(k) };
  }
  return { ...s, order: [k, ...s.order.filter((x) => x !== k)], hi: k, evicted: null, ops: s.ops + 1, last: t.getHit(k) };
}

const BTN = "h-[28px] cursor-pointer whitespace-nowrap rounded-md border px-2.5 font-mono text-[12.5px] font-medium";

export function LRUCacheDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const ui = useT();
  const initial = useMemo(() => init(TEXT[locale]), [locale]);
  const [s, setS] = useState<State>(initial);
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <span className="flex items-center gap-1.5">put
          {KEYS.map((k) => <button key={k} type="button" className={`${BTN} border-accent bg-accent text-accent-ink hover:brightness-110`} onClick={() => setS((c) => put(t, c, k))}>{k}</button>)}
        </span>
        <span className="flex items-center gap-1.5">get
          {KEYS.map((k) => <button key={k} type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setS((c) => get(t, c, k))}>{k}</button>)}
        </span>
        <button type="button" className={`${BTN} ml-auto border-line bg-surface hover:bg-surface-2`} onClick={() => setS(initial)}>{ui.demo.reset}</button>
      </div>

      <div className="grid grid-cols-1 gap-4 p-3.5 md:grid-cols-[minmax(0,1fr)_170px]">
        <div>
          <div className="eyebrow mb-2">{t.listTitle}</div>
          <div className="flex flex-wrap items-center">
            <span className="rounded-md border border-line-strong bg-surface-2 px-2 py-1 font-mono text-[11.5px] text-ink-2">head</span>
            <Link />
            {s.order.length === 0 && <span className="rounded-md border border-dashed border-line px-2 py-1 text-[12px] text-ink-3">{ui.demo.empty}</span>}
            {s.order.map((k) => (
              <span key={k} className="flex items-center">
                <span className={`flex h-9 items-stretch overflow-hidden rounded-md border font-mono text-[13.5px] font-medium ${k === s.hi ? "border-accent bg-accent text-accent-ink" : "border-line-strong bg-surface"}`}>
                  <span className="grid w-6 place-items-center border-r border-current/30 text-[10px]">‹</span>
                  <span className="grid w-9 place-items-center">{k}</span>
                  <span className="grid w-6 place-items-center border-l border-current/30 text-[10px]">›</span>
                </span>
                <Link />
              </span>
            ))}
            <span className="rounded-md border border-line-strong bg-surface-2 px-2 py-1 font-mono text-[11.5px] text-ink-2">tail</span>
            {s.evicted && <span className="ml-3 rounded-md border border-amber bg-amber-soft px-2 py-1 font-mono text-[12px] text-amber line-through">{s.evicted}</span>}
          </div>
          <p className="mt-2.5 mb-0 text-[12.5px] text-ink-3">{t.sentinelNote}</p>
        </div>
        <div>
          <div className="eyebrow mb-2">{t.mapTitle}</div>
          <div className="flex min-h-[80px] flex-col gap-1">
            {s.order.length === 0 && <span className="rounded-md border border-dashed border-line-strong px-2 py-1.5 text-center text-[12px] text-ink-3">{ui.demo.empty}</span>}
            {[...s.order].sort().map((k) => (
              <div key={k} className={`flex justify-between rounded-md border px-2.5 py-1 font-mono text-[12.5px] ${k === s.hi ? "border-accent bg-accent-soft" : "border-line"}`}>
                <span>{k}</span><span className="text-ink-3">{t.toNode}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-line px-3.5 py-2.5 text-[13.5px]">
        <span className="shrink-0 font-mono text-[12px] text-ink-3">{t.opsLabel(s.ops)}</span>
        <span className="flex-1">{s.last}</span>
      </div>
    </div>
  );
}

function Link() {
  return <span className="mx-0.5 text-ink-3">⇄</span>;
}
