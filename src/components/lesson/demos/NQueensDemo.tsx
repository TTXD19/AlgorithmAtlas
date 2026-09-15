"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

const N = 4;

interface Step {
  desc: string;
  op: string;
  queens: number[];            // queens[r] = 該列皇后所在的欄
  row: number;                 // 目前處理的列
  test?: [number, number];     // 目前試的格子
  kind: "place" | "attacked" | "remove" | "solved" | "none";
  cols: number[]; d1: number[]; d2: number[];
}

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const queens: number[] = [];
  const cols = new Set<number>(), d1 = new Set<number>(), d2 = new Set<number>();
  const snap = (desc: string, op: string, row: number, kind: Step["kind"], test?: [number, number]) =>
    steps.push({ desc, op, queens: [...queens], row, kind, test, cols: [...cols].sort((a, b) => a - b), d1: [...d1].sort((a, b) => a - b), d2: [...d2].sort((a, b) => a - b) });

  snap(`${N}×${N} 棋盤放 ${N} 個皇后，彼此不能同列、同欄、同對角線。一列放一個，所以只要決定每一列的欄。三個集合記錄被佔用的欄、左上右下對角線（r−c）、右上左下對角線（r+c）。`, "開始", 0, "none");
  let solved = false;
  const dfs = (r: number) => {
    if (solved) return;
    if (r === N) {
      solved = true;
      snap(`${N} 列都放好了，這是一組解：欄位依序為 [${queens.join(", ")}]。繼續搜尋還會找到另一組鏡像解，這裡停在第一組。`, "找到解", r, "solved");
      return;
    }
    for (let c = 0; c < N && !solved; c++) {
      const reasons: string[] = [];
      if (cols.has(c)) reasons.push(`欄 ${c} 已有皇后`);
      if (d1.has(r - c)) reasons.push(`對角線 r−c = ${r - c} 已有皇后`);
      if (d2.has(r + c)) reasons.push(`對角線 r+c = ${r + c} 已有皇后`);
      if (reasons.length) {
        snap(`第 ${r} 列試欄 ${c}：${reasons.join("，")}，被攻擊，換下一欄。`, `試 (${r}, ${c})`, r, "attacked", [r, c]);
        continue;
      }
      queens.push(c); cols.add(c); d1.add(r - c); d2.add(r + c);
      snap(`第 ${r} 列試欄 ${c}：三個集合都沒有衝突，放下皇后，記錄欄 ${c}、r−c = ${r - c}、r+c = ${r + c}，往下一列。`, `放 (${r}, ${c})`, r + 1, "place", [r, c]);
      dfs(r + 1);
      if (solved) return;
      queens.pop(); cols.delete(c); d1.delete(r - c); d2.delete(r + c);
      snap(`從第 ${r + 1} 列開始怎麼放都走不通。回溯：拿掉 (${r}, ${c}) 的皇后，從三個集合移除，換第 ${r} 列的下一欄。`, `拿掉 (${r}, ${c})`, r, "remove", [r, c]);
    }
  };
  dfs(0);
  return steps;
}

function attacked(queens: number[], r: number, c: number): boolean {
  return queens.some((qc, qr) => qc === c || qr - qc === r - c || qr + qc === r + c);
}

export function NQueensDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={`${N} 皇后 · 逐列放置`} />
      <div className="grid grid-cols-1 gap-4 p-3.5 md:grid-cols-[auto_minmax(0,1fr)] md:items-start">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${N}, 44px)` }}>
          {Array.from({ length: N }, (_, r) =>
            Array.from({ length: N }, (_, c) => {
              const hasQueen = s.queens[r] === c;
              const isTest = s.test && s.test[0] === r && s.test[1] === c;
              const hit = !hasQueen && attacked(s.queens, r, c);
              let cls = "border-line-strong bg-surface";
              if (hasQueen) cls = s.kind === "solved" ? "border-green bg-green-soft text-green" : "border-accent bg-accent text-accent-ink";
              else if (isTest && s.kind === "attacked") cls = "border-amber bg-amber text-accent-ink";
              else if (isTest && s.kind === "remove") cls = "border-dashed border-accent bg-surface text-ink-3";
              else if (hit) cls = "border-amber bg-amber-soft text-amber";
              else if (r === s.row && s.kind !== "solved") cls = "border-line-strong bg-surface-2";
              return (
                <div key={`${r}-${c}`} className={`grid h-11 place-items-center rounded-md border font-mono text-[15px] ${cls}`}>
                  {hasQueen ? "♛" : hit || (isTest && s.kind === "attacked") ? "×" : ""}
                </div>
              );
            }),
          )}
        </div>
        <div className="text-[13px] text-ink-2">
          <div className="eyebrow mb-1.5">被佔用的集合</div>
          <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5 font-mono text-[12px]">
            <span className="text-ink-3">cols</span><Cells items={s.cols} tone={() => CELL.amber} empty="空" w="w-8" />
            <span className="text-ink-3">r−c</span><Cells items={s.d1} tone={() => CELL.amber} empty="空" w="w-8" />
            <span className="text-ink-3">r+c</span><Cells items={s.d2} tone={() => CELL.amber} empty="空" w="w-8" />
          </div>
          <p className="mt-3 mb-0 text-[12.5px] text-ink-3">黃色底是被現有皇后攻擊的格子，深黃是這一步試到的被攻擊格。灰底是目前要放的那一列。每次判斷只查三個集合，O(1)。</p>
        </div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
