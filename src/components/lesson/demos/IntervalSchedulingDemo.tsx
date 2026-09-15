"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter } from "./StepBar";

/** 一間會議室、9 場申請。時間單位是半小時，0 代表 9:00。 */
interface Mtg { id: string; name: string; s: number; e: number }
const MTGS: Mtg[] = [
  { id: "A", name: "站會", s: 0, e: 3 },
  { id: "B", name: "面試", s: 1, e: 6 },
  { id: "C", name: "設計評審", s: 2, e: 4 },
  { id: "D", name: "需求討論", s: 4, e: 7 },
  { id: "E", name: "午餐會", s: 6, e: 8 },
  { id: "F", name: "客戶會議", s: 7, e: 11 },
  { id: "G", name: "一對一", s: 8, e: 12 },
  { id: "H", name: "回顧會", s: 10, e: 14 },
  { id: "I", name: "週報", s: 13, e: 16 },
];
const T_MAX = 16;
const clock = (u: number) => `${9 + Math.floor(u / 2)}:${u % 2 ? "30" : "00"}`;

interface Step { desc: string; order: string[]; chosen: string[]; rejected: string[]; cur?: string; lastEnd: number; sorted: boolean }

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const byId = MTGS.map((m) => m.id);
  steps.push({ desc: "9 場會議申請同一間會議室，目標是排進最多場。先不要急著挑，關鍵在排序的依據。", order: byId, chosen: [], rejected: [], lastEnd: 0, sorted: false });
  const sorted = [...MTGS].sort((a, b) => a.e - b.e);
  const order = sorted.map((m) => m.id);
  steps.push({ desc: `按結束時間排序：${order.join(" → ")}。結束得越早，留給後面的時間越多。這一步 O(n log n)，是整個演算法最貴的部分。`, order, chosen: [], rejected: [], lastEnd: 0, sorted: true });
  const chosen: string[] = [];
  const rejected: string[] = [];
  let lastEnd = 0;
  for (const m of sorted) {
    if (m.s >= lastEnd) {
      chosen.push(m.id);
      const prev = lastEnd;
      lastEnd = m.e;
      steps.push({ desc: `${m.id}「${m.name}」${clock(m.s)} 開始，${prev === 0 && chosen.length === 1 ? "會議室還空著" : `不早於目前的結束時間 ${clock(prev)}`}，排進去。結束時間更新為 ${clock(m.e)}。`, order, chosen: [...chosen], rejected: [...rejected], cur: m.id, lastEnd, sorted: true });
    } else {
      rejected.push(m.id);
      steps.push({ desc: `${m.id}「${m.name}」${clock(m.s)} 開始，但會議室要到 ${clock(lastEnd)} 才空出來，衝突，跳過。`, order, chosen: [...chosen], rejected: [...rejected], cur: m.id, lastEnd, sorted: true });
    }
  }
  steps.push({ desc: `掃完一輪。排進 ${chosen.length} 場：${chosen.join("、")}。排序後只需要一個變數記住「目前最後結束時間」，每場會議看一次，O(n)。`, order, chosen: [...chosen], rejected: [...rejected], lastEnd, sorted: true });
  return steps;
}

const W = 640, LEFT = 96, ROW = 22, TOP = 14;

export function IntervalSchedulingDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];
  const x = (t: number) => LEFT + (t / T_MAX) * (W - LEFT - 14);
  const rows = s.order.map((id) => MTGS.find((m) => m.id === id)!);
  const H = TOP + rows.length * ROW + 24;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.sorted ? "sort by end → scan" : "input"}</span>} right="一間會議室 · 9 場申請 · 選最多場" />
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="會議時間軸">
        {Array.from({ length: T_MAX / 2 + 1 }, (_, i) => i * 2).map((t) => (
          <g key={t}>
            <line x1={x(t)} y1={TOP} x2={x(t)} y2={TOP + rows.length * ROW} stroke="var(--line)" strokeWidth="1" strokeDasharray="2 3" />
            <text x={x(t)} y={H - 6} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--ink-3)">{clock(t)}</text>
          </g>
        ))}
        {rows.map((m, i) => {
          const y = TOP + i * ROW;
          const isCur = s.cur === m.id;
          const chosen = s.chosen.includes(m.id);
          const rejected = s.rejected.includes(m.id);
          const fill = chosen ? "var(--accent)" : isCur ? "var(--amber-soft)" : rejected ? "var(--surface-2)" : "var(--surface)";
          const stroke = chosen ? "var(--accent)" : isCur ? "var(--amber)" : rejected ? "var(--line)" : "var(--line-strong)";
          const txt = chosen ? "var(--accent-ink)" : isCur ? "var(--amber)" : rejected ? "var(--ink-3)" : "var(--ink)";
          return (
            <g key={m.id}>
              <text x={10} y={y + ROW / 2} dominantBaseline="central" fontSize="11" fontFamily="var(--font-mono)" fill={rejected ? "var(--ink-3)" : "var(--ink)"}>
                <tspan fontWeight="600">{m.id}</tspan>
                <tspan dx="6" fill="var(--ink-3)">{m.name}</tspan>
              </text>
              <rect x={x(m.s)} y={y + 3} width={x(m.e) - x(m.s)} height={ROW - 6} rx="4" fill={fill} stroke={stroke} strokeWidth={isCur || chosen ? 2 : 1.2} strokeDasharray={rejected ? "3 2" : undefined} />
              <text x={(x(m.s) + x(m.e)) / 2} y={y + ROW / 2} textAnchor="middle" dominantBaseline="central" fontSize="10" fontFamily="var(--font-mono)" fill={txt}>{clock(m.s)}–{clock(m.e)}</text>
            </g>
          );
        })}
        {s.lastEnd > 0 && (
          <g>
            <line x1={x(s.lastEnd)} y1={TOP - 4} x2={x(s.lastEnd)} y2={TOP + rows.length * ROW + 2} stroke="var(--amber)" strokeWidth="1.5" strokeDasharray="4 3" />
            <text x={x(s.lastEnd) + 4} y={TOP + 2} fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--amber)">last_end</text>
          </g>
        )}
      </svg>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-line px-3.5 py-2.5 text-[12.5px] text-ink-2">
        <span className="font-mono">
          已排 <span className="font-semibold text-accent">{s.chosen.length}</span>
          <span className="text-ink-3"> · 跳過 {s.rejected.length}</span>
        </span>
        <span className="font-mono text-ink-3">last_end = {s.lastEnd > 0 ? clock(s.lastEnd) : "—"}</span>
        <span className="text-[12px] text-ink-3">列的順序就是掃描順序；藍色排進、虛線衝突、黃線是目前最後結束時間</span>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
