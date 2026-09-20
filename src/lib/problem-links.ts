import { LEETCODE_SLUGS } from "./leetcode-slugs";

/**
 * 把練習題的 src（"LeetCode 1091"、"CSES 1197"）變成可以點的網址。
 * 認不得的來源回傳 null，元件就只顯示文字。
 */
export function problemUrl(src: string): string | null {
  const m = /^(LeetCode|CSES)\s+(\d+)$/.exec(src.trim());
  if (!m) return null;
  const id = Number(m[2]);
  if (m[1] === "CSES") return `https://cses.fi/problemset/task/${id}`;
  const slug = LEETCODE_SLUGS[id];
  return slug ? `https://leetcode.com/problems/${slug}/` : `https://leetcode.com/problemset/?search=${id}`;
}
