import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Trie、KMP、Word Search",
  applications: [
    {
      title: "防毒軟體比對大量病毒碼",
      problem: "防毒軟體的特徵資料庫有數十萬條病毒碼，每一條是一段位元組序列。掃描一個 50 MB 的檔案時，如果每條病毒碼各自在檔案裡搜尋一次，就是把檔案從頭讀幾十萬遍，完全不能接受。",
      why: "把所有病毒碼插進同一棵字典樹，再用 BFS 補上失敗連結，就是 Aho–Corasick 自動機。檔案只要從頭讀一遍，每讀一個位元組就在自動機上走一步，走不下去沿失敗連結往回跳，總時間是檔案長度加上命中次數，和病毒碼有幾條幾乎無關。開源防毒軟體 ClamAV 就用 Aho–Corasick 比對它的特徵碼。",
    },
    {
      title: "拼字遊戲的解題器",
      problem: "Boggle 拼字遊戲是一個 4 × 4 的字母方格，相鄰的格子（不能重複使用）可以連成單字。解題器要從一本 17 萬字的英文字典裡，找出方格中所有能拼出的單字。對每個單字各做一次方格搜尋，是 17 萬次回溯。",
      why: "把字典建成字典樹，只在方格上做一次 DFS，而且 DFS 時帶著目前的字典樹節點：下一格的字母如果不是子節點，就代表字典裡沒有任何單字以這個前綴開頭，立刻剪枝。大部分的路徑走兩三格就被剪掉，找到的單字從樹上移除，已經找完的整段前綴也跟著剪掉，越搜越快。",
    },
    {
      title: "分散式網路尋找最近的節點",
      problem: "BitTorrent 的 DHT 網路裡有數百萬台電腦，每台電腦和每份資料都有一個 160 位元的 ID，資料存放在 ID 和它「最接近」的幾台電腦上。Kademlia 協定把兩個 ID 的距離定義為兩者 XOR 的值，查詢時要快速找到距離某個 ID 最近的節點。",
      why: "XOR 距離由最高的不同位元決定，所以把 ID 的二進位從最高位開始插進字典樹，共同前綴越長的節點距離越近。找最近的節點，就是從最高位往下，每一位盡量走和目標相同的位元；反過來要找 XOR 最大的數，就每一位盡量走相反的位元。Kademlia 的路由表正是依照共同前綴長度分組，查詢只需要 O(log n) 次跳轉。",
    },
  ],
  cue: "很多個模式要在同一段文字裡一起找、字典裡的大量單字要在方格或圖上搜尋、需要前綴剪枝、整數的位元當成字元（最大 XOR、XOR 距離）、依前綴統計數量。",
  steps: [
    "決定「字元」是什麼：一般字串用字元，整數用固定位數的位元（從最高位開始），把所有字串或數字插進字典樹。",
    "要在方格或圖上找很多單字：DFS 時帶著目前的字典樹節點，下一格的字元不是子節點就剪枝；走到結尾標記就收下答案並清掉標記。",
    "要在文字裡同時找很多模式：用 BFS 替每個節點補失敗連結 `fail(v)`，並把 `fail(v)` 的輸出併進 v 的輸出。",
    "掃描文字：每讀一個字元，走不下去就沿失敗連結往回跳，直到能走或回到根；抵達節點時回報它的所有輸出。",
    "整數的最大 XOR：查詢 x 時從最高位往下，每一位優先走和 x 相反的位元，沒有才走相同的，沿路組出的就是最大的 XOR 值。",
  ],
  demoNote:
    "用 Aho–Corasick 在文字 ushers 裡同時找 he、she、his、hers。第一段插入四個關鍵字，藍色是剛建好的節點，綠色是關鍵字結尾。第二段用 BFS 補失敗連結，黃色虛線是不指向根的連結，每一步說明從父節點的失敗連結出發怎麼找：sh 指向 h、his 指向 s、she 指向 he，而且因為 he 是關鍵字，走到 she 時要一起回報 he；hers 指向 s。第三段掃描文字：藍色是目前的狀態，讀到 e 時抵達 she，同時回報 she 和 he；讀到 r 時 she 沒有 r 這條邊，沿著藍色虛線跳到 he，再往下走到 her；最後讀到 s 抵達 hers。文字只讀了一遍，三個關鍵字全部找到。",
  codeNote:
    "Python 放用字典實作的 Aho–Corasick、帶著字典樹剪枝的 Word Search II（就是 LeetCode 212），以及位元字典樹求最大 XOR。C++ 放陣列版的 Aho–Corasick，建完後把缺少的轉移補齊成完整的自動機，掃描時每個字元只查一次表；另外是陣列版的位元字典樹。",
  problems: [
    { src: "LeetCode 720", name: "Longest Word in Dictionary（每個前綴都要是單字）", diff: "Medium" },
    { src: "LeetCode 421", name: "Maximum XOR of Two Numbers in an Array（位元字典樹）", diff: "Medium" },
    { src: "LeetCode 2416", name: "Sum of Prefix Scores of Strings（節點上記錄經過次數）", diff: "Hard" },
    { src: "LeetCode 1032", name: "Stream of Characters（Aho–Corasick，或把單字反轉建樹）", diff: "Hard" },
    { src: "LeetCode 1707", name: "Maximum XOR With an Element From Array（離線排序後逐步插入位元字典樹）", diff: "Hard" },
    { src: "LeetCode 745", name: "Prefix and Suffix Search", diff: "Hard" },
  ],
};
