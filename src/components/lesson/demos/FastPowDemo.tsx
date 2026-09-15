"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

const BASE = 3;
const MOD = BigInt(1_000_000_007);
const EXPS = [13, 25, 100];

interface Row { bit: number; val: number; base: string; used: boolean; result: string }
interface Step { desc: string; op: string; bitIdx: number; rows: Row[]; muls: number; phase: "intro" | "mul" | "sq" | "done"; result: string }

const fmtBig = (x: bigint) => x.toLocaleString("en-US");

function buildSteps(e: number): Step[] {
  const bits = e.toString(2).split("").reverse().map(Number); // bits[i] 是 2^i 的位元
  const steps: Step[] = [];
  const rows: Row[] = [];
  let muls = 0;
  let base = BigInt(BASE);
  let result = BigInt(1);
  const snap = (desc: string, op: string, bitIdx: number, phase: Step["phase"]) => steps.push({ desc, op, bitIdx, rows: rows.map((r) => ({ ...r })), muls, phase, result: fmtBig(result) });

  const terms = bits.map((b, i) => (b ? `${BASE}^${2 ** i}` : "")).filter(Boolean).reverse();
  snap(`${e} 的二進位是 ${e.toString(2)}，所以 ${BASE}^${e} = ${terms.join(" × ")}。逐次相乘要 ${e - 1} 次乘法；快速冪只需要處理 ${bits.length} 個位元。`, "開始", -1, "intro");

  for (let i = 0; i < bits.length; i++) {
    const row: Row = { bit: i, val: bits[i], base: fmtBig(base), used: false, result: fmtBig(result) };
    rows.push(row);
    if (bits[i]) {
      const before = result;
      result = (result * base) % MOD;
      muls++;
      row.used = true;
      row.result = fmtBig(result);
      snap(`位元 ${i}（權重 ${2 ** i}）是 1：把 ${BASE}^${2 ** i} 乘進結果。result = ${fmtBig(before)} × ${fmtBig(base)} = ${fmtBig(result)}${before * base >= MOD ? "（mod 10⁹+7）" : ""}。乘法 +1。`, `位元 ${i} = 1`, i, "mul");
    } else {
      snap(`位元 ${i}（權重 ${2 ** i}）是 0：${BASE}^${2 ** i} 不需要，結果不變，跳過。`, `位元 ${i} = 0`, i, "mul");
    }
    if (i < bits.length - 1) {
      const before = base;
      base = (base * base) % MOD;
      muls++;
      snap(`base 平方：${BASE}^${2 ** i} → ${BASE}^${2 ** (i + 1)}，${fmtBig(before)}² = ${fmtBig(base)}${before * before >= MOD ? "（mod 10⁹+7）" : ""}。乘法 +1。這一次平方就替下一個位元準備好了。`, `平方 → ${BASE}^${2 ** (i + 1)}`, i, "sq");
    }
  }
  snap(`完成：${BASE}^${e} ${e > 20 ? "mod 10⁹+7 " : ""}= ${fmtBig(result)}。總共 ${muls} 次乘法（${bits.filter(Boolean).length} 次乘進結果 + ${bits.length - 1} 次平方），逐次相乘要 ${e - 1} 次。指數變成十倍，位元只多 3、4 個，乘法次數也只多幾次。`, "結束", bits.length, "done");
  return steps;
}

const SMALL = "h-[26px] cursor-pointer rounded-md border px-2 font-mono text-[12px]";

export function FastPowDemo() {
  const [e, setE] = useState(13);
  const steps = useMemo(() => buildSteps(e), [e]);
  const [k, setK] = useState(0);
  const s = steps[Math.min(k, steps.length - 1)];
  const bits = e.toString(2).split("").reverse().map(Number);
  const naive = e - 1;
  const maxBar = Math.max(naive, 1);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader
        k={Math.min(k, steps.length - 1)} total={steps.length} setK={setK}
        left={
          <span className="flex items-center gap-1.5">
            <span className="font-mono text-[12.5px] text-ink">{s.op}</span>
            <span className="ml-2 text-[12px] text-ink-3">指數</span>
            {EXPS.map((x) => (
              <button key={x} type="button" onClick={() => { setE(x); setK(0); }} className={`${SMALL} ${x === e ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface hover:bg-surface-2"}`}>{x}</button>
            ))}
          </span>
        }
        right={`${BASE}^${e} · 乘法一律 mod 10⁹+7`}
      />

      <div className="px-3.5 pt-3">
        <div className="mb-1.5 flex items-baseline gap-3">
          <span className="eyebrow">指數 {e} 的二進位（右邊是最低位）</span>
          <span className="text-[12px] text-ink-3">上排是權重，下排是位元；由低位往高位處理</span>
        </div>
        <div className="flex gap-1">
          {[...bits].reverse().map((_, j) => {
            const i = bits.length - 1 - j;
            return <span key={i} className="grid w-9 place-items-center font-mono text-[10.5px] text-ink-3">{2 ** i}</span>;
          })}
        </div>
        <Cells
          items={[...bits].reverse()}
          tone={(j) => {
            const i = bits.length - 1 - j;
            if (i === s.bitIdx) return CELL.accent;
            if (i < s.bitIdx || s.phase === "done") return bits[i] ? CELL.green : CELL.dim;
            return "";
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-3.5 p-3.5 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="overflow-x-auto">
          <div className="eyebrow mb-1">每個位元做的事</div>
          <table className="w-full border-collapse text-[12.5px]">
            <thead>
              <tr className="text-left text-[11px] tracking-[0.08em] text-ink-3 uppercase">
                <th className="py-1 pr-3 font-semibold">位元</th><th className="py-1 pr-3 font-semibold">base = {BASE}^2ⁱ</th><th className="py-1 pr-3 font-semibold">乘進結果？</th><th className="py-1 font-semibold">result</th>
              </tr>
            </thead>
            <tbody>
              {s.rows.map((r) => (
                <tr key={r.bit} className={`border-t border-line font-mono tabular-nums ${r.bit === s.bitIdx ? "bg-accent-soft" : ""}`}>
                  <td className="py-1 pr-3">{r.bit}（{r.val}）</td>
                  <td className="py-1 pr-3">{r.base}</td>
                  <td className={`py-1 pr-3 ${r.used ? "text-green" : "text-ink-3"}`}>{r.used ? "是，×" + r.base : "否"}</td>
                  <td className="py-1">{r.result}</td>
                </tr>
              ))}
              {s.rows.length === 0 && <tr><td colSpan={4} className="py-2 text-ink-3">尚未開始</td></tr>}
            </tbody>
          </table>
        </div>
        <div>
          <div className="eyebrow mb-1">乘法次數</div>
          {[
            { name: "快速冪", v: s.muls, tone: "bg-accent" },
            { name: "逐次相乘", v: naive, tone: "bg-amber" },
          ].map((r) => (
            <div key={r.name} className="mb-1.5">
              <div className="flex justify-between text-[12.5px]"><span>{r.name}</span><span className="font-mono tabular-nums">{r.v}</span></div>
              <div className="h-2.5 overflow-hidden rounded-sm bg-surface-2">
                <i className={`block h-full rounded-sm ${r.tone}`} style={{ width: `${Math.max(1, (r.v / maxBar) * 100)}%` }} />
              </div>
            </div>
          ))}
          <div className="mt-2 rounded-lg border border-line bg-surface-2 px-3 py-2">
            <div className="eyebrow mb-0.5">目前 result</div>
            <div className="font-mono text-[15px] tabular-nums">{s.result}</div>
          </div>
        </div>
      </div>
      <StepFooter k={Math.min(k, steps.length - 1)} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
