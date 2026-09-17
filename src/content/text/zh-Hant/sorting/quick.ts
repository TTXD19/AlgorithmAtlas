import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Recursion、Merge Sort",
  applications: [
    {
      title: "電商搜尋結果依價格排序",
      problem: "一次查詢撈出 200 萬件商品，要在記憶體裡依價格由低到高排好再分頁。價格是 double，同價的商品誰先誰後無所謂。",
      why: "快速排序在原陣列上交換，不必像合併排序再開一份 200 萬格的暫存陣列（多 16 MB）；分割是從頭到尾循序掃，對 CPU 快取很友善，常數比其他 O(n log n) 排序小。不要求穩定時，語言內建的排序多半以它為主體，例如 Java 對 double[] 的 Arrays.sort 用的就是雙軸快速排序。",
    },
    {
      title: "監控面板上的 p50 與 p99 延遲",
      problem: "每分鐘收到 120 萬筆 API 回應時間，要算出 p50 和 p99，也就是排序後第 60 萬個與第 118 萬 8 千個位置上的值。全部排好是 O(n log n)，但其他 119 萬多個位置的順序根本用不到。",
      why: "Quick Select 用同樣的分割，但分割完只往答案所在的那一邊走，另一邊整個丟掉。每次切在中間時總共只掃 n + n/2 + n/4 + … ≤ 2n 個元素，隨機選 pivot 下期望仍是 O(n)。C++ 的 std::nth_element 就是這個想法。",
    },
    {
      title: "三千萬筆訂單依狀態分組",
      problem: "訂單只有「待付款、已付款、出貨中、已送達、已取消」五種狀態，要把三千萬筆原地依狀態排好，不想再多開一份陣列。",
      why: "重複值極多時，一般的分割把等於 pivot 的元素全擠到同一邊，最壞會退化成 O(n²)。三路分割一次把「等於 pivot」的整段收在中間、不再遞迴，每往下一層至少少一種狀態，最多五層、每層掃 O(n)，接近線性，而且全程原地。",
    },
  ],
  cue: "原地排序、不要求穩定、平均最快、pivot、分割（partition）、第 k 小／中位數／百分位數、大量重複值用三路分割、語言內建 sort。",
  steps: [
    "範圍 `[lo, hi]` 只剩 0 或 1 個元素（`lo >= hi`）就直接返回。",
    "在 `[lo, hi]` 隨機選一個索引，和 `a[hi]` 交換，讓它當 pivot。",
    "Lomuto 分割：`i = lo − 1`；`j` 從 `lo` 掃到 `hi − 1`，遇到 `a[j] <= pivot` 就 `i += 1` 並交換 `a[i]`、`a[j]`。",
    "掃完交換 `a[i+1]` 與 `a[hi]`，`p = i + 1` 就是 pivot 的最終位置。",
    "處理 `[lo, p−1]` 與 `[p+1, hi]`：較短的一邊遞迴，較長的一邊更新 `lo` 或 `hi` 後回到步驟 1 用迴圈繼續，堆疊深度就不會超過 log n。",
    "資料有大量重複值時改用三路分割（`lt`、`i`、`gt` 三個指標），等於 pivot 的整段不再遞迴；只要第 k 小就用 Quick Select，每次只往 k 所在的那一段繼續。",
  ],
  demoNote:
    "共用陣列 [5, 2, 9, 1, 7, 3, 8, 4]，固定取範圍最後一個元素當 pivot 做 Lomuto 分割（示範不隨機，每次播放才會一樣）。黃色是 pivot，藍色是剛交換的兩格，綠色是已定位的元素，灰色在目前範圍之外；分割進行中，下方會列出 ≤ pivot 區、> pivot 區與還沒看的元素。第一刀以 4 為 pivot 切成 3 個和 4 個，還算平均；之後以 3、5、7 為 pivot 的三次分割，pivot 都剛好是當時範圍裡的極值，範圍每次只縮小 1，這就是退化成 O(n²) 的樣子。",
  codeNote:
    "Lomuto 分割（和示範相同）、隨機 pivot 並只遞迴較短一邊的快速排序、處理大量重複值的三路分割版本，以及用三路分割實作的 Quick Select。兩種分割都列出來，是因為 Lomuto 最好懂，但遇到大量重複值只有三路分割撐得住，Quick Select 也因此選用三路分割。",
  problems: [
    { src: "LeetCode 905", name: "Sort Array By Parity（一次分割：偶數放左、奇數放右）", diff: "Easy" },
    { src: "LeetCode 75", name: "Sort Colors（三路分割，也叫荷蘭國旗問題）", diff: "Medium" },
    { src: "LeetCode 2161", name: "Partition Array According to Given Pivot（要保持原本的相對順序，交換式分割會打亂它）", diff: "Medium" },
    { src: "LeetCode 912", name: "Sort an Array（固定取尾端當 pivot 容易超時，加上隨機與三路分割）", diff: "Medium" },
    { src: "LeetCode 215", name: "Kth Largest Element in an Array（Quick Select，注意大量重複值）", diff: "Medium" },
    { src: "LeetCode 324", name: "Wiggle Sort II（Quick Select 找中位數再三路分割）", diff: "Medium" },
  ],
};
