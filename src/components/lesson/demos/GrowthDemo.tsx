"use client";

import { useState } from "react";

const ROWS: { name: string; label: string; f: (n: number) => number; tone: string }[] = [
  { name: "O(1)", label: "常數", f: () => 1, tone: "bg-green" },
  { name: "O(log n)", label: "對數", f: (n) => Math.max(1, Math.log2(n)), tone: "bg-green" },
  { name: "O(n)", label: "線性", f: (n) => n, tone: "bg-accent" },
  { name: "O(n log n)", label: "線性對數", f: (n) => n * Math.max(1, Math.log2(n)), tone: "bg-accent" },
  { name: "O(n²)", label: "平方", f: (n) => n * n, tone: "bg-amber" },
  { name: "O(2ⁿ)", label: "指數", f: (n) => Math.pow(2, n), tone: "bg-amber" },
  { name: "O(n!)", label: "階乘", f: (n) => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }, tone: "bg-amber" },
];

const PRESETS = [10, 20, 50, 100, 1_000, 10_000, 1_000_000];

function fmtOps(x: number) {
  if (x < 1e6) return Math.round(x).toLocaleString("en-US");
  if (x > 1e300) return "∞";
  return x.toExponential(2).replace("e+", "×10^");
}
/** 假設每次操作 1 奈秒，換算成人類看得懂的時間 */
function fmtTime(ops: number) {
  const s = ops * 1e-9;
  if (s < 1e-6) return `${(s * 1e9).toFixed(0)} ns`;
  if (s < 1e-3) return `${(s * 1e6).toFixed(1)} µs`;
  if (s < 1) return `${(s * 1e3).toFixed(1)} ms`;
  if (s < 60) return `${s.toFixed(1)} 秒`;
  if (s < 3600) return `${(s / 60).toFixed(1)} 分鐘`;
  if (s < 86400) return `${(s / 3600).toFixed(1)} 小時`;
  if (s < 86400 * 365) return `${(s / 86400).toFixed(1)} 天`;
  const y = s / (86400 * 365);
  if (y < 1e6) return `${y.toFixed(1)} 年`;
  if (y > 1e300) return "永遠";
  return `${y.toExponential(1).replace("e+", "×10^")} 年`;
}

export function GrowthDemo() {
  const [n, setN] = useState(20);
  const values = ROWS.map((r) => r.f(n));
  const maxLog = Math.max(...values.map((v) => Math.log10(1 + Math.min(v, 1e300))));

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <span>輸入大小 n =</span>
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
        <span className="ml-auto text-[12px] text-ink-3">長條為對數刻度，否則後面幾列會塞不下</span>
      </div>

      <div className="grid grid-cols-[110px_minmax(0,1fr)_120px_110px] items-center gap-x-3 px-3.5 py-2 text-[11.5px] font-semibold tracking-[0.08em] text-ink-3 uppercase">
        <span>複雜度</span><span>相對規模</span><span className="text-right">操作次數</span><span className="text-right">每次 1 ns 要花</span>
      </div>
      {ROWS.map((r, i) => {
        const v = values[i];
        const w = (Math.log10(1 + Math.min(v, 1e300)) / maxLog) * 100;
        return (
          <div key={r.name} className="grid grid-cols-[110px_minmax(0,1fr)_120px_110px] items-center gap-x-3 border-t border-line px-3.5 py-2 text-[13px]">
            <span>
              <span className="font-mono font-medium">{r.name}</span>
              <span className="ml-1.5 text-[12px] text-ink-3">{r.label}</span>
            </span>
            <div className="h-2.5 overflow-hidden rounded-sm bg-surface-2">
              <i className={`block h-full rounded-sm ${r.tone}`} style={{ width: `${Math.max(1.5, w)}%` }} />
            </div>
            <span className="text-right font-mono text-[12.5px] tabular-nums">{fmtOps(v)}</span>
            <span className="text-right font-mono text-[12.5px] text-ink-2 tabular-nums">{fmtTime(v)}</span>
          </div>
        );
      })}
      <div className="border-t border-line px-3.5 py-2.5 text-[13px] text-ink-2">
        {n <= 20
          ? "n 很小時每種複雜度都很快，這就是為什麼小資料不用在意演算法。把 n 調大看看。"
          : n <= 1000
            ? "到這個規模，O(2ⁿ) 與 O(n!) 已經不可能跑完，O(n²) 還撐得住。"
            : "O(n²) 開始需要秒到小時的等級，O(n log n) 仍然是毫秒。這就是排序演算法為什麼要追求 n log n。"}
      </div>
    </div>
  );
}
