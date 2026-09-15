import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { BitwiseBasicsDemo } from "@/components/lesson/demos/BitwiseBasicsDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# 位元編號：第 0 位是最低位（最右邊），第 i 位代表 2 的 i 次方
def get_bit(x, i):
    return (x >> i) & 1                  # 右移 i 位，再看最低位


def set_bit(x, i):
    return x | (1 << i)                  # OR：第 i 位強制變 1


def clear_bit(x, i):
    return x & ~(1 << i)                 # AND 上「只有第 i 位是 0」的遮罩


def toggle_bit(x, i):
    return x ^ (1 << i)                  # XOR：第 i 位 0 變 1、1 變 0


# 多位元欄位：從第 lo 位開始、寬 w 位
def get_field(x, lo, w):
    return (x >> lo) & ((1 << w) - 1)    # (1 << w) - 1 是 w 個 1


def set_field(x, lo, w, v):
    mask = ((1 << w) - 1) << lo
    return (x & ~mask) | ((v << lo) & mask)   # 先清掉那一段，再寫入


# Python 的整數沒有位寬，需要固定寬度時自己截斷
def to_u32(x):
    return x & 0xFFFFFFFF                # 只留低 32 位，當成無號數


def to_i32(x):
    x &= 0xFFFFFFFF
    return x - (1 << 32) if x >> 31 else x    # 第 31 位是 1 就是負數（二補數）


R, W, X = 4, 2, 1                        # Unix 權限：讀 100、寫 010、執行 001

if __name__ == "__main__":
    a, b = 0b10110010, 0b01101100        # 178、108，和互動示範同一組
    print(a & b, a | b, a ^ b)           # 32 254 222
    print(~a & 0xFF, ~a)                 # 77 -179（~a 等於 -a - 1，要自己套遮罩）
    print((a << 1) & 0xFF, a >> 1)       # 100 89
    print(get_bit(a, 3), get_bit(a, 4))  # 0 1
    print(set_bit(a, 3), clear_bit(a, 4), toggle_bit(a, 1))   # 186 162 176

    mode = 0o754                         # rwxr-xr--：擁有者 7、群組 5、其他人 4
    group = get_field(mode, 3, 3)
    print(group, (group & W) != 0)       # 5 False：群組不能寫
    mode = set_field(mode, 0, 3, R | W)  # 其他人改成 rw-
    print(oct(mode))                     # 0o756

    color = 0xFF8800                     # 0xRRGGBB
    print(get_field(color, 8, 8))        # 136（綠色通道 0x88）
    print(hex(set_field(color, 8, 8, 0x44)))   # 0xff4400

    print(-7 >> 1, to_u32(-1), to_i32(0xFFFFFFFE))   # -4 4294967295 -2`;

const cpp = `#include <bitset>
#include <cstdint>
#include <iostream>

// 一律用無號型別：有號數溢位與負數移位容易踩到未定義或實作定義的行為
using u32 = std::uint32_t;

constexpr u32 getBit(u32 x, int i) { return (x >> i) & 1u; }
constexpr u32 setBit(u32 x, int i) { return x | (1u << i); }
constexpr u32 clearBit(u32 x, int i) { return x & ~(1u << i); }
constexpr u32 toggleBit(u32 x, int i) { return x ^ (1u << i); }

// 多位元欄位：從第 lo 位開始、寬 w 位（w 必須小於 32，移位量 >= 位寬是未定義行為）
constexpr u32 getField(u32 x, int lo, int w) {
    return (x >> lo) & ((1u << w) - 1);
}
constexpr u32 setField(u32 x, int lo, int w, u32 v) {
    u32 mask = ((1u << w) - 1) << lo;
    return (x & ~mask) | ((v << lo) & mask);
}

enum Perm : u32 { X = 1, W = 2, R = 4 };    // Unix 權限的三個位元

int main() {
    u32 a = 0b10110010, b = 0b01101100;     // 178、108
    std::cout << (a & b) << ' ' << (a | b) << ' ' << (a ^ b) << "\\n";  // 32 254 222
    std::cout << (~a & 0xFF) << ' ' << std::bitset<8>(a << 1) << "\\n"; // 77 01100100
    std::cout << getBit(a, 3) << ' ' << getBit(a, 4) << "\\n";         // 0 1
    std::cout << setBit(a, 3) << ' ' << clearBit(a, 4) << ' ' << toggleBit(a, 1) << "\\n";  // 186 162 176

    // 硬體暫存器：只改一個腳位，其他位元不動
    std::uint8_t port = 0b00000101;         // LED 0、2 亮著
    port |= 1u << 3;                        // 點亮 LED 3
    port &= ~(1u << 0);                     // 關掉 LED 0
    port ^= 1u << 7;                        // 切換 LED 7
    std::cout << std::bitset<8>(port) << "\\n";                        // 10001100

    u32 mode = 0754;                        // 八進位：rwxr-xr--
    std::cout << getField(mode, 3, 3) << ' ' << ((getField(mode, 3, 3) & W) != 0) << "\\n";  // 5 0
    mode = setField(mode, 0, 3, R | W);     // 其他人改成 rw-
    std::cout << std::oct << mode << std::dec << "\\n";                // 756

    // 陷阱：int 的 1 << 31 會變成負數，1 << 40 是未定義行為，要寫 1ull << 40；
    // == 比 & 優先，x & 1 == 0 其實是 x & (1 == 0)，一定要加括號
    std::cout << (1ull << 40) << ' ' << ((a & 1) == 0) << "\\n";      // 1099511627776 1
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
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
          ]}
          cue="旗標、開關、權限、遮罩、暫存器、打包成一個整數、只改某一位不動其他位、每一位代表一件事、乘除 2 的次方。"
        />
      </Section>

      <Section id="concept">
        <p>
          整數在記憶體裡是一排位元，第 <Code>i</Code> 位代表 <Code>2^i</Code>。把每一位當成一個獨立的開關，一個 32 位元整數就是 32 個布林值。五種基本運算都是<strong>逐位</strong>進行的：<strong>AND</strong>（<Code>&amp;</Code>）兩邊都是 1 才是 1；<strong>OR</strong>（<Code>|</Code>）任一邊是 1 就是 1；<strong>XOR</strong>（<Code>^</Code>）兩邊不同才是 1；<strong>NOT</strong>（<Code>~</Code>）全部翻轉；<strong>移位</strong> <Code>x &lt;&lt; k</Code> 整排往左推 k 格、右邊補 0，等於乘以 <Code>2^k</Code>，<Code>x &gt;&gt; k</Code> 往右推、丟掉最低的 k 位，等於除以 <Code>2^k</Code> 向下取整。
        </p>
        <p>
          為什麼取位、設位、清位不會誤傷其他位：這些運算的第 i 位結果<strong>只看兩個運算元的第 i 位</strong>，位與位之間互不影響。對任一位 b：<Code>b &amp; 1 = b</Code>、<Code>b &amp; 0 = 0</Code>、<Code>b | 0 = b</Code>、<Code>b | 1 = 1</Code>、<Code>b ^ 0 = b</Code>、<Code>b ^ 1 = 1 − b</Code>。所以拿一個<strong>遮罩</strong> <Code>1 &lt;&lt; i</Code>（只有第 i 位是 1）：<Code>x | mask</Code> 把第 i 位設成 1、其他位和 0 做 OR 保持原樣；<Code>x &amp; ~mask</Code> 把第 i 位清成 0、其他位和 1 做 AND 保持原樣；<Code>x ^ mask</Code> 只翻轉第 i 位；<Code>(x &gt;&gt; i) &amp; 1</Code> 把第 i 位移到最低位再取出。一次處理連續 w 位也一樣，<Code>(1 &lt;&lt; w) − 1</Code> 是 w 個 1，左移到定位就是那一段的遮罩。
        </p>
        <p>
          複雜度：固定寬度的整數上，每個運算都是一條 CPU 指令，時間 <strong>O(1)</strong>、空間 <strong>O(1)</strong>，沒有最好或最壞情況之分。空間省的是常數倍，但倍數不小：n 個布林值用 bool 陣列要 n 個位元組，打包成位元只要 ⌈n / 8⌉ 個位元組。最多 64 個元素的集合可以用一個 64 位元整數表示，交集是 <Code>a &amp; b</Code>、並集是 <Code>a | b</Code>、差集是 <Code>a &amp; ~b</Code>，一條指令就算完，雜湊集合則要逐個元素比對。Python 的整數沒有位寬上限，位數很多時運算成本和位數成正比，但在 64 位以內可以視為常數。
        </p>
        <p>
          常見的坑有三個。<strong>優先序</strong>：C++ 的 <Code>==</Code> 比 <Code>&amp;</Code> 優先，<Code>x &amp; 1 == 0</Code> 其實是 <Code>x &amp; (1 == 0)</Code>；兩種語言的 <Code>+</Code> 都比移位優先，<Code>1 &lt;&lt; i - 1</Code> 是 <Code>1 &lt;&lt; (i - 1)</Code>。一律加括號最保險。<strong>位寬與溢位</strong>：C++ 的 <Code>1 &lt;&lt; 31</Code> 在 32 位元 int 上會跑進符號位變成負數，<Code>1 &lt;&lt; 40</Code> 的移位量超過位寬，是未定義行為，64 位元要寫 <Code>1ull &lt;&lt; k</Code>。<strong>負數與二補數</strong>：位元運算把負數當成二補數，<Code>−x = ~x + 1</Code>，所以 <Code>~x = −x − 1</Code>；Python 裡 <Code>~178</Code> 是 −179 而不是 77，要自己 <Code>&amp; 0xFF</Code>，負數右移則是向下取整（<Code>-7 &gt;&gt; 1</Code> 是 −4）。這一篇是後面幾篇的零件：XOR 的抵消性質在 XOR Tricks，<Code>n &amp; (n − 1)</Code> 清掉最低位的 1 在 Counting Bits，把整數當集合逐一列舉在 Subset Enumeration。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>決定位元配置：第 0 位是最低位。每個布林值配一個位置，每段多位元欄位配起點 <Code>lo</Code> 與寬度 <Code>w</Code>，寫成具名常數，例如 <Code>READ = 1 &lt;&lt; 2</Code>。</>,
            <>做遮罩：單一位是 <Code>1 &lt;&lt; i</Code>；連續 w 位是 <Code>((1 &lt;&lt; w) − 1) &lt;&lt; lo</Code>；多個旗標用 OR 組起來，例如 <Code>READ | WRITE</Code>。</>,
            <>查詢用 AND：<Code>(x &gt;&gt; i) &amp; 1</Code> 得到 0 或 1；<Code>(x &amp; mask) != 0</Code> 表示遮罩裡<strong>至少一位</strong>是 1，<Code>(x &amp; mask) == mask</Code> 表示<strong>全部</strong>是 1；欄位用 <Code>(x &gt;&gt; lo) &amp; ((1 &lt;&lt; w) − 1)</Code>。</>,
            <>修改：設位 <Code>x |= mask</Code>、清位 <Code>x &amp;= ~mask</Code>、翻轉 <Code>x ^= mask</Code>。寫入欄位先清再寫：<Code>x = (x &amp; ~mask) | (v &lt;&lt; lo)</Code>，v 必須小於 <Code>2^w</Code>，否則先截斷。</>,
            <>檢查位寬與型別：C++ 用無號型別，常數寫 <Code>1u</Code> 或 <Code>1ull</Code>，移位量要小於位寬；Python 需要固定位寬時自己 <Code>&amp; ((1 &lt;&lt; w) − 1)</Code>。和比較運算混用時一律加括號。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>A = 178（10110010）、B = 108（01101100），點 A、B 的任一格就能翻轉那一位，下面的 AND、OR、XOR、NOT 與移位即時更新；輸入列藍色是 1，結果列綠色是 1、灰色是 0。預設的 A 最高位是 1，所以 A &lt;&lt; 1 會把它擠出 8 位元外。最下面一區用黃色標出選中的第 i 位：預設第 3 位是 0，設位和翻轉結果相同、清位沒有變化；改選第 1 位（A 在這裡是 1），就能看到清位和翻轉把它變成 0。</p>
        <BitwiseBasicsDemo />
      </Section>

      <Section id="code">
        <p>取位、設位、清位、翻轉四個基本函式，加上讀寫一段多位元欄位。範例用和互動示範同一組 A、B，再用 Unix 權限 754、GPIO 暫存器與 RGB 色碼示範實際用法。Python 的整數沒有位寬，所以另外附上 32 位元截斷與二補數轉換；C++ 一律用無號型別，並把優先序與溢位兩個陷阱寫在程式碼裡。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 190", name: "Reverse Bits（逐位取出、逐位放入）", diff: "Easy" },
            { src: "LeetCode 1009", name: "Complement of Base 10 Integer（NOT 要配遮罩，注意 0）", diff: "Easy" },
            { src: "LeetCode 405", name: "Convert a Number to Hexadecimal（每次取低 4 位，負數用二補數）", diff: "Easy" },
            { src: "LeetCode 1318", name: "Minimum Flips to Make a OR b Equal to c（逐位比較）", diff: "Medium" },
            { src: "LeetCode 318", name: "Maximum Product of Word Lengths（26 位元整數當字母集合）", diff: "Medium" },
            { src: "LeetCode 371", name: "Sum of Two Integers（不用加號做加法）", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const bitsBasicsLesson: Lesson = { prereq: "Big-O Notation", Body };
