"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

const BASE = 3;
const MOD = BigInt(1_000_000_007);
const EXPS = [13, 25, 100];

const TEXT = demoText(
  {
    opStart: "開始",
    opEnd: "結束",
    opBit: (i: number, v: number) => `位元 ${i} = ${v}`,
    opSquare: (b: number, w: number) => `平方 → ${b}^${w}`,

    intro: (e: number, binary: string, base: number, terms: string, naive: number, nbits: number) =>
      `${e} 的二進位是 ${binary}，所以 ${base}^${e} = ${terms}。逐次相乘要 ${naive} 次乘法；快速冪只需要處理 ${nbits} 個位元。`,
    mulIn: (i: number, w: number, base: number, before: string, b: string, after: string, wrapped: boolean) =>
      `位元 ${i}（權重 ${w}）是 1：把 ${base}^${w} 乘進結果。result = ${before} × ${b} = ${after}${wrapped ? "（mod 10⁹+7）" : ""}。乘法 +1。`,
    skipBit: (i: number, w: number, base: number) => `位元 ${i}（權重 ${w}）是 0：${base}^${w} 不需要，結果不變，跳過。`,
    square: (base: number, w: number, w2: number, before: string, after: string, wrapped: boolean) =>
      `base 平方：${base}^${w} → ${base}^${w2}，${before}² = ${after}${wrapped ? "（mod 10⁹+7）" : ""}。乘法 +1。這一次平方就替下一個位元準備好了。`,
    finished: (base: number, e: number, big: boolean, result: string, muls: number, ones: number, squares: number, naive: number) =>
      `完成：${base}^${e} ${big ? "mod 10⁹+7 " : ""}= ${result}。總共 ${muls} 次乘法（${ones} 次乘進結果 + ${squares} 次平方），逐次相乘要 ${naive} 次。指數變成十倍，位元只多 3、4 個，乘法次數也只多幾次。`,

    expLabel: "指數",
    right: (base: number, e: number) => `${base}^${e} · 乘法一律 mod 10⁹+7`,
    bitsTitle: (e: number) => `指數 ${e} 的二進位（右邊是最低位）`,
    bitsNote: "上排是權重，下排是位元；由低位往高位處理",
    tableTitle: "每個位元做的事",
    thBit: "位元",
    thUsed: "乘進結果？",
    cellBit: (bit: number, val: number) => `${bit}（${val}）`,
    usedYes: (b: string) => `是，×${b}`,
    usedNo: "否",
    notStarted: "尚未開始",
    mulCount: "乘法次數",
    fastName: "快速冪",
    naiveName: "逐次相乘",
    resultTitle: "目前 result",
  },
  {
    en: {
      opStart: "Start",
      opEnd: "Done",
      opBit: (i: number, v: number) => `bit ${i} = ${v}`,
      opSquare: (b: number, w: number) => `square → ${b}^${w}`,

      intro: (e: number, binary: string, base: number, terms: string, naive: number, nbits: number) =>
        `${e} in binary is ${binary}, so ${base}^${e} = ${terms}. Multiplying one factor at a time costs ${naive} multiplications, while fast exponentiation only walks ${nbits} bits.`,
      mulIn: (i: number, w: number, base: number, before: string, b: string, after: string, wrapped: boolean) =>
        `Bit ${i} (weight ${w}) is 1, so multiply ${base}^${w} into the result: result = ${before} × ${b} = ${after}${wrapped ? " (mod 10⁹+7)" : ""}. That is one more multiplication.`,
      skipBit: (i: number, w: number, base: number) => `Bit ${i} (weight ${w}) is 0, so ${base}^${w} is not needed. The result is unchanged, so skip it.`,
      square: (base: number, w: number, w2: number, before: string, after: string, wrapped: boolean) =>
        `Square the base: ${base}^${w} → ${base}^${w2}, so ${before}² = ${after}${wrapped ? " (mod 10⁹+7)" : ""}. That is one more multiplication, and it is exactly the value the next bit needs.`,
      finished: (base: number, e: number, big: boolean, result: string, muls: number, ones: number, squares: number, naive: number) =>
        `Done: ${base}^${e} ${big ? "mod 10⁹+7 " : ""}= ${result}. That is ${muls} multiplications in total (${ones} multiplied into the result plus ${squares} squarings), where multiplying one at a time would need ${naive}. Make the exponent ten times larger and it gains only three or four bits, so the multiplication count barely moves.`,

      expLabel: "Exponent",
      right: (base: number, e: number) => `${base}^${e} · every multiplication is mod 10⁹+7`,
      bitsTitle: (e: number) => `Exponent ${e} in binary (lowest bit on the right)`,
      bitsNote: "The top row is the weight and the bottom row is the bit; the bits are processed from low to high",
      tableTitle: "What each bit does",
      thBit: "Bit",
      thUsed: "Into result?",
      cellBit: (bit: number, val: number) => `${bit} (${val})`,
      usedYes: (b: string) => `Yes, ×${b}`,
      usedNo: "No",
      notStarted: "Not started yet",
      mulCount: "Multiplications",
      fastName: "Fast exponentiation",
      naiveName: "One at a time",
      resultTitle: "Current result",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

interface Row { bit: number; val: number; base: string; used: boolean; result: string }
interface Step { desc: string; op: string; bitIdx: number; rows: Row[]; muls: number; phase: "intro" | "mul" | "sq" | "done"; result: string }

const fmtBig = (x: bigint) => x.toLocaleString("en-US");

function buildSteps(t: T, e: number): Step[] {
  const bits = e.toString(2).split("").reverse().map(Number); // bits[i] 是 2^i 的位元
  const steps: Step[] = [];
  const rows: Row[] = [];
  let muls = 0;
  let base = BigInt(BASE);
  let result = BigInt(1);
  const snap = (desc: string, op: string, bitIdx: number, phase: Step["phase"]) => steps.push({ desc, op, bitIdx, rows: rows.map((r) => ({ ...r })), muls, phase, result: fmtBig(result) });

  const terms = bits.map((b, i) => (b ? `${BASE}^${2 ** i}` : "")).filter(Boolean).reverse();
  snap(t.intro(e, e.toString(2), BASE, terms.join(" × "), e - 1, bits.length), t.opStart, -1, "intro");

  for (let i = 0; i < bits.length; i++) {
    const row: Row = { bit: i, val: bits[i], base: fmtBig(base), used: false, result: fmtBig(result) };
    rows.push(row);
    if (bits[i]) {
      const before = result;
      result = (result * base) % MOD;
      muls++;
      row.used = true;
      row.result = fmtBig(result);
      snap(t.mulIn(i, 2 ** i, BASE, fmtBig(before), fmtBig(base), fmtBig(result), before * base >= MOD), t.opBit(i, 1), i, "mul");
    } else {
      snap(t.skipBit(i, 2 ** i, BASE), t.opBit(i, 0), i, "mul");
    }
    if (i < bits.length - 1) {
      const before = base;
      base = (base * base) % MOD;
      muls++;
      snap(t.square(BASE, 2 ** i, 2 ** (i + 1), fmtBig(before), fmtBig(base), before * before >= MOD), t.opSquare(BASE, 2 ** (i + 1)), i, "sq");
    }
  }
  snap(t.finished(BASE, e, e > 20, fmtBig(result), muls, bits.filter(Boolean).length, bits.length - 1, e - 1), t.opEnd, bits.length, "done");
  return steps;
}

const SMALL = "h-[26px] cursor-pointer rounded-md border px-2 font-mono text-[12px]";

export function FastPowDemo() {
  const t = TEXT[useLocale()];
  const [e, setE] = useState(13);
  const steps = useMemo(() => buildSteps(t, e), [t, e]);
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
            <span className="ml-2 text-[12px] text-ink-3">{t.expLabel}</span>
            {EXPS.map((x) => (
              <button key={x} type="button" onClick={() => { setE(x); setK(0); }} className={`${SMALL} ${x === e ? "border-accent bg-accent text-accent-ink" : "border-line bg-surface hover:bg-surface-2"}`}>{x}</button>
            ))}
          </span>
        }
        right={t.right(BASE, e)}
      />

      <div className="px-3.5 pt-3">
        <div className="mb-1.5 flex items-baseline gap-3">
          <span className="eyebrow">{t.bitsTitle(e)}</span>
          <span className="text-[12px] text-ink-3">{t.bitsNote}</span>
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
          <div className="eyebrow mb-1">{t.tableTitle}</div>
          <table className="w-full border-collapse text-[12.5px]">
            <thead>
              <tr className="text-left text-[11px] tracking-[0.08em] text-ink-3 uppercase">
                <th className="py-1 pr-3 font-semibold">{t.thBit}</th><th className="py-1 pr-3 font-semibold">base = {BASE}^2ⁱ</th><th className="py-1 pr-3 font-semibold">{t.thUsed}</th><th className="py-1 font-semibold">result</th>
              </tr>
            </thead>
            <tbody>
              {s.rows.map((r) => (
                <tr key={r.bit} className={`border-t border-line font-mono tabular-nums ${r.bit === s.bitIdx ? "bg-accent-soft" : ""}`}>
                  <td className="py-1 pr-3">{t.cellBit(r.bit, r.val)}</td>
                  <td className="py-1 pr-3">{r.base}</td>
                  <td className={`py-1 pr-3 ${r.used ? "text-green" : "text-ink-3"}`}>{r.used ? t.usedYes(r.base) : t.usedNo}</td>
                  <td className="py-1">{r.result}</td>
                </tr>
              ))}
              {s.rows.length === 0 && <tr><td colSpan={4} className="py-2 text-ink-3">{t.notStarted}</td></tr>}
            </tbody>
          </table>
        </div>
        <div>
          <div className="eyebrow mb-1">{t.mulCount}</div>
          {[
            { name: t.fastName, v: s.muls, tone: "bg-accent" },
            { name: t.naiveName, v: naive, tone: "bg-amber" },
          ].map((r) => (
            <div key={r.name} className="mb-1.5">
              <div className="flex justify-between text-[12.5px]"><span>{r.name}</span><span className="font-mono tabular-nums">{r.v}</span></div>
              <div className="h-2.5 overflow-hidden rounded-sm bg-surface-2">
                <i className={`block h-full rounded-sm ${r.tone}`} style={{ width: `${Math.max(1, (r.v / maxBar) * 100)}%` }} />
              </div>
            </div>
          ))}
          <div className="mt-2 rounded-lg border border-line bg-surface-2 px-3 py-2">
            <div className="eyebrow mb-0.5">{t.resultTitle}</div>
            <div className="font-mono text-[15px] tabular-nums">{s.result}</div>
          </div>
        </div>
      </div>
      <StepFooter k={Math.min(k, steps.length - 1)} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
