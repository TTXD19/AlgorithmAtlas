import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Array & Dynamic Array",
  applications: [
    {
      title: "編輯器的括號檢查與 Ctrl+Z",
      problem: "程式碼裡的括號要成對，而且「最近打開的必須最先關閉」。undo 也一樣：最後做的操作要最先被撤銷。",
      why: "堆疊只允許從同一端進出，天生就是「後進先出」。左括號推入、右括號彈出比對；每個操作推入、undo 就彈出。結構本身就表達了規則。",
    },
    {
      title: "函式呼叫怎麼記得「回到哪裡」",
      problem: "A 呼叫 B、B 呼叫 C，C 結束後要回到 B 的哪一行、B 結束後回到 A 的哪一行？遞迴時同一個函式還有幾十層。",
      why: "呼叫堆疊：每次呼叫推入一層紀錄，返回就彈出。遞迴那篇看到的 call stack 就是堆疊。DFS 用堆疊、BFS 用佇列，也是同一個道理。",
    },
    {
      title: "計算機怎麼算 3 + 4 × 2",
      problem: "運算式有優先順序和括號，從左到右直接算會錯。編譯器、試算表、計算機都要正確處理。",
      why: "把運算式轉成後綴（逆波蘭）表示法，用一個堆疊就能從左到右一次算完：數字推入、遇到運算子彈兩個算完推回去。",
    },
  ],
  cue: "後進先出、最近的先處理、配對、undo、巢狀結構、運算式求值、DFS 的迭代版。",
  steps: [
    "辨認問題有沒有「**最近的先處理**」的結構：巢狀、配對、回溯、需要記得走過的路。",
    "決定堆疊裡**存什麼**：字元、索引、還是 (值, 附加資訊) 的組合。存索引通常比存值靈活。",
    "從左到右掃輸入。遇到「開啟」就 push；遇到「關閉」先檢查**堆疊是否為空**，再和頂端比對後 pop。",
    "掃完後檢查堆疊**是否清空**：剩東西通常代表有未關閉的項目。",
    "用三種輸入驗證：空輸入、只有關閉沒有開啟、只有開啟沒有關閉。",
  ],
  demoNote: "選一個字串逐步看括號配對：左括號推入，右括號和頂端比對後彈出。三種不合法的情況分別在哪一步被抓到。",
  codeNote: "基本操作、括號配對、後綴表達式求值、以及每層多存一個最小值的 Min Stack。C++ 注意 `pop()` 不回傳值，要先 `top()`。",
  problems: [
    { src: "LeetCode 20", name: "Valid Parentheses", diff: "Easy" },
    { src: "LeetCode 155", name: "Min Stack", diff: "Medium" },
    { src: "LeetCode 150", name: "Evaluate Reverse Polish Notation", diff: "Medium" },
    { src: "LeetCode 71", name: "Simplify Path", diff: "Medium" },
    { src: "LeetCode 394", name: "Decode String（巢狀）", diff: "Medium" },
    { src: "LeetCode 224", name: "Basic Calculator", diff: "Hard" },
  ],
};
