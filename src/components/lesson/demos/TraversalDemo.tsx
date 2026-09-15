"use client";

import { useMemo, useState } from "react";
import { BinaryTreeSVG, type BNode } from "./tree-utils";
import { StepHeader, StepFooter, Cells, CELL, BTN } from "./StepBar";

const TREE: BNode = {
  v: 4,
  l: { v: 2, l: { v: 1 }, r: { v: 3 } },
  r: { v: 6, l: { v: 5 }, r: { v: 7 } },
};

type Order = "pre" | "in" | "post" | "level";
const LABEL: Record<Order, string> = { pre: "前序", in: "中序", post: "後序", level: "層序" };

interface Step { desc: string; current: number | null; visited: number[]; aux: number[]; auxKind: "stack" | "queue" }

function buildSteps(order: Order): Step[] {
  const steps: Step[] = [];
  const visited: number[] = [];
  if (order === "level") {
    const q: BNode[] = [TREE];
    const snap = (desc: string, cur: number | null) => steps.push({ desc, current: cur, visited: [...visited], aux: q.map((n) => n.v as number), auxKind: "queue" });
    snap("層序走訪用佇列：先把根放進去。", null);
    while (q.length) {
      const n = q.shift()!;
      visited.push(n.v as number);
      const kids = [n.l, n.r].filter(Boolean) as BNode[];
      q.push(...kids);
      snap(`取出 ${n.v}，拜訪它${kids.length ? `，把子節點 ${kids.map((k) => k.v).join("、")} 放進佇列尾端` : ""}。`, n.v as number);
    }
    snap("佇列空了，走訪結束。同一層的節點一定在下一層之前被拜訪。", null);
    return steps;
  }
  const stack: number[] = [];
  const snap = (desc: string, cur: number | null) => steps.push({ desc, current: cur, visited: [...visited], aux: [...stack], auxKind: "stack" });
  snap(`${LABEL[order]}走訪是遞迴：${order === "pre" ? "先拜訪自己，再走左子樹，最後走右子樹" : order === "in" ? "先走左子樹，再拜訪自己，最後走右子樹" : "先走左子樹，再走右子樹，最後才拜訪自己"}。`, null);
  const go = (n: BNode | null | undefined) => {
    if (!n) return;
    stack.push(n.v as number);
    const visit = () => { visited.push(n.v as number); snap(`拜訪 ${n.v}。`, n.v as number); };
    if (order === "pre") visit();
    if (n.l) { snap(`進入 ${n.v} 的左子樹。`, n.v as number); go(n.l); }
    if (order === "in") visit();
    if (n.r) { snap(`進入 ${n.v} 的右子樹。`, n.v as number); go(n.r); }
    if (order === "post") visit();
    stack.pop();
    if (stack.length) snap(`${n.v} 處理完，回到 ${stack[stack.length - 1]}。`, stack[stack.length - 1]);
  };
  go(TREE);
  snap("走訪結束。", null);
  return steps;
}

export function TraversalDemo() {
  const [order, setOrder] = useState<Order>("in");
  const steps = useMemo(() => buildSteps(order), [order]);
  const [k, setK] = useState(0);
  const s = steps[Math.min(k, steps.length - 1)];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader
        k={k} total={steps.length} setK={setK}
        left={
          <div className="flex gap-1">
            {(Object.keys(LABEL) as Order[]).map((o) => (
              <button key={o} type="button" className={`${BTN} ${order === o ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface hover:bg-surface-2"}`} onClick={() => { setOrder(o); setK(() => 0); }}>{LABEL[o]}</button>
            ))}
          </div>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_200px]">
        <BinaryTreeSVG
          root={TREE}
          tone={(n) => (s.current === n.v ? "accent" : s.visited.includes(n.v as number) ? "ink" : s.aux.includes(n.v as number) ? "amber" : "none")}
        />
        <div className="flex flex-col gap-3 border-t border-line p-4 text-[13px] md:border-t-0 md:border-l">
          <div>
            <div className="eyebrow mb-1.5">{s.auxKind === "stack" ? "呼叫堆疊（底 → 頂）" : "佇列（前 → 後）"}</div>
            <Cells items={s.aux} tone={() => CELL.amber} w="w-8" />
          </div>
          <div>
            <div className="eyebrow mb-1.5">走訪順序</div>
            <div className="min-h-5 font-mono text-[13px] tracking-[0.04em]">{s.visited.length ? s.visited.join(" → ") : <span className="font-sans text-ink-3">尚未開始</span>}</div>
          </div>
        </div>
      </div>
      <StepFooter k={Math.min(k, steps.length - 1)} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
