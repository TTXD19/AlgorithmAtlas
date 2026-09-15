"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, Cells, CELL, BTN } from "./StepBar";

/** 八天的股價，找最長的一段「一路上漲」的子序列。 */
const NUMS = [3, 1, 4, 1, 5, 9, 2, 6];

type Mode = "dp" | "tails";
type Phase = "none" | "look" | "fill";

interface DpStep { desc: string; label: string; i: number; phase: Phase; dp: (number | null)[]; cands: number[]; best: number | null; lis: number[] }
interface TailStep { desc: string; label: string; i: number; phase: Phase; tails: number[]; src: number[]; pos: number | null; kind: "replace" | "append" | null }

function buildDp(): DpStep[] {
  const steps: DpStep[] = [];
  const dp: (number | null)[] = NUMS.map(() => null);
  const prev: number[] = NUMS.map(() => -1);
  const snap = (desc: string, label: string, i: number, phase: Phase, cands: number[] = [], best: number | null = null, lis: number[] = []) =>
    steps.push({ desc, label, i, phase, dp: [...dp], cands, best, lis });

  snap("定義狀態：dp[i] = 以 nums[i] 結尾的最長遞增子序列長度。base case 每一格都是 1（自己一個）。", "定義狀態", -1, "none");
  for (let i = 0; i < NUMS.length; i++) {
    const cands: number[] = [];
    let best = -1;
    for (let j = 0; j < i; j++) {
      if (NUMS[j] < NUMS[i]) {
        cands.push(j);
        if (best === -1 || (dp[j] as number) > (dp[best] as number)) best = j;
      }
    }
    if (i === 0) {
      dp[0] = 1;
      snap(`nums[0] = ${NUMS[0]}，前面沒有東西，dp[0] = 1。`, `i = 0`, 0, "fill");
      continue;
    }
    if (cands.length === 0) {
      snap(`nums[${i}] = ${NUMS[i]}：往前看所有 j < ${i}，沒有任何 nums[j] 比 ${NUMS[i]} 小，接不到任何人後面。`, `i = ${i}：找 j`, i, "look");
      dp[i] = 1;
      snap(`dp[${i}] = 1，只能自己開一段。`, `i = ${i}：填入`, i, "fill");
    } else {
      snap(
        `nums[${i}] = ${NUMS[i]}：往前看所有 j < ${i}，比它小的有 ${cands.map((j) => `nums[${j}]=${NUMS[j]}`).join("、")}（綠），可以接在它們後面。其中 dp 最大的是 j = ${best}（黃，dp = ${dp[best]}）。`,
        `i = ${i}：找 j`, i, "look", cands, best,
      );
      dp[i] = (dp[best] as number) + 1;
      prev[i] = best;
      snap(`dp[${i}] = dp[${best}] + 1 = ${dp[i]}。這一格要看前面所有 j，所以每格 O(n)，整體 O(n²)。`, `i = ${i}：填入`, i, "fill", [], best);
    }
  }
  let bestEnd = 0;
  for (let i = 1; i < NUMS.length; i++) if ((dp[i] as number) > (dp[bestEnd] as number)) bestEnd = i;
  const lis: number[] = [];
  for (let i: number = bestEnd; i !== -1; i = prev[i]) lis.push(i);
  lis.reverse();
  snap(
    `答案是 dp 裡的最大值 ${dp[bestEnd]}，不一定在最後一格。沿著「接在誰後面」往回走，就能拿到一條 LIS：${lis.map((i) => NUMS[i]).join(" → ")}（綠）。`,
    "回溯", NUMS.length, "none", [], null, lis,
  );
  return steps;
}

function buildTails(): TailStep[] {
  const steps: TailStep[] = [];
  const tails: number[] = [];
  const src: number[] = [];
  const snap = (desc: string, label: string, i: number, phase: Phase, pos: number | null = null, kind: "replace" | "append" | null = null) =>
    steps.push({ desc, label, i, phase, tails: [...tails], src: [...src], pos, kind });

  snap("換一個狀態：tails[k] = 長度為 k+1 的遞增子序列中，結尾最小的那個值。tails 一定嚴格遞增，所以可以二分搜尋。", "定義狀態", -1, "none");
  for (let i = 0; i < NUMS.length; i++) {
    const x = NUMS[i];
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < x) lo = mid + 1; else hi = mid;
    }
    if (lo === tails.length) {
      snap(`nums[${i}] = ${x}：二分搜尋 tails 裡第一個 ≥ ${x} 的位置。${tails.length ? `所有值都比 ${x} 小，` : "tails 是空的，"}位置在最尾端。`, `i = ${i}：二分搜尋`, i, "look", lo);
      const wasEmpty = tails.length === 0;
      tails.push(x);
      src.push(i);
      snap(
        wasEmpty
          ? `${x} 自己成為長度 1 的遞增子序列，tails 長度變成 1。`
          : `${x} 比所有結尾都大，可以接在最長的後面，tails 長度變成 ${tails.length}。`,
        `i = ${i}：接在尾端`, i, "fill", lo, "append",
      );
    } else {
      snap(`nums[${i}] = ${x}：二分搜尋 tails 裡第一個 ≥ ${x} 的位置，找到 tails[${lo}] = ${tails[lo]}（黃）。`, `i = ${i}：二分搜尋`, i, "look", lo);
      const old = tails[lo];
      tails[lo] = x;
      src[lo] = i;
      snap(
        old === x
          ? `tails[${lo}] 已經是 ${x}，換成自己等於沒換。長度 ${lo + 1} 的子序列結尾維持 ${x}。`
          : `tails[${lo}] 從 ${old} 換成 ${x}：長度 ${lo + 1} 的遞增子序列，結尾可以更小，以後更容易被接上。長度不變，仍是 ${tails.length}。`,
        `i = ${i}：取代`, i, "fill", lo, "replace",
      );
    }
  }
  const order = src.map((s) => `nums[${s}]`).join(", ");
  snap(
    `結束，LIS 長度 = tails 長度 = ${tails.length}。但 tails = [${tails.join(", ")}] 不是 LIS 本身：它們來自 ${order}，索引不是遞增的（${tails[1]} 出現在 ${tails[2]} 之後）。tails 只保證長度正確，要拿到序列本身得另外記前驅。每個元素一次二分搜尋，O(n log n)。`,
    "結束", NUMS.length, "none",
  );
  return steps;
}

export function LisDemo() {
  const dpSteps = useMemo(() => buildDp(), []);
  const tailSteps = useMemo(() => buildTails(), []);
  const [mode, setMode] = useState<Mode>("dp");
  const [k, setK] = useState(0);
  const total = mode === "dp" ? dpSteps.length : tailSteps.length;
  const switchMode = (m: Mode) => { setMode(m); setK(0); };
  const d = dpSteps[Math.min(k, dpSteps.length - 1)];
  const t = tailSteps[Math.min(k, tailSteps.length - 1)];
  const cur = mode === "dp" ? d : t;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader
        k={k}
        total={total}
        setK={setK}
        left={
          <div className="flex items-center gap-1.5">
            {(["dp", "tails"] as Mode[]).map((m) => (
              <button key={m} type="button" className={`${BTN} ${mode === m ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface hover:bg-surface-2"}`} onClick={() => switchMode(m)}>
                {m === "dp" ? "O(n²) DP 表" : "O(n log n) tails"}
              </button>
            ))}
            <span className="ml-1 font-mono text-[12.5px] text-ink">{cur.label}</span>
          </div>
        }
        right={`nums = [${NUMS.join(", ")}]`}
      />

      <div className="grid grid-cols-1 gap-3.5 p-3.5">
        <div>
          <div className="eyebrow mb-2">nums（股價）</div>
          <div className="flex gap-3">
            <div>
              <div className="mb-1 font-mono text-[10.5px] text-ink-3">i</div>
              <Cells items={NUMS.map((_, i) => i)} tone={() => CELL.dim} />
            </div>
            <div>
              <div className="mb-1 font-mono text-[10.5px] text-ink-3">nums[i]</div>
              {mode === "dp" ? (
                <Cells
                  items={NUMS}
                  tone={(i) => {
                    if (d.lis.includes(i)) return CELL.green;
                    if (i === d.i) return CELL.accent;
                    if (d.phase === "look" && i === d.best) return CELL.amber;
                    if (d.phase === "look" && d.cands.includes(i)) return CELL.green;
                    return i < d.i ? "" : CELL.dim;
                  }}
                />
              ) : (
                <Cells items={NUMS} tone={(i) => (i === t.i ? CELL.accent : i < t.i ? "" : CELL.dim)} />
              )}
            </div>
          </div>
        </div>

        {mode === "dp" ? (
          <div>
            <div className="eyebrow mb-2">dp[i]（以 nums[i] 結尾的 LIS 長度）</div>
            <div className="flex gap-3">
              <div>
                <div className="mb-1 font-mono text-[10.5px] text-ink-3">i</div>
                <Cells items={NUMS.map((_, i) => i)} tone={() => CELL.dim} />
              </div>
              <div>
                <div className="mb-1 font-mono text-[10.5px] text-ink-3">dp[i]</div>
                <Cells
                  items={d.dp.map((v) => (v === null ? "·" : v))}
                  tone={(i) => {
                    if (i === d.i && d.phase === "fill") return CELL.accent;
                    if (d.phase === "look" && i === d.best) return CELL.amber;
                    if (d.phase === "look" && d.cands.includes(i)) return CELL.green;
                    return d.dp[i] === null ? CELL.dim : "";
                  }}
                />
              </div>
            </div>
            <div className="mt-2 rounded-lg border border-line bg-surface-2 px-3 py-2 font-mono text-[13px] tabular-nums">
              {d.phase === "fill" && d.best !== null ? `dp[${d.i}] = dp[${d.best}] + 1 = ${d.dp[d.i]}` : "dp[i] = 1 + max(dp[j])，j < i 且 nums[j] < nums[i]"}
            </div>
          </div>
        ) : (
          <div>
            <div className="eyebrow mb-2">tails（長度 k+1 的遞增子序列，結尾最小值）</div>
            <div className="flex gap-3">
              <div>
                <div className="mb-1 font-mono text-[10.5px] text-ink-3">k</div>
                <Cells items={t.tails.map((_, i) => i)} tone={() => CELL.dim} empty="" />
              </div>
              <div>
                <div className="mb-1 font-mono text-[10.5px] text-ink-3">tails[k]</div>
                <Cells
                  items={t.tails}
                  tone={(i) => (i === t.pos ? (t.phase === "look" ? CELL.amber : CELL.accent) : "")}
                  empty="空"
                />
                {t.tails.length > 0 && (
                  <div className="mt-1 flex gap-1">
                    {t.src.map((s, i) => (
                      <span key={i} className="grid w-9 place-items-center font-mono text-[10px] text-ink-3">來自 {s}</span>
                    ))}
                  </div>
                )}
              </div>
              {t.phase === "look" && t.pos === t.tails.length && (
                <div>
                  <div className="mb-1 font-mono text-[10.5px] text-ink-3">&nbsp;</div>
                  <span className="grid h-8 w-9 place-items-center rounded-md border border-dashed border-amber text-[12px] text-amber">+</span>
                </div>
              )}
            </div>
            <div className="mt-2 rounded-lg border border-line bg-surface-2 px-3 py-2 font-mono text-[13px] tabular-nums">
              {t.phase === "none" ? "pos = lower_bound(tails, x)；pos == len ? append : tails[pos] = x" : t.pos !== null ? `x = ${NUMS[t.i]}，lower_bound → pos = ${t.pos}${t.kind === "append" ? "（append）" : t.kind === "replace" ? "（取代）" : ""}` : ""}
            </div>
            <div className="mt-1.5 text-[12px] text-ink-3">「來自」是那個值在 nums 裡的索引。索引不遞增，就代表 tails 不是一條真正的子序列。</div>
          </div>
        )}
      </div>

      <StepFooter k={k} total={total}>{cur.desc}</StepFooter>
    </div>
  );
}
