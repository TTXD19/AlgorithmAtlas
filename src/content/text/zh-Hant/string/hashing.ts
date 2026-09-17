import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Hash Table、Prefix Sum、Binary Search",
  applications: [
    {
      title: "找出被複製貼上的最長片段",
      problem:
        "一個 50 萬字元的原始碼檔案，想找出「出現至少兩次的最長子字串」，當作重複程式碼的線索。枚舉所有起點配對已經是上千億對，每對還要逐字元往後比，完全跑不完。",
      why: "長度 L 的片段若有重複，長度 L−1 一定也有，所以可以二分長度。每猜一個 L，把所有長度 L 的子字串雜湊值丟進集合，看有沒有重複。子字串雜湊是 O(1) 取出來的，每一輪只要 O(n)，整個問題降到 O(n log n)。",
    },
    {
      title: "雜湊表裡的字串鍵與 HashDoS 攻擊",
      problem:
        "網站後端把使用者送來的表單欄位名稱放進雜湊表。攻擊者若刻意送出幾萬個雜湊值完全相同的名稱，所有鍵都擠進同一個桶子，每次插入都要和整條鏈比較，一個請求就能讓伺服器忙好幾秒。",
      why: "Java 的 String.hashCode 就是底數 31、自然溢位的多項式雜湊。「Aa」和「BB」的值都是 2112，把它們任意串接起來也全部碰撞，長度 2n 的碰撞字串就有 2ⁿ 個。2011 年底公開的 HashDoS 攻擊利用的正是這種固定底數，之後 Python、Ruby 等語言改用每次啟動隨機的雜湊種子，Java 8 則把碰撞過多的桶子改成平衡樹。自己寫字串雜湊時，底數也要隨機選。",
    },
    {
      title: "把所有後綴排序",
      problem:
        "建立基因組的後綴陣列，或做 bzip2 使用的 Burrows–Wheeler 轉換，都要把一個長字串的所有後綴排好順序。一般排序每次比較兩個後綴最壞要 O(n)，n 個後綴排下來是 O(n² log n)。",
      why: "比較兩個後綴等於「先找最長共同前綴，再比下一個字元」。「前 L 個字元相同」對 L 是單調的，所以能用子字串雜湊二分出共同前綴長度，每次比較降到 O(log n)，整個排序 O(n log² n)。專門的 SA-IS 演算法可以做到 O(n)，但雜湊版只要幾十行。",
    },
  ],
  cue: "大量檢查兩段子字串是否相等、把子字串放進集合或雜湊表、二分長度找最長重複、最長共同前綴、字典序比較，而且可以接受極小的出錯機率。",
  steps: [
    "選一個大質數 M（常用 `2⁶¹−1`，或 `10⁹+7` 與 `998244353` 一起用），底數 B 在程式啟動時從 `[256, M)` 隨機挑。",
    "由左到右建表：`h[0] = 0`、`pw[0] = 1`，`h[i+1] = (h[i]·B + s[i]) mod M`，`pw[i+1] = pw[i]·B mod M`。",
    "取子字串 `s[l, r)` 的雜湊：`(h[r] − h[l]·pw[r−l]) mod M`，結果若是負數就加上 M。",
    "比較兩段：長度不同或雜湊不同就一定不相等；雜湊相同視為相等，必須絕對正確時再逐字元確認。",
    "要找最長重複片段或最長共同前綴時，利用「長度 L 成立，L−1 也成立」的單調性二分長度，每次檢查都用 O(1) 的子字串雜湊。",
  ],
  demoNote:
    "s = abcabca，為了能手算，底數 B = 31、模數 M = 101，字元值 a = 1、b = 2、c = 3。前半段逐字元建表：藍色是剛讀到的字元和剛算出的 h、pw，框裡寫出這一步的算式。建完表後做三次比較：黃色是第一段以及公式用到的 h、pw 格子，第二段和第一段雜湊相同時變綠色、不同時變藍色。s[0, 3) 和 s[3, 6) 都是 abc，雜湊都是 16；s[1, 4) 和 s[4, 7) 都是 bca，都是 97；abc 對 bca 是 16 對 97，一定不同，不必逐字元比。M = 101 只有 101 種值，子字串一多就會碰撞，真正使用時要換成上面說的大模數。",
  codeNote:
    "Python 用單一模數 2⁶¹−1（Python 整數不會溢位），示範子字串比較和二分長度找最長重複片段，最後重現 Java 字串雜湊的碰撞。C++ 用 10⁹+7 與 998244353 雙模數，所有乘法都在 64 位元內，並用雜湊二分最長共同前綴來做後綴排序。兩種語言的底數都在啟動時隨機選，每次執行的雜湊值不同，但印出來的答案一樣。",
  problems: [
    { src: "LeetCode 187", name: "Repeated DNA Sequences（固定長度 10，雜湊放進集合）", diff: "Medium" },
    { src: "LeetCode 718", name: "Maximum Length of Repeated Subarray（陣列也能雜湊，二分長度）", diff: "Medium" },
    { src: "LeetCode 1044", name: "Longest Duplicate Substring（二分長度 + 雜湊集合，要注意碰撞）", diff: "Hard" },
    { src: "LeetCode 1147", name: "Longest Chunked Palindrome Decomposition（從兩端貪心，雜湊比較頭尾片段）", diff: "Hard" },
    { src: "LeetCode 1316", name: "Distinct Echo Substrings（子字串雜湊判斷前後兩半相等，再去重）", diff: "Hard" },
    { src: "LeetCode 2223", name: "Sum of Scores of Built Strings（每個後綴和整串的共同前綴，二分；Z-Algorithm 篇會再遇到）", diff: "Hard" },
  ],
};
