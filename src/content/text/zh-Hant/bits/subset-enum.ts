import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Bitwise Basics、Subsets",
  applications: [
    {
      title: "組一支技能全包、人數最少的專案小組",
      problem: "新專案需要前端、後端、資料庫、DevOps、設計、測試 6 種技能，部門裡 10 位工程師各會其中幾種。主管想挑出人數最少、而且 6 種技能都有人會的小組。",
      why: "每位工程師會的技能存成一個 6 位元整數，一個小組就是一個 10 位元的 mask。從 0 數到 1023，把 mask 裡每個人的技能 OR 起來，等於 111111₂ 就是全包，mask 裡 1 的個數就是人數。1024 種小組、每種最多 10 次 OR，一萬次運算以內，不用遞迴，也不用另外存一份名單。",
    },
    {
      title: "36 箱貨分給兩台貨車，載重要盡量平均",
      problem: "倉庫有 36 箱重量不一的貨要分給兩台貨車，兩車總重的差距越小越好。每箱只有上 A 車或上 B 車兩種選擇，全部試一遍是 2³⁶ ≈ 687 億種，跑不完。",
      why: "把箱子拆成前後各 18 箱，各自用 mask 列出 2¹⁸ = 262,144 種子集重量，每個子集由「少一箱的子集」再加一箱遞推，O(1) 就算好。排序其中一半，對另一半的每個重量二分搜尋最接近「總重的一半」的搭配，一千萬次左右的運算就找到最佳分法。這叫折半列舉，是 n 在 40 左右時的標準做法。",
    },
    {
      title: "拼字遊戲：七個字母能拼出哪些單字",
      problem: "拼字遊戲每題給 7 個不同字母，玩家要找出只用這些字母、而且一定用到中間那個字母的單字。題庫有 1 萬題、字典有 10 萬個單字，逐題逐字比對要 10 億次。",
      why: "單字只在乎「用了哪些字母」，把它壓成 26 位元的 mask，先用雜湊表數好每個 mask 對應幾個單字。一題除了中間字母以外的 6 個字母只有 2⁶ = 64 個子集合，用 sub = (sub − 1) & mask 一個不漏地列出來、各自加上中間字母去查表，1 萬題總共 64 萬次查詢。",
    },
  ],
  cue: "n ≤ 20、每個元素選或不選、把集合存成一個整數、所有組合都試一遍、集合的聯集與交集、列出某個集合的所有子集合、3ⁿ、n 在 40 左右（折半列舉）、Bitmask DP 的狀態。",
  steps: [
    "確認規模：列舉所有子集要 n ≤ 20 左右；還要列每個子集的子集合（3ⁿ）要 n ≤ 15 左右；n 在 40 左右就拆成兩半各自列舉。把元素編號 0 到 n − 1，**第 i 位對應第 i 個元素**。",
    "外層迴圈 `for mask in range(1 << n)`，每個整數就是一個子集。C++ 裡 n 可能到 31 以上時改用 `1LL << n`。",
    "內層用 `mask >> i & 1` 取出選了哪些元素，累積要算的量（總和、技能的 OR、有沒有衝突）。子集大小是 mask 的 popcount，只要大小恰好 k 的子集就先用它篩掉其他的。",
    "要算的量若能由「少一個元素的子集」推出，就開一張大小 2ⁿ 的表遞推：對每個 i 與 `mask < 1 << i`，`f[mask | 1 << i] = f[mask] + a[i]`，省掉內層的 O(n)。",
    "只要某個 mask 的子集合：`sub = mask`，處理完 sub 後若 `sub == 0` 就停，否則 `sub = (sub - 1) & mask`。不需要空集合時，迴圈條件直接寫 `sub > 0`。",
  ],
  demoNote:
    "元素是 A、B、C、D，第 i 位對應第 i 個元素，所以 A 是最右邊的 bit 0。前半段 mask 從 0 數到 15：左邊是目前 mask 的 4 個位元，藍色的位是 1，底下綠色的就是被選的元素；右邊 16 格裡藍色是目前的 mask，綠色是已經列過的。後半段只列 mask = 1011₂（A、B、D）的子 mask，C 那一位畫成虛線、永遠是 0，不是子 mask 的格子變灰。留意 sub 從 1000₂ 一步跳到 0011₂，中間四個含 C 的整數被 AND 一次跳過，8 個子 mask 走完就停。",
  codeNote:
    "四個函式：核心的 mask 迴圈列出所有子集；用它找人數最少、技能全包的小組，示範 OR 做聯集、popcount 算人數；子集總和的 O(2ⁿ) 遞推，折半列舉就是對兩半各跑一次它；最後是子集合列舉，並驗證對所有 mask 各列一次總共是 3ⁿ 次。C++ 只用標準的 `std::bitset` 數 1 的個數和印二進位。",
  problems: [
    { src: "LeetCode 78", name: "Subsets（改用 mask 迴圈，不用遞迴）", diff: "Medium" },
    { src: "LeetCode 2212", name: "Maximum Points in an Archery Competition（列舉要贏哪幾區）", diff: "Medium" },
    { src: "LeetCode 2397", name: "Maximum Rows Covered by Columns（每一列存成 mask）", diff: "Medium" },
    { src: "LeetCode 2002", name: "Maximum Product of the Length of Two Palindromic Subsequences（兩個不相交的 mask）", diff: "Medium" },
    { src: "LeetCode 1178", name: "Number of Valid Words for Each Puzzle（子集合列舉）", diff: "Hard" },
    { src: "LeetCode 1755", name: "Closest Subsequence Sum（折半列舉）", diff: "Hard" },
  ],
};
