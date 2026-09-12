"use client";

import { useState } from "react";

const START = [3, 1, 4, 1, 5, 9, 2, 6];
const randomArr = () => Array.from({ length: 8 }, () => Math.floor(Math.random() * 9) + 1);

const BTN = "h-[30px] cursor-pointer whitespace-nowrap rounded-md border px-3 text-[13px] font-medium disabled:cursor-default disabled:opacity-45";
const PICK = "h-7 w-7 cursor-pointer rounded-md border font-mono text-[12px]";

export function PrefixSumDemo() {
  const [arr, setArr] = useState(START);
  /** 已建好的前綴和個數（不含 P[0]） */
  const [built, setBuilt] = useState(0);
  const [l, setL] = useState(2);
  const [r, setR] = useState(5);

  const n = arr.length;
  const prefix = [0];
  for (let i = 0; i < n; i++) prefix.push(prefix[i] + arr[i]);
  const ready = built === n;
  const sum = prefix[r + 1] - prefix[l];

  const reset = (a: number[]) => { setArr(a); setBuilt(0); };

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <button type="button" className={`${BTN} border-accent bg-accent text-accent-ink hover:brightness-110`} onClick={() => setBuilt((b) => Math.min(n, b + 1))} disabled={ready}>建表下一步</button>
        <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setBuilt(n)} disabled={ready}>一次建好</button>
        <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => reset(START)}>重設</button>
        <button type="button" className={`${BTN} ml-auto border-line bg-surface hover:bg-surface-2`} onClick={() => reset(randomArr())}>換一組數字</button>
      </div>

      <div className="overflow-x-auto px-3.5 pt-3.5">
        <div className="eyebrow mb-1.5">原陣列 a</div>
        <Row cells={arr.map((v, i) => ({ v, hi: ready && i >= l && i <= r ? "range" : built === i + 1 ? "cur" : "" }))} offset={0} />

        <div className="eyebrow mt-3.5 mb-1.5">前綴和 P（P[i] = a[0] + … + a[i-1]）</div>
        <Row
          cells={prefix.map((v, i) => ({
            v: i <= built ? v : null,
            hi: ready && (i === l || i === r + 1) ? "key" : i === built && built > 0 ? "cur" : "",
          }))}
          offset={0}
        />
      </div>

      <div className="border-t border-line px-3.5 py-2.5 text-[13.5px]">
        {!ready ? (
          built === 0
            ? "P[0] = 0 是起點。按「建表下一步」，每一步只做一次加法：P[i+1] = P[i] + a[i]。"
            : `P[${built}] = P[${built - 1}] + a[${built - 1}] = ${prefix[built - 1]} + ${arr[built - 1]} = ${prefix[built]}。到目前為止做了 ${built} 次加法。`
        ) : (
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center gap-2 text-[13px] text-ink-2">
              <span>查詢區間 l =</span>
              <div className="flex gap-1">{arr.map((_, i) => <button key={i} type="button" className={`${PICK} ${i === l ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface hover:bg-surface-2"}`} onClick={() => { setL(i); if (i > r) setR(i); }}>{i}</button>)}</div>
              <span className="ml-2">r =</span>
              <div className="flex gap-1">{arr.map((_, i) => <button key={i} type="button" className={`${PICK} ${i === r ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface hover:bg-surface-2"}`} onClick={() => { setR(i); if (i < l) setL(i); }}>{i}</button>)}</div>
            </div>
            <div>
              sum(a[{l}..{r}]) = P[{r + 1}] − P[{l}] = {prefix[r + 1]} − {prefix[l]} = <strong className="font-mono text-accent">{sum}</strong>
              <span className="ml-2 text-ink-3">一次減法。暴力做法要加 {r - l + 1} 次。</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ cells, offset }: { cells: { v: number | null; hi: string }[]; offset: number }) {
  const tone: Record<string, string> = {
    range: "border-accent bg-accent-soft text-ink",
    key: "border-accent bg-accent text-accent-ink",
    cur: "border-amber bg-amber-soft text-amber",
    "": "border-line-strong bg-surface",
  };
  return (
    <div className="flex gap-1">
      {cells.map((c, i) => (
        <div key={i} className="flex w-11 shrink-0 flex-col items-center gap-1 font-mono text-[11px] text-ink-3">
          <span>[{i + offset}]</span>
          <span className={`grid h-9 w-full place-items-center rounded-md border text-[14px] font-medium ${c.v === null ? "border-dashed border-line" : tone[c.hi]}`}>{c.v ?? ""}</span>
        </div>
      ))}
    </div>
  );
}
