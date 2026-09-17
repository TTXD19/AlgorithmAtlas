import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Array & Dynamic Array、Stack",
  applications: [
    {
      title: "印表機、訊息佇列、工作排程",
      problem: "多個人同時送列印工作，先送的要先印。Kafka、RabbitMQ 這類系統把訊息排成一列，生產者從尾端放、消費者從前端拿。",
      why: "佇列的「先進先出」就是公平的定義。每個人只能排到隊尾，服務永遠從隊頭開始，不會有人插隊。",
    },
    {
      title: "BFS 為什麼一層一層走",
      problem: "圖的廣度優先搜尋要「先看完距離 1 的，再看距離 2 的」。這個順序怎麼保證？",
      why: "把發現的節點依序放進佇列，永遠先處理最早發現的。先進先出自動維持了「離起點近的先處理」。BFS 那篇的示範就是佇列在動。",
    },
    {
      title: "為什麼 Python 用 list 當佇列會很慢",
      problem: "有人用 list.pop(0) 出隊，資料一多程式就卡住。",
      why: "陣列從前端移除要把所有元素往前搬，O(n)。環狀陣列讓 head 往前走而不搬元素，deque 就是這樣做的（實際上是分段的雙向串列）。知道原因，就知道該換 deque。",
    },
  ],
  cue: "先進先出、排隊、公平處理、一層一層、BFS、生產者消費者、兩端都要操作。",
  steps: [
    "需要先進先出時，Python 用 `deque`、C++ 用 `std::queue`。不要用 list 的 `pop(0)`。",
    "自己實作固定容量佇列用**環狀陣列**：記 `head` 和 `size`（不要記 head 和 tail，會分不清空與滿）。",
    "**入隊**：`buf[(head + size) % cap] = x`，size 加一。滿了就回傳失敗或擴容。",
    "**出隊**：`head = (head + 1) % cap`，size 減一。不搬任何元素。",
    "BFS 的骨架：起點入隊；`while queue`：出隊一個、處理它、把還沒看過的鄰居入隊。要分層就在每一輪記下當時的佇列長度。",
  ],
  demoNote: "容量 6 的環狀陣列。enqueue 幾次再 dequeue 幾次，看 tail 怎麼繞回陣列前面、head 怎麼往前走而不搬任何元素。",
  codeNote: "內建的 deque / queue 用法、環狀陣列實作、以及用兩個堆疊做出佇列（攤銷分析那篇的例子，這裡給完整程式碼）。",
  problems: [
    { src: "LeetCode 232", name: "Implement Queue using Stacks", diff: "Easy" },
    { src: "LeetCode 225", name: "Implement Stack using Queues", diff: "Easy" },
    { src: "LeetCode 622", name: "Design Circular Queue", diff: "Medium" },
    { src: "LeetCode 933", name: "Number of Recent Calls（滑動時間窗）", diff: "Easy" },
    { src: "LeetCode 102", name: "Binary Tree Level Order Traversal（用佇列分層）", diff: "Medium" },
    { src: "LeetCode 641", name: "Design Circular Deque", diff: "Medium" },
  ],
};
