import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Z-Algorithm",
  applications: [
    {
      title: "找出限制酶的切位",
      problem: "分子生物學實驗要知道一段 5 萬鹼基的質體上，哪些位置會被限制酶切開。很多限制酶辨識的序列是「反向互補等於自己」的片段，例如 EcoRI 的 GAATTC，反過來讀再把 A、T 與 C、G 互換，還是 GAATTC。",
      why: "把回文的「對稱位置相等」換成「對稱位置互補」，Manacher 的鏡像論證一樣成立，因為互補關係對調兩次會回到原本的字母；唯一要多加的規定是中心必須落在兩個鹼基之間，因為沒有鹼基和自己互補。一次 O(n) 就得到每個中心能延伸多遠，所有長度至少 6 的互補回文一起列出，再和限制酶的辨識序列表對照。",
    },
    {
      title: "統計病毒基因組裡的回文密度",
      problem: "研究者觀察到疱疹病毒的基因組裡，有些區域的回文序列特別密集，而這些區域常常就在 DNA 複製起點附近。要在 20 多萬鹼基的基因組上，用滑動區間統計每一段裡回文的數量，找出異常密集的地方。",
      why: "Manacher 算出每個中心的最長回文半徑之後，以同一個中心、較短的回文全部都成立，所以每個中心的回文數量直接由半徑算出，不必逐一展開。整條基因組 O(n) 處理完，再用前綴和就能 O(1) 查詢任意區間內的回文數量。",
    },
    {
      title: "大量的「這一段是不是回文」查詢",
      problem: "把一個長 2,000 的字串切成最少段回文，動態規劃枚舉切點時要問上百萬次「s[l..r] 是不是回文」；另一類題目則是字串長 10 萬、查詢 10 萬次。每次都從兩端往中間比，最壞 O(n) 一次。",
      why: "s[l..r] 在插入分隔字元後的中心是 l + r + 1，它是回文當且僅當那個中心的半徑至少是 r − l + 1。Manacher 預處理 O(n) 之後，每次查詢 O(1)，也不需要 O(n²) 的回文表。",
    },
  ],
  cue: "最長回文子字串、回文子字串的數量、以每個位置為中心能延伸多遠、大量區間回文查詢、DNA 反向互補片段、需要比 O(n²) 中心展開更快。",
  steps: [
    "在 s 的每個字元之間和頭尾插入分隔字元，得到長度 `2n + 1` 的 T；p 陣列全部設 0，`c = r = 0`。",
    "對每個 i：若 `i < r`，令 `p[i] = min(p[2c − i], r − i)`；否則 `p[i] = 0`。",
    "在兩端都沒有越界、而且 `T[i − p[i] − 1] = T[i + p[i] + 1]` 時，p[i] 加 1。",
    "若 `i + p[i] > r`，令 `c = i`、`r = i + p[i]`。",
    "讀答案：最大的 `p[i]` 是最長回文長度，在 s 中從 `(i − p[i]) / 2` 開始；`s[l..r]` 是回文當且僅當 `p[l + r + 1] ≥ r − l + 1`。",
  ],
  demoNote:
    "s = abaaba 插入 # 之後是 T = #a#b#a#a#b#a#，長度 13。第一列的藍色是 i，綠色是它相對於目前中心的鏡像 2c − i，黃色是以 i 為中心展開出的回文；第二列標出右界最遠的回文。i = 1 和 3 都在右界外，老實展開，i = 3 以 b 為中心得到半徑 3，也就是 aba，右界推到 6。i = 4 的鏡像是 2，p[2] = 0 比到右界的 2 格小，直接抄 0。i = 6 是 aa 中間的 #，鏡像 p[0] = 0 等於到右界的 0 格，只能自己展開，一路擴到 T 的兩端，半徑 6，右界推到 12。之後 i = 7、8、10 全部抄鏡像；i = 9、11、12 的鏡像半徑剛好等於到右界的距離，但右界已經是字串結尾，比一次就停。最大的 p 在 i = 6，對應 s 從 0 開始、長度 6 的 abaaba。",
  codeNote:
    "Python 用 None 當分隔字元，保證不會和任何字元相等，並示範最長回文、回文子字串計數，以及 O(1) 的區間回文查詢。C++ 把「兩個對稱位置算不算相符」抽成參數，同一份 Manacher 既能找一般回文，也能找 DNA 的互補回文；和自己不相符的位置不能當中心，這一行對一般回文沒有影響，對 DNA 則排除了以鹼基為中心的假回文。範例裡找出的兩個片段正是 EcoRI 和 BamHI 的切位。",
  problems: [
    { src: "LeetCode 5", name: "Longest Palindromic Substring", diff: "Medium" },
    { src: "LeetCode 647", name: "Palindromic Substrings（每個中心貢獻 ⌈p / 2⌉ 個）", diff: "Medium" },
    { src: "LeetCode 132", name: "Palindrome Partitioning II（DP 裡的回文判斷改成 O(1) 查詢）", diff: "Hard" },
    { src: "LeetCode 2472", name: "Maximum Number of Non-overlapping Palindrome Substrings", diff: "Hard" },
    { src: "LeetCode 1960", name: "Maximum Product of the Length of Two Palindromic Substrings（Manacher 加前後綴最大值）", diff: "Hard" },
    { src: "LeetCode 3327", name: "Check if DFS Strings Are Palindromes（樹的走訪序列上跑 Manacher）", diff: "Hard" },
  ],
};
