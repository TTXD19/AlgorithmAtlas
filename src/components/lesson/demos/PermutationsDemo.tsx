"use client";

import { useMemo, useState } from "react";
import { ForestSVG, type GNode } from "./tree-utils";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

const NUMS = [1, 2, 3];

/** 節點 id 就是目前路徑，排列樹上每條路徑都不同 */
function buildTree(path: number[]): GNode {
  const node: GNode = { id: path.join(""), label: path.length ? path.join("") : "∅", children: [] };
  for (const x of NUMS) if (!path.includes(x)) node.children.push(buildTree([...path, x]));
  return node;
}
const TREE = buildTree([]);

interface Step { desc: string; op: string; path: number[]; used: boolean[]; found: string[]; cur: string; done: string[]; trying?: number; fresh?: boolean }

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const path: number[] = [];
  const used: boolean[] = NUMS.map(() => false);
  const found: string[] = [];
  const done: string[] = [];
  const snap = (desc: string, op: string, extra: Partial<Step> = {}) =>
    steps.push({ desc, op, path: [...path], used: [...used], found: [...found], cur: path.join(""), done: [...done], ...extra });

  snap(`排列要決定「每個位置放誰」。每一層從還沒用過的數字裡挑一個放進路徑，used 陣列記錄誰已經在路徑上。`, "開始");
  const dfs = () => {
    if (path.length === NUMS.length) {
      const label = `[${path.join(",")}]`;
      found.push(label);
      done.push(path.join(""));
      snap(`路徑填滿 ${NUMS.length} 個位置，得到一個排列 ${label}。收進答案，回到上一層。`, `收集 ${label}`, { fresh: true });
      return;
    }
    const skipped: number[] = [];
    for (let j = 0; j < NUMS.length; j++) {
      if (used[j]) { skipped.push(NUMS[j]); continue; }
      used[j] = true;
      path.push(NUMS[j]);
      snap(
        `第 ${path.length} 層：${skipped.length ? `${skipped.join("、")} 已用過，跳過。` : ""}選 ${NUMS[j]}，used[${j}] 設為 true，往下一層。`,
        `選 ${NUMS[j]}`,
        { trying: j },
      );
      dfs();
      path.pop();
      used[j] = false;
      snap(`撤銷：把 ${NUMS[j]} 從路徑拿掉，used[${j}] 設回 false。同一層的下一個候選才能接著試。`, `撤銷 ${NUMS[j]}`, { trying: j });
      skipped.length = 0;
    }
    done.push(path.join(""));
  };
  dfs();
  snap(`6 個葉節點就是 3! = 6 個排列。第一層有 n 個選擇、第二層 n−1 個……葉節點共 n! 個，每個要複製 O(n)，所以 O(n!·n)。`, "結束");
  return steps;
}

export function PermutationsDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right="nums = [1, 2, 3] · 每層從沒用過的數字裡挑" />
      <ForestSVG
        roots={[TREE]}
        height={24 + 4 * 52}
        tone={(n) => (n.id === s.cur ? (s.fresh ? "green" : "accent") : s.done.includes(n.id) ? "dim" : "none")}
      />
      <div className="grid grid-cols-1 gap-3.5 border-t border-line p-3.5 md:grid-cols-[auto_auto_auto_minmax(0,1fr)]">
        <div>
          <div className="eyebrow mb-1.5">nums</div>
          <Cells items={NUMS} tone={(i) => (i === s.trying ? CELL.accent : s.used[i] ? CELL.dim : "")} />
        </div>
        <div>
          <div className="eyebrow mb-1.5">used</div>
          <Cells items={s.used.map((u) => (u ? "T" : "F"))} tone={(i) => (s.used[i] ? CELL.amber : "")} />
        </div>
        <div>
          <div className="eyebrow mb-1.5">目前路徑</div>
          <Cells items={s.path} tone={() => CELL.amber} empty="空" />
        </div>
        <div>
          <div className="eyebrow mb-1.5">已收集的排列（{s.found.length}/6）</div>
          <div className="flex flex-wrap gap-1 font-mono text-[12.5px]">
            {s.found.map((f, i) => (
              <span key={f} className={`rounded-md border px-1.5 leading-7 ${i === s.found.length - 1 && s.fresh ? "border-green bg-green-soft text-green" : "border-line bg-surface-2 text-ink-2"}`}>{f}</span>
            ))}
            {s.found.length === 0 && <span className="text-ink-3">還沒有</span>}
          </div>
        </div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
