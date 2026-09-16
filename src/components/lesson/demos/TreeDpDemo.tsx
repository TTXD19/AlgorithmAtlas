"use client";

import { useMemo, useState } from "react";
import { BinaryTreeSVG, type BNode } from "./tree-utils";
import { StepHeader, StepFooter } from "./StepBar";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

/** 樹的直徑：任兩節點間最長路徑的邊數。這棵樹的直徑不經過根，是故意的。 */
const TREE: BNode = {
  v: "A",
  l: {
    v: "B",
    l: { v: "D", l: { v: "F" }, r: { v: "G", r: { v: "H" } } },
    r: { v: "E", r: { v: "I", r: { v: "J" } } },
  },
  r: { v: "C" },
};

const TEXT = demoText(
  {
    intro: "目標：找樹的直徑，也就是任兩節點之間最長路徑的邊數。後序走訪，每個節點在兩個子樹都算完之後才處理。",
    opStart: "開始",
    opEnd: "結束",
    leaf: (id: string) => `${id} 是葉節點，往下最長鏈 down = 0。`,
    back: (id: string, left: string, right: string) => `回到 ${id}：${left}；${right}。`,
    leftHas: (v: string, d: number, dl: number) => `左子樹 ${v} 往下鏈 ${d}，加上這條邊是 ${dl}`,
    leftNone: "沒有左子樹",
    rightHas: (v: string, d: number, dr: number) => `右子樹 ${v} 往下鏈 ${d}，加上這條邊是 ${dr}`,
    rightNone: "沒有右子樹",
    compute: (id: string, dl: number, dr: number, down: number, through: number, note: string) =>
      `${id} 的往下最長鏈 down = max(${dl}, ${dr}) = ${down}，這是回傳給父節點用的。經過 ${id} 的最長路徑 = 左 ${dl} + 右 ${dr} = ${through}，${note}`,
    noteUpdated: (best: number) => `超過目前答案，更新為 ${best}（綠色路徑）。`,
    noteKept: (best: number) => `沒有超過目前答案 ${best}。`,
    done: (best: number) =>
      `走訪結束，直徑 = ${best}。注意這條路徑沒有經過根 A：答案在某個節點「左右兩邊拼起來」的時候出現，所以每個節點都要嘗試更新全域答案，而不是只看根。每個節點處理一次，O(n)。`,
    headerNote: "樹的直徑 · 後序走訪，節點下方小字是 down",
    stateTitle: "狀態",
    curNode: "目前節點",
    none: "無",
    notYet: "尚未算",
    throughLabel: "經過此點",
    bestLabel: "全域答案",
    quantitiesTitle: "兩個量",
    downDesc: "：從此節點往下的最長鏈，回傳給父節點。",
    throughDesc: "：左鏈 + 右鏈拼起來，只用來更新全域答案，不回傳。",
    legend: "藍色是正在處理的節點，黃色是它的子節點，綠色是目前的直徑路徑。灰色還沒算。",
  },
  {
    en: {
      intro: "The goal is the diameter of the tree: the number of edges on the longest path between any two nodes. A post-order traversal handles each node only after both of its subtrees are finished.",
      opStart: "Start",
      opEnd: "Done",
      leaf: (id: string) => `${id} is a leaf, so its longest downward chain is down = 0.`,
      back: (id: string, left: string, right: string) => `Back at ${id}: ${left}; ${right}.`,
      leftHas: (v: string, d: number, dl: number) => `the left subtree ${v} has a downward chain of ${d}, which is ${dl} once this edge is added`,
      leftNone: "there is no left subtree",
      rightHas: (v: string, d: number, dr: number) => `the right subtree ${v} has a downward chain of ${d}, which is ${dr} once this edge is added`,
      rightNone: "there is no right subtree",
      compute: (id: string, dl: number, dr: number, down: number, through: number, note: string) =>
        `The longest downward chain from ${id} is down = max(${dl}, ${dr}) = ${down}, and that is the value returned to the parent. The longest path through ${id} is left ${dl} + right ${dr} = ${through}, ${note}`,
      noteUpdated: (best: number) => `which beats the current answer, so it becomes ${best} (the green path).`,
      noteKept: (best: number) => `which does not beat the current answer of ${best}.`,
      done: (best: number) =>
        `The traversal is over and the diameter is ${best}. Notice that this path never passes through the root A: the answer turns up where some node joins its left and right chains, so every node has to try to update the global answer, not just the root. Each node is handled exactly once, so O(n).`,
      headerNote: "Tree diameter, post-order. The small text under each node is down",
      stateTitle: "State",
      curNode: "Current node",
      none: "none",
      notYet: "not yet",
      throughLabel: "Through this node",
      bestLabel: "Global answer",
      quantitiesTitle: "The two quantities",
      downDesc: ": the longest chain going down from this node, returned to the parent.",
      throughDesc: ": the left chain joined to the right chain. It only updates the global answer and is never returned.",
      legend: "Blue is the node being processed, amber marks its children, and green is the current diameter path. Grey nodes have not been computed yet.",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

interface Step {
  desc: string;
  op: string;
  down: Record<string, number>;
  cur: string | null;
  kids: string[];
  best: number;
  bestPath: string[];
  through: number | null;
  updated: boolean;
}

function buildSteps(t: T): Step[] {
  const steps: Step[] = [];
  const down: Record<string, number> = {};
  let best = 0;
  let bestPath: string[] = [];
  const snap = (desc: string, op: string, cur: string | null, kids: string[] = [], through: number | null = null, updated = false) =>
    steps.push({ desc, op, down: { ...down }, cur, kids, best, bestPath: [...bestPath], through, updated });

  snap(t.intro, t.opStart, null);

  // 回傳從此節點往下的最長鏈（節點序列，含自己）
  const dfs = (n: BNode): string[] => {
    const id = String(n.v);
    const chainL = n.l ? dfs(n.l) : [];
    const chainR = n.r ? dfs(n.r) : [];
    if (!n.l && !n.r) {
      down[id] = 0;
      snap(t.leaf(id), `visit(${id})`, id);
      return [id];
    }
    const dl = n.l ? down[String(n.l.v)] + 1 : 0;
    const dr = n.r ? down[String(n.r.v)] + 1 : 0;
    const kids = [n.l, n.r].filter((c): c is BNode => !!c).map((c) => String(c.v));
    snap(
      t.back(
        id,
        n.l ? t.leftHas(String(n.l.v), down[String(n.l.v)], dl) : t.leftNone,
        n.r ? t.rightHas(String(n.r.v), down[String(n.r.v)], dr) : t.rightNone,
      ),
      `visit(${id})`,
      id,
      kids,
    );
    down[id] = Math.max(dl, dr);
    const through = dl + dr;
    const path = [...chainL.slice().reverse(), id, ...chainR];
    const updated = through > best;
    if (updated) {
      best = through;
      bestPath = path;
    }
    const note = updated ? t.noteUpdated(best) : t.noteKept(best);
    snap(t.compute(id, dl, dr, down[id], through, note), `visit(${id})`, id, kids, through, updated);
    const longer = dl >= dr ? chainL : chainR;
    return [id, ...longer];
  };
  dfs(TREE);
  snap(t.done(best), t.opEnd, null, [], null, true);
  return steps;
}

export function TreeDpDemo() {
  const t = TEXT[useLocale()];
  const steps = useMemo(() => buildSteps(t), [t]);
  const [k, setK] = useState(0);
  const s = steps[k];
  const pathSet = new Set(s.bestPath);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={t.headerNote} />
      <div className="grid grid-cols-1 gap-3 p-3.5 md:grid-cols-[minmax(0,1fr)_200px] md:items-start">
        <BinaryTreeSVG
          root={TREE}
          height={26 + 5 * 56}
          tone={(n) => {
            const id = String(n.v);
            if (id === s.cur) return "accent";
            if (s.kids.includes(id)) return "amber";
            if (pathSet.has(id)) return "green";
            return id in s.down ? "none" : "dim";
          }}
          sub={(n) => {
            const id = String(n.v);
            return id in s.down ? `down=${s.down[id]}` : "";
          }}
        />
        <div className="text-[13px] text-ink-2">
          <div className="eyebrow mb-1.5">{t.stateTitle}</div>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-[12.5px]">
            <span className="text-ink-3">{t.curNode}</span><span>{s.cur ?? t.none}</span>
            <span className="text-ink-3">down</span><span>{s.cur && s.cur in s.down ? s.down[s.cur] : t.notYet}</span>
            <span className="text-ink-3">{t.throughLabel}</span><span>{s.through ?? t.none}</span>
            <span className="text-ink-3">{t.bestLabel}</span><span className="text-ink">{s.best}</span>
          </div>
          <div className="eyebrow mt-3 mb-1.5">{t.quantitiesTitle}</div>
          <p className="m-0 text-[12.5px]"><span className="font-mono">down</span>{t.downDesc}</p>
          <p className="mt-1 mb-0 text-[12.5px]"><span className="font-mono">through</span>{t.throughDesc}</p>
          <p className="mt-3 mb-0 text-[12px] text-ink-3">{t.legend}</p>
        </div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
