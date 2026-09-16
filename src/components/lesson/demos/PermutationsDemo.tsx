"use client";

import { useMemo, useState } from "react";
import { useLocale, useT } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { ForestSVG, type GNode } from "./tree-utils";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";

const NUMS = [1, 2, 3];

const TEXT = demoText(
  {
    sep: "、",
    opStart: "開始",
    opEnd: "結束",
    opCollect: (label: string) => `收集 ${label}`,
    opPick: (v: number) => `選 ${v}`,
    opUndo: (v: number) => `撤銷 ${v}`,
    intro: "排列要決定「每個位置放誰」。每一層從還沒用過的數字裡挑一個放進路徑，used 陣列記錄誰已經在路徑上。",
    collect: (n: number, label: string) => `路徑填滿 ${n} 個位置，得到一個排列 ${label}。收進答案，回到上一層。`,
    skipped: (list: string) => `${list} 已用過，跳過。`,
    pick: (depth: number, note: string, v: number, j: number) =>
      `第 ${depth} 層：${note}選 ${v}，used[${j}] 設為 true，往下一層。`,
    undo: (v: number, j: number) => `撤銷：把 ${v} 從路徑拿掉，used[${j}] 設回 false。同一層的下一個候選才能接著試。`,
    finished: "6 個葉節點就是 3! = 6 個排列。第一層有 n 個選擇、第二層 n−1 個……葉節點共 n! 個，每個要複製 O(n)，所以 O(n!·n)。",
    caption: "nums = [1, 2, 3] · 每層從沒用過的數字裡挑",
    currentPath: "目前路徑",
    collected: (n: number, total: number) => `已收集的排列（${n}/${total}）`,
    none: "還沒有",
  },
  {
    en: {
      sep: ", ",
      opStart: "Start",
      opEnd: "Done",
      opCollect: (label: string) => `Collect ${label}`,
      opPick: (v: number) => `Take ${v}`,
      opUndo: (v: number) => `Undo ${v}`,
      intro: "A permutation is a decision about what goes in each position. Every level takes one of the numbers that has not been used yet and appends it to the path, while the used array records which numbers are already on the path.",
      collect: (n: number, label: string) => `The path now fills all ${n} positions, which gives the permutation ${label}. Record it as an answer and return to the level above.`,
      skipped: (list: string) => `skip ${list} (already used), then `,
      pick: (depth: number, note: string, v: number, j: number) =>
        `Level ${depth}: ${note}take ${v}, set used[${j}] to true, and descend a level.`,
      undo: (v: number, j: number) => `Undo: remove ${v} from the path and set used[${j}] back to false, so the next candidate at this level can be tried.`,
      finished: "The 6 leaves are exactly the 3! = 6 permutations. The first level has n choices, the second n−1, and so on, which gives n! leaves; copying each one costs O(n), so the whole search is O(n!·n).",
      caption: "nums = [1, 2, 3] · each level picks from the unused numbers",
      currentPath: "Current path",
      collected: (n: number, total: number) => `Permutations collected (${n}/${total})`,
      none: "none yet",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

/** 節點 id 就是目前路徑，排列樹上每條路徑都不同 */
function buildTree(path: number[]): GNode {
  const node: GNode = { id: path.join(""), label: path.length ? path.join("") : "∅", children: [] };
  for (const x of NUMS) if (!path.includes(x)) node.children.push(buildTree([...path, x]));
  return node;
}
const TREE = buildTree([]);
const TOTAL = 6;

interface Step { desc: string; op: string; path: number[]; used: boolean[]; found: string[]; cur: string; done: string[]; trying?: number; fresh?: boolean }

function buildSteps(t: T): Step[] {
  const steps: Step[] = [];
  const path: number[] = [];
  const used: boolean[] = NUMS.map(() => false);
  const found: string[] = [];
  const done: string[] = [];
  const snap = (desc: string, op: string, extra: Partial<Step> = {}) =>
    steps.push({ desc, op, path: [...path], used: [...used], found: [...found], cur: path.join(""), done: [...done], ...extra });

  snap(t.intro, t.opStart);
  const dfs = () => {
    if (path.length === NUMS.length) {
      const label = `[${path.join(",")}]`;
      found.push(label);
      done.push(path.join(""));
      snap(t.collect(NUMS.length, label), t.opCollect(label), { fresh: true });
      return;
    }
    const skipped: number[] = [];
    for (let j = 0; j < NUMS.length; j++) {
      if (used[j]) { skipped.push(NUMS[j]); continue; }
      used[j] = true;
      path.push(NUMS[j]);
      snap(
        t.pick(path.length, skipped.length ? t.skipped(skipped.join(t.sep)) : "", NUMS[j], j),
        t.opPick(NUMS[j]),
        { trying: j },
      );
      dfs();
      path.pop();
      used[j] = false;
      snap(t.undo(NUMS[j], j), t.opUndo(NUMS[j]), { trying: j });
      skipped.length = 0;
    }
    done.push(path.join(""));
  };
  dfs();
  snap(t.finished, t.opEnd);
  return steps;
}

export function PermutationsDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const ui = useT();
  const steps = useMemo(() => buildSteps(TEXT[locale]), [locale]);
  const [k, setK] = useState(0);
  const s = steps[k];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={t.caption} />
      <ForestSVG
        roots={[TREE]}
        height={24 + 4 * 52}
        tone={(n) => (n.id === s.cur ? (s.fresh ? "green" : "accent") : s.done.includes(n.id) ? "dim" : "none")}
      />
      <div className="grid grid-cols-1 gap-3.5 border-t border-line p-3.5 md:grid-cols-[auto_auto_auto_minmax(0,1fr)]">
        <div>
          <div className="eyebrow mb-1.5">nums</div>
          <Cells items={NUMS} tone={(i) => (i === s.trying ? CELL.accent : s.used[i] ? CELL.dim : "")} />
        </div>
        <div>
          <div className="eyebrow mb-1.5">used</div>
          <Cells items={s.used.map((u) => (u ? "T" : "F"))} tone={(i) => (s.used[i] ? CELL.amber : "")} />
        </div>
        <div>
          <div className="eyebrow mb-1.5">{t.currentPath}</div>
          <Cells items={s.path} tone={() => CELL.amber} empty={ui.demo.empty} />
        </div>
        <div>
          <div className="eyebrow mb-1.5">{t.collected(s.found.length, TOTAL)}</div>
          <div className="flex flex-wrap gap-1 font-mono text-[12.5px]">
            {s.found.map((f, i) => (
              <span key={f} className={`rounded-md border px-1.5 leading-7 ${i === s.found.length - 1 && s.fresh ? "border-green bg-green-soft text-green" : "border-line bg-surface-2 text-ink-2"}`}>{f}</span>
            ))}
            {s.found.length === 0 && <span className="text-ink-3">{t.none}</span>}
          </div>
        </div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
