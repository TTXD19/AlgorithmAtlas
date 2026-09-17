import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Hash Table、Traversal",
  applications: [
    {
      title: "搜尋列的自動補全",
      problem: "使用者打了「alg」，要立刻列出所有以 alg 開頭的詞。字典有幾十萬個詞，每次都掃一遍太慢；雜湊表又只能查完整的鍵。",
      why: "字典樹把共用前綴的詞疊在同一條路徑上。走 3 步到達「alg」，它底下的所有葉就是答案，成本和字典大小無關。",
    },
    {
      title: "拼字檢查與敏感詞過濾",
      problem: "一篇文章的每個字都要查「在不在字典裡」，或掃一段文字看有沒有出現任何一個敏感詞。",
      why: "查一個長度 L 的字只要 L 步。多個模式一起比對時，把所有模式建成一棵樹，掃文字時一次對照全部，這是 Aho-Corasick 的基礎。",
    },
    {
      title: "路由器的 IP 查表",
      problem: "路由表有幾十萬條規則，每個封包要找「最長前綴匹配」的那一條，而且每秒要處理百萬個封包。",
      why: "把 IP 當成位元字串放進字典樹，沿著封包的位元往下走，走到最深的有效節點就是最長前綴。這是二元字典樹（radix tree）的經典用途。",
    },
  ],
  cue: "前綴、開頭是、自動補全、多個字串共用前綴、最長前綴匹配、字典。",
  steps: [
    "節點結構：一個子節點表（`dict` 或長度 26 的陣列）加一個 `is_end` 布林。根對應空字串。",
    "**插入**：從根開始，對每個字元，沒有對應的子節點就建一個，然後走過去。最後一個節點標 `is_end = True`。",
    "**查單字**：沿字元走，任何一步走不下去就是不存在；走完還要檢查 `is_end`。**查前綴**：只要走得完就算有。",
    "**自動補全**：先走到前綴的節點，再對那棵子樹做 DFS，遇到 `is_end` 就收集一個字。",
    "字元集固定且小時用陣列存子節點，查得快；否則用雜湊表。字串非常多時考慮壓縮成 radix tree。",
  ],
  demoNote:
    "插入 car、cat、cart、dog，看共用的 c-a 路徑怎麼被重複利用。接著查前綴 ca 做自動補全，再分別查 ca 與 cart 是不是完整的字。綠色節點是有結尾標記的。",
  codeNote: "插入、查單字、查前綴與自動補全。Python 版用 dict 存子節點，C++ 版示範小寫字母用固定陣列的寫法。",
  problems: [
    { src: "LeetCode 208", name: "Implement Trie (Prefix Tree)", diff: "Medium" },
    { src: "LeetCode 211", name: "Design Add and Search Words（含萬用字元的 DFS）", diff: "Medium" },
    { src: "LeetCode 1268", name: "Search Suggestions System（自動補全）", diff: "Medium" },
    { src: "LeetCode 212", name: "Word Search II（字典樹 + 網格回溯）", diff: "Hard" },
    { src: "LeetCode 648", name: "Replace Words（最短前綴）", diff: "Medium" },
  ],
};
