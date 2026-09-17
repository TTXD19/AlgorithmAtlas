import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Subsets",
  applications: [
    {
      title: "用手上的面額湊出一筆金額",
      problem: "販賣機只收 5、10、50 元，要列出所有能湊出 65 元的投幣方式。10+5+50 和 50+10+5 是同一種，不能重複算。",
      why: "這是「組合」不是「排列」：順序不重要。每一層只從目前位置往右挑，就天生不會產生順序不同的重複。剩餘金額變負時整條分支立刻放棄，這就是剪枝。",
    },
    {
      title: "從 20 個人裡選 5 人的隊伍",
      problem: "社團要從 20 個報名者裡選 5 人參賽，每種名單都要評估一次適配度。C(20, 5) = 15,504 種，要有系統地列出來。",
      why: "從 start 往右挑保證每個名單只出現一次。加一條剪枝：剩下的人不夠填滿 5 個位置就不用再往下試，可以砍掉大量沒用的遞迴。",
    },
    {
      title: "預算內的採購清單",
      problem: "有一份零件價目表，要列出所有總價剛好等於預算的採購組合，每種零件可以買多份。",
      why: "先把價目排序。當目前這個零件的價格已經超過剩餘預算，後面更貴的一定也超過，整個迴圈直接結束。排序加剪枝讓搜尋樹少掉一大半。",
    },
  ],
  cue: "湊出總和、選 k 個、順序不重要、可以重複用或只能用一次、列出所有方案、n 小但暴力太慢。",
  steps: [
    "先把候選**排序**，這是剪枝能用 `break` 的前提。",
    "寫 `dfs(start, remain)`：`remain == 0` 時把 `path` 複製進答案並 return。",
    "for 迴圈從 `start` 掃到底。若 `candidates[i] > remain`，`break`（剪枝）。若輸入有重複且 `i > start and candidates[i] == candidates[i-1]`，`continue`。",
    "做選擇：`path.append(candidates[i])`，遞迴 `dfs(i, remain - candidates[i])`（可重複用）或 `dfs(i + 1, …)`（只能用一次）。",
    "撤銷選擇：`path.pop()`，繼續試下一個 i。",
  ],
  demoNote:
    "candidates = [2, 3, 6, 7]、target = 7。下方的遞迴堆疊顯示每一層的 start 與 remain，黃色的那一步就是剪枝發生的時刻：候選已經比 remain 大，整個迴圈直接結束。",
  codeNote:
    "Combination Sum（可重複用）、C(n, k)（剩餘數量剪枝）與 Combination Sum II（只能用一次、輸入有重複）。三者只差 start 怎麼傳和剪枝條件。",
  problems: [
    { src: "LeetCode 39", name: "Combination Sum", diff: "Medium" },
    { src: "LeetCode 40", name: "Combination Sum II（只用一次、跳過重複）", diff: "Medium" },
    { src: "LeetCode 77", name: "Combinations", diff: "Medium" },
    { src: "LeetCode 216", name: "Combination Sum III", diff: "Medium" },
    { src: "LeetCode 17", name: "Letter Combinations of a Phone Number", diff: "Medium" },
    { src: "LeetCode 131", name: "Palindrome Partitioning（切割位置的組合）", diff: "Medium" },
  ],
};
