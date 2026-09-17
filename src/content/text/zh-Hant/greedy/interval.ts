import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Greedy Principles",
  applications: [
    {
      title: "一間會議室，最多能排幾場會",
      problem: "九個團隊都申請了同一間會議室，時段互相重疊。行政要在不動任何人時間的前提下，塞進最多場會議。試所有組合是 2⁹ 種，人數多一點就爆炸。",
      why: "按結束時間排序，每次選最早結束而且不衝突的那場。結束得早，留給後面的時間就多，這個直覺可以用交換論證證明是最佳。排序一次加一趟掃描，O(n log n)。",
    },
    {
      title: "CPU 的工作排程",
      problem: "作業系統一次只能跑一個工作，每個工作有到達時間和所需時間。想讓完成的工作數最多，或讓平均等待時間最短。",
      why: "「完成數最多」就是區間排程，先跑最早結束的。「平均等待最短」是它的近親，最短工作優先（SJF），同樣用交換論證證明：把長工作和短工作對調，總等待時間只會變短。",
    },
    {
      title: "廣告時段與機台預約",
      problem: "廣告代理商要在一天的節目裡插進最多支廣告，每支有指定時段；工廠的機台被多個訂單預約，重疊的要合併成一段來計算佔用時間；或者反過來，同時最多有幾個訂單在跑，需要幾台機器。",
      why: "這三個都是區間問題的變形：選最多個不重疊（按結束時間）、合併重疊（按開始時間）、最多同時幾個（掃描線）。認出區間的形狀，就知道排序依據該選誰。",
    },
  ],
  cue: "會議室、時段、不重疊、最多場、合併區間、同時最多幾個、按結束時間排序。",
  steps: [
    "把所有區間按**結束時間**由小到大排序。",
    "初始化 `last_end = −∞`，代表目前已選區間的最後結束時間。",
    "依序看每個區間 (s, e)：若 `s >= last_end`，選它，`last_end = e`；否則跳過。",
    "掃完就是答案，被選的區間互不重疊而且數量最多。",
    "變形：要**合併**改按開始時間排序、延長結束；要**算同時最多幾個**改用掃描線，開始 +1 結束 −1。",
  ],
  demoNote:
    "九場會議申請一間會議室。第一步先按結束時間排序，之後每一步看一場：開始時間不早於黃線（目前最後結束時間）就排進去，否則跳過。留意 B「面試」和 G「一對一」這種長會議是怎麼被自然淘汰的。",
  codeNote:
    "區間排程本體，加上兩個最常見的變形：合併重疊區間和最少會議室數。三段都是排序加一趟掃描，差別只在排序依據和掃描時做什麼。",
  problems: [
    { src: "LeetCode 2446", name: "Determine if Two Events Have Conflict（兩個區間重不重疊）", diff: "Easy" },
    { src: "LeetCode 435", name: "Non-overlapping Intervals（n 減掉區間排程的答案）", diff: "Medium" },
    { src: "LeetCode 56", name: "Merge Intervals", diff: "Medium" },
    { src: "LeetCode 2406", name: "Divide Intervals Into Minimum Number of Groups（就是最少會議室數，掃描線或最小堆積）", diff: "Medium" },
    { src: "LeetCode 452", name: "Minimum Number of Arrows to Burst Balloons", diff: "Medium" },
    { src: "LeetCode 1353", name: "Maximum Number of Events That Can Be Attended（每天選最早結束的）", diff: "Medium" },
  ],
};
