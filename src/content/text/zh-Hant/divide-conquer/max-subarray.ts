import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Recursion、Prefix Sum",
  applications: [
    {
      title: "股票：哪一段持有期間賺最多",
      problem: "有一年份的每日漲跌。想知道如果只能買一次賣一次，哪一天買、哪一天賣最賺。試每一對買賣日是 O(n²)，250 天還好，十年的分鐘線就撐不住。",
      why: "每日漲跌加起來就是持有期間的獲利，問題變成「連續一段加總最大」。分治把它切半，答案不是在左半、就在右半、不然就跨過中線，O(n log n)。Kadane 再壓到 O(n)。",
    },
    {
      title: "訊號裡最強的那一段",
      problem: "感測器回傳一串數值，扣掉基準線後有正有負。要找出「訊號最集中」的連續時段，也就是加總最大的區間。",
      why: "和股票是同一題。Kadane 一路掃過去，遇到累積變負就重新開始，因為帶著負的前綴只會拖累後面。",
    },
    {
      title: "分治的形狀，之後會再用到",
      problem: "線段樹要支援「任意區間的最大子陣列和」，每次查詢不能重掃整段。",
      why: "分治版合併左右兩半的方式（左半最佳、右半最佳、左後綴加右前綴）正是線段樹節點要存的四個值。這一課先把合併的邏輯練熟，之後就是把它放進樹裡。",
    },
  ],
  cue: "連續子陣列、加總最大、最佳買賣區間、一段最強的訊號、可以切半再合併。",
  steps: [
    "分治：`solve(lo, hi)` 回傳該區間的最大子陣列和。若 `lo == hi`，回傳 `a[lo]`。",
    "取 `mid`，遞迴求 `left = solve(lo, mid)` 與 `right = solve(mid+1, hi)`。",
    "跨中線：從 mid 往左累加，記錄最大值 `bestL`；從 mid+1 往右累加，記錄最大值 `bestR`。跨中線的答案是 `bestL + bestR`。",
    "回傳 `max(left, right, bestL + bestR)`。每層 O(n)，共 log n 層。",
    "Kadane：`cur = max(a[i], cur + a[i])`，`best = max(best, cur)`，從 `a[0]` 開始初始化，一次掃完。",
  ],
  demoNote:
    "八天的漲跌。前半段是分治：遞迴樹上藍色是正在處理的區間，綠色是已解出的；陣列裡黃色是跨中線掃描的範圍，綠色是這一層的答案區間。分治做完後，同一串步驟接著跑 Kadane：陣列裡黃色是 cur 對應的區間，綠色是目前的 best，看它怎麼用兩個變數掃一遍就得到同樣的答案。",
  codeNote: "分治版與 Kadane 版並列，加上一個回傳區間位置的變形，股票題要的「哪天買哪天賣」就是它。",
  problems: [
    { src: "LeetCode 121", name: "Best Time to Buy and Sell Stock（把價格轉成每日漲跌）", diff: "Easy" },
    { src: "LeetCode 53", name: "Maximum Subarray（分治和 Kadane 各寫一次）", diff: "Medium" },
    { src: "LeetCode 152", name: "Maximum Product Subarray（同時追蹤最大與最小）", diff: "Medium" },
    { src: "LeetCode 918", name: "Maximum Sum Circular Subarray（總和減最小子陣列）", diff: "Medium" },
    { src: "LeetCode 1186", name: "Maximum Subarray Sum with One Deletion", diff: "Medium" },
    { src: "LeetCode 363", name: "Max Sum of Rectangle No Larger Than K（二維壓成一維）", diff: "Hard" },
  ],
};
