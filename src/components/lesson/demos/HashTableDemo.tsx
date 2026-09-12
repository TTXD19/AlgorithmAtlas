"use client";

import { useState } from "react";

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
const INIT: State = { cap: 4, buckets: empty(4), n: 0, hitBucket: null, hitKey: null, probes: 0, last: "4 個空桶。插入的 key 用 key % 容量 決定放哪個桶；同一桶的 key 串成鏈。" };

function insert(s: State, key: number): State {
  const b = key % s.cap;
  const buckets = s.buckets.map((x) => [...x]);
  buckets[b].push(key);
  const n = s.n + 1;
  const chain = buckets[b].length;
  let next: State = {
    ...s, buckets, n, hitBucket: b, hitKey: key, probes: chain - 1,
    last: `${key} % ${s.cap} = ${b}，放進桶 ${b}。${chain > 1 ? `這個桶已經有 ${chain - 1} 個 key，發生碰撞，串在鏈尾。` : "桶是空的，直接放。"}`,
  };
  if (n / s.cap > MAX_LOAD) {
    const cap = s.cap * 2;
    const nb = empty(cap);
    buckets.flat().forEach((k) => nb[k % cap].push(k));
    next = { ...next, cap, buckets: nb, hitBucket: key % cap, last: `${next.last} 負載因子 ${n}/${s.cap} = ${(n / s.cap).toFixed(2)} 超過 ${MAX_LOAD}，容量加倍到 ${cap}，所有 key 重新算 key % ${cap} 放一次（rehash，O(n)）。` };
  }
  return next;
}

function lookup(s: State): State {
  const keys = s.buckets.flat();
  if (!keys.length) return { ...s, last: "表是空的，先插入幾個 key。" };
  const key = keys[Math.floor(Math.random() * keys.length)];
  const b = key % s.cap;
  const idx = s.buckets[b].indexOf(key);
  return { ...s, hitBucket: b, hitKey: key, probes: idx + 1, last: `查 ${key}：算出桶 ${b}，沿著鏈比對 ${idx + 1} 次就找到。鏈越短越快，這就是為什麼要控制負載因子。` };
}

const randomKey = (s: State) => {
  const used = new Set(s.buckets.flat());
  let k = Math.floor(Math.random() * 90) + 10;
  while (used.has(k)) k = Math.floor(Math.random() * 90) + 10;
  return k;
};

const BTN = "h-[30px] cursor-pointer whitespace-nowrap rounded-md border px-3 text-[13px] font-medium";

export function HashTableDemo() {
  const [s, setS] = useState<State>(INIT);
  const many = (k: number) => setS((cur) => { let x = cur; for (let i = 0; i < k; i++) x = insert(x, randomKey(x)); return x; });
  const load = s.n / s.cap;
  const longest = Math.max(0, ...s.buckets.map((b) => b.length));

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <button type="button" className={`${BTN} border-accent bg-accent text-accent-ink hover:brightness-110`} onClick={() => setS((cur) => insert(cur, randomKey(cur)))}>插入隨機 key</button>
        <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => many(4)}>插入 ×4</button>
        <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setS(lookup)}>查找一個既有 key</button>
        <button type="button" className={`${BTN} ml-auto border-line bg-surface hover:bg-surface-2`} onClick={() => setS(INIT)}>重設</button>
      </div>

      <div className="grid grid-cols-2 gap-px border-b border-line bg-line md:grid-cols-4">
        <Stat label="元素數 n" v={s.n} />
        <Stat label="容量（桶數）" v={s.cap} />
        <Stat label="負載因子 n / 容量" v={load.toFixed(2)} hi={load > 0.5} />
        <Stat label="最長的鏈" v={longest} />
      </div>

      <div className="px-3.5 pt-3.5 pb-2">
        <div className="eyebrow mb-1.5">桶（bucket）與鏈</div>
        <div className="flex flex-col gap-1">
          {s.buckets.map((chain, b) => (
            <div key={b} className={`flex min-h-8 items-center gap-1.5 rounded-md border px-2 py-1 ${b === s.hitBucket ? "border-accent bg-accent-soft" : "border-line"}`}>
              <span className="w-8 shrink-0 font-mono text-[12px] text-ink-3">[{b}]</span>
              {chain.length === 0 && <span className="text-[12px] text-ink-3">空</span>}
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
        <span className="shrink-0 rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[12px]">比對 {s.probes} 次</span>
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
