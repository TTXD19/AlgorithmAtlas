import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Singly Linked List",
  applications: [
    {
      title: "垃圾回收與資料結構裡的循環參照",
      problem: "物件 A 指向 B、B 指向 C、C 又指回 A。要偵測這種環，最直覺的方法是把走過的節點記在 set 裡，但那要 O(n) 的額外記憶體。",
      why: "一快一慢兩個指標在同一條路上跑：沒有環，快的先到終點；有環，快的在環裡繞，遲早從後面追上慢的。O(1) 空間。這是 Floyd 判圈演算法。",
    },
    {
      title: "只掃一遍就找到中點",
      problem: "要把串列切成兩半（合併排序、判斷回文），得知道中點在哪。但串列沒有長度欄位，數一次長度再走一半要掃兩遍。",
      why: "fast 每次走兩步、slow 走一步，fast 到底的時候 slow 剛好走了一半。一遍搞定，而且程式碼只有四行。",
    },
    {
      title: "偽隨機數產生器的週期",
      problem: "函數 f 反覆套用 x → f(x) → f(f(x))，狀態有限所以終究會進入循環。要找出循環從哪開始、長度多少，不能把所有狀態存下來。",
      why: "把「x 的下一個是 f(x)」看成串列，這就是找環起點。Pollard 的 rho 因數分解也用同一個技巧。",
    },
  ],
  cue: "有沒有環、環的起點、中點、倒數第 k 個、只能走一遍、不能用額外空間、兩個指標速度不同。",
  steps: [
    "`slow = fast = head`。迴圈條件永遠是 `while fast and fast.next`，這樣 `fast.next.next` 才不會炸。",
    "每一輪 `slow = slow.next`、`fast = fast.next.next`。",
    "**找中點**：迴圈結束回傳 slow。偶數長度會停在第二個中點；要第一個就把 fast 從 `head.next` 出發。",
    "**偵測環**：每一輪移動後檢查 `slow is fast`。注意是移動後才比，一開始兩者本來就相同。",
    "**環的起點**：相遇後 `slow = head`，兩個指標都一次一步直到再相遇。**倒數第 k 個**：fast 先走 k 步再同速前進。",
  ],
  demoNote: "「找中點」看 fast 到底時 slow 停在哪；「偵測環」看兩個指標怎麼在環裡相遇，以及第二階段怎麼找出環的起點。",
  codeNote: "四個函式共用同一個骨架：中點、判圈、環起點、倒數第 k 個。注意迴圈條件都一樣，差別只在什麼時候停、停下來後做什麼。",
  problems: [
    { src: "LeetCode 876", name: "Middle of the Linked List", diff: "Easy" },
    { src: "LeetCode 141", name: "Linked List Cycle", diff: "Easy" },
    { src: "LeetCode 142", name: "Linked List Cycle II（環的起點）", diff: "Medium" },
    { src: "LeetCode 19", name: "Remove Nth Node From End of List（固定間距）", diff: "Medium" },
    { src: "LeetCode 287", name: "Find the Duplicate Number（把陣列當串列找環）", diff: "Medium" },
    { src: "LeetCode 143", name: "Reorder List（中點 + 反轉 + 交錯合併）", diff: "Medium" },
  ],
};
