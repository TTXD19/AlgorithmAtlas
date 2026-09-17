import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Recursion",
  applications: [
    {
      title: "音訊重取樣：44.1 kHz 轉成 48 kHz",
      problem: "CD 音樂每秒 44100 個取樣，影片規格要 48000。重取樣器的做法是先插值放大 L 倍、再抽取縮小 M 倍，L/M 必須等於 48000/44100。直接拿 L = 48000，多相濾波器就得切成 48000 個相位。",
      why: "比例要先約分：gcd(48000, 44100) = 300，所以 L/M = 160/147，濾波器只要 160 個相位。輾轉相除四次除法就得到 300，完全不需要把兩個數做質因數分解。",
    },
    {
      title: "120Hz 螢幕為什麼能順暢播 24 fps 電影和 30 fps 影片",
      problem: "電影每秒 24 格，網路影片常是 30 格。60Hz 螢幕上 24 fps 的每一格只能輪流停 2 次、3 次更新，播放速度忽快忽慢，看起來會微微頓挫。要挑一個更新率，讓兩種格率都能整除。",
      why: "要找的是 24 和 30 的最小公倍數：lcm(24, 30) = 24 ÷ gcd(24, 30) × 30 = 24 ÷ 6 × 30 = 120。在 120Hz 下，24 fps 每格剛好停 5 次更新，30 fps 剛好 4 次。排程裡「幾個週期什麼時候再次對齊」都是同一個算式。",
    },
    {
      title: "產生 RSA 私鑰",
      problem: "教科書範例：p = 61、q = 53，φ(n) = 60 × 52 = 3120，公鑰指數 e = 17。私鑰 d 必須滿足 17 × d 除以 3120 餘 1。真正的金鑰 φ(n) 有 2048 位元，從 1 開始逐一試 d 永遠試不完。",
      why: "3120 不是質數，不能直接套費馬小定理求反元素。擴展歐幾里得在算 gcd(17, 3120) = 1 的同時，求出 17x + 3120y = 1 的整數解，x 取模 3120 就是 d = 2753。步數只和較小那個數的位數有關，實務上 e = 65537，就算 φ(n) 有 2048 位元也只要二十次上下的除法。",
    },
  ],
  cue: "最大公因數、最小公倍數、約分、通分、比例、週期何時重合、整除、ax + by = c 有沒有整數解、模數不是質數時的反元素、陣列所有數的公因數。",
  steps: [
    "先取絕對值。約定 `gcd(a, 0) = a`，所以 `gcd(0, 0) = 0`。",
    "`while b != 0`：`a, b = b, a % b`。迴圈結束時 a 就是最大公因數。a < b 也不必先交換，第一輪會自動換過來。",
    "最小公倍數：任一數為 0 就回傳 0，否則回傳 `a // gcd(a, b) * b`，先除再乘。多個數就從左到右折疊 gcd 或 lcm。",
    "擴展版：`b == 0` 時回傳 `(a, 1, 0)`；否則遞迴求出 `(g, x′, y′)`，回傳 `(g, y′, x′ − (a // b)·y′)`。迭代版則讓每一列維持 `r = a·s + b·t`，r、s、t 都用「上上列 − q × 上一列」往下算。",
    "應用：解 `ax + by = c` 先檢查 `c % g == 0`，有解時把 x、y 乘上 `c / g`。求 a 模 m 的反元素時確認 `g == 1`，答案是 `x % m`（拉回 0 到 m − 1）。",
  ],
  demoNote:
    "用 252 和 105，分成兩段。前半段是輾轉相除：左邊逐行寫出「被除數 = 商 × 除數 + 餘數」，黃色是每行的餘數，下一行它就變成除數；右邊的表是餘數序列 r 和商 q。藍色是目前這一步，三次除法後餘數變 0，上一個餘數 21 標成綠色，接著順便算出 lcm = 1260。後半段是擴展歐幾里得：表格多出 s、t 兩欄，每一列都滿足 r = 252·s + 105·t。留意 s、t 和 r 走的是同一條「上上列減掉 q 倍的上一列」規則，最後綠色那一列給出 x = −2、y = 5。",
  codeNote:
    "gcd、lcm、擴展歐幾里得，以及用它求模反元素。Python 的擴展版用遞迴寫，和上面「代回去整理係數」的推導一一對應；C++ 用迭代寫，就是示範裡的 r、s、t 表格，而且不佔呼叫堆疊。兩邊最後都示範怎麼對多個數折疊，以及標準庫內建的版本。",
  problems: [
    { src: "LeetCode 1979", name: "Find Greatest Common Divisor of Array", diff: "Easy" },
    { src: "LeetCode 1071", name: "Greatest Common Divisor of Strings（字串版的輾轉相除）", diff: "Easy" },
    { src: "LeetCode 914", name: "X of a Kind in a Deck of Cards（所有出現次數的 gcd）", diff: "Easy" },
    { src: "LeetCode 592", name: "Fraction Addition and Subtraction（通分再約分）", diff: "Medium" },
    { src: "LeetCode 365", name: "Water and Jug Problem（Bézout：gcd 整除目標才量得出來）", diff: "Medium" },
    { src: "LeetCode 878", name: "Nth Magical Number（lcm 加二分答案）", diff: "Hard" },
  ],
};
