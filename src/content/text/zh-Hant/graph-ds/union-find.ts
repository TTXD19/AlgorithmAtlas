import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Array、Recursion、Amortized Analysis",
  applications: [
    {
      title: "網路還連通嗎",
      problem: "機房之間不斷加線、拉線，每次變動後都要回答「A 和 B 還連得到嗎」。每問一次就跑一次 BFS 太貴。",
      why: "併查集把「同一個連通分量」的節點放進同一群，加線就是合併兩群，查連通就是看兩點的群是否相同。兩個操作攤銷後幾乎是常數時間。",
    },
    {
      title: "相片裡的人臉分群",
      problem: "幾萬張人臉，兩張夠相似就連一條邊，最後要知道有幾個人、每張臉屬於誰。",
      why: "每條「相似」的邊做一次合併，最後每個根代表一個人。連通分量計數是併查集最直接的用途，Number of Provinces 就是這題。",
    },
    {
      title: "Kruskal 最小生成樹的核心",
      problem: "按權重由小到大加邊，但加進來的邊不能形成環。怎麼快速判斷「這條邊會不會成環」？",
      why: "兩端已經同群，這條邊就多餘。併查集的 union 回傳 false 就是這個訊號。少了它，Kruskal 每加一條邊都得重新走訪。",
    },
  ],
  cue: "在不在同一群、動態加邊、連通分量有幾個、加這條邊會不會成環、只合併不拆開。",
  steps: [
    "初始化 `parent[i] = i`、`size[i] = 1`、群數 `count = n`。",
    "**find(x)**：`parent[x] ≠ x` 就遞迴找 `parent[x]` 的根，並把 `parent[x]` 改成那個根（路徑壓縮）。",
    "**union(a, b)**：找兩邊的根。相同就回傳 false；不同就把 size 小的根接到大的底下，更新 size，`count −= 1`。",
    "**connected(a, b)** 就是 `find(a) == find(b)`；連通分量數就是 `count`。",
    "節點不是整數時，先用雜湊表把它們對應到 0..n−1。需要「刪邊」時考慮離線倒著做。",
  ],
  demoNote: "八個節點，依序執行一串 union 與 find。看 parent 陣列怎麼變、樹怎麼長，以及路徑壓縮發生時哪些節點被直接接到根。",
  codeNote: "含路徑壓縮與按大小合併的完整實作，附上連通分量計數與無向圖偵測環兩個最常見的用法。C++ 版用迭代的路徑減半，避免遞迴。",
  problems: [
    { src: "LeetCode 547", name: "Number of Provinces", diff: "Medium" },
    { src: "LeetCode 684", name: "Redundant Connection（偵測環）", diff: "Medium" },
    { src: "LeetCode 200", name: "Number of Islands（用併查集再做一次）", diff: "Medium" },
    { src: "LeetCode 721", name: "Accounts Merge（節點是字串）", diff: "Medium" },
    { src: "LeetCode 1584", name: "Min Cost to Connect All Points（Kruskal 前置）", diff: "Medium" },
    { src: "LeetCode 1319", name: "Number of Operations to Make Network Connected", diff: "Medium" },
  ],
};
