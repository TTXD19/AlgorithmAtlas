import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { XorTricksDemo } from "@/components/lesson/demos/XorTricksDemo";
import type { Lesson } from "@/lib/lessons";

const python = `def single_number(nums):
    """其他數都出現兩次，找出只出現一次的那個。O(n) 時間、O(1) 空間"""
    acc = 0
    for x in nums:
        acc ^= x                  # 成對的數互相抵消：x ^ x = 0
    return acc                    # 剩下的就是落單的：0 ^ a = a


def missing_number(nums):
    """nums 是 0..n 少了一個數（長度 n），找出缺的那個"""
    acc = len(nums)               # n 沒有對應的索引，先放進去
    for i, x in enumerate(nums):
        acc ^= i ^ x              # 應有的 i 和實際的 x 各 XOR 一次
    return acc                    # 存在的數出現兩次都抵消，只剩缺的


def two_single_numbers(nums):
    """恰好兩個數 a != b 只出現一次，其他都出現兩次"""
    diff = single_number(nums)    # 成對的抵消，剩下 a ^ b，一定不是 0
    low = diff & -diff            # 最低位的 1：a 和 b 在這一位不同
    a = 0
    for x in nums:
        if x & low:               # 依這一位分兩組，成對的數一定同組
            a ^= x                # 這一組裡只有 a 落單
    return sorted([a, diff ^ a])  # 另一個是 (a ^ b) ^ a = b


if __name__ == "__main__":
    print(single_number([5, 3, 9, 3, 5, 12, 9]))         # 12（和互動示範同一組）
    print(missing_number([3, 0, 1]))                     # 2
    print(missing_number([9, 6, 4, 2, 3, 5, 7, 0, 1]))   # 8
    print(two_single_numbers([1, 2, 1, 3, 2, 5]))        # [3, 5]
    print(two_single_numbers([-4, 7, 7, 6]))             # [-4, 6]（負數也成立）

    a, b = 5, 9                   # 不用暫存變數的交換（Python 平常寫 a, b = b, a）
    a ^= b                        # a = 5 ^ 9 = 12
    b ^= a                        # b = 9 ^ 12 = 5
    a ^= b                        # a = 12 ^ 5 = 9
    print(a, b)                   # 9 5`;

const cpp = `#include <iostream>
#include <utility>
#include <vector>

// 其他數都出現兩次，找出只出現一次的那個
int singleNumber(const std::vector<int>& nums) {
    int acc = 0;
    for (int x : nums) acc ^= x;        // x ^ x = 0，成對的互相抵消
    return acc;
}

// nums 是 0..n 少了一個數（長度 n）
int missingNumber(const std::vector<int>& nums) {
    int n = (int)nums.size();
    int acc = n;                         // n 沒有對應的索引，先放進去
    for (int i = 0; i < n; i++) acc ^= i ^ nums[i];
    return acc;
}

// 恰好兩個數只出現一次，其他都出現兩次；回傳 (小, 大)
std::pair<int, int> twoSingleNumbers(const std::vector<int>& nums) {
    unsigned diff = 0;
    for (int x : nums) diff ^= (unsigned)x;          // diff = a ^ b
    unsigned low = diff & (~diff + 1);               // 最低位的 1；用 unsigned 避免 -INT_MIN 溢位
    unsigned a = 0;
    for (int x : nums)
        if (((unsigned)x & low) != 0) a ^= (unsigned)x;  // 括號不能省：!= 比 & 優先
    int p = (int)a, q = (int)(diff ^ a);
    return p < q ? std::make_pair(p, q) : std::make_pair(q, p);
}

// XOR 交換：a 和 b 若是同一個變數，第一步 a ^= a 就把它清成 0
void xorSwap(int& a, int& b) {
    if (&a == &b) return;
    a ^= b;                              // a = a ^ b
    b ^= a;                              // b = b ^ (a ^ b) = 原本的 a
    a ^= b;                              // a = (a ^ b) ^ a = 原本的 b
}

int main() {
    std::cout << singleNumber({5, 3, 9, 3, 5, 12, 9}) << "\\n";        // 12
    std::cout << missingNumber({9, 6, 4, 2, 3, 5, 7, 0, 1}) << "\\n";  // 8
    auto [p, q] = twoSingleNumbers({1, 2, 1, 3, 2, 5});
    std::cout << p << " " << q << "\\n";                               // 3 5

    int a = 5, b = 9;
    xorSwap(a, b);
    std::cout << a << " " << b << "\\n";                               // 9 5
    std::vector<int> v = {7, 8};
    xorSwap(v[0], v[0]);                 // 同一個位置：沒有檢查就會變成 0
    std::cout << v[0] << "\\n";                                        // 7
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "RAID 5：壞了一顆硬碟，資料還在",
              problem: "伺服器用 4 顆 8 TB 硬碟組 RAID 5，每一組分段（stripe）存 3 個資料區塊 D1、D2、D3，外加 1 個同位區塊 P。某天第 2 顆硬碟故障，換上新硬碟後，上面 8 TB 的內容要從另外 3 顆算回來。",
              why: "寫入時就算好 P = D1 ^ D2 ^ D3。少了 D2 時，把剩下的全部 XOR：D1 ^ D3 ^ P，D1 和 D3 各出現兩次互相抵消，剩下的正是 D2。這和「找出落單的數」是同一件事，只是每個數換成一整個區塊，逐位元組做，不必另外記錄任何東西。",
            },
            {
              title: "只有 8 KB 記憶體的閘道找遺失的封包",
              problem: "一台微控制器每批應收到序號 0 到 99,999 的封包，實際到了 99,999 個，而且順序是亂的。它要回報漏掉的那一個序號，請對方重傳。",
              why: "就算用位元陣列記「收過誰」也要 12.5 KB，放不下。改成一個整數邊收邊 XOR：先把 0 到 99,999 所有應有的序號 XOR 進去，再 XOR 每個收到的序號，出現兩次的全部抵消，剩下的就是遺失的那個。用加總也能做，但總和約 50 億，超出 32 位元整數的範圍；XOR 的結果不會比最大的序號多出任何位元。",
            },
            {
              title: "串流加密：同一個運算加密也解密",
              problem: "影音平台用 AES-CTR 傳一支 2 GB 的影片：由金鑰產生一串和影片等長的偽亂數位元組（金鑰流），和影片逐位元組結合。播放端要能還原，而且要能直接從第 1.5 GB 開始解。",
              why: "密文 = 明文 ^ 金鑰流，解密再 XOR 一次同樣的金鑰流：明文 ^ 金鑰流 ^ 金鑰流 = 明文。加密與解密是同一段程式，每個位元組獨立處理，所以能平行、也能從任意位置開始。反過來也說明為什麼金鑰流絕不能重用：兩份密文 XOR 起來，金鑰流互相抵消，直接得到兩份明文的 XOR。",
            },
          ]}
          cue="每個都成對只有一個落單、兩份清單只差一個、0 到 n 缺一個數、出現奇數次、要求 O(1) 額外空間、同位檢查（parity）、同一個運算加密又解密、不用暫存變數的交換。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>XOR</strong>（互斥或）在每一位上是「不同為 1、相同為 0」，換個角度看就是<strong>不進位的二進位加法</strong>：每一位各自相加再取 mod 2。從這個角度，四條性質都很自然：<Code>a ^ 0 = a</Code>（加 0 不變）、<Code>a ^ a = 0</Code>（每一位都是 0+0 或 1+1，mod 2 都是 0），以及加法本來就有的<strong>交換律</strong>與<strong>結合律</strong>。前兩條合起來就是「<strong>XOR 是自己的反運算</strong>」：對同一個數 XOR 兩次等於沒做。本篇所有技巧都從這一句來。
        </p>
        <p>
          把一串數全部 XOR 起來，結果的第 k 位等於「所有數在第 k 位上的 1 是奇數個還是偶數個」。所以<strong>出現偶數次的值會完全消失，出現奇數次的值會留下</strong>，而且和順序無關，因為交換律與結合律允許把相同的數排在一起先兩兩抵消。Single Number 裡其他數都出現兩次，全部 XOR 就剩落單的那個。Missing Number 把應有的 <Code>0..n</Code> 和陣列裡的值混在一起 XOR，存在的數各出現兩次，缺的只出現一次。若有<strong>兩個</strong>落單值 a、b，總 XOR 是 <Code>a ^ b</Code>，因為 a ≠ b 所以它不是 0；取出它最低位的 1（<Code>diff &amp; -diff</Code>），a 和 b 在這一位必定不同。依這一位把所有數分兩組：相同的數這一位也相同，一定同組；a、b 分在不同組。每組各自就是一題 Single Number。交換也是同一個性質：<Code>a ^= b</Code> 讓 a 暫存 <Code>a ^ b</Code>，<Code>b ^= a</Code> 得到 <Code>b ^ a ^ b = a</Code>，<Code>a ^= b</Code> 再得到 <Code>a ^ b ^ a = b</Code>。
        </p>
        <p>
          每個數只做一次 XOR，<strong>時間 O(n)</strong>，而且一定要看完全部才知道答案，最好與最壞情況相同；只用一個累積變數，<strong>空間 O(1)</strong>。兩個落單值的版本掃兩遍，仍是 O(n) 與 O(1)。對照直覺做法：用雜湊集合記「看過誰」是 O(n) 時間但要 O(n) 空間，先排序再找不成對的是 O(n log n)。XOR 也<strong>不會溢位</strong>：用加總找缺數時，<Code>n = 10⁵</Code> 的總和就超過 32 位元整數。若要反覆查區間 XOR，做法和前綴和一樣：<Code>P[i+1] = P[i] ^ nums[i]</Code>，<Code>nums[l..r]</Code> 的 XOR 是 <Code>P[r+1] ^ P[l]</Code>，建表 O(n) 時間與空間、每次查詢 O(1)。前綴和要用減法把前段扣掉，XOR 的反運算就是自己，所以直接再 XOR 一次。
        </p>
        <p>
          幾個常見陷阱。第一，XOR 只分得出<strong>奇數次與偶數次</strong>：若其他數各出現<strong>三次</strong>（Single Number II），三是奇數，XOR 什麼也消不掉，要改成逐位數 1 的個數再 mod 3。第二，<strong>運算子優先順序</strong>：C++ 的 <Code>==</Code> 比 <Code>^</Code>、<Code>&amp;</Code> 優先，<Code>a ^ b == 0</Code> 其實是 <Code>a ^ (b == 0)</Code>，一定要加括號；Python 則是位元運算優先，不會踩到。第三，XOR 交換在兩個參照指向<strong>同一個變數</strong>時（例如 <Code>i == j</Code> 時交換 <Code>nums[i]</Code> 與 <Code>nums[j]</Code>）第一步就把值清成 0；現代編譯器對暫存變數的交換已經最佳化得很好，XOR 交換的價值在於理解抵消，而不是速度。第四，C++ 對 <Code>int</Code> 取 <Code>-diff</Code> 在 <Code>diff</Code> 是 <Code>INT_MIN</Code> 時會溢位，改用 <Code>unsigned</Code>。和相鄰幾篇的關係：Bitwise Basics 把 XOR 當「翻轉某些位」用，這裡把它當「抵消」用；下一篇 Counting Bits 算漢明距離時，也是先用 <Code>a ^ b</Code> 找出不同的位再數 1。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>先把問題改寫成<strong>奇偶</strong>的說法：「答案出現奇數次，其他值都出現偶數次」。每個都成對只有一個落單、兩份清單只差一個元素、<Code>0..n</Code> 缺一個數，都能這樣改寫。</>,
            <>準備 <Code>acc = 0</Code>，把所有相關的數逐一 <Code>acc ^= x</Code>。缺數字的題目要把「應該出現的」也放進去：索引 <Code>0..n-1</Code> 和 <Code>n</Code> 各 XOR 一次。</>,
            <>掃完後 <Code>acc</Code> 就是答案。不需要排序、不需要記錄看過誰，資料的順序和正負號都不影響結果。</>,
            <>若有兩個落單值，<Code>acc</Code> 會是 <Code>a ^ b</Code>。取 <Code>low = acc &amp; -acc</Code>，再掃一次，只 XOR 滿足 <Code>x &amp; low</Code> 不為 0 的數，得到其中一個 <Code>a</Code>；另一個是 <Code>acc ^ a</Code>。</>,
            <>若要反覆查區間 XOR，先建前綴 <Code>P[i+1] = P[i] ^ nums[i]</Code>，區間 <Code>[l, r]</Code> 的答案是 <Code>P[r+1] ^ P[l]</Code>。在 C++ 裡，XOR 或 AND 只要和比較運算子寫在同一個式子，就加上括號。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>前半段是 Single Number：<Code>nums = [5, 3, 9, 3, 5, 12, 9]</Code>，每一步把一個數 XOR 進 <Code>acc</Code>，下方用 4 位元二進位列出運算前的 acc、這個數與結果。上排陣列裡藍色是正在處理的數，黃色是已經 XOR 進去、還在等另一半的數，灰色是已經互相抵消的一對。留意同一個數第二次出現時，會把它第一次翻過的位元再翻一次，等於從來沒進來過；七個數掃完只剩 12。後半段用 <Code>a = 5</Code>、<Code>b = 9</Code> 走一次三行 XOR 交換，藍色是正在執行的那一行、已執行的行變灰，剛被改寫的變數標成黃色，看中間值 <Code>a ^ b = 12</Code> 怎麼同時記住兩個數。</p>
        <XorTricksDemo />
      </Section>

      <Section id="code">
        <p>三個函式：Single Number 本體、把索引和值配對的 Missing Number、用最低位的 1 分組的兩個落單值版本，最後示範 XOR 交換。C++ 版的交換先檢查兩個參照是否指向同一個變數，取最低位的 1 時改用 <Code>unsigned</Code>，避開 <Code>INT_MIN</Code> 取負的溢位。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 136", name: "Single Number", diff: "Easy" },
            { src: "LeetCode 268", name: "Missing Number（索引和值一起 XOR）", diff: "Easy" },
            { src: "LeetCode 389", name: "Find the Difference（字元也能 XOR）", diff: "Easy" },
            { src: "LeetCode 1310", name: "XOR Queries of a Subarray（前綴 XOR）", diff: "Medium" },
            { src: "LeetCode 260", name: "Single Number III（用最低位的 1 分組）", diff: "Medium" },
            { src: "LeetCode 137", name: "Single Number II（出現三次時 XOR 失效，改逐位計數）", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const xorLesson: Lesson = { prereq: "Bitwise Basics", Body };
