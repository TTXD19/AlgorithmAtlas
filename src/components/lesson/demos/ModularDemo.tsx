"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, CELL } from "./StepBar";

/** 模 13 之下求 5 的反元素：先逐一乘看出「乘 a 是重新排列」，再推出費馬小定理，用快速冪算 5¹¹，最後看模數不是質數時會怎樣 */
const P = 13;
const A = 5;

const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const sup = (n: number) => String(n).split("").map((d) => SUP[Number(d)]).join("");

interface PowRow { bit: number; b: number; base: number; result: number }
interface Step {
  desc: string;
  op: string;
  m: number;
  a: number;
  /** 乘法列已經填了幾格（k = 1 … filled） */
  filled: number;
  /** 這一步剛算的 k */
  cur?: number;
  /** 乘出來等於 1 的 k（已經找到才有） */
  inv?: number;
  pow?: { rows: PowRow[]; cur: number };
  formula?: string[];
  /** 公式結論是錯的（合數模數套費馬） */
  wrong?: boolean;
}

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const findInv = (a: number, m: number, upto: number) => {
    for (let k = 1; k <= upto; k++) if ((a * k) % m === 1) return k;
    return undefined;
  };

  steps.push({
    op: "開始", m: P, a: A, filled: 0,
    desc: `模 ${P} 的世界裡只有 0 到 ${P - 1} 這 ${P} 個數。加、減、乘都可以先取餘數再算，結果和算完才取餘數一樣。麻煩的是除法：要找一個 x 使 ${A} · x ≡ 1 (mod ${P})，x 叫做 ${A} 的反元素，之後「除以 ${A}」就改成「乘上 x」。先把 k = 1 到 ${P - 1} 逐一乘上 ${A}。`,
  });

  let inv: number | undefined;
  for (let k = 1; k < P; k++) {
    const v = (A * k) % P;
    if (v === 1) {
      inv = k;
      steps.push({ op: `${A} × ${k}`, m: P, a: A, filled: k, cur: k, inv, desc: `${A} × ${k} = ${A * k} = ${Math.floor((A * k) / P)} × ${P} + 1，餘數是 1。所以 ${A} × ${k} ≡ 1 (mod ${P})，${A} 的反元素就是 ${k}（黃色）。` });
      break;
    }
    steps.push({ op: `${A} × ${k}`, m: P, a: A, filled: k, cur: k, desc: `${A} × ${k} = ${A * k}，除以 ${P} 餘 ${v}。餘數 ${v} 第一次出現。` });
  }
  const rest = Array.from({ length: P - 1 - (inv as number) }, (_, i) => (A * ((inv as number) + 1 + i)) % P);
  steps.push({
    op: "乘完 1 … 12", m: P, a: A, filled: P - 1, inv,
    desc: `剩下的 k = ${(inv as number) + 1} 到 ${P - 1}，餘數依序是 ${rest.join("、")}。1 到 ${P - 1} 每個餘數剛好出現一次：若 ${A}i ≡ ${A}j，則 ${P} 整除 ${A}(i − j)，${P} 是質數又不整除 ${A}，只能整除 i − j，於是 i = j。「乘上 ${A}」只是把 1 到 ${P - 1} 重新排列，所以 1 一定出現，而且只出現一次。`,
  });

  steps.push({
    op: "費馬小定理", m: P, a: A, filled: P - 1, inv,
    formula: [
      `(${A}·1)(${A}·2)(${A}·3)…(${A}·${P - 1}) ≡ 1·2·3·…·${P - 1}  (mod ${P})`,
      `${A}${sup(P - 1)} · ${P - 1}! ≡ ${P - 1}!  (mod ${P})`,
      `${A}${sup(P - 1)} ≡ 1   ⇒   ${A} · ${A}${sup(P - 2)} ≡ 1   ⇒   ${A}⁻¹ ≡ ${A}${sup(P - 2)}`,
    ],
    desc: `第二列是 1 到 ${P - 1} 的重新排列，所以兩列各自全部乘起來相等。左邊提出 ${P - 1} 個 ${A}，得到 ${A}${sup(P - 1)} · ${P - 1}! ≡ ${P - 1}!。${P - 1}! 和 ${P} 互質，本身有反元素，兩邊同乘它就約掉了，這就是費馬小定理：p 是質數、a 不是 p 的倍數時，a^(p−1) ≡ 1。再拆出一個 a，a^(p−2) 就是反元素。不必一個一個試，用快速冪就能算出來。`,
  });

  const e = P - 2;
  const bits = e.toString(2);
  const rows: PowRow[] = [];
  let base = A;
  let result = 1;
  steps.push({
    op: `${A}${sup(e)} mod ${P}`, m: P, a: A, filled: P - 1, inv, pow: { rows: [], cur: -1 },
    desc: `算 ${A}${sup(e)} mod ${P}。${e} 的二進位是 ${bits}，從最低位開始：base 從 ${A} 開始，每過一位就平方一次；這一位是 1，就把 base 乘進 result。result 一開始是 1。`,
  });
  for (let i = 0; i < bits.length; i++) {
    const b = (e >> i) & 1;
    const old = result;
    if (b) result = (result * base) % P;
    rows.push({ bit: i, b, base, result });
    const last = i === bits.length - 1;
    const nb = (base * base) % P;
    steps.push({
      op: `第 ${i} 位 = ${b}`, m: P, a: A, filled: P - 1, inv, pow: { rows: rows.map((r) => ({ ...r })), cur: i },
      desc: `第 ${i} 位是 ${b}，此時 base = ${A}${sup(2 ** i)} mod ${P} = ${base}。${b ? `把它乘進去：result = ${old} × ${base} = ${old * base}，mod ${P} = ${result}。` : `這一位是 0，不乘，result 仍是 ${result}。`}${last ? "" : `接著 base 平方：${base}² = ${base * base}，mod ${P} = ${nb}。`}`,
    });
    base = nb;
  }
  steps.push({
    op: `${A}⁻¹ = ${result}`, m: P, a: A, filled: P - 1, inv, pow: { rows: rows.map((r) => ({ ...r })), cur: -1 },
    formula: [`${A}${sup(e)} ≡ ${result}  (mod ${P})`, `驗算：${A} × ${result} = ${A * result} = ${Math.floor((A * result) / P)} × ${P} + ${(A * result) % P}`],
    desc: `result = ${result}，和上面一個一個試出來的反元素一樣。指數 ${e} 只有 ${bits.length} 個位元，所以只做了 ${bits.length} 輪；模數換成 10⁹+7，指數 10⁹+5 也只有 30 個位元。`,
  });

  const x = 7;
  steps.push({
    op: `${x} / ${A} mod ${P}`, m: P, a: A, filled: P - 1, inv,
    formula: [`${x} / ${A} ≡ ${x} × ${A}⁻¹ ≡ ${x} × ${result} = ${x * result} ≡ ${(x * result) % P}  (mod ${P})`, `驗算：${(x * result) % P} × ${A} = ${((x * result) % P) * A} ≡ ${(((x * result) % P) * A) % P}`],
    desc: `有了反元素，除法就能做：${x} 除以 ${A} 等於 ${x} 乘上 ${result}，得到 ${(x * result) % P}，而 ${(x * result) % P} × ${A} 確實 ≡ ${x}。題目要求「答案取模 10⁹+7」又出現分數、平均值或機率時，就是這樣把除法換成乘法。`,
  });

  const M2 = 12;
  steps.push({
    op: `模 ${M2}，a = 4`, m: M2, a: 4, filled: M2, inv: findInv(4, M2, M2),
    desc: `換成不是質數的模數 ${M2}，a = 4：4k mod ${M2} 只會是 4、8、0 三種，1 永遠不出現（下排虛線），4 沒有反元素。原因是 gcd(4, ${M2}) = 4：4k 是 4 的倍數，減掉任意個 ${M2} 還是 4 的倍數，餘數不可能是 1。`,
  });
  const inv5 = findInv(A, M2, M2) as number;
  let pw = 1;
  for (let i = 0; i < M2 - 2; i++) pw = (pw * A) % M2;
  steps.push({
    op: `模 ${M2}，a = ${A}`, m: M2, a: A, filled: M2, inv: inv5, wrong: true,
    formula: [`照抄費馬：${A}^(${M2}−2) = ${A}${sup(M2 - 2)} ≡ ${pw}  (mod ${M2})`, `但 ${A} × ${pw} = ${A * pw} ≢ 1，真正的反元素是 ${inv5}`],
    desc: `a = ${A} 和 ${M2} 互質，反元素存在：${A} × ${inv5} = ${A * inv5} ≡ 1。可是照抄費馬小定理算 ${A}^(m−2)，得到的是 ${pw}，錯的。費馬小定理只保證質數模數；模數不是質數時，只要 gcd(a, m) = 1，就改用擴展歐幾里得求反元素。`,
  });
  steps.push({
    op: "結束", m: M2, a: A, filled: M2, inv: inv5,
    desc: `整理：加、減、乘可以隨時取模；除法要換成乘上反元素。模數是質數時，a 的反元素是 a^(p−2)，快速冪 O(log p)；模數不是質數時，gcd(a, m) = 1 才有反元素，用擴展歐幾里得求，同樣是 O(log m)。`,
  });
  return steps;
}

export function ModularDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];
  const n = s.m - 1;
  const cols = { gridTemplateColumns: `2.9rem repeat(${s.m === P ? n : s.m}, minmax(0, 1fr))` };
  const ks = Array.from({ length: s.m === P ? n : s.m }, (_, i) => i + 1);
  const hit = new Set(ks.filter((kk) => kk <= s.filled).map((kk) => (s.a * kk) % s.m));
  const curVal = s.cur !== undefined ? (s.a * s.cur) % s.m : undefined;
  const box = "grid h-8 min-w-0 place-items-center rounded-md border font-mono text-[12px] tabular-nums";

  const valTone = (kk: number) => {
    if (kk > s.filled) return CELL.dim;
    if (kk === s.inv) return CELL.amber;
    if (kk === s.cur) return CELL.accent;
    return "border-line-strong bg-surface text-ink";
  };
  const resTone = (r: number) => {
    if (r === curVal) return CELL.accent;
    if (hit.has(r)) return r === 1 && s.inv !== undefined ? CELL.amber : CELL.green;
    if (r === 1 && s.filled === ks.length) return "border-dashed border-amber bg-surface-2 text-amber";
    return CELL.dim;
  };

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={<span className="font-mono">模數 {s.m}{s.m === P ? "（質數）" : "（合數）"} · a = {s.a}</span>} />
      <div className="grid grid-cols-1 gap-3.5 p-3.5">
        <div className="overflow-x-auto">
          <div className="grid min-w-[300px] gap-1" style={cols}>
            <span className="self-center text-[11.5px] text-ink-3">k</span>
            {ks.map((kk) => <span key={`k${kk}`} className={`${box} border-line bg-surface-2 text-ink-3`}>{kk}</span>)}
            <span className="self-center font-mono text-[11.5px] text-ink-3">{s.a}k mod {s.m}</span>
            {ks.map((kk) => <span key={`v${kk}`} className={`${box} ${valTone(kk)}`}>{kk <= s.filled ? (s.a * kk) % s.m : "·"}</span>)}
          </div>
          <div className="eyebrow mt-3 mb-1.5">出現過的餘數（0 到 {s.m - 1}）</div>
          <div className="grid min-w-[300px] gap-1" style={{ gridTemplateColumns: `repeat(${s.m}, minmax(0, 1fr))` }}>
            {Array.from({ length: s.m }, (_, r) => <span key={`r${r}`} className={`${box} ${resTone(r)}`}>{r}</span>)}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3.5 gap-y-1 text-[12px] text-ink-3">
            <span className="inline-flex items-center gap-1.5"><i className={`inline-block h-3 w-3 rounded-[3px] border ${CELL.accent}`} />這一步</span>
            <span className="inline-flex items-center gap-1.5"><i className={`inline-block h-3 w-3 rounded-[3px] border ${CELL.green}`} />已出現的餘數</span>
            <span className="inline-flex items-center gap-1.5"><i className={`inline-block h-3 w-3 rounded-[3px] border ${CELL.amber}`} />乘出 1 的 k，也就是反元素</span>
          </div>
        </div>

        {s.pow && (
          <div className="overflow-x-auto">
            <div className="eyebrow mb-1">快速冪：{s.a}{sup(P - 2)} mod {P}，指數 {P - 2} = {(P - 2).toString(2)}₂</div>
            <table className="w-full max-w-[460px] border-collapse font-mono text-[12.5px] tabular-nums">
              <thead>
                <tr className="text-[11px] text-ink-3">
                  <th className="px-2 py-1 text-left font-medium">第幾位</th>
                  <th className="px-2 py-1 text-right font-medium">位元</th>
                  <th className="px-2 py-1 text-right font-medium">base = {s.a}^(2^i)</th>
                  <th className="px-2 py-1 text-right font-medium">result</th>
                </tr>
              </thead>
              <tbody>
                {s.pow.rows.map((r) => (
                  <tr key={r.bit} className={`border-t border-line ${r.bit === s.pow?.cur ? "bg-accent-soft" : ""}`}>
                    <td className="px-2 py-1">{r.bit}</td>
                    <td className={`px-2 py-1 text-right ${r.b ? "text-ink" : "text-ink-3"}`}>{r.b}</td>
                    <td className="px-2 py-1 text-right">{r.base}</td>
                    <td className={`px-2 py-1 text-right ${r.b ? "text-accent" : "text-ink-3"}`}>{r.result}</td>
                  </tr>
                ))}
                {s.pow.rows.length === 0 && (
                  <tr className="border-t border-line"><td colSpan={4} className="px-2 py-2 text-ink-3">result = 1，base = {s.a}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {s.formula && (
          <div className={`rounded-md border px-3 py-2 font-mono text-[12.5px] leading-relaxed ${s.wrong ? "border-amber bg-amber-soft text-amber" : "border-line bg-surface-2 text-ink"}`}>
            {s.formula.map((line) => <div key={line}>{line}</div>)}
          </div>
        )}
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
