import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Recursion",
  applications: [
    {
      title: "資料夾、DOM、JSON 都是樹",
      problem: "資料夾裡有資料夾，HTML 標籤裡有標籤，JSON 物件裡有物件。這些東西沒有固定深度，也不能用陣列的索引描述「誰在誰底下」。",
      why: "樹是表達「階層」最自然的結構。先在最簡單的二元樹上把深度、高度、葉節點、子樹這些詞學會，之後所有樹狀資料都用同一套語言描述。",
    },
    {
      title: "堆積為什麼可以用陣列存",
      problem: "上一個主題的堆積用陣列存，索引 i 的子節點在 2i+1 與 2i+2。這個關係從哪來？",
      why: "那是完全二元樹的性質：每層填滿才往下、同層由左往右，層序編號就沒有空洞。理解這點，就知道為什麼一般的樹不能這樣存。",
    },
    {
      title: "面試的樹題全部從這裡開始",
      problem: "求樹高、數節點、判斷是不是平衡、找最深的葉：LeetCode 上幾十題都是同一個形狀。",
      why: "它們都是「對左右子樹遞迴，再用兩個結果組合出自己的答案」。這個模式在這篇先練熟，後面的走訪、BST、樹上 DP 都是它的延伸。",
    },
  ],
  cue: "階層、巢狀、父與子、深度、高度、葉節點、左右子樹、完全二元樹。",
  steps: [
    "對樹的問題，先問：**空樹的答案是什麼**？高度是 −1、大小是 0、總和是 0。這是遞迴的 base case。",
    "假設左子樹和右子樹的答案已經算好（分別叫 L 和 R），**自己的答案怎麼由 L、R 和自己的值組合出來**？高度是 1 + max(L, R)，大小是 1 + L + R。",
    "寫成函式：先處理空樹，再遞迴左右，最後組合。這三行就是絕大多數樹題的骨架。",
    "估複雜度：每個節點恰好被拜訪一次，O(n) 時間；遞迴深度等於樹高，O(h) 空間。",
    "要建測試用的樹時，用層序陣列配合 `2i + 1`、`2i + 2` 建，這也是 LeetCode 的輸入格式。",
  ],
  demoNote: "點任一個節點，右邊顯示它的深度、高度、子樹大小，下方的陣列會標出它在層序表示裡的位置，以及父與子的索引怎麼算。",
  codeNote: "節點的定義、三個最基本的遞迴函式，以及從層序陣列建樹的方法。注意高度的 base case 是 −1，這樣葉的高度才會是 0。",
  problems: [
    { src: "LeetCode 104", name: "Maximum Depth of Binary Tree", diff: "Easy" },
    { src: "LeetCode 222", name: "Count Complete Tree Nodes（利用完全二元樹性質做到 O(log² n)）", diff: "Easy" },
    { src: "LeetCode 110", name: "Balanced Binary Tree", diff: "Easy" },
    { src: "LeetCode 543", name: "Diameter of Binary Tree", diff: "Easy" },
    { src: "LeetCode 226", name: "Invert Binary Tree", diff: "Easy" },
    { src: "LeetCode 100", name: "Same Tree", diff: "Easy" },
  ],
};
