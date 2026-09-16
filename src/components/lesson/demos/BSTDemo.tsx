"use client";

import { useMemo, useState } from "react";
import { BinaryTreeSVG, cloneTree, type BNode } from "./tree-utils";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
import { StepHeader, StepFooter } from "./StepBar";

type Op = { kind: "insert" | "search" | "delete"; v: number };
const SCRIPT: Op[] = [
  { kind: "insert", v: 50 }, { kind: "insert", v: 30 }, { kind: "insert", v: 70 }, { kind: "insert", v: 20 },
  { kind: "insert", v: 40 }, { kind: "insert", v: 60 }, { kind: "insert", v: 80 },
  { kind: "search", v: 60 }, { kind: "search", v: 65 }, { kind: "insert", v: 45 }, { kind: "delete", v: 30 },
];

const TEXT = demoText(
  {
    intro: "二元搜尋樹的規則：左子樹全部 < 節點 < 右子樹全部。從空樹開始。",
    emptyRoot: (v: number) => `樹是空的，${v} 成為根。`,
    goLeft: (v: number, cur: number | string) => `${v} < ${cur}，往左。`,
    goRight: (v: number, cur: number | string) => `${v} > ${cur}，往右。`,
    leftFree: (v: number, cur: number | string) => `左邊是空的，${v} 掛在 ${cur} 的左邊。`,
    rightFree: (v: number, cur: number | string) => `右邊是空的，${v} 掛在 ${cur} 的右邊。`,
    hit: (v: number, cur: number | string, cmps: number) => `${v} == ${cur}，找到了。比較了 ${cmps} 次，沒碰過的子樹完全不用看。`,
    compare: (v: number, cur: number | string, left: boolean) => `${v} ${left ? "<" : ">"} ${cur}，往${left ? "左" : "右"}。`,
    miss: (v: number) => `走到空位，${v} 不在樹裡。若要插入，它就會放在這裡。`,
    absent: (v: number) => `${v} 不在樹裡。`,
    twoChildren: (v: number) => `找到 ${v}，它有兩個子節點。不能直接拿掉，要找「中序後繼」：右子樹裡最小的節點。`,
    successor: (succ: number | string) => `右子樹一路往左走到底，後繼是 ${succ}。它一定沒有左子節點。`,
    replaceValue: (succ: number | string, v: number) => `把 ${succ} 的值複製到 ${v} 的位置，再把原本的 ${succ} 節點拿掉。左 < ${succ} < 右 依然成立。`,
    oneChild: (v: number, child: number | string) => `找到 ${v}，它只有一個子節點，直接用子節點 ${child} 取代它。`,
    leaf: (v: number) => `找到 ${v}，它是葉節點，直接用空取代它。`,
    removed: (v: number) => `${v} 已移除。`,
    outro: "腳本結束。插入、搜尋、刪除都只走一條從根到某節點的路徑，成本是樹高 h。",
    opStart: "開始",
    opEnd: "結束",
    script: "插入 50, 30, 70, 20, 40, 60, 80 → 搜尋 60、65 → 插入 45 → 刪除 30",
    emptyTree: "空樹",
  },
  {
    en: {
      intro: "The rule of a binary search tree: everything in the left subtree < the node < everything in the right subtree. We start from an empty tree.",
      emptyRoot: (v: number) => `The tree is empty, so ${v} becomes the root.`,
      goLeft: (v: number, cur: number | string) => `${v} < ${cur}, so go left.`,
      goRight: (v: number, cur: number | string) => `${v} > ${cur}, so go right.`,
      leftFree: (v: number, cur: number | string) => `The left slot is free, so ${v} is attached to the left of ${cur}.`,
      rightFree: (v: number, cur: number | string) => `The right slot is free, so ${v} is attached to the right of ${cur}.`,
      hit: (v: number, cur: number | string, cmps: number) => `${v} == ${cur}, found it. That took ${cmps} comparison${cmps === 1 ? "" : "s"}, and the subtrees we never entered were never looked at.`,
      compare: (v: number, cur: number | string, left: boolean) => `${v} ${left ? "<" : ">"} ${cur}, so go ${left ? "left" : "right"}.`,
      miss: (v: number) => `We reach an empty slot, so ${v} is not in the tree. An insert would put it right here.`,
      absent: (v: number) => `${v} is not in the tree.`,
      twoChildren: (v: number) => `Found ${v}, and it has two children. It cannot simply be cut out, so we look for its in-order successor: the smallest node in its right subtree.`,
      successor: (succ: number | string) => `Going right once and then left as far as possible lands on the successor ${succ}, which can never have a left child.`,
      replaceValue: (succ: number | string, v: number) => `Copy the value ${succ} into the slot where ${v} was, then remove the original ${succ} node. Left < ${succ} < right still holds.`,
      oneChild: (v: number, child: number | string) => `Found ${v}, and it has a single child, so its child ${child} simply takes its place.`,
      leaf: (v: number) => `Found ${v}, and it is a leaf, so it is replaced by nothing at all.`,
      removed: (v: number) => `${v} has been removed.`,
      outro: "That is the end of the script. Insert, search and delete each follow one path from the root down to a node, so each costs the height h of the tree.",
      opStart: "Start",
      opEnd: "Done",
      script: "insert 50, 30, 70, 20, 40, 60, 80 → search 60, 65 → insert 45 → delete 30",
      emptyTree: "Empty tree",
    },
  },
);

type Dict = (typeof TEXT)["zh-Hant"];

interface Step { desc: string; op: string; tree: BNode | null; cmp?: number; hit?: number; path: number[] }

function buildSteps(t: Dict): Step[] {
  const steps: Step[] = [];
  let root: BNode | null = null;
  const path: number[] = [];
  const snap = (desc: string, op: string, extra: Partial<Step> = {}) => steps.push({ desc, op, tree: cloneTree(root), path: [...path], ...extra });

  snap(t.intro, t.opStart);
  for (const op of SCRIPT) {
    const label = `${op.kind}(${op.v})`;
    path.length = 0;
    if (op.kind === "insert") {
      if (!root) { root = { v: op.v }; snap(t.emptyRoot(op.v), label, { hit: op.v }); continue; }
      let cur: BNode = root;
      for (;;) {
        path.push(cur.v as number);
        if (op.v < (cur.v as number)) {
          snap(t.goLeft(op.v, cur.v), label, { cmp: cur.v as number });
          if (!cur.l) { cur.l = { v: op.v }; snap(t.leftFree(op.v, cur.v), label, { hit: op.v }); break; }
          cur = cur.l;
        } else {
          snap(t.goRight(op.v, cur.v), label, { cmp: cur.v as number });
          if (!cur.r) { cur.r = { v: op.v }; snap(t.rightFree(op.v, cur.v), label, { hit: op.v }); break; }
          cur = cur.r;
        }
      }
    } else if (op.kind === "search") {
      let cur: BNode | null | undefined = root;
      let found = false;
      while (cur) {
        path.push(cur.v as number);
        if (op.v === cur.v) { snap(t.hit(op.v, cur.v, path.length), label, { hit: op.v }); found = true; break; }
        const goLeft: boolean = op.v < (cur.v as number);
        snap(t.compare(op.v, cur.v, goLeft), label, { cmp: cur.v as number });
        const next: BNode | null | undefined = goLeft ? cur.l : cur.r;
        cur = next;
      }
      if (!found) snap(t.miss(op.v), label);
    } else {
      // 刪除：找到節點後分三種情況
      let parent: BNode | null = null;
      let cur: BNode | null | undefined = root;
      while (cur && cur.v !== op.v) {
        path.push(cur.v as number);
        parent = cur;
        cur = op.v < (cur.v as number) ? cur.l : cur.r;
      }
      if (!cur) { snap(t.absent(op.v), label); continue; }
      path.push(cur.v as number);
      if (cur.l && cur.r) {
        snap(t.twoChildren(op.v), label, { hit: op.v });
        let sp: BNode = cur;
        let succ: BNode = cur.r;
        while (succ.l) { sp = succ; succ = succ.l; }
        snap(t.successor(succ.v), label, { cmp: succ.v as number, hit: op.v });
        const sv = succ.v;
        if (sp === cur) sp.r = succ.r ?? null; else sp.l = succ.r ?? null;
        cur.v = sv;
        snap(t.replaceValue(sv, op.v), label, { hit: sv as number });
      } else {
        const child = cur.l ?? cur.r ?? null;
        snap(child ? t.oneChild(op.v, child.v) : t.leaf(op.v), label, { hit: op.v });
        if (!parent) root = child; else if (parent.l === cur) parent.l = child; else parent.r = child;
        snap(t.removed(op.v), label);
      }
    }
  }
  snap(t.outro, t.opEnd);
  return steps;
}

export function BSTDemo() {
  const t = TEXT[useLocale()];
  const steps = useMemo(() => buildSteps(t), [t]);
  const [k, setK] = useState(0);
  const s = steps[k];
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={t.script} />
      <BinaryTreeSVG
        root={s.tree}
        tone={(n) => (s.hit === n.v ? "accent" : s.cmp === n.v ? "amber" : s.path.includes(n.v as number) ? "dim" : "none")}
        empty={t.emptyTree}
        height={26 + 4 * 56}
      />
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
