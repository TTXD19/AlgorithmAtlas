import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Greedy Principles、Array",
  applications: [
    {
      title: "電動車的充電站規劃",
      problem: "一條公路上有幾個充電站，每站充飽後能跑的距離不同。從起點出發，能不能到終點？最少要停幾次？試每一種停靠組合是指數級。",
      why: "只要維護一個數字「目前最遠能到哪」，從左到右掃一遍。每到一站就更新這個上限；哪一站超出上限，就是到不了。最少停幾次是同一個掃描，加上「這一段的邊界在哪」的計數。O(n)，不用試任何組合。",
    },
    {
      title: "資源夠不夠撐到目標",
      problem: "專案每個階段會產生一定的預算餘裕，也會消耗一些。從第一階段開始，能不能一路撐到結案？從哪個階段開始才撐得過一整輪？",
      why: "加油站問題的形狀：每格有收入和支出，問能否走完。貪婪的關鍵觀察是「如果從 A 出發在 B 之前油量變負，那 A 到 B 之間任何一點出發都不行」，所以起點可以直接跳到 B 的下一格，整體一樣是一趟掃描。",
    },
    {
      title: "影片剪輯與灑水器覆蓋",
      problem: "有一堆片段各自覆蓋 [起點, 終點]，要用最少片段拼出完整的 0 到 T；或者花園裡每個灑水器有覆蓋半徑，要開最少幾個把整條澆到。",
      why: "把每個位置能「跳到」的最遠處算出來，就變成 Jump Game II：每一層挑能延伸最遠的，層數就是最少片段數。認出「最遠可達」這個狀態，很多覆蓋問題就都是同一題。",
    },
  ],
  cue: "能不能到達、最遠可達、最少幾跳、每格能往前跳幾步、覆蓋整段用最少片段、油量會不會變負。",
  steps: [
    "`far = 0`。從 i = 0 開始往右掃。",
    "若 `i > far`，第 i 格踩不到，回傳 false。",
    "`far = max(far, i + nums[i])`。若 `far >= n − 1`，回傳 true。",
    "最少跳數版：另外記 `cur_end`（這一跳的右邊界）與 `jumps`。掃到 `i == cur_end` 時 `jumps += 1`、`cur_end = far`。",
    "迴圈只到 n − 2，`cur_end >= n − 1` 時提早結束，回傳 jumps。",
  ],
  demoNote:
    "切換兩個問題和兩組陣列。綠色格子是目前確定踩得到的，far 只會往右長。最少跳數版多了一條黃色邊界 cur_end，掃到邊界就跳一次；黃色格子是每次起跳的位置。試試「卡在 0」那組，看 far 是怎麼停下來的。",
  codeNote: "能不能到、最少幾跳，以及同型的加油站問題。三個函式都是一趟掃描加一兩個變數。",
  problems: [
    { src: "LeetCode 55", name: "Jump Game", diff: "Medium" },
    { src: "LeetCode 45", name: "Jump Game II", diff: "Medium" },
    { src: "LeetCode 134", name: "Gas Station", diff: "Medium" },
    { src: "LeetCode 1024", name: "Video Stitching（片段覆蓋，同 Jump Game II）", diff: "Medium" },
    { src: "LeetCode 1306", name: "Jump Game III（可以往左跳，改用 BFS）", diff: "Medium" },
    { src: "LeetCode 1326", name: "Minimum Number of Taps to Open to Water a Garden", diff: "Hard" },
  ],
};
