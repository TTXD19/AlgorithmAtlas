import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Recursion、Subsets",
  applications: [
    {
      title: "工作站的加工順序",
      problem: "一台機器要處理 6 個訂單，每個訂單之間切換模具的時間不同，順序不同總耗時就不同。要找最省時的順序。",
      why: "順序問題和子集問題不同：同一批東西換個順序就是不同答案。6 個訂單有 6! = 720 種順序，全部列出來各算一次總耗時就好。這是排程問題在 n 小時最直接的解法，也是理解 TSP 這類問題的起點。",
    },
    {
      title: "送貨路線列舉",
      problem: "外送員從店家出發要送 5 個地點再回來，哪個順序總距離最短？",
      why: "5 個地點的所有拜訪順序就是 5 的全排列。用 used 陣列記住哪些地點已經排進路線，每一步從還沒排的裡面挑，走到底就是一條完整路線。",
    },
    {
      title: "字謎與密碼變體",
      problem: "把「listen」的字母重新排列能拼出哪些字？測試帳號的密碼是幾個片段的某種順序，要把所有順序都試一遍。",
      why: "字母的重新排列就是排列。有重複字母時要避免產生一樣的結果，排序後加一條「相同的值前一個沒用就跳過」的規則即可。",
    },
  ],
  cue: "順序、排法、有幾種排法、每個元素恰好用一次、n!、字母重組、路線的拜訪順序。",
  steps: [
    "準備 `ans`、`path` 與 `used`（全 false）。`dfs()` 表示「決定下一個位置放誰」。",
    "終止條件：`len(path) == n`，所有位置都填了，複製 `path` 放進 `ans`。",
    "for 迴圈掃過每個 j：`used[j]` 為 true 就 continue。",
    "做選擇：`used[j] = True`、`path.append(nums[j])`，遞迴 `dfs()`。",
    "撤銷選擇：`path.pop()`、`used[j] = False`，兩樣都要復原，然後試下一個 j。",
  ],
  demoNote:
    "[1, 2, 3] 的排列樹。每一層從 used 為 false 的數字裡挑，下方同時顯示 used 陣列和路徑。留意每次撤銷時 used 和路徑是一起復原的。",
  codeNote:
    "used 陣列版、交換法，以及含重複元素的版本。三者的骨架都是「做選擇、遞迴、撤銷」，差在怎麼記錄「誰還沒用」。",
  problems: [
    { src: "LeetCode 46", name: "Permutations", diff: "Medium" },
    { src: "LeetCode 47", name: "Permutations II（排序加 used[j-1] 判斷）", diff: "Medium" },
    { src: "LeetCode 31", name: "Next Permutation（不用回溯，找下一個字典序）", diff: "Medium" },
    { src: "LeetCode 526", name: "Beautiful Arrangement", diff: "Medium" },
    { src: "LeetCode 60", name: "Permutation Sequence（用階乘直接算第 k 個）", diff: "Hard" },
    { src: "LeetCode 996", name: "Number of Squareful Arrays", diff: "Hard" },
  ],
};
