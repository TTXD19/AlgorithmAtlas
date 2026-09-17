import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Singly Linked List、Fast & Slow Pointers、Recursion",
  applications: [
    {
      title: "合併多個已排序的日誌檔",
      problem: "每台伺服器的 log 各自依時間排好，要合成一份總的時間序。把全部倒進陣列再排序是 O(N log N)，而且要先讀進記憶體。",
      why: "每條都有序，只要反覆比較各條的「目前最前面那筆」、取最小的。兩條是 O(n + m)，k 條用堆積是 O(N log k)，而且可以串流處理。這是外部排序與 log 聚合系統的核心。",
    },
    {
      title: "合併排序的最後一步",
      problem: "合併排序把資料切成兩半各自排好，最後要「把兩段有序的合成一段」。在串列上做這件事不用額外空間。",
      why: "串列的合併只改指標、不搬資料，所以串列版合併排序是 O(n log n) 時間、O(log n) 空間，比陣列版省。LeetCode 148 Sort List 就是這題。",
    },
    {
      title: "資料庫的 merge join",
      problem: "兩張表都依 join key 排好序，要找出 key 相同的配對。",
      why: "同樣是雙指標同時往前走：誰小誰前進，相等就輸出。和合併串列是同一個骨架，只是「輸出」的動作不同。",
    },
  ],
  cue: "兩條（或 k 條）已排序、合併、取最小的那個、合併排序、dummy + tail、多路歸併。",
  steps: [
    "建 `dummy`，`tail = dummy`。dummy 讓第一個節點的接法和後面的一樣。",
    "`while a and b`：比較 `a.val` 和 `b.val`，把較小的接到 `tail.next`，那條串列的指標前進，`tail = tail.next`。相等時取 a，結果才是穩定的。",
    "迴圈結束後 `tail.next = a or b`，把還沒用完的那條整段接上。",
    "回傳 `dummy.next`，不是 dummy。",
    "k 條時把每條的頭放進最小堆積（Python 要加索引當 tie-breaker），每次 pop 最小的接上，再 push 它的 next。",
  ],
  demoNote:
    "逐步看兩條串列怎麼合併：每一步比較兩個頭，較小的接到結果尾端；一條用完後，另一條剩下的整段直接接上。",
  codeNote: "迭代版與遞迴版合併兩條、用堆積合併 k 條、以及把合併當零件的串列版合併排序。",
  problems: [
    { src: "LeetCode 21", name: "Merge Two Sorted Lists", diff: "Easy" },
    { src: "LeetCode 88", name: "Merge Sorted Array（陣列版，從後面往前填）", diff: "Easy" },
    { src: "LeetCode 148", name: "Sort List（串列版合併排序）", diff: "Medium" },
    { src: "LeetCode 23", name: "Merge k Sorted Lists（堆積）", diff: "Hard" },
    { src: "LeetCode 2", name: "Add Two Numbers（雙指標同時走的變形）", diff: "Medium" },
  ],
};
