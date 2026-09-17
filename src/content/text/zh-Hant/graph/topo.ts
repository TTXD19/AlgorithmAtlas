import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Adjacency List / Matrix、BFS、DFS",
  applications: [
    {
      title: "monorepo 的平行建置",
      problem: "一個 monorepo 有 40 個套件：web 依賴 ui 和 api-client，ui 又依賴 utils。改完程式要全部重新建置，每個套件都得等它依賴的套件建好才能開始，而 CI 機器有 8 個核心，能同時建的就想同時建。",
      why: "把「A 依賴 B」畫成邊 B → A，合法的建置順序就是拓撲順序。Kahn 演算法的佇列裡，每一刻放的都是「相依已經全部建好、可以立刻開工」的套件，把它們分給不同核心同時跑，就是 Turborepo、Bazel 這類工具排程的核心想法。",
    },
    {
      title: "四年修課規劃與先修檢查",
      problem: "資工系有 45 門必修，「演算法」要先修「資料結構」和「離散數學」，「作業系統」要先修「計算機組織」。系辦改了先修規定後，要確認學生在不限學分的情況下最少幾個學期修得完，也要確認沒有兩門課互相擋住。",
      why: "課程是節點、先修是邊。Kahn 一層一層剝：第一層是沒有先修的課，拿掉之後入度變成 0 的是第二層，層數就是最少學期數。剝到最後若還有課留著，代表先修規定裡有環，那幾門課永遠修不到。",
    },
    {
      title: "每天凌晨的資料管線",
      problem: "資料團隊用 dbt 管理 300 張報表，每張表的 SQL 用 ref() 引用別的表，例如「月營收」要等「訂單明細」和「匯率表」算完。每天凌晨全部重算一次，只要有一張表比它的上游先跑，報表數字就是錯的。",
      why: "表之間的引用構成一張有向無環圖（DAG），dbt 和 Airflow 在執行前都會先排出拓撲順序再照順序跑。有人不小心讓兩張表互相引用時，排序做不下去，工具在開跑之前就能報錯，而不是算到一半才出事。",
    },
  ],
  cue: "相依關係、先後順序、先修課程、A 必須在 B 之前完成、建置／安裝順序、DAG、排程能不能全部完成、有沒有循環相依。",
  steps: [
    "把每條相依寫成邊：「`u` 必須在 `v` 之前」就加 `u → v`，同時 `indeg[v] += 1`。先確認題目給的 pair 是哪個方向。",
    "把所有入度為 0 的節點放進佇列，它們沒有任何前置條件。",
    "從佇列取出 `u` 加到答案；對 `u` 的每條出邊 `u → v` 做 `indeg[v] -= 1`，降到 0 就把 `v` 放進佇列。",
    "佇列空了就停。答案長度等於 V 就是拓撲順序；少於 V 代表有環，入度還大於 0 的節點都卡在環上或環的下游。",
    "DFS 寫法：三色標記，外層迴圈對每個白色節點呼叫 `dfs`；碰到灰色鄰居就是環；一個節點的鄰居全部處理完才把它加入 `post`，最後回傳 `post` 反轉。",
    "變形：要分批平行處理，就一次把整層取完再算下一層，層數是最少輪數；要字典序最小，把佇列換成最小堆積。",
  ],
  demoNote:
    "6 個前端套件、8 條相依，箭頭 `u → v` 表示裝 `v` 之前要先裝 `u`。「Kahn · 入度」模式看節點下方的 `in=`：每移除一條邊（變成虛線）就減 1，降到 0 的套件變黃色進佇列，藍色是正在處理的，填滿的是已輸出。「DFS · 完成順序」模式裡黃色是還在呼叫堆疊上的套件，節點下方標出它是第幾個完成，右欄同時列出完成順序與它的反轉。留意兩個模式的結果：Kahn 得到 react → ts → r-dom → lint → next → app，DFS 得到 ts → lint → react → r-dom → next → app，順序不同，但每條相依都成立。",
  codeNote:
    "兩種語言都有 Kahn 與 DFS 兩種寫法，範例圖和互動示範相同，輸出也分別對應兩個模式的結果。Kahn 不用遞迴、順便數出有沒有環，是實務上的預設選擇；DFS 版和環偵測共用三色標記，適合已經在做 DFS 的場合。Python 另外示範分層版本，每一層可以平行處理；C++ 示範把佇列換成最小堆積，得到字典序最小的順序。",
  problems: [
    { src: "LeetCode 1557", name: "Minimum Number of Vertices to Reach All Nodes（入度為 0 的節點）", diff: "Medium" },
    { src: "LeetCode 210", name: "Course Schedule II（注意邊的方向）", diff: "Medium" },
    { src: "LeetCode 2115", name: "Find All Possible Recipes from Given Supplies（字串節點的 Kahn）", diff: "Medium" },
    { src: "LeetCode 802", name: "Find Eventual Safe States（反向圖做 Kahn，或三色 DFS）", diff: "Medium" },
    { src: "LeetCode 2050", name: "Parallel Courses III（拓撲順序上算最早完成時間）", diff: "Hard" },
    { src: "LeetCode 1203", name: "Sort Items by Groups Respecting Dependencies（兩層拓撲排序）", diff: "Hard" },
  ],
};
