"use client";

import { useMemo, useState } from "react";
import { layoutForest, type GNode } from "./tree-utils";
import { StepHeader, StepFooter } from "./StepBar";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

const WORD = "abracadabra";

const TEXT = demoText(
  {
    intro: (word: string, len: number, kinds: number) => `「${word}」有 ${len} 個字元、${kinds} 種。先統計頻率，每種字元是一個葉節點，全部丟進最小堆積（依頻率排）。`,
    nodeWord: "節點",
    pick: (a: string, af: number, b: string, bf: number) => `取出頻率最小的兩個：${a}（${af}）和 ${b}（${bf}）。頻率越小越早被合併，之後每合併一次就被往下壓一層，所以會落在樹的越深處，編碼越長。`,
    merge: (freq: number, left: number) => `合併成頻率 ${freq} 的新節點，左邊走 0、右邊走 1，放回堆積。堆積剩 ${left} 個。`,
    built: "堆積只剩一個節點，樹建好了。從根往下走，左 0 右 1，走到葉節點的路徑就是那個字元的編碼。",
    total: (bits: number, fixed: number, kinds: number, len: number, fixedBits: number) =>
      `總共 ${bits} 位元。固定長度編碼要用 ${fixed} 位元表示 ${kinds} 種字元，${len} × ${fixed} = ${fixedBits} 位元。沒有任何編碼是另一個的前綴，所以解碼不需要分隔符號。`,
    headRight: "每次合併頻率最小的兩個 · 左 0 右 1",
    treeAria: "霍夫曼樹",
    heapTitle: "堆積（由小到大）",
    codeTitle: "編碼表",
    thChar: "字元",
    thCount: "次數",
    thCode: "編碼",
    thBits: "位元",
    totalRow: "合計",
    fixedCell: (fixed: number, bits: number) => `固定 ${fixed} 位元：${bits}`,
  },
  {
    en: {
      intro: (word: string, len: number, kinds: number) => `"${word}" is ${len} characters long and uses ${kinds} distinct symbols. Count the frequencies first: every symbol becomes a leaf, and all the leaves go into a min-heap ordered by frequency.`,
      nodeWord: "node",
      pick: (a: string, af: number, b: string, bf: number) => `Take the two smallest frequencies: ${a} (${af}) and ${b} (${bf}). The smaller the frequency, the earlier a node gets merged, and every merge pushes it one level further down — so it ends up deeper in the tree with a longer code.`,
      merge: (freq: number, left: number) => `Merge them into a new node of frequency ${freq}, with 0 for the left branch and 1 for the right, and push it back. The heap now holds ${left} node${left === 1 ? "" : "s"}.`,
      built: "Only one node is left in the heap, so the tree is finished. Walk down from the root taking 0 for left and 1 for right: the path to a leaf is that character's code.",
      total: (bits: number, fixed: number, kinds: number, len: number, fixedBits: number) =>
        `${bits} bits in total. A fixed-length code needs ${fixed} bits to tell ${kinds} symbols apart, so it would take ${len} × ${fixed} = ${fixedBits} bits. No code is a prefix of another, so decoding needs no separators.`,
      headRight: "Merge the two smallest frequencies each time · left 0, right 1",
      treeAria: "Huffman tree",
      heapTitle: "Heap (smallest first)",
      codeTitle: "Code table",
      thChar: "Char",
      thCount: "Count",
      thCode: "Code",
      thBits: "Bits",
      totalRow: "Total",
      fixedCell: (fixed: number, bits: number) => `Fixed ${fixed} bits: ${bits}`,
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

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

function buildSteps(t: T): Step[] {
  const steps: Step[] = [];
  const freq = new Map<string, number>();
  for (const c of WORD) freq.set(c, (freq.get(c) ?? 0) + 1);
  let nextId = 0;
  let queue: HNode[] = [...freq.entries()].map(([ch, f]) => ({ id: nextId++, ch, freq: f }));
  const byPriority = () => [...queue].sort((a, b) => a.freq - b.freq || a.id - b.id);
  queue = byPriority();
  const snap = (desc: string, extra: Partial<Step> = {}) => steps.push({ desc, queue: [...queue], picked: [], done: false, ...extra });

  snap(t.intro(WORD, WORD.length, queue.length));
  while (queue.length > 1) {
    const [a, b] = queue;
    snap(t.pick(a.ch ?? t.nodeWord, a.freq, b.ch ?? t.nodeWord, b.freq), { picked: [a.id, b.id] });
    const merged: HNode = { id: nextId++, freq: a.freq + b.freq, l: a, r: b };
    queue = byPriority().slice(2);
    queue.push(merged);
    queue = byPriority();
    snap(t.merge(merged.freq, queue.length), { fresh: merged.id, picked: [a.id, b.id] });
  }
  const root = queue[0];
  const codes = assignCodes(root);
  const total = [...freq.entries()].reduce((acc, [ch, f]) => acc + f * codes[ch].length, 0);
  const fixed = Math.ceil(Math.log2(freq.size));
  snap(t.built, { codes, done: true });
  snap(t.total(total, fixed, freq.size, WORD.length, WORD.length * fixed), { codes, done: true });
  return steps;
}

function toG(n: HNode): GNode {
  return { id: String(n.id), label: String(n.freq), children: [n.l, n.r].filter((c): c is HNode => !!c).map(toG) };
}

const W = 640, LEVEL = 50, R = 15;

export function HuffmanDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const steps = useMemo(() => buildSteps(TEXT[locale]), [locale]);
  const [k, setK] = useState(0);
  const s = steps[k];
  const chars = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of WORD) m.set(c, (m.get(c) ?? 0) + 1);
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
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">huffman(&quot;{WORD}&quot;)</span>} right={t.headRight} />
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={t.treeAria}>
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
          <div className="eyebrow mb-2">{t.heapTitle}</div>
          <div className="flex flex-wrap gap-1">
            {s.queue.map((n) => (
              <span key={n.id} className={`grid h-8 min-w-9 place-items-center rounded-md border px-1.5 font-mono text-[12.5px] tabular-nums ${
                s.fresh === n.id ? "border-accent bg-accent text-accent-ink" : s.picked.includes(n.id) && !s.fresh ? "border-amber bg-amber-soft text-amber" : "border-line-strong bg-surface"
              }`}>{n.ch !== undefined ? `${n.ch}:${n.freq}` : n.freq}</span>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="eyebrow mb-2">{t.codeTitle}</div>
          <table className="border-collapse font-mono text-[12.5px] tabular-nums">
            <thead>
              <tr className="text-ink-3"><th className="pr-3 text-left font-medium">{t.thChar}</th><th className="pr-3 text-right font-medium">{t.thCount}</th><th className="pr-3 text-left font-medium">{t.thCode}</th><th className="text-right font-medium">{t.thBits}</th></tr>
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
                <td className="pr-3 py-0.5">{t.totalRow}</td>
                <td className="pr-3 text-right">{WORD.length}</td>
                <td className="pr-3 text-ink-3">{t.fixedCell(fixed, WORD.length * fixed)}</td>
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
