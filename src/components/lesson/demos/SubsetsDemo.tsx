"use client";

import { useMemo, useState } from "react";
import { ForestSVG, type GNode } from "./tree-utils";
import { StepHeader, StepFooter, Cells, CELL } from "./StepBar";
import { useLocale, useT } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

const NUMS = [1, 2, 3];

/** 決策樹的節點 id：深度 + 目前路徑，唯一決定樹上的位置 */
const keyOf = (depth: number, path: number[]) => `${depth}:${path.join("")}`;

/** 先把整棵決策樹建好：左子樹是「選 nums[depth]」，右子樹是「不選」 */
function buildTree(depth: number, path: number[]): GNode {
  const node: GNode = { id: keyOf(depth, path), label: path.length ? path.join("") : "∅", children: [] };
  if (depth < NUMS.length) {
    node.children.push(buildTree(depth + 1, [...path, NUMS[depth]]));
    node.children.push(buildTree(depth + 1, path));
  }
  return node;
}
const TREE = buildTree(0, []);

const TOTAL = 1 << NUMS.length;

const TEXT = demoText(
  {
    opStart: "開始",
    opEnd: "結束",
    opCollect: (label: string) => `收集 ${label}`,
    opTake: (v: number) => `選 ${v}`,
    opSkip: (v: number) => `不選 ${v}`,
    opUndo: (v: number) => `撤銷 ${v}`,

    nextLevel: (i: number, v: number) => `往下一層決定 nums[${i}] = ${v}`,
    nextBase: (n: number) => `往下一層到 i = ${n}（終止條件）`,
    intro: (n: number) => `對 ${n} 個元素逐一決定「選」或「不選」。每往下一層決定一個元素，走到底就得到一個子集。`,
    collect: (n: number, label: string) =>
      `i = ${n}，${n} 個元素都決定完了，路徑就是一個子集：${label}。複製一份收進答案，然後返回。`,
    choose: (v: number, path: string, next: string) => `做選擇：把 ${v} 放進路徑，路徑變成 ${path}，${next}。`,
    undo: (i: number, v: number, path: string) =>
      `回到決定 nums[${i}] 的這一層，撤銷選擇：把 ${v} 從路徑拿掉，路徑回到 ${path}，和剛進入這一層時一樣。接著試另一條路：不選 ${v}。`,
    skip: (v: number, path: string, next: string) => `不放 ${v}，路徑維持 ${path}，${next}。`,
    finished: (total: number) =>
      `每一層的兩條路都走完，dfs(0) 結束。${total} 個葉節點（綠色）就是 2³ = ${total} 個子集，每個子集恰好出現一次。決策樹有 2ⁿ 個葉，收集每個要複製 O(n)，所以 O(2ⁿ·n)。`,

    right: "nums = [1, 2, 3] · 左邊：選，右邊：不選",
    subTake: (v: number) => `選 ${v}`,
    subSkip: (v: number) => `不選 ${v}`,
    numsTitle: (i: number) => `nums（i = ${i}）`,
    pathTitle: "目前路徑",
    foundTitle: (k: number, total: number) => `已收集的子集（${k}/${total}）`,
    none: "還沒有",
  },
  {
    en: {
      opStart: "Start",
      opEnd: "Done",
      opCollect: (label: string) => `Collect ${label}`,
      opTake: (v: number) => `Take ${v}`,
      opSkip: (v: number) => `Skip ${v}`,
      opUndo: (v: number) => `Undo ${v}`,

      nextLevel: (i: number, v: number) => `go down a level to decide nums[${i}] = ${v}`,
      nextBase: (n: number) => `go down a level to i = ${n}, the base case`,
      intro: (n: number) => `Decide take or skip for each of the ${n} elements in turn. Every level down settles one element, and every path to the bottom yields one subset.`,
      collect: (n: number, label: string) =>
        `i = ${n}: all ${n} elements have been decided, so the path itself is a subset — ${label}. Copy it into the answer and return.`,
      choose: (v: number, path: string, next: string) => `Make the choice: push ${v} onto the path, which becomes ${path}, then ${next}.`,
      undo: (i: number, v: number, path: string) =>
        `Back on the level that decides nums[${i}], undo the choice: drop ${v} from the path, which returns to ${path}, exactly as it was when we entered this level. Now try the other branch: skip ${v}.`,
      skip: (v: number, path: string, next: string) => `Leave ${v} out, so the path stays ${path}, then ${next}.`,
      finished: (total: number) =>
        `Both branches of every level have been explored and dfs(0) returns. The ${total} leaves (green) are the 2³ = ${total} subsets, each appearing exactly once. The decision tree has 2ⁿ leaves and copying each collected subset costs O(n), so the whole enumeration is O(2ⁿ·n).`,

      right: "nums = [1, 2, 3] · left: take, right: skip",
      subTake: (v: number) => `take ${v}`,
      subSkip: (v: number) => `skip ${v}`,
      numsTitle: (i: number) => `nums (i = ${i})`,
      pathTitle: "Current path",
      foundTitle: (k: number, total: number) => `Subsets collected (${k}/${total})`,
      none: "None yet",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

interface Step { desc: string; op: string; i: number; path: number[]; found: string[]; cur: string; done: string[]; fresh?: boolean; end?: boolean }

function buildSteps(t: T): Step[] {
  const steps: Step[] = [];
  const path: number[] = [];
  const found: string[] = [];
  const done: string[] = [];
  const snap = (desc: string, op: string, i: number, fresh = false) =>
    steps.push({ desc, op, i, path: [...path], found: [...found], cur: keyOf(i, path), done: [...done], fresh });
  const show = () => `[${path.join(", ")}]`;
  /** 往下一層要做什麼：還有元素就決定 nums[i+1]，否則到了終止條件 */
  const next = (i: number) =>
    i + 1 < NUMS.length ? t.nextLevel(i + 1, NUMS[i + 1]) : t.nextBase(NUMS.length);

  snap(t.intro(NUMS.length), t.opStart, 0);
  const dfs = (i: number) => {
    if (i === NUMS.length) {
      const label = path.length ? `{${path.join(",")}}` : "∅";
      found.push(label);
      done.push(keyOf(i, path));
      snap(t.collect(NUMS.length, label), t.opCollect(label), i, true);
      return;
    }
    path.push(NUMS[i]);
    snap(t.choose(NUMS[i], show(), next(i)), t.opTake(NUMS[i]), i + 1);
    dfs(i + 1);
    path.pop();
    snap(t.undo(i, NUMS[i], show()), t.opUndo(NUMS[i]), i);
    snap(t.skip(NUMS[i], show(), next(i)), t.opSkip(NUMS[i]), i + 1);
    dfs(i + 1);
    done.push(keyOf(i, path));
  };
  dfs(0);
  steps.push({
    desc: t.finished(TOTAL),
    op: t.opEnd, i: NUMS.length, path: [], found: [...found], cur: "", done: [...done], end: true,
  });
  return steps;
}

export function SubsetsDemo() {
  const t = TEXT[useLocale()];
  const ui = useT();
  const steps = useMemo(() => buildSteps(t), [t]);
  const [k, setK] = useState(0);
  const s = steps[k];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={t.right} />
      <ForestSVG
        roots={[TREE]}
        height={24 + 4 * 52}
        tone={(n, depth) => (s.end ? (depth === NUMS.length ? "green" : "dim") : n.id === s.cur ? (s.fresh ? "green" : "accent") : s.done.includes(n.id) ? "dim" : "none")}
        sub={(n, depth) => (depth === 0 ? "" : n.label.endsWith(String(NUMS[depth - 1])) ? t.subTake(NUMS[depth - 1]) : t.subSkip(NUMS[depth - 1]))}
      />
      <div className="grid grid-cols-1 gap-3.5 border-t border-line p-3.5 md:grid-cols-[auto_auto_minmax(0,1fr)]">
        <div>
          <div className="eyebrow mb-1.5">{t.numsTitle(Math.min(s.i, NUMS.length))}</div>
          <Cells items={NUMS} tone={(i) => (i === s.i ? CELL.accent : i < s.i ? CELL.dim : "")} />
        </div>
        <div>
          <div className="eyebrow mb-1.5">{t.pathTitle}</div>
          <Cells items={s.path} tone={() => CELL.amber} empty={ui.demo.empty} />
        </div>
        <div>
          <div className="eyebrow mb-1.5">{t.foundTitle(s.found.length, TOTAL)}</div>
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
