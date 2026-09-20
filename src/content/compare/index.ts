import type { Comparison } from "@/lib/compare";
import { sorting } from "./sorting";
import { searching } from "./searching";
import { graph } from "./graph";
import { string } from "./string";
import { tree } from "./tree";

import { getSubtopic, TOPICS } from "@/lib/topics";

/** 有比較表的主題。沒列在這裡的主題沒有 /compare 頁。 */
export const COMPARISONS: Record<string, Comparison> = { sorting, searching, graph, string, tree };

/** 建置時檢查：主題存在、每列指到該主題真實的細項、每列的欄位都有值。 */
export function validateComparisons() {
  const problems: string[] = [];
  for (const [topic, cmp] of Object.entries(COMPARISONS)) {
    if (!TOPICS.some((t) => t.id === topic)) problems.push(`主題不存在：${topic}`);
    for (const r of cmp.rows) {
      if (!getSubtopic(topic, r.sub)) problems.push(`細項不存在：${topic}/${r.sub}`);
      for (const c of cmp.columns) if (!(c.key in r.cells)) problems.push(`${topic}/${r.sub} 缺少欄位 ${c.key}`);
    }
  }
  return problems;
}
