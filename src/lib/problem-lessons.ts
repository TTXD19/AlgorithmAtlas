import { SUB_KEYS } from "./topics-text/keys";
import type { LessonText } from "./lesson-model";

/**
 * LeetCode 題號 → 收錄它的課程 key。
 *
 * 從原文課文的 problems 直接掃出來（練習題兩種語言相同），所以永遠跟內容一致，
 * 不需要另外維護一張表。只在 server 端用；93 個模組在建置時載一次。
 */
export async function problemLessonMap(): Promise<Record<number, string[]>> {
  const map: Record<number, string[]> = {};
  await Promise.all(
    SUB_KEYS.map(async (key) => {
      const { text } = (await import(`@/content/text/zh-Hant/${key}.ts`)) as { text: LessonText };
      for (const p of text.problems) {
        const m = /^LeetCode (\d+)$/.exec(p.src);
        if (m) (map[Number(m[1])] ??= []).push(key);
      }
    }),
  );
  // Promise.all 的完成順序不定，排一下讓輸出穩定（建置產物可比對）
  for (const k of Object.keys(map)) map[Number(k)].sort();
  return map;
}
