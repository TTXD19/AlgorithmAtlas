"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, CELL } from "./StepBar";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

const ITEMS = ["A", "B", "C", "D"];
const N = ITEMS.length;
const FULL = 1 << N;
const SUPER = 0b1011; // 列舉子 mask 的對象：{A, B, D}
const bin = (m: number) => m.toString(2).padStart(N, "0");
const setOf = (m: number) => ITEMS.filter((_, i) => (m >> i) & 1);
const setStr = (m: number) => `{${setOf(m).join(", ") || " "}}`;
const sup = (x: number) => String(x).replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(d)]);

const TEXT = demoText(
  {
    sep: "、",
    opStart: "開始",
    opEnd: "結束",

    allIntro: (n: number, last: number, pow: string, full: number) =>
      `${n} 個元素，每個「選或不選」對應一個位元，所以一個 ${n} 位元整數就是一個子集。mask 從 0 數到 ${last}，就把 ${pow} = ${full} 個子集全部列出來。`,
    bitsOn: (list: string) => `第 ${list} 位是 1`,
    bitsNone: "沒有任何位是 1",
    maskLine: (mask: number, bits: string, which: string, set: string) =>
      `mask = ${mask} = ${bits}₂，${which}，對應子集 ${set}。`,
    allDone: (full: number) =>
      `列完了，${full} 個子集一個不漏、一個不重。判斷第 i 個元素有沒有被選用 (mask >> i) & 1，整個過程 O(2ⁿ · n)。`,

    subIntro: (bits: string, set: string) =>
      `第二個技巧：只列舉某個 mask 的子集合。以 mask = ${bits}₂ = ${set} 為例，從 sub = mask 開始，每次 sub = (sub − 1) & mask，直到 0。`,
    subStart: (bits: string, set: string) => `sub 從 mask 本身開始：${bits}₂ = ${set}。`,
    noteZero: "到了空集合，這一個處理完就要停：再算一次 (0 − 1) & mask 會回到 mask 本身，變成無窮迴圈。",
    noteOutside: (list: string, skipped: string) =>
      `減 1 把最低位的 1 變 0、它下面的位全變 1，連不屬於 mask 的第 ${list} 位也變成 1；AND 回去把它清掉，${skipped} 這幾個不是子 mask 的整數一次跳過。`,
    noteInside: "減 1 沒有碰到 mask 以外的位，AND 之後不變，就是下一個子 mask。",
    subLine: (prevBits: string, superBits: string, decBits: string, bits: string, set: string, note: string) =>
      `sub = (${prevBits}₂ − 1) & ${superBits}₂ = ${decBits}₂ & ${superBits}₂ = ${bits}₂ = ${set}。${note}`,
    subDone: (set: string, count: number, pow: string, total: number) =>
      `${set} 有 ${count} 個元素，剛好列出 ${pow} = ${total} 個子 mask，由大到小、沒有一個多餘。對所有 mask 各自列舉子 mask，總共 3ⁿ 次，這是 Bitmask DP 常見的複雜度。`,

    rightAll: (n: number) => `${n} 個元素 · 2ⁿ 個子集`,
    rightSub: (bits: string) => `mask = ${bits} 的子 mask`,
    maskTitle: "目前的 mask（第 i 位對應第 i 個元素）",
    dashedNote: "虛線的位不屬於 mask，永遠是 0",
    allTitle: (full: number) => `所有 ${full} 個 mask`,
    subTitle: "只看 mask 的子 mask（其他變灰）",
  },
  {
    en: {
      sep: ", ",
      opStart: "Start",
      opEnd: "Done",

      allIntro: (n: number, last: number, pow: string, full: number) =>
        `With ${n} elements, each in-or-out choice is one bit, so an integer of ${n} bits is exactly one subset. Counting mask from 0 up to ${last} therefore lists all ${pow} = ${full} subsets.`,
      bitsOn: (list: string) => `bit${list.includes(",") ? "s" : ""} ${list} ${list.includes(",") ? "are" : "is"} set`,
      bitsNone: "no bit is set",
      maskLine: (mask: number, bits: string, which: string, set: string) =>
        `mask = ${mask} = ${bits}₂, ${which}, so the subset is ${set}.`,
      allDone: (full: number) =>
        `That is the whole list: ${full} subsets, none missing and none repeated. Test whether element i is in the subset with (mask >> i) & 1, which makes the enumeration O(2ⁿ · n).`,

      subIntro: (bits: string, set: string) =>
        `The second trick enumerates only the subsets of one given mask. Take mask = ${bits}₂ = ${set}: start at sub = mask and repeat sub = (sub − 1) & mask until it reaches 0.`,
      subStart: (bits: string, set: string) => `sub starts at the mask itself: ${bits}₂ = ${set}.`,
      noteZero: "This is the empty set, and the loop must stop once it has been handled: computing (0 − 1) & mask once more would land back on the mask itself and loop forever.",
      noteOutside: (list: string, skipped: string) =>
        `Subtracting 1 clears the lowest set bit and turns every bit below it into 1, including bit${list.includes(",") ? "s" : ""} ${list}, which the mask does not contain. ANDing with the mask clears them again, skipping ${skipped} — integers that are not sub-masks — in a single move.`,
      noteInside: "Subtracting 1 touched no bit outside the mask, so the AND changes nothing and this is simply the next sub-mask.",
      subLine: (prevBits: string, superBits: string, decBits: string, bits: string, set: string, note: string) =>
        `sub = (${prevBits}₂ − 1) & ${superBits}₂ = ${decBits}₂ & ${superBits}₂ = ${bits}₂ = ${set}. ${note}`,
      subDone: (set: string, count: number, pow: string, total: number) =>
        `${set} has ${count} elements, and the loop listed exactly ${pow} = ${total} sub-masks, largest first and not one wasted. Enumerating the sub-masks of every mask costs 3ⁿ steps in total — the complexity you keep running into in bitmask DP.`,

      rightAll: (n: number) => `${n} elements · 2ⁿ subsets`,
      rightSub: (bits: string) => `sub-masks of mask = ${bits}`,
      maskTitle: "Current mask (bit i is element i)",
      dashedNote: "Dashed bits are outside the mask and stay 0",
      allTitle: (full: number) => `All ${full} masks`,
      subTitle: "Only the sub-masks of the mask (the rest are dimmed)",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

interface Step { desc: string; phase: "all" | "sub"; op: string; mask: number; listed: number[] }

function buildSteps(t: T): Step[] {
  const steps: Step[] = [];
  steps.push({ desc: t.allIntro(N, FULL - 1, `2${sup(N)}`, FULL), phase: "all", op: t.opStart, mask: -1, listed: [] });
  const listed: number[] = [];
  for (let mask = 0; mask < FULL; mask++) {
    listed.push(mask);
    const on = ITEMS.map((_, i) => i).filter((i) => (mask >> i) & 1);
    const which = on.length ? t.bitsOn(on.join(t.sep)) : t.bitsNone;
    steps.push({ desc: t.maskLine(mask, bin(mask), which, setStr(mask)), phase: "all", op: `mask = ${mask}`, mask, listed: [...listed] });
  }
  steps.push({ desc: t.allDone(FULL), phase: "all", op: t.opEnd, mask: -1, listed: [...listed] });

  // 子 mask 列舉
  const subs: number[] = [];
  steps.push({ desc: t.subIntro(bin(SUPER), setStr(SUPER)), phase: "sub", op: t.opStart, mask: -1, listed: [] });
  let sub = SUPER;
  let prev = -1;
  for (;;) {
    subs.push(sub);
    let desc: string;
    if (prev < 0) {
      desc = t.subStart(bin(sub), setStr(sub));
    } else {
      const dec = prev - 1;
      const outside = ITEMS.map((_, i) => i).filter((i) => (dec >> i) & 1 && !((SUPER >> i) & 1));
      const skipped = Array.from({ length: prev - 1 - sub }, (_, j) => prev - 1 - j).map(bin).join(t.sep);
      const note = sub === 0
        ? t.noteZero
        : outside.length
          ? t.noteOutside(outside.join(t.sep), skipped)
          : t.noteInside;
      desc = t.subLine(bin(prev), bin(SUPER), bin(dec), bin(sub), setStr(sub), note);
    }
    steps.push({ desc, phase: "sub", op: `sub = ${sub}`, mask: sub, listed: [...subs] });
    if (sub === 0) break;
    prev = sub;
    sub = (sub - 1) & SUPER;
  }
  steps.push({ desc: t.subDone(setStr(SUPER), setOf(SUPER).length, `2${sup(setOf(SUPER).length)}`, subs.length), phase: "sub", op: t.opEnd, mask: -1, listed: [...subs] });
  return steps;
}

export function SubsetEnumDemo() {
  const t = TEXT[useLocale()];
  const steps = useMemo(() => buildSteps(t), [t]);
  const [k, setK] = useState(0);
  const s = steps[k];
  const cur = s.mask;
  const isSub = (m: number) => (m & SUPER) === m;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={s.phase === "all" ? t.rightAll(N) : t.rightSub(bin(SUPER))} />

      <div className="grid grid-cols-1 gap-3.5 p-3.5 md:grid-cols-[auto_minmax(0,1fr)]">
        <div>
          <div className="eyebrow mb-2">{t.maskTitle}</div>
          <div className="flex gap-1">
            {ITEMS.map((_, col) => {
              const i = N - 1 - col;
              const bit = cur < 0 ? "·" : (cur >> i) & 1;
              const on = cur >= 0 && bit === 1;
              const outside = s.phase === "sub" && !((SUPER >> i) & 1);
              return (
                <div key={i} className="grid gap-1 text-center">
                  <span className="font-mono text-[10.5px] text-ink-3">bit {i}</span>
                  <span className={`grid h-8 w-10 place-items-center rounded-md border font-mono text-[13px] ${on ? CELL.accent : outside ? "border-dashed border-line text-ink-3" : "border-line bg-surface-2 text-ink-3"}`}>{bit}</span>
                  <span className={`grid h-8 w-10 place-items-center rounded-md border font-mono text-[13px] ${on ? CELL.green : outside ? "border-dashed border-line text-ink-3 line-through" : "border-line-strong bg-surface"}`}>{ITEMS[i]}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 font-mono text-[14px] text-ink">{cur >= 0 ? `${cur} → ${setStr(cur)}` : "—"}</div>
          {s.phase === "sub" && <div className="mt-1 text-[12px] text-ink-3">{t.dashedNote}</div>}
        </div>

        <div>
          <div className="eyebrow mb-2">{s.phase === "all" ? t.allTitle(FULL) : t.subTitle}</div>
          <div className="grid grid-cols-4 gap-1">
            {Array.from({ length: FULL }, (_, m) => m).map((m) => {
              const hidden = s.phase === "sub" && !isSub(m);
              const done = s.listed.includes(m);
              const cls = m === cur ? CELL.accent : hidden ? "border-line bg-surface-2 text-ink-3 opacity-40" : done ? CELL.green : "border-line-strong bg-surface";
              return (
                <div key={m} className={`rounded-md border px-2 py-1 font-mono text-[12px] leading-tight ${cls}`}>
                  <div className="tabular-nums">{bin(m)}</div>
                  <div className={`text-[11px] ${m === cur ? "" : "text-ink-3"}`}>{setStr(m)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
