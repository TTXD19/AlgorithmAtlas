"use client";

import { useState } from "react";
import { BinaryTreeSVG, treeHeight, type BNode } from "./tree-utils";
import { Cells, CELL } from "./StepBar";

/** 完全二元樹：層序 1..7，剛好對應陣列索引 0..6 */
const TREE: BNode = {
  v: 1,
  l: { v: 2, l: { v: 4 }, r: { v: 5 } },
  r: { v: 3, l: { v: 6 }, r: { v: 7 } },
};
const ORDER = [1, 2, 3, 4, 5, 6, 7];

function info(root: BNode, target: BNode) {
  let depth = -1;
  const walk = (n: BNode | null | undefined, d: number): boolean => {
    if (!n) return false;
    if (n === target) { depth = d; return true; }
    return walk(n.l, d + 1) || walk(n.r, d + 1);
  };
  walk(root, 0);
  const size = (n: BNode | null | undefined): number => (n ? 1 + size(n.l) + size(n.r) : 0);
  return { depth, height: treeHeight(target) - 1, size: size(target), leaf: !target.l && !target.r };
}

export function TreeBasicsDemo() {
  const [picked, setPicked] = useState<BNode>(TREE.l!);
  const i = info(TREE, picked);
  const idx = ORDER.indexOf(picked.v as number);
  const parent = idx > 0 ? Math.floor((idx - 1) / 2) : -1;
  const kids = [2 * idx + 1, 2 * idx + 2].filter((k) => k < ORDER.length);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        點任何一個節點
        <span className="ml-auto text-[12px] text-ink-3">完全二元樹 · 7 個節點</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_220px]">
        <BinaryTreeSVG
          root={TREE}
          onPick={setPicked}
          picked={picked}
          tone={(n) => (n === picked ? "accent" : !n.l && !n.r ? "green" : "none")}
          sub={(n, d) => `depth ${d}`}
        />
        <div className="flex flex-col gap-3 border-t border-line p-4 text-[13px] md:border-t-0 md:border-l">
          <div>
            <div className="eyebrow mb-1">節點 {picked.v}</div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 font-mono text-[12.5px] tabular-nums">
              <dt className="text-ink-3">深度</dt><dd>{i.depth}</dd>
              <dt className="text-ink-3">高度</dt><dd>{i.height}</dd>
              <dt className="text-ink-3">子樹大小</dt><dd>{i.size}</dd>
              <dt className="text-ink-3">類型</dt><dd className="font-sans">{i.depth === 0 ? "根" : i.leaf ? "葉" : "內部節點"}</dd>
            </dl>
          </div>
          <div>
            <div className="eyebrow mb-1">陣列索引 {idx}</div>
            <div className="font-mono text-[12.5px] text-ink-2">
              父 {parent >= 0 ? `(${idx}−1)/2 = ${parent}` : "—"}<br />
              子 {kids.length ? `2·${idx}+1, 2·${idx}+2 = ${kids.join(", ")}` : "—"}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-line px-3.5 py-3">
        <div className="eyebrow mb-1.5">同一棵樹的陣列表示（層序）</div>
        <Cells items={ORDER} tone={(k) => (k === idx ? CELL.accent : k === parent ? CELL.amber : kids.includes(k) ? CELL.green : "")} />
        <div className="mt-1.5 text-[12px] text-ink-3">藍色是選中的節點、黃色是它的父、綠色是它的子。完全二元樹才能這樣不留空洞地存。</div>
      </div>
    </div>
  );
}
