"use client";

import { useState } from "react";

/** 順序固定：顏色跟著複雜度，不跟著排名。六色已用 CVD 驗證通過。 */
const SERIES = [
  { name: "O(1)", f: () => 1, color: "var(--chart-1)" },
  { name: "O(log n)", f: (n: number) => Math.log2(n), color: "var(--chart-2)" },
  { name: "O(n)", f: (n: number) => n, color: "var(--chart-3)" },
  { name: "O(n log n)", f: (n: number) => n * Math.log2(n), color: "var(--chart-4)" },
  { name: "O(n²)", f: (n: number) => n * n, color: "var(--chart-5)" },
  { name: "O(2ⁿ)", f: (n: number) => Math.pow(2, n), color: "var(--chart-6)" },
];

const N_MAX = 12;
const Y_MAX = 60;
const W = 640, H = 320;
const M = { top: 18, right: 88, bottom: 40, left: 48 };
const PW = W - M.left - M.right;
const PH = H - M.top - M.bottom;
const sx = (n: number) => M.left + ((n - 1) / (N_MAX - 1)) * PW;
const sy = (v: number) => M.top + PH - (Math.min(v, Y_MAX * 1.15) / Y_MAX) * PH;

const fmt = (v: number) => (v >= 100 ? Math.round(v).toLocaleString("en-US") : v < 10 ? v.toFixed(1) : Math.round(v).toString());

export function GrowthChart() {
  const [hoverN, setHoverN] = useState<number | null>(null);
  const ns = Array.from({ length: N_MAX }, (_, i) => i + 1);

  // 每條線的路徑；超過 Y_MAX 的部分靠 clipPath 裁掉，最後一個可見點放直接標籤
  const lines = SERIES.map((s) => {
    const pts = ns.map((n) => ({ n, v: s.f(n) }));
    const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${sx(p.n).toFixed(1)},${sy(p.v).toFixed(1)}`).join(" ");
    const visible = pts.filter((p) => p.v <= Y_MAX);
    const last = visible[visible.length - 1];
    const exits = visible.length < pts.length;
    return { ...s, d, last, exits };
  });

  // 直接標籤：依 y 排序後把太靠近的往上下推開
  const labels = lines
    .map((l) => ({ name: l.name, color: l.color, x: l.exits ? sx(l.last.n) + 6 : W - M.right + 6, y: l.exits ? M.top + 10 : sy(l.last.v), exits: l.exits }))
    .sort((a, b) => a.y - b.y);
  for (let i = 1; i < labels.length; i++) {
    const prev = labels[i - 1];
    if (labels[i].y - prev.y < 14 && Math.abs(labels[i].x - prev.x) < 70) labels[i].y = prev.y + 14;
  }

  const onMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const n = Math.round(((x - M.left) / PW) * (N_MAX - 1) + 1);
    setHoverN(n >= 1 && n <= N_MAX ? n : null);
  };

  return (
    <figure className="m-0 my-4 max-w-[72ch] overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line bg-surface-2 px-3.5 py-2 text-[12px] text-ink-2">
        <span className="font-semibold text-ink">操作次數隨 n 的成長</span>
        {SERIES.map((s) => (
          <span key={s.name} className="inline-flex items-center gap-1.5 font-mono">
            <i className="inline-block h-0.5 w-3.5 rounded-sm" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full"
          role="img"
          aria-label="六種複雜度在 n 從 1 到 12 時的操作次數折線圖"
          onMouseMove={onMove}
          onMouseLeave={() => setHoverN(null)}
        >
          <defs>
            <clipPath id="growth-clip"><rect x={M.left} y={M.top - 2} width={PW} height={PH + 2} /></clipPath>
          </defs>

          {/* 格線與 y 軸 */}
          {[0, 20, 40, 60].map((v) => (
            <g key={v}>
              <line x1={M.left} x2={M.left + PW} y1={sy(v)} y2={sy(v)} stroke="var(--line)" strokeWidth="1" />
              <text x={M.left - 8} y={sy(v)} textAnchor="end" dominantBaseline="central" fontSize="10.5" fill="var(--ink-3)" fontFamily="var(--font-mono)">{v}</text>
            </g>
          ))}
          {/* x 軸 */}
          {ns.map((n) => (
            <text key={n} x={sx(n)} y={M.top + PH + 16} textAnchor="middle" fontSize="10.5" fill="var(--ink-3)" fontFamily="var(--font-mono)">{n}</text>
          ))}
          <text x={M.left + PW / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--ink-3)">輸入大小 n</text>
          <text x={12} y={M.top + PH / 2} textAnchor="middle" fontSize="11" fill="var(--ink-3)" transform={`rotate(-90 12 ${M.top + PH / 2})`}>操作次數</text>

          {/* 曲線 */}
          <g clipPath="url(#growth-clip)">
            {lines.map((l) => (
              <path key={l.name} d={l.d} fill="none" stroke={l.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            ))}
          </g>

          {/* 直接標籤 */}
          {labels.map((l) => (
            <text key={l.name} x={l.x} y={l.y} dominantBaseline="central" fontSize="11" fontWeight="600" fill="var(--ink)" fontFamily="var(--font-mono)">
              {l.name}{l.exits ? " ↑" : ""}
            </text>
          ))}

          {/* hover 十字線與點 */}
          {hoverN !== null && (
            <g>
              <line x1={sx(hoverN)} x2={sx(hoverN)} y1={M.top} y2={M.top + PH} stroke="var(--ink-3)" strokeWidth="1" strokeDasharray="3 3" />
              {SERIES.map((s) => {
                const v = s.f(hoverN);
                if (v > Y_MAX) return null;
                return <circle key={s.name} cx={sx(hoverN)} cy={sy(v)} r="4" fill={s.color} stroke="var(--surface)" strokeWidth="2" />;
              })}
            </g>
          )}
        </svg>

        {hoverN !== null && (
          <div
            className="pointer-events-none absolute top-3 rounded-md border border-line bg-surface px-2.5 py-2 text-[12px] shadow-card"
            style={{ left: `calc(${((sx(hoverN) + 10) / W) * 100}% ${hoverN > 7 ? "- 150px" : ""})` }}
          >
            <div className="mb-1 font-semibold">n = {hoverN}</div>
            {SERIES.map((s) => (
              <div key={s.name} className="flex items-center justify-between gap-4 font-mono tabular-nums">
                <span className="inline-flex items-center gap-1.5"><i className="inline-block h-0.5 w-3 rounded-sm" style={{ background: s.color }} />{s.name}</span>
                <span className="text-ink-2">{fmt(s.f(hoverN))}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <figcaption className="border-t border-line px-3.5 py-2 text-[12.5px] text-ink-3">
        y 軸只畫到 60，標了 ↑ 的曲線在那之前就衝出去了：O(2ⁿ) 在 n = 6 就超過 60，O(n²) 在 n = 8。O(log n) 和 O(1) 幾乎貼在底部。滑過圖表可看每個 n 的數值。
      </figcaption>
    </figure>
  );
}
