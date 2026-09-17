import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Array、Hash Table",
  applications: [
    {
      title: "社群網路的好友關係",
      problem: "十億個使用者、每人平均幾百個好友。要存「誰和誰是好友」，並快速列出某人的所有好友。",
      why: "鄰接矩陣要 10¹⁸ 格，宇宙裡的硬碟加起來都不夠；鄰接串列只存實際存在的邊，每個人一份好友清單，空間是 O(V + E)。真實世界的圖幾乎都是稀疏的，所以鄰接串列是預設選擇。",
    },
    {
      title: "路由與地圖",
      problem: "路口是節點，道路是邊，每條路有長度或時間。導航演算法要不斷問「從這個路口能走到哪些路口，各要多久」。",
      why: "鄰接串列每個節點對應 (鄰居, 權重) 的列表，正好回答這個問題。之後的 BFS、DFS、Dijkstra 全部以「走訪某節點的鄰居」為基本動作，資料結構選對了，演算法才寫得順。",
    },
    {
      title: "什麼時候該用矩陣",
      problem: "棋盤上每格和相鄰格都相連、或一個小型完全圖，節點少但邊很多，還要一直問「A 和 B 有直接相連嗎」。",
      why: "鄰接矩陣一格一格查是 O(1)，而且稠密圖裡矩陣沒有浪費。Floyd-Warshall 這類演算法也天生用矩陣。V 小於幾千、或 E 接近 V² 時考慮它。",
    },
  ],
  cue: "誰和誰相連、鄰居有哪些、有向／無向、帶權重、稀疏還是稠密、V 和 E 各多大。",
  steps: [
    "看清楚題目：**有向還是無向**、**有沒有權重**、節點是整數還是其他東西、V 與 E 的大小。",
    "預設建**鄰接串列**：`adj = [[] for _ in range(n)]` 或 `defaultdict(list)`。",
    "對每條邊 (u, v)：`adj[u].append(v)`；無向圖再加 `adj[v].append(u)`。帶權就存 `(v, w)`。",
    "只有在 E 接近 V²、或需要 O(1) 查「相鄰嗎」時，改用矩陣 `[[0] * n for _ in range(n)]`。",
    "網格題不用真的建圖：把 (row, col) 當節點，四個方向就是邊，直接在陣列上走。",
  ],
  demoNote:
    "同一張圖的兩種表示。切換有向／無向、帶不帶權重，點任一節點看它的鄰居在串列的哪一列、在矩陣的哪一行被標出來。注意兩種表示的格子數。",
  codeNote:
    "從邊列表建鄰接串列與鄰接矩陣，分別處理有向／無向與權重。最後是節點為整數時最常見的寫法，之後的圖論課程都用這個形式。",
  problems: [
    { src: "LeetCode 1557", name: "Minimum Number of Vertices to Reach All Nodes（數入度）", diff: "Medium" },
    { src: "LeetCode 997", name: "Find the Town Judge（入度與出度）", diff: "Easy" },
    { src: "LeetCode 133", name: "Clone Graph", diff: "Medium" },
    { src: "LeetCode 1971", name: "Find if Path Exists in Graph（建圖後走訪）", diff: "Easy" },
    { src: "LeetCode 1436", name: "Destination City", diff: "Easy" },
  ],
};
