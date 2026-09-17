import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Recursion、Big-O Notation",
  applications: [
    {
      title: "為什麼切一半就變快",
      problem: "把 n 筆資料排序，兩兩比較要 n² 次。有人說「切成兩半各自排，再合起來」會快很多。但切半也要遞迴再切半，合併還要花 n 的時間，到底快在哪？快多少？",
      why: "寫成遞迴式 T(n) = 2T(n/2) + n，Master Theorem 直接告訴你答案是 n log n。它讓你看見關鍵：每一層的合併工作加起來剛好是 n，而層數只有 log n。不用每次都手推遞迴樹。",
    },
    {
      title: "值不值得多切幾份",
      problem: "矩陣乘法切成 4 塊，直覺要做 8 次小乘法。Strassen 想辦法只做 7 次，但多了很多加減法。少一次乘法真的划算嗎？",
      why: "8T(n/2) + n² 是 Θ(n³)，7T(n/2) + n² 是 Θ(n^2.81)。定理告訴你子問題數量 a 決定葉子數 n^(log_b a)，而葉子數在這裡壓倒一切，所以多出來的加減法完全不影響結論。",
    },
    {
      title: "面試時 30 秒內回答複雜度",
      problem: "寫完一個分治或遞迴的解法，面試官問「複雜度多少」。手推遞迴樹又慢又容易錯。",
      why: "記住三種情況：比較 log_b a 和 d。看一眼遞迴式就能報出 O(n log n)、O(n²) 還是 O(log n)，也能解釋為什麼。",
    },
  ],
  cue: "T(n) = aT(n/b) + f(n)、切成幾份、每份縮小幾倍、遞迴樹、分治的複雜度是多少。",
  steps: [
    "從程式碼讀出 `a`（遞迴呼叫幾次）、`b`（每次傳入的大小縮小幾倍）、`d`（遞迴以外的工作是 n 的幾次方）。",
    "算 `log_b a`。a = 1 時是 0，a = b 時是 1，a = b² 時是 2；其他情況用計算機，例如 log₂ 7 ≈ 2.81。",
    "比較 `log_b a` 與 `d`。大於：情況 1，答案 Θ(n^(log_b a))。等於：情況 2，答案 Θ(n^d log n)。小於：情況 3，答案 Θ(n^d)。",
    "用遞迴樹檢查直覺：算第 0 層、第 1 層、第 2 層的工作量，看是在變大、持平還是變小。方向要和你選的情況一致。",
    "若 f(n) 不是純多項式，或子問題大小不均，定理不適用。改畫遞迴樹逐層加總，或猜答案再用歸納法驗證。",
  ],
  demoNote:
    "選一個常見演算法，或自己組合 a、b、d。上方顯示比較與結論，下方是遞迴樹每一層的工作量：情況 1 的長條逐層變長，情況 2 每層一樣長，情況 3 逐層變短。注意根那層和葉子那層各占總量的比例。",
  codeNote:
    "定理本身不是演算法，這裡的程式碼是一個小計算器：輸入 a、b、d 回傳情況與複雜度，再用遞迴樹逐層加總驗證，看 n 加倍時總工作量放大幾倍。",
  problems: [
    { src: "LeetCode 704", name: "Binary Search（T(n) = T(n/2) + 1）", diff: "Easy" },
    { src: "LeetCode 912", name: "Sort an Array（寫合併排序，推 T(n) = 2T(n/2) + n）", diff: "Medium" },
    { src: "LeetCode 50", name: "Pow(x, n)（T(n) = T(n/2) + 1）", diff: "Medium" },
    { src: "LeetCode 241", name: "Different Ways to Add Parentheses（子問題不均，定理不適用）", diff: "Medium" },
    { src: "LeetCode 932", name: "Beautiful Array（T(n) = 2T(n/2) + n）", diff: "Medium" },
    { src: "LeetCode 218", name: "The Skyline Problem（分治版 T(n) = 2T(n/2) + n）", diff: "Hard" },
  ],
};
