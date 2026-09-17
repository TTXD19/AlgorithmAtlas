import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Binary Heap、Hash Table",
  applications: [
    {
      title: "首頁的「熱門文章 Top 10」",
      problem: "一千萬篇文章各有閱讀數，每五分鐘要更新一次前十名。全部排序是 O(n log n)，而且你只要十個。",
      why: "維持一個大小為 10 的最小堆積，堆頂就是「入榜門檻」。掃過每篇文章，比門檻小的直接跳過，比門檻大的才換進來。O(n log 10)，幾乎就是掃一遍的成本。",
    },
    {
      title: "推薦系統取前 K 個候選",
      problem: "對每個使用者算出幾十萬個商品的分數，只需要分數最高的 50 個送去下一階段。",
      why: "同樣的 Top-K 堆積。當 K 遠小於 n 時，堆積的記憶體只有 O(K)，適合在資料流上跑，不用把全部分數留在記憶體裡。",
    },
    {
      title: "log 分析：最常出現的 IP",
      problem: "十億行存取紀錄，找出請求最多的前 100 個 IP。",
      why: "先用雜湊表計數，再對 (次數, IP) 做 Top-K。次數的範圍有限時，甚至能用桶排序做到 O(n)，這是這個主題裡值得知道的另一條路。",
    },
  ],
  cue: "前 K 大／小、第 K 大、最常出現的 K 個、離某點最近的 K 個、K 遠小於 n、資料是串流。",
  steps: [
    "確認目標：前 K 大用**最小**堆積，前 K 小用**最大**堆積。若要比的是次數或距離，先算出那個值，堆積裡放 `(值, 元素)` 的 tuple。",
    "逐個掃過元素。堆積還沒滿 K 個就直接 push。",
    "滿了之後，新元素和堆頂比較：**不比堆頂好**就跳過（O(1)），**比堆頂好**就 pop 堆頂再 push 它（Python 用 `heapreplace` 一次做完）。",
    "掃完後堆積裡就是答案。要有序輸出就逐個 pop 再反轉；只要第 K 大就直接看堆頂。",
    "若 K 接近 n、資料不是串流、只跑一次，改用 Quick Select 或直接排序可能更快；要比的是次數時考慮桶排序。",
  ],
  demoNote: "K = 3。逐筆掃過閱讀數，堆頂（黃色）是入榜門檻。留意有多少筆連堆積都不用碰，直接被跳過。",
  codeNote:
    "前 K 大、第 K 大、出現次數前 K 高三種變形，加上桶排序的 O(n) 版本作對照。C++ 另外示範 `nth_element`，那就是標準庫的 Quick Select。",
  problems: [
    { src: "LeetCode 215", name: "Kth Largest Element in an Array（堆積與 Quick Select 各做一次）", diff: "Medium" },
    { src: "LeetCode 347", name: "Top K Frequent Elements（試試桶排序版）", diff: "Medium" },
    { src: "LeetCode 973", name: "K Closest Points to Origin", diff: "Medium" },
    { src: "LeetCode 692", name: "Top K Frequent Words（次數相同時按字典序）", diff: "Medium" },
    { src: "LeetCode 1985", name: "Find the Kth Largest Integer in the Array（字串比較）", diff: "Medium" },
  ],
};
