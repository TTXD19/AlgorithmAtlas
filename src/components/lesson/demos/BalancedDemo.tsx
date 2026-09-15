"use client";

import { useMemo, useState } from "react";
import { BinaryTreeSVG, cloneTree, treeHeight, type BNode } from "./tree-utils";
import { StepHeader, StepFooter } from "./StepBar";

const SEQ = [1, 2, 3, 4, 5, 6, 7];

/* ---------- 普通 BST 插入 ---------- */
function bstInsert(root: BNode | null, v: number): BNode {
  if (!root) return { v };
  if (v < (root.v as number)) root.l = bstInsert(root.l ?? null, v);
  else root.r = bstInsert(root.r ?? null, v);
  return root;
}

/* ---------- AVL 插入（含旋轉，記錄發生了什麼） ---------- */
const h = (n: BNode | null | undefined) => treeHeight(n);
const bal = (n: BNode) => h(n.l) - h(n.r);
function rotR(y: BNode): BNode { const x = y.l!; y.l = x.r ?? null; x.r = y; return x; }
function rotL(x: BNode): BNode { const y = x.r!; x.r = y.l ?? null; y.l = x; return y; }

function avlInsert(root: BNode | null, v: number, log: string[]): BNode {
  if (!root) return { v };
  if (v < (root.v as number)) root.l = avlInsert(root.l ?? null, v, log);
  else root.r = avlInsert(root.r ?? null, v, log);
  const b = bal(root);
  if (b > 1) {
    if (v > (root.l!.v as number)) { log.push(`節點 ${root.v} 左重且左子的右邊過高：先左旋 ${root.l!.v}，再右旋 ${root.v}（LR）`); root.l = rotL(root.l!); }
    else log.push(`節點 ${root.v} 左邊比右邊高 2：右旋 ${root.v}（LL）`);
    return rotR(root);
  }
  if (b < -1) {
    if (v < (root.r!.v as number)) { log.push(`節點 ${root.v} 右重且右子的左邊過高：先右旋 ${root.r!.v}，再左旋 ${root.v}（RL）`); root.r = rotR(root.r!); }
    else log.push(`節點 ${root.v} 右邊比左邊高 2：左旋 ${root.v}（RR）`);
    return rotL(root);
  }
  return root;
}

interface Step { desc: string; v: number | null; plain: BNode | null; avl: BNode | null }

function buildSteps(): Step[] {
  const steps: Step[] = [{ desc: "把 1 到 7 依序插入。左邊是普通 BST，右邊是 AVL 樹。同樣的輸入、同樣的規則，差別只在 AVL 會在失衡時旋轉。", v: null, plain: null, avl: null }];
  let plain: BNode | null = null;
  let avl: BNode | null = null;
  for (const v of SEQ) {
    plain = bstInsert(plain, v);
    const log: string[] = [];
    avl = avlInsert(avl, v, log);
    steps.push({
      desc: `插入 ${v}。普通 BST 一直往右長，高度 ${treeHeight(plain)}。AVL ${log.length ? log.join("；") + `，高度 ${treeHeight(avl)}` : `不需要旋轉，高度 ${treeHeight(avl)}`}。`,
      v, plain: cloneTree(plain), avl: cloneTree(avl),
    });
  }
  steps.push({ desc: `插完 7 個：普通 BST 退化成鏈，高度 7，搜尋要 7 次比較。AVL 高度 3，搜尋最多 3 次。n 越大差距越大：n = 100 萬時是 100 萬 對 20。`, v: null, plain: cloneTree(plain), avl: cloneTree(avl) });
  return steps;
}

export function BalancedDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} right="輸入：1, 2, 3, 4, 5, 6, 7（已排序，最壞情況）" />
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="border-b border-line md:border-r md:border-b-0">
          <div className="flex items-baseline justify-between px-3.5 pt-3">
            <span className="eyebrow">普通 BST</span>
            <span className="font-mono text-[12px] text-ink-3">高度 {treeHeight(s.plain)}</span>
          </div>
          <BinaryTreeSVG root={s.plain} width={320} levelH={40} r={14} height={26 + 7 * 40} tone={(n) => (n.v === s.v ? "accent" : "none")} />
        </div>
        <div>
          <div className="flex items-baseline justify-between px-3.5 pt-3">
            <span className="eyebrow">AVL 樹</span>
            <span className="font-mono text-[12px] text-ink-3">高度 {treeHeight(s.avl)}</span>
          </div>
          <BinaryTreeSVG root={s.avl} width={320} levelH={40} r={14} height={26 + 7 * 40} tone={(n) => (n.v === s.v ? "accent" : "none")} sub={(n) => `b=${bal(n)}`} />
        </div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
