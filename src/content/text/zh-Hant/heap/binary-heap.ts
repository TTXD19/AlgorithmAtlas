import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Array、Binary Tree Basics",
  applications: [
    {
      title: "作業系統的工作排程",
      problem: "幾百個程序等著 CPU，每個有不同優先度，新程序隨時進來。每次都要挑優先度最高的來跑，但把整個佇列重新排序太慢。",
      why: "堆積只保證「最頂端是極值」，不管其他元素的順序。所以加入和取出都是 O(log n)，而不是排序的 O(n log n)。Linux 排程器與 Java 的 PriorityQueue 底層都是這種結構。",
    },
    {
      title: "事件模擬與計時器",
      problem: "遊戲伺服器有上萬個計時器：技能冷卻、Buff 到期、怪物重生。每個 tick 要問「最近一個要觸發的是誰」。",
      why: "把到期時間放進最小堆積，堆頂永遠是最早到期的。Node.js 的 timer、Go 的 runtime timer 都是這樣實作的。",
    },
    {
      title: "Dijkstra 的引擎",
      problem: "最短路徑演算法每一輪要挑「目前距離最小的未確定節點」。暴力掃描每輪 O(V)，整體 O(V²)。",
      why: "換成堆積後每輪 O(log V)，整體變成 O((V+E) log V)。堆積是很多圖論演算法能跑得快的原因。",
    },
  ],
  cue: "隨時取最大或最小、優先度、最早到期、Top-K、資料一直進來還要一直取極值。",
  steps: [
    "**push(x)**：把 x 加到陣列尾端，設 i 為它的索引。",
    "當 i 不是根且 `a[i] < a[parent]`：交換兩者，i 移到父節點。否則停止。",
    "**pop()**：記下 `a[0]` 當回傳值，把尾端元素搬到 `a[0]`，陣列長度減一，設 i = 0。",
    "找 i 的兩個子節點中較小的那個 c。若 `a[c] < a[i]`：交換，i 移到 c，重複；否則停止。",
    "要最大堆積時，把比較方向反過來；或像 Python 一樣把值取負塞進最小堆積。",
  ],
  demoNote:
    "一段固定的操作腳本。上方是樹的視角，右側是同一份資料的陣列視角，兩者是同一個東西。黃色是正在比較的兩個節點，藍色是剛交換的。",
  codeNote:
    "先手寫一次理解 sift up 與 sift down，實務上直接用 `heapq` 或 `std::priority_queue`。注意 Python 只有最小堆積，C++ 預設是最大堆積。",
  problems: [
    { src: "LeetCode 1046", name: "Last Stone Weight（最大堆積）", diff: "Easy" },
    { src: "LeetCode 703", name: "Kth Largest Element in a Stream", diff: "Easy" },
    { src: "LeetCode 23", name: "Merge k Sorted Lists（堆積存 k 個頭）", diff: "Hard" },
    { src: "LeetCode 621", name: "Task Scheduler", diff: "Medium" },
    { src: "LeetCode 1942", name: "The Number of the Smallest Unoccupied Chair（兩個堆積當計時器）", diff: "Medium" },
  ],
};
