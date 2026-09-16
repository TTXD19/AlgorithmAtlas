"use client";

import { useMemo, useState } from "react";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

const T = "abracadabra";
const P = "abra";
const B = 31;
const M = 101;
const val = (c: string) => c.charCodeAt(0) - 96;
const hashOf = (s: string) => { let x = 0; for (const c of s) x = (x * B + val(c)) % M; return x; };
const HP = hashOf(P);

const TEXT = demoText(
  {
    sep: "、",
    hashP: (p: string, hp: number, b: number, mMinus1: number, mod: number, top: number) =>
      `先算模式「${p}」的雜湊：逐字元累加得 hash(P) = ${hp}。另外準備 B^(m−1) mod M = ${b}^${mMinus1} mod ${mod} = ${top}，這是「最高位」的權重，等一下要用它把離開視窗的字元減掉。`,
    formulaTop: (hp: number, top: number) => `hash(P) = ${hp}，B^(m−1) = ${top}`,
    firstWindow: (m: number, sub: string, hw: number) => `第一個視窗 T[0, ${m}) = 「${sub}」從頭算一次，O(m)：hash = ${hw}。`,
    opWindow: (i: number) => `視窗 ${i}`,
    opEnd: "結束",
    skipTail: (hw: number, hp: number) => ` ${hw} ≠ ${hp}，雜湊不同就一定不是，直接滑到下一格。`,
    hit: (hw: number, hp: number, i: number, iEnd: number, sub: string, p: string, m: number) =>
      `${hw} = ${hp}，雜湊相同，但雜湊相同不代表字串相同，要逐字元確認。T[${i}, ${iEnd}) = 「${sub}」和「${p}」逐字比對，${m} 個字元全部一樣，位置 ${i} 是真的命中。`,
    falsePos: (hw: number, hp: number, i: number, iEnd: number, sub: string, j: number, tc: string, pc: string, mod: number) =>
      `${hw} = ${hp}，雜湊相同，逐字元確認：T[${i}, ${iEnd}) = 「${sub}」，第 ${j + 1} 個字元 '${tc}' ≠ '${pc}'。這是假陽性（碰撞）：兩個不同的字串 mod ${mod} 後剛好一樣。mod 越大碰撞越少，這裡故意用小的 ${mod} 讓你看到它。`,
    slide: (i: number, outC: string, outV: number, top: number, b: number, inC: string, inV: number, prev: number, mod: number, hw: number, m: number) =>
      `滑到視窗 ${i}：減掉離開的 '${outC}'（值 ${outV} × ${top}），整體乘 ${b} 往左推一位，加上進來的 '${inC}'（值 ${inV}）。hash = ((${prev} − ${outV} × ${top}) × ${b} + ${inV}) mod ${mod} = ${hw}。這一步是 O(1)，不用重掃 ${m} 個字元。`,
    end: (count: number, hits: string) =>
      `掃完 ${count} 個視窗。真正命中的位置：${hits}。每個視窗 O(1) 更新，只有雜湊相同時才花 O(m) 確認，平均 O(n + m)。`,
    textTitle: "文字 T（黃色是目前視窗，灰色是剛離開的字元，藍色是剛進來的）",
    patTitle: "模式 P",
    hashWindow: "hash(視窗)",
    hitsLabel: "命中位置",
    noHits: "尚無",
  },
  {
    en: {
      sep: ", ",
      hashP: (p: string, hp: number, b: number, mMinus1: number, mod: number, top: number) =>
        `First hash the pattern "${p}": accumulating one character at a time gives hash(P) = ${hp}. Also precompute B^(m−1) mod M = ${b}^${mMinus1} mod ${mod} = ${top}, the weight of the leading position, which is what removes the character leaving the window later on.`,
      formulaTop: (hp: number, top: number) => `hash(P) = ${hp}, B^(m−1) = ${top}`,
      firstWindow: (m: number, sub: string, hw: number) => `The first window T[0, ${m}) = "${sub}" is hashed from scratch once, which costs O(m): hash = ${hw}.`,
      opWindow: (i: number) => `window ${i}`,
      opEnd: "Done",
      skipTail: (hw: number, hp: number) => ` ${hw} ≠ ${hp}, and different hashes can never mean equal strings, so slide straight on to the next position.`,
      hit: (hw: number, hp: number, i: number, iEnd: number, sub: string, p: string, m: number) =>
        `${hw} = ${hp}, so the hashes agree — but equal hashes do not mean equal strings, so check character by character. Comparing T[${i}, ${iEnd}) = "${sub}" against "${p}", all ${m} characters match, so position ${i} is a genuine hit.`,
      falsePos: (hw: number, hp: number, i: number, iEnd: number, sub: string, j: number, tc: string, pc: string, mod: number) =>
        `${hw} = ${hp}, so the hashes agree. Checking character by character: T[${i}, ${iEnd}) = "${sub}", and character ${j + 1} is '${tc}' ≠ '${pc}'. This is a false positive, a collision: two different strings happen to be equal mod ${mod}. A larger modulus means fewer collisions, and this demo uses a deliberately small ${mod} so you can see one happen.`,
      slide: (i: number, outC: string, outV: number, top: number, b: number, inC: string, inV: number, prev: number, mod: number, hw: number, m: number) =>
        `Slide to window ${i}: subtract the departing '${outC}' (value ${outV} × ${top}), multiply everything by ${b} to shift one place left, then add the arriving '${inC}' (value ${inV}). hash = ((${prev} − ${outV} × ${top}) × ${b} + ${inV}) mod ${mod} = ${hw}. This step is O(1), with no need to rescan ${m} characters.`,
      end: (count: number, hits: string) =>
        `All ${count} windows scanned. The genuine match positions are ${hits}. Every window updates in O(1) and only an equal hash costs O(m) to verify, so the average is O(n + m).`,
      textTitle: "Text T (amber is the current window, grey is the character that just left, blue is the one that just arrived)",
      patTitle: "Pattern P",
      hashWindow: "hash(window)",
      hitsLabel: "Match positions",
      noHits: "none yet",
    },
  },
);

type Dict = (typeof TEXT)["zh-Hant"];

interface Step {
  desc: string;
  op: string;
  i: number;                 // 視窗起點，-1 表示還沒開始
  hw: number | null;         // 視窗雜湊
  out?: number;              // 離開的索引
  inn?: number;              // 進來的索引
  verify?: number;           // 正在逐字元確認到第幾個字元（含）
  result?: "hit" | "false" | "skip";
  formula?: string;
  hits: number[];
}

function buildSteps(t: Dict): Step[] {
  const steps: Step[] = [];
  const n = T.length, m = P.length;
  const hits: number[] = [];
  const snap = (desc: string, op: string, i: number, hw: number | null, extra: Partial<Step> = {}) => steps.push({ desc, op, i, hw, hits: [...hits], ...extra });

  const hp = HP;
  let top = 1;
  for (let j = 0; j < m - 1; j++) top = (top * B) % M;
  snap(t.hashP(P, hp, B, m - 1, M, top), "hash(P)", -1, null, { formula: t.formulaTop(hp, top) });

  let hw = hashOf(T.slice(0, m));
  snap(t.firstWindow(m, T.slice(0, m), hw), t.opWindow(0), 0, hw, { formula: `hash(T[0,${m})) = ${hw}` });

  const check = (i: number) => {
    const hwNow = hw;
    if (hwNow !== hp) {
      steps[steps.length - 1].result = "skip";
      steps[steps.length - 1].desc += t.skipTail(hwNow, hp);
      return;
    }
    let j = 0;
    while (j < m && T[i + j] === P[j]) j++;
    if (j === m) {
      hits.push(i);
      snap(t.hit(hwNow, hp, i, i + m, T.slice(i, i + m), P, m), t.opWindow(i), i, hwNow, { verify: m - 1, result: "hit" });
    } else {
      snap(t.falsePos(hwNow, hp, i, i + m, T.slice(i, i + m), j, T[i + j], P[j], M), t.opWindow(i), i, hwNow, { verify: j, result: "false" });
    }
  };
  check(0);

  for (let i = 1; i + m <= n; i++) {
    const prev = hw;
    const outC = T[i - 1], inC = T[i + m - 1];
    hw = ((((prev - val(outC) * top) % M) + M) % M * B + val(inC)) % M;
    snap(
      t.slide(i, outC, val(outC), top, B, inC, val(inC), prev, M, hw, m),
      t.opWindow(i),
      i,
      hw,
      { out: i - 1, inn: i + m - 1, formula: `hash = ((${prev} − ${val(outC)} × ${top}) × ${B} + ${val(inC)}) mod ${M} = ${hw}` },
    );
    check(i);
  }
  snap(t.end(n - m + 1, hits.join(t.sep)), t.opEnd, n, null);
  return steps;
}

export function RabinKarpDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const steps = useMemo(() => buildSteps(TEXT[locale]), [locale]);
  const [k, setK] = useState(0);
  const s = steps[k];
  const m = P.length;
  const inWin = (j: number) => s.i >= 0 && s.i < T.length && j >= s.i && j < s.i + m;

  const textTone = (j: number) => {
    if (s.i >= T.length) return s.hits.some((h) => j >= h && j < h + m) ? CELL.green : CELL.dim;
    if (j === s.out) return CELL.dim;
    if (inWin(j)) {
      if (s.result === "hit") return CELL.green;
      if (s.result === "false") return j - s.i < (s.verify ?? -1) ? CELL.green : j - s.i === s.verify ? CELL.accent : CELL.amber;
      if (j === s.inn) return CELL.accent;
      return CELL.amber;
    }
    return "";
  };
  const patTone = (j: number) => (s.result === "hit" ? CELL.green : s.result === "false" ? (j < (s.verify ?? -1) ? CELL.green : j === s.verify ? CELL.accent : "") : "");

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={`T = "${T}" · P = "${P}" · B = ${B} · M = ${M}`} />
      <div className="grid grid-cols-1 gap-3.5 p-3.5">
        <div>
          <div className="eyebrow mb-1.5">{t.textTitle}</div>
          <Cells items={T.split("")} tone={textTone} />
        </div>
        <div className="flex flex-wrap items-start gap-6">
          <div>
            <div className="eyebrow mb-1.5">{t.patTitle}</div>
            <Cells items={P.split("")} tone={patTone} />
          </div>
          <div className="grid grid-cols-[auto_auto] gap-x-4 gap-y-1 font-mono text-[13px] tabular-nums">
            <span className="text-ink-3">hash(P)</span><span className="text-ink">{HP}</span>
            <span className="text-ink-3">{t.hashWindow}</span>
            <span className={s.hw === null ? "text-ink-3" : s.result === "hit" ? "text-green" : s.result === "false" ? "text-accent" : "text-ink"}>{s.hw === null ? "·" : s.hw}</span>
            <span className="text-ink-3">{t.hitsLabel}</span><span className="text-green">{s.hits.length ? s.hits.join(t.sep) : t.noHits}</span>
          </div>
        </div>
        {s.formula && s.i >= 0 && (
          <div className="rounded-md border border-line bg-surface-2 px-3 py-2 font-mono text-[12.5px] text-ink">{s.formula}</div>
        )}
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
