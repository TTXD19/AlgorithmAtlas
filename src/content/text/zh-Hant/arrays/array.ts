import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Big-O Notation",
  applications: [
    {
      title: "為什麼 arr[1000000] 和 arr[0] 一樣快",
      problem: "圖片的像素、音訊的取樣點、資料庫的一列列紀錄，程式最常做的事就是「拿第 i 個」。如果拿第 100 萬個要從頭數過去，什麼都做不了。",
      why: "陣列把元素放在連續的記憶體，第 i 個的位址就是起點 + i × 每格大小。一次乘法加法就到，這是 O(1) 隨機存取。",
    },
    {
      title: "為什麼 list.insert(0, x) 會讓程式變慢",
      problem: "有人寫了一個迴圈，每次都把新資料插到 list 的最前面。資料一萬筆時還好，十萬筆時整個程式卡住。",
      why: "連續記憶體的代價：中間插入要把後面的元素全部往後挪。每次插入 O(n)，n 次就是 O(n²)。知道這點，就知道要改成 append 或用 deque。",
    },
    {
      title: "所有語言的 list / vector / ArrayList",
      problem: "Python 的 list、C++ 的 vector、Java 的 ArrayList、JavaScript 的 array，都是「可以一直 push、不用先講大小」的容器。它們怎麼做到的？",
      why: "動態陣列在固定大小的陣列外面包一層：滿了就換一塊兩倍大的。理解它，就理解為什麼 push 快、insert 慢、以及哪些操作會意外變成 O(n)。",
    },
  ],
  cue: "第 i 個、連續記憶體、隨機存取、尾端加入、中間插入很慢、原地（in-place）修改、雙指標讀寫。",
  steps: [
    "判斷操作發生在**哪個位置**：尾端是 O(1)，其他地方要搬後面的元素，是 O(n)。",
    "要在陣列裡**原地**刪除或搬動元素時，用**讀寫雙指標**：`read` 掃過每一格，符合條件的才寫到 `write` 的位置，最後 `write` 就是新長度。一趟 O(n)，不開新陣列。",
    "需要「把後面 k 個移到前面」這種搬動時，想想能不能用**反轉**拼出來：整個反轉、再分段反轉回來，O(1) 額外空間。",
    "已經知道最後會有幾個元素時，先**預留容量**（`reserve`、`[None] * n`），省掉所有擴容搬移。",
    "迴圈裡出現 `insert(0, x)`、`pop(0)`、`x in list`，就是 O(n²) 的警訊，考慮換 deque 或 set。",
  ],
  demoNote:
    "每一格下方是它的記憶體位址。試著在開頭插入或刪除，看有多少格會變黃（被搬動）；再比較尾端操作只動一格。",
  codeNote: "前半段列出每個常用操作的複雜度，後半段是兩個最經典的原地技巧：讀寫雙指標和三次反轉。",
  problems: [
    { src: "LeetCode 27", name: "Remove Element（讀寫雙指標）", diff: "Easy" },
    { src: "LeetCode 26", name: "Remove Duplicates from Sorted Array", diff: "Easy" },
    { src: "LeetCode 283", name: "Move Zeroes", diff: "Easy" },
    { src: "LeetCode 189", name: "Rotate Array（三次反轉）", diff: "Medium" },
    { src: "LeetCode 238", name: "Product of Array Except Self", diff: "Medium" },
  ],
};
