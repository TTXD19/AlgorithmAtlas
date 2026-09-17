import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Big-O Notation",
  applications: [
    {
      title: "Unix 檔案權限：chmod 754",
      problem: "每個檔案要記錄擁有者、群組、其他人三種身分各自能不能讀、寫、執行，共 9 個是非題。chmod 754 代表擁有者 rwx、群組 r-x、其他人 r--，系統每次開檔都要檢查一次。",
      why: "讀、寫、執行各佔一個位元（4、2、1），三個一組，9 個權限剛好塞進一個整數，754 就是八進位寫出的三組。問「群組能不能寫」是 (mode >> 3) & 2，一次移位加一次 AND；加權限用 OR、拿掉用 AND NOT，其他身分的設定完全不受影響。",
    },
    {
      title: "韌體裡的 GPIO 暫存器",
      problem: "Arduino Uno 的 PORTB 是一個 8 位元暫存器，第 0 到 5 位對應腳位 D8 到 D13。要點亮 D13 上的 LED（第 5 位），但其他腳位正接著馬達與感測器，不能被改到。",
      why: "暫存器只能整個讀、整個寫。PORTB |= 1 << 5 只把第 5 位設成 1，PORTB &= ~(1 << 5) 只把它清成 0，其他位元原封不動。Arduino 的 digitalWrite 核心就是這兩行，驅動程式裡到處都是。",
    },
    {
      title: "影像處理：一個像素打包成一個整數",
      problem: "一張 4K 圖片有 3840 × 2160 ≈ 829 萬個像素，每個像素有 A、R、G、B 四個 0～255 的通道。濾鏡要逐像素把綠色調暗，四個通道分開存成四個 int 要 16 個位元組。",
      why: "四個通道各 8 位元，打包成一個 32 位元整數 0xAARRGGBB，一個像素只要 4 個位元組，記憶體省四倍，對 CPU 快取也更友善。取綠色是 (c >> 8) & 0xFF；寫回時先用 AND 清掉那 8 位，再 OR 進新值。移位加遮罩就是讀寫「一段位元」的通用做法。",
    },
  ],
  cue: "旗標、開關、權限、遮罩、暫存器、打包成一個整數、只改某一位不動其他位、每一位代表一件事、乘除 2 的次方。",
  steps: [
    "決定位元配置：第 0 位是最低位。每個布林值配一個位置，每段多位元欄位配起點 `lo` 與寬度 `w`，寫成具名常數，例如 `READ = 1 << 2`。",
    "做遮罩：單一位是 `1 << i`；連續 w 位是 `((1 << w) − 1) << lo`；多個旗標用 OR 組起來，例如 `READ | WRITE`。",
    "查詢用 AND：`(x >> i) & 1` 得到 0 或 1；`(x & mask) != 0` 表示遮罩裡**至少一位**是 1，`(x & mask) == mask` 表示**全部**是 1；欄位用 `(x >> lo) & ((1 << w) − 1)`。",
    "修改：設位 `x |= mask`、清位 `x &= ~mask`、翻轉 `x ^= mask`。寫入欄位先清再寫：`x = (x & ~mask) | (v << lo)`，v 必須小於 `2^w`，否則先截斷。",
    "檢查位寬與型別：C++ 用無號型別，常數寫 `1u` 或 `1ull`，移位量要小於位寬；Python 需要固定位寬時自己 `& ((1 << w) − 1)`。和比較運算混用時一律加括號。",
  ],
  demoNote:
    "A = 178（10110010）、B = 108（01101100），點 A、B 的任一格就能翻轉那一位，下面的 AND、OR、XOR、NOT 與移位即時更新；輸入列藍色是 1，結果列綠色是 1、灰色是 0。預設的 A 最高位是 1，所以 A << 1 會把它擠出 8 位元外。最下面一區用黃色標出選中的第 i 位：預設第 3 位是 0，設位和翻轉結果相同、清位沒有變化；改選第 1 位（A 在這裡是 1），就能看到清位和翻轉把它變成 0。",
  codeNote:
    "取位、設位、清位、翻轉四個基本函式，加上讀寫一段多位元欄位。範例用和互動示範同一組 A、B，再用 Unix 權限 754、GPIO 暫存器與 RGB 色碼示範實際用法。Python 的整數沒有位寬，所以另外附上 32 位元截斷與二補數轉換；C++ 一律用無號型別，並把優先序與溢位兩個陷阱寫在程式碼裡。",
  problems: [
    { src: "LeetCode 190", name: "Reverse Bits（逐位取出、逐位放入）", diff: "Easy" },
    { src: "LeetCode 1009", name: "Complement of Base 10 Integer（NOT 要配遮罩，注意 0）", diff: "Easy" },
    { src: "LeetCode 405", name: "Convert a Number to Hexadecimal（每次取低 4 位，負數用二補數）", diff: "Easy" },
    { src: "LeetCode 1318", name: "Minimum Flips to Make a OR b Equal to c（逐位比較）", diff: "Medium" },
    { src: "LeetCode 318", name: "Maximum Product of Word Lengths（26 位元整數當字母集合）", diff: "Medium" },
    { src: "LeetCode 371", name: "Sum of Two Integers（不用加號做加法）", diff: "Medium" },
  ],
};
