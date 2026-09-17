import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Binary Heap、Selection Sort",
  applications: [
    {
      title: "作業系統核心裡的 sort()",
      problem: "Linux 核心開機時要把上千筆例外處理表（exception table）排好，之後還有各種表格要排序。核心堆疊只有 8 KB 到 16 KB，不能放心遞迴；有些場合不方便配置記憶體；要排的內容也不一定受核心控制。",
      why: "堆積排序只用陣列本身，sift down 是迴圈不是遞迴，額外空間 O(1)，而且不管輸入長什麼樣子都是 O(n log n)。快速排序平均較快，但最壞 O(n²) 可以被刻意觸發；合併排序要 O(n) 的暫存。Linux 的 lib/sort.c 選的就是堆積排序。",
    },
    {
      title: "內建排序的保險絲",
      problem: "一個 API 接受使用者上傳 100 萬筆數字再排序。有人摸清了你的快速排序怎麼選 pivot，特地送來讓每次分割都極度不平均的資料，比較次數從約 2,000 萬暴增到約 5,000 億。",
      why: "混合排序平常跑快速排序，一旦發現遞迴層數超過約 2 log n，就把這一段交給堆積排序：它最壞也是 O(n log n)，而且同樣原地，不會丟掉快速排序不用暫存陣列的優勢。.NET 的 Array.Sort 與 Rust 的 sort_unstable 都拿堆積排序當最壞情況的退路。",
    },
    {
      title: "放榜查詢：大多數人只看前幾頁",
      problem: "30 萬名考生的成績要依分數由高到低分頁顯示，每頁 50 名。絕大多數人只看第一、二頁，但沒人知道會不會有人一路翻到最後。",
      why: "先花 O(n) 把成績 heapify 成最大堆積（約 60 萬次比較以內），之後每要一名就取出一次堆頂，約 36 次比較。第一頁總共不到 61 萬次，全部排好則要約 1,000 萬次。真有人翻到最後一頁，也不過是做完一次完整的堆積排序。",
    },
  ],
  cue: "原地排序、O(1) 額外空間、最壞也要 O(n log n)、不能遞迴、怕惡意輸入卡出最壞情況、快速排序的退路、邊排邊取出最大的幾個。",
  steps: [
    "寫 `sift_down(a, i, size)`：在 `i`、`2i + 1`、`2i + 2` 中找最大的，子節點索引要 `< size` 才算存在。最大的是 `i` 就停，否則交換並把 `i` 移到那個子節點，重複。",
    "**建堆**：`i` 從 `n // 2 − 1` 往下到 0，對每個 `i` 呼叫 `sift_down(a, i, n)`。完成後 `a[0]` 是最大值。",
    "**取出**：`end` 從 `n − 1` 往下到 1，交換 `a[0]` 與 `a[end]`，這一輪的最大值落在 `end`，之後不再移動。",
    "對新的根呼叫 `sift_down(a, 0, end)`。此時堆積大小是 `end`，傳 `n` 會把已排好的尾端捲回去。",
    "迴圈結束，陣列由小到大排好。要由大到小就把比較反過來（最小堆積）；只要最大的前 k 個，取出 k 次就停，成本 O(n + k log n)。",
  ],
  demoNote:
    "共用陣列 [5, 2, 9, 1, 7, 3, 8, 4]。上方的樹只畫目前還在堆積裡的部分，節點下方的 [i] 是它在陣列裡的索引；下方是同一份陣列，綠色是已排好的尾端。黃色是正在比較的父子節點，藍色是剛交換的兩格。步驟 1 到 8 是 heapify，建完是 [9, 7, 8, 4, 2, 3, 5, 1]；之後每次取出都是「堆頂換到尾端」一次交換，再讓新的根往下沉，下沉的層數不會超過樹高。",
  codeNote:
    "核心是手寫的 `sift_down` 與兩階段的 `heap_sort`。Python 另外用 `heapq` 寫了一個邊排邊輸出的產生器，對應放榜翻頁的情境：它不是原地的，但示範了只取前 k 個時的 O(n + k log n)。C++ 用標準庫的 `std::make_heap` 與 `std::pop_heap` 重寫同一個演算法，傳入 `std::greater` 就變成由大到小。",
  problems: [
    { src: "LeetCode 506", name: "Relative Ranks（從最大堆積依序取出，第幾個出來就是第幾名）", diff: "Easy" },
    { src: "LeetCode 1636", name: "Sort Array by Increasing Frequency（改寫 sift_down 的比較：先比次數，次數相同時值大的在前）", diff: "Easy" },
    { src: "LeetCode 912", name: "Sort an Array（手寫堆積排序，O(1) 額外空間且最壞 O(n log n)）", diff: "Medium" },
    { src: "LeetCode 215", name: "Kth Largest Element in an Array（heapify 後只取出 k 次，是提早停下的堆積排序）", diff: "Medium" },
    { src: "LeetCode 1962", name: "Remove Stones to Minimize the Total（原地 heapify，反覆修改堆頂再往下沉）", diff: "Medium" },
  ],
};
