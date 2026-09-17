import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Big-O Notation",
  applications: [
    {
      title: "計算資料夾的大小",
      problem: "資料夾裡有檔案和子資料夾，子資料夾裡又有檔案和子資料夾，不知道有幾層深。",
      why: "遞迴只描述「一層」的規則：我的大小 = 我的檔案 + 每個子資料夾的大小。子資料夾怎麼算？用同一個函式。層數多深都不用管。",
    },
    {
      title: "渲染巢狀的 UI 元件",
      problem: "留言底下有回覆，回覆底下還有回覆；選單裡有子選單。React 元件要畫出這種結構。",
      why: "元件在自己裡面再渲染自己，就是遞迴。任何「結構裡包含同樣的結構」的資料，遞迴都是最自然的寫法。",
    },
    {
      title: "之後要學的一半東西都建立在它上面",
      problem: "樹的走訪、DFS、合併排序、快速排序、回溯、動態規劃，全部都是遞迴的變形。",
      why: "先把「相信更小的自己會回傳正確答案」這個思考方式練熟，後面那些演算法就只是換一個問題來拆。",
    },
  ],
  cue: "結構裡包含同樣的結構、不知道有幾層、把問題縮小一點會變成同樣的問題、樹狀資料。",
  steps: [
    "定義函式的**意義**：`factorial(n)` 回傳 n 的階乘。意義要說得清楚，後面才能「相信」它。",
    "寫 **base case**：最小、可以直接回答的情況。`n == 1` 回傳 1。沒有 base case 就會無限遞迴。",
    "寫 **recursive case**：假設 `factorial(n - 1)` 已經是對的，那 `factorial(n)` 就是 `n * factorial(n - 1)`。",
    "確認每次遞迴呼叫都**朝 base case 前進**（n 變小、串列變短、樹往下走），否則不會停。",
    "估算**深度**：階乘深度是 n，二分的深度是 log n。深度太大時改用迭代或明確的堆疊。",
  ],
  demoNote: "逐步執行 factorial(4)。左邊是目前執行到哪一行，右邊是呼叫堆疊：先一層層推入、到 base case 後再一層層回傳。",
  codeNote: "三個例子分別對應「數字縮小」、「串列縮短」、「樹往下走」三種遞迴形狀，最後附上迭代版做對照。",
  problems: [
    { src: "LeetCode 344", name: "Reverse String（用遞迴做）", diff: "Easy" },
    { src: "LeetCode 509", name: "Fibonacci Number", diff: "Easy" },
    { src: "LeetCode 206", name: "Reverse Linked List（遞迴版）", diff: "Easy" },
    { src: "LeetCode 70", name: "Climbing Stairs（先寫遞迴，體會為什麼慢）", diff: "Easy" },
    { src: "LeetCode 779", name: "K-th Symbol in Grammar", diff: "Medium" },
  ],
};
