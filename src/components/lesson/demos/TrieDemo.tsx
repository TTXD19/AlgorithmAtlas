"use client";

import { useMemo, useState } from "react";
import { useLocale } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";
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

const TEXT = demoText(
  {
    sep: "、",
    opStart: "開始",
    opEnd: "結束",
    intro: "字典樹的根是空字串。每往下一層就多一個字元，一條從根到某節點的路徑就是一個前綴。",
    edgeExists: (ch: string, path: string) => `已經有「${ch}」這條邊，沿著走到「${path}」，不用新建。`,
    edgeNew: (ch: string, path: string) => `沒有「${ch}」這條邊，新建節點。前綴「${path}」出現了。`,
    markEnd: (word: string) => `「${word}」的最後一個字元標記為單字結尾（綠色）。`,
    missing: (ch: string, word: string) => `沒有「${ch}」這條邊，「${word}」不存在。`,
    walk: (ch: string, path: string) => `沿著「${ch}」走到「${path}」。`,
    prefixDone: (prefix: string, list: string, len: number) =>
      `走完前綴「${prefix}」，它底下的所有單字就是自動補全的結果：${list}。只花了 ${len} 步到達，和字典裡有幾萬個字無關。`,
    isWord: (word: string) => `走完「${word}」，而且這個節點有結尾標記，「${word}」是一個單字。`,
    notWord: (word: string) => `走完「${word}」，但這個節點沒有結尾標記：「${word}」只是前綴，不是單字。`,
    finished: "每次操作的成本只和字串長度 L 有關，O(L)。代價是空間：共用前綴省記憶體，但每個節點要存子節點表。",
    caption: "插入 car, cat, cart, dog → 前綴 ca → 查單字 ca、cart",
    completions: "補全結果",
  },
  {
    en: {
      sep: ", ",
      opStart: "Start",
      opEnd: "Done",
      intro: "The root of a trie is the empty string. Every level down adds one character, so the path from the root to any node spells out a prefix.",
      edgeExists: (ch: string, path: string) => `The edge for "${ch}" already exists, so follow it down to "${path}" instead of creating anything.`,
      edgeNew: (ch: string, path: string) => `There is no edge for "${ch}", so create a node. The prefix "${path}" now exists.`,
      markEnd: (word: string) => `The last character of "${word}" is marked as the end of a word, shown in green.`,
      missing: (ch: string, word: string) => `There is no edge for "${ch}", so "${word}" is not in the trie.`,
      walk: (ch: string, path: string) => `Follow "${ch}" down to "${path}".`,
      prefixDone: (prefix: string, list: string, len: number) =>
        `We have walked the prefix "${prefix}", and every word beneath this node is an autocomplete result: ${list}. Getting here took only ${len} steps, no matter whether the dictionary holds ten words or tens of thousands.`,
      isWord: (word: string) => `We have walked all of "${word}", and this node carries the end-of-word mark, so "${word}" is a word.`,
      notWord: (word: string) => `We have walked all of "${word}", but this node has no end-of-word mark, so "${word}" is only a prefix, not a word.`,
      finished: "Every operation costs only what the string length L costs, so O(L). The trade-off is space: shared prefixes save memory, but each node still has to store a table of its children.",
      caption: "Insert car, cat, cart, dog → prefix ca → look up ca and cart",
      completions: "Completions",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

interface Step { desc: string; op: string; root: TNode; cur: string; matched: string[]; created?: string }

function buildSteps(t: T): Step[] {
  const steps: Step[] = [];
  const root = mk("");
  const snap = (desc: string, op: string, cur: string, extra: Partial<Step> = {}) => steps.push({ desc, op, root: clone(root), cur, matched: [], ...extra });
  snap(t.intro, t.opStart, "");
  const collect = (n: TNode, pre: string, out: string[]) => { if (n.end) out.push(pre); Object.values(n.kids).forEach((c) => collect(c, pre + c.ch, out)); };

  for (const op of SCRIPT) {
    const label = `${op.kind}("${op.s}")`;
    let n = root; let path = "";
    if (op.kind === "insert") {
      for (const ch of op.s) {
        path += ch;
        if (n.kids[ch]) { n = n.kids[ch]; snap(t.edgeExists(ch, path), label, path); }
        else { n.kids[ch] = mk(ch); n = n.kids[ch]; snap(t.edgeNew(ch, path), label, path, { created: path }); }
      }
      n.end = true;
      snap(t.markEnd(op.s), label, path);
    } else {
      let ok = true;
      for (const ch of op.s) {
        path += ch;
        if (!n.kids[ch]) { ok = false; snap(t.missing(ch, op.s), label, path.slice(0, -1)); break; }
        n = n.kids[ch]; snap(t.walk(ch, path), label, path);
      }
      if (!ok) continue;
      if (op.kind === "prefix") { const out: string[] = []; collect(n, path, out); snap(t.prefixDone(op.s, out.join(t.sep), op.s.length), label, path, { matched: out }); }
      else snap(n.end ? t.isWord(op.s) : t.notWord(op.s), label, path);
    }
  }
  snap(t.finished, t.opEnd, "");
  return steps;
}

function toG(n: TNode, pre: string): GNode {
  return { id: pre || "root", label: n.ch || "·", children: Object.keys(n.kids).sort().map((k) => toG(n.kids[k], pre + k)) };
}
function isEnd(root: TNode, id: string) { let n = root; for (const ch of id === "root" ? "" : id) { n = n.kids[ch]; if (!n) return false; } return n.end; }

export function TrieDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const steps = useMemo(() => buildSteps(TEXT[locale]), [locale]);
  const [k, setK] = useState(0);
  const s = steps[k];
  const g = toG(s.root, "");
  const onPath = (id: string) => id !== "root" && s.cur.startsWith(id);
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <StepHeader k={k} total={steps.length} setK={setK} left={<span className="font-mono text-[12.5px] text-ink">{s.op}</span>} right={t.caption} />
      <ForestSVG
        roots={[g]}
        height={24 + 5 * 52}
        tone={(n) => (n.id === s.created ? "accent" : n.id === s.cur && s.cur ? "accent" : s.matched.includes(n.id) ? "green" : isEnd(s.root, n.id) ? "green" : onPath(n.id) ? "amber" : "none")}
      />
      {s.matched.length > 0 && (
        <div className="border-t border-line px-3.5 py-2 text-[13px]">
          <span className="eyebrow mr-2">{t.completions}</span>
          {s.matched.map((w) => <span key={w} className="mr-1.5 rounded-full bg-green-soft px-2 py-0.5 font-mono text-[12.5px] text-green">{w}</span>)}
        </div>
      )}
      <StepFooter k={k} total={steps.length}>{s.desc}</StepFooter>
    </div>
  );
}
