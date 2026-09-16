"use client";

import { useState } from "react";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

const TEXT = demoText(
  {
    constant: "常數",
    logarithmic: "對數",
    linear: "線性",
    linearithmic: "線性對數",
    quadratic: "平方",
    exponential: "指數",
    factorial: "階乘",
    unitSec: "秒",
    unitMin: "分鐘",
    unitHour: "小時",
    unitDay: "天",
    unitYear: "年",
    forever: "永遠",
    inputSize: "輸入大小 n =",
    logScaleNote: "長條為對數刻度，否則後面幾列會塞不下",
    colComplexity: "複雜度",
    colScale: "相對規模",
    colOps: "操作次數",
    colTime: "每次 1 ns 要花",
    noteSmall: "n 很小時每種複雜度都很快，這就是為什麼小資料不用在意演算法。把 n 調大看看。",
    noteMid: "到這個規模，O(2ⁿ) 與 O(n!) 已經不可能跑完，O(n²) 還撐得住。",
    noteLarge: "O(n²) 開始需要秒到小時的等級，O(n log n) 仍然是毫秒。這就是排序演算法為什麼要追求 n log n。",
  },
  {
    en: {
      constant: "constant",
      logarithmic: "logarithmic",
      linear: "linear",
      linearithmic: "linearithmic",
      quadratic: "quadratic",
      exponential: "exponential",
      factorial: "factorial",
      unitSec: "s",
      unitMin: "min",
      unitHour: "hr",
      unitDay: "days",
      unitYear: "years",
      forever: "forever",
      inputSize: "Input size n =",
      logScaleNote: "The bars use a log scale, or the last few rows would never fit",
      colComplexity: "Complexity",
      colScale: "Relative scale",
      colOps: "Operations",
      colTime: "At 1 ns each",
      noteSmall: "While n is small every complexity class is fast, which is why the choice of algorithm barely matters on small data. Try turning n up.",
      noteMid: "At this size O(2ⁿ) and O(n!) are already out of the question, while O(n²) still holds up.",
      noteLarge: "O(n²) now runs into seconds and hours, while O(n log n) is still measured in milliseconds. That is why sorting algorithms chase n log n.",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

const ROWS: { name: string; label: (t: T) => string; f: (n: number) => number; tone: string }[] = [
  { name: "O(1)", label: (t) => t.constant, f: () => 1, tone: "bg-green" },
  { name: "O(log n)", label: (t) => t.logarithmic, f: (n) => Math.max(1, Math.log2(n)), tone: "bg-green" },
  { name: "O(n)", label: (t) => t.linear, f: (n) => n, tone: "bg-accent" },
  { name: "O(n log n)", label: (t) => t.linearithmic, f: (n) => n * Math.max(1, Math.log2(n)), tone: "bg-accent" },
  { name: "O(n²)", label: (t) => t.quadratic, f: (n) => n * n, tone: "bg-amber" },
  { name: "O(2ⁿ)", label: (t) => t.exponential, f: (n) => Math.pow(2, n), tone: "bg-amber" },
  { name: "O(n!)", label: (t) => t.factorial, f: (n) => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }, tone: "bg-amber" },
];

const PRESETS = [10, 20, 50, 100, 1_000, 10_000, 1_000_000];

function fmtOps(x: number) {
  if (x < 1e6) return Math.round(x).toLocaleString("en-US");
  if (x > 1e300) return "∞";
  return x.toExponential(2).replace("e+", "×10^");
}
/** 假設每次操作 1 奈秒，換算成人類看得懂的時間 */
function fmtTime(t: T, ops: number) {
  const s = ops * 1e-9;
  if (s < 1e-6) return `${(s * 1e9).toFixed(0)} ns`;
  if (s < 1e-3) return `${(s * 1e6).toFixed(1)} µs`;
  if (s < 1) return `${(s * 1e3).toFixed(1)} ms`;
  if (s < 60) return `${s.toFixed(1)} ${t.unitSec}`;
  if (s < 3600) return `${(s / 60).toFixed(1)} ${t.unitMin}`;
  if (s < 86400) return `${(s / 3600).toFixed(1)} ${t.unitHour}`;
  if (s < 86400 * 365) return `${(s / 86400).toFixed(1)} ${t.unitDay}`;
  const y = s / (86400 * 365);
  if (y < 1e6) return `${y.toFixed(1)} ${t.unitYear}`;
  if (y > 1e300) return t.forever;
  return `${y.toExponential(1).replace("e+", "×10^")} ${t.unitYear}`;
}

export function GrowthDemo() {
  const t = TEXT[useLocale()];
  const [n, setN] = useState(20);
  const values = ROWS.map((r) => r.f(n));
  const maxLog = Math.max(...values.map((v) => Math.log10(1 + Math.min(v, 1e300))));

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <span>{t.inputSize}</span>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setN(p)}
              className={`h-[28px] cursor-pointer rounded-md border px-2.5 font-mono text-[12.5px] ${
                n === p ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface hover:bg-surface-2"
              }`}
            >
              {p.toLocaleString("en-US")}
            </button>
          ))}
        </div>
        <span className="ml-auto text-[12px] text-ink-3">{t.logScaleNote}</span>
      </div>

      <div className="grid grid-cols-[110px_minmax(0,1fr)_120px_110px] items-center gap-x-3 px-3.5 py-2 text-[11.5px] font-semibold tracking-[0.08em] text-ink-3 uppercase">
        <span>{t.colComplexity}</span><span>{t.colScale}</span><span className="text-right">{t.colOps}</span><span className="text-right">{t.colTime}</span>
      </div>
      {ROWS.map((r, i) => {
        const v = values[i];
        const w = (Math.log10(1 + Math.min(v, 1e300)) / maxLog) * 100;
        return (
          <div key={r.name} className="grid grid-cols-[110px_minmax(0,1fr)_120px_110px] items-center gap-x-3 border-t border-line px-3.5 py-2 text-[13px]">
            <span>
              <span className="font-mono font-medium">{r.name}</span>
              <span className="ml-1.5 text-[12px] text-ink-3">{r.label(t)}</span>
            </span>
            <div className="h-2.5 overflow-hidden rounded-sm bg-surface-2">
              <i className={`block h-full rounded-sm ${r.tone}`} style={{ width: `${Math.max(1.5, w)}%` }} />
            </div>
            <span className="text-right font-mono text-[12.5px] tabular-nums">{fmtOps(v)}</span>
            <span className="text-right font-mono text-[12.5px] text-ink-2 tabular-nums">{fmtTime(t, v)}</span>
          </div>
        );
      })}
      <div className="border-t border-line px-3.5 py-2.5 text-[13px] text-ink-2">
        {n <= 20 ? t.noteSmall : n <= 1000 ? t.noteMid : t.noteLarge}
      </div>
    </div>
  );
}
