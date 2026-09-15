"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

/** 1-indexed 原陣列 */
const ARR = [0, 5, 3, 8, 6, 2, 7, 4, 1];
const N = ARR.length - 1;
const lowbit = (i: number) => i & -i;
const bin = (i: number) => i.toString(2).padStart(4, "0");

function buildBIT(a: number[]) {
  const t = new Array(a.length).fill(0);
  for (let i = 1; i <= N; i++) { t[i] += a[i]; const j = i + lowbit(i); if (j <= N) t[j] += t[i]; }
  return t;
}

interface Step { desc: string; op: string; arr: number[]; tree: number[]; i: number | null; touched: number[]; acc?: number }

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const arr = [...ARR];
  let tree = buildBIT(arr);
  const touched: number[] = [];
  const snap = (desc: string, op: string, i: number | null, acc?: number) => steps.push({ desc, op, arr: [...arr], tree: [...tree], i, touched: [...touched], acc });

  snap("tree[i] 負責的區間長度是 lowbit(i)，也就是 i 的二進位最右邊那個 1 的值。tree[6] = 0110 負責 2 個：a[5..6]；tree[8] = 1000 負責 8 個：a[1..8]。", "build", null);

  // prefix(6)
  let i = 6, acc = 0; touched.length = 0;
  snap(`前綴和 prefix(6)：從 i = 6 開始，每次加 tree[i]，然後 i −= lowbit(i)，把最右邊的 1 拿掉。`, "prefix(6)", i, 0);
  while (i > 0) {
    acc += tree[i]; touched.push(i);
    snap(`i = ${i} (${bin(i)})，加 tree[${i}] = ${tree[i]}（負責 a[${i - lowbit(i) + 1}..${i}]），累計 ${acc}。i −= lowbit = ${lowbit(i)} → ${i - lowbit(i)}。`, "prefix(6)", i, acc);
    i -= lowbit(i);
  }
  snap(`i = 0 停止。a[1..6] 的和 = ${acc}，只加了 ${touched.length} 個格子。最多加 log n 個。`, "prefix(6)", null, acc);

  // update(3, +2)
  touched.length = 0;
  i = 3; const delta = 2; arr[3] += delta;
  snap(`單點更新 update(3, +2)：從 i = 3 開始，每次 tree[i] += 2，然後 i += lowbit(i)，跳到下一個「也負責 a[3]」的格子。`, "update(3, +2)", i);
  while (i <= N) {
    tree[i] += delta; touched.push(i);
    snap(`i = ${i} (${bin(i)})，tree[${i}] 加 2 變成 ${tree[i]}。i += lowbit = ${lowbit(i)} → ${i + lowbit(i)}。`, "update(3, +2)", i);
    i += lowbit(i);
  }
  snap(`超出 n 停止。改了 ${touched.length} 個格子，O(log n)。現在再算 prefix(6) 會是 ${acc + delta}。`, "update(3, +2)", null);
  tree = buildBIT(arr);
  return steps;
}

export function FenwickDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];
  const idx = Array.from({ length: N }, (_, j) => j + 1);
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right="索引從 1 開始" />
      <div className="px-3.5 pt-3.5">
        <div className="eyebrow mb-1.5">每個 tree[i] 負責的區間（長度 = lowbit(i)）</div>
        <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))` }}>
          {idx.map((j) => {
            const len = lowbit(j), from = j - len + 1;
            const tone = s.i === j ? "bg-accent" : s.touched.includes(j) ? "bg-green" : "bg-line-strong";
            return <div key={j} className={`h-2 rounded-sm ${tone}`} style={{ gridColumn: `${from} / span ${len}` }} title={`tree[${j}] 負責 a[${from}..${j}]`} />;
          })}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 px-3.5 py-3 md:grid-cols-3">
        <div>
          <div className="eyebrow mb-1.5">索引 i</div>
          <Cells items={idx} tone={(j) => (s.i === j + 1 ? CELL.accent : s.touched.includes(j + 1) ? CELL.green : "")} w="w-8" />
        </div>
        <div>
          <div className="eyebrow mb-1.5">原陣列 a[i]</div>
          <Cells items={s.arr.slice(1)} tone={(j) => (s.op.startsWith("update") && j + 1 === 3 ? CELL.amber : "")} w="w-8" />
        </div>
        <div>
          <div className="eyebrow mb-1.5">tree[i]</div>
          <Cells items={s.tree.slice(1)} tone={(j) => (s.i === j + 1 ? CELL.accent : s.touched.includes(j + 1) ? CELL.green : "")} w="w-8" />
        </div>
      </div>
      {s.i !== null && (
        <div className="border-t border-line px-3.5 py-2 font-mono text-[12.5px] text-ink-2">
          i = {s.i} = {bin(s.i)}₂ · lowbit(i) = i &amp; −i = {lowbit(s.i)}{s.acc !== undefined && ` · 累計 ${s.acc}`}
        </div>
      )}
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
