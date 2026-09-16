import type { ReactNode } from "react";
import { Code } from "@/components/lesson/parts";

const TOKEN = /(`[^`]+`|\*\*[^*]+\*\*)/g;

/**
 * 極小的行內標記轉換：`code` 與 **bold**。
 *
 * 只支援這兩種是刻意的——實測 93 篇課程的 steps 裡只出現 <Code>（805 次）
 * 與 <strong>（153 次），沒有第三種。支援得更多只會讓譯者有更多方式寫錯。
 */
export function inline(text: string): ReactNode {
  return text.split(TOKEN).map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) return <Code key={i}>{part.slice(1, -1)}</Code>;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    return part;
  });
}
