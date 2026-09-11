"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  ROADMAP_NODES, ROADMAP_EDGES, NODE_W, NODE_H, CANVAS_W, CANVAS_H,
  resolveLessons, roadmapOrder, type RoadmapNode, type RoadmapLesson,
} from "@/lib/roadmap";
import { useProgress } from "@/lib/progress";
import { TopicGlyph } from "./TopicGlyph";
import { Level } from "./Level";

type NodeState = "none" | "partial" | "done";

export function RoadmapView() {
  const { isDone } = useProgress();
  const [selected, setSelected] = useState<string>(ROADMAP_NODES[0].id);
  const [hover, setHover] = useState<string | null>(null);

  const nodes = useMemo(() => ROADMAP_NODES.map((n) => ({ ...n, resolved: resolveLessons(n.lessons) })), []);
  const byId = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);
  const all = useMemo(() => roadmapOrder(), []);
  const doneCount = all.filter((l) => isDone(l.key)).length;
  const next = all.find((l) => l.sub.state === "ready" && !isDone(l.key));
  const nextNode = next && nodes.find((n) => n.lessons.includes(next.key));

  const progressOf = (n: (typeof nodes)[number]) => {
    const d = n.resolved.filter((l) => isDone(l.key)).length;
    const state: NodeState = d === 0 ? "none" : d === n.resolved.length ? "done" : "partial";
    return { d, total: n.resolved.length, state };
  };

  const ordered = useMemo(() => [...nodes].sort((a, b) => a.y - b.y || a.x - b.x), [nodes]);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  /** 選取節點並捲到它的卡片 */
  const pick = (id: string) => {
    setSelected(id);
    cardRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="eyebrow">Learning roadmap</div>
          <h1 className="display mt-1.5 mb-2 text-[clamp(30px,4vw,42px)] leading-[1.08] font-extrabold">學習路線</h1>
          <p className="m-0 max-w-[60ch] text-[15px] text-ink-2">
            由上往下學。線條表示前置關係：上面的節點學完，下面的才會順。點節點查看裡面的課程。
          </p>
        </div>
        <div className="flex items-center gap-4 rounded-[10px] border border-line bg-surface px-4 py-3">
          <div>
            <div className="eyebrow">整體進度</div>
            <div className="font-display text-[22px] font-bold tabular-nums">
              {doneCount}<span className="text-[14px] font-medium text-ink-3">/{all.length}</span>
            </div>
          </div>
          <div className="h-9 w-px bg-line" />
          <div className="text-[13px] text-ink-2">
            <div className="eyebrow">建議下一步</div>
            {next ? (
              <Link href={`/${next.topic.id}/${next.sub.id}`} className="font-semibold text-accent hover:underline">
                {next.sub.name} {next.sub.zh}
              </Link>
            ) : (
              <span>已撰寫的課程都學會了</span>
            )}
          </div>
        </div>
      </div>

      <div>
        {/* ---------- 圖 ---------- */}
        <div
          className="overflow-x-auto rounded-xl border border-line bg-surface"
          style={{ backgroundImage: "radial-gradient(var(--line-strong) 1px, transparent 1px)", backgroundSize: "24px 24px", backgroundPosition: "12px 12px" }}
        >
          <svg viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`} className="mx-auto block h-auto w-full max-w-[900px] min-w-[720px]" role="img" aria-label="演算法學習路線圖">
            {/* 邊 */}
            {ROADMAP_EDGES.map(([a, b]) => {
              const A = byId[a], B = byId[b];
              const x1 = A.x, y1 = A.y + NODE_H / 2;
              const x2 = B.x, y2 = B.y - NODE_H / 2;
              const my = (y1 + y2) / 2;
              const lit = hover === a || hover === b || selected === a || selected === b;
              const doneEdge = progressOf(A).state === "done";
              return (
                <path
                  key={a + b}
                  d={`M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`}
                  fill="none"
                  stroke={lit ? "var(--accent)" : doneEdge ? "var(--green)" : "var(--line-strong)"}
                  strokeWidth={lit ? 2.5 : 1.75}
                  opacity={hover && !lit ? 0.35 : 1}
                  style={{ transition: "stroke .15s, opacity .15s" }}
                />
              );
            })}

            {/* 節點 */}
            {nodes.map((n) => {
              const { d, total, state } = progressOf(n);
              const isSel = selected === n.id;
              const isNext = nextNode?.id === n.id;
              const fill = state === "done" ? "var(--green-soft)" : state === "partial" ? "var(--accent-soft)" : "var(--surface)";
              const stroke = isSel ? "var(--accent)" : state === "done" ? "var(--green)" : state === "partial" ? "var(--accent)" : "var(--line-strong)";
              const barW = NODE_W - 28;
              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x - NODE_W / 2}, ${n.y - NODE_H / 2})`}
                  className="roadmap-node cursor-pointer"
                  onClick={() => pick(n.id)}
                  onMouseEnter={() => setHover(n.id)}
                  onMouseLeave={() => setHover(null)}
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && pick(n.id)}
                  role="button"
                  aria-label={`${n.label}，${d}/${total} 已學會`}
                >
                  <rect width={NODE_W} height={NODE_H} rx="9" fill={fill} stroke={stroke} strokeWidth={isSel ? 2.5 : 1.5} style={{ transition: "stroke .15s" }} />
                  {isNext && <circle cx={NODE_W - 2} cy="2" r="6" fill="var(--accent)" stroke="var(--surface)" strokeWidth="2" />}
                  <text x={NODE_W / 2} y="24" textAnchor="middle" fill="var(--ink)" fontSize={n.label.length > 20 ? 12.5 : 14} fontWeight="600" fontFamily="var(--font-sans)">
                    {n.label}
                  </text>
                  <rect x="14" y="38" width={barW} height="5" rx="2.5" fill="var(--surface-2)" />
                  {d > 0 && <rect x="14" y="38" width={(barW * d) / total} height="5" rx="2.5" fill="var(--green)" />}
                  <text x={NODE_W - 14} y="52" textAnchor="end" fill="var(--ink-3)" fontSize="9.5" fontFamily="var(--font-mono)">{d}/{total}</text>
                </g>
              );
            })}
          </svg>
        </div>

      </div>

      {/* ---------- 所有節點的卡片 ---------- */}
      <div className="mt-8 mb-3.5 flex items-baseline justify-between">
        <h2 className="m-0 text-[20px] font-bold">各節點內容</h2>
        <span className="text-[13px] text-ink-3">依學習順序排列 · 點圖上的節點會跳到對應卡片</span>
      </div>
      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
        {ordered.map((n) => (
          <NodeCard
            key={n.id}
            node={n}
            progress={progressOf(n)}
            selected={selected === n.id}
            isDone={isDone}
            nextKey={next?.key}
            prereqs={ROADMAP_EDGES.filter(([, b]) => b === n.id).map(([a]) => byId[a])}
            unlocks={ROADMAP_EDGES.filter(([a]) => a === n.id).map(([, b]) => byId[b])}
            onPick={pick}
            cardRef={(el) => { cardRefs.current[n.id] = el; }}
          />
        ))}
      </div>
    </>
  );
}

type NodeWithLessons = RoadmapNode & { resolved: RoadmapLesson[] };

function NodeCard({
  node, progress, selected, isDone, nextKey, prereqs, unlocks, onPick, cardRef,
}: {
  node: NodeWithLessons;
  progress: { d: number; total: number; state: NodeState };
  selected: boolean;
  isDone: (key: string) => boolean;
  nextKey?: string;
  prereqs: RoadmapNode[];
  unlocks: RoadmapNode[];
  onPick: (id: string) => void;
  cardRef: (el: HTMLDivElement | null) => void;
}) {
  const { d, total, state } = progress;
  return (
    <div
      ref={cardRef}
      className={`flex scroll-mt-20 flex-col rounded-xl border bg-surface p-4 transition ${
        selected ? "border-accent ring-2 ring-accent/40" : state === "done" ? "border-green" : "border-line"
      }`}
    >
      <div className="eyebrow">{node.zh}</div>
      <h3 className="display mt-0.5 mb-1 text-[20px] font-bold">{node.label}</h3>
      <div className="mb-1 flex items-center gap-2.5 text-[12.5px] text-ink-3 tabular-nums">
        <div className="h-1 flex-1 overflow-hidden rounded-sm bg-surface-2">
          <i className="block h-full rounded-sm bg-green" style={{ width: `${(d / total) * 100}%` }} />
        </div>
        {d}/{total} 已學會
      </div>

      <ul className="m-0 mb-3 list-none p-0">
        {node.resolved.map((l, i) => {
          const done = isDone(l.key);
          const draft = l.sub.state === "draft";
          const isNext = nextKey === l.key;
          return (
            <li key={l.key} className={i > 0 ? "border-t border-line" : ""}>
              <Link href={`/${l.topic.id}/${l.sub.id}`} className={`flex items-center gap-2.5 py-2.5 hover:text-accent ${draft ? "text-ink-3" : ""}`}>
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-[11px] ${done ? "bg-green text-white" : "bg-surface-2 text-ink-3"}`}>
                  {done ? "✓" : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-[14px] font-semibold">
                    <span className="truncate">{l.sub.name}</span>
                    {isNext && <span className="shrink-0 rounded-full bg-accent-soft px-1.5 text-[10.5px] font-semibold text-accent">下一步</span>}
                  </span>
                  <span className="flex items-center gap-1.5 text-[12px] text-ink-3">
                    <TopicGlyph id={l.topic.glyph} className="h-3 w-3" />
                    {l.sub.zh}
                    {draft && <span className="ml-auto">撰寫中</span>}
                  </span>
                </span>
                <Level n={l.sub.lvl} />
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto">
        <Related title="前置" nodes={prereqs} onPick={onPick} empty="這是起點" />
        <Related title="接著可以學" nodes={unlocks} onPick={onPick} empty="路線終點" />
      </div>
    </div>
  );
}

function Related({ title, nodes, onPick, empty }: { title: string; nodes: RoadmapNode[]; onPick: (id: string) => void; empty: string }) {
  return (
    <div className="mt-3 border-t border-line pt-3">
      <div className="eyebrow mb-1.5">{title}</div>
      {nodes.length ? (
        <div className="flex flex-wrap gap-1.5">
          {nodes.map((n) => (
            <button key={n.id} type="button" onClick={() => onPick(n.id)} className="cursor-pointer rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-[12.5px] hover:border-line-strong">
              {n.label}
            </button>
          ))}
        </div>
      ) : (
        <span className="text-[12.5px] text-ink-3">{empty}</span>
      )}
    </div>
  );
}
