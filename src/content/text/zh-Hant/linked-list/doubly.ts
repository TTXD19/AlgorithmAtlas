import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Singly Linked List、Hash Table",
  applications: [
    {
      title: "LRU 快取：記憶體不夠時該丟誰",
      problem: "資料庫的頁面快取、CDN、瀏覽器快取，空間有限，滿了要踢掉「最久沒被用的」。每次讀取都要把該項標成「剛用過」，每次淘汰都要找出最久的，這兩件事都要 O(1)。",
      why: "把項目依使用時間串成雙向串列，最近用的在頭、最久的在尾。雜湊表直接找到節點，雙向指標讓「從中間拆下來、接到頭」只改四個指標。LeetCode 146 就是這題。",
    },
    {
      title: "瀏覽器的上一頁、下一頁",
      problem: "每個頁面要知道前一頁和後一頁。從中間某頁開新連結時，後面的歷史要整段丟掉。",
      why: "節點同時記 prev 和 next，往前往後都是 O(1)。文字編輯器的 undo/redo、音樂播放器的上一首下一首，都是同一個結構。",
    },
    {
      title: "deque 與 OrderedDict 的底層",
      problem: "Python 的 deque 為什麼兩端都能 O(1) 增刪？OrderedDict 為什麼能記住插入順序又能 O(1) 刪除任意 key？",
      why: "它們底層都是雙向串列。理解 prev/next 之後，這些「內建魔法」都變成看得懂的實作。",
    },
  ],
  cue: "LRU、最近使用、兩端都要操作、O(1) 刪除任意已知節點、上一個和下一個、undo/redo。",
  steps: [
    "建兩個哨兵：`head.next = tail`、`tail.prev = head`。真實節點永遠夾在中間。",
    "**拆下**節點 n（unlink）：`n.prev.next = n.next`、`n.next.prev = n.prev`。n 本身的指標留著沒關係，因為馬上會被重新接上或丟掉。",
    "**接到最前面**（push_front）：先設 n 的兩個指標（`n.next = head.next`、`n.prev = head`），再改鄰居的指標（`head.next.prev = n`、`head.next = n`）。先設自己、再改別人。",
    "LRU 的 `get`：雜湊表找節點，unlink 再 push_front，回傳值。找不到回 −1。",
    "LRU 的 `put`：已存在就更新值並移到最前面；不存在且已滿，先拆掉 `tail.prev`（最久沒用）並從雜湊表刪除，再建新節點接到最前面、寫進雜湊表。",
  ],
  demoNote:
    "容量 3 的 LRU 快取。put 或 get 一個 key 會把它移到最前面；快取滿了再 put 新 key，尾端最久沒用的會被踢掉。右邊是雜湊表，每個 key 直接指到串列裡的節點。",
  codeNote:
    "Python 版手寫節點與兩個哨兵，把 unlink 和 push_front 獨立出來後，get 和 put 都只是組合它們。C++ 版用 `std::list` 配 `splice`，一行完成 O(1) 移動。",
  problems: [
    { src: "LeetCode 146", name: "LRU Cache", diff: "Medium" },
    { src: "LeetCode 641", name: "Design Circular Deque", diff: "Medium" },
    { src: "LeetCode 430", name: "Flatten a Multilevel Doubly Linked List", diff: "Medium" },
    { src: "LeetCode 1472", name: "Design Browser History", diff: "Medium" },
    { src: "LeetCode 460", name: "LFU Cache（雜湊表 + 多條雙向串列）", diff: "Hard" },
  ],
};
