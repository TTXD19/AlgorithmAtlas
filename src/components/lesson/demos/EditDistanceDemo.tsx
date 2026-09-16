"use client";

import { useMemo, useState } from "react";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { StepHeader, StepFooter } from "./StepBar";

/** 把 A 變成 B 的最少操作數。 */
const A = "horse";
const B = "ros";
const M = A.length;
const N = B.length;

type Src = "match" | "replace" | "delete" | "insert" | "base";
const ARROW: Record<Src, string> = { match: "↖", replace: "↖", delete: "↑", insert: "←", base: "" };

const TEXT = demoText(
  {
    sep: "、",
    opInit: "初始化",
    opBacktrack: "回溯",
    opDone: "完成",
    srcMatch: "相同",
    srcReplace: "取代",
    srcDelete: "刪除",
    srcInsert: "插入",
    init: (a: string, b: string, rows: number, cols: number) =>
      `dp[i][j] 是「把 "${a}" 的前 i 個字變成 "${b}" 的前 j 個字」最少要幾步。表有 ${rows} 列 ${cols} 行，先填邊界。`,
    row0: (b: string) => `第 0 列：空字串要變成 "${b}" 的前 j 個字，只能插入 j 次，所以 dp[0][j] = j。`,
    col0: (a: string) => `第 0 行："${a}" 的前 i 個字要變成空字串，只能刪除 i 次，所以 dp[i][0] = i。`,
    same: (i: number, j: number, a: string, b: string, v: number) =>
      `(${i}, ${j})：'${a}' 和 '${b}' 相同，這兩個字不用動，直接抄左上角 dp[${i - 1}][${j - 1}] = ${v}。`,
    diff: (i: number, j: number, a: string, b: string, rep: number, del: number, ins: number, best: number, label: string) =>
      `(${i}, ${j})：'${a}' ≠ '${b}'。取代看左上 ${rep}、刪除看上方 ${del}、插入看左方 ${ins}，取最小 ${best} 再加 1 = ${best + 1}，來源記為「${label}」。`,
    filled: (m: number, n: number, v: number) =>
      `表填完，答案 dp[${m}][${n}] = ${v}。從右下角出發，沿每格記下的來源往回走，就能還原實際的操作序列。`,
    actInsert: (c: string) => `插入 '${c}'`,
    actDelete: (c: string) => `刪除 '${c}'`,
    actKeep: (c: string) => `保留 '${c}'`,
    actReplace: (a: string, b: string) => `取代 '${a}' → '${b}'`,
    keepWord: "保留",
    fromLine: (i: number, j: number, ni: number, nj: number, text: string) =>
      `(${i}, ${j}) 的來源是 (${ni}, ${nj})：${text}。`,
    finish: (list: string, count: number, m: number, n: number) =>
      `回到 (0, 0)。由前往後讀：${list}，共 ${count} 步，正好等於 dp[${m}][${n}]。`,
    legendDiag: "↖ 相同或取代",
    legendUp: "↑ 刪除",
    legendLeft: "← 插入",
    legendCur: "正在處理",
    legendFrom: "選用的來源格",
    legendPath: "回溯路徑",
    stateTitle: "狀態定義",
    stateFormula: "dp[i][j] = A[:i] → B[:j] 的最少步數",
    transTitle: "轉移",
    opsTitle: "操作序列",
    opsEmpty: "回溯時才會出現",
  },
  {
    en: {
      sep: ", ",
      opInit: "Set up",
      opBacktrack: "Trace back",
      opDone: "Done",
      srcMatch: "match",
      srcReplace: "replace",
      srcDelete: "delete",
      srcInsert: "insert",
      init: (a: string, b: string, rows: number, cols: number) =>
        `dp[i][j] is the fewest steps needed to turn the first i characters of "${a}" into the first j characters of "${b}". The table has ${rows} rows and ${cols} columns; fill in the borders first.`,
      row0: (b: string) => `Row 0: the empty string can only become the first j characters of "${b}" through j insertions, so dp[0][j] = j.`,
      col0: (a: string) => `Column 0: the first i characters of "${a}" can only become the empty string through i deletions, so dp[i][0] = i.`,
      same: (i: number, j: number, a: string, b: string, v: number) =>
        `(${i}, ${j}): '${a}' and '${b}' are the same, so neither character needs touching — copy the diagonal cell dp[${i - 1}][${j - 1}] = ${v}.`,
      diff: (i: number, j: number, a: string, b: string, rep: number, del: number, ins: number, best: number, label: string) =>
        `(${i}, ${j}): '${a}' ≠ '${b}'. Replacing reads the diagonal cell ${rep}, deleting reads the cell above ${del}, and inserting reads the cell to the left ${ins}. Take the smallest, ${best}, and add 1 to get ${best + 1}; the source is recorded as "${label}".`,
      filled: (m: number, n: number, v: number) =>
        `The table is full and the answer is dp[${m}][${n}] = ${v}. Start at the bottom-right corner and follow the source recorded in each cell to recover the actual sequence of operations.`,
      actInsert: (c: string) => `Insert '${c}'`,
      actDelete: (c: string) => `Delete '${c}'`,
      actKeep: (c: string) => `Keep '${c}'`,
      actReplace: (a: string, b: string) => `Replace '${a}' → '${b}'`,
      keepWord: "Keep",
      fromLine: (i: number, j: number, ni: number, nj: number, text: string) =>
        `The source of (${i}, ${j}) is (${ni}, ${nj}): ${text}.`,
      finish: (list: string, count: number, m: number, n: number) =>
        `Back at (0, 0). Read front to back: ${list} — ${count} steps in total, exactly the value of dp[${m}][${n}].`,
      legendDiag: "↖ match or replace",
      legendUp: "↑ delete",
      legendLeft: "← insert",
      legendCur: "Current cell",
      legendFrom: "Chosen source cell",
      legendPath: "Trace-back path",
      stateTitle: "State",
      stateFormula: "dp[i][j] = fewest steps from A[:i] to B[:j]",
      transTitle: "Transitions",
      opsTitle: "Operations",
      opsEmpty: "Appears once the trace back begins",
    },
  },
);

type Dict = (typeof TEXT)["zh-Hant"];

type Pos = [number, number];
interface Step {
  desc: string;
  op: string;
  dp: (number | null)[][];
  src: (Src | null)[][];
  cur: Pos | null;
  from: Pos[];
  path: Pos[];
  ops: string[];
}

function buildSteps(t: Dict): Step[] {
  const LABEL: Record<Src, string> = { match: t.srcMatch, replace: t.srcReplace, delete: t.srcDelete, insert: t.srcInsert, base: "" };
  const steps: Step[] = [];
  const dp: (number | null)[][] = Array.from({ length: M + 1 }, () => Array<number | null>(N + 1).fill(null));
  const src: (Src | null)[][] = Array.from({ length: M + 1 }, () => Array<Src | null>(N + 1).fill(null));
  const ops: string[] = [];
  const path: Pos[] = [];
  const snap = (desc: string, op: string, cur: Pos | null = null, from: Pos[] = []) =>
    steps.push({ desc, op, dp: dp.map((r) => [...r]), src: src.map((r) => [...r]), cur, from, path: [...path], ops: [...ops] });

  snap(t.init(A, B, M + 1, N + 1), t.opInit);
  for (let j = 0; j <= N; j++) { dp[0][j] = j; src[0][j] = "base"; }
  snap(t.row0(B), t.opInit, null, Array.from({ length: N + 1 }, (_, j) => [0, j] as Pos));
  for (let i = 1; i <= M; i++) { dp[i][0] = i; src[i][0] = "base"; }
  snap(t.col0(A), t.opInit, null, Array.from({ length: M }, (_, i) => [i + 1, 0] as Pos));

  for (let i = 1; i <= M; i++) {
    for (let j = 1; j <= N; j++) {
      const a = A[i - 1];
      const b = B[j - 1];
      const label = `dp[${i}][${j}]`;
      if (a === b) {
        const v = dp[i - 1][j - 1] ?? 0;
        dp[i][j] = v;
        src[i][j] = "match";
        snap(t.same(i, j, a, b, v), label, [i, j], [[i - 1, j - 1]]);
      } else {
        const rep = dp[i - 1][j - 1] ?? 0;
        const del = dp[i - 1][j] ?? 0;
        const ins = dp[i][j - 1] ?? 0;
        const best = Math.min(rep, del, ins);
        const s: Src = rep === best ? "replace" : del === best ? "delete" : "insert";
        const fromCell: Pos = s === "replace" ? [i - 1, j - 1] : s === "delete" ? [i - 1, j] : [i, j - 1];
        dp[i][j] = best + 1;
        src[i][j] = s;
        snap(t.diff(i, j, a, b, rep, del, ins, best, LABEL[s]), label, [i, j], [fromCell]);
      }
    }
  }

  let i = M;
  let j = N;
  path.push([M, N]);
  snap(t.filled(M, N, dp[M][N] as number), t.opBacktrack, [M, N]);
  while (i > 0 || j > 0) {
    const s = src[i][j] ?? "base";
    let ni = i;
    let nj = j;
    let text = "";
    if (i === 0) { nj = j - 1; text = t.actInsert(B[j - 1]); }
    else if (j === 0) { ni = i - 1; text = t.actDelete(A[i - 1]); }
    else if (s === "match") { ni = i - 1; nj = j - 1; text = t.actKeep(A[i - 1]); }
    else if (s === "replace") { ni = i - 1; nj = j - 1; text = t.actReplace(A[i - 1], B[j - 1]); }
    else if (s === "delete") { ni = i - 1; text = t.actDelete(A[i - 1]); }
    else { nj = j - 1; text = t.actInsert(B[j - 1]); }
    ops.unshift(text);
    path.push([ni, nj]);
    snap(t.fromLine(i, j, ni, nj, text), t.opBacktrack, [ni, nj]);
    i = ni;
    j = nj;
  }
  const real = ops.filter((o) => !o.startsWith(t.keepWord));
  snap(t.finish(real.join(t.sep), real.length, M, N), t.opDone);
  return steps;
}

export function EditDistanceDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const steps = useMemo(() => buildSteps(TEXT[locale]), [locale]);
  const [k, setK] = useState(0);
  const s = steps[k];
  const key = (p: Pos) => `${p[0]}-${p[1]}`;
  const fromSet = new Set(s.from.map(key));
  const pathSet = new Set(s.path.map(key));
  const curKey = s.cur ? key(s.cur) : "";

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={`"${A}" → "${B}"`} />
      <div className="grid grid-cols-1 gap-4 p-3.5 md:grid-cols-[auto_minmax(0,1fr)] md:items-start">
        <div className="overflow-x-auto">
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${N + 2}, 46px)` }}>
            <div />
            {["ε", ...B.split("")].map((ch, j) => (
              <div key={`h${j}`} className="grid h-8 place-items-center font-mono text-[13px] font-semibold text-ink-2">{ch}</div>
            ))}
            {s.dp.map((row, i) => (
              <RowView key={i} i={i} row={row} src={s.src[i]} curKey={curKey} fromSet={fromSet} pathSet={pathSet} />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-ink-3">
            <span>{t.legendDiag}</span><span>{t.legendUp}</span><span>{t.legendLeft}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-ink-3">
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm border border-accent bg-accent align-middle" />{t.legendCur}</span>
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm border border-amber bg-amber-soft align-middle" />{t.legendFrom}</span>
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm border border-green bg-green-soft align-middle" />{t.legendPath}</span>
          </div>
        </div>
        <div className="text-[13px] text-ink-2">
          <div className="eyebrow mb-1.5">{t.stateTitle}</div>
          <p className="m-0 font-mono text-[12.5px]">{t.stateFormula}</p>
          <div className="eyebrow mt-3 mb-1.5">{t.transTitle}</div>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-[12px]">
            <span className="text-ink-3">{t.srcMatch}</span><span>dp[i-1][j-1]</span>
            <span className="text-ink-3">{t.srcReplace}</span><span>dp[i-1][j-1] + 1</span>
            <span className="text-ink-3">{t.srcDelete}</span><span>dp[i-1][j] + 1</span>
            <span className="text-ink-3">{t.srcInsert}</span><span>dp[i][j-1] + 1</span>
          </div>
          <div className="eyebrow mt-3 mb-1.5">{t.opsTitle}</div>
          {s.ops.length ? (
            <ol className="m-0 list-decimal pl-5 text-[12.5px]">
              {s.ops.map((o, idx) => (
                <li key={idx} className={o.startsWith(t.keepWord) ? "text-ink-3" : "text-ink"}>{o}</li>
              ))}
            </ol>
          ) : (
            <p className="m-0 text-[12.5px] text-ink-3">{t.opsEmpty}</p>
          )}
        </div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}

function RowView({ i, row, src, curKey, fromSet, pathSet }: { i: number; row: (number | null)[]; src: (Src | null)[]; curKey: string; fromSet: Set<string>; pathSet: Set<string> }) {
  return (
    <>
      <div className="grid h-10 place-items-center font-mono text-[13px] font-semibold text-ink-2">{i === 0 ? "ε" : A[i - 1]}</div>
      {row.map((v, j) => {
        const id = `${i}-${j}`;
        const tone = id === curKey
          ? "border-accent bg-accent text-accent-ink"
          : fromSet.has(id) ? "border-amber bg-amber-soft text-amber"
          : pathSet.has(id) ? "border-green bg-green-soft text-green"
          : v !== null ? "border-line-strong bg-surface text-ink" : "border-dashed border-line text-ink-3";
        const sc = src[j];
        return (
          <div key={id} className={`relative grid h-10 place-items-center rounded-md border font-mono text-[14px] font-medium tabular-nums ${tone}`}>
            {v ?? ""}
            {sc && sc !== "base" && <span className="absolute top-0.5 left-1 text-[9px] opacity-70">{ARROW[sc]}</span>}
          </div>
        );
      })}
    </>
  );
}
