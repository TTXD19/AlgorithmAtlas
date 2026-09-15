"use client";

import { Fragment, useMemo, useState } from "react";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

/** 把 A 改成 B。P、Y、T 三個字在兩邊的順序顛倒，LCS 不只一種。 */
const A = "PYTHON";
const B = "TYPHOON";
const M = A.length;
const N = B.length;

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

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const dp: (number | null)[][] = Array.from({ length: M + 1 }, () => Array<number | null>(N + 1).fill(null));
  const arrow: (Arrow | null)[][] = Array.from({ length: M + 1 }, () => Array<Arrow | null>(N + 1).fill(null));
  const path: Pos[] = [];
  const kept: Pos[] = [];
  const ops: Op[] = [];
  const val = (i: number, j: number) => dp[i][j] ?? 0;
  const snap = (desc: string, label: string, formula: string, cur: Pos | null = null, reads: Pos[] = []) =>
    steps.push({ desc, label, formula, dp: dp.map((r) => [...r]), arrow: arrow.map((r) => [...r]), cur, reads, path: [...path], kept: [...kept], ops: [...ops] });

  snap(`dp[i][j] 是「A 的前 i 個字」和「B 的前 j 個字」的 LCS 長度。A = "${A}" 有 ${M} 個字、B = "${B}" 有 ${N} 個字，表格是 ${M + 1} 列 × ${N + 1} 行，答案在右下角 dp[${M}][${N}]。`, "定義狀態", "dp[i][j] = LCS(A[:i], B[:j])");
  for (let i = 0; i <= M; i++) dp[i][0] = 0;
  for (let j = 0; j <= N; j++) dp[0][j] = 0;
  snap("base case：空字串（ε）和任何字串都沒有共同的字，第 0 列與第 0 行全是 0。接著逐列由左到右填，每格要讀的上方、左方、左上方一定已經算好。", "base case", "dp[0][j] = dp[i][0] = 0");

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
          ? ` B 的第 ${prev + 1} 個字也是 '${b}'，A 的 '${a}' 配那一個時得到 ${val(i - 1, prev) + 1}，配這一個得到 ${diag + 1}${val(i - 1, prev) + 1 === diag + 1 ? "，一樣長，這也是 LCS 不唯一的來源" : ""}。`
          : "";
        snap(`(${i}, ${j})：'${a}' 和 '${b}' 相同，這個字可以接在「兩邊都去掉它」的 LCS 後面。讀左上 dp[${i - 1}][${j - 1}] = ${diag}，加一得 ${diag + 1}。${dup}`, label, `'${a}' = '${b}' → dp[${i - 1}][${j - 1}] + 1 = ${diag + 1}`, [i, j], [[i - 1, j - 1]]);
      } else {
        const up = val(i - 1, j);
        const left = val(i, j - 1);
        const best = Math.max(up, left);
        dp[i][j] = best;
        arrow[i][j] = left >= up ? "left" : "up";
        const cmp = up === left ? `兩邊都是 ${best}，平手記 ←` : up > left ? `上方比較大，記 ↑` : `左方比較大，記 ←`;
        const desc = explained
          ? `(${i}, ${j})：'${a}' ≠ '${b}'。捨棄 '${a}' 看上方 ${up}、捨棄 '${b}' 看左方 ${left}，取大的 ${best}；${cmp}。`
          : `(${i}, ${j})：'${a}' ≠ '${b}'，兩個不同的字不可能同時當 LCS 的最後一個字，至少要捨棄一個。捨棄 A 的 '${a}' 就是上方 dp[${i - 1}][${j}] = ${up}，捨棄 B 的 '${b}' 就是左方 dp[${i}][${j - 1}] = ${left}，取大的 ${best}。${up === left ? "平手時箭頭固定記 ←，回溯時就優先往左。" : ""}`;
        explained = true;
        snap(desc, label, `'${a}' ≠ '${b}' → max(${up}, ${left}) = ${best}`, [i, j], [[i - 1, j], [i, j - 1]]);
      }
    }
  }

  const L = val(M, N);
  path.push([M, N]);
  snap(`表填完了，dp[${M}][${N}] = ${L} 就是 LCS 長度。表只給長度，要知道是哪些字、diff 長什麼樣子，得從右下角沿著箭頭往回走：↖ 是保留、↑ 是刪除 A 的字、← 是插入 B 的字。`, "回溯", `LCS 長度 = ${L}`);

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
      desc = `(0, ${j}) 在第 0 列：A 已經用完，B 剩下的 '${B[j - 1]}' 只能插入。往左走。`;
      formula = `+ '${B[j - 1]}'`;
      reads = [[ni, nj]];
    } else if (j === 0) {
      ni = i - 1;
      ops.unshift({ kind: "del", ch: A[i - 1] });
      desc = `(${i}, 0) 在第 0 行：B 已經用完，A 剩下的 '${A[i - 1]}' 只能刪除。往上走。`;
      formula = `− '${A[i - 1]}'`;
      reads = [[ni, nj]];
    } else if (A[i - 1] === B[j - 1]) {
      ni = i - 1;
      nj = j - 1;
      kept.push([i, j]);
      ops.unshift({ kind: "keep", ch: A[i - 1] });
      desc = `(${i}, ${j})：'${A[i - 1]}' = '${B[j - 1]}'，這格是左上加一來的，'${A[i - 1]}' 屬於 LCS，diff 記「保留」。往左上走到 (${ni}, ${nj})。`;
      formula = `↖ 保留 '${A[i - 1]}'`;
      reads = [[ni, nj]];
    } else {
      const up = val(i - 1, j);
      const left = val(i, j - 1);
      reads = [[i - 1, j], [i, j - 1]];
      if (left >= up) {
        nj = j - 1;
        ops.unshift({ kind: "ins", ch: B[j - 1] });
        desc = `(${i}, ${j})：'${A[i - 1]}' ≠ '${B[j - 1]}'，左方 ${left} ${left === up ? "和上方一樣大，平手優先往左" : `比上方 ${up} 大`}。往左代表 B 的 '${B[j - 1]}' 不在這條 LCS 裡，diff 記「插入 '${B[j - 1]}'」。`;
        formula = `← + '${B[j - 1]}'`;
      } else {
        ni = i - 1;
        ops.unshift({ kind: "del", ch: A[i - 1] });
        desc = `(${i}, ${j})：'${A[i - 1]}' ≠ '${B[j - 1]}'，上方 ${up} 比左方 ${left} 大，只能往上。往上代表 A 的 '${A[i - 1]}' 不在這條 LCS 裡，diff 記「刪除 '${A[i - 1]}'」。`;
        formula = `↑ − '${A[i - 1]}'`;
      }
    }
    snap(desc, "回溯", formula, [i, j], reads);
    path.push([ni, nj]);
    i = ni;
    j = nj;
  }

  const lcs = ops.filter((o) => o.kind === "keep").map((o) => o.ch).join("");
  const del = ops.filter((o) => o.kind === "del").length;
  const ins = ops.filter((o) => o.kind === "ins").length;
  const others = allLcs(dp.map((r) => r.map((v) => v ?? 0))).filter((s) => s !== lcs);
  snap(
    `回到 (0, 0)。LCS = ${lcs}，長度 ${L}。diff 保留 ${L} 個字、刪除 ${M} − ${L} = ${del} 個、插入 ${N} − ${L} = ${ins} 個：P、Y、T 在兩邊順序顛倒，只能留一個，其餘變成「刪掉再插入」，git diff 遇到搬移過的程式碼也是這樣顯示。平手改走別的方向會得到 ${others.join("、")}，長度一樣是 ${L}。填 ${M}×${N} 格各 O(1)、回溯最多 ${M + N} 步，總共 O(mn)。`,
    "完成",
    `LCS = "${lcs}"，增刪 ${del + ins} 次`,
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
  const steps = useMemo(() => buildSteps(), []);
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
          <div className="eyebrow mb-2">dp 表（列是 A，行是 B）</div>
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
            <span>↖ 相等，左上加一</span><span>↑ 上方較大</span><span>← 左方較大或平手</span>
          </div>
        </div>

        <div className="text-[13px] text-ink-2">
          <div className="eyebrow mb-1.5">轉移式</div>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-[12px]">
            <span className="text-ink-3">A[i−1] = B[j−1]</span><span>dp[i−1][j−1] + 1</span>
            <span className="text-ink-3">A[i−1] ≠ B[j−1]</span><span>max(dp[i−1][j], dp[i][j−1])</span>
          </div>
          <div className="eyebrow mt-3 mb-1.5">這一步</div>
          <div className="rounded-lg border border-line bg-surface-2 px-3 py-2 font-mono text-[12.5px] break-words tabular-nums">{s.formula}</div>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-ink-3">
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm border border-accent bg-accent align-middle" />正在處理</span>
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm border border-amber bg-amber-soft align-middle" />讀取／比較的格子</span>
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm border border-green bg-surface align-middle" />回溯路徑</span>
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm border border-green bg-green-soft align-middle" />LCS 的字</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 border-t border-line p-3.5 md:grid-cols-[auto_minmax(0,1fr)]">
        <div>
          <div className="eyebrow mb-2">LCS</div>
          <Cells items={lcsSoFar} tone={() => CELL.green} empty="回溯時出現" />
        </div>
        <div>
          <div className="eyebrow mb-2">diff：A → B</div>
          <div className="flex flex-wrap gap-1">
            {s.ops.map((o, idx) => (
              <span key={`${idx}-${o.kind}-${o.ch}`} className={`grid h-8 w-9 place-items-center rounded-md border font-mono text-[13px] ${OP_TONE[o.kind]}`}>
                <span>
                  {OP_SIGN[o.kind] && <span className="mr-px text-[11px]">{OP_SIGN[o.kind]}</span>}
                  <span className={o.kind === "del" ? "line-through" : ""}>{o.ch}</span>
                </span>
              </span>
            ))}
            {s.ops.length === 0 && <span className="rounded-md border border-dashed border-line-strong px-2 text-[12px] leading-8 text-ink-3">回溯時出現</span>}
          </div>
          <div className="mt-1.5 text-[12px] text-ink-3">綠色保留（LCS）、黃色 − 是從 A 刪除、藍色 + 是從 B 插入</div>
        </div>
      </div>

      <StepFooter k={Math.min(k, steps.length - 1)} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
