import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Recursion、Master Theorem",
  applications: [
    {
      title: "HTTPS 握手裡的 RSA 運算",
      problem: "伺服器用 2048 位元的 RSA 金鑰簽章，要算 m^d mod N，其中 d 本身就是一個 2048 位元的數。逐次相乘要做大約 2²⁰⁴⁸ 次乘法，宇宙的年齡都不夠。",
      why: "把 d 寫成二進位，從低位往高位掃：每一位都把底數平方一次，遇到 1 就把它乘進答案，每次乘完立刻取模讓數字維持在 2048 位元。總共大約 2048 次平方加上一千多次乘法，一次簽章在毫秒內完成。",
    },
    {
      title: "線性遞推的第 10¹⁸ 項",
      problem: "某個計數問題的答案滿足 F(n) = F(n−1) + F(n−2)，題目要第 10¹⁸ 項對 10⁹+7 的餘數。就算每秒算十億項，一路推下去也要三十幾年。",
      why: "一次遞推等於乘上矩陣 [[1, 1], [1, 0]]，第 n 項就是這個矩陣的 n 次方。矩陣乘法同樣滿足結合律，快速冪照用：log₂ 10¹⁸ ≈ 60，大約 60 次平方加上最多 60 次乘法，每次是 2×2 矩陣相乘，瞬間算完。",
    },
    {
      title: "信用評等 30 年後的違約機率",
      problem: "銀行有一張「今年的評等明年變成什麼」的機率轉移矩陣，想知道一張現在是 A 級的債券，30 年後落在違約狀態的機率。",
      why: "30 年後的分布是轉移矩陣的 30 次方。30 = 11110₂，只要 4 次平方加上 4 次乘法，而不是連乘 29 次。狀態有 k 個時每次矩陣乘法是 O(k³)，快速冪把總成本壓到 O(k³ log n)。",
    },
  ],
  cue: "x 的 n 次方、n 很大（10⁹、10¹⁸）、答案取模、RSA 與模冪、線性遞推第 n 項、矩陣的 n 次方、重複套用同一個操作 n 次、乘法次數要 O(log n)。",
  steps: [
    "初始化 `result = 1 % mod`、`base = x % mod`。",
    "當 `n > 0`：若 `n & 1` 是 1，`result = result × base % mod`。",
    "`base = base × base % mod`，`n >>= 1`，回到上一步。每一輪處理 n 的一個位元。",
    "n 變成 0 時 `result` 就是答案。遞迴寫法則是先算 `half = power(x, n // 2)`，回傳 `half²` 或 `half² × x`，一半只算一次。",
    "換成矩陣或其他可結合的操作時，把 1 換成單位元素、把乘法換成那個操作，其餘完全不變。",
  ],
  demoNote:
    "底數固定是 3，可以切換指數 13、25、100。上方是指數的二進位，右邊是最低位，上排標出每一位的權重；從最低位往最高位一格一格處理，藍色是正在處理的位元，處理過的位元是 1 就變綠色。表格記下每一位時的 base（也就是 3 的 2ⁱ 次方）以及 result，所有乘法都對 10⁹+7 取模。右側兩條長條比較乘法次數：指數 13 要 6 次、25 要 7 次、100 只要 9 次，逐次相乘分別是 12、24、99 次。",
  codeNote:
    "Python 放遞迴版、迭代的模冪，以及把同一套迴圈套在 2×2 矩陣上算費氏數列第 10¹⁸ 項。C++ 放模冪、處理浮點數與負指數的 LeetCode 50 寫法（注意 `INT_MIN`），和矩陣快速冪。三個迴圈長得一模一樣，差別只在「1」和「乘法」是什麼。",
  problems: [
    { src: "LeetCode 509", name: "Fibonacci Number（用矩陣快速冪做到 O(log n)）", diff: "Easy" },
    { src: "LeetCode 50", name: "Pow(x, n)（負指數與 INT_MIN）", diff: "Medium" },
    { src: "LeetCode 1922", name: "Count Good Numbers（n 到 10¹⁵，答案是兩個模冪相乘）", diff: "Medium" },
    { src: "LeetCode 372", name: "Super Pow（指數是一個超長的十進位陣列）", diff: "Medium" },
    { src: "LeetCode 1969", name: "Minimum Non-Zero Product of the Array Elements（先推出公式，再用模冪算）", diff: "Medium" },
  ],
};
