import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Binary Heap",
  applications: [
    {
      title: "監控儀表板的 p50 延遲",
      problem: "每秒幾千筆請求延遲進來，儀表板要即時顯示中位數。中位數不像平均可以累加，每次重算要先排序，O(n log n)。",
      why: "把資料分成「較小的一半」和「較大的一半」，各用一個堆積管理。中位數永遠是兩個堆頂之一或它們的平均，新資料進來只要 O(log n) 調整。",
    },
    {
      title: "有門檻的排程：IPO 問題",
      problem: "手上有一筆資本，每個專案需要一定資本才能啟動，做完能賺利潤。最多做 K 個，怎麼讓最後資本最多？",
      why: "一個堆積按「需要的資本」排，負責解鎖目前做得起的專案；另一個按「利潤」排，負責從解鎖的裡面挑最賺的。兩個堆積各管一個維度，這是雙堆積的另一種形狀。",
    },
    {
      title: "滑動視窗中位數",
      problem: "股價的過去 30 天中位數，每天往前滑一格。除了加入新資料，還要移除舊資料。",
      why: "同樣兩個堆積，加上「延遲刪除」：被移除的元素先記在雜湊表裡，等它浮到堆頂時再真正丟掉。這是資料流中位數的進階版。",
    },
  ],
  cue: "中位數、資料流、一半一半、兩個維度各自排序、既要最大又要最小。",
  steps: [
    "準備 `low`（最大堆積）與 `high`（最小堆積）。Python 沒有最大堆積，`low` 存負值。",
    "新元素 x：若 `low` 是空的或 `x ≤ max(low)`，推入 `low`；否則推入 `high`。這一步維持「左半 ≤ 右半」。",
    "重新平衡：若 `len(low) > len(high) + 1`，把 `low` 的堆頂搬到 `high`；若 `len(high) > len(low)`，把 `high` 的堆頂搬到 `low`。",
    "查中位數：`low` 較多時回傳 `max(low)`；一樣多時回傳 `(max(low) + min(high)) / 2`。",
    "需要移除舊元素（滑動視窗）時，用雜湊表記下「待刪除」，等該元素浮到堆頂再真的 pop，並在計算大小時扣掉待刪除的數量。",
  ],
  demoNote: "八筆延遲資料依序進來。留意每一筆做了幾件事：先決定進哪邊，必要時搬一個過去，然後中位數直接從堆頂讀出。",
  codeNote: "資料流中位數的完整實作，加上 IPO 問題示範「兩個堆積各管一個維度」的另一種用法。",
  problems: [
    { src: "LeetCode 295", name: "Find Median from Data Stream", diff: "Hard" },
    { src: "LeetCode 502", name: "IPO", diff: "Hard" },
    { src: "LeetCode 480", name: "Sliding Window Median（延遲刪除）", diff: "Hard" },
    { src: "LeetCode 253", name: "Meeting Rooms II（一個堆積管結束時間）", diff: "Medium" },
    { src: "LeetCode 1825", name: "Finding MK Average", diff: "Hard" },
  ],
};
