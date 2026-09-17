import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Singly Linked List、Recursion",
  applications: [
    {
      title: "面試最常出現的串列題",
      problem: "Reverse Linked List 幾乎是每家公司的暖身題，再往上是反轉區間、每 k 個一組反轉、判斷回文串列。它們全部建立在同一個三指標動作上。",
      why: "反轉串列是「指標操作」最純粹的練習：每個節點只做一件事（把箭頭轉向），但順序錯了整條就斷。練到不用想就寫對，之後的串列題都是這個動作的變形。",
    },
    {
      title: "把數字串列相加、判斷回文",
      problem: "兩個用串列表示的大數要相加（個位數在最後），或判斷一個串列讀正讀反都一樣。串列只能往前走，沒辦法從尾巴倒著看。",
      why: "把後半段反轉，就能從兩端同時往中間走。這是「用 O(1) 空間處理需要倒著看的問題」的標準手法，比複製成陣列省記憶體。",
    },
    {
      title: "理解遞迴版與迭代版的取捨",
      problem: "同一件事，迭代版三個指標搞定，遞迴版四行但要 O(n) 的呼叫堆疊。串列一長遞迴就爆。",
      why: "這是最適合對照兩種寫法的題目。迭代版是實務上該用的，遞迴版是「相信更小的自己」那個思考方式的最佳範例。",
    },
  ],
  cue: "反轉、倒著看、從尾巴開始、回文串列、k 個一組、區間反轉、prev / cur / next 三指標。",
  steps: [
    "`prev = None`、`cur = head`。",
    "迴圈條件 `while cur`。進入後**先** `nxt = cur.next`，保住後面的路。",
    "`cur.next = prev`，箭頭轉向。這是唯一真正改變結構的一行。",
    "`prev = cur`、`cur = nxt`，兩個指標一起往前一格。順序不能反，否則 cur 會追不到原本的下一個。",
    "迴圈結束回傳 `prev`。用空串列、單節點、兩節點各跑一次確認邊界。",
  ],
  demoNote: "逐步執行迭代版。看每一輪四個動作怎麼把一個節點的箭頭轉向：綠色是已經反轉好的部分，prev 永遠停在它的頭。",
  codeNote:
    "迭代版、遞迴版、以及用頭插法反轉區間。三個都建議手寫一次，遞迴版特別注意 `head.next.next = head` 那一行在做什麼。",
  problems: [
    { src: "LeetCode 206", name: "Reverse Linked List", diff: "Easy" },
    { src: "LeetCode 234", name: "Palindrome Linked List（找中點 + 反轉後半）", diff: "Easy" },
    { src: "LeetCode 92", name: "Reverse Linked List II（區間反轉）", diff: "Medium" },
    { src: "LeetCode 24", name: "Swap Nodes in Pairs", diff: "Medium" },
    { src: "LeetCode 25", name: "Reverse Nodes in k-Group", diff: "Hard" },
  ],
};
