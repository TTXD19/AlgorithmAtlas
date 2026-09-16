"use client";

import { useMemo, useState } from "react";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { StepHeader, StepFooter } from "./StepBar";

/** 區間排程：7 個時段，最多能選幾個互不重疊的？最佳解是 4 個（B、C、D、F）。 */
interface Iv { id: string; s: number; e: number }
const IVS: Iv[] = [
  { id: "A", s: 0, e: 12 }, { id: "B", s: 1, e: 5 }, { id: "S", s: 4, e: 7 }, { id: "C", s: 6, e: 10 },
  { id: "D", s: 11, e: 14 }, { id: "E", s: 13, e: 16 }, { id: "F", s: 15, e: 18 },
];
const T_MAX = 18;
const OPT_IDS = ["B", "C", "D", "F"];

const TEXT = demoText(
  {
    sep: "、",
    strategyLabel: "貪婪策略",
    caption: "7 個區間 · 最佳解 4 個",
    timeline: "區間時間軸",
    resultLabel: "結果",
    greedy: "貪婪",
    optimum: (n: number) => ` / 最佳 ${n}`,
    legend: "藍色已選、虛線被跳過。按時間順序處理的策略會畫出黃線，標出已選區間最後的結束時間。結束後綠色字母是最佳解。",
    whyRight: "為什麼對",
    whyWrong: "為什麼錯",
    startLabel: "最早開始",
    startRule: "按開始時間排序，和已選的不衝突就選",
    startArgument: "反例：A 最早開始，但它很長，把 0 到 12 整段佔掉，B、S、C、D 全被擋住。「開始得早」和「留給後面的空間多」沒有關係，所以無法用交換論證證明它。",
    shortLabel: "最短",
    shortRule: "按長度排序（同長度先看開始時間），不衝突就選",
    shortArgument: "反例：S 最短，但它正好橫跨 B 和 C 的交界。選一個 S 就同時損失 B 和 C 兩個。「短」不保證「結束得早」，交換時可能要換掉兩個以上，論證失敗。",
    endLabel: "最早結束",
    endRule: "按結束時間排序，和已選的不衝突就選",
    endArgument: "交換論證：設任何一個最佳解裡最早結束的區間是 O₁，貪婪選的第一個是 G₁。G₁ 是全部區間裡最早結束的，所以 G₁ 的結束時間 ≤ O₁ 的。把 O₁ 換成 G₁，其餘區間都在 O₁ 之後開始，換完仍然不衝突，數量不變。於是存在一個以 G₁ 開頭的最佳解；對剩下的區間重複同樣的論證，貪婪解每一步都和某個最佳解一致。",
    intro: (label: string, rule: string, order: string) =>
      `策略「${label}」：${rule}。排序後的順序是 ${order}。`,
    startsAfter: (start: number, lastEnd: number) =>
      `在 ${start} 開始，不早於已選區間最後的結束時間 ${lastEnd}，`,
    pickFirst: "還沒有選任何區間，直接選它。",
    pickFit: (note: string) => `${note}和已選的區間都不重疊，選它。`,
    choose: (id: string, s: number, e: number, reason: string) => `${id}（${s}–${e}）${reason}`,
    skip: (id: string, s: number, e: number, hitId: string, hitS: number, hitE: number) =>
      `${id}（${s}–${e}）和已選的 ${hitId}（${hitS}–${hitE}）重疊，跳過。`,
    done: (count: number, list: string, optCount: number, optList: string, verdict: string) =>
      `結束。選了 ${count} 個：${list}。最佳解是 ${optCount} 個（${optList}）。${verdict}`,
    verdictOk: "這個策略拿到最佳解，而且下方的交換論證保證它在任何輸入上都對。",
    verdictBad: "比最佳解少，這個策略不對。一個反例就足以否定一個貪婪策略。",
  },
  {
    en: {
      sep: ", ",
      strategyLabel: "Greedy rule",
      caption: "7 intervals · optimum is 4",
      timeline: "Interval timeline",
      resultLabel: "Result",
      greedy: "Greedy",
      optimum: (n: number) => ` / optimum ${n}`,
      legend: "Blue intervals were chosen and dashed ones were skipped. Rules that process intervals in time order also draw an amber line at the finish time of the last chosen interval. At the end, green labels mark the optimal solution.",
      whyRight: "Why it works",
      whyWrong: "Why it fails",
      startLabel: "Earliest start",
      startRule: "Sort by start time, then take every interval that does not clash with the ones already chosen",
      startArgument: "Counterexample: A starts earliest, but it is long — it occupies the whole span from 0 to 12 and blocks B, S, C and D. Starting early has nothing to do with leaving room for what comes after, so no exchange argument can prove this rule correct.",
      shortLabel: "Shortest",
      shortRule: "Sort by length (ties broken by start time), then take every interval that does not clash",
      shortArgument: "Counterexample: S is the shortest interval, but it straddles the boundary between B and C. Taking S alone costs us both B and C. Being short does not imply finishing early, so an exchange may have to give back two intervals or more, and the argument breaks down.",
      endLabel: "Earliest finish",
      endRule: "Sort by finish time, then take every interval that does not clash with the ones already chosen",
      endArgument: "Exchange argument: let O₁ be the earliest-finishing interval of any optimal solution, and let G₁ be the first interval the greedy rule takes. G₁ finishes earliest of all intervals, so its finish time is ≤ that of O₁. Swap O₁ for G₁: every other interval in the solution starts after O₁ ends, so nothing clashes and the count is unchanged. An optimal solution beginning with G₁ therefore exists, and repeating the argument on the remaining intervals shows that every greedy choice agrees with some optimal solution.",
      intro: (label: string, rule: string, order: string) =>
        `Strategy "${label}": ${rule}. The sorted order is ${order}.`,
      startsAfter: (start: number, lastEnd: number) =>
        `it starts at ${start}, no earlier than ${lastEnd}, the finish time of the last chosen interval, and `,
      pickFirst: "nothing has been chosen yet, so we take it.",
      pickFit: (note: string) => `${note}it does not overlap anything chosen so far, so we take it.`,
      choose: (id: string, s: number, e: number, reason: string) => `${id} (${s}–${e}): ${reason}`,
      skip: (id: string, s: number, e: number, hitId: string, hitS: number, hitE: number) =>
        `${id} (${s}–${e}) overlaps the already chosen ${hitId} (${hitS}–${hitE}), so skip it.`,
      done: (count: number, list: string, optCount: number, optList: string, verdict: string) =>
        `Finished with ${count} intervals: ${list}. The optimum is ${optCount} (${optList}). ${verdict}`,
      verdictOk: "This rule reaches the optimum, and the exchange argument below guarantees it does so on every input.",
      verdictBad: "That is fewer than the optimum, so the rule is wrong. A single counterexample is enough to rule out a greedy strategy.",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

type Strategy = "start" | "short" | "end";

function strategies(t: T): { key: Strategy; label: string; rule: string; argument: string }[] {
  return [
    { key: "start", label: t.startLabel, rule: t.startRule, argument: t.startArgument },
    { key: "short", label: t.shortLabel, rule: t.shortRule, argument: t.shortArgument },
    { key: "end", label: t.endLabel, rule: t.endRule, argument: t.endArgument },
  ];
}

function order(st: Strategy): Iv[] {
  const a = [...IVS];
  if (st === "start") a.sort((x, y) => x.s - y.s);
  else if (st === "short") a.sort((x, y) => (x.e - x.s) - (y.e - y.s) || x.s - y.s);
  else a.sort((x, y) => x.e - y.e);
  return a;
}

interface Step { desc: string; chosen: string[]; rejected: string[]; cur?: string; lastEnd: number; done: boolean }

function buildSteps(t: T, st: Strategy): Step[] {
  const meta = strategies(t).find((x) => x.key === st)!;
  const ord = order(st);
  const steps: Step[] = [];
  const chosen: string[] = [];
  const chosenIvs: Iv[] = [];
  const rejected: string[] = [];
  /** 按時間順序處理（最早開始、最早結束）時，只要和最後的結束時間比；最短優先會跳回較早的時段，要和每個已選的比 */
  const timeOrdered = st !== "short";
  let lastEnd = 0;
  const line = () => (timeOrdered ? lastEnd : 0);
  steps.push({ desc: t.intro(meta.label, meta.rule, ord.map((v) => v.id).join(" → ")), chosen: [], rejected: [], lastEnd: 0, done: false });
  for (const iv of ord) {
    const hit = chosenIvs.find((c) => !(iv.e <= c.s || iv.s >= c.e));
    if (!hit) {
      const note = timeOrdered && chosenIvs.length ? t.startsAfter(iv.s, lastEnd) : "";
      chosen.push(iv.id);
      chosenIvs.push(iv);
      lastEnd = Math.max(lastEnd, iv.e);
      const reason = chosen.length === 1 ? t.pickFirst : t.pickFit(note);
      steps.push({ desc: t.choose(iv.id, iv.s, iv.e, reason), chosen: [...chosen], rejected: [...rejected], cur: iv.id, lastEnd: line(), done: false });
    } else {
      rejected.push(iv.id);
      steps.push({ desc: t.skip(iv.id, iv.s, iv.e, hit.id, hit.s, hit.e), chosen: [...chosen], rejected: [...rejected], cur: iv.id, lastEnd: line(), done: false });
    }
  }
  const ok = chosen.length === OPT_IDS.length;
  steps.push({
    desc: t.done(chosen.length, chosen.join(t.sep), OPT_IDS.length, OPT_IDS.join(t.sep), ok ? t.verdictOk : t.verdictBad),
    chosen: [...chosen], rejected: [...rejected], lastEnd: line(), done: true,
  });
  return steps;
}

const W = 640, LEFT = 44, ROW = 24, TOP = 16;

export function GreedyPrinciplesDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const [st, setSt] = useState<Strategy>("end");
  const [k, setK] = useState(0);
  const steps = useMemo(() => buildSteps(TEXT[locale], st), [locale, st]);
  const options = useMemo(() => strategies(TEXT[locale]), [locale]);
  const s = steps[k];
  const meta = options.find((x) => x.key === st)!;
  const x = (time: number) => LEFT + (time / T_MAX) * (W - LEFT - 16);
  const H = TOP + IVS.length * ROW + 26;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <span>{t.strategyLabel}</span>
        <div className="flex flex-wrap gap-1.5">
          {options.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => { setSt(o.key); setK(0); }}
              className={`h-[28px] cursor-pointer rounded-md border px-2.5 text-[12.5px] ${st === o.key ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface hover:bg-surface-2"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-[12px] text-ink-3">{t.caption}</span>
      </div>
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{meta.label}</span>} right={meta.rule} />

      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={t.timeline}>
        {Array.from({ length: T_MAX / 2 + 1 }, (_, i) => i * 2).map((tick) => (
          <g key={tick}>
            <line x1={x(tick)} y1={TOP} x2={x(tick)} y2={TOP + IVS.length * ROW} stroke="var(--line)" strokeWidth="1" strokeDasharray="2 3" />
            <text x={x(tick)} y={H - 6} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--ink-3)">{tick}</text>
          </g>
        ))}
        {IVS.map((iv, i) => {
          const y = TOP + i * ROW;
          const isCur = s.cur === iv.id;
          const chosen = s.chosen.includes(iv.id);
          const rejected = s.rejected.includes(iv.id);
          const inOpt = s.done && OPT_IDS.includes(iv.id);
          const fill = chosen ? "var(--accent)" : isCur ? "var(--amber-soft)" : rejected ? "var(--surface-2)" : "var(--surface)";
          const stroke = chosen ? "var(--accent)" : isCur ? "var(--amber)" : rejected ? "var(--line)" : "var(--line-strong)";
          const txt = chosen ? "var(--accent-ink)" : isCur ? "var(--amber)" : rejected ? "var(--ink-3)" : "var(--ink)";
          return (
            <g key={iv.id}>
              <text x={14} y={y + ROW / 2} dominantBaseline="central" fontSize="12" fontWeight="600" fontFamily="var(--font-mono)" fill={inOpt ? "var(--green)" : "var(--ink)"}>{iv.id}</text>
              <rect x={x(iv.s)} y={y + 4} width={x(iv.e) - x(iv.s)} height={ROW - 8} rx="4" fill={fill} stroke={stroke} strokeWidth={isCur || chosen ? 2 : 1.2} strokeDasharray={rejected ? "3 2" : undefined} />
              <text x={(x(iv.s) + x(iv.e)) / 2} y={y + ROW / 2} textAnchor="middle" dominantBaseline="central" fontSize="10.5" fontFamily="var(--font-mono)" fill={txt}>{iv.s}–{iv.e}</text>
            </g>
          );
        })}
        {s.lastEnd > 0 && !s.done && (
          <line x1={x(s.lastEnd)} y1={TOP - 4} x2={x(s.lastEnd)} y2={TOP + IVS.length * ROW + 2} stroke="var(--amber)" strokeWidth="1.5" strokeDasharray="4 3" />
        )}
      </svg>

      <div className="grid grid-cols-1 gap-3 border-t border-line px-3.5 py-3 text-[13px] md:grid-cols-[auto_minmax(0,1fr)]">
        <div className="flex flex-col gap-1.5">
          <div className="eyebrow">{t.resultLabel}</div>
          <div className="font-mono text-[13px] tabular-nums">
            {t.greedy} <span className={`font-semibold ${s.done ? (s.chosen.length === OPT_IDS.length ? "text-green" : "text-amber") : "text-ink"}`}>{s.chosen.length}</span>
            <span className="text-ink-3">{t.optimum(OPT_IDS.length)}</span>
          </div>
          <div className="text-[12px] text-ink-3">{t.legend}</div>
        </div>
        <div>
          <div className="eyebrow mb-1.5">{st === "end" ? t.whyRight : t.whyWrong}</div>
          <p className="m-0 text-[13px] text-ink-2">{meta.argument}</p>
        </div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
