"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, CELL } from "./StepBar";

const A = 252, B = 105;

/** 擴展歐幾里得的每一列：r_i = A·s_i + B·t_i */
interface Row { r: number; q: number | null; s: number; t: number }
interface Step { desc: string; phase: "gcd" | "ext"; op: string; rows: number; hot: number; showST: boolean }

function buildRows(): Row[] {
  const rows: Row[] = [{ r: A, q: null, s: 1, t: 0 }, { r: B, q: null, s: 0, t: 1 }];
  while (rows[rows.length - 1].r !== 0) {
    const p = rows[rows.length - 2], c = rows[rows.length - 1];
    const q = Math.floor(p.r / c.r);
    rows.push({ r: p.r - q * c.r, q, s: p.s - q * c.s, t: p.t - q * c.t });
  }
  return rows;
}

const ROWS = buildRows();
const G = ROWS[ROWS.length - 2].r;

/** 負數用數學減號，放在乘式裡時加括號：-2 → (−2) */
const num = (v: number) => (v < 0 ? `−${-v}` : `${v}`);
const par = (v: number) => (v < 0 ? `(${num(v)})` : `${v}`);

function buildSteps(): Step[] {
  const steps: Step[] = [];
  steps.push({ desc: `求 gcd(${A}, ${B})。核心觀察：gcd(a, b) = gcd(b, a mod b)，因為 a 和 b 的公因數一定也整除 a mod b。反覆做，直到餘數變 0。`, phase: "gcd", op: "開始", rows: 2, hot: -1, showST: false });
  for (let i = 2; i < ROWS.length; i++) {
    const p = ROWS[i - 2], c = ROWS[i - 1], n = ROWS[i];
    const tail = n.r === 0 ? `餘數是 0，停。上一個餘數 ${c.r} 就是最大公因數。` : `問題縮小成 gcd(${c.r}, ${n.r})。`;
    steps.push({ desc: `${p.r} = ${n.q} × ${c.r} + ${n.r}。${tail}`, phase: "gcd", op: `${p.r} mod ${c.r}`, rows: i + 1, hot: i, showST: false });
  }
  steps.push({ desc: `gcd(${A}, ${B}) = ${G}。只花了 ${ROWS.length - 2} 次除法。每兩步餘數至少減半，所以次數是 O(log min(a, b))。`, phase: "gcd", op: "gcd = " + G, rows: ROWS.length, hot: ROWS.length - 2, showST: false });
  steps.push({ desc: `順便算最小公倍數：lcm = a × b ÷ gcd = ${A} × ${B} ÷ ${G} = ${(A / G) * B}。實作時先除再乘（a ÷ gcd × b），避免中途溢位。`, phase: "gcd", op: "lcm = " + (A / G) * B, rows: ROWS.length, hot: -1, showST: false });

  steps.push({ desc: `擴展歐幾里得：除了 gcd，還要找整數 x、y 使 ${A}x + ${B}y = ${G}。方法是替每一列的餘數 r 記下「它等於 ${A} 的幾倍加 ${B} 的幾倍」，也就是 r = ${A}·s + ${B}·t。前兩列很明顯：${A} = 1·${A} + 0·${B}，${B} = 0·${A} + 1·${B}。`, phase: "ext", op: "開始", rows: 2, hot: -1, showST: true });
  for (let i = 2; i < ROWS.length; i++) {
    const p = ROWS[i - 2], c = ROWS[i - 1], n = ROWS[i];
    steps.push({ desc: `這列的餘數是「上上列 − q × 上一列」：r = ${p.r} − ${n.q} × ${c.r} = ${n.r}，所以係數也照同一條規則算：s = ${par(p.s)} − ${n.q} × ${par(c.s)} = ${num(n.s)}，t = ${par(p.t)} − ${n.q} × ${par(c.t)} = ${num(n.t)}。驗算：${A} × ${par(n.s)} + ${B} × ${par(n.t)} = ${n.r}。`, phase: "ext", op: `s, t 往下傳`, rows: i + 1, hot: i, showST: true });
  }
  const last = ROWS[ROWS.length - 2];
  steps.push({ desc: `餘數為 ${G} 那一列的係數就是答案：x = ${num(last.s)}，y = ${num(last.t)}，${A} × ${par(last.s)} + ${B} × ${par(last.t)} = ${G}。這對係數用在解線性同餘方程，以及模數不是質數時求模反元素。`, phase: "ext", op: `x = ${num(last.s)}, y = ${num(last.t)}`, rows: ROWS.length, hot: ROWS.length - 2, showST: true });
  return steps;
}

export function GcdDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];
  const visible = ROWS.slice(0, s.rows);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={s.phase === "gcd" ? `gcd(${A}, ${B})` : `找 x、y 使 ${A}x + ${B}y = ${G}`} />

      <div className="grid grid-cols-1 gap-3.5 p-3.5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <div className="eyebrow mb-2">輾轉相除</div>
          <div className="grid gap-1">
            {visible.slice(2).map((row, j) => {
              const i = j + 2;
              const p = ROWS[i - 2], c = ROWS[i - 1];
              return (
                <div key={i} className={`rounded-md border px-2.5 py-1.5 font-mono text-[13px] tabular-nums ${s.hot === i ? CELL.accent : "border-line bg-surface"}`}>
                  {p.r} = {row.q} × {c.r} + <span className={s.hot === i ? "" : row.r === 0 ? "text-ink-3" : "text-amber"}>{row.r}</span>
                </div>
              );
            })}
            {visible.length <= 2 && <div className="rounded-md border border-dashed border-line-strong px-2.5 py-1.5 text-[12px] text-ink-3">還沒開始除</div>}
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="eyebrow mb-2">{s.showST ? `每列滿足 r = ${A}·s + ${B}·t` : "餘數序列"}</div>
          <table className="w-full border-collapse font-mono text-[13px] tabular-nums">
            <thead>
              <tr className="text-[11px] text-ink-3">
                <th className="px-2 py-1 text-left font-medium">列</th>
                <th className="px-2 py-1 text-right font-medium">r</th>
                <th className="px-2 py-1 text-right font-medium">q</th>
                {s.showST && <th className="px-2 py-1 text-right font-medium">s</th>}
                {s.showST && <th className="px-2 py-1 text-right font-medium">t</th>}
              </tr>
            </thead>
            <tbody>
              {visible.map((row, i) => {
                const hot = i === s.hot;
                const isG = row.r === G && s.rows === ROWS.length;
                return (
                  <tr key={i} className={`border-t border-line ${hot ? "bg-accent-soft" : ""}`}>
                    <td className="px-2 py-1 text-ink-3">{i}</td>
                    <td className={`px-2 py-1 text-right ${isG ? "font-semibold text-green" : ""}`}>{row.r}</td>
                    <td className="px-2 py-1 text-right text-ink-2">{row.q ?? "—"}</td>
                    {s.showST && <td className={`px-2 py-1 text-right ${isG ? "font-semibold text-green" : ""}`}>{num(row.s)}</td>}
                    {s.showST && <td className={`px-2 py-1 text-right ${isG ? "font-semibold text-green" : ""}`}>{num(row.t)}</td>}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
