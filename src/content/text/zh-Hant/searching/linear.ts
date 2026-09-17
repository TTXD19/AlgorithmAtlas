import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Array",
  applications: [
    {
      title: "設定檔裡找一個 key",
      problem: "程式啟動時讀一個幾十行的設定檔，要找某個欄位的值。要不要先建索引、排序、用雜湊表？",
      why: "幾十筆資料從頭看到尾，只要微秒等級的時間。排序或建雜湊表本身就得把每一筆都處理一遍，只找一次的話，建置成本一定比直接掃一遍高。資料小又只找一次，一個一個看就是最快的方法。",
    },
    {
      title: "日誌裡找第一筆錯誤",
      problem: "一份剛寫完的日誌檔，順序是時間，內容沒有任何索引。要找出第一次出現 ERROR 的那一行。",
      why: "資料沒有依你要找的東西排序，也不會重複查很多次。這種情況沒有捷徑，順著掃是唯一的選擇，而且找到就能停。",
    },
    {
      title: "「最近開啟的檔案」清單",
      problem: "手上有一份 5 個元素的「最近用過的檔案」清單，每次開檔都要查它在不在清單裡。要用雜湊表嗎？",
      why: "元素很少時，線性掃描的常數比雜湊小：不用算 hash、記憶體連續、CPU 快取友善。5 個元素最多比 5 次，不值得為它另外維護一個雜湊表，還要保持兩者同步。",
    },
  ],
  cue: "資料無序、資料很小、只查一次、找到就停、不值得先排序或建索引。",
  steps: [
    "從索引 0 開始，`i = 0`。",
    "只要 `i < n`，就比較 `nums[i]` 和目標。相等就回傳 `i`，這是唯一的成功出口。",
    "不相等就 `i += 1`，回到上一步。",
    "`i` 到達 `n`（包括陣列是空的、一開始 `n = 0`）表示全部看過都沒有，回傳 `-1`。",
    "需要「所有符合的位置」時，不要提前回傳，把每個符合的 `i` 收進清單，掃完再回傳。",
  ],
  demoNote:
    "無序的 10 個數字裡找 46，再切換成找不存在的 40，看最壞情況比了幾次。下方表格列出不同 n 時，線性搜尋和二分搜尋最壞要比幾次，二分的前提是資料已經排好。",
  codeNote:
    "基本版、回傳所有符合位置的版本，以及每一輪省一次邊界檢查的哨兵法。三段都是 O(n) 時間，差在回傳什麼和迴圈裡做幾次比較。最後附上語言內建的線性搜尋：Python 的 `in`、`list.index`，C++ 的 `std::find`。",
  problems: [
    { src: "LeetCode 2057", name: "Smallest Index With Equal Value（找第一個，找不到回傳 -1）", diff: "Easy" },
    { src: "LeetCode 2108", name: "Find First Palindromic String in the Array（條件換成函式，找到就停）", diff: "Easy" },
    { src: "LeetCode 2942", name: "Find Words Containing Character（回傳所有符合的位置）", diff: "Easy" },
    { src: "LeetCode 1779", name: "Find Nearest Point That Has the Same X or Y Coordinate", diff: "Easy" },
    { src: "LeetCode 1848", name: "Minimum Distance to the Target Element（從 start 往兩邊找）", diff: "Easy" },
    { src: "LeetCode 1", name: "Two Sum（先對每個數線性搜尋另一半，再想為什麼要換雜湊表）", diff: "Easy" },
  ],
};
