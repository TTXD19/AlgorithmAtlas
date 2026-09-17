import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Queue、鄰接串列",
  applications: [
    {
      title: "社群平台的「你可能認識的人」",
      problem: "Facebook 或 LinkedIn 要推薦「好友的好友」。從你出發，走一步是好友，走兩步是好友的好友，走三步的人通常就不推了。",
      why: "BFS 是唯一天生「一層一層」往外找的走訪方式。第一層看完才看第二層，所以能精確控制「幾度人脈」。",
    },
    {
      title: "迷宮與地圖的最少步數",
      problem: "掃地機器人要從充電座走到廚房，格子地圖上每一步代價都一樣。遊戲裡的 NPC 尋路、Google Maps 問「最少轉幾次車」也是同一類問題。",
      why: "在每一步代價相同的圖上，BFS 第一次碰到目標時走過的步數就是最少步數，不需要更複雜的 Dijkstra。",
    },
    {
      title: "網路爬蟲與訊息擴散",
      problem: "搜尋引擎從首頁出發抓網頁：先抓首頁上的所有連結，再抓那些頁面上的連結。傳染病模型、網路廣播封包也是同樣的擴散方式。",
      why: "「先近後遠」讓爬蟲優先涵蓋離入口最近、通常也最重要的頁面，而且能設定最大深度就停。",
    },
  ],
  cue: "最少步數、最短路徑（無權重）、幾層／幾度、離某點最近的、一圈一圈擴散。",
  steps: [
    "把起點放入佇列，並標記為「已發現」，避免之後重複加入。",
    "從佇列**前端**取出一個節點 `u`。",
    "看 `u` 的每個鄰居 `v`：若 `v` 尚未被發現，標記它，記下 `dist[v] = dist[u] + 1`，然後放入佇列**尾端**。",
    "重複步驟 2–3，直到佇列為空。此時所有從起點可達的節點都已走訪。",
  ],
  demoNote: "從節點 A 開始。按「下一步」看佇列如何一層一層推進，節點下方的數字是與 A 的距離。",
  codeNote: "兩個版本都用一個 `dist` 表同時扮演「是否已發現」與「距離多少」兩個角色。",
  problems: [
    { src: "LeetCode 1091", name: "Shortest Path in Binary Matrix", diff: "Medium" },
    { src: "LeetCode 994", name: "Rotting Oranges", diff: "Medium" },
    { src: "LeetCode 127", name: "Word Ladder", diff: "Medium" },
    { src: "LeetCode 200", name: "Number of Islands", diff: "Medium" },
  ],
};
