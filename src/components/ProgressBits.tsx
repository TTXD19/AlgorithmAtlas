"use client";

import { TOPICS, lessonKey, type Topic, type Subtopic } from "@/lib/topics";
import { useProgress } from "@/lib/progress";

/** 主題卡片底部的進度條。 */
export function TopicProgress({ topic }: { topic: Topic }) {
  const { isDone } = useProgress();
  const d = topic.subs.filter((s) => isDone(lessonKey(topic.id, s.id))).length;
  const pct = topic.subs.length ? (d / topic.subs.length) * 100 : 0;
  return (
    <div className="mt-auto flex items-center gap-2.5 pt-1.5 text-[12.5px] text-ink-3">
      <div className="h-1 flex-1 overflow-hidden rounded-sm bg-surface-2">
        <i className="block h-full rounded-sm bg-green" style={{ width: `${pct}%` }} />
      </div>
      <span className="tabular-nums">{d}/{topic.subs.length}</span>
    </div>
  );
}

/** 首頁統計裡「你已學會」的數字。 */
export function DoneTotal() {
  const { done } = useProgress();
  return <>{Object.keys(done).length}</>;
}

const LABEL = { ready: "可學習", done: "已學會", draft: "撰寫中" } as const;

/** 細項清單裡的狀態徽章：已學會會覆蓋原本狀態。 */
export function StatusBadge({ topic, sub }: { topic: Topic; sub: Subtopic }) {
  const { isDone } = useProgress();
  const st = isDone(lessonKey(topic.id, sub.id)) ? "done" : sub.state;
  const cls = {
    ready: "bg-accent-soft text-accent font-semibold",
    done: "bg-green-soft text-green font-semibold",
    draft: "bg-surface-2 text-ink-3 font-medium",
  }[st];
  return <span className={`justify-self-start whitespace-nowrap rounded-full px-2.5 py-[3px] text-[12px] ${cls}`}>{LABEL[st]}</span>;
}

/** 課程頁右欄的「標記為已學會」按鈕。 */
export function MarkDone({ lessonId }: { lessonId: string }) {
  const { isDone, toggle } = useProgress();
  const done = isDone(lessonId);
  return (
    <button
      type="button"
      onClick={() => toggle(lessonId)}
      className={`mt-[18px] h-[34px] w-full cursor-pointer rounded-[7px] border text-[13px] font-medium ${
        done ? "border-transparent bg-green-soft text-green" : "border-line bg-surface hover:bg-surface-2"
      }`}
    >
      {done ? "✓ 已學會" : "標記為已學會"}
    </button>
  );
}

export const ALL_TOPICS_COUNT = TOPICS.length;
