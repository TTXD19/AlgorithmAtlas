"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, CELL } from "./StepBar";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

/** 模 13 之下求 5 的反元素：先逐一乘看出「乘 a 是重新排列」，再推出費馬小定理，用快速冪算 5¹¹，最後看模數不是質數時會怎樣 */
const P = 13;
const A = 5;

const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const sup = (n: number) => String(n).split("").map((d) => SUP[Number(d)]).join("");

const TEXT = demoText(
  {
    opStart: "開始",
    opEnd: "結束",
    opMultipliedAll: "乘完 1 … 12",
    opFermat: "費馬小定理",
    opMod: (m: number, a: number) => `模 ${m}，a = ${a}`,
    opBit: (i: number, b: number) => `第 ${i} 位 = ${b}`,
    listSep: "、",
    verify: "驗算：",
    intro: `模 ${P} 的世界裡只有 0 到 ${P - 1} 這 ${P} 個數。加、減、乘都可以先取餘數再算，結果和算完才取餘數一樣。麻煩的是除法：要找一個 x 使 ${A} · x ≡ 1 (mod ${P})，x 叫做 ${A} 的反元素，之後「除以 ${A}」就改成「乘上 x」。先把 k = 1 到 ${P - 1} 逐一乘上 ${A}。`,
    foundInverse: (k: number) =>
      `${A} × ${k} = ${A * k} = ${Math.floor((A * k) / P)} × ${P} + 1，餘數是 1。所以 ${A} × ${k} ≡ 1 (mod ${P})，${A} 的反元素就是 ${k}（黃色）。`,
    multiplyStep: (k: number, v: number) => `${A} × ${k} = ${A * k}，除以 ${P} 餘 ${v}。餘數 ${v} 第一次出現。`,
    permutation: (from: number, rest: string) =>
      `剩下的 k = ${from} 到 ${P - 1}，餘數依序是 ${rest}。1 到 ${P - 1} 每個餘數剛好出現一次：若 ${A}i ≡ ${A}j，則 ${P} 整除 ${A}(i − j)，${P} 是質數又不整除 ${A}，只能整除 i − j，於是 i = j。「乘上 ${A}」只是把 1 到 ${P - 1} 重新排列，所以 1 一定出現，而且只出現一次。`,
    fermat: `第二列是 1 到 ${P - 1} 的重新排列，所以兩列各自全部乘起來相等。左邊提出 ${P - 1} 個 ${A}，得到 ${A}${sup(P - 1)} · ${P - 1}! ≡ ${P - 1}!。${P - 1}! 和 ${P} 互質，本身有反元素，兩邊同乘它就約掉了，這就是費馬小定理：p 是質數、a 不是 p 的倍數時，a^(p−1) ≡ 1。再拆出一個 a，a^(p−2) 就是反元素。不必一個一個試，用快速冪就能算出來。`,
    powIntro: (e: number, bits: string) =>
      `算 ${A}${sup(e)} mod ${P}。${e} 的二進位是 ${bits}，從最低位開始：base 從 ${A} 開始，每過一位就平方一次；這一位是 1，就把 base 乘進 result。result 一開始是 1。`,
    bitStep: (i: number, b: number, base: number, old: number, result: number, last: boolean, nb: number) =>
      `第 ${i} 位是 ${b}，此時 base = ${A}${sup(2 ** i)} mod ${P} = ${base}。${b ? `把它乘進去：result = ${old} × ${base} = ${old * base}，mod ${P} = ${result}。` : `這一位是 0，不乘，result 仍是 ${result}。`}${last ? "" : `接著 base 平方：${base}² = ${base * base}，mod ${P} = ${nb}。`}`,
    powDone: (result: number, e: number, bits: number) =>
      `result = ${result}，和上面一個一個試出來的反元素一樣。指數 ${e} 只有 ${bits} 個位元，所以只做了 ${bits} 輪；模數換成 10⁹+7，指數 10⁹+5 也只有 30 個位元。`,
    divide: (x: number, inv: number, q: number) =>
      `有了反元素，除法就能做：${x} 除以 ${A} 等於 ${x} 乘上 ${inv}，得到 ${q}，而 ${q} × ${A} 確實 ≡ ${x}。題目要求「答案取模 10⁹+7」又出現分數、平均值或機率時，就是這樣把除法換成乘法。`,
    composite: (m: number) =>
      `換成不是質數的模數 ${m}，a = 4：4k mod ${m} 只會是 4、8、0 三種，1 永遠不出現（下排虛線），4 沒有反元素。原因是 gcd(4, ${m}) = 4：4k 是 4 的倍數，減掉任意個 ${m} 還是 4 的倍數，餘數不可能是 1。`,
    fermatBlind: (m: number, pw: number) => `照抄費馬：${A}^(${m}−2) = ${A}${sup(m - 2)} ≡ ${pw}  (mod ${m})`,
    fermatWrong: (pw: number, inv: number) => `但 ${A} × ${pw} = ${A * pw} ≢ 1，真正的反元素是 ${inv}`,
    compositeInverse: (m: number, inv: number, pw: number) =>
      `a = ${A} 和 ${m} 互質，反元素存在：${A} × ${inv} = ${A * inv} ≡ 1。可是照抄費馬小定理算 ${A}^(m−2)，得到的是 ${pw}，錯的。費馬小定理只保證質數模數；模數不是質數時，只要 gcd(a, m) = 1，就改用擴展歐幾里得求反元素。`,
    summary: "整理：加、減、乘可以隨時取模；除法要換成乘上反元素。模數是質數時，a 的反元素是 a^(p−2)，快速冪 O(log p)；模數不是質數時，gcd(a, m) = 1 才有反元素，用擴展歐幾里得求，同樣是 O(log m)。",
    modulusLabel: "模數 ",
    isPrime: "（質數）",
    isComposite: "（合數）",
    residuesTitle: (max: number) => `出現過的餘數（0 到 ${max}）`,
    legendCurrent: "這一步",
    legendSeen: "已出現的餘數",
    legendInverse: "乘出 1 的 k，也就是反元素",
    fastPowTitle: (a: number) => `快速冪：${a}${sup(P - 2)} mod ${P}，指數 ${P - 2} = ${(P - 2).toString(2)}₂`,
    colBit: "第幾位",
    colBitValue: "位元",
    initRow: (a: number) => `result = 1，base = ${a}`,
  },
  {
    en: {
      opStart: "Start",
      opEnd: "Done",
      opMultipliedAll: "Multiplied 1 … 12",
      opFermat: "Fermat's little theorem",
      opMod: (m: number, a: number) => `mod ${m}, a = ${a}`,
      opBit: (i: number, b: number) => `Bit ${i} = ${b}`,
      listSep: ", ",
      verify: "Check: ",
      intro: `The world mod ${P} holds only the ${P} numbers from 0 to ${P - 1}. Addition, subtraction and multiplication can all take the remainder first and still land on the same answer as taking it at the end. Division is the awkward one: you need an x with ${A} · x ≡ 1 (mod ${P}). That x is called the inverse of ${A}, and from then on dividing by ${A} becomes multiplying by x. Start by multiplying every k from 1 to ${P - 1} by ${A}.`,
      foundInverse: (k: number) =>
        `${A} × ${k} = ${A * k} = ${Math.floor((A * k) / P)} × ${P} + 1, so the remainder is 1. That means ${A} × ${k} ≡ 1 (mod ${P}), and the inverse of ${A} is ${k}, shown in amber.`,
      multiplyStep: (k: number, v: number) => `${A} × ${k} = ${A * k}, which leaves remainder ${v} when divided by ${P}. This is the first time ${v} has come up.`,
      permutation: (from: number, rest: string) =>
        `The remaining k = ${from} to ${P - 1} give the remainders ${rest}, in that order. Every remainder from 1 to ${P - 1} shows up exactly once: if ${A}i ≡ ${A}j then ${P} divides ${A}(i − j), and since ${P} is prime and does not divide ${A}, it has to divide i − j, so i = j. Multiplying by ${A} merely rearranges 1 to ${P - 1}, which is why 1 is certain to appear, and to appear only once.`,
      fermat: `The second row is a rearrangement of 1 to ${P - 1}, so multiplying each row out gives the same product. Pulling ${P - 1} copies of ${A} out of the left side leaves ${A}${sup(P - 1)} · ${P - 1}! ≡ ${P - 1}!. Since ${P - 1}! is coprime to ${P} it has an inverse of its own, so multiplying both sides by it cancels the factorial. That is Fermat's little theorem: when p is prime and a is not a multiple of p, a^(p−1) ≡ 1. Peel off one more a and a^(p−2) is the inverse — no trial and error required, just fast exponentiation.`,
      powIntro: (e: number, bits: string) =>
        `Now compute ${A}${sup(e)} mod ${P}. In binary ${e} is ${bits}, read from the lowest bit upwards: base starts at ${A} and is squared once per bit, and whenever the bit is 1 the base is multiplied into result. result starts at 1.`,
      bitStep: (i: number, b: number, base: number, old: number, result: number, last: boolean, nb: number) =>
        `Bit ${i} is ${b}, and at this point base = ${A}${sup(2 ** i)} mod ${P} = ${base}. ${b ? `Multiply it in: result = ${old} × ${base} = ${old * base}, which is ${result} mod ${P}.` : `This bit is 0, so nothing is multiplied in and result stays ${result}.`}${last ? "" : ` Then square the base: ${base}² = ${base * base}, which is ${nb} mod ${P}.`}`,
      powDone: (result: number, e: number, bits: number) =>
        `result = ${result}, the same inverse the one-by-one search turned up. The exponent ${e} has only ${bits} bits, so only ${bits} rounds were needed; switch the modulus to 10⁹+7 and the exponent 10⁹+5 still has just 30 bits.`,
      divide: (x: number, inv: number, q: number) =>
        `With the inverse in hand, division works: ${x} divided by ${A} is ${x} multiplied by ${inv}, which gives ${q}, and ${q} × ${A} really is ≡ ${x}. Whenever a problem asks for the answer modulo 10⁹+7 and fractions, averages or probabilities turn up, this is how division becomes multiplication.`,
      composite: (m: number) =>
        `Switch to the composite modulus ${m} with a = 4: 4k mod ${m} is only ever 4, 8 or 0, so 1 never appears (the dashed cell in the lower row) and 4 has no inverse. The reason is gcd(4, ${m}) = 4: 4k is a multiple of 4, and subtracting any number of ${m}s leaves a multiple of 4, so the remainder can never be 1.`,
      fermatBlind: (m: number, pw: number) => `Fermat applied blindly: ${A}^(${m}−2) = ${A}${sup(m - 2)} ≡ ${pw}  (mod ${m})`,
      fermatWrong: (pw: number, inv: number) => `But ${A} × ${pw} = ${A * pw} ≢ 1, and the real inverse is ${inv}`,
      compositeInverse: (m: number, inv: number, pw: number) =>
        `a = ${A} is coprime to ${m}, so an inverse does exist: ${A} × ${inv} = ${A * inv} ≡ 1. Applying Fermat's little theorem blindly and computing ${A}^(m−2), however, gives ${pw}, which is wrong. Fermat only guarantees anything for a prime modulus; when the modulus is composite, an inverse exists as long as gcd(a, m) = 1, and the extended Euclidean algorithm is what finds it.`,
      summary: "To recap: addition, subtraction and multiplication can take the modulus at any point, while division has to become multiplication by an inverse. For a prime modulus the inverse of a is a^(p−2), which fast exponentiation finds in O(log p). For a composite modulus an inverse exists only when gcd(a, m) = 1, and the extended Euclidean algorithm finds it, also in O(log m).",
      modulusLabel: "modulus ",
      isPrime: " (prime)",
      isComposite: " (composite)",
      residuesTitle: (max: number) => `Residues seen so far (0 to ${max})`,
      legendCurrent: "This step",
      legendSeen: "Residue already seen",
      legendInverse: "The k that multiplies to 1 — the inverse",
      fastPowTitle: (a: number) => `Fast exponentiation: ${a}${sup(P - 2)} mod ${P}, exponent ${P - 2} = ${(P - 2).toString(2)}₂`,
      colBit: "Bit index",
      colBitValue: "Bit",
      initRow: (a: number) => `result = 1, base = ${a}`,
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

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

function buildSteps(t: T): Step[] {
  const steps: Step[] = [];
  const findInv = (a: number, m: number, upto: number) => {
    for (let k = 1; k <= upto; k++) if ((a * k) % m === 1) return k;
    return undefined;
  };

  steps.push({
    op: t.opStart, m: P, a: A, filled: 0,
    desc: t.intro,
  });

  let inv: number | undefined;
  for (let k = 1; k < P; k++) {
    const v = (A * k) % P;
    if (v === 1) {
      inv = k;
      steps.push({ op: `${A} × ${k}`, m: P, a: A, filled: k, cur: k, inv, desc: t.foundInverse(k) });
      break;
    }
    steps.push({ op: `${A} × ${k}`, m: P, a: A, filled: k, cur: k, desc: t.multiplyStep(k, v) });
  }
  const rest = Array.from({ length: P - 1 - (inv as number) }, (_, i) => (A * ((inv as number) + 1 + i)) % P);
  steps.push({
    op: t.opMultipliedAll, m: P, a: A, filled: P - 1, inv,
    desc: t.permutation((inv as number) + 1, rest.join(t.listSep)),
  });

  steps.push({
    op: t.opFermat, m: P, a: A, filled: P - 1, inv,
    formula: [
      `(${A}·1)(${A}·2)(${A}·3)…(${A}·${P - 1}) ≡ 1·2·3·…·${P - 1}  (mod ${P})`,
      `${A}${sup(P - 1)} · ${P - 1}! ≡ ${P - 1}!  (mod ${P})`,
      `${A}${sup(P - 1)} ≡ 1   ⇒   ${A} · ${A}${sup(P - 2)} ≡ 1   ⇒   ${A}⁻¹ ≡ ${A}${sup(P - 2)}`,
    ],
    desc: t.fermat,
  });

  const e = P - 2;
  const bits = e.toString(2);
  const rows: PowRow[] = [];
  let base = A;
  let result = 1;
  steps.push({
    op: `${A}${sup(e)} mod ${P}`, m: P, a: A, filled: P - 1, inv, pow: { rows: [], cur: -1 },
    desc: t.powIntro(e, bits),
  });
  for (let i = 0; i < bits.length; i++) {
    const b = (e >> i) & 1;
    const old = result;
    if (b) result = (result * base) % P;
    rows.push({ bit: i, b, base, result });
    const last = i === bits.length - 1;
    const nb = (base * base) % P;
    steps.push({
      op: t.opBit(i, b), m: P, a: A, filled: P - 1, inv, pow: { rows: rows.map((r) => ({ ...r })), cur: i },
      desc: t.bitStep(i, b, base, old, result, last, nb),
    });
    base = nb;
  }
  steps.push({
    op: `${A}⁻¹ = ${result}`, m: P, a: A, filled: P - 1, inv, pow: { rows: rows.map((r) => ({ ...r })), cur: -1 },
    formula: [`${A}${sup(e)} ≡ ${result}  (mod ${P})`, `${t.verify}${A} × ${result} = ${A * result} = ${Math.floor((A * result) / P)} × ${P} + ${(A * result) % P}`],
    desc: t.powDone(result, e, bits.length),
  });

  const x = 7;
  steps.push({
    op: `${x} / ${A} mod ${P}`, m: P, a: A, filled: P - 1, inv,
    formula: [`${x} / ${A} ≡ ${x} × ${A}⁻¹ ≡ ${x} × ${result} = ${x * result} ≡ ${(x * result) % P}  (mod ${P})`, `${t.verify}${(x * result) % P} × ${A} = ${((x * result) % P) * A} ≡ ${(((x * result) % P) * A) % P}`],
    desc: t.divide(x, result, (x * result) % P),
  });

  const M2 = 12;
  steps.push({
    op: t.opMod(M2, 4), m: M2, a: 4, filled: M2, inv: findInv(4, M2, M2),
    desc: t.composite(M2),
  });
  const inv5 = findInv(A, M2, M2) as number;
  let pw = 1;
  for (let i = 0; i < M2 - 2; i++) pw = (pw * A) % M2;
  steps.push({
    op: t.opMod(M2, A), m: M2, a: A, filled: M2, inv: inv5, wrong: true,
    formula: [t.fermatBlind(M2, pw), t.fermatWrong(pw, inv5)],
    desc: t.compositeInverse(M2, inv5, pw),
  });
  steps.push({
    op: t.opEnd, m: M2, a: A, filled: M2, inv: inv5,
    desc: t.summary,
  });
  return steps;
}

export function ModularDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const steps = useMemo(() => buildSteps(TEXT[locale]), [locale]);
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
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={<span className="font-mono">{t.modulusLabel}{s.m}{s.m === P ? t.isPrime : t.isComposite} · a = {s.a}</span>} />
      <div className="grid grid-cols-1 gap-3.5 p-3.5">
        <div className="overflow-x-auto">
          <div className="grid min-w-[300px] gap-1" style={cols}>
            <span className="self-center text-[11.5px] text-ink-3">k</span>
            {ks.map((kk) => <span key={`k${kk}`} className={`${box} border-line bg-surface-2 text-ink-3`}>{kk}</span>)}
            <span className="self-center font-mono text-[11.5px] text-ink-3">{s.a}k mod {s.m}</span>
            {ks.map((kk) => <span key={`v${kk}`} className={`${box} ${valTone(kk)}`}>{kk <= s.filled ? (s.a * kk) % s.m : "·"}</span>)}
          </div>
          <div className="eyebrow mt-3 mb-1.5">{t.residuesTitle(s.m - 1)}</div>
          <div className="grid min-w-[300px] gap-1" style={{ gridTemplateColumns: `repeat(${s.m}, minmax(0, 1fr))` }}>
            {Array.from({ length: s.m }, (_, r) => <span key={`r${r}`} className={`${box} ${resTone(r)}`}>{r}</span>)}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3.5 gap-y-1 text-[12px] text-ink-3">
            <span className="inline-flex items-center gap-1.5"><i className={`inline-block h-3 w-3 rounded-[3px] border ${CELL.accent}`} />{t.legendCurrent}</span>
            <span className="inline-flex items-center gap-1.5"><i className={`inline-block h-3 w-3 rounded-[3px] border ${CELL.green}`} />{t.legendSeen}</span>
            <span className="inline-flex items-center gap-1.5"><i className={`inline-block h-3 w-3 rounded-[3px] border ${CELL.amber}`} />{t.legendInverse}</span>
          </div>
        </div>

        {s.pow && (
          <div className="overflow-x-auto">
            <div className="eyebrow mb-1">{t.fastPowTitle(s.a)}</div>
            <table className="w-full max-w-[460px] border-collapse font-mono text-[12.5px] tabular-nums">
              <thead>
                <tr className="text-[11px] text-ink-3">
                  <th className="px-2 py-1 text-left font-medium">{t.colBit}</th>
                  <th className="px-2 py-1 text-right font-medium">{t.colBitValue}</th>
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
                  <tr className="border-t border-line"><td colSpan={4} className="px-2 py-2 text-ink-3">{t.initRow(s.a)}</td></tr>
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
