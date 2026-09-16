"use client";

import { useMemo, useState } from "react";
import { useLocale, useT } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

interface State {
  cap: number;
  buckets: number[][];
  n: number;
  /** 最近一次操作觸碰的 bucket 與 key */
  hitBucket: number | null;
  hitKey: number | null;
  /** 這次操作比較了幾個 key */
  probes: number;
  last: string;
}

const MAX_LOAD = 0.75;
const empty = (cap: number): number[][] => Array.from({ length: cap }, () => []);

const TEXT = demoText(
  {
    intro: (cap: number) => `${cap} 個空桶。插入的 key 用 key % 容量 決定放哪個桶；同一桶的 key 串成鏈。`,
    insertLine: (key: number, cap: number, b: number, chain: number) =>
      `${key} % ${cap} = ${b}，放進桶 ${b}。${chain > 1 ? `這個桶已經有 ${chain - 1} 個 key，發生碰撞，串在鏈尾。` : "桶是空的，直接放。"}`,
    rehash: (prev: string, n: number, cap: number, load: string, maxLoad: number, newCap: number) =>
      `${prev} 負載因子 ${n}/${cap} = ${load} 超過 ${maxLoad}，容量加倍到 ${newCap}，所有 key 重新算 key % ${newCap} 放一次（rehash，O(n)）。`,
    emptyTable: "表是空的，先插入幾個 key。",
    lookupLine: (key: number, b: number, probes: number) =>
      `查 ${key}：算出桶 ${b}，沿著鏈比對 ${probes} 次就找到。鏈越短越快，這就是為什麼要控制負載因子。`,
    btnInsert: "插入隨機 key",
    btnInsert4: "插入 ×4",
    btnLookup: "查找一個既有 key",
    statN: "元素數 n",
    statCap: "容量（桶數）",
    statLoad: "負載因子 n / 容量",
    statLongest: "最長的鏈",
    bucketsTitle: "桶（bucket）與鏈",
    probesLabel: (n: number) => `比對 ${n} 次`,
  },
  {
    en: {
      intro: (cap: number) => `${cap} empty buckets. An inserted key lands in the bucket given by key % capacity, and keys that share a bucket are chained together.`,
      insertLine: (key: number, cap: number, b: number, chain: number) =>
        `${key} % ${cap} = ${b}, so it goes into bucket ${b}. ${chain > 1 ? `That bucket already held ${chain - 1} key${chain - 1 === 1 ? "" : "s"}, so this is a collision and the new key joins the end of the chain.` : "The bucket was empty, so the key simply goes in."}`,
      rehash: (prev: string, n: number, cap: number, load: string, maxLoad: number, newCap: number) =>
        `${prev} The load factor is now ${n}/${cap} = ${load}, above ${maxLoad}, so the capacity doubles to ${newCap} and every key is placed again by key % ${newCap} — a rehash, costing O(n).`,
      emptyTable: "The table is empty, so insert a few keys first.",
      lookupLine: (key: number, b: number, probes: number) =>
        `Looking up ${key}: the bucket works out to ${b}, and walking the chain finds it after ${probes} comparison${probes === 1 ? "" : "s"}. Shorter chains are faster, which is exactly why the load factor is kept under control.`,
      btnInsert: "Insert a random key",
      btnInsert4: "Insert ×4",
      btnLookup: "Look up an existing key",
      statN: "Elements n",
      statCap: "Capacity (buckets)",
      statLoad: "Load factor n / capacity",
      statLongest: "Longest chain",
      bucketsTitle: "Buckets and chains",
      probesLabel: (n: number) => `${n} comparison${n === 1 ? "" : "s"}`,
    },
  },
);

type Dict = (typeof TEXT)["zh-Hant"];

const init = (t: Dict): State => ({ cap: 4, buckets: empty(4), n: 0, hitBucket: null, hitKey: null, probes: 0, last: t.intro(4) });

function insert(t: Dict, s: State, key: number): State {
  const b = key % s.cap;
  const buckets = s.buckets.map((x) => [...x]);
  buckets[b].push(key);
  const n = s.n + 1;
  const chain = buckets[b].length;
  let next: State = {
    ...s, buckets, n, hitBucket: b, hitKey: key, probes: chain - 1,
    last: t.insertLine(key, s.cap, b, chain),
  };
  if (n / s.cap > MAX_LOAD) {
    const cap = s.cap * 2;
    const nb = empty(cap);
    buckets.flat().forEach((k) => nb[k % cap].push(k));
    next = { ...next, cap, buckets: nb, hitBucket: key % cap, last: t.rehash(next.last, n, s.cap, (n / s.cap).toFixed(2), MAX_LOAD, cap) };
  }
  return next;
}

function lookup(t: Dict, s: State): State {
  const keys = s.buckets.flat();
  if (!keys.length) return { ...s, last: t.emptyTable };
  const key = keys[Math.floor(Math.random() * keys.length)];
  const b = key % s.cap;
  const idx = s.buckets[b].indexOf(key);
  return { ...s, hitBucket: b, hitKey: key, probes: idx + 1, last: t.lookupLine(key, b, idx + 1) };
}

const randomKey = (s: State) => {
  const used = new Set(s.buckets.flat());
  let k = Math.floor(Math.random() * 90) + 10;
  while (used.has(k)) k = Math.floor(Math.random() * 90) + 10;
  return k;
};

const BTN = "h-[30px] cursor-pointer whitespace-nowrap rounded-md border px-3 text-[13px] font-medium";

export function HashTableDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const ui = useT();
  const initial = useMemo(() => init(TEXT[locale]), [locale]);
  const [s, setS] = useState<State>(initial);
  const many = (k: number) => setS((cur) => { let x = cur; for (let i = 0; i < k; i++) x = insert(t, x, randomKey(x)); return x; });
  const load = s.n / s.cap;
  const longest = Math.max(0, ...s.buckets.map((b) => b.length));

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <button type="button" className={`${BTN} border-accent bg-accent text-accent-ink hover:brightness-110`} onClick={() => setS((cur) => insert(t, cur, randomKey(cur)))}>{t.btnInsert}</button>
        <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => many(4)}>{t.btnInsert4}</button>
        <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setS((cur) => lookup(t, cur))}>{t.btnLookup}</button>
        <button type="button" className={`${BTN} ml-auto border-line bg-surface hover:bg-surface-2`} onClick={() => setS(initial)}>{ui.demo.reset}</button>
      </div>

      <div className="grid grid-cols-2 gap-px border-b border-line bg-line md:grid-cols-4">
        <Stat label={t.statN} v={s.n} />
        <Stat label={t.statCap} v={s.cap} />
        <Stat label={t.statLoad} v={load.toFixed(2)} hi={load > 0.5} />
        <Stat label={t.statLongest} v={longest} />
      </div>

      <div className="px-3.5 pt-3.5 pb-2">
        <div className="eyebrow mb-1.5">{t.bucketsTitle}</div>
        <div className="flex flex-col gap-1">
          {s.buckets.map((chain, b) => (
            <div key={b} className={`flex min-h-8 items-center gap-1.5 rounded-md border px-2 py-1 ${b === s.hitBucket ? "border-accent bg-accent-soft" : "border-line"}`}>
              <span className="w-8 shrink-0 font-mono text-[12px] text-ink-3">[{b}]</span>
              {chain.length === 0 && <span className="text-[12px] text-ink-3">{ui.demo.empty}</span>}
              {chain.map((k, i) => (
                <span key={k} className="flex items-center gap-1.5">
                  {i > 0 && <span className="text-ink-3">→</span>}
                  <span className={`rounded-md border px-2 py-0.5 font-mono text-[12.5px] ${k === s.hitKey ? "border-accent bg-accent text-accent-ink" : "border-line-strong bg-surface"}`}>{k}</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-line px-3.5 py-2.5 text-[13.5px]">
        <span className="shrink-0 rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[12px]">{t.probesLabel(s.probes)}</span>
        <span className="flex-1">{s.last}</span>
      </div>
    </div>
  );
}

function Stat({ label, v, hi }: { label: string; v: number | string; hi?: boolean }) {
  return (
    <div className="bg-surface px-3.5 py-2.5">
      <div className="eyebrow">{label}</div>
      <div className={`font-mono text-[18px] font-medium tabular-nums ${hi ? "text-amber" : ""}`}>{v}</div>
    </div>
  );
}
