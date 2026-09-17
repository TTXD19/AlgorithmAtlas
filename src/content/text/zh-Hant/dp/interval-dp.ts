import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Memoization & Tabulation、1-D DP",
  applications: [
    {
      title: "一串矩陣先乘哪兩個",
      problem: "數值計算裡要算 A·B·C，A 是 10×30、B 是 30×5、C 是 5×60。矩陣乘法有結合律，先算 (AB)C 或 A(BC) 結果一樣，但計算量天差地遠；實際的模型裡這樣的矩陣有十幾個。",
      why: "(AB)C 要 10·30·5 + 10·5·60 = 4,500 次純量乘法，A(BC) 要 27,000 次，差了六倍。一段連續矩陣的最佳成本，由「最後一次乘法切在哪裡」決定：左邊一段、右邊一段各自最佳，再加上把兩個結果相乘的成本。枚舉切點、由短區間算到長區間，十幾個矩陣瞬間算完。",
    },
    {
      title: "日誌系統合併相鄰的小檔案",
      problem: "日誌服務每小時產生一個檔案，一天 24 個大小不一。為了減少小檔案，要把它們合併成一個大檔，每次只能合併時間上相鄰的兩個（才能保持時間順序），合併的成本是兩個檔案的大小總和。",
      why: "如果任兩個都能合併，每次挑最小的兩個就是 Huffman 的貪婪法；但「只能合併相鄰的」讓貪婪失效。區間 [i, j] 的最後一次合併，一定是把 [i, k] 和 [k+1, j] 兩個已經合好的檔案接起來，成本是整段大小總和，所以 dp[i][j] = min over k 的 dp[i][k] + dp[k+1][j] + 區間總和。",
    },
    {
      title: "RNA 會怎麼摺疊",
      problem: "一條 RNA 由 A、U、G、C 組成，A 會和 U 配對、G 會和 C 配對，而且配對的連線不能交叉。生物學家想預測一條幾百個鹼基的 RNA 最多能形成幾對，當作穩定結構的第一步估計。",
      why: "看區間 [i, j] 的第 j 個鹼基：它不配對，答案就是 [i, j−1]；它和中間某個 k 配對，因為連線不能交叉，就把問題切成 [i, k−1] 和 [k+1, j−1] 兩段各自獨立。這是 Nussinov 演算法，一個 O(n³) 的區間 DP。",
    },
  ],
  cue: "一段連續的東西、合併相鄰的兩段、最後一步切在哪裡、括號化、戳氣球、回文、三角剖分、dp[i][j] 看一個區間、依區間長度由短到長。",
  steps: [
    "定義 `dp[i][j]` 為區間的最佳答案，決定用開區間還是閉區間，需要時在兩端補上哨兵（戳氣球補 1）。",
    "填好 base case：長度 1（閉區間）或相鄰兩端之間沒有元素（開區間）的區間。",
    "外層 `length` 由小到大，內層枚舉起點 `i`，算出 `j`。",
    "枚舉分割點或「最後一步」k，`dp[i][j] = best(dp[i][k] ⊕ dp[k+1][j] + 合併成本)`；要還原方案就記下最佳的 k。區間總和這類成本先用前綴和備好。",
    "答案在 `dp[0][n−1]`，沿著記下的 k 遞迴，就能還原括號方式或操作順序。",
  ],
  demoNote:
    "戳氣球 nums = [3, 1, 5, 8]，兩端補 1 變成 [1, 3, 1, 5, 8, 1]。表格裡的 dp[i][j] 是「把 i 和 j 之間的氣球全部戳破」的最大分數，依區間長度由短到長填。每一步假設某顆氣球 k 是這個區間裡最後被戳破的：上方的氣球列中藍色是 k，黃色是區間兩端，也就是戳 k 時的左右鄰居，灰色是在它之前已經被子問題戳掉的；表格裡藍色是正在填的格子，黃色是它用到的兩個子區間，格子右下角的小字記下選中的 k。最後 dp[0][5] = 167。",
  codeNote:
    "Python 放戳氣球、會還原括號方式的矩陣鏈乘，以及用記憶化遞迴寫的最長回文子序列，對照同一個區間狀態的兩種寫法。C++ 放戳氣球與「相鄰石堆合併」：後者的合併成本是整段總和，示範怎麼用前綴和在 O(1) 取得。",
  problems: [
    { src: "LeetCode 516", name: "Longest Palindromic Subsequence（兩端相同就收進去）", diff: "Medium" },
    { src: "LeetCode 877", name: "Stone Game（區間上的兩人博弈）", diff: "Medium" },
    { src: "LeetCode 1039", name: "Minimum Score Triangulation of Polygon（枚舉和兩端點組成三角形的頂點）", diff: "Medium" },
    { src: "LeetCode 312", name: "Burst Balloons（枚舉最後戳的那一顆）", diff: "Hard" },
    { src: "LeetCode 1547", name: "Minimum Cost to Cut a Stick（切點排序後就是區間 DP）", diff: "Hard" },
    { src: "LeetCode 1000", name: "Minimum Cost to Merge Stones（每次合併 K 堆，狀態多一維）", diff: "Hard" },
  ],
};
