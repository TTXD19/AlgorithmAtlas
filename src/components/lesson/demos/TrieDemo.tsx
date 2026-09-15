"use client";

import { useMemo, useState } from "react";
import { ForestSVG, type GNode } from "./tree-utils";
import { StepHeader, StepFooter } from "./StepBar";

interface TNode { ch: string; end: boolean; kids: Record<string, TNode> }
const mk = (ch: string): TNode => ({ ch, end: false, kids: {} });
const clone = (n: TNode): TNode => ({ ch: n.ch, end: n.end, kids: Object.fromEntries(Object.entries(n.kids).map(([k, v]) => [k, clone(v)])) });

type Op = { kind: "insert" | "prefix" | "word"; s: string };
const SCRIPT: Op[] = [
  { kind: "insert", s: "car" }, { kind: "insert", s: "cat" }, { kind: "insert", s: "cart" }, { kind: "insert", s: "dog" },
  { kind: "prefix", s: "ca" }, { kind: "word", s: "ca" }, { kind: "word", s: "cart" },
];

interface Step { desc: string; op: string; root: TNode; cur: string; matched: string[]; created?: string }

function buildSteps(): Step[] {
  const steps: Step[] = [];
  const root = mk("");
  const snap = (desc: string, op: string, cur: string, extra: Partial<Step> = {}) => steps.push({ desc, op, root: clone(root), cur, matched: [], ...extra });
  snap("字典樹的根是空字串。每往下一層就多一個字元，一條從根到某節點的路徑就是一個前綴。", "開始", "");
  const collect = (n: TNode, pre: string, out: string[]) => { if (n.end) out.push(pre); Object.values(n.kids).forEach((c) => collect(c, pre + c.ch, out)); };

  for (const op of SCRIPT) {
    const label = `${op.kind}("${op.s}")`;
    let n = root; let path = "";
    if (op.kind === "insert") {
      for (const ch of op.s) {
        path += ch;
        if (n.kids[ch]) { n = n.kids[ch]; snap(`已經有「${ch}」這條邊，沿著走到「${path}」，不用新建。`, label, path); }
        else { n.kids[ch] = mk(ch); n = n.kids[ch]; snap(`沒有「${ch}」這條邊，新建節點。前綴「${path}」出現了。`, label, path, { created: path }); }
      }
      n.end = true;
      snap(`「${op.s}」的最後一個字元標記為單字結尾（綠色）。`, label, path);
    } else {
      let ok = true;
      for (const ch of op.s) {
        path += ch;
        if (!n.kids[ch]) { ok = false; snap(`沒有「${ch}」這條邊，「${op.s}」不存在。`, label, path.slice(0, -1)); break; }
        n = n.kids[ch]; snap(`沿著「${ch}」走到「${path}」。`, label, path);
      }
      if (!ok) continue;
      if (op.kind === "prefix") { const out: string[] = []; collect(n, path, out); snap(`走完前綴「${op.s}」，它底下的所有單字就是自動補全的結果：${out.join("、")}。只花了 ${op.s.length} 步到達，和字典裡有幾萬個字無關。`, label, path, { matched: out }); }
      else snap(n.end ? `走完「${op.s}」，而且這個節點有結尾標記，「${op.s}」是一個單字。` : `走完「${op.s}」，但這個節點沒有結尾標記：「${op.s}」只是前綴，不是單字。`, label, path);
    }
  }
  snap("每次操作的成本只和字串長度 L 有關，O(L)。代價是空間：共用前綴省記憶體，但每個節點要存子節點表。", "結束", "");
  return steps;
}

function toG(n: TNode, pre: string): GNode {
  return { id: pre || "root", label: n.ch || "·", children: Object.keys(n.kids).sort().map((k) => toG(n.kids[k], pre + k)) };
}
function isEnd(root: TNode, id: string) { let n = root; for (const ch of id === "root" ? "" : id) { n = n.kids[ch]; if (!n) return false; } return n.end; }

export function TrieDemo() {
  const steps = useMemo(() => buildSteps(), []);
  const [k, setK] = useState(0);
  const s = steps[k];
  const g = toG(s.root, "");
  const onPath = (id: string) => id !== "root" && s.cur.startsWith(id);
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right="插入 car, cat, cart, dog → 前綴 ca → 查單字 ca、cart" />
      <ForestSVG
        roots={[g]}
        height={24 + 5 * 52}
        tone={(n) => (n.id === s.created ? "accent" : n.id === s.cur && s.cur ? "accent" : s.matched.includes(n.id) ? "green" : isEnd(s.root, n.id) ? "green" : onPath(n.id) ? "amber" : "none")}
      />
      {s.matched.length > 0 && (
        <div className="border-t border-line px-3.5 py-2 text-[13px]">
          <span className="eyebrow mr-2">補全結果</span>
          {s.matched.map((w) => <span key={w} className="mr-1.5 rounded-full bg-green-soft px-2 py-0.5 font-mono text-[12.5px] text-green">{w}</span>)}
        </div>
      )}
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
