import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Stack",
  applications: [
    {
      title: "股價：每一天之後第一次漲破今天是哪天",
      problem: "對每一天問「之後第一個比今天高的價格在哪」。暴力做法每一天往後掃，O(n²)，十萬天就是一百億次。",
      why: "從左到右掃，把「還沒找到答案的日子」放在堆疊裡。新的一天出現時，堆疊裡所有比它低的日子答案就是今天，一次全部彈出結算。每一天進出各一次，O(n)。",
    },
    {
      title: "直方圖裡最大的矩形",
      problem: "一排柱子，找面積最大的矩形。矩形的高由最矮的柱子決定，所以要知道每根柱子「左右第一根比它矮的在哪」。",
      why: "這正是單調堆疊回答的問題。維持一個高度遞增的堆疊，彈出的那一刻同時知道左邊界（新的頂端）和右邊界（現在的位置）。",
    },
    {
      title: "接雨水、視線能看到幾棟大樓",
      problem: "「被左右更高的東西夾住」「往右看第一個擋住視線的」，這類問題全部長得一樣。",
      why: "它們都是「找左邊或右邊第一個更大／更小的元素」的變形。認出這個形狀，就知道要用單調堆疊。",
    },
  ],
  cue: "下一個更大／更小、第一個比它高的、左右邊界、每個元素往右看、O(n²) 的雙層迴圈只在找「第一個滿足條件的」。",
  steps: [
    "確認問題是「對每個元素找**某個方向第一個**滿足大小條件的元素」。",
    "決定單調方向：找更大用**遞減**堆疊，找更小用**遞增**堆疊。堆疊裡存**索引**，才能算距離和取值。",
    "從左到右，對每個 i：`while stack and 條件(nums[stack[-1]], nums[i])`，彈出頂端 j 並記錄 `ans[j]`（答案是 i 或 nums[i]）。",
    "把 i 推入。若也需要「左邊第一個」，彈出 j 時的新頂端就是 j 的左邊界。",
    "掃完後堆疊裡剩下的元素沒有答案（設 −1 或 0）。需要全部結算時，在尾端加一個哨兵值。",
  ],
  demoNote:
    "每日溫度。黃色是還在堆疊裡等答案的日子，新的一天比頂端暖時，頂端被彈出並填上答案（綠色）。注意堆疊裡的溫度永遠由底到頂遞減。",
  codeNote:
    "每日溫度、通用的下一個更大元素，以及同時用到左右邊界的直方圖最大矩形。三段的骨架一模一樣，差在彈出條件和彈出時記什麼。",
  problems: [
    { src: "LeetCode 739", name: "Daily Temperatures", diff: "Medium" },
    { src: "LeetCode 496", name: "Next Greater Element I", diff: "Easy" },
    { src: "LeetCode 503", name: "Next Greater Element II（環狀：掃兩遍）", diff: "Medium" },
    { src: "LeetCode 901", name: "Online Stock Span", diff: "Medium" },
    { src: "LeetCode 84", name: "Largest Rectangle in Histogram", diff: "Hard" },
    { src: "LeetCode 42", name: "Trapping Rain Water（單調堆疊版）", diff: "Hard" },
  ],
};
