import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Queue & Deque、Monotonic Stack、Prefix Sum",
  applications: [
    {
      title: "監控儀表板：過去 60 秒的最大延遲",
      problem: "每秒進來一個數字，隨時要報「最近 60 筆的最大值」。每次重新掃 60 筆是 O(k)，一天八萬六千秒乘上 k，而且 k 常常是幾千。",
      why: "單調佇列讓視窗滑動時，取最大值是 O(1)。每個數字只進出佇列各一次，整體 O(n)，和 k 無關。",
    },
    {
      title: "影像處理的最大值濾波",
      problem: "對圖片每個像素取周圍 k×k 範圍的最大值（膨脹運算）。直接做是 O(n·k²)。",
      why: "先對每一列做一維的滑動視窗最大值，再對每一行做一次，兩次 O(n)。單調佇列是這類「視窗極值」的標準工具。",
    },
    {
      title: "動態規劃的轉移優化",
      problem: "很多 DP 的轉移長這樣：dp[i] = max(dp[j]) + 某個值，其中 j 在 [i−k, i−1] 之間。每個 i 都掃一遍 j 是 O(nk)。",
      why: "「區間內的最大值」隨 i 滑動，正是單調佇列處理的形狀，把轉移壓成 O(1)。這是進階 DP 常見的優化。",
    },
  ],
  cue: "滑動視窗的最大／最小值、固定長度區間的極值、最近 k 個、視窗滑動時極值怎麼更新、DP 轉移的區間 max。",
  steps: [
    "建一個 deque 存**索引**（不是值，才能判斷是否過期）。求最大值時維持值遞減，求最小值時遞增。",
    "對每個 i：**先清尾端**，`while dq and nums[dq[-1]] <= nums[i]: dq.pop()`。用 `<=` 讓相等的舊元素也被淘汰，佇列更短。",
    "把 i 推入尾端。",
    "**再清前端**：`if dq[0] <= i − k: dq.popleft()`。每一輪最多只會過期一個，所以用 if 就夠。",
    "當 `i ≥ k − 1`（視窗滿了），`nums[dq[0]]` 就是這個視窗的答案。",
  ],
  demoNote: "視窗大小 3。每一步先從尾端彈掉比新元素小的（劃掉的），再檢查前端是否過期；綠色是 deque 最前面，也就是目前視窗的最大值。",
  codeNote:
    "滑動視窗最大值與最小值只差一個比較符號；第三段把前綴和和單調佇列組合起來解「和至少為 k 的最短子陣列」，是這個技巧的進階用法。",
  problems: [
    { src: "LeetCode 239", name: "Sliding Window Maximum", diff: "Hard" },
    { src: "LeetCode 1438", name: "Longest Continuous Subarray With Absolute Diff ≤ Limit（同時維護 max 與 min）", diff: "Medium" },
    { src: "LeetCode 862", name: "Shortest Subarray with Sum at Least K", diff: "Hard" },
    { src: "LeetCode 1696", name: "Jump Game VI（DP + 單調佇列）", diff: "Medium" },
    { src: "LeetCode 1425", name: "Constrained Subsequence Sum", diff: "Hard" },
  ],
};
