"use client";

import type { ReactNode } from "react";

/** 可序列化的二元樹節點（示範用） */
export interface BNode {
  v: number | string;
  l?: BNode | null;
  r?: BNode | null;
}

export type Tone = "none" | "accent" | "amber" | "green" | "ink" | "dim";

const FILL: Record<Tone, string> = {
  none: "var(--surface)", accent: "var(--accent)", amber: "var(--amber-soft)", green: "var(--green-soft)", ink: "var(--ink)", dim: "var(--surface-2)",
};
const STROKE: Record<Tone, string> = {
  none: "var(--line-strong)", accent: "var(--accent)", amber: "var(--amber)", green: "var(--green)", ink: "var(--ink)", dim: "var(--line)",
};
const TEXT: Record<Tone, string> = {
  none: "var(--ink)", accent: "var(--accent-ink)", amber: "var(--amber)", green: "var(--green)", ink: "var(--bg)", dim: "var(--ink-3)",
};

export interface Placed { node: BNode; x: number; y: number; depth: number; parent?: Placed }

/** 用中序位置決定 x，深度決定 y。回傳每個節點的座標與父節點。 */
export function layoutBinary(root: BNode | null | undefined, width: number, levelH = 56, top = 26): Placed[] {
  const out: Placed[] = [];
  let idx = 0;
  const walk = (n: BNode | null | undefined, depth: number, parent?: Placed) => {
    if (!n) return;
    const me: Placed = { node: n, x: 0, y: top + depth * levelH, depth, parent };
    walk(n.l, depth + 1, me);
    me.x = idx++;
    out.push(me);
    walk(n.r, depth + 1, me);
  };
  walk(root, 0);
  const count = Math.max(idx, 1);
  out.forEach((p) => (p.x = 24 + ((p.x + 0.5) / count) * (width - 48)));
  return out;
}

export function treeHeight(n: BNode | null | undefined): number {
  return n ? 1 + Math.max(treeHeight(n.l), treeHeight(n.r)) : 0;
}

export function cloneTree(n: BNode | null | undefined): BNode | null {
  return n ? { v: n.v, l: cloneTree(n.l), r: cloneTree(n.r) } : null;
}

/** 畫一棵二元樹。tone 決定每個節點的顏色，sub 是節點下方的小標籤。 */
export function BinaryTreeSVG({
  root, width = 640, height, levelH = 56, r = 17,
  tone = () => "none", sub, onPick, picked, empty = "空",
}: {
  root: BNode | null | undefined;
  width?: number; height?: number; levelH?: number; r?: number;
  tone?: (n: BNode, depth: number) => Tone;
  sub?: (n: BNode, depth: number) => ReactNode;
  onPick?: (n: BNode) => void;
  picked?: BNode | null;
  empty?: string;
}) {
  const placed = layoutBinary(root, width, levelH);
  const h = height ?? 26 + Math.max(treeHeight(root), 1) * levelH;
  return (
    <svg viewBox={`0 0 ${width} ${h}`} className="block h-auto w-full" role="img" aria-label="樹狀圖">
      {placed.map((p, i) => p.parent && (
        <line key={`e${i}`} x1={p.parent.x} y1={p.parent.y} x2={p.x} y2={p.y} stroke="var(--line-strong)" strokeWidth="1.5" />
      ))}
      {placed.map((p, i) => {
        const t = tone(p.node, p.depth);
        const isPicked = picked === p.node;
        return (
          <g key={`n${i}`} onClick={onPick ? () => onPick(p.node) : undefined} className={onPick ? "cursor-pointer" : undefined}>
            <circle cx={p.x} cy={p.y} r={r} fill={FILL[t]} stroke={isPicked ? "var(--accent)" : STROKE[t]} strokeWidth={t !== "none" || isPicked ? 2.2 : 1.5} />
            <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="500" fontFamily="var(--font-mono)" fill={TEXT[t]}>{p.node.v}</text>
            {sub && <text x={p.x} y={p.y + r + 11} textAnchor="middle" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--ink-3)">{sub(p.node, p.depth)}</text>}
          </g>
        );
      })}
      {!root && <text x={width / 2} y={h / 2} textAnchor="middle" fontSize="12" fill="var(--ink-3)">{empty}</text>}
    </svg>
  );
}

/* ---------- 一般樹（森林）：每個節點有任意個子節點 ---------- */
export interface GNode { id: string; label: string; children: GNode[] }
export interface GPlaced { node: GNode; x: number; y: number; depth: number; parent?: GPlaced }

function leafCount(n: GNode): number {
  return n.children.length ? n.children.reduce((a, c) => a + leafCount(c), 0) : 1;
}

export function layoutForest(roots: GNode[], width: number, levelH = 52, top = 24): GPlaced[] {
  const out: GPlaced[] = [];
  const total = Math.max(roots.reduce((a, r) => a + leafCount(r), 0), 1);
  let cursor = 0;
  const walk = (n: GNode, depth: number, parent?: GPlaced) => {
    const leaves = leafCount(n);
    const me: GPlaced = { node: n, x: 24 + ((cursor + leaves / 2) / total) * (width - 48), y: top + depth * levelH, depth, parent };
    out.push(me);
    if (!n.children.length) cursor += 1;
    n.children.forEach((c) => walk(c, depth + 1, me));
  };
  roots.forEach((r) => walk(r, 0));
  return out;
}

export function ForestSVG({
  roots, width = 640, height, levelH = 52, r = 16, tone = () => "none", sub,
}: {
  roots: GNode[]; width?: number; height?: number; levelH?: number; r?: number;
  tone?: (n: GNode, depth: number) => Tone;
  sub?: (n: GNode, depth: number) => ReactNode;
}) {
  const placed = layoutForest(roots, width, levelH);
  const maxDepth = placed.reduce((a, p) => Math.max(a, p.depth), 0);
  const h = height ?? 24 + (maxDepth + 1) * levelH;
  return (
    <svg viewBox={`0 0 ${width} ${h}`} className="block h-auto w-full" role="img" aria-label="樹狀圖">
      {placed.map((p, i) => p.parent && (
        <line key={`e${i}`} x1={p.parent.x} y1={p.parent.y} x2={p.x} y2={p.y} stroke="var(--line-strong)" strokeWidth="1.5" />
      ))}
      {placed.map((p, i) => {
        const t = tone(p.node, p.depth);
        return (
          <g key={`n${i}`}>
            <circle cx={p.x} cy={p.y} r={r} fill={FILL[t]} stroke={STROKE[t]} strokeWidth={t !== "none" ? 2.2 : 1.5} />
            <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize="12.5" fontWeight="500" fontFamily="var(--font-mono)" fill={TEXT[t]}>{p.node.label}</text>
            {sub && <text x={p.x} y={p.y + r + 11} textAnchor="middle" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--ink-3)">{sub(p.node, p.depth)}</text>}
          </g>
        );
      })}
    </svg>
  );
}
