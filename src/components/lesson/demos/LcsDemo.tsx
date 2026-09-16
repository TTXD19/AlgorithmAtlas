"use client";

import { Fragment, useMemo, useState } from "react";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

/** 把 A 改成 B。P、Y、T 三個字在兩邊的順序顛倒，LCS 不只一種。 */
const A = "PYTHON";
const B = "TYPHOON";
const M = A.length;
const N = B.length;

const TEXT = demoText(
  {
    defineState: (a: string, m: number, b: string, n: number) =>
      `dp[i][j] 是「A 的前 i 個字」和「B 的前 j 個字」的 LCS 長度。A = "${a}" 有 ${m} 個字、B = "${b}" 有 ${n} 個字，表格是 ${m + 1} 列 × ${n + 1} 行，答案在右下角 dp[${m}][${n}]。`,
    labelDefine: "定義狀態",
    labelBase: "base case",
    labelBacktrack: "回溯",
    labelDone: "完成",
    baseCase: "base case：空字串（ε）和任何字串都沒有共同的字，第 0 列與第 0 行全是 0。接著逐列由左到右填，每格要讀的上方、左方、左上方一定已經算好。",
    equal: (i: number, j: number, a: string, b: string, diag: number, dup: string) =>
      `(${i}, ${j})：'${a}' 和 '${b}' 相同，這個字可以接在「兩邊都去掉它」的 LCS 後面。讀左上 dp[${i - 1}][${j - 1}] = ${diag}，加一得 ${diag + 1}。${dup}`,
    dup: (prev: number, b: string, a: string, alt: number, cur: number, tie: boolean) =>
      ` B 的第 ${prev} 個字也是 '${b}'，A 的 '${a}' 配那一個時得到 ${alt}，配這一個得到 ${cur}${tie ? "，一樣長，這也是 LCS 不唯一的來源" : ""}。`,
    equalFormula: (a: string, b: string, i: number, j: number, v: number) =>
      `'${a}' = '${b}' → dp[${i - 1}][${j - 1}] + 1 = ${v}`,
    diffShort: (i: number, j: number, a: string, b: string, up: number, left: number, best: number, cmp: string) =>
      `(${i}, ${j})：'${a}' ≠ '${b}'。捨棄 '${a}' 看上方 ${up}、捨棄 '${b}' 看左方 ${left}，取大的 ${best}；${cmp}。`,
    diffLong: (i: number, j: number, a: string, b: string, up: number, left: number, best: number, tie: boolean) =>
      `(${i}, ${j})：'${a}' ≠ '${b}'，兩個不同的字不可能同時當 LCS 的最後一個字，至少要捨棄一個。捨棄 A 的 '${a}' 就是上方 dp[${i - 1}][${j}] = ${up}，捨棄 B 的 '${b}' 就是左方 dp[${i}][${j - 1}] = ${left}，取大的 ${best}。${tie ? "平手時箭頭固定記 ←，回溯時就優先往左。" : ""}`,
    cmpTie: (best: number) => `兩邊都是 ${best}，平手記 ←`,
    cmpUp: "上方比較大，記 ↑",
    cmpLeft: "左方比較大，記 ←",
    diffFormula: (a: string, b: string, up: number, left: number, best: number) =>
      `'${a}' ≠ '${b}' → max(${up}, ${left}) = ${best}`,
    tableDone: (m: number, n: number, len: number) =>
      `表填完了，dp[${m}][${n}] = ${len} 就是 LCS 長度。表只給長度，要知道是哪些字、diff 長什麼樣子，得從右下角沿著箭頭往回走：↖ 是保留、↑ 是刪除 A 的字、← 是插入 B 的字。`,
    lengthFormula: (len: number) => `LCS 長度 = ${len}`,
    rowZero: (j: number, ch: string) => `(0, ${j}) 在第 0 列：A 已經用完，B 剩下的 '${ch}' 只能插入。往左走。`,
    colZero: (i: number, ch: string) => `(${i}, 0) 在第 0 行：B 已經用完，A 剩下的 '${ch}' 只能刪除。往上走。`,
    keep: (i: number, j: number, ca: string, cb: string, ni: number, nj: number) =>
      `(${i}, ${j})：'${ca}' = '${cb}'，這格是左上加一來的，'${ca}' 屬於 LCS，diff 記「保留」。往左上走到 (${ni}, ${nj})。`,
    keepFormula: (ch: string) => `↖ 保留 '${ch}'`,
    goLeft: (i: number, j: number, ca: string, cb: string, up: number, left: number, tie: boolean) =>
      `(${i}, ${j})：'${ca}' ≠ '${cb}'，左方 ${left} ${tie ? "和上方一樣大，平手優先往左" : `比上方 ${up} 大`}。往左代表 B 的 '${cb}' 不在這條 LCS 裡，diff 記「插入 '${cb}'」。`,
    goUp: (i: number, j: number, ca: string, cb: string, up: number, left: number) =>
      `(${i}, ${j})：'${ca}' ≠ '${cb}'，上方 ${up} 比左方 ${left} 大，只能往上。往上代表 A 的 '${ca}' 不在這條 LCS 裡，diff 記「刪除 '${ca}'」。`,
    final: (lcs: string, len: number, m: number, n: number, del: number, ins: number, others: string) =>
      `回到 (0, 0)。LCS = ${lcs}，長度 ${len}。diff 保留 ${len} 個字、刪除 ${m} − ${len} = ${del} 個、插入 ${n} − ${len} = ${ins} 個：P、Y、T 在兩邊順序顛倒，只能留一個，其餘變成「刪掉再插入」，git diff 遇到搬移過的程式碼也是這樣顯示。平手改走別的方向會得到 ${others}，長度一樣是 ${len}。填 ${m}×${n} 格各 O(1)、回溯最多 ${m + n} 步，總共 O(mn)。`,
    finalFormula: (lcs: string, edits: number) => `LCS = "${lcs}"，增刪 ${edits} 次`,
    sep: "、",
    tableTitle: "dp 表（列是 A，行是 B）",
    arrowDiag: "↖ 相等，左上加一",
    arrowUp: "↑ 上方較大",
    arrowLeft: "← 左方較大或平手",
    transition: "轉移式",
    thisStep: "這一步",
    legendCurrent: "正在處理",
    legendRead: "讀取／比較的格子",
    legendPath: "回溯路徑",
    legendKept: "LCS 的字",
    backtrackEmpty: "回溯時出現",
    diffTitle: "diff：A → B",
    diffLegend: "綠色保留（LCS）、黃色 − 是從 A 刪除、藍色 + 是從 B 插入",
  },
  {
    en: {
      defineState: (a: string, m: number, b: string, n: number) =>
        `dp[i][j] is the LCS length of the first i characters of A and the first j characters of B. A = "${a}" has ${m} characters and B = "${b}" has ${n}, so the table is ${m + 1} rows × ${n + 1} columns and the answer sits in the bottom-right corner, dp[${m}][${n}].`,
      labelDefine: "define the state",
      labelBase: "base case",
      labelBacktrack: "backtrack",
      labelDone: "done",
      baseCase: "Base case: the empty string (ε) shares no characters with anything, so row 0 and column 0 are all zeros. From there we fill row by row, left to right, which guarantees that the cells above, to the left and diagonally up-left are already computed whenever a cell needs them.",
      equal: (i: number, j: number, a: string, b: string, diag: number, dup: string) =>
        `(${i}, ${j}): '${a}' and '${b}' are the same, so this character can be appended to the LCS of the two strings with it removed. Read the diagonal cell dp[${i - 1}][${j - 1}] = ${diag} and add one to get ${diag + 1}.${dup}`,
      dup: (prev: number, b: string, a: string, alt: number, cur: number, tie: boolean) =>
        ` Character ${prev} of B is also '${b}': pairing A's '${a}' with that one gives ${alt}, pairing it with this one gives ${cur}${tie ? ", the same length, which is exactly where more than one LCS comes from" : ""}.`,
      equalFormula: (a: string, b: string, i: number, j: number, v: number) =>
        `'${a}' = '${b}' → dp[${i - 1}][${j - 1}] + 1 = ${v}`,
      diffShort: (i: number, j: number, a: string, b: string, up: number, left: number, best: number, cmp: string) =>
        `(${i}, ${j}): '${a}' ≠ '${b}'. Dropping '${a}' means the cell above, ${up}; dropping '${b}' means the cell to the left, ${left}. Take the larger, ${best}; ${cmp}.`,
      diffLong: (i: number, j: number, a: string, b: string, up: number, left: number, best: number, tie: boolean) =>
        `(${i}, ${j}): '${a}' ≠ '${b}'. Two different characters cannot both be the last character of the LCS, so at least one has to go. Dropping A's '${a}' leaves the cell above, dp[${i - 1}][${j}] = ${up}; dropping B's '${b}' leaves the cell to the left, dp[${i}][${j - 1}] = ${left}. Take the larger, ${best}.${tie ? " On a tie the arrow always records ←, so the backtrack prefers going left." : ""}`,
      cmpTie: (best: number) => `both sides are ${best}, a tie, so record ←`,
      cmpUp: "the cell above is larger, so record ↑",
      cmpLeft: "the cell to the left is larger, so record ←",
      diffFormula: (a: string, b: string, up: number, left: number, best: number) =>
        `'${a}' ≠ '${b}' → max(${up}, ${left}) = ${best}`,
      tableDone: (m: number, n: number, len: number) =>
        `The table is full, and dp[${m}][${n}] = ${len} is the LCS length. The table only gives the length; to see which characters those are, and what the diff looks like, walk back from the bottom-right corner along the arrows: ↖ keeps a character, ↑ deletes one from A, ← inserts one from B.`,
      lengthFormula: (len: number) => `LCS length = ${len}`,
      rowZero: (j: number, ch: string) => `(0, ${j}) is in row 0: A is used up, so B's remaining '${ch}' can only be inserted. Move left.`,
      colZero: (i: number, ch: string) => `(${i}, 0) is in column 0: B is used up, so A's remaining '${ch}' can only be deleted. Move up.`,
      keep: (i: number, j: number, ca: string, cb: string, ni: number, nj: number) =>
        `(${i}, ${j}): '${ca}' = '${cb}'. This cell came from the diagonal plus one, so '${ca}' belongs to the LCS and the diff keeps it. Move diagonally to (${ni}, ${nj}).`,
      keepFormula: (ch: string) => `↖ keep '${ch}'`,
      goLeft: (i: number, j: number, ca: string, cb: string, up: number, left: number, tie: boolean) =>
        `(${i}, ${j}): '${ca}' ≠ '${cb}', and the cell to the left, ${left}, ${tie ? "matches the one above, so the tie goes left" : `beats the ${up} above`}. Going left means B's '${cb}' is not part of this LCS, so the diff records an insertion of '${cb}'.`,
      goUp: (i: number, j: number, ca: string, cb: string, up: number, left: number) =>
        `(${i}, ${j}): '${ca}' ≠ '${cb}', and the cell above, ${up}, beats the ${left} to the left, so up is the only way. Going up means A's '${ca}' is not part of this LCS, so the diff records a deletion of '${ca}'.`,
      final: (lcs: string, len: number, m: number, n: number, del: number, ins: number, others: string) =>
        `Back at (0, 0). The LCS is ${lcs}, of length ${len}. The diff keeps ${len} characters, deletes ${m} − ${len} = ${del} and inserts ${n} − ${len} = ${ins}: P, Y and T appear in opposite orders in the two strings, so only one of them can survive and the rest become a delete followed by an insert — exactly how git diff renders code that has been moved. Taking the other branch at each tie would give ${others}, which is the same length, ${len}. Filling ${m}×${n} cells at O(1) each plus a backtrack of at most ${m + n} steps makes the whole thing O(mn).`,
      finalFormula: (lcs: string, edits: number) => `LCS = "${lcs}", ${edits} edits`,
      sep: ", ",
      tableTitle: "dp table (rows are A, columns are B)",
      arrowDiag: "↖ equal, diagonal + 1",
      arrowUp: "↑ the cell above is larger",
      arrowLeft: "← the cell to the left is larger, or a tie",
      transition: "Transition",
      thisStep: "This step",
      legendCurrent: "current cell",
      legendRead: "cells read or compared",
      legendPath: "backtrack path",
      legendKept: "characters of the LCS",
      backtrackEmpty: "appears during the backtrack",
      diffTitle: "diff: A → B",
      diffLegend: "Green is kept (the LCS), amber − is deleted from A, blue + is inserted from B",
    },
  },
);

type Txt = (typeof TEXT)["zh-Hant"];

type Pos = [number, number];
type Arrow = "diag" | "up" | "left";
const ARROW: Record<Arrow, string> = { diag: "↖", up: "↑", left: "←" };
type OpKind = "keep" | "del" | "ins";
interface Op { kind: OpKind; ch: string }

interface Step {
  desc: string;
  label: string;
  formula: string;
  dp: (number | null)[][];
  arrow: (Arrow | null)[][];
  cur: Pos | null;
  reads: Pos[];
  path: Pos[];
  kept: Pos[];
  ops: Op[];
}

/** 列出所有不同的 LCS 字串（只用在最後一步的說明）。 */
function allLcs(dp: number[][]): string[] {
  const memo = new Map<string, string[]>();
  const go = (i: number, j: number): string[] => {
    const key = `${i},${j}`;
    const hit = memo.get(key);
    if (hit) return hit;
    let res: string[];
    if (i === 0 || j === 0) res = [""];
    else if (A[i - 1] === B[j - 1]) res = go(i - 1, j - 1).map((s) => s + A[i - 1]);
    else {
      const set = new Set<string>();
      if (dp[i - 1][j] === dp[i][j]) go(i - 1, j).forEach((s) => set.add(s));
      if (dp[i][j - 1] === dp[i][j]) go(i, j - 1).forEach((s) => set.add(s));
      res = [...set];
    }
    memo.set(key, res);
    return res;
  };
  return go(M, N);
}

function buildSteps(t: Txt): Step[] {
  const steps: Step[] = [];
  const dp: (number | null)[][] = Array.from({ length: M + 1 }, () => Array<number | null>(N + 1).fill(null));
  const arrow: (Arrow | null)[][] = Array.from({ length: M + 1 }, () => Array<Arrow | null>(N + 1).fill(null));
  const path: Pos[] = [];
  const kept: Pos[] = [];
  const ops: Op[] = [];
  const val = (i: number, j: number) => dp[i][j] ?? 0;
  const snap = (desc: string, label: string, formula: string, cur: Pos | null = null, reads: Pos[] = []) =>
    steps.push({ desc, label, formula, dp: dp.map((r) => [...r]), arrow: arrow.map((r) => [...r]), cur, reads, path: [...path], kept: [...kept], ops: [...ops] });

  snap(t.defineState(A, M, B, N), t.labelDefine, "dp[i][j] = LCS(A[:i], B[:j])");
  for (let i = 0; i <= M; i++) dp[i][0] = 0;
  for (let j = 0; j <= N; j++) dp[0][j] = 0;
  snap(t.baseCase, t.labelBase, "dp[0][j] = dp[i][0] = 0");

  let explained = false;
  for (let i = 1; i <= M; i++) {
    for (let j = 1; j <= N; j++) {
      const a = A[i - 1];
      const b = B[j - 1];
      const label = `dp[${i}][${j}]`;
      if (a === b) {
        const diag = val(i - 1, j - 1);
        dp[i][j] = diag + 1;
        arrow[i][j] = "diag";
        const prev = j >= 2 ? B.lastIndexOf(b, j - 2) : -1;
        const dup = prev >= 0
          ? t.dup(prev + 1, b, a, val(i - 1, prev) + 1, diag + 1, val(i - 1, prev) + 1 === diag + 1)
          : "";
        snap(t.equal(i, j, a, b, diag, dup), label, t.equalFormula(a, b, i, j, diag + 1), [i, j], [[i - 1, j - 1]]);
      } else {
        const up = val(i - 1, j);
        const left = val(i, j - 1);
        const best = Math.max(up, left);
        dp[i][j] = best;
        arrow[i][j] = left >= up ? "left" : "up";
        const cmp = up === left ? t.cmpTie(best) : up > left ? t.cmpUp : t.cmpLeft;
        const desc = explained
          ? t.diffShort(i, j, a, b, up, left, best, cmp)
          : t.diffLong(i, j, a, b, up, left, best, up === left);
        explained = true;
        snap(desc, label, t.diffFormula(a, b, up, left, best), [i, j], [[i - 1, j], [i, j - 1]]);
      }
    }
  }

  const L = val(M, N);
  path.push([M, N]);
  snap(t.tableDone(M, N, L), t.labelBacktrack, t.lengthFormula(L));

  let i = M;
  let j = N;
  while (i > 0 || j > 0) {
    let ni = i;
    let nj = j;
    let desc: string;
    let formula: string;
    let reads: Pos[];
    if (i === 0) {
      nj = j - 1;
      ops.unshift({ kind: "ins", ch: B[j - 1] });
      desc = t.rowZero(j, B[j - 1]);
      formula = `+ '${B[j - 1]}'`;
      reads = [[ni, nj]];
    } else if (j === 0) {
      ni = i - 1;
      ops.unshift({ kind: "del", ch: A[i - 1] });
      desc = t.colZero(i, A[i - 1]);
      formula = `− '${A[i - 1]}'`;
      reads = [[ni, nj]];
    } else if (A[i - 1] === B[j - 1]) {
      ni = i - 1;
      nj = j - 1;
      kept.push([i, j]);
      ops.unshift({ kind: "keep", ch: A[i - 1] });
      desc = t.keep(i, j, A[i - 1], B[j - 1], ni, nj);
      formula = t.keepFormula(A[i - 1]);
      reads = [[ni, nj]];
    } else {
      const up = val(i - 1, j);
      const left = val(i, j - 1);
      reads = [[i - 1, j], [i, j - 1]];
      if (left >= up) {
        nj = j - 1;
        ops.unshift({ kind: "ins", ch: B[j - 1] });
        desc = t.goLeft(i, j, A[i - 1], B[j - 1], up, left, left === up);
        formula = `← + '${B[j - 1]}'`;
      } else {
        ni = i - 1;
        ops.unshift({ kind: "del", ch: A[i - 1] });
        desc = t.goUp(i, j, A[i - 1], B[j - 1], up, left);
        formula = `↑ − '${A[i - 1]}'`;
      }
    }
    snap(desc, t.labelBacktrack, formula, [i, j], reads);
    path.push([ni, nj]);
    i = ni;
    j = nj;
  }

  const lcs = ops.filter((o) => o.kind === "keep").map((o) => o.ch).join("");
  const del = ops.filter((o) => o.kind === "del").length;
  const ins = ops.filter((o) => o.kind === "ins").length;
  const others = allLcs(dp.map((r) => r.map((v) => v ?? 0))).filter((s) => s !== lcs);
  snap(
    t.final(lcs, L, M, N, del, ins, others.join(t.sep)),
    t.labelDone,
    t.finalFormula(lcs, del + ins),
  );
  return steps;
}

const OP_TONE: Record<OpKind, string> = {
  keep: CELL.green,
  del: "border-amber bg-amber-soft text-amber",
  ins: "border-accent bg-accent-soft text-accent",
};
const OP_SIGN: Record<OpKind, string> = { keep: "", del: "−", ins: "+" };

export function LcsDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const steps = useMemo(() => buildSteps(TEXT[locale]), [locale]);
  const [k, setK] = useState(0);
  const s = steps[Math.min(k, steps.length - 1)];
  const key = (p: Pos) => `${p[0]}-${p[1]}`;
  const readSet = new Set(s.reads.map(key));
  const pathSet = new Set(s.path.map(key));
  const keptSet = new Set(s.kept.map(key));
  const curKey = s.cur ? key(s.cur) : "";
  const lcsSoFar = s.ops.filter((o) => o.kind === "keep").map((o) => o.ch);

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={Math.min(k, steps.length - 1)} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.label}</span>} right={`"${A}" → "${B}"`} />

      <div className="grid grid-cols-1 gap-4 p-3.5 md:grid-cols-[auto_minmax(0,1fr)] md:items-start">
        <div className="overflow-x-auto">
          <div className="eyebrow mb-2">{t.tableTitle}</div>
          <div className="grid w-max gap-1" style={{ gridTemplateColumns: `24px repeat(${N + 1}, 30px)` }}>
            <div />
            {["ε", ...B.split("")].map((ch, j) => (
              <div key={`h${j}`} className={`flex h-8 flex-col items-center justify-end font-mono leading-none ${s.cur && s.cur[1] === j ? "text-accent" : "text-ink-2"}`}>
                <span className="text-[9.5px] text-ink-3">{j}</span>
                <span className="mt-0.5 text-[13px] font-semibold">{ch}</span>
              </div>
            ))}
            {s.dp.map((row, i) => (
              <Fragment key={`r${i}`}>
                <div className={`flex h-9 items-center justify-end gap-0.5 pr-0.5 font-mono leading-none ${s.cur && s.cur[0] === i ? "text-accent" : "text-ink-2"}`}>
                  <span className="text-[9.5px] text-ink-3">{i}</span>
                  <span className="text-[13px] font-semibold">{i === 0 ? "ε" : A[i - 1]}</span>
                </div>
                {row.map((v, j) => {
                  const id = `${i}-${j}`;
                  const tone = id === curKey
                    ? CELL.accent
                    : readSet.has(id) ? CELL.amber
                    : keptSet.has(id) ? CELL.green
                    : pathSet.has(id) ? "border-green bg-surface text-green"
                    : v !== null ? "border-line-strong bg-surface text-ink" : "border-dashed border-line text-ink-3";
                  const ar = s.arrow[i][j];
                  return (
                    <div key={id} className={`relative grid h-9 place-items-center rounded-md border font-mono text-[13px] font-medium tabular-nums ${tone}`}>
                      {v ?? ""}
                      {ar && <span className="absolute top-px left-0.5 text-[8.5px] leading-none opacity-70">{ARROW[ar]}</span>}
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-ink-3">
            <span>{t.arrowDiag}</span><span>{t.arrowUp}</span><span>{t.arrowLeft}</span>
          </div>
        </div>

        <div className="text-[13px] text-ink-2">
          <div className="eyebrow mb-1.5">{t.transition}</div>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-[12px]">
            <span className="text-ink-3">A[i−1] = B[j−1]</span><span>dp[i−1][j−1] + 1</span>
            <span className="text-ink-3">A[i−1] ≠ B[j−1]</span><span>max(dp[i−1][j], dp[i][j−1])</span>
          </div>
          <div className="eyebrow mt-3 mb-1.5">{t.thisStep}</div>
          <div className="rounded-lg border border-line bg-surface-2 px-3 py-2 font-mono text-[12.5px] break-words tabular-nums">{s.formula}</div>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-ink-3">
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm border border-accent bg-accent align-middle" />{t.legendCurrent}</span>
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm border border-amber bg-amber-soft align-middle" />{t.legendRead}</span>
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm border border-green bg-surface align-middle" />{t.legendPath}</span>
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm border border-green bg-green-soft align-middle" />{t.legendKept}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 border-t border-line p-3.5 md:grid-cols-[auto_minmax(0,1fr)]">
        <div>
          <div className="eyebrow mb-2">LCS</div>
          <Cells items={lcsSoFar} tone={() => CELL.green} empty={t.backtrackEmpty} />
        </div>
        <div>
          <div className="eyebrow mb-2">{t.diffTitle}</div>
          <div className="flex flex-wrap gap-1">
            {s.ops.map((o, idx) => (
              <span key={`${idx}-${o.kind}-${o.ch}`} className={`grid h-8 w-9 place-items-center rounded-md border font-mono text-[13px] ${OP_TONE[o.kind]}`}>
                <span>
                  {OP_SIGN[o.kind] && <span className="mr-px text-[11px]">{OP_SIGN[o.kind]}</span>}
                  <span className={o.kind === "del" ? "line-through" : ""}>{o.ch}</span>
                </span>
              </span>
            ))}
            {s.ops.length === 0 && <span className="rounded-md border border-dashed border-line-strong px-2 text-[12px] leading-8 text-ink-3">{t.backtrackEmpty}</span>}
          </div>
          <div className="mt-1.5 text-[12px] text-ink-3">{t.diffLegend}</div>
        </div>
      </div>

      <StepFooter k={Math.min(k, steps.length - 1)} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
