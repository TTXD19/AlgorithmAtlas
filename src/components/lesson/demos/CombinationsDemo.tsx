"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

/** Combination Sum：candidates 已排序，每個數可以重複使用 */
const CAND = [2, 3, 6, 7];
const TARGET = 7;

interface Frame { start: number; remain: number }
interface Step { desc: string; op: string; path: number[]; frames: Frame[]; found: string[]; i: number; kind: "pick" | "undo" | "prune" | "found" | "none" }

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const path: number[] = [];
  const frames: Frame[] = [];
  const found: string[] = [];
  const snap = (desc: string, op: string, i: number, kind: Step["kind"]) =>
    steps.push({ desc, op, path: [...path], frames: frames.map((f) => ({ ...f })), found: [...found], i, kind });

  snap(`目標湊出 ${TARGET}。每層從 start 開始往右挑（不回頭挑左邊的，避免 [2,3] 和 [3,2] 算兩次），remain 記錄還差多少。`, "開始", -1, "none");
  const dfs = (start: number, remain: number) => {
    frames.push({ start, remain });
    if (remain === 0) {
      const label = `[${path.join(",")}]`;
      found.push(label);
      snap(`remain 歸零，路徑 ${label} 剛好湊到 ${TARGET}。收進答案，回到上一層。`, `找到 ${label}`, -1, "found");
      frames.pop();
      return;
    }
    for (let i = start; i < CAND.length; i++) {
      if (CAND[i] > remain) {
        snap(`剪枝：candidates[${i}] = ${CAND[i]} 已經大於 remain = ${remain}。因為陣列已排序，右邊只會更大，整個 for 迴圈直接 break。`, `剪枝 ${CAND[i]} > ${remain}`, i, "prune");
        break;
      }
      path.push(CAND[i]);
      snap(`選 ${CAND[i]}，remain 變成 ${remain - CAND[i]}。下一層的 start 仍是 ${i}，因為同一個數可以重複用。`, `選 ${CAND[i]}`, i, "pick");
      dfs(i, remain - CAND[i]);
      path.pop();
      snap(`撤銷：把 ${CAND[i]} 拿掉，remain 回到 ${remain}，換下一個候選 ${i + 1 < CAND.length ? `candidates[${i + 1}] = ${CAND[i + 1]}` : "（沒有了）"}。`, `撤銷 ${CAND[i]}`, i, "undo");
    }
    frames.pop();
  };
  dfs(0, TARGET);
  snap(`搜尋結束，答案 ${found.join("、")}。沒有排序與剪枝的話，每一層都會把 start 之後的候選全部試完，樹會大很多。`, "結束", -1, "none");
  return steps;
}

export function CombinationsDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];
  const top = s.frames[s.frames.length - 1];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={`candidates = [${CAND.join(", ")}] · target = ${TARGET}`} />
      <div className="grid grid-cols-1 gap-3.5 p-3.5 md:grid-cols-[auto_auto_minmax(0,1fr)]">
        <div>
          <div className="eyebrow mb-1.5">candidates（start = {top ? top.start : 0}）</div>
          <Cells items={CAND} tone={(i) => (i === s.i ? (s.kind === "prune" ? CELL.amber : CELL.accent) : top && i < top.start ? CELL.dim : "")} />
          <div className="mt-1.5 text-[12px] text-ink-3">灰色是 start 左邊，這一層不再考慮</div>
        </div>
        <div>
          <div className="eyebrow mb-1.5">目前路徑（remain = {top ? top.remain : TARGET}）</div>
          <Cells items={s.path} tone={() => (s.kind === "found" ? CELL.green : CELL.amber)} empty="空" />
        </div>
        <div>
          <div className="eyebrow mb-1.5">已找到的組合</div>
          <div className="flex flex-wrap gap-1 font-mono text-[12.5px]">
            {s.found.map((f, i) => (
              <span key={f} className={`rounded-md border px-1.5 leading-7 ${i === s.found.length - 1 && s.kind === "found" ? "border-green bg-green-soft text-green" : "border-line bg-surface-2 text-ink-2"}`}>{f}</span>
            ))}
            {s.found.length === 0 && <span className="text-ink-3">還沒有</span>}
          </div>
        </div>
      </div>
      <div className="border-t border-line px-3.5 py-3">
        <div className="eyebrow mb-1.5">遞迴堆疊（每一層的 start 與 remain，右邊是最深的一層）</div>
        <div className="flex flex-wrap gap-1 font-mono text-[12px]">
          {s.frames.map((f, i) => (
            <span key={i} className={`rounded-md border px-2 leading-7 ${i === s.frames.length - 1 ? (s.kind === "prune" ? "border-amber bg-amber-soft text-amber" : "border-accent bg-accent text-accent-ink") : "border-line bg-surface-2 text-ink-2"}`}>
              dfs(start={f.start}, remain={f.remain})
            </span>
          ))}
          {s.frames.length === 0 && <span className="text-ink-3">空</span>}
        </div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
