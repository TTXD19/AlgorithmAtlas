"use client";

import { useMemo, useState } from "react";
import { BinaryTreeSVG, cloneTree, type BNode } from "./tree-utils";
import { StepHeader, StepFooter } from "./StepBar";

type Op = { kind: "insert" | "search" | "delete"; v: number };
const SCRIPT: Op[] = [
  { kind: "insert", v: 50 }, { kind: "insert", v: 30 }, { kind: "insert", v: 70 }, { kind: "insert", v: 20 },
  { kind: "insert", v: 40 }, { kind: "insert", v: 60 }, { kind: "insert", v: 80 },
  { kind: "search", v: 60 }, { kind: "search", v: 65 }, { kind: "insert", v: 45 }, { kind: "delete", v: 30 },
];

interface Step { desc: string; op: string; tree: BNode | null; cmp?: number; hit?: number; path: number[] }

function buildSteps(): Step[] {
  const steps: Step[] = [];
  let root: BNode | null = null;
  const path: number[] = [];
  const snap = (desc: string, op: string, extra: Partial<Step> = {}) => steps.push({ desc, op, tree: cloneTree(root), path: [...path], ...extra });

  snap("二元搜尋樹的規則：左子樹全部 < 節點 < 右子樹全部。從空樹開始。", "開始");
  for (const op of SCRIPT) {
    const label = `${op.kind}(${op.v})`;
    path.length = 0;
    if (op.kind === "insert") {
      if (!root) { root = { v: op.v }; snap(`樹是空的，${op.v} 成為根。`, label, { hit: op.v }); continue; }
      let cur: BNode = root;
      for (;;) {
        path.push(cur.v as number);
        if (op.v < (cur.v as number)) {
          snap(`${op.v} < ${cur.v}，往左。`, label, { cmp: cur.v as number });
          if (!cur.l) { cur.l = { v: op.v }; snap(`左邊是空的，${op.v} 掛在 ${cur.v} 的左邊。`, label, { hit: op.v }); break; }
          cur = cur.l;
        } else {
          snap(`${op.v} > ${cur.v}，往右。`, label, { cmp: cur.v as number });
          if (!cur.r) { cur.r = { v: op.v }; snap(`右邊是空的，${op.v} 掛在 ${cur.v} 的右邊。`, label, { hit: op.v }); break; }
          cur = cur.r;
        }
      }
    } else if (op.kind === "search") {
      let cur: BNode | null | undefined = root;
      let found = false;
      while (cur) {
        path.push(cur.v as number);
        if (op.v === cur.v) { snap(`${op.v} == ${cur.v}，找到了。比較了 ${path.length} 次，沒碰過的子樹完全不用看。`, label, { hit: op.v }); found = true; break; }
        const goLeft: boolean = op.v < (cur.v as number);
        snap(`${op.v} ${goLeft ? "<" : ">"} ${cur.v}，往${goLeft ? "左" : "右"}。`, label, { cmp: cur.v as number });
        const next: BNode | null | undefined = goLeft ? cur.l : cur.r;
        cur = next;
      }
      if (!found) snap(`走到空位，${op.v} 不在樹裡。若要插入，它就會放在這裡。`, label);
    } else {
      // 刪除：找到節點後分三種情況
      let parent: BNode | null = null;
      let cur: BNode | null | undefined = root;
      while (cur && cur.v !== op.v) {
        path.push(cur.v as number);
        parent = cur;
        cur = op.v < (cur.v as number) ? cur.l : cur.r;
      }
      if (!cur) { snap(`${op.v} 不在樹裡。`, label); continue; }
      path.push(cur.v as number);
      if (cur.l && cur.r) {
        snap(`找到 ${op.v}，它有兩個子節點。不能直接拿掉，要找「中序後繼」：右子樹裡最小的節點。`, label, { hit: op.v });
        let sp: BNode = cur;
        let succ: BNode = cur.r;
        while (succ.l) { sp = succ; succ = succ.l; }
        snap(`右子樹一路往左走到底，後繼是 ${succ.v}。它一定沒有左子節點。`, label, { cmp: succ.v as number, hit: op.v });
        const sv = succ.v;
        if (sp === cur) sp.r = succ.r ?? null; else sp.l = succ.r ?? null;
        cur.v = sv;
        snap(`把 ${sv} 的值複製到 ${op.v} 的位置，再把原本的 ${sv} 節點拿掉。左 < ${sv} < 右 依然成立。`, label, { hit: sv as number });
      } else {
        const child = cur.l ?? cur.r ?? null;
        snap(`找到 ${op.v}，它${child ? "只有一個子節點" : "是葉節點"}，直接用${child ? `子節點 ${child.v}` : "空"}取代它。`, label, { hit: op.v });
        if (!parent) root = child; else if (parent.l === cur) parent.l = child; else parent.r = child;
        snap(`${op.v} 已移除。`, label);
      }
    }
  }
  snap("腳本結束。插入、搜尋、刪除都只走一條從根到某節點的路徑，成本是樹高 h。", "結束");
  return steps;
}

export function BSTDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right="插入 50, 30, 70, 20, 40, 60, 80 → 搜尋 60、65 → 插入 45 → 刪除 30" />
      <BinaryTreeSVG
        root={s.tree}
        tone={(n) => (s.hit === n.v ? "accent" : s.cmp === n.v ? "amber" : s.path.includes(n.v as number) ? "dim" : "none")}
        empty="空樹"
        height={26 + 4 * 56}
      />
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
