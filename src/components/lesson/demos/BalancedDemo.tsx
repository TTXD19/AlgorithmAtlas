"use client";

import { useMemo, useState } from "react";
import { BinaryTreeSVG, cloneTree, treeHeight, type BNode } from "./tree-utils";
import { StepHeader, StepFooter } from "./StepBar";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

const SEQ = [1, 2, 3, 4, 5, 6, 7];

const TEXT = demoText(
  {
    lr: (node: number, child: number) => `節點 ${node} 左重且左子的右邊過高：先左旋 ${child}，再右旋 ${node}（LR）`,
    ll: (node: number) => `節點 ${node} 左邊比右邊高 2：右旋 ${node}（LL）`,
    rl: (node: number, child: number) => `節點 ${node} 右重且右子的左邊過高：先右旋 ${child}，再左旋 ${node}（RL）`,
    rr: (node: number) => `節點 ${node} 右邊比左邊高 2：左旋 ${node}（RR）`,
    logJoin: "；",
    intro: "把 1 到 7 依序插入。左邊是普通 BST，右邊是 AVL 樹。同樣的輸入、同樣的規則，差別只在 AVL 會在失衡時旋轉。",
    insert: (v: number, plainH: number, avl: string) => `插入 ${v}。普通 BST 一直往右長，高度 ${plainH}。AVL ${avl}。`,
    rotated: (log: string, h: number) => `${log}，高度 ${h}`,
    noRotate: (h: number) => `不需要旋轉，高度 ${h}`,
    done: "插完 7 個：普通 BST 退化成鏈，高度 7，搜尋要 7 次比較。AVL 高度 3，搜尋最多 3 次。n 越大差距越大：n = 100 萬時是 100 萬 對 20。",
    headRight: "輸入：1, 2, 3, 4, 5, 6, 7（已排序，最壞情況）",
    plainTitle: "普通 BST",
    avlTitle: "AVL 樹",
    height: (h: number) => `高度 ${h}`,
  },
  {
    en: {
      lr: (node: number, child: number) => `node ${node} is left-heavy and its left child leans right, so rotate ${child} left first and then rotate ${node} right (LR)`,
      ll: (node: number) => `node ${node} is two levels taller on the left, so rotate ${node} right (LL)`,
      rl: (node: number, child: number) => `node ${node} is right-heavy and its right child leans left, so rotate ${child} right first and then rotate ${node} left (RL)`,
      rr: (node: number) => `node ${node} is two levels taller on the right, so rotate ${node} left (RR)`,
      logJoin: "; ",
      intro: "Insert 1 through 7 in order. The plain BST is on the left, the AVL tree on the right. Same input and same rules — the only difference is that the AVL tree rotates whenever it goes out of balance.",
      insert: (v: number, plainH: number, avl: string) => `Insert ${v}. The plain BST keeps growing down its right spine, reaching height ${plainH}. In the AVL tree, ${avl}.`,
      rotated: (log: string, h: number) => `${log}, which brings its height to ${h}`,
      noRotate: (h: number) => `no rotation is needed and the height is ${h}`,
      done: "All seven are in. The plain BST has degenerated into a chain of height 7, so a search costs 7 comparisons. The AVL tree has height 3, so a search costs at most 3. The gap widens as n grows: at n = 1,000,000 it is 1,000,000 against 20.",
      headRight: "Input: 1, 2, 3, 4, 5, 6, 7 (already sorted — the worst case)",
      plainTitle: "Plain BST",
      avlTitle: "AVL tree",
      height: (h: number) => `height ${h}`,
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

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

function avlInsert(t: T, root: BNode | null, v: number, log: string[]): BNode {
  if (!root) return { v };
  if (v < (root.v as number)) root.l = avlInsert(t, root.l ?? null, v, log);
  else root.r = avlInsert(t, root.r ?? null, v, log);
  const b = bal(root);
  if (b > 1) {
    if (v > (root.l!.v as number)) { log.push(t.lr(root.v as number, root.l!.v as number)); root.l = rotL(root.l!); }
    else log.push(t.ll(root.v as number));
    return rotR(root);
  }
  if (b < -1) {
    if (v < (root.r!.v as number)) { log.push(t.rl(root.v as number, root.r!.v as number)); root.r = rotR(root.r!); }
    else log.push(t.rr(root.v as number));
    return rotL(root);
  }
  return root;
}

interface Step { desc: string; v: number | null; plain: BNode | null; avl: BNode | null }

function buildSteps(t: T): Step[] {
  const steps: Step[] = [{ desc: t.intro, v: null, plain: null, avl: null }];
  let plain: BNode | null = null;
  let avl: BNode | null = null;
  for (const v of SEQ) {
    plain = bstInsert(plain, v);
    const log: string[] = [];
    avl = avlInsert(t, avl, v, log);
    steps.push({
      desc: t.insert(v, treeHeight(plain), log.length ? t.rotated(log.join(t.logJoin), treeHeight(avl)) : t.noRotate(treeHeight(avl))),
      v, plain: cloneTree(plain), avl: cloneTree(avl),
    });
  }
  steps.push({ desc: t.done, v: null, plain: cloneTree(plain), avl: cloneTree(avl) });
  return steps;
}

export function BalancedDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const steps = useMemo(() => buildSteps(TEXT[locale]), [locale]);
  const [k, setK] = useState(0);
  const s = steps[k];
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} right={t.headRight} />
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="border-b border-line md:border-r md:border-b-0">
          <div className="flex items-baseline justify-between px-3.5 pt-3">
            <span className="eyebrow">{t.plainTitle}</span>
            <span className="font-mono text-[12px] text-ink-3">{t.height(treeHeight(s.plain))}</span>
          </div>
          <BinaryTreeSVG root={s.plain} width={320} levelH={40} r={14} height={26 + 7 * 40} tone={(n) => (n.v === s.v ? "accent" : "none")} />
        </div>
        <div>
          <div className="flex items-baseline justify-between px-3.5 pt-3">
            <span className="eyebrow">{t.avlTitle}</span>
            <span className="font-mono text-[12px] text-ink-3">{t.height(treeHeight(s.avl))}</span>
          </div>
          <BinaryTreeSVG root={s.avl} width={320} levelH={40} r={14} height={26 + 7 * 40} tone={(n) => (n.v === s.v ? "accent" : "none")} sub={(n) => `b=${bal(n)}`} />
        </div>
      </div>
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
