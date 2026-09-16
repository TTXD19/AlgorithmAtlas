import type { MDXComponents } from "mdx/types";

/**
 * 課文 MDX 的元件對應。
 *
 * 重點是把 markdown 的原生語法對到站上既有的樣式，讓譯者只要寫純文字：
 *   `deque`   → 行內程式碼樣式（原本要手寫 <span className="inl">）
 *   **粗體**  → prose-lesson 裡的強調樣式
 */
const components: MDXComponents = {
  code: ({ children }) => <span className="inl">{children}</span>,
  strong: ({ children }) => <strong>{children}</strong>,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
