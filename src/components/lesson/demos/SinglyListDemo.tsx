"use client";

import { useMemo, useState } from "react";
import { useLocale, useT } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

interface State {
  vals: number[];
  /** 這次操作走過的節點（黃） */
  walked: number[];
  /** 新節點（藍）或找到的節點（綠） */
  added: number | null;
  found: number | null;
  cost: number;
  last: string;
}

const TEXT = demoText(
  {
    intro: "5 個節點，每個節點記自己的值和「下一個在哪」。只能從 head 開始一個一個往後走。",
    opPushFront: "開頭插入",
    opPushBack: "尾端插入",
    opInsertAfter2: "在第 2 個之後插入",
    opDelete3: "刪除第 3 個",
    opRead4: "讀取第 4 個",
    opSearch: "查找一個值",
    pushFront: (v: number) => `新節點 ${v} 的 next 指向舊的 head，再把 head 改成指向它。兩個指標動作，O(1)，不用搬任何東西。`,
    pushBack: (n: number, v: number) => `沒有 tail 指標，得從 head 走 ${n} 步找到最後一個節點，再把它的 next 指向新節點 ${v}。O(n)。如果另外維護 tail 指標，就是 O(1)。`,
    insertAfter2: (v: number) => `走 2 步到索引 1 的節點，新節點 ${v} 的 next 指向它原本的 next，再把它的 next 改指向新節點。找位置 O(n)，接上去只要 O(1)。`,
    delete3: (v: number) => `走到索引 1 的節點（被刪節點的前一個），把它的 next 直接跳過 ${v} 指向再下一個。${v} 就從串列消失了，後面的節點一個都不用動。`,
    read4: "陣列一次就到，串列得從 head 沿著 next 走 4 步。沒有「算位址」這回事，因為節點散在記憶體各處。O(n)。",
    search: (v: number, nth: number) => `找 ${v}：從 head 一個一個比對，第 ${nth} 個節點找到。和陣列一樣是 O(n)。`,
    notEnough: "節點不夠。",
    emptyList: "串列是空的。",
    nodesTitle: "節點（值 | next）",
    legendWalked: "走過的節點",
    legendNew: "新節點",
    legendTarget: "目標節點",
    cost: (n: number) => `成本 ${n}`,
  },
  {
    en: {
      intro: "Five nodes, each storing its own value and where the next one is. The only way through is from head, one node at a time.",
      opPushFront: "Insert at head",
      opPushBack: "Insert at tail",
      opInsertAfter2: "Insert after the 2nd",
      opDelete3: "Delete the 3rd",
      opRead4: "Read the 4th",
      opSearch: "Search for a value",
      pushFront: (v: number) => `The new node ${v} points its next at the old head, then head is repointed to it. Two pointer writes, O(1), and nothing has to be moved.`,
      pushBack: (n: number, v: number) => `With no tail pointer, you have to walk ${n} steps from head to reach the last node, then point its next at the new node ${v}. That is O(n). Maintaining a tail pointer as well would make it O(1).`,
      insertAfter2: (v: number) => `Walk 2 steps to the node at index 1. The new node ${v} points its next at that node's old next, and that node's next is repointed at ${v}. Finding the spot is O(n); splicing it in is only O(1).`,
      delete3: (v: number) => `Walk to the node at index 1, the one before the node being removed, and point its next straight past ${v} to the node after it. ${v} is now gone from the list, and not one of the later nodes had to move.`,
      read4: "An array gets there in a single step; a linked list has to follow next from head four times. There is no address arithmetic to do, because the nodes are scattered all over memory. O(n).",
      search: (v: number, nth: number) => `Looking for ${v}: compare one node at a time from head, and it turns up at node number ${nth}. Just like an array, that is O(n).`,
      notEnough: "Not enough nodes.",
      emptyList: "The list is empty.",
      nodesTitle: "Nodes (value | next)",
      legendWalked: "Node walked past",
      legendNew: "New node",
      legendTarget: "Target node",
      cost: (n: number) => `Cost ${n}`,
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

const initial = (t: T): State => ({ vals: [12, 7, 3, 9, 15], walked: [], added: null, found: null, cost: 0, last: t.intro });
const rnd = () => Math.floor(Math.random() * 90) + 10;
const range = (a: number, b: number) => Array.from({ length: Math.max(0, b - a) }, (_, i) => a + i);

const buildOps = (t: T): { label: string; run: (s: State) => State }[] => [
  {
    label: t.opPushFront,
    run: (s) => {
      const v = rnd();
      return { ...s, vals: [v, ...s.vals], walked: [], added: 0, found: null, cost: 1, last: t.pushFront(v) };
    },
  },
  {
    label: t.opPushBack,
    run: (s) => {
      const v = rnd();
      const n = s.vals.length;
      return { ...s, vals: [...s.vals, v], walked: range(0, n), added: n, found: null, cost: n + 1, last: t.pushBack(n, v) };
    },
  },
  {
    label: t.opInsertAfter2,
    run: (s) => {
      const v = rnd();
      const n = s.vals.length;
      if (n < 2) return { ...s, walked: [], added: null, found: null, cost: 0, last: t.notEnough };
      const vals = [...s.vals.slice(0, 2), v, ...s.vals.slice(2)];
      return { ...s, vals, walked: [0, 1], added: 2, found: null, cost: 3, last: t.insertAfter2(v) };
    },
  },
  {
    label: t.opDelete3,
    run: (s) => {
      const n = s.vals.length;
      if (n < 3) return { ...s, walked: [], added: null, found: null, cost: 0, last: t.notEnough };
      const v = s.vals[2];
      return { ...s, vals: [...s.vals.slice(0, 2), ...s.vals.slice(3)], walked: [0, 1], added: null, found: null, cost: 3, last: t.delete3(v) };
    },
  },
  {
    label: t.opRead4,
    run: (s) => {
      const n = s.vals.length;
      if (n < 4) return { ...s, walked: [], added: null, found: null, cost: 0, last: t.notEnough };
      return { ...s, walked: [0, 1, 2], added: null, found: 3, cost: 4, last: t.read4 };
    },
  },
  {
    label: t.opSearch,
    run: (s) => {
      const n = s.vals.length;
      if (!n) return { ...s, walked: [], added: null, found: null, cost: 0, last: t.emptyList };
      const idx = Math.floor(Math.random() * n);
      return { ...s, walked: range(0, idx), added: null, found: idx, cost: idx + 1, last: t.search(s.vals[idx], idx + 1) };
    },
  },
];

const BTN = "h-[30px] cursor-pointer whitespace-nowrap rounded-md border px-3 text-[13px] font-medium";

export function SinglyListDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const ui = useT();
  const init = useMemo(() => initial(TEXT[locale]), [locale]);
  const ops = useMemo(() => buildOps(TEXT[locale]), [locale]);
  const [s, setS] = useState<State>(init);
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        {ops.map((op) => (
          <button key={op.label} type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setS(op.run)}>{op.label}</button>
        ))}
        <button type="button" className={`${BTN} ml-auto border-line bg-surface hover:bg-surface-2`} onClick={() => setS(init)}>{ui.demo.reset}</button>
      </div>

      <div className="overflow-x-auto px-3.5 pt-3.5 pb-3">
        <div className="eyebrow mb-2">{t.nodesTitle}</div>
        <div className="flex items-center gap-0">
          <span className="mr-1.5 rounded-md border border-line-strong bg-surface-2 px-2 py-1 font-mono text-[11.5px] text-ink-2">head</span>
          <Arrow />
          {s.vals.map((v, i) => {
            const tone = s.added === i
              ? "border-accent bg-accent text-accent-ink"
              : s.found === i
                ? "border-green bg-green-soft text-green"
                : s.walked.includes(i)
                  ? "border-amber bg-amber-soft text-amber"
                  : "border-line-strong bg-surface";
            return (
              <span key={i} className="flex items-center">
                <span className={`flex h-9 items-stretch overflow-hidden rounded-md border font-mono text-[13.5px] font-medium ${tone}`}>
                  <span className="grid w-10 place-items-center">{v}</span>
                  <span className="grid w-6 place-items-center border-l border-current/30 text-[11px]">•</span>
                </span>
                <Arrow />
              </span>
            );
          })}
          <span className="rounded-md border border-dashed border-line px-2 py-1 font-mono text-[11.5px] text-ink-3">null</span>
        </div>
        <div className="mt-2.5 flex gap-3 text-[11.5px] text-ink-3">
          <Legend cls="border-amber bg-amber-soft" t={t.legendWalked} />
          <Legend cls="border-accent bg-accent" t={t.legendNew} />
          <Legend cls="border-green bg-green-soft" t={t.legendTarget} />
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-line px-3.5 py-2.5 text-[13.5px]">
        <span className="shrink-0 rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[12px]">{t.cost(s.cost)}</span>
        <span className="flex-1">{s.last}</span>
      </div>
    </div>
  );
}

function Arrow() {
  return <span className="mx-0.5 text-ink-3">→</span>;
}
function Legend({ cls, t }: { cls: string; t: string }) {
  return <span className="flex items-center gap-1"><i className={`inline-block h-2.5 w-2.5 rounded-sm border ${cls}`} />{t}</span>;
}
