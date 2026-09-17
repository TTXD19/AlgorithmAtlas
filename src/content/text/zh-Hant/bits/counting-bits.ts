import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Bitwise Basics、XOR Tricks",
  applications: [
    {
      title: "子網路遮罩換算成 CIDR 前綴長度",
      problem:
        "防火牆設定檔寫的是 255.255.255.192，路由表卻要填 /26。要把遮罩換成前綴長度、算出這個網段有 2⁶ = 64 個位址，還要擋掉 255.255.0.255 這種 1 不連續的非法遮罩。",
      why: "遮罩就是 32 位元整數 0xFFFFFFC0，前綴長度等於裡面 1 的個數。反過來數更快：全部翻轉得到 0x3F，只有 6 個 1，Kernighan 迴圈跑 6 次，32 − 6 = 26。合法遮罩翻轉後一定是 2ᵏ − 1，用 h & (h + 1) == 0 一行就能驗證，和 n & (n − 1) 是同一個借位原理。",
    },
    {
      title: "相簿的「相似照片」偵測",
      problem:
        "每張照片算出一個 64 位元的感知雜湊（pHash），兩張圖越像，雜湊裡不同的位元越少。使用者上傳一張新照片，要和相簿裡 50 萬個雜湊比對，找出差異不超過 10 個位元的。",
      why: "「有幾個位元不同」就是漢明距離：先 a ^ b，不同的位變成 1，再數 1 的個數。每次比對只是一次 XOR 加一次 popcount，在現代 CPU 上各是一道指令，50 萬次比對幾毫秒就做完，完全不用解碼圖片去比像素。",
    },
    {
      title: "用位元圖統計每日活躍使用者",
      problem:
        "App 有三千萬個使用者，每人有一個編號。想知道今天有幾個人登入過，以及昨天和今天都登入的有幾人。若用雜湊集合存每天登入過的編號，一天一千萬人登入就要吃掉幾百 MB 記憶體，還得保留好幾天來比對。",
      why: "每個使用者對應一個位元，三千萬個位元只要 3.75 MB，Redis 的 SETBIT／BITCOUNT 就是這樣做。今天的活躍人數是整張位元圖裡 1 的個數；兩天都登入的人數，是把兩張圖每 64 位元一段 AND 起來再 popcount。population count 就是這類統計的核心運算。",
    },
  ],
  cue: "數 1 的個數、popcount、set bits、漢明距離、有幾個位元不同、n & (n − 1)、清掉最低位的 1、2 的冪次、0 到 n 每個數的位元數。",
  steps: [
    "先確定寬度與正負號：輸入可能是負數時，Python 先 `n &= 0xFFFFFFFF`，C++ 改用 `std::uint32_t`，否則迴圈不會結束。",
    "`count = 0`；`while n != 0`：`n &= n - 1`（清掉最低位的 1），`count += 1`。迴圈結束時 count 就是 1 的個數。",
    "要知道兩個數有幾個位元不同（漢明距離），先算 `x = a ^ b`，再對 x 做第 2 步。",
    "要 0 到 n 每個數的答案：開 `bits = [0] * (n + 1)`，i 從 1 填到 n，`bits[i] = bits[i & (i - 1)] + 1`，每格 O(1)。",
    "要所有數對的漢明距離總和：對每個位元位置數出有 c 個數在這一位是 1，累加 c × (n − c)，不要兩兩配對。",
    "正式程式直接呼叫內建（`bit_count()`、`__builtin_popcount`、`std::bitset::count`）；判斷 2 的冪次寫 `n > 0 and n & (n - 1) == 0`，C++ 記得加括號。",
  ],
  demoNote:
    "n = 181 = 10110101₂，8 個位元裡有 5 個 1。前半段是 Brian Kernighan：每一步把 n、n − 1、n & (n − 1) 三列疊在一起，黃色標出這一輪要清掉的最低位 1 所在的位置，n − 1 那一列的綠色是它下面因借位而變成 1 的位（181 是奇數，第一步還看不到綠色）。後半段是逐位檢查：「原本的 n」那一列裡，正在檢查的位是 1 就標綠、是 0 就標黃，檢查過的位變灰。下方的計數區隨時顯示 count 和目前的迴圈次數，最後比較兩者的總次數：Kernighan 5 次，逐位檢查 8 次。",
  codeNote:
    "逐位檢查和 Kernighan 兩個版本放在一起對照，接著是兩個延伸：用 `bits[i & (i - 1)] + 1` 在 O(n) 內填出 0 到 n 的整張表（LeetCode 338），以及逐位計數求所有數對的漢明距離總和（LeetCode 477）。main 裡的例子包含子網路遮罩、負數與 2 的冪次，最後附上內建函式的寫法。",
  problems: [
    { src: "LeetCode 191", name: "Number of 1 Bits（Kernighan 的原型題）", diff: "Easy" },
    { src: "LeetCode 461", name: "Hamming Distance（先 XOR 再數 1）", diff: "Easy" },
    { src: "LeetCode 231", name: "Power of Two（n & (n − 1) == 0）", diff: "Easy" },
    { src: "LeetCode 338", name: "Counting Bits（O(n) 遞推）", diff: "Easy" },
    { src: "LeetCode 477", name: "Total Hamming Distance（逐位計數）", diff: "Medium" },
    { src: "LeetCode 2429", name: "Minimize XOR（1 的個數固定後，貪心決定放哪幾位）", diff: "Medium" },
  ],
};
