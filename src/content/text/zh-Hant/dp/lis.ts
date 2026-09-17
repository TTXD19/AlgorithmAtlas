import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "1-D DP、Binary Search",
  applications: [
    {
      title: "股價趨勢：挑出最長的一路上漲",
      problem: "想衡量一檔股票十年（約 2,500 個交易日）的上漲趨勢有多強：從收盤價裡挑出若干天，價格必須一天比一天高，中間的日子可以跳過，最多能挑幾天？全市場 1,800 檔股票每天收盤後都要重算。",
      why: "「可以跳過」代表要的是子序列而不是連續區段，這就是 LIS。O(n²) 的 DP 每檔要比約 300 萬次，全市場超過 50 億次；換成 tails 加二分搜尋，每檔約 2,500 × 12 次比較，全市場幾千萬次就算完。",
    },
    {
      title: "倉儲紙箱套疊：最多能套幾層",
      problem: "倉庫有 3,000 個尺寸各異的紙箱，一個箱子要放進另一個，長和寬都必須嚴格比較小（不能旋轉）。想把最多的箱子一層套一層收起來。",
      why: "兩個維度都要遞增，先依長遞增排序，長相同時寬「遞減」，再對寬求 LIS。遞減那一步讓同樣長的箱子不可能同時被選進一條遞增序列，二維問題就退化成一維，O(n log n) 解決。這就是 Russian Doll Envelopes。",
    },
    {
      title: "書架整理：最少搬動幾本",
      problem: "圖書館一排書架上有 1,200 本書，索書號順序被打亂了。每次可以抽出一本插到任何位置，最少要搬幾本才能排好？",
      why: "沒被搬動的書，彼此的相對順序本來就得是對的，也就是一條遞增子序列；其他的書各搬一次就能插回正確位置。留下的越多、搬的越少，所以答案是 n − LIS。「最少刪除或移動幾個才會有序」的題目幾乎都是這個轉換。",
    },
  ],
  cue: "子序列（可以不連續）、一路遞增、最長鏈、一個套一個、兩個維度都要更大、最少刪除或搬動幾個才有序、n 到 10⁵ 需要 O(n log n)。",
  steps: [
    "確認要的是**子序列**（可跳過）還是連續子陣列、**嚴格遞增**還是允許相等。若是二維（信封、箱子），先依第一維遞增、同值時第二維遞減排序，只留第二維。",
    "n 在幾千以內或需要計數：`dp = [1] * n`，對每個 i 掃所有 `j < i`，`nums[j] < nums[i]` 時 `dp[i] = max(dp[i], dp[j] + 1)`，答案取 `max(dp)`。",
    "要 O(n log n)：開一個空的 `tails`，對每個 `x` 求 `pos = lower_bound(tails, x)`（非遞減改用 upper_bound）。",
    "`pos == len(tails)` 就 append，否則 `tails[pos] = x`。全部處理完，`len(tails)` 就是 LIS 長度。",
    "需要序列本身：tails 改存索引，處理第 i 個元素時記 `parent[i] = tails[pos-1]`（pos 為 0 時是 −1），最後從 tails 的最後一格沿 parent 往回走，再反轉。",
  ],
  demoNote:
    "八天的股價 `[3, 1, 4, 1, 5, 9, 2, 6]`，兩個模式跑同一份資料。「O(n²) DP 表」逐格填 `dp[i]`：藍色是目前的 i，綠色是比它小、可以接在後面的 j，黃色是其中 dp 最大的那個；注意 i = 3 的 1 接不到前面的 1，因為要嚴格遞增。最後一步用綠色標出沿前驅回溯得到的 3 → 4 → 5 → 9。「O(n log n) tails」每個元素先二分搜尋（黃色是找到的位置，黃色虛線 + 代表接在尾端），再取代或 append（藍色）。看最後一步：tails 是 [1, 2, 5, 6]，長度 4 是對的，但「來自」的索引 3、6、4、7 並不遞增，它不是一條真正的子序列。",
  codeNote:
    "四個函式：O(n²) DP（Python 版順便用 `prev` 還原序列，C++ 版只回傳長度）、只求長度的 tails 版、存索引加 `parent` 還原序列的 O(n log n) 版，以及用排序把俄羅斯套娃信封降成一維 LIS。兩種做法都放，是因為 O(n²) 版好理解、能延伸到計數，tails 版才應付得了大資料。範例用的就是互動示範的八天股價，兩個版本還原出的 LIS 不同但一樣長。",
  problems: [
    { src: "LeetCode 300", name: "Longest Increasing Subsequence（兩種做法都寫一次）", diff: "Medium" },
    { src: "LeetCode 334", name: "Increasing Triplet Subsequence（長度只到 3 的 tails）", diff: "Medium" },
    { src: "LeetCode 673", name: "Number of Longest Increasing Subsequence（O(n²) DP 加計數）", diff: "Medium" },
    { src: "LeetCode 354", name: "Russian Doll Envelopes（排序降成一維）", diff: "Hard" },
    { src: "LeetCode 1964", name: "Find the Longest Valid Obstacle Course at Each Position（非遞減用 upper_bound）", diff: "Hard" },
    { src: "LeetCode 1713", name: "Minimum Operations to Make a Subsequence（LCS 轉 LIS）", diff: "Hard" },
  ],
};
