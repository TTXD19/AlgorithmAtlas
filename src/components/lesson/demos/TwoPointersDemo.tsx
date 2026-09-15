"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, BTN } from "./StepBar";

/** 對撞指標：有序陣列兩數之和（LeetCode 167） */
const SUM_DATA = [2, 3, 5, 8, 11, 14, 17, 21];
const TARGET = 25;
/** 同向指標：移除有序陣列的重複（LeetCode 26） */
const DUP_DATA = [1, 1, 2, 2, 2, 3, 5, 5, 6, 6];

type Mode = "sum" | "dedup";
interface Step { desc: string; l: number; r: number; arr: number[]; found?: [number, number]; dead: number[]; write?: number }

/** 資料裡若還有別的一對也等於目標，順便說明對撞指標只回傳先夾到的那一對。 */
function otherPair(l: number, r: number): string {
  for (let i = 0; i < SUM_DATA.length; i++) {
    for (let j = i + 1; j < SUM_DATA.length; j++) {
      if (SUM_DATA[i] + SUM_DATA[j] === TARGET && !(i === l && j === r)) {
        return `（${SUM_DATA[i]} + ${SUM_DATA[j]} 也等於 ${TARGET}，對撞指標回傳的是先夾到的那一對。）`;
      }
    }
  }
  return "";
}

function buildSum(): Step[] {
  const steps: Step[] = [{ desc: `陣列已排序，要找兩數相加等於 ${TARGET}。左指標 l 放最小值，右指標 r 放最大值。`, l: 0, r: SUM_DATA.length - 1, arr: SUM_DATA, dead: [] }];
  const dead: number[] = [];
  let l = 0, r = SUM_DATA.length - 1;
  while (l < r) {
    const sum = SUM_DATA[l] + SUM_DATA[r];
    if (sum === TARGET) {
      steps.push({ desc: `${SUM_DATA[l]} + ${SUM_DATA[r]} = ${sum}，等於 ${TARGET}，回傳索引 [${l}, ${r}]。總共比了 ${steps.length} 次，暴力列舉最多要看 ${(SUM_DATA.length * (SUM_DATA.length - 1)) / 2} 對。${otherPair(l, r)}`, l, r, arr: SUM_DATA, found: [l, r], dead: [...dead] });
      return steps;
    }
    if (sum < TARGET) {
      dead.push(l);
      steps.push({ desc: `${SUM_DATA[l]} + ${SUM_DATA[r]} = ${sum} < ${TARGET}，太小。${SUM_DATA[r]} 已經是剩下最大的，${SUM_DATA[l]} 配誰都不夠，${SUM_DATA[l]} 可以永遠淘汰，l 往右。`, l, r, arr: SUM_DATA, dead: [...dead] });
      l++;
    } else {
      dead.push(r);
      steps.push({ desc: `${SUM_DATA[l]} + ${SUM_DATA[r]} = ${sum} > ${TARGET}，太大。${SUM_DATA[l]} 已經是剩下最小的，${SUM_DATA[r]} 配誰都太大，${SUM_DATA[r]} 可以永遠淘汰，r 往左。`, l, r, arr: SUM_DATA, dead: [...dead] });
      r--;
    }
  }
  steps.push({ desc: "指標相遇，沒有答案。", l, r, arr: SUM_DATA, dead: [...dead] });
  return steps;
}

function buildDedup(): Step[] {
  const arr = [...DUP_DATA];
  const steps: Step[] = [{ desc: "慢指標 w 是「下一個要寫入的位置」，快指標 r 負責往前讀。arr[0] 一定保留，所以 w 從 1 開始、r 也從 1 開始。", l: 1, r: 1, arr: [...arr], dead: [], write: 1 }];
  let w = 1;
  for (let r = 1; r < arr.length; r++) {
    if (arr[r] !== arr[w - 1]) {
      arr[w] = arr[r];
      steps.push({ desc: `arr[${r}] = ${arr[r]} 和上一個保留的 ${arr[w - 1]} 不同，是新值：寫到 arr[${w}]，w 變成 ${w + 1}。`, l: w + 1, r, arr: [...arr], dead: [], write: w + 1 });
      w++;
    } else {
      steps.push({ desc: `arr[${r}] = ${arr[r]} 和上一個保留的 ${arr[w - 1]} 相同，是重複：r 往前，w 不動。`, l: w, r, arr: [...arr], dead: [], write: w });
    }
  }
  steps.push({ desc: `r 走到底。前 w = ${w} 格就是去重後的結果，後面的內容不重要。原地完成，O(n) 時間、O(1) 額外空間。`, l: w, r: arr.length, arr: [...arr], dead: [], write: w });
  return steps;
}

export function TwoPointersDemo() {
  const sum = useMemo(() => buildSum(), []);
  const dedup = useMemo(() => buildDedup(), []);
  const [mode, setMode] = useState<Mode>("sum");
  const [k, setK] = useState(0);
  const steps = mode === "sum" ? sum : dedup;
  const s = steps[k];
  const isSum = mode === "sum";

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader
        k={k}
        total={steps.length}
        setK={setK}
        left={
          <div className="flex gap-1">
            {(["sum", "dedup"] as Mode[]).map((m) => (
              <button key={m} type="button" className={`${BTN} ${mode === m ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface hover:bg-surface-2"}`} onClick={() => { setMode(m); setK(0); }}>
                {m === "sum" ? "對撞：兩數之和" : "同向：移除重複"}
              </button>
            ))}
          </div>
        }
        right={isSum ? `目標 ${TARGET} · 已排序` : "原地去重 · 已排序"}
      />

      <div className="overflow-x-auto p-3.5">
        <div className="eyebrow mb-2">{isSum ? "有序陣列" : "陣列（會被原地改寫）"}</div>
        <div className="flex gap-1">
          {s.arr.map((v, i) => {
            const tone = isSum
              ? s.found && (i === s.found[0] || i === s.found[1])
                ? "border-green bg-green-soft text-green"
                : i === s.l || i === s.r
                  ? "border-accent bg-accent text-accent-ink"
                  : s.dead.includes(i) ? "border-line bg-surface-2 text-ink-3 line-through" : "border-line-strong bg-surface"
              : i === s.r && i < s.arr.length
                ? "border-amber bg-amber-soft text-amber"
                : i < (s.write ?? 0)
                  ? "border-green bg-green-soft text-green"
                  : "border-line-strong bg-surface";
            return (
              <div key={i} className="flex w-10 flex-col items-center gap-1">
                <span className={`grid h-8 w-10 place-items-center rounded-md border font-mono text-[13px] tabular-nums ${tone}`}>{v}</span>
                <span className="font-mono text-[10.5px] text-ink-3">{i}</span>
                <div className="flex h-4 gap-0.5">
                  {isSum && s.l === i && <span className="rounded bg-accent-soft px-1 font-mono text-[10px] leading-4 text-ink">l</span>}
                  {isSum && s.r === i && <span className="rounded bg-accent-soft px-1 font-mono text-[10px] leading-4 text-ink">r</span>}
                  {!isSum && s.l === i && <span className="rounded bg-green-soft px-1 font-mono text-[10px] leading-4 text-green">w</span>}
                  {!isSum && s.r === i && <span className="rounded bg-amber-soft px-1 font-mono text-[10px] leading-4 text-amber">r</span>}
                </div>
              </div>
            );
          })}
          {!isSum && s.r === s.arr.length && (
            <div className="flex w-10 flex-col items-center gap-1">
              <span className="grid h-8 w-10 place-items-center rounded-md border border-dashed border-line-strong font-mono text-[11px] text-ink-3">end</span>
              <span className="font-mono text-[10.5px] text-ink-3">{s.arr.length}</span>
              <div className="flex h-4"><span className="rounded bg-amber-soft px-1 font-mono text-[10px] leading-4 text-amber">r</span></div>
            </div>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[12.5px] tabular-nums">
          {isSum ? (
            <>
              <span>l = <span className="text-ink">{s.l}</span>，r = <span className="text-ink">{s.r}</span></span>
              <span>a[l] + a[r] = <span className="text-ink">{s.l < s.r ? s.arr[s.l] + s.arr[s.r] : "…"}</span></span>
              <span>目標 {TARGET}</span>
              {s.found && <span className="text-green">找到 [{s.found[0]}, {s.found[1]}]</span>}
            </>
          ) : (
            <>
              <span>w = <span className="text-ink">{s.l}</span>，r = <span className="text-ink">{s.r}</span></span>
              <span>已保留 <span className="text-ink">{s.arr.slice(0, s.write ?? 0).join(", ") || "…"}</span></span>
            </>
          )}
        </div>
        <p className="mt-2 mb-0 text-[12px] text-ink-3">
          {isSum ? "劃掉的格子已被證明不可能是答案的一部分，之後不會再看。" : "綠色是已寫好的去重結果（arr[0..w)），黃色是 r 正在讀的格子。"}
        </p>
      </div>

      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
