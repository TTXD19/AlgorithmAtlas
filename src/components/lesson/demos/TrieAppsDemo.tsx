"use client";

import { useMemo, useState } from "react";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { layoutForest, type GNode } from "./tree-utils";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

/** Aho–Corasick：把關鍵字建成字典樹、補上失敗連結，再把文字從頭到尾掃一次 */
const WORDS = ["he", "she", "his", "hers"];
const HAYSTACK = "ushers";
const ROOT = "";

const TEXT = demoText(
  {
    listSeparator: "、",
    andSeparator: "和",
    root: "根",
    quote: (id: string) => `「${id}」`,
    opStart: "開始",
    opInsert: (w: string) => `插入 ${w}`,
    opFailLevel1: "失敗連結：第 1 層",
    opScanStart: "開始掃描",
    opEnd: "結束",
    intro: (count: number, list: string) =>
      `要在文字裡同時找 ${count} 個關鍵字：${list}。第一步和一般字典樹一樣，把每個關鍵字插進去，共用前綴的部分只存一次。`,
    insert: (w: string, sharedPart: string, freshPart: string) =>
      `插入「${w}」：${sharedPart}${freshPart}最後一個節點標記為關鍵字結尾（綠色）。`,
    insertShared: (count: number, prefix: string) => `前 ${count} 個字元「${prefix}」已經在樹上，沿著走下去，`,
    insertFresh: (list: string, count: number) => `新建${list}共 ${count} 個節點，`,
    failIntro: (list: string) =>
      `第二步用 BFS 一層一層補「失敗連結」：fail(v) 指向「v 的最長真後綴，而且這個後綴也在字典樹上」。第一層的${list}只有一個字，真後綴是空字串，所以都指向根。之後沒畫虛線的節點，失敗連結都指向根。`,
    walkJump: (parent: string, first: string, last: string, ch: string) =>
      `先看父節點${parent}的失敗連結${first}，它沒有「${ch}」，再往上跳到${last}；`,
    walkDirect: (parent: string, first: string) => `父節點${parent}的失敗連結指向${first}，`,
    resultRoot: (last: string, ch: string, v: string) => `${last}也沒有「${ch}」這條邊，所以 fail(${v}) = 根。`,
    resultFound: (last: string, ch: string, v: string, target: string, targetNode: string, vNode: string) =>
      `${last}有「${ch}」這條邊，所以 fail(${v}) = ${targetNode}。意思是比對到${vNode}之後失敗時，已經讀到的結尾「${target}」還可能是某個關鍵字的開頭，不必從頭來。`,
    alsoKeyword: (targetNode: string, vNode: string, target: string) =>
      `而且${targetNode}本身是關鍵字，所以走到${vNode}時也要一起回報「${target}」。`,
    scanIntro: (text: string) =>
      `失敗連結補好了。第三步掃描文字「${text}」：狀態從根開始，每讀一個字元就沿字典樹往下走；走不下去就沿失敗連結往回跳，直到能走或回到根。文字指標永遠只往前。`,
    failJump: (i: number, ch: string, from: string, to: string, read: string, suffix: string) =>
      `讀到 T[${i}] = 「${ch}」：${from}沒有「${ch}」這條邊，沿失敗連結跳到${to}。已經讀過的「${read}」不必重讀，它的結尾「${suffix}」直接沿用。`,
    scanStep: (i: number, ch: string, move: string, report: string) => `讀到 T[${i}] = 「${ch}」：${move}${report}`,
    moveDown: (from: string, ch: string, to: string) => `從${from}沿「${ch}」走到${to}。`,
    moveStay: (ch: string) => `根也沒有「${ch}」這條邊，留在根。`,
    report: (names: string, count: number, ranges: string) => `${names}是關鍵字，回報 ${ranges}。`,
    hitRange: (w: string, from: number, to: number) => `${w}（位置 ${from} 到 ${to}）`,
    reportChain: (second: string, first: string) => `「${second}」是沿著失敗連結找到的：${first} 的結尾 ${second} 也是關鍵字。`,
    finish: (count: number, list: string) =>
      `掃描結束，共找到 ${count} 次：${list}。文字只從頭到尾讀一次，失敗連結的往回跳總次數不超過往下走的次數，所以掃描是 O(n + 回報的次數)，和關鍵字有幾個無關。`,
    header: (words: string, text: string) => `關鍵字 ${words} · 文字 "${text}"`,
    graphLabel: "Aho–Corasick 字典樹",
    legendState: "目前狀態",
    legendNode: "正在處理的節點",
    legendKeywordEnd: "關鍵字結尾",
    legendJustLeft: "剛離開或一起回報的節點",
    legendChecked: "查過的節點",
    legendFailLink: "失敗連結（不指向根的）",
    textTitle: "文字（指標只往前）",
    foundTitle: "找到的關鍵字",
    nothingYet: "還沒有",
  },
  {
    en: {
      listSeparator: ", ",
      andSeparator: " and ",
      root: "the root",
      quote: (id: string) => `"${id}"`,
      opStart: "Start",
      opInsert: (w: string) => `insert ${w}`,
      opFailLevel1: "Fail links: level 1",
      opScanStart: "Start scanning",
      opEnd: "Done",
      intro: (count: number, list: string) =>
        `The goal is to find ${count} keywords in the text at once: ${list}. The first step is the same as for an ordinary trie — insert every keyword, storing each shared prefix only once.`,
      insert: (w: string, sharedPart: string, freshPart: string) =>
        `Insert "${w}": ${sharedPart}${freshPart}the last node is marked as the end of a keyword (green).`,
      insertShared: (count: number, prefix: string) => `the first ${count} character${count === 1 ? "" : "s"} "${prefix}" ${count === 1 ? "is" : "are"} already in the tree, so walk down along ${count === 1 ? "it" : "them"}; `,
      insertFresh: (list: string, count: number) => `this creates ${count} new node${count === 1 ? "" : "s"} (${list}); `,
      failIntro: (list: string) =>
        `The second step fills in the fail links level by level with a BFS. fail(v) points at the longest proper suffix of v that is itself a node of the trie. The level-one nodes ${list} are single characters whose only proper suffix is the empty string, so they all point at the root. Any node drawn without a dashed arrow from here on has a fail link to the root.`,
      walkJump: (parent: string, first: string, last: string, ch: string) =>
        `Start from the fail link of the parent ${parent}, which is ${first}; it has no "${ch}" edge, so jump further up to ${last}; `,
      walkDirect: (parent: string, first: string) => `The fail link of the parent ${parent} points at ${first}, and `,
      resultRoot: (last: string, ch: string, v: string) => `${last} has no "${ch}" edge, so fail(${v}) = the root.`,
      resultFound: (last: string, ch: string, v: string, target: string, targetNode: string, vNode: string) =>
        `${last} does have an edge for "${ch}", so fail(${v}) = ${targetNode}. In other words, when a match fails after reaching ${vNode}, the suffix "${target}" that has already been read may still be the start of another keyword, so the scan never has to go back.`,
      alsoKeyword: (targetNode: string, vNode: string, target: string) =>
        ` On top of that, ${targetNode} is a keyword in its own right, so arriving at ${vNode} has to report "${target}" as well.`,
      scanIntro: (text: string) =>
        `The fail links are in place. The third step scans the text "${text}": the state starts at the root, and every character read walks one edge down the trie. When there is no edge to take, follow the fail links back up until there is one or until the root is reached. The pointer into the text only ever moves forward.`,
      failJump: (i: number, ch: string, from: string, to: string, read: string, suffix: string) =>
        `Reading T[${i}] = "${ch}": ${from} has no "${ch}" edge, so follow the fail link to ${to}. The part already read, "${read}", does not have to be read again — its ending "${suffix}" carries straight over.`,
      scanStep: (i: number, ch: string, move: string, report: string) => `Reading T[${i}] = "${ch}": ${move}${report}`,
      moveDown: (from: string, ch: string, to: string) => `Walk from ${from} along "${ch}" to ${to}.`,
      moveStay: (ch: string) => `The root has no "${ch}" edge, so the state stays at the root.`,
      report: (names: string, count: number, ranges: string) => ` ${names} ${count === 1 ? "is a keyword" : "are keywords"}, so report ${ranges}.`,
      hitRange: (w: string, from: number, to: number) => `${w} (positions ${from} to ${to})`,
      reportChain: (second: string, first: string) => ` "${second}" turned up by following the fail link: it is a suffix of ${first} and a keyword in its own right.`,
      finish: (count: number, list: string) =>
        `The scan is over with ${count} match${count === 1 ? "" : "es"} in total: ${list}. The text is read once from start to finish, and the fail-link jumps can never outnumber the steps taken downwards, so the scan costs O(n + number of matches) — independent of how many keywords there are.`,
      header: (words: string, text: string) => `keywords ${words} · text "${text}"`,
      graphLabel: "Aho–Corasick trie",
      legendState: "Current state",
      legendNode: "Node being processed",
      legendKeywordEnd: "End of a keyword",
      legendJustLeft: "Just left, or reported alongside",
      legendChecked: "Nodes already checked",
      legendFailLink: "Fail links (those not pointing at the root)",
      textTitle: "The text (the pointer only moves forward)",
      foundTitle: "Keywords found",
      nothingYet: "none yet",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

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

const q = (t: T, id: string) => (id === ROOT ? t.root : t.quote(id));

function buildSteps(t: T): Step[] {
  const steps: Step[] = [];
  const nodes: string[] = [ROOT];
  const kids: Record<string, Record<string, string>> = { [ROOT]: {} };
  const terminal = new Set<string>();
  const fails: Record<string, string> = {};
  const found: Found[] = [];
  const snap = (desc: string, op: string, phase: Step["phase"], extra: Partial<Step> = {}) =>
    steps.push({ desc, op, phase, nodes: [...nodes], fails: { ...fails }, found: [...found], ...extra });

  snap(t.intro(WORDS.length, WORDS.join(t.listSeparator)), t.opStart, "build");
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
    snap(t.insert(w, shared ? t.insertShared(shared, w.slice(0, shared)) : "", fresh.length ? t.insertFresh(fresh.map((id) => q(t, id)).join(t.listSeparator), fresh.length) : ""), t.opInsert(w), "build", { cur, fresh });
  }

  // BFS 補失敗連結
  const depth1 = Object.values(kids[ROOT]);
  depth1.forEach((v) => (fails[v] = ROOT));
  snap(t.failIntro(depth1.map((id) => q(t, id)).join(t.listSeparator)), t.opFailLevel1, "fail", { trail: depth1 });
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
      const walk = chain.length > 1 ? t.walkJump(q(t, u), q(t, chain[0]), q(t, chain[chain.length - 1]), ch) : t.walkDirect(q(t, u), q(t, chain[0]));
      const result = target === ROOT
        ? t.resultRoot(q(t, chain[chain.length - 1]), ch, v)
        : t.resultFound(q(t, chain[chain.length - 1]), ch, v, target, q(t, target), q(t, v));
      const extra = target !== ROOT && terminal.has(target) ? t.alsoKeyword(q(t, target), q(t, v), target) : "";
      snap(`${walk}${result}${extra}`, `fail(${v})`, "fail", { cur: v, trail: [u, ...chain].filter((x) => x !== ROOT), hotFail: [v, target] });
    }
  }

  // 掃描
  let state = ROOT;
  snap(t.scanIntro(HAYSTACK), t.opScanStart, "scan", { cur: ROOT, pos: -1 });
  for (let i = 0; i < HAYSTACK.length; i++) {
    const ch = HAYSTACK[i];
    while (state !== ROOT && !kids[state][ch]) {
      const from = state;
      state = fails[state];
      snap(t.failJump(i, ch, q(t, from), q(t, state), HAYSTACK.slice(i - from.length, i), state), `T[${i}] = ${ch}`, "scan", { cur: state, trail: [from], hotFail: [from, state], pos: i });
    }
    const before = state;
    state = kids[state][ch] ?? ROOT;
    const outs: string[] = [];
    for (let x = state; x !== ROOT; x = fails[x]) if (terminal.has(x)) outs.push(x);
    outs.forEach((w) => found.push({ word: w, end: i }));
    const move = kids[before][ch] ? t.moveDown(q(t, before), ch, q(t, state)) : t.moveStay(ch);
    const report = outs.length
      ? `${t.report(outs.map((w) => t.quote(w)).join(t.andSeparator), outs.length, outs.map((w) => t.hitRange(w, i - w.length + 1, i)).join(t.listSeparator))}${outs.length > 1 ? t.reportChain(outs[1], outs[0]) : ""}`
      : "";
    snap(t.scanStep(i, ch, move, report), `T[${i}] = ${ch}`, "scan", { cur: state, pos: i, trail: outs.length > 1 ? outs.slice(1) : undefined });
  }
  snap(t.finish(found.length, found.map((f) => f.word).join(t.listSeparator)), t.opEnd, "scan", { cur: state, pos: HAYSTACK.length });
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
  const locale = useLocale();
  const t = TEXT[locale];
  const steps = useMemo(() => buildSteps(TEXT[locale]), [locale]);
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
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={t.header(WORDS.join(", "), HAYSTACK)} />
      <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 border-b border-line px-3.5 py-2 text-[12px] text-ink-2">
        <span className="whitespace-nowrap"><i className={`mr-1.5 inline-block h-2.5 w-2.5 rounded-full border-[1.5px] align-[-1px] ${CELL.accent}`} />{s.phase === "scan" ? t.legendState : t.legendNode}</span>
        <span className="whitespace-nowrap"><i className={`mr-1.5 inline-block h-2.5 w-2.5 rounded-full border-[1.5px] align-[-1px] ${CELL.green}`} />{t.legendKeywordEnd}</span>
        <span className="whitespace-nowrap"><i className={`mr-1.5 inline-block h-2.5 w-2.5 rounded-full border-[1.5px] align-[-1px] ${CELL.amber}`} />{s.phase === "scan" ? t.legendJustLeft : t.legendChecked}</span>
        <span className="whitespace-nowrap"><i className="mr-1.5 inline-block w-4 border-t-2 border-dashed border-amber align-[3px]" />{t.legendFailLink}</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t.graphLabel} className="block h-auto w-full">
        <defs>
          <marker id="ac-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--amber)" /></marker>
          <marker id="ac-arrow-accent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker>
        </defs>
        {placed.map((p) => p.parent && <line key={`e${p.node.id}`} x1={p.parent.x} y1={p.parent.y} x2={p.x} y2={p.y} stroke="var(--line-strong)" strokeWidth="1.5" />)}
        {Object.entries(s.fails).filter(([v, f]) => f !== ROOT && !(s.hotFail && s.hotFail[0] === v)).map(([v, f]) => failCurve(v, f, false))}
        {s.hotFail && s.hotFail[1] !== undefined && failCurve(s.hotFail[0], s.hotFail[1], true)}
        {placed.map((p) => {
          const id = p.node.id === "root" ? ROOT : p.node.id;
          const nt = tone(id);
          return (
            <g key={`n${p.node.id}`}>
              <circle cx={p.x} cy={p.y} r={R} fill={nt.fill} stroke={nt.stroke} strokeWidth={nt.stroke === "var(--line-strong)" ? 1.5 : 2.2} />
              <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize="12.5" fontWeight="500" fontFamily="var(--font-mono)" fill={nt.text}>{p.node.label}</text>
              {WORDS.includes(id) && <text x={p.x + R + 4} y={p.y + 4} fontSize="10" fontFamily="var(--font-mono)" fill="var(--green)">{id}</text>}
            </g>
          );
        })}
      </svg>

      {s.phase === "scan" && (
        <div className="grid grid-cols-1 gap-2.5 border-t border-line p-3.5 sm:grid-cols-[auto_minmax(0,1fr)]">
          <div>
            <div className="eyebrow mb-1.5">{t.textTitle}</div>
            <Cells items={HAYSTACK.split("")} tone={(i) => (i === s.pos ? CELL.accent : s.pos !== undefined && i < s.pos ? CELL.dim : "")} />
          </div>
          <div>
            <div className="eyebrow mb-1.5">{t.foundTitle}</div>
            <div className="flex flex-wrap gap-1.5">
              {s.found.length ? s.found.map((f, i) => (
                <span key={`${f.word}${i}`} className="rounded-full bg-green-soft px-2 py-0.5 font-mono text-[12.5px] text-green">{f.word} @ {f.end - f.word.length + 1}–{f.end}</span>
              )) : <span className="text-[12.5px] text-ink-3">{t.nothingYet}</span>}
            </div>
          </div>
        </div>
      )}

      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
