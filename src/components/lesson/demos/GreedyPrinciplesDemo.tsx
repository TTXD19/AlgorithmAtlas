"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter } from "./StepBar";

/** 區間排程：7 個時段，最多能選幾個互不重疊的？最佳解是 4 個（B、C、D、F）。 */
interface Iv { id: string; s: number; e: number }
const IVS: Iv[] = [
  { id: "A", s: 0, e: 12 }, { id: "B", s: 1, e: 5 }, { id: "S", s: 4, e: 7 }, { id: "C", s: 6, e: 10 },
  { id: "D", s: 11, e: 14 }, { id: "E", s: 13, e: 16 }, { id: "F", s: 15, e: 18 },
];
const T_MAX = 18;
const OPT_IDS = ["B", "C", "D", "F"];

type Strategy = "start" | "short" | "end";
const STRATEGIES: { key: Strategy; label: string; rule: string; argument: string }[] = [
  {
    key: "start", label: "最早開始", rule: "按開始時間排序，和已選的不衝突就選",
    argument: "反例：A 最早開始，但它很長，把 0 到 12 整段佔掉，B、S、C、D 全被擋住。「開始得早」和「留給後面的空間多」沒有關係，所以無法用交換論證證明它。",
  },
  {
    key: "short", label: "最短", rule: "按長度排序（同長度先看開始時間），不衝突就選",
    argument: "反例：S 最短，但它正好橫跨 B 和 C 的交界。選一個 S 就同時損失 B 和 C 兩個。「短」不保證「結束得早」，交換時可能要換掉兩個以上，論證失敗。",
  },
  {
    key: "end", label: "最早結束", rule: "按結束時間排序，和已選的不衝突就選",
    argument: "交換論證：設任何一個最佳解裡最早結束的區間是 O₁，貪婪選的第一個是 G₁。G₁ 是全部區間裡最早結束的，所以 G₁ 的結束時間 ≤ O₁ 的。把 O₁ 換成 G₁，其餘區間都在 O₁ 之後開始，換完仍然不衝突，數量不變。於是存在一個以 G₁ 開頭的最佳解；對剩下的區間重複同樣的論證，貪婪解每一步都和某個最佳解一致。",
  },
];

function order(st: Strategy): Iv[] {
  const a = [...IVS];
  if (st === "start") a.sort((x, y) => x.s - y.s);
  else if (st === "short") a.sort((x, y) => (x.e - x.s) - (y.e - y.s) || x.s - y.s);
  else a.sort((x, y) => x.e - y.e);
  return a;
}

interface Step { desc: string; chosen: string[]; rejected: string[]; cur?: string; lastEnd: number; done: boolean }

function buildSteps(st: Strategy): Step[] {
  const meta = STRATEGIES.find((x) => x.key === st)!;
  const ord = order(st);
  const steps: Step[] = [];
  const chosen: string[] = [];
  const chosenIvs: Iv[] = [];
  const rejected: string[] = [];
  /** 按時間順序處理（最早開始、最早結束）時，只要和最後的結束時間比；最短優先會跳回較早的時段，要和每個已選的比 */
  const timeOrdered = st !== "short";
  let lastEnd = 0;
  const line = () => (timeOrdered ? lastEnd : 0);
  steps.push({ desc: `策略「${meta.label}」：${meta.rule}。排序後的順序是 ${ord.map((v) => v.id).join(" → ")}。`, chosen: [], rejected: [], lastEnd: 0, done: false });
  for (const iv of ord) {
    const hit = chosenIvs.find((c) => !(iv.e <= c.s || iv.s >= c.e));
    if (!hit) {
      const note = timeOrdered && chosenIvs.length ? `在 ${iv.s} 開始，不早於已選區間最後的結束時間 ${lastEnd}，` : "";
      chosen.push(iv.id);
      chosenIvs.push(iv);
      lastEnd = Math.max(lastEnd, iv.e);
      const reason = chosen.length === 1 ? "還沒有選任何區間，直接選它。" : `${note}和已選的區間都不重疊，選它。`;
      steps.push({ desc: `${iv.id}（${iv.s}–${iv.e}）${reason}`, chosen: [...chosen], rejected: [...rejected], cur: iv.id, lastEnd: line(), done: false });
    } else {
      rejected.push(iv.id);
      steps.push({ desc: `${iv.id}（${iv.s}–${iv.e}）和已選的 ${hit.id}（${hit.s}–${hit.e}）重疊，跳過。`, chosen: [...chosen], rejected: [...rejected], cur: iv.id, lastEnd: line(), done: false });
    }
  }
  const ok = chosen.length === OPT_IDS.length;
  steps.push({
    desc: `結束。選了 ${chosen.length} 個：${chosen.join("、")}。最佳解是 ${OPT_IDS.length} 個（${OPT_IDS.join("、")}）。${ok ? "這個策略拿到最佳解，而且下方的交換論證保證它在任何輸入上都對。" : "比最佳解少，這個策略不對。一個反例就足以否定一個貪婪策略。"}`,
    chosen: [...chosen], rejected: [...rejected], lastEnd: line(), done: true,
  });
  return steps;
}

const W = 640, LEFT = 44, ROW = 24, TOP = 16;

export function GreedyPrinciplesDemo() {
  const [st, setSt] = useState<Strategy>("end");
  const [k, setK] = useState(0);
  const steps = useMemo(() => buildSteps(st), [st]);
  const s = steps[k];
  const meta = STRATEGIES.find((x) => x.key === st)!;
  const x = (t: number) => LEFT + (t / T_MAX) * (W - LEFT - 16);
  const H = TOP + IVS.length * ROW + 26;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <span>貪婪策略</span>
        <div className="flex flex-wrap gap-1.5">
          {STRATEGIES.map((o) => (
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
        <span className="ml-auto text-[12px] text-ink-3">7 個區間 · 最佳解 4 個</span>
      </div>
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{meta.label}</span>} right={meta.rule} />

      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="區間時間軸">
        {Array.from({ length: T_MAX / 2 + 1 }, (_, i) => i * 2).map((t) => (
          <g key={t}>
            <line x1={x(t)} y1={TOP} x2={x(t)} y2={TOP + IVS.length * ROW} stroke="var(--line)" strokeWidth="1" strokeDasharray="2 3" />
            <text x={x(t)} y={H - 6} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--ink-3)">{t}</text>
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
          <div className="eyebrow">結果</div>
          <div className="font-mono text-[13px] tabular-nums">
            貪婪 <span className={`font-semibold ${s.done ? (s.chosen.length === OPT_IDS.length ? "text-green" : "text-amber") : "text-ink"}`}>{s.chosen.length}</span>
            <span className="text-ink-3"> / 最佳 {OPT_IDS.length}</span>
          </div>
          <div className="text-[12px] text-ink-3">藍色已選、虛線被跳過。按時間順序處理的策略會畫出黃線，標出已選區間最後的結束時間。結束後綠色字母是最佳解。</div>
        </div>
        <div>
          <div className="eyebrow mb-1.5">{st === "end" ? "為什麼對" : "為什麼錯"}</div>
          <p className="m-0 text-[13px] text-ink-2">{meta.argument}</p>
        </div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
