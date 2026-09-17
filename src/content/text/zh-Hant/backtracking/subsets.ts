import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Recursion",
  applications: [
    {
      title: "功能開關的組合測試",
      problem: "系統有 5 個功能開關（深色模式、新結帳流程、實驗性搜尋……），QA 要確認任何一種開關組合都不會互相打架。每個開關可開可關，總共有幾種情況、要怎麼一個不漏地列出來？",
      why: "每個開關「開或關」就是每個元素「選或不選」。逐一決定每個開關，決定完就是一種組合，回頭改上一個決定再往下走，2⁵ = 32 種組合一個不漏、一個不重。",
    },
    {
      title: "選幾樣配菜的所有套餐",
      problem: "便當店有 4 種配菜可以任選，菜單要列出所有可能的套餐（含不選任何配菜）。老闆手寫漏了兩種，客人來問才發現。",
      why: "手寫會漏是因為沒有系統性的順序。子集列舉給的就是一個順序：第一樣選不選、第二樣選不選……走到底就是一份套餐，2⁴ = 16 種保證完整。",
    },
    {
      title: "從一堆數字裡找出總和等於目標的組合",
      problem: "報帳時只知道總金額是 1,250 元，發票有 8 張，要找出哪幾張加起來剛好是這個數。",
      why: "8 張發票的每個子集都算一次總和就好，2⁸ = 256 種完全跑得動。子集列舉是這類「試遍所有組合」問題的地基，之後的組合、剪枝都從它長出來。",
    },
  ],
  cue: "所有組合、任選幾個、每個可以要或不要、冪集、開關的每種狀態、n 很小（≤ 20）而要列出全部。",
  steps: [
    "準備 `ans`（答案）與 `path`（目前路徑），寫 `dfs(i)` 表示「正在決定第 i 個元素」。",
    "終止條件：`i == len(nums)`，所有元素都決定了，把 `path` **複製一份**放進 `ans`。",
    "做選擇：`path.append(nums[i])`，遞迴 `dfs(i + 1)`。",
    "撤銷選擇：`path.pop()`，讓 `path` 回到進入這一層時的樣子。",
    "走另一條路：不放 nums[i]，直接 `dfs(i + 1)`。兩條路都走完，這一層結束，回到上一層。",
  ],
  demoNote:
    "[1, 2, 3] 的決策樹。樹上每個節點寫著目前的路徑，左邊分支是「選」、右邊是「不選」。留意每次撤銷後路徑會退回剛進入那一層時的樣子，8 個葉節點正好是 8 個子集。",
  codeNote: "三個版本：選或不選的標準寫法、用 start 的寫法（每個節點都是子集），以及處理重複元素的版本。",
  problems: [
    { src: "LeetCode 78", name: "Subsets", diff: "Medium" },
    { src: "LeetCode 90", name: "Subsets II（排序後同層跳過重複）", diff: "Medium" },
    { src: "LeetCode 784", name: "Letter Case Permutation（每個字母選大寫或小寫）", diff: "Medium" },
    { src: "LeetCode 1863", name: "Sum of All Subset XOR Totals", diff: "Easy" },
    { src: "LeetCode 2044", name: "Count Number of Maximum Bitwise-OR Subsets", diff: "Medium" },
    { src: "LeetCode 698", name: "Partition to K Equal Sum Subsets（每個數字決定放進哪個子集，加剪枝）", diff: "Medium" },
  ],
};
