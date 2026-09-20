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
  quiz: [
    {
      q: "一個遞迴函式沒有 base case，執行時會發生什麼？",
      choices: ["回傳 0", "立刻回傳正確答案", "無限遞迴直到 stack overflow", "編譯錯誤"],
      answer: 2,
      why: "沒有可以直接回答的最小情況，每次呼叫都再呼叫自己，呼叫堆疊不斷長高直到溢位。",
    },
    {
      q: "`factorial(n)` 的遞迴深度是 n。它的空間複雜度至少是？",
      choices: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
      answer: 2,
      why: "每一層呼叫都在呼叫堆疊上佔一筆紀錄，深度 n 就是 O(n) 的空間，即使函式本身沒有開任何陣列。",
    },
    {
      q: "寫 recursive case 時，「遞迴信仰」要你怎麼做？",
      choices: ["一層一層追蹤每次呼叫的值", "相信遞迴呼叫會回傳正確答案，只檢查這一層有沒有正確使用它", "先把遞迴改成迴圈再想", "每次呼叫都印出參數確認"],
      answer: 1,
      why: "這是數學歸納法的程式版：假設小問題已經解對，只負責把小答案拼成大答案。",
    },
    {
      q: "下列哪一個遞迴呼叫**沒有**朝 base case 前進？",
      choices: ["`sum(arr[1:])` 處理更短的串列", "`fib(n - 1) + fib(n - 2)`", "`dfs(node.left)` 往子樹走", "`solve(n)` 在 `solve(n)` 裡再呼叫 `solve(n)`"],
      answer: 3,
      why: "參數完全沒變，問題沒有變小，永遠到不了 base case。前三個分別是串列變短、數字變小、樹往下走。",
    },
  ],
};
