"use client";

import { useMemo, useState } from "react";
import { layoutForest, type GNode } from "./tree-utils";
import { StepHeader, StepFooter } from "./StepBar";

const TEXT = "abracadabra";

interface HNode { id: number; ch?: string; freq: number; l?: HNode; r?: HNode }
interface Step { desc: string; queue: HNode[]; picked: number[]; fresh?: number; codes?: Record<string, string>; done: boolean }

function assignCodes(root: HNode): Record<string, string> {
  const out: Record<string, string> = {};
  const walk = (n: HNode, code: string) => {
    if (n.ch !== undefined) { out[n.ch] = code || "0"; return; }
    if (n.l) walk(n.l, code + "0");
    if (n.r) walk(n.r, code + "1");
  };
  walk(root, "");
  return out;
}

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const freq = new Map<string, number>();
  for (const c of TEXT) freq.set(c, (freq.get(c) ?? 0) + 1);
  let nextId = 0;
  let queue: HNode[] = [...freq.entries()].map(([ch, f]) => ({ id: nextId++, ch, freq: f }));
  const byPriority = () => [...queue].sort((a, b) => a.freq - b.freq || a.id - b.id);
  queue = byPriority();
  const snap = (desc: string, extra: Partial<Step> = {}) => steps.push({ desc, queue: [...queue], picked: [], done: false, ...extra });

  snap(`「${TEXT}」有 ${TEXT.length} 個字元、${queue.length} 種。先統計頻率，每種字元是一個葉節點，全部丟進最小堆積（依頻率排）。`);
  while (queue.length > 1) {
    const [a, b] = queue;
    snap(`取出頻率最小的兩個：${a.ch ?? "節點"}（${a.freq}）和 ${b.ch ?? "節點"}（${b.freq}）。頻率越小越早被合併，之後每合併一次就被往下壓一層，所以會落在樹的越深處，編碼越長。`, { picked: [a.id, b.id] });
    const merged: HNode = { id: nextId++, freq: a.freq + b.freq, l: a, r: b };
    queue = byPriority().slice(2);
    queue.push(merged);
    queue = byPriority();
    snap(`合併成頻率 ${merged.freq} 的新節點，左邊走 0、右邊走 1，放回堆積。堆積剩 ${queue.length} 個。`, { fresh: merged.id, picked: [a.id, b.id] });
  }
  const root = queue[0];
  const codes = assignCodes(root);
  const total = [...freq.entries()].reduce((acc, [ch, f]) => acc + f * codes[ch].length, 0);
  const fixed = Math.ceil(Math.log2(freq.size));
  snap(`堆積只剩一個節點，樹建好了。從根往下走，左 0 右 1，走到葉節點的路徑就是那個字元的編碼。`, { codes, done: true });
  snap(`總共 ${total} 位元。固定長度編碼要用 ${fixed} 位元表示 ${freq.size} 種字元，${TEXT.length} × ${fixed} = ${TEXT.length * fixed} 位元。沒有任何編碼是另一個的前綴，所以解碼不需要分隔符號。`, { codes, done: true });
  return steps;
}

function toG(n: HNode): GNode {
  return { id: String(n.id), label: String(n.freq), children: [n.l, n.r].filter((c): c is HNode => !!c).map(toG) };
}

const W = 640, LEVEL = 50, R = 15;

export function HuffmanDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];
  const chars = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of TEXT) m.set(c, (m.get(c) ?? 0) + 1);
    return [...m.entries()];
  }, []);
  const leafOf = new Map<string, string>();
  const collect = (n: HNode) => { if (n.ch !== undefined) leafOf.set(String(n.id), n.ch); if (n.l) collect(n.l); if (n.r) collect(n.r); };
  s.queue.forEach(collect);
  const placed = layoutForest(s.queue.map(toG), W, LEVEL, 26);
  const maxDepth = placed.reduce((a, p) => Math.max(a, p.depth), 0);
  const H = 26 + (maxDepth + 1) * LEVEL + 4;
  const fixed = Math.ceil(Math.log2(chars.length));

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">huffman(&quot;{TEXT}&quot;)</span>} right="每次合併頻率最小的兩個 · 左 0 右 1" />
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="霍夫曼樹">
        {placed.map((p, i) => {
          if (!p.parent) return null;
          const isLeft = p.parent.node.children[0] === p.node;
          const mx = (p.parent.x + p.x) / 2, my = (p.parent.y + p.y) / 2;
          return (
            <g key={`e${i}`}>
              <line x1={p.parent.x} y1={p.parent.y} x2={p.x} y2={p.y} stroke="var(--line-strong)" strokeWidth="1.5" />
              <rect x={mx - 7} y={my - 7} width="14" height="14" rx="3" fill="var(--surface)" stroke="var(--line)" />
              <text x={mx} y={my} textAnchor="middle" dominantBaseline="central" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--ink-2)">{isLeft ? "0" : "1"}</text>
            </g>
          );
        })}
        {placed.map((p, i) => {
          const id = +p.node.id;
          const ch = leafOf.get(p.node.id);
          const isFresh = s.fresh === id;
          const isPicked = s.picked.includes(id) && !s.fresh;
          const fill = isFresh ? "var(--accent)" : isPicked ? "var(--amber-soft)" : ch !== undefined ? "var(--surface)" : "var(--surface-2)";
          const stroke = isFresh ? "var(--accent)" : isPicked ? "var(--amber)" : "var(--line-strong)";
          const txt = isFresh ? "var(--accent-ink)" : isPicked ? "var(--amber)" : "var(--ink)";
          return (
            <g key={`n${i}`}>
              <circle cx={p.x} cy={p.y} r={R} fill={fill} stroke={stroke} strokeWidth={isFresh || isPicked ? 2.2 : 1.5} />
              <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="500" fontFamily="var(--font-mono)" fill={txt}>{p.node.label}</text>
              {ch !== undefined && (
                <text x={p.x} y={p.y + R + 11} textAnchor="middle" fontSize="11" fontWeight="600" fontFamily="var(--font-mono)" fill={isPicked ? "var(--amber)" : "var(--accent)"}>{ch}</text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="grid grid-cols-1 gap-3.5 border-t border-line p-3.5 md:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <div className="eyebrow mb-2">堆積（由小到大）</div>
          <div className="flex flex-wrap gap-1">
            {s.queue.map((n) => (
              <span key={n.id} className={`grid h-8 min-w-9 place-items-center rounded-md border px-1.5 font-mono text-[12.5px] tabular-nums ${
                s.fresh === n.id ? "border-accent bg-accent text-accent-ink" : s.picked.includes(n.id) && !s.fresh ? "border-amber bg-amber-soft text-amber" : "border-line-strong bg-surface"
              }`}>{n.ch !== undefined ? `${n.ch}:${n.freq}` : n.freq}</span>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="eyebrow mb-2">編碼表</div>
          <table className="border-collapse font-mono text-[12.5px] tabular-nums">
            <thead>
              <tr className="text-ink-3"><th className="pr-3 text-left font-medium">字元</th><th className="pr-3 text-right font-medium">次數</th><th className="pr-3 text-left font-medium">編碼</th><th className="text-right font-medium">位元</th></tr>
            </thead>
            <tbody>
              {chars.map(([ch, f]) => {
                const code = s.codes?.[ch];
                return (
                  <tr key={ch} className="border-t border-line">
                    <td className="pr-3 py-0.5 font-semibold text-accent">{ch}</td>
                    <td className="pr-3 text-right">{f}</td>
                    <td className="pr-3">{code ?? <span className="text-ink-3">?</span>}</td>
                    <td className="text-right">{code ? f * code.length : <span className="text-ink-3">?</span>}</td>
                  </tr>
                );
              })}
              <tr className="border-t border-line-strong font-semibold">
                <td className="pr-3 py-0.5">合計</td>
                <td className="pr-3 text-right">{TEXT.length}</td>
                <td className="pr-3 text-ink-3">固定 {fixed} 位元：{TEXT.length * fixed}</td>
                <td className="text-right">{s.codes ? <span className="text-green">{chars.reduce((a, [ch, f]) => a + f * s.codes![ch].length, 0)}</span> : <span className="text-ink-3">?</span>}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
