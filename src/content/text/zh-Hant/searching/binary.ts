import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Array、Linear Search",
  applications: [
    {
      title: "git bisect：一千個 commit 裡哪一個弄壞了功能",
      problem: "上週還好好的，今天壞了，中間有一千個 commit。一個一個 checkout 再跑測試，一千次。",
      why: "commit 是有順序的，而且「好 → 壞」只會翻轉一次：某個 commit 之前全好、之後全壞。測中間那個，好就往後找、壞就往前找，每次砍掉一半，十次就找到。git bisect 做的就是這件事。",
    },
    {
      title: "版本相容性測試：哪一版開始不支援",
      problem: "套件有 200 個歷史版本，客戶問「最低要哪一版才有這個 API」。",
      why: "「有沒有這個 API」對版本號是單調的：從某一版開始有，之後都有。要找的是「第一個有的版本」，這正是 lower_bound 回答的問題，八次測試就能定位。",
    },
    {
      title: "字典與時間序列查詢",
      problem: "一份依時間排序的 log 有一億筆，要找「10:30 之後的第一筆」；或依字母排序的字典裡找一個字。",
      why: "資料已經排好，每比一次就能扔掉一半。一億筆只要 27 次比較。「第一筆 ≥ 某時間」就是 lower_bound，這也是資料庫索引查範圍的基本動作。",
    },
  ],
  cue: "已排序、單調、第一個滿足條件的位置、最後一個不滿足的位置、log n、砍一半、bisect。",
  steps: [
    "確認資料對你的條件是**單調**的：前半全「否」、後半全「是」。把問題改寫成「找第一個『是』的位置」。",
    "選半開區間：`lo = 0`，`hi = n`。答案範圍是 `0..n`，`n` 代表「全部都是否」。",
    "`while lo < hi`：`mid = (lo + hi) // 2`。",
    "條件成立（`a[mid] ≥ target`）：`hi = mid`，mid 留在區間裡。不成立：`lo = mid + 1`，mid 排除。",
    "迴圈結束時 `lo == hi`，就是答案。要 upper_bound 把 `≥` 改成 `>`；要判斷存在，檢查 `lo < n and a[lo] == target`。",
  ],
  demoNote:
    "陣列裡 8 出現三次。三個模式對同一份資料、同一個目標：「找任一個」用閉區間，找到就停，回傳的是哪一個 8 沒有保證；lower_bound 和 upper_bound 用半開區間，最後 lo 和 hi 會合的位置就是答案。注意 hi 在半開區間裡是「不含」的，所以可以指到陣列外的 n。",
  codeNote:
    "三個函式：經典閉區間版、lower_bound、upper_bound，以及用它們組出「第一次與最後一次出現」。Python 內建 `bisect_left` / `bisect_right`、C++ 的 `std::lower_bound` / `std::upper_bound` 就是這兩個邊界，會自己寫才知道它們回傳什麼。",
  problems: [
    { src: "LeetCode 704", name: "Binary Search", diff: "Easy" },
    { src: "LeetCode 35", name: "Search Insert Position（就是 lower_bound）", diff: "Easy" },
    { src: "LeetCode 278", name: "First Bad Version（git bisect 的題目版）", diff: "Easy" },
    { src: "LeetCode 34", name: "Find First and Last Position of Element in Sorted Array", diff: "Medium" },
    { src: "LeetCode 33", name: "Search in Rotated Sorted Array（判斷哪半邊有序）", diff: "Medium" },
    { src: "LeetCode 162", name: "Find Peak Element（對「上坡／下坡」二分）", diff: "Medium" },
  ],
};
