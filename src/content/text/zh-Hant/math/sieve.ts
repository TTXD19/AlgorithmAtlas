import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "GCD & LCM、Array & Dynamic Array",
  applications: [
    {
      title: "產生 RSA 金鑰前先過濾候選數",
      problem: "產生 2048 位元的 RSA 金鑰，要隨機挑大奇數並測試是不是質數。機率質數測試每跑一次都要做上千位元的模冪運算，很貴，而隨機挑到的奇數大多數其實有很小的因數。",
      why: "OpenSSL 等函式庫內建前幾千個小質數的表，候選數先對這些小質數試除，能被整除的直接丟掉，只有通過的才進入昂貴的機率測試。這張小質數表就是用篩法產生的；大部分候選數在這一關就被刷掉，省下大量白做的模冪運算。",
    },
    {
      title: "大量整數的質因數分解",
      problem: "資料分析程式要替 100 萬個不超過 10⁷ 的整數計算因數個數，每個數都得先分解質因數。逐一試除到 √x，一個數最壞要做三千多次除法，最壞加起來是數十億次。",
      why: "先用線性篩在 O(N) 時間內建出「最小質因數表」spf，之後分解 x 只要反覆除以 spf[x]，每一步數字至少減半，一個數 O(log x) 步就分解完。上限 10⁷ 的表用 32 位元整數存約 40 MB，換來每次分解只要二十幾步以內。",
    },
    {
      title: "驗證哥德巴赫猜想到 4 × 10¹⁸",
      problem: "數學家想用電腦驗證「每個大於 2 的偶數都能寫成兩個質數的和」在非常大的範圍內成立，需要一段一段列出 10¹⁸ 附近的所有質數。開一個長度 10¹⁸ 的陣列是不可能的。",
      why: "區間篩只需要 √R 以內的質數（10⁹ 以內），再對長度幾百萬的區間 [L, R] 劃掉這些質數的倍數，記憶體只和區間長度有關。Oliveira e Silva 等人的驗證計畫正是用分段篩法，一段接一段地掃過整個範圍。",
    },
  ],
  cue: "需要某個上限內的所有質數、大量查詢一個數是不是質數、大量質因數分解（最小質因數表）、區間 [L, R] 內的質數、上限大約 10⁷ 以內可以開陣列。",
  steps: [
    "開一個長度 `N + 1` 的布林陣列 `is_prime`，全部設為 true，再把 0 和 1 設為 false。",
    "p 從 2 開始往上走，只要 `p² ≤ N` 就繼續。",
    "若 `is_prime[p]` 仍為 true，p 就是質數，把 `p², p² + p, p² + 2p, …` 不超過 N 的位置全部設為 false；否則直接換下一個 p。",
    "`p² > N` 時停止，陣列裡仍是 true 的位置就是 N 以內的全部質數。",
    "要大量分解質因數時改用線性篩記錄最小質因數；上限大到開不了陣列時，只篩到 `√R`，再對區間 `[L, R]` 做區間篩。",
  ],
  demoNote:
    "1 到 60 排成每列 10 個，√60 ≈ 7.75。藍色是目前確認的質數 p，黃色是這一步劃掉的倍數，黃色虛線是早就被更小的質數劃掉、這一輪又走到的數，灰色加刪除線是合數，綠色是確定的質數。p = 2 從 4 開始劃掉全部 29 個偶數；p = 3 從 9 開始，比 9 小的倍數 6 已經被 2 劃掉，這一輪走訪 18 個數、新劃掉 9 個；p = 5 從 25 開始，只新劃掉 25、35、55；p = 7 只剩 49 是新的。下一個沒被劃掉的是 11，但 11² = 121 > 60，所以停止。下方表格記錄每個質數的工作量：總共走訪 57 次、劃掉 42 個合數，其中 15 次是重複劃到，剩下的 17 個數就是 60 以內的質數。",
  codeNote:
    "Python 放標準篩法（用切片一次劃掉整排倍數），以及順便記錄最小質因數的線性篩與查表分解。C++ 放一般篩法和區間篩，示範在 10¹² 到 10¹² + 100 之間找質數：只篩到 √R = 10⁶，陣列長度只有 101。",
  problems: [
    { src: "LeetCode 204", name: "Count Primes", diff: "Medium" },
    { src: "LeetCode 2523", name: "Closest Prime Numbers in Range", diff: "Medium" },
    { src: "LeetCode 2521", name: "Distinct Prime Factors of Product of Array（最小質因數表分解）", diff: "Medium" },
    { src: "LeetCode 3233", name: "Find the Count of Numbers Which Are Not Special（質數的平方才有恰好兩個真因數）", diff: "Medium" },
    { src: "LeetCode 952", name: "Largest Component Size by Common Factor（分解質因數後用 Union-Find 合併）", diff: "Hard" },
    { src: "LeetCode 2709", name: "Greatest Common Divisor Traversal", diff: "Hard" },
  ],
};
