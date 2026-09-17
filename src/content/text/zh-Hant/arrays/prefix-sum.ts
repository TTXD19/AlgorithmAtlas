import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Array & Dynamic Array",
  applications: [
    {
      title: "報表問「第 1000 天到第 5000 天的營收」",
      problem: "每天一筆營收，老闆隨時會問任意區間的總和，一天問幾百次。每次都從頭加到尾，資料一多就等很久。",
      why: "先花 O(n) 算一次「從第一天累計到每一天」的前綴和，之後任何區間都是兩個累計值相減，O(1)。",
    },
    {
      title: "有幾段連續的交易加起來剛好是 k",
      problem: "找出陣列裡「和等於 k」的連續子陣列有幾個。暴力枚舉所有 (l, r) 是 O(n²)，n 十萬就爆了。",
      why: "區間和 = 兩個前綴和的差。走到位置 j 時，只要問「前面有幾個前綴和等於 P[j] − k」，用雜湊表記次數，整體 O(n)。",
    },
    {
      title: "影像裡任意矩形的亮度總和",
      problem: "積分影像（integral image）是電腦視覺的基本工具：要快速算出圖片任一矩形區域的像素總和，用在人臉偵測、模糊濾鏡。",
      why: "二維前綴和：一次 O(mn) 建表，之後任何矩形的和只要四個值加減，O(1)。",
    },
  ],
  cue: "區間和、連續子陣列的和、多次查詢同一份不變的資料、矩形區域總和、和等於 k。",
  steps: [
    "開一個長度 `n + 1` 的陣列，`P[0] = 0`。",
    "從左到右，`P[i+1] = P[i] + a[i]`。每一步只做一次加法，建表 O(n)。",
    "查 `a[l..r]` 的和：回傳 `P[r+1] − P[l]`。注意右邊界是 r+1，因為 P 的定義「不含」該位置。",
    "題目問「和等於 k 的子陣列」時，改寫成 `P[j] − P[i] = k`，邊掃邊用雜湊表記錄每個前綴和出現幾次，走到 j 就查 `P[j] − k` 出現過幾次。記得先放 `{0: 1}`。",
    "二維時 `S[r+1][c+1] = grid[r][c] + S[r][c+1] + S[r+1][c] − S[r][c]`（容斥：左邊加上面，扣掉重複的左上角），查矩形也是同樣的四項加減。",
  ],
  demoNote: "先按「建表下一步」看 P 怎麼一格一格累加，建好後選 l 和 r，看區間和怎麼從兩個 P 值相減得到。",
  codeNote: "三段：基本的建表與查詢、前綴和加雜湊表數子陣列、二維前綴和。C++ 用 long long 存前綴和，避免累加溢位。",
  problems: [
    { src: "LeetCode 303", name: "Range Sum Query - Immutable", diff: "Easy" },
    { src: "LeetCode 724", name: "Find Pivot Index", diff: "Easy" },
    { src: "LeetCode 560", name: "Subarray Sum Equals K（前綴和 + 雜湊表）", diff: "Medium" },
    { src: "LeetCode 304", name: "Range Sum Query 2D - Immutable", diff: "Medium" },
    { src: "LeetCode 974", name: "Subarray Sums Divisible by K", diff: "Medium" },
  ],
};
