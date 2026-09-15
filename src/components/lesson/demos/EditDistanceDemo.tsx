"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter } from "./StepBar";

/** 把 A 變成 B 的最少操作數。 */
const A = "horse";
const B = "ros";
const M = A.length;
const N = B.length;

type Src = "match" | "replace" | "delete" | "insert" | "base";
const ARROW: Record<Src, string> = { match: "↖", replace: "↖", delete: "↑", insert: "←", base: "" };
const LABEL: Record<Src, string> = { match: "相同", replace: "取代", delete: "刪除", insert: "插入", base: "" };

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

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const dp: (number | null)[][] = Array.from({ length: M + 1 }, () => Array<number | null>(N + 1).fill(null));
  const src: (Src | null)[][] = Array.from({ length: M + 1 }, () => Array<Src | null>(N + 1).fill(null));
  const ops: string[] = [];
  const path: Pos[] = [];
  const snap = (desc: string, op: string, cur: Pos | null = null, from: Pos[] = []) =>
    steps.push({ desc, op, dp: dp.map((r) => [...r]), src: src.map((r) => [...r]), cur, from, path: [...path], ops: [...ops] });

  snap(`dp[i][j] 是「把 "${A}" 的前 i 個字變成 "${B}" 的前 j 個字」最少要幾步。表有 ${M + 1} 列 ${N + 1} 行，先填邊界。`, "初始化");
  for (let j = 0; j <= N; j++) { dp[0][j] = j; src[0][j] = "base"; }
  snap(`第 0 列：空字串要變成 "${B}" 的前 j 個字，只能插入 j 次，所以 dp[0][j] = j。`, "初始化", null, Array.from({ length: N + 1 }, (_, j) => [0, j] as Pos));
  for (let i = 1; i <= M; i++) { dp[i][0] = i; src[i][0] = "base"; }
  snap(`第 0 行："${A}" 的前 i 個字要變成空字串，只能刪除 i 次，所以 dp[i][0] = i。`, "初始化", null, Array.from({ length: M }, (_, i) => [i + 1, 0] as Pos));

  for (let i = 1; i <= M; i++) {
    for (let j = 1; j <= N; j++) {
      const a = A[i - 1];
      const b = B[j - 1];
      const label = `dp[${i}][${j}]`;
      if (a === b) {
        const v = dp[i - 1][j - 1] ?? 0;
        dp[i][j] = v;
        src[i][j] = "match";
        snap(`(${i}, ${j})：'${a}' 和 '${b}' 相同，這兩個字不用動，直接抄左上角 dp[${i - 1}][${j - 1}] = ${v}。`, label, [i, j], [[i - 1, j - 1]]);
      } else {
        const rep = dp[i - 1][j - 1] ?? 0;
        const del = dp[i - 1][j] ?? 0;
        const ins = dp[i][j - 1] ?? 0;
        const best = Math.min(rep, del, ins);
        const s: Src = rep === best ? "replace" : del === best ? "delete" : "insert";
        const fromCell: Pos = s === "replace" ? [i - 1, j - 1] : s === "delete" ? [i - 1, j] : [i, j - 1];
        dp[i][j] = best + 1;
        src[i][j] = s;
        snap(`(${i}, ${j})：'${a}' ≠ '${b}'。取代看左上 ${rep}、刪除看上方 ${del}、插入看左方 ${ins}，取最小 ${best} 再加 1 = ${best + 1}，來源記為「${LABEL[s]}」。`, label, [i, j], [fromCell]);
      }
    }
  }

  let i = M;
  let j = N;
  path.push([M, N]);
  snap(`表填完，答案 dp[${M}][${N}] = ${dp[M][N]}。從右下角出發，沿每格記下的來源往回走，就能還原實際的操作序列。`, "回溯", [M, N]);
  while (i > 0 || j > 0) {
    const s = src[i][j] ?? "base";
    let ni = i;
    let nj = j;
    let text = "";
    if (i === 0) { nj = j - 1; text = `插入 '${B[j - 1]}'`; }
    else if (j === 0) { ni = i - 1; text = `刪除 '${A[i - 1]}'`; }
    else if (s === "match") { ni = i - 1; nj = j - 1; text = `保留 '${A[i - 1]}'`; }
    else if (s === "replace") { ni = i - 1; nj = j - 1; text = `取代 '${A[i - 1]}' → '${B[j - 1]}'`; }
    else if (s === "delete") { ni = i - 1; text = `刪除 '${A[i - 1]}'`; }
    else { nj = j - 1; text = `插入 '${B[j - 1]}'`; }
    ops.unshift(text);
    path.push([ni, nj]);
    snap(`(${i}, ${j}) 的來源是 (${ni}, ${nj})：${text}。`, "回溯", [ni, nj]);
    i = ni;
    j = nj;
  }
  const real = ops.filter((o) => !o.startsWith("保留"));
  snap(`回到 (0, 0)。由前往後讀：${real.join("、")}，共 ${real.length} 步，正好等於 dp[${M}][${N}]。`, "完成");
  return steps;
}

export function EditDistanceDemo() {
  const steps = useMemo(() => buildSteps(), []);
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
            <span>↖ 相同或取代</span><span>↑ 刪除</span><span>← 插入</span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-ink-3">
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm border border-accent bg-accent align-middle" />正在處理</span>
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm border border-amber bg-amber-soft align-middle" />選用的來源格</span>
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm border border-green bg-green-soft align-middle" />回溯路徑</span>
          </div>
        </div>
        <div className="text-[13px] text-ink-2">
          <div className="eyebrow mb-1.5">狀態定義</div>
          <p className="m-0 font-mono text-[12.5px]">dp[i][j] = A[:i] → B[:j] 的最少步數</p>
          <div className="eyebrow mt-3 mb-1.5">轉移</div>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-[12px]">
            <span className="text-ink-3">相同</span><span>dp[i-1][j-1]</span>
            <span className="text-ink-3">取代</span><span>dp[i-1][j-1] + 1</span>
            <span className="text-ink-3">刪除</span><span>dp[i-1][j] + 1</span>
            <span className="text-ink-3">插入</span><span>dp[i][j-1] + 1</span>
          </div>
          <div className="eyebrow mt-3 mb-1.5">操作序列</div>
          {s.ops.length ? (
            <ol className="m-0 list-decimal pl-5 text-[12.5px]">
              {s.ops.map((o, idx) => (
                <li key={idx} className={o.startsWith("保留") ? "text-ink-3" : "text-ink"}>{o}</li>
              ))}
            </ol>
          ) : (
            <p className="m-0 text-[12.5px] text-ink-3">回溯時才會出現</p>
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
