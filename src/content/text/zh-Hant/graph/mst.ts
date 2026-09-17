import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Union-Find、Binary Heap、Greedy Principles",
  applications: [
    {
      title: "規劃電網與光纖網路",
      problem: "電力公司要把 40 個村落接上電網，任兩個村落之間拉線的成本不同，取決於距離和地形。每個村落都要通電，但不必兩兩直接相連，只要彼此之間有路可通，而總施工成本要最低。",
      why: "「全部連通、總成本最低」的網路一定沒有環，否則拿掉環上最貴的那段線仍然連通、成本更低，所以答案就是最小生成樹。1926 年捷克數學家 Borůvka 正是為了替摩拉維亞地區規劃電網，提出了第一個最小生成樹演算法。",
    },
    {
      title: "資料的單一連結分群",
      problem: "有 5,000 筆客戶資料，每筆是一個特徵向量。行銷團隊想把客戶分成 8 群，同一群的客戶要彼此相似，不同群之間的差距要盡量大，但沒有人知道群的形狀，不一定是圓的。",
      why: "把每筆資料當節點、兩兩距離當邊權，跑 Kruskal 但不做到最後：每收一條邊就少一群，剩下 8 群時停下來。這等於把最小生成樹最長的 7 條邊剪掉，結果就是單一連結的階層式分群。它能分出細長或彎曲形狀的群，這是只看群中心的 k-means 做不到的。",
    },
    {
      title: "電路板鑽孔的路線",
      problem: "數控機台要在電路板上鑽 2,000 個孔，鑽頭要走遍所有孔位再回到原點，移動路線越短，生產越快。要找出真正最短的路線是旅行推銷員問題，數量大到算不出來。",
      why: "先求出孔位之間的最小生成樹，再用深度優先走訪這棵樹，依第一次拜訪的順序去鑽孔，已經走過的點直接跳過。只要距離滿足三角不等式，這條路線的長度保證不超過最佳解的 2 倍，而最小生成樹 O(V²) 就算得出來，是最經典的近似演算法之一。",
    },
  ],
  cue: "把所有點連起來而且總成本最低、沒有指定起點終點、任兩點之間的連線成本、拿掉最長的邊來分群、路徑上最大的邊要最小（瓶頸路徑）、併查集。",
  steps: [
    "確認是連通的無向圖。Kruskal：把所有邊依權重由小到大排序，併查集讓每個節點自成一群。",
    "依序看每條邊 `(u, v, w)`：`find(u) ≠ find(v)` 就收下並 `union` 兩群；相同就跳過，它會成環。",
    "收滿 V − 1 條邊就停止；看完所有邊還不到 V − 1 條，表示圖不連通。",
    "Prim：從任一節點出發，把它的鄰邊放進最小堆積。每次取出最輕的邊，另一端已在樹裡就丟掉，否則把它加進樹，再放入它連到樹外的邊，直到 V 個節點都在樹裡。",
    "稠密圖改用陣列版 Prim：維護每個樹外節點到樹的最小邊權 `key[v]`，每輪挑 key 最小的節點加入，再用它更新其他節點的 key，O(V²)。",
  ],
  demoNote:
    "同一張 6 個節點、9 條邊的圖，上方切換兩種演算法。「Kruskal」模式右側是排序好的邊和目前的分群：B–E、A–D、A–B 依序收下，A、B、D、E 合成一群；接著 B–D（4）的兩端已經同群，變成虛線丟掉；C–F 收下；D–E（5）也同群丟掉；C–E（6）把兩群接起來，收滿 5 條邊，剩下 B–C 和 E–F 不用再看。「Prim」模式從 A 出發，右側是最小堆積：先取 A–D、A–B、B–E，之後取出的 D–B 和 D–E 另一端已經在樹裡，只能丟掉，再取 E–C、C–F 完成。藍色是選進生成樹的邊，黃色是這一步處理的邊。兩種方法選出的邊相同，總權重都是 16。",
  codeNote:
    "Python 放併查集、Kruskal、lazy Prim，以及 Kruskal 做到剩 k 群就停的單一連結分群。C++ 放用排序加併查集的 Kruskal，並用 O(V²) 的陣列版 Prim 處理平面上任兩點都能相連的完全圖，這種圖邊太多，不值得先把所有邊列出來排序。",
  problems: [
    { src: "LeetCode 1584", name: "Min Cost to Connect All Points（完全圖，陣列版 Prim 最適合）", diff: "Medium" },
    { src: "LeetCode 778", name: "Swim in Rising Water（瓶頸路徑：依高度由低到高加入格子）", diff: "Hard" },
    { src: "LeetCode 1697", name: "Checking Existence of Edge Length Limited Paths（離線查詢，邊和查詢一起排序）", diff: "Hard" },
    { src: "LeetCode 1579", name: "Remove Max Number of Edges to Keep Graph Fully Traversable（兩份併查集）", diff: "Hard" },
    { src: "LeetCode 1489", name: "Find Critical and Pseudo-Critical Edges in Minimum Spanning Tree", diff: "Hard" },
  ],
};
