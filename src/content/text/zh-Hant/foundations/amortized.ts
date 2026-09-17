import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Big-O Notation、Array & Dynamic Array",
  applications: [
    {
      title: "list.append 明明偶爾要搬家，為什麼說它是 O(1)",
      problem: "Python 的 list、JavaScript 的 array、C++ 的 vector 底層都是固定大小的陣列。滿了就要配一塊更大的、把舊資料全部搬過去，那一次是 O(n)。",
      why: "攤銷分析看的是一連串操作的總成本除以次數。搬家很少發生，而且每次搬完會換來很多次便宜的 push，平均下來每次 push 仍是常數。",
    },
    {
      title: "雜湊表為什麼要 rehash",
      problem: "HashMap 元素太多時碰撞變多，得開一個兩倍大的表、把所有元素重新放一次。那一瞬間很慢。",
      why: "同樣的道理：rehash 是 O(n)，但發生頻率隨 n 加倍而減半，攤銷後插入仍是 O(1)。理解這點，就知道為什麼「加倍」是關鍵而「加 100」不行。",
    },
    {
      title: "用兩個堆疊做出佇列",
      problem: "只有堆疊可用時要實作佇列。出隊時若輸出堆疊是空的，要把輸入堆疊整個倒過去，那次是 O(n)。",
      why: "每個元素一生最多被搬一次，所以 n 次操作總共 O(n)，攤銷每次 O(1)。這是面試裡最常被問到的攤銷例子。",
    },
  ],
  cue: "偶爾很慢但通常很快、擴容、rehash、每個元素最多被處理一次、總成本除以操作次數。",
  steps: [
    "找出**貴的操作**是哪一個、什麼條件下觸發（容量滿、輸出堆疊空、負載因子超過門檻）。",
    "算它**多久發生一次**，以及每次發生的成本與 n 的關係。加倍策略下發生 log n 次，第 k 次成本 2ᵏ。",
    "用**聚合法**把 n 次操作的成本全部加起來：便宜的 n 次 + 貴的幾次，得到總和。",
    "總和除以 n，就是**攤銷成本**。若想要更直覺的說法，改用記帳法：每次便宜操作預付多少，才夠支付之後的貴操作。",
    "檢查**不會退款**：攤銷分析要求操作序列從空結構開始，若有 pop 後又 push 的交替，要確認縮容策略不會讓成本反覆爆掉（所以縮容通常在 1/4 滿時才做）。",
  ],
  demoNote: "按 push 觀察：大部分時候成本是 1，容量滿時會出現一根黃色的高柱，但「平均每次 push」始終停在 3 以下。",
  codeNote: "Python 版手寫一個動態陣列並統計搬移次數；C++ 版直接觀察 `std::vector` 的 capacity 變化。",
  problems: [
    { src: "LeetCode 232", name: "Implement Queue using Stacks（攤銷 O(1)）", diff: "Easy" },
    { src: "LeetCode 155", name: "Min Stack", diff: "Medium" },
    { src: "LeetCode 705", name: "Design HashSet（想想何時該擴容）", diff: "Easy" },
    { src: "LeetCode 146", name: "LRU Cache", diff: "Medium" },
  ],
};
