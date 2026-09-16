"use client";

import { useMemo, useState } from "react";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";
import { useLocale, useT } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

const N = 4;

const TEXT = demoText(
  {
    intro: (n: number) => `${n}×${n} 棋盤放 ${n} 個皇后，彼此不能同列、同欄、同對角線。一列放一個，所以只要決定每一列的欄。三個集合記錄被佔用的欄、左上右下對角線（r−c）、右上左下對角線（r+c）。`,
    solved: (n: number, cols: string) => `${n} 列都放好了，這是一組解：欄位依序為 [${cols}]。繼續搜尋還會找到另一組鏡像解，這裡停在第一組。`,
    reasonCol: (c: number) => `欄 ${c} 已有皇后`,
    reasonD1: (v: number) => `對角線 r−c = ${v} 已有皇后`,
    reasonD2: (v: number) => `對角線 r+c = ${v} 已有皇后`,
    reasonJoin: "，",
    attacked: (r: number, c: number, reasons: string) => `第 ${r} 列試欄 ${c}：${reasons}，被攻擊，換下一欄。`,
    place: (r: number, c: number, d1: number, d2: number) => `第 ${r} 列試欄 ${c}：三個集合都沒有衝突，放下皇后，記錄欄 ${c}、r−c = ${d1}、r+c = ${d2}，往下一列。`,
    remove: (rNext: number, r: number, c: number) => `從第 ${rNext} 列開始怎麼放都走不通。回溯：拿掉 (${r}, ${c}) 的皇后，從三個集合移除，換第 ${r} 列的下一欄。`,
    opStart: "開始",
    opSolved: "找到解",
    opTry: (r: number, c: number) => `試 (${r}, ${c})`,
    opPlace: (r: number, c: number) => `放 (${r}, ${c})`,
    opRemove: (r: number, c: number) => `拿掉 (${r}, ${c})`,
    headRight: (n: number) => `${n} 皇后 · 逐列放置`,
    setsTitle: "被佔用的集合",
    note: "黃色底是被現有皇后攻擊的格子，深黃是這一步試到的被攻擊格。灰底是目前要放的那一列。每次判斷只查三個集合，O(1)。",
  },
  {
    en: {
      intro: (n: number) => `Place ${n} queens on the ${n}×${n} board so that no two share a row, a column or a diagonal. One queen goes in each row, so the only decision is which column that row uses. Three sets record the columns and the two diagonal families that are already taken: r−c runs top-left to bottom-right, r+c runs top-right to bottom-left.`,
      solved: (n: number, cols: string) => `All ${n} rows are filled, so this is a solution: the columns, row by row, are [${cols}]. Searching further would turn up the mirror solution too, but this demo stops at the first one.`,
      reasonCol: (c: number) => `column ${c} already has a queen`,
      reasonD1: (v: number) => `diagonal r−c = ${v} already has a queen`,
      reasonD2: (v: number) => `diagonal r+c = ${v} already has a queen`,
      reasonJoin: ", ",
      attacked: (r: number, c: number, reasons: string) => `Row ${r} tries column ${c}: ${reasons}, so the square is attacked. Move to the next column.`,
      place: (r: number, c: number, d1: number, d2: number) => `Row ${r} tries column ${c}: none of the three sets conflict, so the queen goes down. Record column ${c}, r−c = ${d1} and r+c = ${d2}, then move to the next row.`,
      remove: (rNext: number, r: number, c: number) => `Nothing works from row ${rNext} onwards. Backtrack: lift the queen at (${r}, ${c}), remove it from all three sets, and try the next column of row ${r}.`,
      opStart: "start",
      opSolved: "solution found",
      opTry: (r: number, c: number) => `try (${r}, ${c})`,
      opPlace: (r: number, c: number) => `place (${r}, ${c})`,
      opRemove: (r: number, c: number) => `remove (${r}, ${c})`,
      headRight: (n: number) => `${n} queens · one row at a time`,
      setsTitle: "Occupied sets",
      note: "A pale yellow square is attacked by a queen already on the board; the darker yellow one is the square being tried in this step. The grey row is the row currently being filled. Every test is three set lookups, O(1).",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

interface Step {
  desc: string;
  op: string;
  queens: number[];            // queens[r] = 該列皇后所在的欄
  row: number;                 // 目前處理的列
  test?: [number, number];     // 目前試的格子
  kind: "place" | "attacked" | "remove" | "solved" | "none";
  cols: number[]; d1: number[]; d2: number[];
}

function buildSteps(t: T): Step[] {
  const steps: Step[] = [];
  const queens: number[] = [];
  const cols = new Set<number>(), d1 = new Set<number>(), d2 = new Set<number>();
  const snap = (desc: string, op: string, row: number, kind: Step["kind"], test?: [number, number]) =>
    steps.push({ desc, op, queens: [...queens], row, kind, test, cols: [...cols].sort((a, b) => a - b), d1: [...d1].sort((a, b) => a - b), d2: [...d2].sort((a, b) => a - b) });

  snap(t.intro(N), t.opStart, 0, "none");
  let solved = false;
  const dfs = (r: number) => {
    if (solved) return;
    if (r === N) {
      solved = true;
      snap(t.solved(N, queens.join(", ")), t.opSolved, r, "solved");
      return;
    }
    for (let c = 0; c < N && !solved; c++) {
      const reasons: string[] = [];
      if (cols.has(c)) reasons.push(t.reasonCol(c));
      if (d1.has(r - c)) reasons.push(t.reasonD1(r - c));
      if (d2.has(r + c)) reasons.push(t.reasonD2(r + c));
      if (reasons.length) {
        snap(t.attacked(r, c, reasons.join(t.reasonJoin)), t.opTry(r, c), r, "attacked", [r, c]);
        continue;
      }
      queens.push(c); cols.add(c); d1.add(r - c); d2.add(r + c);
      snap(t.place(r, c, r - c, r + c), t.opPlace(r, c), r + 1, "place", [r, c]);
      dfs(r + 1);
      if (solved) return;
      queens.pop(); cols.delete(c); d1.delete(r - c); d2.delete(r + c);
      snap(t.remove(r + 1, r, c), t.opRemove(r, c), r, "remove", [r, c]);
    }
  };
  dfs(0);
  return steps;
}

function attacked(queens: number[], r: number, c: number): boolean {
  return queens.some((qc, qr) => qc === c || qr - qc === r - c || qr + qc === r + c);
}

export function NQueensDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const ui = useT();
  const steps = useMemo(() => buildSteps(TEXT[locale]), [locale]);
  const [k, setK] = useState(0);
  const s = steps[k];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={t.headRight(N)} />
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
          <div className="eyebrow mb-1.5">{t.setsTitle}</div>
          <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5 font-mono text-[12px]">
            <span className="text-ink-3">cols</span><Cells items={s.cols} tone={() => CELL.amber} empty={ui.demo.empty} w="w-8" />
            <span className="text-ink-3">r−c</span><Cells items={s.d1} tone={() => CELL.amber} empty={ui.demo.empty} w="w-8" />
            <span className="text-ink-3">r+c</span><Cells items={s.d2} tone={() => CELL.amber} empty={ui.demo.empty} w="w-8" />
          </div>
          <p className="mt-3 mb-0 text-[12.5px] text-ink-3">{t.note}</p>
        </div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
