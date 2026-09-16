"use client";

import { useMemo, useState } from "react";
import { useLocale, useT } from "../../LocaleProvider";
import { demoText } from "@/lib/demo-i18n";

const VALS = [1, 2, 3, 4];
const CODE = [
  "def reverse(head):",
  "    prev, cur = None, head",
  "    while cur:",
  "        nxt = cur.next",
  "        cur.next = prev",
  "        prev = cur",
  "        cur = nxt",
  "    return prev",
];

const TEXT = demoText(
  {
    init: "prev 指向 None，cur 指向 head。prev 是「已經反轉好的那段」的頭，一開始是空的。",
    saveNext: (nxt: string) => `先把 cur 的下一個記在 nxt（${nxt}），等一下改掉 cur.next 之後才找得到路。`,
    rewire: (prev: string, cur: number) => `把 cur.next 從指向後面改成指向 prev（${prev}）。節點 ${cur} 的箭頭轉向了。`,
    movePrev: (v: number) => `prev 往前推到 cur。已反轉的那段現在是 ${v} 開頭。`,
    moveCurEnd: "cur 往前推，變成 None，迴圈結束。",
    moveCur: (v: number) => `cur 往前推到 nxt，也就是 ${v}。`,
    ret: (v: number) => `回傳 prev，它就是新的 head（${v}）。每個節點只碰一次，O(n) 時間、O(1) 額外空間。`,
    arrowNote: "箭頭是每個節點的 next：→ 指向右邊、← 指向左邊、∅ 指向 None。綠色代表箭頭已經轉向。",
  },
  {
    en: {
      init: "prev points at None and cur points at head. prev is the head of the part that has already been reversed, and it starts out empty.",
      saveNext: (nxt: string) => `Save cur's next node in nxt (${nxt}) first: once cur.next is overwritten, there is no other way to reach it.`,
      rewire: (prev: string, cur: number) => `Point cur.next at prev (${prev}) instead of at the node after it. The arrow on node ${cur} has flipped.`,
      movePrev: (v: number) => `Move prev forward to cur. The reversed part now starts at ${v}.`,
      moveCurEnd: "cur moves forward to None, so the loop ends.",
      moveCur: (v: number) => `cur moves forward to nxt, which is ${v}.`,
      ret: (v: number) => `Return prev — it is the new head (${v}). Every node is touched exactly once: O(n) time and O(1) extra space.`,
      arrowNote: "Each arrow is that node's next pointer: → points right, ← points left, ∅ points at None. Green means the arrow has already been flipped.",
    },
  },
);

type T = (typeof TEXT)["zh-Hant"];

/** next[i]：節點 i 的 next 指向哪個節點索引，null 表示指向 None */
interface Step { desc: string; line: number; next: (number | null)[]; prev: number | null; cur: number | null; nxt: number | null; done?: boolean }

function buildSteps(t: T): Step[] {
  const n = VALS.length;
  const next: (number | null)[] = VALS.map((_, i) => (i + 1 < n ? i + 1 : null));
  const steps: Step[] = [];
  let prev: number | null = null, cur: number | null = 0, nxt: number | null = null;
  const snap = (desc: string, line: number, done = false) => steps.push({ desc, line, next: [...next], prev, cur, nxt, done });
  snap(t.init, 2);
  while (cur !== null) {
    nxt = next[cur];
    snap(t.saveNext(nxt === null ? "None" : String(VALS[nxt])), 4);
    next[cur] = prev;
    snap(t.rewire(prev === null ? "None" : String(VALS[prev]), VALS[cur]), 5);
    prev = cur;
    snap(t.movePrev(VALS[prev]), 6);
    cur = nxt;
    snap(cur === null ? t.moveCurEnd : t.moveCur(VALS[cur]), 7);
  }
  snap(t.ret(VALS[prev!]), 8, true);
  return steps;
}

const BTN = "h-[30px] cursor-pointer whitespace-nowrap rounded-md border px-3 text-[13px] font-medium disabled:cursor-default disabled:opacity-45";

export function ReverseListDemo() {
  const locale = useLocale();
  const t = TEXT[locale];
  const ui = useT();
  const steps = useMemo(() => buildSteps(TEXT[locale]), [locale]);
  const [k, setK] = useState(0);
  const s = steps[k];

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-line bg-surface-2 px-3.5 py-2.5 text-[13px] text-ink-2">
        <div className="flex gap-1.5">
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setK((x) => Math.max(0, x - 1))} disabled={k === 0}>{ui.demo.prev}</button>
          <button type="button" className={`${BTN} border-accent bg-accent text-accent-ink hover:brightness-110`} onClick={() => setK((x) => Math.min(steps.length - 1, x + 1))} disabled={k === steps.length - 1}>{ui.demo.next}</button>
          <button type="button" className={`${BTN} border-line bg-surface hover:bg-surface-2`} onClick={() => setK(0)}>{ui.demo.reset}</button>
        </div>
        <span className="ml-auto font-mono text-[12px] text-ink-3">1 → 2 → 3 → 4</span>
      </div>

      <div className="overflow-x-auto px-3.5 pt-4 pb-3">
        <div className="flex items-start">
          <div className="flex w-14 flex-col items-center gap-1">
            <span className="rounded-md border border-dashed border-line px-2 py-1 font-mono text-[11.5px] text-ink-3">None</span>
            <Tags s={s} idx={null} />
          </div>
          {VALS.map((v, i) => {
            const nx = s.next[i];
            const arrow = nx === null ? "∅" : nx > i ? "→" : "←";
            const reversed = nx !== null ? nx < i : i === 0;
            return (
              <div key={i} className="flex w-[74px] flex-col items-center gap-1">
                <div className="flex items-center">
                  <span className={`grid h-9 w-10 place-items-center rounded-md border font-mono text-[14px] font-medium ${
                    s.cur === i ? "border-accent bg-accent text-accent-ink" : reversed ? "border-green bg-green-soft text-green" : "border-line-strong bg-surface"
                  }`}>{v}</span>
                  <span className={`w-6 text-center font-mono text-[15px] ${reversed ? "text-green" : "text-ink-3"}`} title={nx === null ? "next = None" : `next = ${VALS[nx]}`}>{arrow}</span>
                </div>
                <Tags s={s} idx={i} />
              </div>
            );
          })}
        </div>
        <p className="mt-1 mb-0 text-[12px] text-ink-3">{t.arrowNote}</p>
      </div>

      <pre className="m-0 overflow-x-auto border-t border-line bg-code-bg px-4 py-3 font-mono text-[13px] leading-[1.7] text-code-ink">
        {CODE.map((line, idx) => (
          <div key={idx} className={`-mx-4 px-4 ${s.line === idx + 1 ? "bg-white/10" : ""}`}>
            <span className="mr-3 inline-block w-4 text-right text-code-cm select-none">{idx + 1}</span>
            {line}
          </div>
        ))}
      </pre>

      <div className="flex items-center gap-3 border-t border-line px-3.5 py-2.5 text-[13.5px]">
        <span className="shrink-0 font-mono text-[12px] text-ink-3">{ui.demo.step} {k}/{steps.length - 1}</span>
        <span className="flex-1">{s.desc}</span>
      </div>
    </div>
  );
}

function Tags({ s, idx }: { s: Step; idx: number | null }) {
  const tags: { t: string; cls: string }[] = [];
  if (s.prev === idx) tags.push({ t: "prev", cls: "bg-green-soft text-green" });
  if (s.cur === idx) tags.push({ t: "cur", cls: "bg-accent text-accent-ink" });
  if (s.nxt === idx && s.line >= 4 && s.line <= 6) tags.push({ t: "nxt", cls: "bg-amber-soft text-amber" });
  return (
    <div className="flex h-5 gap-1">
      {tags.map((x) => <span key={x.t} className={`rounded px-1.5 font-mono text-[10.5px] leading-5 ${x.cls}`}>{x.t}</span>)}
    </div>
  );
}
