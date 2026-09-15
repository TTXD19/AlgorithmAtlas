"use client";

import { useMemo, useState } from "react";
import { layoutForest, type GNode } from "./tree-utils";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

/** Aho–Corasick：把關鍵字建成字典樹、補上失敗連結，再把文字從頭到尾掃一次 */
const WORDS = ["he", "she", "his", "hers"];
const TEXT = "ushers";
const ROOT = "";

interface Found { word: string; end: number }
interface Step {
  desc: string;
  op: string;
  phase: "build" | "fail" | "scan";
  nodes: string[];
  fails: Record<string, string>;
  cur?: string;
  trail?: string[];
  hotFail?: [string, string];
  fresh?: string[];
  pos?: number;
  found: Found[];
}

const q = (id: string) => (id === ROOT ? "根" : `「${id}」`);

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const nodes: string[] = [ROOT];
  const kids: Record<string, Record<string, string>> = { [ROOT]: {} };
  const terminal = new Set<string>();
  const fails: Record<string, string> = {};
  const found: Found[] = [];
  const snap = (desc: string, op: string, phase: Step["phase"], extra: Partial<Step> = {}) =>
    steps.push({ desc, op, phase, nodes: [...nodes], fails: { ...fails }, found: [...found], ...extra });

  snap(`要在文字裡同時找 ${WORDS.length} 個關鍵字：${WORDS.join("、")}。第一步和一般字典樹一樣，把每個關鍵字插進去，共用前綴的部分只存一次。`, "開始", "build");
  for (const w of WORDS) {
    const fresh: string[] = [];
    let cur = ROOT;
    for (const ch of w) {
      const nxt = cur + ch;
      if (!kids[cur][ch]) { kids[cur][ch] = nxt; kids[nxt] = {}; nodes.push(nxt); fresh.push(nxt); }
      cur = nxt;
    }
    terminal.add(w);
    const shared = w.length - fresh.length;
    snap(`插入「${w}」：${shared ? `前 ${shared} 個字元「${w.slice(0, shared)}」已經在樹上，沿著走下去，` : ""}${fresh.length ? `新建${fresh.map(q).join("、")}共 ${fresh.length} 個節點，` : ""}最後一個節點標記為關鍵字結尾（綠色）。`, `插入 ${w}`, "build", { cur, fresh });
  }

  // BFS 補失敗連結
  const depth1 = Object.values(kids[ROOT]);
  depth1.forEach((v) => (fails[v] = ROOT));
  snap(`第二步用 BFS 一層一層補「失敗連結」：fail(v) 指向「v 的最長真後綴，而且這個後綴也在字典樹上」。第一層的${depth1.map(q).join("、")}只有一個字，真後綴是空字串，所以都指向根。之後沒畫虛線的節點，失敗連結都指向根。`, "失敗連結：第 1 層", "fail", { trail: depth1 });
  const queue = [...depth1];
  while (queue.length) {
    const u = queue.shift()!;
    for (const [ch, v] of Object.entries(kids[u])) {
      queue.push(v);
      let f = fails[u];
      const chain = [f];
      while (f !== ROOT && !kids[f][ch]) { f = fails[f]; chain.push(f); }
      const target = kids[f][ch] && kids[f][ch] !== v ? kids[f][ch] : ROOT;
      fails[v] = target;
      const walk = chain.length > 1 ? `先看父節點${q(u)}的失敗連結${q(chain[0])}，它沒有「${ch}」，再往上跳到${q(chain[chain.length - 1])}；` : `父節點${q(u)}的失敗連結指向${q(chain[0])}，`;
      const result = target === ROOT
        ? `${q(chain[chain.length - 1])}也沒有「${ch}」這條邊，所以 fail(${v}) = 根。`
        : `${q(chain[chain.length - 1])}有「${ch}」這條邊，所以 fail(${v}) = ${q(target)}。意思是比對到${q(v)}之後失敗時，已經讀到的結尾「${target}」還可能是某個關鍵字的開頭，不必從頭來。`;
      const extra = target !== ROOT && terminal.has(target) ? `而且${q(target)}本身是關鍵字，所以走到${q(v)}時也要一起回報「${target}」。` : "";
      snap(`${walk}${result}${extra}`, `fail(${v})`, "fail", { cur: v, trail: [u, ...chain].filter((x) => x !== ROOT), hotFail: [v, target] });
    }
  }

  // 掃描
  let state = ROOT;
  snap(`失敗連結補好了。第三步掃描文字「${TEXT}」：狀態從根開始，每讀一個字元就沿字典樹往下走；走不下去就沿失敗連結往回跳，直到能走或回到根。文字指標永遠只往前。`, "開始掃描", "scan", { cur: ROOT, pos: -1 });
  for (let i = 0; i < TEXT.length; i++) {
    const ch = TEXT[i];
    while (state !== ROOT && !kids[state][ch]) {
      const from = state;
      state = fails[state];
      snap(`讀到 T[${i}] = 「${ch}」：${q(from)}沒有「${ch}」這條邊，沿失敗連結跳到${q(state)}。已經讀過的「${TEXT.slice(i - from.length, i)}」不必重讀，它的結尾「${state}」直接沿用。`, `T[${i}] = ${ch}`, "scan", { cur: state, trail: [from], hotFail: [from, state], pos: i });
    }
    const before = state;
    state = kids[state][ch] ?? ROOT;
    const outs: string[] = [];
    for (let x = state; x !== ROOT; x = fails[x]) if (terminal.has(x)) outs.push(x);
    outs.forEach((w) => found.push({ word: w, end: i }));
    const move = kids[before][ch] ? `從${q(before)}沿「${ch}」走到${q(state)}。` : `根也沒有「${ch}」這條邊，留在根。`;
    const report = outs.length
      ? `${outs.map((w) => `「${w}」`).join("和")}是關鍵字，回報 ${outs.map((w) => `${w}（位置 ${i - w.length + 1} 到 ${i}）`).join("、")}。${outs.length > 1 ? `「${outs[1]}」是沿著失敗連結找到的：${outs[0]} 的結尾 ${outs[1]} 也是關鍵字。` : ""}`
      : "";
    snap(`讀到 T[${i}] = 「${ch}」：${move}${report}`, `T[${i}] = ${ch}`, "scan", { cur: state, pos: i, trail: outs.length > 1 ? outs.slice(1) : undefined });
  }
  snap(`掃描結束，共找到 ${found.length} 次：${found.map((f) => f.word).join("、")}。文字只從頭到尾讀一次，失敗連結的往回跳總次數不超過往下走的次數，所以掃描是 O(n + 回報的次數)，和關鍵字有幾個無關。`, "結束", "scan", { cur: state, pos: TEXT.length });
  return steps;
}

function toTree(nodes: string[]): GNode {
  const build = (id: string): GNode => ({
    id: id || "root",
    label: id ? id[id.length - 1] : "·",
    children: nodes.filter((n) => n.length === id.length + 1 && n.startsWith(id)).sort().map(build),
  });
  return build(ROOT);
}

const W = 440;
const R = 15;

export function TrieAppsDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];
  const placed = layoutForest([toTree(s.nodes)], W, 50, 24);
  const at = (id: string) => placed.find((p) => p.node.id === (id || "root"))!;
  const H = 24 + 5 * 50 - 8;

  const tone = (id: string) => {
    if (s.cur !== undefined && id === s.cur) return { fill: "var(--accent)", stroke: "var(--accent)", text: "var(--accent-ink)" };
    if (s.fresh?.includes(id)) return { fill: "var(--accent-soft)", stroke: "var(--accent)", text: "var(--accent)" };
    if (s.trail?.includes(id)) return { fill: "var(--amber-soft)", stroke: "var(--amber)", text: "var(--amber)" };
    if (WORDS.includes(id)) return { fill: "var(--green-soft)", stroke: "var(--green)", text: "var(--green)" };
    return { fill: "var(--surface)", stroke: "var(--line-strong)", text: "var(--ink)" };
  };

  const failCurve = (from: string, to: string, hot: boolean) => {
    const a = at(from), b = at(to);
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
    const bend = 34;
    const cx = mx + (dy / len) * bend, cy = my - (dx / len) * bend;
    const ex = b.x - ((b.x - cx) / Math.hypot(b.x - cx, b.y - cy)) * (R + 3);
    const ey = b.y - ((b.y - cy) / Math.hypot(b.x - cx, b.y - cy)) * (R + 3);
    return (
      <path key={`f${from}`} d={`M${a.x},${a.y} Q${cx},${cy} ${ex},${ey}`} fill="none" stroke={hot ? "var(--accent)" : "var(--amber)"} strokeWidth={hot ? 2.4 : 1.5} strokeDasharray="5 4" markerEnd={hot ? "url(#ac-arrow-accent)" : "url(#ac-arrow)"} opacity={hot ? 1 : 0.8} />
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={`關鍵字 ${WORDS.join(", ")} · 文字 "${TEXT}"`} />
      <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 border-b border-line px-3.5 py-2 text-[12px] text-ink-2">
        <span className="whitespace-nowrap"><i className={`mr-1.5 inline-block h-2.5 w-2.5 rounded-full border-[1.5px] align-[-1px] ${CELL.accent}`} />{s.phase === "scan" ? "目前狀態" : "正在處理的節點"}</span>
        <span className="whitespace-nowrap"><i className={`mr-1.5 inline-block h-2.5 w-2.5 rounded-full border-[1.5px] align-[-1px] ${CELL.green}`} />關鍵字結尾</span>
        <span className="whitespace-nowrap"><i className={`mr-1.5 inline-block h-2.5 w-2.5 rounded-full border-[1.5px] align-[-1px] ${CELL.amber}`} />{s.phase === "scan" ? "剛離開或一起回報的節點" : "查過的節點"}</span>
        <span className="whitespace-nowrap"><i className="mr-1.5 inline-block w-4 border-t-2 border-dashed border-amber align-[3px]" />失敗連結（不指向根的）</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Aho–Corasick 字典樹" className="block h-auto w-full">
        <defs>
          <marker id="ac-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--amber)" /></marker>
          <marker id="ac-arrow-accent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker>
        </defs>
        {placed.map((p) => p.parent && <line key={`e${p.node.id}`} x1={p.parent.x} y1={p.parent.y} x2={p.x} y2={p.y} stroke="var(--line-strong)" strokeWidth="1.5" />)}
        {Object.entries(s.fails).filter(([v, f]) => f !== ROOT && !(s.hotFail && s.hotFail[0] === v)).map(([v, f]) => failCurve(v, f, false))}
        {s.hotFail && s.hotFail[1] !== undefined && failCurve(s.hotFail[0], s.hotFail[1], true)}
        {placed.map((p) => {
          const id = p.node.id === "root" ? ROOT : p.node.id;
          const t = tone(id);
          return (
            <g key={`n${p.node.id}`}>
              <circle cx={p.x} cy={p.y} r={R} fill={t.fill} stroke={t.stroke} strokeWidth={t.stroke === "var(--line-strong)" ? 1.5 : 2.2} />
              <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize="12.5" fontWeight="500" fontFamily="var(--font-mono)" fill={t.text}>{p.node.label}</text>
              {WORDS.includes(id) && <text x={p.x + R + 4} y={p.y + 4} fontSize="10" fontFamily="var(--font-mono)" fill="var(--green)">{id}</text>}
            </g>
          );
        })}
      </svg>

      {s.phase === "scan" && (
        <div className="grid grid-cols-1 gap-2.5 border-t border-line p-3.5 sm:grid-cols-[auto_minmax(0,1fr)]">
          <div>
            <div className="eyebrow mb-1.5">文字（指標只往前）</div>
            <Cells items={TEXT.split("")} tone={(i) => (i === s.pos ? CELL.accent : s.pos !== undefined && i < s.pos ? CELL.dim : "")} />
          </div>
          <div>
            <div className="eyebrow mb-1.5">找到的關鍵字</div>
            <div className="flex flex-wrap gap-1.5">
              {s.found.length ? s.found.map((f, i) => (
                <span key={`${f.word}${i}`} className="rounded-full bg-green-soft px-2 py-0.5 font-mono text-[12.5px] text-green">{f.word} @ {f.end - f.word.length + 1}–{f.end}</span>
              )) : <span className="text-[12.5px] text-ink-3">還沒有</span>}
            </div>
          </div>
        </div>
      )}

      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
