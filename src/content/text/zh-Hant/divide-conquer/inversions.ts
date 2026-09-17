import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Merge Sort、Master Theorem",
  applications: [
    {
      title: "推薦模型的排名準不準",
      problem: "電商的推薦模型替 10 萬個商品排出預測名次，上線一週後有了實際銷售名次。想用一個數字衡量兩份排名有多接近：有幾對商品，模型排的先後和實際相反。兩兩比對要看約 50 億對。",
      why: "把商品依實際名次排好，寫下每個商品的預測名次，意見相反的商品對就是這個序列的逆序對，這就是 Kendall tau 距離。在合併排序的合併步驟順便數，O(n log n)，10 萬個商品只要一百多萬次比較。",
    },
    {
      title: "資料有多亂，決定該用哪種排序",
      problem: "物流中心的掃描紀錄大致依時間到達，偶爾有幾筆延遲。工程師想知道資料「差多少才算排好」，好決定用插入排序還是合併排序。",
      why: "逆序對數正好是把序列排好所需的最少相鄰交換次數，也是插入排序要挪動的次數。先花 O(n log n) 數出來：數字接近 n，插入排序 O(n + 逆序對) 幾乎是線性；數字接近 n²/2，就換合併排序。",
    },
    {
      title: "滑塊拼圖打亂後還有沒有解",
      problem: "手機上的 15 數字推盤遊戲，如果隨便把數字排進格子，有一半的盤面不管怎麼推都拼不回去。遊戲產生題目時必須保證有解。",
      why: "每推一次，數字序列的逆序對奇偶和空格位置會一起以固定的方式改變，所以「逆序對數的奇偶，加上空格所在的列」決定了這盤有沒有解。產生題目時數一次逆序對，不合規則就交換兩個非空格數字，奇偶性就翻過來。",
    },
  ],
  cue: "逆序對、i < j 但 a[i] > a[j]、兩份排名有多不一致、Kendall tau、最少相鄰交換次數、右邊有幾個比我小、排列的奇偶、在合併排序時順便數。",
  steps: [
    "定義 `sort(lo, hi)`：把 `[lo, hi)` 排好，並回傳這個區間內的逆序對數。長度 ≤ 1 時回傳 0。",
    "切半遞迴：`cnt = sort(lo, mid) + sort(mid, hi)`，這是兩半內部的逆序對。",
    "合併：比較 `a[i]` 和 `a[j]`。`a[i] ≤ a[j]` 就取左邊；否則取右邊，並 `cnt += mid − i`。",
    "把合併結果寫回 `[lo, hi)`，回傳 `cnt`。最外層的回傳值就是答案，記得用 64 位元整數。",
    "要每個元素各自的數量，或條件不是單純的大於（例如 `a[i] > 2·a[j]`），就改成排序索引、或在合併前另外用雙指標數。",
  ],
  demoNote:
    "評審 B 給八部作品的名次 [3, 1, 4, 7, 2, 8, 5, 6]，已經依評審 A 的名次排好，所以逆序對就是兩位評審意見相反的作品對數。上方是整個陣列，黃色是正在合併的區段；下方列出左半、右半與合併結果，藍色是下一次要比較的兩個元素，灰色是已經取走的。每當右邊的元素先出來（合併結果裡的綠色），左邊還沒取走的元素會全部變成黃色，一次算進逆序對。最後共 8 對，和暴力兩兩比對一樣，佔全部 28 對的 29%。",
  codeNote:
    "Python 放合併排序版、對照用的暴力版，以及把兩份排名轉成逆序對來算 Kendall tau 距離的應用。C++ 放合併排序版與 Fenwick Tree 版，並用完全反序的 10 萬個數示範答案為什麼一定要 long long。",
  problems: [
    { src: "LeetCode 775", name: "Global and Local Inversions（全部逆序對都必須是相鄰的）", diff: "Medium" },
    { src: "LeetCode 1850", name: "Minimum Adjacent Swaps to Reach the Kth Smallest Number（相鄰交換次數就是逆序對數）", diff: "Medium" },
    { src: "LeetCode 315", name: "Count of Smaller Numbers After Self（每個元素各自數，排序索引）", diff: "Hard" },
    { src: "LeetCode 493", name: "Reverse Pairs（條件是 a[i] > 2·a[j]，合併前先用雙指標數）", diff: "Hard" },
    { src: "LeetCode 327", name: "Count of Range Sum（對前綴和做同樣的合併計數）", diff: "Hard" },
  ],
};
