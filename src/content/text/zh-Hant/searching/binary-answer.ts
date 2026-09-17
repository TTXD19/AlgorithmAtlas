import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Binary Search",
  applications: [
    {
      title: "最少要多快才來得及",
      problem: "Koko 面前有幾堆香蕉，警衛 h 小時後回來。她每小時選一堆吃 k 根（那堆不夠 k 根也算一小時）。k 最小要多少才吃得完？",
      why: "直接算 k 很難，但「給定 k，來不來得及」很好算：每堆算 ⌈pile / k⌉ 加總。而且 k 越大越來得及，可行性是單調的。所以對 k 二分，每次驗證一下，log 次就找到最小的可行 k。",
    },
    {
      title: "貨船最小載重、印表機分工",
      problem: "一批貨要依序在 D 天內運完，船的載重至少要多少？或者把一排工作切給 k 台機器，怎麼切讓最忙的那台最輕鬆？",
      why: "「最小化最大值」是這個技巧的招牌形狀。猜一個上限，貪心地檢查能不能在限制內做完；能就試更小的，不能就試更大的。",
    },
    {
      title: "系統容量規劃",
      problem: "服務要撐住尖峰流量，最少開幾台機器？每個候選數量都要跑一次負載模擬，很貴，不能每個都試。",
      why: "機器越多越撐得住，單調。二分後只需要模擬 log 次，從幾百次降到十次以內。只要「驗證一個答案」比「直接算答案」容易，而且答案單調，就能這樣做。",
    },
  ],
  cue: "最小的可行值、最大的可行值、最小化最大值、最大化最小值、至少要多少才夠、驗證比求解容易。",
  steps: [
    "把問題改寫成判定題：「答案 x 可不可行」。確認 x 越大（或越小）越容易可行，這是**單調性**。",
    "定出答案範圍 `lo`、`hi`，要保證真正的答案在裡面。範圍寬一點只多跑幾輪（寬兩倍才多一輪），但 `feasible` 必須對範圍內每個值都判斷正確：例如貨船載重小於最重的一件時，逐件裝的貪心會誤判成可行，所以下限直接取最重的一件。",
    "寫 `feasible(x)`：通常是一次 O(n) 的貪心或模擬。它是整個演算法的核心，先獨立測試它。",
    "`while lo < hi`：`mid = (lo + hi) // 2`；可行就 `hi = mid`，不可行就 `lo = mid + 1`（找最小可行值）。",
    "迴圈結束 `lo` 就是答案（迴圈不保證驗證過最後剩下的 `lo`，範圍裡可能完全沒有可行值時，要再驗一次 `feasible(lo)`）。找最大可行值時改成 `mid = (lo + hi + 1) // 2`、可行 `lo = mid`、不可行 `hi = mid - 1`。",
  ],
  demoNote:
    "Koko 吃香蕉，五堆、限時 6 小時。上排是候選速度 1 到 30，每試一個就把它標成可行（綠）或不可行（黃），你會看到綠的永遠在右邊。下方是每次驗證的計算：每堆 ⌈pile / k⌉ 相加，和 h 比。",
  codeNote:
    "Koko 吃香蕉與貨船載重是「找最小可行值」，骨架完全一樣，只換 `feasible` 和範圍。第三段切木頭是「找最大可行值」，注意 `mid` 向上取整和更新方向都反過來。",
  problems: [
    { src: "LeetCode 875", name: "Koko Eating Bananas", diff: "Medium" },
    { src: "LeetCode 1011", name: "Capacity To Ship Packages Within D Days", diff: "Medium" },
    { src: "LeetCode 410", name: "Split Array Largest Sum（最小化最大值）", diff: "Hard" },
    { src: "LeetCode 1482", name: "Minimum Number of Days to Make m Bouquets", diff: "Medium" },
    { src: "LeetCode 1552", name: "Magnetic Force Between Two Balls（最大化最小值）", diff: "Medium" },
    { src: "LeetCode 2226", name: "Maximum Candies Allocated to K Children（找最大可行值）", diff: "Medium" },
  ],
};
