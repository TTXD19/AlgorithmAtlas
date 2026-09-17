import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Stack、遞迴、鄰接串列",
  applications: [
    {
      title: "計算資料夾大小",
      problem: "Finder 或 du 指令要算一個資料夾佔多少空間：進入子資料夾，算完它的大小再回到上一層加總，一路往下直到沒有子資料夾。",
      why: "「進去、處理完、再回來」正是 DFS 的遞迴結構。樹狀的東西（檔案系統、DOM、JSON）幾乎都用 DFS 走。",
    },
    {
      title: "小畫家的油漆桶",
      problem: "點一下，整片連在一起的同色區域都被填色。影像處理的 flood fill、遊戲裡消除相連的同色方塊、地圖上數島嶼，都是找「連通區域」。",
      why: "DFS 從一個點出發把能到的全部走完，走完的那一團就是一個連通分量。程式碼比 BFS 短，用遞迴幾行就寫完。",
    },
    {
      title: "偵測循環依賴",
      problem: "模組 A import B、B import C、C 又 import A，打包工具要在出事前發現這個環。Excel 公式互相參照、套件版本相依也一樣。",
      why: "DFS 能區分「正在探索中」和「已完成」的節點。走到一個還在探索中的節點，就代表有環。BFS 做不到這個判斷。",
    },
  ],
  cue: "連通區域、填色、有沒有環、所有路徑／所有組合、樹狀結構走訪、需要回溯。",
  steps: [
    "從起點呼叫 `dfs(u)`，把 `u` 標記為已發現，並記錄走訪順序。",
    "依序看 `u` 的每個鄰居 `v`：若 `v` 尚未發現，**立刻**遞迴呼叫 `dfs(v)`，先把 `v` 那條路走完再回來看下一個鄰居。",
    "當 `u` 的鄰居全部看完，`dfs(u)` 返回，也就是**回溯**到呼叫它的節點。",
    "起點的 `dfs` 返回時，所有從起點可達的節點都已走訪。若要走訪整張圖，對每個尚未發現的節點再呼叫一次，每呼叫一次就是一個連通分量。",
  ],
  demoNote: "同一張圖，同樣從 A 開始，鄰居按字母順序處理。留意堆疊怎麼長高又縮回，以及節點下方的走訪編號：和 BFS 的層次順序完全不同。",
  codeNote: "遞迴版最貼近概念；圖很深時可能超過遞迴深度限制，那時改用明確的堆疊（迭代版）。",
  problems: [
    { src: "LeetCode 695", name: "Max Area of Island", diff: "Medium" },
    { src: "LeetCode 133", name: "Clone Graph", diff: "Medium" },
    { src: "LeetCode 797", name: "All Paths From Source to Target", diff: "Medium" },
    { src: "LeetCode 207", name: "Course Schedule", diff: "Medium" },
    { src: "LeetCode 547", name: "Number of Provinces", diff: "Medium" },
  ],
};
