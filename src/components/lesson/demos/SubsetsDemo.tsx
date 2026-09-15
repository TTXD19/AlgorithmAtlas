"use client";

import { useMemo, useState } from "react";
import { ForestSVG, type GNode } from "./tree-utils";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

const NUMS = [1, 2, 3];

/** 決策樹的節點 id：深度 + 目前路徑，唯一決定樹上的位置 */
const keyOf = (depth: number, path: number[]) => `${depth}:${path.join("")}`;

/** 先把整棵決策樹建好：左子樹是「選 nums[depth]」，右子樹是「不選」 */
function buildTree(depth: number, path: number[]): GNode {
  const node: GNode = { id: keyOf(depth, path), label: path.length ? path.join("") : "∅", children: [] };
  if (depth < NUMS.length) {
    node.children.push(buildTree(depth + 1, [...path, NUMS[depth]]));
    node.children.push(buildTree(depth + 1, path));
  }
  return node;
}
const TREE = buildTree(0, []);

const TOTAL = 1 << NUMS.length;

interface Step { desc: string; op: string; i: number; path: number[]; found: string[]; cur: string; done: string[]; fresh?: boolean; end?: boolean }

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const path: number[] = [];
  const found: string[] = [];
  const done: string[] = [];
  const snap = (desc: string, op: string, i: number, fresh = false) =>
    steps.push({ desc, op, i, path: [...path], found: [...found], cur: keyOf(i, path), done: [...done], fresh });
  const show = () => `[${path.join(", ")}]`;
  /** 往下一層要做什麼：還有元素就決定 nums[i+1]，否則到了終止條件 */
  const next = (i: number) =>
    i + 1 < NUMS.length ? `往下一層決定 nums[${i + 1}] = ${NUMS[i + 1]}` : `往下一層到 i = ${NUMS.length}（終止條件）`;

  snap(`對 ${NUMS.length} 個元素逐一決定「選」或「不選」。每往下一層決定一個元素，走到底就得到一個子集。`, "開始", 0);
  const dfs = (i: number) => {
    if (i === NUMS.length) {
      const label = path.length ? `{${path.join(",")}}` : "∅";
      found.push(label);
      done.push(keyOf(i, path));
      snap(`i = ${NUMS.length}，${NUMS.length} 個元素都決定完了，路徑就是一個子集：${label}。複製一份收進答案，然後返回。`, `收集 ${label}`, i, true);
      return;
    }
    path.push(NUMS[i]);
    snap(`做選擇：把 ${NUMS[i]} 放進路徑，路徑變成 ${show()}，${next(i)}。`, `選 ${NUMS[i]}`, i + 1);
    dfs(i + 1);
    path.pop();
    snap(`回到決定 nums[${i}] 的這一層，撤銷選擇：把 ${NUMS[i]} 從路徑拿掉，路徑回到 ${show()}，和剛進入這一層時一樣。接著試另一條路：不選 ${NUMS[i]}。`, `撤銷 ${NUMS[i]}`, i);
    snap(`不放 ${NUMS[i]}，路徑維持 ${show()}，${next(i)}。`, `不選 ${NUMS[i]}`, i + 1);
    dfs(i + 1);
    done.push(keyOf(i, path));
  };
  dfs(0);
  steps.push({
    desc: `每一層的兩條路都走完，dfs(0) 結束。${TOTAL} 個葉節點（綠色）就是 2³ = ${TOTAL} 個子集，每個子集恰好出現一次。決策樹有 2ⁿ 個葉，收集每個要複製 O(n)，所以 O(2ⁿ·n)。`,
    op: "結束", i: NUMS.length, path: [], found: [...found], cur: "", done: [...done], end: true,
  });
  return steps;
}

export function SubsetsDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right="nums = [1, 2, 3] · 左邊：選，右邊：不選" />
      <ForestSVG
        roots={[TREE]}
        height={24 + 4 * 52}
        tone={(n, depth) => (s.end ? (depth === NUMS.length ? "green" : "dim") : n.id === s.cur ? (s.fresh ? "green" : "accent") : s.done.includes(n.id) ? "dim" : "none")}
        sub={(n, depth) => (depth === 0 ? "" : n.label.endsWith(String(NUMS[depth - 1])) ? `選 ${NUMS[depth - 1]}` : `不選 ${NUMS[depth - 1]}`)}
      />
      <div className="grid grid-cols-1 gap-3.5 border-t border-line p-3.5 md:grid-cols-[auto_auto_minmax(0,1fr)]">
        <div>
          <div className="eyebrow mb-1.5">nums（i = {Math.min(s.i, NUMS.length)}）</div>
          <Cells items={NUMS} tone={(i) => (i === s.i ? CELL.accent : i < s.i ? CELL.dim : "")} />
        </div>
        <div>
          <div className="eyebrow mb-1.5">目前路徑</div>
          <Cells items={s.path} tone={() => CELL.amber} empty="空" />
        </div>
        <div>
          <div className="eyebrow mb-1.5">已收集的子集（{s.found.length}/{TOTAL}）</div>
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
