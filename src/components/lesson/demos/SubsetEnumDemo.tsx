"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, CELL } from "./StepBar";

const ITEMS = ["A", "B", "C", "D"];
const N = ITEMS.length;
const FULL = 1 << N;
const SUPER = 0b1011; // 列舉子 mask 的對象：{A, B, D}
const bin = (m: number) => m.toString(2).padStart(N, "0");
const setOf = (m: number) => ITEMS.filter((_, i) => (m >> i) & 1);
const setStr = (m: number) => `{${setOf(m).join(", ") || " "}}`;
const sup = (x: number) => String(x).replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(d)]);

interface Step { desc: string; phase: "all" | "sub"; op: string; mask: number; listed: number[] }

function buildSteps(): Step[] {
  const steps: Step[] = [];
  steps.push({ desc: `${N} 個元素，每個「選或不選」對應一個位元，所以一個 ${N} 位元整數就是一個子集。mask 從 0 數到 ${FULL - 1}，就把 2${sup(N)} = ${FULL} 個子集全部列出來。`, phase: "all", op: "開始", mask: -1, listed: [] });
  const listed: number[] = [];
  for (let mask = 0; mask < FULL; mask++) {
    listed.push(mask);
    const on = ITEMS.map((_, i) => i).filter((i) => (mask >> i) & 1);
    const which = on.length ? `第 ${on.join("、")} 位是 1` : "沒有任何位是 1";
    steps.push({ desc: `mask = ${mask} = ${bin(mask)}₂，${which}，對應子集 ${setStr(mask)}。`, phase: "all", op: `mask = ${mask}`, mask, listed: [...listed] });
  }
  steps.push({ desc: `列完了，${FULL} 個子集一個不漏、一個不重。判斷第 i 個元素有沒有被選用 (mask >> i) & 1，整個過程 O(2ⁿ · n)。`, phase: "all", op: "結束", mask: -1, listed: [...listed] });

  // 子 mask 列舉
  const subs: number[] = [];
  steps.push({ desc: `第二個技巧：只列舉某個 mask 的子集合。以 mask = ${bin(SUPER)}₂ = ${setStr(SUPER)} 為例，從 sub = mask 開始，每次 sub = (sub − 1) & mask，直到 0。`, phase: "sub", op: "開始", mask: -1, listed: [] });
  let sub = SUPER;
  let prev = -1;
  for (;;) {
    subs.push(sub);
    let desc: string;
    if (prev < 0) {
      desc = `sub 從 mask 本身開始：${bin(sub)}₂ = ${setStr(sub)}。`;
    } else {
      const dec = prev - 1;
      const outside = ITEMS.map((_, i) => i).filter((i) => (dec >> i) & 1 && !((SUPER >> i) & 1));
      const skipped = Array.from({ length: prev - 1 - sub }, (_, j) => prev - 1 - j).map(bin).join("、");
      const note = sub === 0
        ? `到了空集合，這一個處理完就要停：再算一次 (0 − 1) & mask 會回到 mask 本身，變成無窮迴圈。`
        : outside.length
          ? `減 1 把最低位的 1 變 0、它下面的位全變 1，連不屬於 mask 的第 ${outside.join("、")} 位也變成 1；AND 回去把它清掉，${skipped} 這幾個不是子 mask 的整數一次跳過。`
          : `減 1 沒有碰到 mask 以外的位，AND 之後不變，就是下一個子 mask。`;
      desc = `sub = (${bin(prev)}₂ − 1) & ${bin(SUPER)}₂ = ${bin(dec)}₂ & ${bin(SUPER)}₂ = ${bin(sub)}₂ = ${setStr(sub)}。${note}`;
    }
    steps.push({ desc, phase: "sub", op: `sub = ${sub}`, mask: sub, listed: [...subs] });
    if (sub === 0) break;
    prev = sub;
    sub = (sub - 1) & SUPER;
  }
  steps.push({ desc: `${setStr(SUPER)} 有 ${setOf(SUPER).length} 個元素，剛好列出 2${sup(setOf(SUPER).length)} = ${subs.length} 個子 mask，由大到小、沒有一個多餘。對所有 mask 各自列舉子 mask，總共 3ⁿ 次，這是 Bitmask DP 常見的複雜度。`, phase: "sub", op: "結束", mask: -1, listed: [...subs] });
  return steps;
}

export function SubsetEnumDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];
  const cur = s.mask;
  const isSub = (m: number) => (m & SUPER) === m;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={s.phase === "all" ? `${N} 個元素 · 2ⁿ 個子集` : `mask = ${bin(SUPER)} 的子 mask`} />

      <div className="grid grid-cols-1 gap-3.5 p-3.5 md:grid-cols-[auto_minmax(0,1fr)]">
        <div>
          <div className="eyebrow mb-2">目前的 mask（第 i 位對應第 i 個元素）</div>
          <div className="flex gap-1">
            {ITEMS.map((_, col) => {
              const i = N - 1 - col;
              const bit = cur < 0 ? "·" : (cur >> i) & 1;
              const on = cur >= 0 && bit === 1;
              const outside = s.phase === "sub" && !((SUPER >> i) & 1);
              return (
                <div key={i} className="grid gap-1 text-center">
                  <span className="font-mono text-[10.5px] text-ink-3">bit {i}</span>
                  <span className={`grid h-8 w-10 place-items-center rounded-md border font-mono text-[13px] ${on ? CELL.accent : outside ? "border-dashed border-line text-ink-3" : "border-line bg-surface-2 text-ink-3"}`}>{bit}</span>
                  <span className={`grid h-8 w-10 place-items-center rounded-md border font-mono text-[13px] ${on ? CELL.green : outside ? "border-dashed border-line text-ink-3 line-through" : "border-line-strong bg-surface"}`}>{ITEMS[i]}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 font-mono text-[14px] text-ink">{cur >= 0 ? `${cur} → ${setStr(cur)}` : "—"}</div>
          {s.phase === "sub" && <div className="mt-1 text-[12px] text-ink-3">虛線的位不屬於 mask，永遠是 0</div>}
        </div>

        <div>
          <div className="eyebrow mb-2">{s.phase === "all" ? `所有 ${FULL} 個 mask` : "只看 mask 的子 mask（其他變灰）"}</div>
          <div className="grid grid-cols-4 gap-1">
            {Array.from({ length: FULL }, (_, m) => m).map((m) => {
              const hidden = s.phase === "sub" && !isSub(m);
              const done = s.listed.includes(m);
              const cls = m === cur ? CELL.accent : hidden ? "border-line bg-surface-2 text-ink-3 opacity-40" : done ? CELL.green : "border-line-strong bg-surface";
              return (
                <div key={m} className={`rounded-md border px-2 py-1 font-mono text-[12px] leading-tight ${cls}`}>
                  <div className="tabular-nums">{bin(m)}</div>
                  <div className={`text-[11px] ${m === cur ? "" : "text-ink-3"}`}>{setStr(m)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
