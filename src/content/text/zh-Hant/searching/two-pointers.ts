import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Array",
  applications: [
    {
      title: "有序名單裡找一對加起來剛好的",
      problem: "一份依金額排序的交易紀錄，要找兩筆加起來等於某個對帳金額。暴力是每一筆配每一筆，n(n−1)/2 對，O(n²)。",
      why: "資料有序就有結構可以用：最小加最大太小，表示最小配誰都不夠，直接淘汰；太大就淘汰最大。一左一右往中間夾，每步淘汰一個，最多 n − 1 步就結束。這是有序配對的標準解法。",
    },
    {
      title: "原地整理：去重、搬移零、過濾",
      problem: "一個排好序的陣列裡有重複，要把重複去掉，而且不能開新陣列（記憶體受限或介面要求原地）。",
      why: "一個指標往前讀，一個指標記「寫到哪了」。讀指標永遠不慢於寫指標，所以覆寫不會弄壞還沒讀的資料。這是同向雙指標，O(n) 時間、O(1) 額外空間。",
    },
    {
      title: "回文判斷、合併兩份有序清單",
      problem: "判斷一個字串正著讀反著讀一樣；或把兩份各自有序的清單合成一份有序的。",
      why: "回文是從兩端往中間比，合併是兩個指標各在一份清單上往前走。它們都是「用兩個位置的關係推進」，不需要巢狀迴圈。",
    },
  ],
  cue: "已排序、配對、兩端往中間、原地修改、O(n²) 的雙迴圈裡兩個索引有單調關係。",
  steps: [
    "對撞指標先問：資料有序嗎？無序而題目允許排序就先排（O(n log n)），不允許就考慮雜湊表。同向指標的搬移零、過濾這類題目不需要有序。",
    "對撞：`l = 0`，`r = n − 1`，`while l < r`。比較 `a[l] + a[r]` 和目標。",
    "太小 `l += 1`，太大 `r −= 1`，相等就是答案。每步問自己：被淘汰的那個，為什麼配任何人都不行？",
    "同向：`w = 0`（或 1），`for r in range(n)`。`a[r]` 該保留就 `a[w] = a[r]; w += 1`。",
    "結束時對撞指標回傳找到的一對或「沒有」，同向指標回傳 `w`，`a[:w]` 是結果。",
  ],
  demoNote:
    "「對撞」模式在有序陣列找兩數之和 25，劃掉的格子是被證明不可能的。「同向」模式原地移除重複，綠色是已寫好的結果、黃色是正在讀的位置，注意 w 永遠不超過 r。",
  codeNote:
    "對撞指標的兩數之和、同向指標的移除重複，以及固定一個數再對撞的三數之和。三數之和的去重是最容易寫錯的地方，看清楚兩處跳過重複的位置。",
  problems: [
    { src: "LeetCode 167", name: "Two Sum II - Input Array Is Sorted", diff: "Medium" },
    { src: "LeetCode 26", name: "Remove Duplicates from Sorted Array", diff: "Easy" },
    { src: "LeetCode 283", name: "Move Zeroes（同向：讀寫指標）", diff: "Easy" },
    { src: "LeetCode 125", name: "Valid Palindrome", diff: "Easy" },
    { src: "LeetCode 15", name: "3Sum", diff: "Medium" },
    { src: "LeetCode 11", name: "Container With Most Water（淘汰矮的那邊）", diff: "Medium" },
  ],
};
