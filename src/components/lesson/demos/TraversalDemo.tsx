"use client";

import { useMemo, useState } from "react";
import { useLocale, useT } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { BinaryTreeSVG, type BNode } from "./tree-utils";
import { StepHeader, StepFooter, Cells, CELL, BTN } from "./StepBar";

const TREE: BNode = {
  v: 4,
  l: { v: 2, l: { v: 1 }, r: { v: 3 } },
  r: { v: 6, l: { v: 5 }, r: { v: 7 } },
};

type Order = "pre" | "in" | "post" | "level";

const TEXT = demoText(
  {
    sep: "、",
    orderPre: "前序",
    orderIn: "中序",
    orderPost: "後序",
    orderLevel: "層序",
    levelIntro: "層序走訪用佇列：先把根放進去。",
    levelTake: (v: number, kids: string) =>
      kids ? `取出 ${v}，拜訪它，把子節點 ${kids} 放進佇列尾端。` : `取出 ${v}，拜訪它。`,
    levelEnd: "佇列空了，走訪結束。同一層的節點一定在下一層之前被拜訪。",
    recIntro: (label: string, order: Order) =>
      `${label}走訪是遞迴：${order === "pre" ? "先拜訪自己，再走左子樹，最後走右子樹" : order === "in" ? "先走左子樹，再拜訪自己，最後走右子樹" : "先走左子樹，再走右子樹，最後才拜訪自己"}。`,
    visit: (v: number) => `拜訪 ${v}。`,
    enterLeft: (v: number) => `進入 ${v} 的左子樹。`,
    enterRight: (v: number) => `進入 ${v} 的右子樹。`,
    back: (v: number, parent: number) => `${v} 處理完，回到 ${parent}。`,
    end: "走訪結束。",
    stackTitle: "呼叫堆疊（底 → 頂）",
    queueTitle: "佇列（前 → 後）",
    notStarted: "尚未開始",
  },
  {
    en: {
      sep: ", ",
      orderPre: "Pre-order",
      orderIn: "In-order",
      orderPost: "Post-order",
      orderLevel: "Level-order",
      levelIntro: "Level-order traversal uses a queue: start by putting the root in.",
      levelTake: (v: number, kids: string) =>
        kids ? `Take ${v} out and visit it, then add its children ${kids} to the back of the queue.` : `Take ${v} out and visit it.`,
      levelEnd: "The queue is empty and the traversal is over. Every node on one level is always visited before any node on the next.",
      recIntro: (label: string, order: Order) =>
        `${label} traversal is recursive: ${order === "pre" ? "visit the node itself first, then walk the left subtree, then the right" : order === "in" ? "walk the left subtree first, then visit the node itself, then walk the right subtree" : "walk the left subtree, then the right subtree, and only then visit the node itself"}.`,
      visit: (v: number) => `Visit ${v}.`,
      enterLeft: (v: number) => `Descend into the left subtree of ${v}.`,
      enterRight: (v: number) => `Descend into the right subtree of ${v}.`,
      back: (v: number, parent: number) => `${v} is finished, so return to ${parent}.`,
      end: "The traversal is over.",
      stackTitle: "Call stack (bottom → top)",
      queueTitle: "Queue (front → back)",
      notStarted: "Not started yet",
    },
  },
);

type Dict = (typeof TEXT)["zh-Hant"];

const labelsOf = (t: Dict): Record<Order, string> => ({ pre: t.orderPre, in: t.orderIn, post: t.orderPost, level: t.orderLevel });

interface Step { desc: string; current: number | null; visited: number[]; aux: number[]; auxKind: "stack" | "queue" }

function buildSteps(t: Dict, order: Order): Step[] {
  const steps: Step[] = [];
  const visited: number[] = [];
  if (order === "level") {
    const q: BNode[] = [TREE];
    const snap = (desc: string, cur: number | null) => steps.push({ desc, current: cur, visited: [...visited], aux: q.map((n) => n.v as number), auxKind: "queue" });
    snap(t.levelIntro, null);
    while (q.length) {
      const n = q.shift()!;
      visited.push(n.v as number);
      const kids = [n.l, n.r].filter(Boolean) as BNode[];
      q.push(...kids);
      snap(t.levelTake(n.v as number, kids.map((k) => k.v).join(t.sep)), n.v as number);
    }
    snap(t.levelEnd, null);
    return steps;
  }
  const stack: number[] = [];
  const snap = (desc: string, cur: number | null) => steps.push({ desc, current: cur, visited: [...visited], aux: [...stack], auxKind: "stack" });
  snap(t.recIntro(labelsOf(t)[order], order), null);
  const go = (n: BNode | null | undefined) => {
    if (!n) return;
    stack.push(n.v as number);
    const visit = () => { visited.push(n.v as number); snap(t.visit(n.v as number), n.v as number); };
    if (order === "pre") visit();
    if (n.l) { snap(t.enterLeft(n.v as number), n.v as number); go(n.l); }
    if (order === "in") visit();
    if (n.r) { snap(t.enterRight(n.v as number), n.v as number); go(n.r); }
    if (order === "post") visit();
    stack.pop();
    if (stack.length) snap(t.back(n.v as number, stack[stack.length - 1]), stack[stack.length - 1]);
  };
  go(TREE);
  snap(t.end, null);
  return steps;
}

export function TraversalDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const ui = useT();
  const LABEL = labelsOf(t);
  const [order, setOrder] = useState<Order>("in");
  const steps = useMemo(() => buildSteps(TEXT[locale], order), [locale, order]);
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
            <div className="eyebrow mb-1.5">{s.auxKind === "stack" ? t.stackTitle : t.queueTitle}</div>
            <Cells items={s.aux} tone={() => CELL.amber} w="w-8" />
          </div>
          <div>
            <div className="eyebrow mb-1.5">{ui.demo.order}</div>
            <div className="min-h-5 font-mono text-[13px] tracking-[0.04em]">{s.visited.length ? s.visited.join(" → ") : <span className="font-sans text-ink-3">{t.notStarted}</span>}</div>
          </div>
        </div>
      </div>
      <StepFooter k={Math.min(k, steps.length - 1)} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
