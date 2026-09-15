"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, BTN, CELL } from "./StepBar";

type Mode = "pascal" | "fact";
const ROWS = 7;          // Pascal 三角形第 0 到 6 列
const P = 13;            // 階乘取模用的小質數，方便手算
const N = 8;
const QK = 3;            // 查詢 C(8, 3)

const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const sup = (n: number) => String(n).split("").map((d) => SUP[Number(d)]).join("");

interface PascalStep {
  desc: string;
  op: string;
  tri: (number | null)[][];
  cur?: [number, number];
  parents?: [number, number][];
  done?: boolean;
}

function buildPascal(): PascalStep[] {
  const steps: PascalStep[] = [];
  const tri: (number | null)[][] = Array.from({ length: ROWS }, (_, n) => Array.from({ length: n + 1 }, (_, k) => (k === 0 || k === n ? 1 : null)));
  const snap = (desc: string, op: string, extra: Partial<PascalStep> = {}) => steps.push({ desc, op, tri: tri.map((r) => [...r]), ...extra });

  snap("C(n, k) 是從 n 個不同的東西裡選出 k 個的方法數，不管順序。每一列的兩端都是 1：C(n, 0) 是一個都不選，C(n, n) 是全部都選，各只有一種。中間的格子要靠上一列算出來。", "兩端填 1");
  let first = true;
  for (let n = 2; n < ROWS; n++) {
    for (let k = 1; k < n; k++) {
      const a = tri[n - 1][k - 1] as number;
      const b = tri[n - 1][k] as number;
      tri[n][k] = a + b;
      const why = first
        ? `把 ${n} 個東西裡的「第 ${n} 個」單獨拿出來看：選法要嘛包含它，剩下從前 ${n - 1} 個選 ${k - 1} 個，有 C(${n - 1}, ${k - 1}) = ${a} 種；要嘛不包含它，從前 ${n - 1} 個選 ${k} 個，有 C(${n - 1}, ${k}) = ${b} 種。兩類不重疊，加起來就是全部。`
        : `包含第 ${n} 個的 ${a} 種，加上不包含的 ${b} 種。`;
      first = false;
      snap(`C(${n}, ${k}) = C(${n - 1}, ${k - 1}) + C(${n - 1}, ${k}) = ${a} + ${b} = ${a + b}。${why}`, `C(${n}, ${k})`, { cur: [n, k], parents: [[n - 1, k - 1], [n - 1, k]] });
    }
  }
  const last = tri[ROWS - 1] as number[];
  snap(`第 ${ROWS - 1} 列是 ${last.join("、")}，總和 ${last.reduce((x, y) => x + y, 0)} = 2${sup(ROWS - 1)}，因為每個東西都有選或不選兩種可能；左右對稱則是 C(n, k) = C(n, n − k)，選出 k 個等於決定哪 n − k 個不選。綠色的 C(6, 2) = 15 也是「往右 4 步、往下 2 步」從左上走到右下的路徑數：6 步裡挑哪 2 步往下。整張表 O(n²)，只用加法，所以取任何模數都沒問題。`, "結束", { cur: [ROWS - 1, 2], done: true });
  return steps;
}

interface FactStep {
  desc: string;
  op: string;
  fact: (number | null)[];
  inv: (number | null)[];
  cur?: { row: "fact" | "inv"; i: number };
  src?: { row: "fact" | "inv"; i: number }[];
  formula?: string[];
  query?: boolean;
}

function buildFact(): FactStep[] {
  const steps: FactStep[] = [];
  const fact: (number | null)[] = Array(N + 1).fill(null);
  const inv: (number | null)[] = Array(N + 1).fill(null);
  const snap = (desc: string, op: string, extra: Partial<FactStep> = {}) => steps.push({ desc, op, fact: [...fact], inv: [...inv], ...extra });
  const powMod = (a: number, e: number) => { let r = 1, b = a % P; while (e > 0) { if (e & 1) r = (r * b) % P; b = (b * b) % P; e >>= 1; } return r; };

  fact[0] = 1;
  snap(`要算 C(${N}, ${QK}) = ${N}! / (${QK}! · ${N - QK}!) mod ${P}。模數之下不能直接除，要乘上反元素。做法是先把 0! 到 ${N}! 和它們的反元素都存成表，之後任何 C(n, k) 都是三個數相乘。0! = 1。`, "0! = 1", { cur: { row: "fact", i: 0 } });
  for (let i = 1; i <= N; i++) {
    const prev = fact[i - 1] as number;
    fact[i] = (prev * i) % P;
    snap(`${i}! = ${i - 1}! × ${i} = ${prev} × ${i} = ${prev * i}，mod ${P} = ${fact[i]}。${i === 1 ? "每一格只要拿上一格乘一次，O(1)。" : ""}`, `${i}!`, { cur: { row: "fact", i }, src: [{ row: "fact", i: i - 1 }] });
  }
  const fN = fact[N] as number;
  inv[N] = powMod(fN, P - 2);
  snap(`階乘表 O(n) 建完。反元素表從最右邊開始：只對 ${N}! 用一次費馬小定理，inv[${N}] = ${fN}^(${P} − 2) = ${fN}${sup(P - 2)} mod ${P} = ${inv[N]}，驗算 ${fN} × ${inv[N]} = ${fN * (inv[N] as number)} ≡ 1。快速冪 O(log p)，整個流程只需要做這一次。`, `inv[${N}]`, { cur: { row: "inv", i: N }, src: [{ row: "fact", i: N }], formula: [`inv[${N}] = (${N}!)⁻¹ = ${fN}${sup(P - 2)} mod ${P} = ${inv[N]}`] });
  for (let i = N; i >= 1; i--) {
    const cur = inv[i] as number;
    inv[i - 1] = (cur * i) % P;
    const ok = ((fact[i - 1] as number) * (inv[i - 1] as number)) % P;
    snap(
      `往左推：(${i - 1}!)⁻¹ = (${i}!)⁻¹ × ${i}，因為 ${i - 1}! = ${i}! / ${i}。inv[${i - 1}] = ${cur} × ${i} = ${cur * i}，mod ${P} = ${inv[i - 1]}。驗算 ${i - 1}! × inv[${i - 1}] = ${fact[i - 1]} × ${inv[i - 1]} ≡ ${ok}。${i === N ? "不必再對每一格做快速冪。" : ""}`,
      `inv[${i - 1}]`,
      { cur: { row: "inv", i: i - 1 }, src: [{ row: "inv", i }] },
    );
  }
  const a = fact[N] as number, b = inv[QK] as number, c = inv[N - QK] as number;
  const ans = (((a * b) % P) * c) % P;
  let exact = 1;
  for (let i = 0; i < QK; i++) exact = (exact * (N - i)) / (i + 1);
  snap(
    `查詢 C(${N}, ${QK}) = ${N}! × inv[${QK}] × inv[${N - QK}] = ${a} × ${b} × ${c} = ${a * b * c}，mod ${P} = ${ans}。直接算 C(${N}, ${QK}) = ${exact}，${exact} mod ${P} 也是 ${exact % P}。建表 O(n + log p) 之後，每次查詢 O(1)。`,
    `C(${N}, ${QK})`,
    { src: [{ row: "fact", i: N }, { row: "inv", i: QK }, { row: "inv", i: N - QK }], formula: [`C(${N}, ${QK}) ≡ ${N}! · (${QK}!)⁻¹ · (${N - QK}!)⁻¹ ≡ ${a} · ${b} · ${c} ≡ ${ans}  (mod ${P})`], query: true },
  );
  snap(`這個方法要求 n < p：一旦 n ≥ ${P}，${P}! 裡含有因數 ${P}，mod ${P} 變成 0，沒有反元素，整張表就壞了。實務上模數是 10⁹+7，n 在 10⁶、10⁷ 的等級完全沒問題；n 真的比 p 大時要改用 Lucas 定理。`, "限制：n < p", { formula: [`${P}! ≡ 0 (mod ${P})，沒有反元素`] });
  return steps;
}

export function CombinatoricsDemo() {
  const pascal = useMemo(() => buildPascal(), []);
  const fact = useMemo(() => buildFact(), []);
  const [mode, setMode] = useState<Mode>("pascal");
  const [k, setK] = useState(0);
  const total = mode === "pascal" ? pascal.length : fact.length;
  const switchMode = (m: Mode) => { setMode(m); setK(0); };
  const ps = pascal[Math.min(k, pascal.length - 1)];
  const fs = fact[Math.min(k, fact.length - 1)];
  const s = mode === "pascal" ? ps : fs;
  const box = "grid h-8 min-w-0 place-items-center rounded-md border font-mono text-[12.5px] tabular-nums";

  const pTone = (n: number, kk: number) => {
    if (ps.cur && ps.cur[0] === n && ps.cur[1] === kk) return ps.done ? CELL.green : CELL.accent;
    if (ps.parents?.some(([a, b]) => a === n && b === kk)) return CELL.amber;
    if (ps.tri[n][kk] === null) return CELL.dim;
    return "border-line-strong bg-surface text-ink";
  };
  const fTone = (row: "fact" | "inv", i: number) => {
    if (fs.cur && fs.cur.row === row && fs.cur.i === i) return CELL.accent;
    if (fs.src?.some((x) => x.row === row && x.i === i)) return fs.query ? CELL.green : CELL.amber;
    if ((row === "fact" ? fs.fact : fs.inv)[i] === null) return CELL.dim;
    return "border-line-strong bg-surface text-ink";
  };

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader
        k={k}
        total={total}
        setK={setK}
        left={
          <div className="flex gap-1">
            {(["pascal", "fact"] as Mode[]).map((m) => (
              <button key={m} type="button" className={`${BTN} ${mode === m ? "border-accent bg-accent-soft text-accent" : "border-line bg-surface hover:bg-surface-2"}`} onClick={() => switchMode(m)}>
                {m === "pascal" ? "Pascal 三角形" : `階乘表 mod ${P}`}
              </button>
            ))}
          </div>
        }
        right={<span className="font-mono">{s.op}</span>}
      />

      {mode === "pascal" ? (
        <div className="p-3.5">
          <div className="eyebrow mb-2">第 n 列第 k 格是 C(n, k)</div>
          <div className="flex flex-col items-center gap-1">
            {ps.tri.map((row, n) => (
              <div key={n} className="flex items-center gap-1">
                <span className="w-8 shrink-0 text-right font-mono text-[11px] text-ink-3">n={n}</span>
                {row.map((v, kk) => (
                  <span key={kk} className={`${box} w-9 ${pTone(n, kk)}`}>{v ?? "·"}</span>
                ))}
                <span className="w-8 shrink-0" />
              </div>
            ))}
          </div>
          <div className="mt-2.5 flex flex-wrap justify-center gap-x-3.5 gap-y-1 text-[12px] text-ink-3">
            <span className="inline-flex items-center gap-1.5"><i className={`inline-block h-3 w-3 rounded-[3px] border ${CELL.accent}`} />正在算的格子</span>
            <span className="inline-flex items-center gap-1.5"><i className={`inline-block h-3 w-3 rounded-[3px] border ${CELL.amber}`} />它的兩個來源</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 p-3.5">
          <div className="overflow-x-auto">
            <div className="grid min-w-[300px] gap-1" style={{ gridTemplateColumns: `4.6rem repeat(${N + 1}, minmax(0, 1fr))` }}>
              <span className="self-center text-[11.5px] text-ink-3">i</span>
              {fs.fact.map((_, i) => <span key={`i${i}`} className={`${box} border-line bg-surface-2 text-ink-3`}>{i}</span>)}
              <span className="self-center font-mono text-[11.5px] text-ink-3">i! mod {P}</span>
              {fs.fact.map((v, i) => <span key={`f${i}`} className={`${box} ${fTone("fact", i)}`}>{v ?? "·"}</span>)}
              <span className="self-center font-mono text-[11.5px] text-ink-3">(i!)⁻¹</span>
              {fs.inv.map((v, i) => <span key={`v${i}`} className={`${box} ${fTone("inv", i)}`}>{v ?? "·"}</span>)}
            </div>
          </div>
          <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-[12px] text-ink-3">
            <span className="inline-flex items-center gap-1.5"><i className={`inline-block h-3 w-3 rounded-[3px] border ${CELL.accent}`} />這一步填的格子</span>
            <span className="inline-flex items-center gap-1.5"><i className={`inline-block h-3 w-3 rounded-[3px] border ${CELL.amber}`} />用到的格子</span>
            <span className="inline-flex items-center gap-1.5"><i className={`inline-block h-3 w-3 rounded-[3px] border ${CELL.green}`} />查詢時相乘的三格</span>
          </div>
          {fs.formula && (
            <div className="rounded-md border border-line bg-surface-2 px-3 py-2 font-mono text-[12.5px] text-ink">
              {fs.formula.map((line) => <div key={line}>{line}</div>)}
            </div>
          )}
        </div>
      )}

      <StepFooter k={k} total={total}>{s.desc}</StepFooter>
    </div>
  );
}
