import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Array & Dynamic Array",
  applications: [
    {
      title: "作業系統怎麼管理「等著跑的程序」",
      problem: "程序隨時會建立、結束、被暫停。要在任何位置 O(1) 插入或移除，而且沒有人知道最多會有幾個。",
      why: "串列的節點散落在記憶體各處，靠指標串起來。插入刪除只改兩個指標，不用搬其他元素，也不用預留連續空間。Linux 核心到處都是串列。",
    },
    {
      title: "雜湊表裡碰撞的那條鏈",
      problem: "上一章的雜湊表用「鏈結法」處理碰撞：同一個桶裡的 key 串在一起。那條鏈就是單向串列。",
      why: "鏈通常很短、只在尾端加、只會整條掃過，串列剛好夠用又不浪費空間。學會它，就看懂了雜湊表的實作。",
    },
    {
      title: "指標操作的基本功",
      problem: "樹、圖、LRU 快取、跳躍串列，全部是「節點 + 指標」的結構。接錯一個指標，整條就斷了或繞成環。",
      why: "單向串列是最簡單的指標結構。在這裡練熟「先接新的、再拆舊的」、哨兵節點、邊界情況，之後所有指標題都是同一套動作。",
    },
  ],
  cue: "不知道總共幾個、頻繁在中間插入刪除、node.next、head、指標接來接去、面試裡的 ListNode。",
  steps: [
    "**插入**在節點 p 之後：新節點的 next 先指向 `p.next`，再把 `p.next` 改指向新節點。順序反了會弄丟 p 後面整段。",
    "**刪除**節點 p 之後的那個：`p.next = p.next.next`。被跳過的節點沒人指向它，就等於消失了（C++ 要手動 delete）。",
    "任何要碰 head 的操作，先建一個 **dummy** 節點指向 head，操作完回傳 `dummy.next`。這樣「刪除 head」和「刪除中間」是同一段程式。",
    "**走訪**用 `while cur:`，需要「前一個節點」時多留一個 `prev`。要停在最後一個節點用 `while cur.next:`。",
    "寫完先用三種輸入檢查：空串列、只有一個節點、目標在最後一個。指標題的 bug 幾乎都在邊界。",
  ],
  demoNote: "比較每個操作走過幾個節點。開頭插入不用走，尾端插入和讀取第 4 個都得從 head 一路走；刪除只改一個指標，後面的節點完全不動。",
  codeNote: "手寫一個最小的串列類別，每個方法標上複雜度；最後用哨兵節點示範「刪除所有等於 val 的節點」怎麼把 head 的特判消掉。",
  problems: [
    { src: "LeetCode 707", name: "Design Linked List", diff: "Medium" },
    { src: "LeetCode 203", name: "Remove Linked List Elements（哨兵節點）", diff: "Easy" },
    { src: "LeetCode 83", name: "Remove Duplicates from Sorted List", diff: "Easy" },
    { src: "LeetCode 237", name: "Delete Node in a Linked List（沒有前一個節點怎麼刪）", diff: "Medium" },
    { src: "LeetCode 19", name: "Remove Nth Node From End of List", diff: "Medium" },
  ],
};
