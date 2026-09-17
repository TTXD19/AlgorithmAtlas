import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Modular Arithmetic、Memoization & Tabulation",
  applications: [
    {
      title: "大樂透的中獎機率",
      problem: "大樂透從 1 到 49 開出 6 個號碼，買一注中頭獎的機率是多少？只中 3 個號碼的普獎又是多少？把所有開獎結果一一列出來再數，是一千多萬種組合。",
      why: "開獎和號碼順序無關，所有結果共有 C(49, 6) = 13,983,816 種，頭獎只有 1 種，機率約一千四百萬分之一。剛好中 3 個，是從自己的 6 個號碼選 3 個、再從其餘 43 個選 3 個沒中的，C(6, 3) × C(43, 3) = 246,820 種，機率約 1.77%。整個問題就是幾個組合數相乘再相除。",
    },
    {
      title: "基因富集分析的顯著性",
      problem: "實驗找出 300 個表現量異常的基因，其中 40 個屬於「免疫反應」這個功能分類，而全基因組兩萬個基因裡這個分類有 500 個。研究者要判斷這是巧合，還是免疫反應真的和實驗條件有關。",
      why: "隨機挑 300 個基因時，其中恰好 k 個屬於該分類的機率是超幾何分布 C(500, k) · C(19500, 300 − k) / C(20000, 300)，把 k ≥ 40 的機率加總就是 p 值。這些組合數有上百位數，實務上預先算好 ln(n!) 的表，用對數相加減再取指數，不會溢位。",
    },
    {
      title: "設定組合的兩兩測試",
      problem: "一個軟體的設定頁有 20 個開關，全部組合是 2²⁰，超過一百萬種，不可能每種都測。但經驗上大部分的 bug 只和其中一兩個設定有關。",
      why: "兩兩組合測試只要求「任意兩個開關的四種開關狀態」都至少出現在某一組測試裡。需要涵蓋的條件是 C(20, 2) × 4 = 760 個，而一組測試能同時涵蓋 C(20, 2) = 190 個，所以至少要 4 組；實際上精心安排的 8 組測試就能全部涵蓋。組合數告訴你要涵蓋多少條件，也估得出測試數量的下限。",
    },
  ],
  cue: "從 n 個裡選 k 個、不管順序、網格路徑數、相同物品分到不同箱子（隔板法）、機率等於有利情況除以全部情況、答案取模 10⁹+7 的計數題、大量查詢 C(n, k)。",
  steps: [
    "先判斷要數的是排列還是組合、東西是否相同，把問題換成 `C(n, k)` 或 `P(n, k)` 的式子，例如路徑數 `C(a + b, a)`、隔板法 `C(n + k − 1, k − 1)`。",
    "n 在幾千以內，或模數不是質數：用 Pascal 三角形 `C[n][k] = C[n − 1][k − 1] + C[n − 1][k]` 填表。",
    "模數是質數 p 而且 n < p：建 `fact[0..n]`，`fact[i] = fact[i − 1] · i mod p`。",
    "`inv_fact[n] = fact[n]^(p − 2) mod p`，再由右往左 `inv_fact[i − 1] = inv_fact[i] · i mod p`。",
    "查詢時 `k < 0` 或 `k > n` 回傳 0，否則回傳 `fact[n] · inv_fact[k] · inv_fact[n − k] mod p`。",
  ],
  demoNote:
    "上方可以切換兩種算法。「Pascal 三角形」從兩端的 1 開始，逐格填第 0 到 6 列：藍色是正在算的格子，黃色是它上一列的兩個來源，第一格的說明會拆解為什麼是「包含第 n 個」加上「不包含第 n 個」。填完第 6 列 1、6、15、20、15、6、1，總和 64 = 2⁶，綠色的 C(6, 2) = 15 同時也是往右 4 步、往下 2 步的路徑數。「階乘表 mod 13」要算 C(8, 3) mod 13：先由左往右填 0! 到 8!，再只對 8! = 7 做一次費馬小定理得到反元素 2，接著由右往左每格乘上 i 填完反元素表，每一步都附驗算。查詢時綠色的三格相乘 7 × 11 × 9 ≡ 4，和 56 mod 13 相同。最後一步說明為什麼 n 必須小於模數。",
  codeNote:
    "Python 放階乘表加階乘反元素表的 Binomial 類別，以及計算精確值的乘法公式，並用它算樂透、網格路徑和隔板法的例子。C++ 放同樣的 Binomial 結構、模數不是質數時用的 Pascal 三角形，以及算機率時改用 lgamma 對數的寫法。",
  problems: [
    { src: "LeetCode 118", name: "Pascal's Triangle", diff: "Easy" },
    { src: "LeetCode 1641", name: "Count Sorted Vowel Strings（隔板法）", diff: "Medium" },
    { src: "LeetCode 2400", name: "Number of Ways to Reach a Position After Exactly k Steps（決定幾步往右）", diff: "Medium" },
    { src: "LeetCode 1735", name: "Count Ways to Make Array With Product（質因數分解後每個質數各用隔板法）", diff: "Hard" },
    { src: "LeetCode 1569", name: "Number of Ways to Reorder Array to Get Same BST（左右子樹交錯排列 C(n − 1, 左子樹大小)）", diff: "Hard" },
    { src: "LeetCode 1916", name: "Count Ways to Build Rooms in an Ant Colony（階乘表加反元素）", diff: "Hard" },
  ],
};
