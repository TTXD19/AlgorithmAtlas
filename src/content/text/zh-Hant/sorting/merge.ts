import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Recursion、Insertion Sort",
  applications: [
    {
      title: "120 GB 的檔案，機器只有 16 GB 記憶體",
      problem:
        "一份 120 GB 的點擊紀錄要依使用者 ID 排序，整份讀進記憶體根本放不下，任何需要隨機存取整個陣列的排序都用不了。",
      why: "每次讀 10 GB 進來排好、寫成一個有序的暫存檔，得到 12 個；再同時打開這 12 個檔，每個只看最前面那一筆，挑最小的輸出。合併只需要循序讀寫，正好是磁碟最擅長的。Unix 的 sort 指令和資料庫的 ORDER BY 在記憶體不夠時都這樣做，PostgreSQL 查詢計畫裡的 external merge 就是它。",
    },
    {
      title: "後台表格：點一下欄位，同組內的順序不能亂",
      problem:
        "訂單列表有 3 萬筆，已經依下單時間排好。客服點「物流狀態」欄位排序，希望同一個狀態裡的訂單仍然照時間排。",
      why: "合併時兩值相等一律先取左段，左段的元素原本就排在前面，所以相等元素的相對順序永遠不變，這叫穩定。有了穩定排序，多欄位排序只要「先排次要欄位、再排主要欄位」。Python 的 sort、Java 對物件的 Arrays.sort 都用以合併為核心的 TimSort，就是為了保證這一點。",
    },
    {
      title: "公開 API 接受使用者上傳的資料來排序",
      problem:
        "服務接受最多 100 萬筆數字並回傳排序結果。有人刻意構造資料，讓快速排序的 pivot 每次都選到極端值。",
      why: "快速排序最壞退化成 O(n²)，100 萬筆約 5×10¹¹ 次比較，服務直接卡死。合併排序永遠從正中間切，切法和資料內容無關，最壞也只要約 2×10⁷ 次比較，惡意輸入找不到弱點。",
    },
  ],
  cue: "記憶體放不下、外部排序、需要穩定排序、最壞也要 n log n、鏈結串列排序、合併兩段有序、逆序對或「右邊有幾個比我小」。",
  steps: [
    "定義 `sort(lo, hi)`：排好半開區間 `[lo, hi)`。`hi - lo <= 1` 時直接回傳，這是 base case。",
    "`mid = (lo + hi) // 2`，遞迴 `sort(lo, mid)` 與 `sort(mid, hi)`，回來時兩段都已有序。",
    "合併：`i = lo`、`j = mid`，比較 `a[i]` 和 `a[j]`，較小的寫進暫存陣列、那一邊的指標前進。相等時取左邊（`<=`），保持穩定。",
    "其中一段用完後，另一段剩下的本來就有序，整段照抄；最後把暫存陣列的 `[lo, hi)` 寫回原陣列。",
    "暫存陣列在最外層配置一次、所有合併共用，不要每層都建新陣列。",
    "實務上的改進：`a[mid-1] <= a[mid]` 時兩段已接得起來，跳過合併；段長很短（例如十幾個以下）時改用插入排序。不想用遞迴就改成由下而上，段長 1、2、4… 逐輪合併。",
  ],
  demoNote:
    "共用陣列 [5, 2, 9, 1, 7, 3, 8, 4]。四列是遞迴的第 0 到第 3 層：切半時整段往下搬一層，合併時從下一層逐個取回上一層，虛線格代表這個位置的值目前在別層。黃色是合併時左右兩段的指標，藍色是剛放進輸出的位置，綠色是已排好的區段。數一數比較次數：第 2 層四次合併各 1 次、第 1 層兩次各 3 次、第 0 層 7 次，共 17 次，每一層都不超過 n = 8。",
  codeNote:
    "由上而下的遞迴版和由下而上的迭代版共用同一個合併函式。遞迴版直接對應演算法步驟；迭代版不用遞迴，段長 1、2、4… 一輪一輪合併，也正是外部排序一輪輪合併暫存檔的形狀。兩版都只配置一次暫存陣列、用 `<=` 保持穩定；最後用訂單資料示範穩定性，C++ 對照標準庫的 `std::stable_sort`。",
  problems: [
    { src: "LeetCode 2570", name: "Merge Two 2D Arrays by Summing Values（單獨練合併這一步）", diff: "Easy" },
    { src: "LeetCode 912", name: "Sort an Array（由上而下與由下而上各寫一次）", diff: "Medium" },
    { src: "LeetCode 148", name: "Sort List（串列版，由下而上可做到 O(1) 額外空間）", diff: "Medium" },
    { src: "LeetCode 937", name: "Reorder Data in Log Files（依賴穩定排序）", diff: "Medium" },
    { src: "LeetCode 315", name: "Count of Smaller Numbers After Self（合併時順便計數）", diff: "Hard" },
    { src: "LeetCode 493", name: "Reverse Pairs（合併前先用雙指標計數）", diff: "Hard" },
  ],
};
