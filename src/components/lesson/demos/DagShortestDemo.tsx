"use client";

import { useMemo, useState, type ReactNode } from "react";
import { StepHeader, StepFooter, Cells, CELL, BTN } from "./StepBar";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

type Mode = "short" | "long";

interface Graph {
  /** 已經是拓撲順序 */
  order: string[];
  pos: Record<string, [number, number]>;
  edges: [string, string, number][];
  source: string;
  r: number;
}

const TEXT = demoText(
  {
    jobStart: "開工",
    jobSpec: "規格",
    jobBackend: "後端",
    jobFrontend: "前端",
    jobDocs: "文件",
    jobTest: "測試",
    jobLaunch: "上線",
    tabShort: "最短路徑（含負權）",
    tabLong: "最長路徑：專案排程",
    opInit: "初始化",
    opProcess: (u: string) => `處理 ${u}`,
    opEnd: "結束",
    opCritical: "關鍵路徑",
    initShort: (order: string, source: string) =>
      `節點已經照拓撲順序排好（下方那一列）：${order}，每條邊都從左邊的節點指向右邊。起點 ${source} 設為 0，其餘 ∞。接下來照這個順序處理每個節點，把它的出邊各鬆弛一次。`,
    initLong: (jobs: number, order: string, start: string) =>
      `專案有 ${jobs} 項工作，箭頭 u → v 表示 v 要等 u 做完才能開始，邊上的數字是 u 要做幾天。拓撲順序：${order}。dist[v] 是 v 最早可以開工的日子，要等「所有」前置工作都完成，所以取最大值：${start}設為 0，其餘先設為 −∞。`,
    unreachable: (u: string, d: string, outs: number, source: string) =>
      `輪到 ${u}，但 dist[${u}] = ${d}：從起點根本走不到它，它的 ${outs} 條出邊都不能拿來鬆弛，直接跳過。${u} 排在 ${source} 前面，所以一定走不到。`,
    noOutShort: (u: string, d: string) => `輪到 ${u}，dist[${u}] = ${d}。它沒有出邊，不用鬆弛。`,
    noOutLong: (u: string, d: number) => `輪到${u}，最早第 ${d} 天。它沒有後續工作，不用鬆弛。`,
    leadShort: (u: string, d: string) => `輪到 ${u}：指向它的邊都在前面處理過了，dist[${u}] = ${d} 已經是最終答案。`,
    leadLong: (u: string, d: number) => `輪到${u}：它的前置工作都處理過了，最早第 ${d} 天可以開始，不會再變。`,
    relaxShort: (a: string, b: string, w: string, da: string, ww: string, cand: string, tail: string) =>
      `${a} → ${b}（${w}）：${da} + ${ww} = ${cand}，${tail}`,
    relaxShortYes: (b: string, old: string, cand: string) => `比目前的 ${old} 小，更新 dist[${b}] = ${cand}。`,
    relaxShortNo: (old: string) => `沒有比目前的 ${old} 小，不更新。`,
    relaxLong: (a: string, b: string, w: number, da: number, cand: number, tail: string) =>
      `${a} → ${b}（${a}要做 ${w} 天）：${da} + ${w} = ${cand}，${tail}`,
    relaxLongYes: (b: string, old: string, cand: number) => `比目前的 ${old} 晚，${b}最早要第 ${cand} 天才能開始。`,
    relaxLongNo: (old: string) => `沒有比目前的第 ${old} 天晚，不更新。`,
    listJoin: "、",
    endShort: (reach: string) =>
      `全部處理完：${reach}，R 走不到仍是 ∞。每個節點、每條邊都只看一次，O(V + E)。有負權邊也沒關係：處理 u 的時候，所有指向 u 的邊都已經鬆弛過，dist[u] 不會再變。Y 和 Z 都被更新了兩次，後來的值來自負權邊 X → Y 和 Y → Z。`,
    endLong: (launch: string, total: number, path: string, frontend: string, frontDone: number, test: string, testStart: number, frontSlack: number, docs: string, docsSlack: number) =>
      `${launch}最早在第 ${total} 天，這就是總工期。沿著 parent 往回走得到關鍵路徑 ${path}：這條路上任何一項工作延誤一天，${launch}就晚一天。不在路上的工作有浮動時間，${frontend}第 ${frontDone} 天做完，但${test}第 ${testStart} 天才開始，可以晚 ${frontSlack} 天；${docs}可以晚 ${docsSlack} 天。`,
    legendCur: "正在處理的節點",
    legendKnown: "已有距離",
    legendRelax: "正在鬆弛的邊",
    legendTreeShort: "目前最短路徑樹",
    legendTreeLong: "目前最晚的前置工作",
    svgAria: "DAG 最短路徑示範圖",
    orderTitle: "拓撲順序（綠色 = 已處理，藍色 = 正在處理）",
    nodeRow: "節點",
    distRowShort: "dist",
    distRowLong: "最早開始",
    durTitle: "工作天數",
  },
  {
    en: {
      jobStart: "Start",
      jobSpec: "Spec",
      jobBackend: "API",
      jobFrontend: "UI",
      jobDocs: "Docs",
      jobTest: "Test",
      jobLaunch: "Ship",
      tabShort: "Shortest path (negative weights)",
      tabLong: "Longest path: project schedule",
      opInit: "initialise",
      opProcess: (u: string) => `process ${u}`,
      opEnd: "done",
      opCritical: "critical path",
      initShort: (order: string, source: string) =>
        `The nodes are already in topological order — that is the row below: ${order}. Every edge runs from a node on the left to one on the right. The source ${source} starts at 0 and everything else at ∞. Now walk the nodes in that order and relax each outgoing edge once.`,
      initLong: (jobs: number, order: string, start: string) =>
        `The project has ${jobs} tasks. An arrow u → v means v cannot begin until u is finished, and the number on the edge is how many days u takes. Topological order: ${order}. dist[v] is the earliest day v can begin, and it has to wait for every prerequisite, so we take the maximum: ${start} is day 0 and everything else starts at −∞.`,
      unreachable: (u: string, d: string, outs: number, source: string) =>
        `Now for ${u}, but dist[${u}] = ${d}: there is no way to reach it from the source, so none of its ${outs} outgoing edges can be relaxed and it is skipped. ${u} comes before ${source} in the order, so it can never be reached.`,
      noOutShort: (u: string, d: string) => `Now for ${u}, with dist[${u}] = ${d}. It has no outgoing edges, so there is nothing to relax.`,
      noOutLong: (u: string, d: number) => `Now for ${u}: it can begin on day ${d}. Nothing depends on it, so there is nothing to relax.`,
      leadShort: (u: string, d: string) => `Now for ${u}: every edge into it has already been processed, so dist[${u}] = ${d} is final. `,
      leadLong: (u: string, d: number) => `Now for ${u}: all of its prerequisites are done, so day ${d} is its earliest start and that will not change. `,
      relaxShort: (a: string, b: string, w: string, da: string, ww: string, cand: string, tail: string) =>
        `${a} → ${b} (${w}): ${da} + ${ww} = ${cand}, ${tail}`,
      relaxShortYes: (b: string, old: string, cand: string) => `which is smaller than the current ${old}, so dist[${b}] becomes ${cand}.`,
      relaxShortNo: (old: string) => `which is not smaller than the current ${old}, so nothing changes.`,
      relaxLong: (a: string, b: string, w: number, da: number, cand: number, tail: string) =>
        `${a} → ${b} (${a} takes ${w} days): ${da} + ${w} = ${cand}, ${tail}`,
      relaxLongYes: (b: string, old: string, cand: number) => `which is later than the current ${old}, so ${b} cannot begin before day ${cand}.`,
      relaxLongNo: (old: string) => `which is no later than the current day ${old}, so nothing changes.`,
      listJoin: ", ",
      endShort: (reach: string) =>
        `Everything has been processed: ${reach}, and R stays at ∞ because it is unreachable. Each node and each edge is looked at exactly once, O(V + E). Negative weights cause no trouble: by the time u is processed, every edge into u has already been relaxed, so dist[u] can no longer change. Y and Z were each updated twice, and their final values come from the negative edges X → Y and Y → Z.`,
      endLong: (launch: string, total: number, path: string, frontend: string, frontDone: number, test: string, testStart: number, frontSlack: number, docs: string, docsSlack: number) =>
        `${launch} can happen on day ${total} at the earliest, and that is the length of the whole project. Following the parent pointers back gives the critical path ${path}: one day of delay on any task along it pushes ${launch} back by a day. Tasks off the path have slack — ${frontend} is finished on day ${frontDone} but ${test} does not begin until day ${testStart}, so it can slip ${frontSlack} days, and ${docs} can slip ${docsSlack} days.`,
      legendCur: "node being processed",
      legendKnown: "distance known",
      legendRelax: "edge being relaxed",
      legendTreeShort: "shortest-path tree so far",
      legendTreeLong: "latest prerequisite so far",
      svgAria: "DAG shortest path diagram",
      orderTitle: "Topological order (green = processed, blue = being processed)",
      nodeRow: "Node",
      distRowShort: "dist",
      distRowLong: "Earliest start",
      durTitle: "Days per task",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

/** 例子 1：含負權邊的 DAG，起點 S；R 排在 S 前面，從 S 走不到 */
const SHORT: Graph = {
  order: ["R", "S", "T", "X", "Y", "Z"],
  pos: { R: [45, 150], S: [135, 60], T: [225, 200], X: [325, 60], Y: [415, 200], Z: [505, 120] },
  edges: [["R", "S", 5], ["R", "T", 3], ["S", "T", 2], ["S", "X", 6], ["T", "X", 7], ["T", "Y", 4], ["T", "Z", 2], ["X", "Y", -1], ["X", "Z", 1], ["Y", "Z", -2]],
  source: "S",
  r: 18,
};

/** 例子 2：專案排程。邊 u → v 的權重是「u 這項工作要做幾天」，最長路徑 = 最早可以開始的時間 */
interface Long {
  g: Graph;
  dur: Record<string, number>;
  names: { start: string; spec: string; backend: string; frontend: string; docs: string; test: string; launch: string };
}

function buildLong(t: T): Long {
  const names = {
    start: t.jobStart, spec: t.jobSpec, backend: t.jobBackend,
    frontend: t.jobFrontend, docs: t.jobDocs, test: t.jobTest, launch: t.jobLaunch,
  };
  const dur: Record<string, number> = {
    [names.start]: 0, [names.spec]: 3, [names.backend]: 6, [names.frontend]: 4,
    [names.docs]: 2, [names.test]: 3, [names.launch]: 0,
  };
  const g: Graph = {
    order: [names.start, names.spec, names.backend, names.frontend, names.docs, names.test, names.launch],
    pos: {
      [names.start]: [42, 130], [names.spec]: [135, 130], [names.backend]: [255, 55], [names.frontend]: [255, 205],
      [names.docs]: [395, 210], [names.test]: [395, 80], [names.launch]: [510, 140],
    },
    edges: ([
      [names.start, names.spec], [names.spec, names.backend], [names.spec, names.frontend], [names.spec, names.docs],
      [names.backend, names.test], [names.frontend, names.test], [names.docs, names.launch], [names.test, names.launch],
    ] as [string, string][]).map(([u, v]) => [u, v, dur[u]] as [string, string, number]),
    source: names.start,
    r: 21,
  };
  return { g, dur, names };
}

interface Step {
  desc: string;
  op: string;
  dist: Record<string, number>;
  parent: Record<string, string>;
  cur: string | null;
  probe: [string, string] | null;
  done: string[];
  critical?: [string, string][];
}

const fmtW = (w: number) => (w < 0 ? `(−${-w})` : String(w));

function buildSteps(t: T, mode: Mode, long: Long): Step[] {
  const g = mode === "short" ? SHORT : long.g;
  const worst = mode === "short" ? Infinity : -Infinity;
  const better = (a: number, b: number) => (mode === "short" ? a < b : a > b);
  const fmt = (x: number) => (x === Infinity ? "∞" : x === -Infinity ? "−∞" : x < 0 ? `−${-x}` : String(x));
  const dist: Record<string, number> = Object.fromEntries(g.order.map((n) => [n, worst]));
  const parent: Record<string, string> = {};
  const done: string[] = [];
  const steps: Step[] = [];
  const snap = (desc: string, op: string, cur: string | null = null, probe: [string, string] | null = null, extra: Partial<Step> = {}) =>
    steps.push({ desc, op, dist: { ...dist }, parent: { ...parent }, cur, probe, done: [...done], ...extra });

  dist[g.source] = 0;
  if (mode === "short") {
    snap(t.initShort(g.order.join(" → "), g.source), t.opInit);
  } else {
    snap(t.initLong(g.order.length - 2, g.order.join(" → "), g.source), t.opInit);
  }

  for (const u of g.order) {
    const out = g.edges.filter(([a]) => a === u);
    if (dist[u] === worst) {
      done.push(u);
      snap(t.unreachable(u, fmt(dist[u]), out.length, g.source), t.opProcess(u), u);
      continue;
    }
    if (out.length === 0) {
      done.push(u);
      snap(mode === "short" ? t.noOutShort(u, fmt(dist[u])) : t.noOutLong(u, dist[u]), t.opProcess(u), u);
      continue;
    }
    out.forEach(([a, b, w], idx) => {
      const cand = dist[a] + w;
      const upd = better(cand, dist[b]);
      const old = dist[b];
      if (upd) { dist[b] = cand; parent[b] = a; }
      let text: string;
      if (mode === "short") {
        const lead = idx === 0 ? t.leadShort(u, fmt(dist[u])) : "";
        text = `${lead}${t.relaxShort(a, b, fmt(w), fmt(dist[a]), fmtW(w), fmt(cand), upd ? t.relaxShortYes(b, fmt(old), fmt(cand)) : t.relaxShortNo(fmt(old)))}`;
      } else {
        const lead = idx === 0 ? t.leadLong(u, dist[u]) : "";
        text = `${lead}${t.relaxLong(a, b, w, dist[a], cand, upd ? t.relaxLongYes(b, fmt(old), cand) : t.relaxLongNo(fmt(old)))}`;
      }
      snap(text, t.opProcess(u), u, [a, b]);
    });
    done.push(u);
  }

  if (mode === "short") {
    const reach = g.order.filter((n) => dist[n] !== Infinity).map((n) => `${n} = ${fmt(dist[n])}`).join(t.listJoin);
    snap(t.endShort(reach), t.opEnd);
  } else {
    const { names, dur } = long;
    const last = g.order[g.order.length - 1];
    const critical: [string, string][] = [];
    for (let v = last; parent[v]; v = parent[v]) critical.unshift([parent[v], v]);
    const pathNodes = [critical[0][0], ...critical.map(([, v]) => v)];
    const front = dist[names.test] - (dist[names.frontend] + dur[names.frontend]);
    const docs = dist[names.launch] - (dist[names.docs] + dur[names.docs]);
    snap(
      t.endLong(
        names.launch, dist[last], pathNodes.join(" → "),
        names.frontend, dist[names.frontend] + dur[names.frontend],
        names.test, dist[names.test], front,
        names.docs, docs,
      ),
      t.opCritical, null, null, { critical },
    );
  }
  return steps;
}

export function DagShortestDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const long = useMemo(() => buildLong(TEXT[locale]), [locale]);
  const shortSteps = useMemo(() => buildSteps(TEXT[locale], "short", long), [locale, long]);
  const longSteps = useMemo(() => buildSteps(TEXT[locale], "long", long), [locale, long]);
  const [mode, setMode] = useState<Mode>("short");
  const [k, setK] = useState(0);
  const steps = mode === "short" ? shortSteps : longSteps;
  const g = mode === "short" ? SHORT : long.g;
  const s = steps[Math.min(k, steps.length - 1)];
  const switchMode = (m: Mode) => { setMode(m); setK(0); };
  const fmt = (x: number) => (x === Infinity ? "∞" : x === -Infinity ? "−∞" : String(x));
  const isParent = (a: string, b: string) => s.parent[b] === a;
  const isCritical = (a: string, b: string) => !!s.critical?.some(([x, y]) => x === a && y === b);
  const unknown = (x: number) => x === Infinity || x === -Infinity;

  return (
    <div className="@container overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader
        k={Math.min(k, steps.length - 1)}
        total={steps.length}
        setK={setK}
        left={
          <div className="flex gap-1">
            {(["short", "long"] as Mode[]).map((m) => (
              <button key={m} type="button" className={`${BTN} ${mode === m ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface hover:bg-surface-2"}`} onClick={() => switchMode(m)}>
                {m === "short" ? t.tabShort : t.tabLong}
              </button>
            ))}
          </div>
        }
        right={<span className="font-mono">{s.op}</span>}
      />
      <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 border-b border-line px-3.5 py-2 text-[12px] text-ink-2">
        <Legend cls="border-accent bg-accent">{t.legendCur}</Legend>
        <Legend cls="border-amber bg-amber-soft">{t.legendKnown}</Legend>
        <span className="whitespace-nowrap"><i className="mr-1.5 inline-block h-0.5 w-4 bg-amber align-[3px]" />{t.legendRelax}</span>
        <span className="whitespace-nowrap"><i className="mr-1.5 inline-block h-0.5 w-4 bg-accent align-[3px]" />{mode === "short" ? t.legendTreeShort : t.legendTreeLong}</span>
      </div>

      <svg viewBox="0 0 550 260" role="img" aria-label={t.svgAria} className="block h-auto w-full">
        <defs>
          <marker id="dag-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--line-strong)" /></marker>
          <marker id="dag-arrow-accent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" /></marker>
          <marker id="dag-arrow-amber" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--amber)" /></marker>
        </defs>
        {g.edges.map(([a, b, w]) => {
          const [x1, y1] = g.pos[a], [x2, y2] = g.pos[b];
          const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
          const sx = x1 + (dx / len) * g.r, sy = y1 + (dy / len) * g.r;
          const ex = x2 - (dx / len) * (g.r + 3), ey = y2 - (dy / len) * (g.r + 3);
          const probe = !!s.probe && s.probe[0] === a && s.probe[1] === b;
          const tree = isCritical(a, b) || (!s.critical && isParent(a, b));
          const stroke = probe ? "var(--amber)" : tree ? "var(--accent)" : "var(--line-strong)";
          const marker = probe ? "url(#dag-arrow-amber)" : tree ? "url(#dag-arrow-accent)" : "url(#dag-arrow)";
          const mx = (x1 + x2) / 2 + (-dy / len) * 11, my = (y1 + y2) / 2 + (dx / len) * 11;
          return (
            <g key={a + b}>
              <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={stroke} strokeWidth={probe || isCritical(a, b) ? 3 : tree ? 2.5 : 1.5} markerEnd={marker} />
              <rect x={mx - 10} y={my - 7} width="20" height="14" rx="3" fill="var(--surface)" />
              <text x={mx} y={my} textAnchor="middle" dominantBaseline="central" fontSize="10.5" fontFamily="var(--font-mono)" fill={w < 0 ? "var(--amber)" : "var(--ink-2)"} fontWeight={probe ? 600 : 400}>{w < 0 ? `−${-w}` : w}</text>
            </g>
          );
        })}
        {g.order.map((n) => {
          const [x, y] = g.pos[n];
          const state = s.cur === n || (s.probe && s.probe[1] === n) ? "c" : !unknown(s.dist[n]) ? "q" : "";
          const below = y > 130;
          return (
            <g key={n} className={`node ${state}`}>
              <circle cx={x} cy={y} r={g.r} />
              <text className="lbl" x={x} y={y} style={g.r > 18 ? { fontSize: "12px" } : undefined}>{n}</text>
              <text className="dist" x={x} y={below ? y + g.r + 12 : y - g.r - 10}>d={fmt(s.dist[n])}</text>
            </g>
          );
        })}
      </svg>

      <div className="border-t border-line p-3.5">
        <div className="eyebrow mb-1.5">{t.orderTitle}</div>
        <div className="overflow-x-auto">
          <div className="grid min-w-[300px] gap-1" style={{ gridTemplateColumns: `3.6rem repeat(${g.order.length}, minmax(0, 1fr))` }}>
            <span className="self-center text-[11.5px] text-ink-3">{t.nodeRow}</span>
            {g.order.map((n) => (
              <span key={`n${n}`} className={`grid h-8 min-w-0 place-items-center rounded-md border font-mono text-[12.5px] ${s.cur === n ? CELL.accent : s.done.includes(n) ? CELL.green : "border-line-strong bg-surface text-ink"}`}>{n}</span>
            ))}
            <span className="self-center text-[11.5px] text-ink-3">{mode === "short" ? t.distRowShort : t.distRowLong}</span>
            {g.order.map((n) => (
              <span key={`d${n}`} className={`grid h-8 min-w-0 place-items-center rounded-md border font-mono text-[12.5px] tabular-nums ${s.probe && s.probe[1] === n ? CELL.amber : unknown(s.dist[n]) ? CELL.dim : "border-line-strong bg-surface text-ink"}`}>{fmt(s.dist[n])}</span>
            ))}
          </div>
        </div>
        {mode === "long" && (
          <div className="mt-2.5">
            <div className="eyebrow mb-1">{t.durTitle}</div>
            <Cells items={long.g.order.slice(1, -1).map((n) => `${n} ${long.dur[n]}`)} w="w-[4.2rem]" />
          </div>
        )}
      </div>

      <StepFooter k={Math.min(k, steps.length - 1)} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}

function Legend({ cls, children }: { cls: string; children: ReactNode }) {
  return (
    <span className="whitespace-nowrap">
      <i className={`mr-1.5 inline-block h-2.5 w-2.5 rounded-full border-[1.5px] align-[-1px] ${cls}`} />
      {children}
    </span>
  );
}
