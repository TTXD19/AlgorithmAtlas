"use client";

import { useMemo, useState } from "react";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { ForestSVG, type GNode } from "./tree-utils";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

const TEXT = demoText(
  {
    listSeparator: "、",
    opStart: "開始",
    opEnd: "結束",
    init: (n: number) => `一開始每個節點自成一群，parent[i] = i，也就是 ${n} 棵只有根的樹。`,
    findWalk: (x: number, trail: string, root: number) => `find(${x})：沿 parent 往上走 ${trail} → ${root}，根是 ${root}。`,
    findRoot: (x: number) => `find(${x})：${x} 自己就是根。`,
    compress: (list: string, root: number) => `路徑壓縮：把 ${list} 的 parent 全部直接指向 ${root}。下次再問就只要一步。`,
    alreadySame: (a: number, b: number, root: number) => `${a} 和 ${b} 已經在同一群（根都是 ${root}），不用動。`,
    mergeBySize: (small: number, count: number, big: number) =>
      `兩個根不同。按大小合併：小的那棵（根 ${small}，${count} 個）掛到大的（根 ${big}）底下，樹高才不會一直長。`,
    connected: (root: number, a: number, b: number) => `根相同（${root}），${a} 和 ${b} 連通。`,
    notConnected: (ra: number, rb: number, a: number, b: number) => `根不同（${ra} 與 ${rb}），${a} 和 ${b} 不連通。`,
    wrapUp: "有了路徑壓縮和按大小合併，每次操作攤銷後接近常數時間，記作 O(α(n))。",
    header: (n: number) => `${n} 個節點 · 路徑壓縮 + 按大小合併`,
    parentArray: "parent 陣列",
  },
  {
    en: {
      listSeparator: ", ",
      opStart: "Start",
      opEnd: "Done",
      init: (n: number) => `Every node starts as its own group, with parent[i] = i — that is ${n} trees consisting of just a root.`,
      findWalk: (x: number, trail: string, root: number) => `find(${x}): follow the parent pointers up through ${trail} → ${root}. The root is ${root}.`,
      findRoot: (x: number) => `find(${x}): ${x} is already a root.`,
      compress: (list: string, root: number) => `Path compression: point the parents of ${list} straight at ${root}. The next query on any of them takes a single step.`,
      alreadySame: (a: number, b: number, root: number) => `${a} and ${b} are already in the same group (both have root ${root}), so nothing changes.`,
      mergeBySize: (small: number, count: number, big: number) =>
        `The two roots differ. Merge by size: the smaller tree (root ${small}, ${count} node${count === 1 ? "" : "s"}) hangs below the larger one (root ${big}), which is what keeps the trees from growing tall.`,
      connected: (root: number, a: number, b: number) => `Same root (${root}), so ${a} and ${b} are connected.`,
      notConnected: (ra: number, rb: number, a: number, b: number) => `Different roots (${ra} and ${rb}), so ${a} and ${b} are not connected.`,
      wrapUp: "With path compression and union by size, each operation takes close to constant amortised time, written O(α(n)).",
      header: (n: number) => `${n} nodes · path compression + union by size`,
      parentArray: "The parent array",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

const N = 8;
type Op = { kind: "union"; a: number; b: number } | { kind: "find"; a: number } | { kind: "same"; a: number; b: number };
const SCRIPT: Op[] = [
  { kind: "union", a: 0, b: 1 }, { kind: "union", a: 2, b: 3 }, { kind: "union", a: 1, b: 3 },
  { kind: "union", a: 4, b: 5 }, { kind: "union", a: 6, b: 7 }, { kind: "union", a: 5, b: 7 },
  { kind: "same", a: 0, b: 4 }, { kind: "union", a: 3, b: 7 }, { kind: "find", a: 0 }, { kind: "same", a: 0, b: 6 },
];

interface Step { desc: string; op: string; parent: number[]; hot: number[]; roots: number[] }

function buildSteps(t: T): Step[] {
  const steps: Step[] = [];
  const parent = Array.from({ length: N }, (_, i) => i);
  const size = new Array(N).fill(1);
  const snap = (desc: string, op: string, hot: number[] = [], roots: number[] = []) => steps.push({ desc, op, parent: [...parent], hot, roots });

  snap(t.init(N), t.opStart);
  const find = (x: number, op: string): number => {
    const path: number[] = [];
    let r = x;
    while (parent[r] !== r) { path.push(r); r = parent[r]; }
    if (path.length) snap(t.findWalk(x, path.join(" → "), r), op, [...path, r], [r]);
    else snap(t.findRoot(x), op, [x], [x]);
    if (path.length > 1) {
      path.forEach((p) => (parent[p] = r));
      snap(t.compress(path.join(t.listSeparator), r), op, [...path, r], [r]);
    }
    return r;
  };
  for (const op of SCRIPT) {
    if (op.kind === "union") {
      const label = `union(${op.a}, ${op.b})`;
      const ra = find(op.a, label), rb = find(op.b, label);
      if (ra === rb) { snap(t.alreadySame(op.a, op.b, ra), label, [ra]); continue; }
      const [small, big] = size[ra] < size[rb] ? [ra, rb] : [rb, ra];
      parent[small] = big; size[big] += size[small];
      snap(t.mergeBySize(small, size[big] - size[small], big), label, [small, big], [big]);
    } else if (op.kind === "find") {
      find(op.a, `find(${op.a})`);
    } else {
      const label = `same(${op.a}, ${op.b})`;
      const ra = find(op.a, label), rb = find(op.b, label);
      snap(ra === rb ? t.connected(ra, op.a, op.b) : t.notConnected(ra, rb, op.a, op.b), label, [ra, rb], [ra, rb]);
    }
  }
  snap(t.wrapUp, t.opEnd);
  return steps;
}

function toForest(parent: number[]): GNode[] {
  const nodes: GNode[] = parent.map((_, i) => ({ id: String(i), label: String(i), children: [] }));
  const roots: GNode[] = [];
  parent.forEach((p, i) => (p === i ? roots.push(nodes[i]) : nodes[p].children.push(nodes[i])));
  return roots;
}

export function UnionFindDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const steps = useMemo(() => buildSteps(TEXT[locale]), [locale]);
  const [k, setK] = useState(0);
  const s = steps[k];
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={t.header(N)} />
      <ForestSVG roots={toForest(s.parent)} height={24 + 4 * 52} tone={(n) => (s.roots.includes(+n.id) && s.hot.includes(+n.id) ? "accent" : s.hot.includes(+n.id) ? "amber" : "none")} />
      <div className="border-t border-line px-3.5 py-3">
        <div className="eyebrow mb-1.5">{t.parentArray}</div>
        <div className="flex gap-3">
          <div><div className="mb-1 font-mono text-[10.5px] text-ink-3">i</div><Cells items={s.parent.map((_, i) => i)} tone={(i) => (s.hot.includes(i) ? CELL.dim : "")} w="w-8" /></div>
          <div><div className="mb-1 font-mono text-[10.5px] text-ink-3">parent[i]</div><Cells items={s.parent} tone={(i) => (s.roots.includes(i) && s.hot.includes(i) ? CELL.accent : s.hot.includes(i) ? CELL.amber : "")} w="w-8" /></div>
        </div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
