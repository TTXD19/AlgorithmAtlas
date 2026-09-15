import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { ZAlgoDemo } from "@/components/lesson/demos/ZAlgoDemo";
import type { Lesson } from "@/lib/lessons";

const python = `def z_function(s):
    """z[i]：s 和 s[i:] 的最長共同前綴長度。O(n)"""
    n = len(s)
    z = [0] * n
    if n:
        z[0] = n
    l = r = 0                                   # 視窗 [l, r]：s[l..r] 和 s[0..r-l] 相同
    for i in range(1, n):
        if i <= r:
            z[i] = min(z[i - l], r - i + 1)     # 抄鏡像位置的答案，但最多只能借到視窗邊界
        while i + z[i] < n and s[z[i]] == s[i + z[i]]:
            z[i] += 1                           # 視窗外的部分只能逐字元比
        if z[i] and i + z[i] - 1 > r:           # 右端更遠才換視窗
            l, r = i, i + z[i] - 1
    return z


def z_search(text, pat):
    """對 pat + 分隔字元 + text 求 Z，值等於 m 的位置就是一次出現"""
    m = len(pat)
    if m == 0:
        return []
    z = z_function(pat + "\\0" + text)          # 分隔字元不在字串裡，Z 值不會超過 m
    return [i - m - 1 for i in range(m + 1, len(z)) if z[i] == m]


def almost_match(text, pat):
    """最多錯一個字元的出現位置：開頭對上 a 個、結尾對上 b 個，a + b >= m - 1 就成立"""
    n, m = len(text), len(pat)
    if m == 0 or m > n:
        return []
    front = z_function(pat + "\\0" + text)
    back = z_function(pat[::-1] + "\\0" + text[::-1])   # 反轉後的前綴 = 原本的後綴
    res = []
    for i in range(n - m + 1):
        a = front[m + 1 + i]                    # text[i:] 和 pat 從頭對上幾個
        b = back[m + 1 + (n - i - m)]           # text[i:i+m] 和 pat 從尾巴對上幾個
        if a + b >= m - 1:
            res.append(i)
    return res


if __name__ == "__main__":
    print(z_function("aabcaabcaab"))            # [11, 1, 0, 0, 7, 1, 0, 0, 3, 1, 0]
    print(z_search("abracadabra", "abra"))      # [0, 7]
    print(almost_match("ACGTTACGAACGT", "ACGT"))   # [0, 5, 9]：位置 5 是 ACGA，錯一個`;

const cpp = `#include <algorithm>
#include <cstddef>
#include <iostream>
#include <string>
#include <vector>

std::vector<std::size_t> zFunction(const std::string& s) {
    std::size_t n = s.size();
    std::vector<std::size_t> z(n, 0);
    if (n) z[0] = n;
    std::size_t l = 0, r = 0;                                   // 視窗 [l, r]
    for (std::size_t i = 1; i < n; i++) {
        if (i <= r) z[i] = std::min(z[i - l], r - i + 1);
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
        if (z[i] && i + z[i] - 1 > r) { l = i; r = i + z[i] - 1; }
    }
    return z;
}

// 最短週期：最小的 i 使得 i + Z[i] = n（s 往右平移 i 格後和自己重疊的部分完全相同）
std::size_t minPeriod(const std::string& s) {
    std::vector<std::size_t> z = zFunction(s);
    for (std::size_t i = 1; i < s.size(); i++)
        if (i + z[i] == s.size()) return i;
    return s.size();
}

// 環狀序列：b 是 a 的旋轉，等價於長度相同而且 b 出現在 a + a 裡（# 不能出現在字串中）
bool isRotation(const std::string& a, const std::string& b) {
    if (a.size() != b.size()) return false;
    if (a.empty()) return true;
    std::vector<std::size_t> z = zFunction(b + '#' + a + a);
    for (std::size_t i = b.size() + 1; i < z.size(); i++)
        if (z[i] == b.size()) return true;
    return false;
}

int main() {
    for (std::size_t v : zFunction("aabcaabcaab")) std::cout << v << ' ';   // 11 1 0 0 7 1 0 0 3 1 0
    std::cout << '\\n';

    std::string read = "CAGCAGCAGCAGCAG";
    std::size_t p = minPeriod(read);
    std::cout << read.substr(0, p) << ' ' << read.size() / p << ' ' << (read.size() % p == 0) << '\\n';   // CAG 5 1

    std::cout << isRotation("ATGCCGTA", "CGTAATGC") << ' ' << isRotation("ATGCCGTA", "CGTAATCG") << '\\n';   // 1 0
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "容許一個突變的序列搜尋",
              problem: "在 500 萬鹼基的細菌基因組裡找一段 25 個鹼基的探針序列，但樣本可能帶有單點突變，所以「最多只錯一個鹼基」的位置都要列出來。精確比對的 KMP 找不到這些位置，暴力法則是每個起點比 25 個字元。",
              why: "Z 函數能回答「從這裡開始和模式的開頭對上幾個字」。正著對「模式、分隔字元、基因組」求一次，得到每個位置從頭對上 a 個；把兩者都反轉再求一次，得到從尾巴對上 b 個。只要 a + b 至少是 m − 1，中間最多只有一個字元不同。兩次 O(n + m) 就把所有位置判完。",
            },
            {
              title: "偵測串聯重複序列",
              problem: "亨丁頓舞蹈症和 HTT 基因裡 CAG 三個鹼基重複的次數有關，重複太多次就會發病。分析定序片段時，要判斷一段序列是不是由某個短單元一直重複而成，單元是什麼、重複了幾次。",
              why: "如果字串往右平移 p 格後和自己重疊的部分完全相同，p 就是週期，而這正好等於 i = p 時 i + Z[i] = n。對整段求一次 Z 陣列，最小的這種 i 就是最短重複單元的長度，O(n) 得到單元和重複次數，不必一個個長度去試。",
            },
            {
              title: "比對環狀的 DNA",
              problem: "細菌的質體是環狀 DNA，定序組裝出來的序列從哪個位置開始是任意的。兩個實驗室各自組裝出一條 8,000 個鹼基的序列，要判斷它們是不是同一個質體，只是起點不同。",
              why: "b 是 a 的旋轉，等價於兩者等長而且 b 出現在 a + a 裡。對「b、分隔字元、a + a」求 Z 陣列，只要有某個位置的值等於 b 的長度就是同一個環，O(n)。這個「模式、分隔字元、文字」的接法是 Z 函數做字串比對的標準寫法。",
            },
          ]}
          cue="每個位置和字串開頭的最長共同前綴、在模式加分隔字元加文字上找 Z 值等於 m 的位置、週期與重複單元、容許少量錯誤的比對（正反各做一次）、字串旋轉。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>Z 陣列</strong>的定義是：<Code>Z[i]</Code> 等於「整個字串 s」和「從 i 開始的後綴 s[i..]」的最長共同前綴長度。<Code>Z[0]</Code> 就是整串長度，通常不使用。每個位置都從頭逐字元比，遇到 aaaa…a 這種字串就是 O(n²)。Z 演算法維護一個<strong>視窗</strong> <Code>[l, r]</Code>：在目前算過的位置裡，匹配區間 <Code>[i, i + Z[i] − 1]</Code> 伸得最右邊的那一段。視窗的性質是 <Code>s[l..r]</Code> 和開頭的 <Code>s[0..r−l]</Code> 一模一樣。
        </p>
        <p>
          算 <Code>Z[i]</Code> 時分成三種情況。若 <Code>i &gt; r</Code>，i 在視窗外，沒有資訊可借，只能從頭逐字元比，比完如果伸得比 r 遠就換成新視窗。若 i 在視窗內，因為視窗和開頭相同，<Code>s[i..r]</Code> 就是 <Code>s[i−l..r−l]</Code>，<Code>i − l</Code> 叫做 i 的<strong>鏡像位置</strong>，它的 Z 值早就算好了。鏡像值比剩餘的 <Code>r − i + 1</Code> 格小，代表鏡像那邊的匹配在視窗範圍內就斷了，i 這邊一樣會在同一處斷，直接抄 <Code>Z[i] = Z[i−l]</Code>，零次比較。鏡像值大於等於剩餘格數時，只能確定前 <Code>r − i + 1</Code> 個字元相同，視窗外的字元沒有看過，要從 r 的下一格繼續往後比，再更新視窗。
        </p>
        <p>
          複雜度：往後比時，每次比對成功都讓 r 往右推一格，r 只增不減、最多到 n，所以成功的比較總共不超過 n 次；失敗的比較每個 i 最多一次。整體 <strong>O(n)</strong> 時間、<strong>O(n)</strong> 空間。做字串比對時，把模式、一個不會出現的分隔字元、文字接起來求 Z 陣列：分隔字元讓 Z 值不會超過 m，某個位置的值剛好是 m，就代表文字從那裡開始出現一次模式，總共 O(n + m)。和 KMP 相比，KMP 的 pi 表只存模式的 O(m)，文字可以是串流；Z 演算法要把整串接起來，但「每個位置和開頭對上幾個」的定義更直觀，也更容易組合出其他應用。
        </p>
        <p>
          常見的坑：抄鏡像值時忘了和 <Code>r − i + 1</Code> 取最小值，會把視窗外沒看過的字元也當成相同；視窗的右端用閉區間還是半開區間要前後一致，差一就錯；忘了放分隔字元，Z 值會越過模式伸進文字，「等於 m」的判斷就不可靠；把 <Code>Z[0]</Code> 當成一般值使用。實用性質：<Code>i + Z[i] = n</Code> 的每個 i 都是字串的週期，最小的那個就是最短週期，能整除 n 時字串就是這個單元的完整重複；把字串反轉再求一次，就能拿到「從結尾往前對上幾個」，組合出容許錯誤的比對。和鄰近課程的關係：Z 陣列和 KMP 的 pi 表可以在 O(n) 內互相轉換，能解的問題幾乎一樣；下一篇 Manacher 用的是同一個想法，「在伸得最遠的區間裡借鏡像位置的答案」，只是把共同前綴換成回文半徑。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>令 <Code>Z[0] = n</Code>，視窗 <Code>l = r = 0</Code>，i 從 1 掃到 n − 1。</>,
            <>若 <Code>i ≤ r</Code>，先令 <Code>Z[i] = min(Z[i − l], r − i + 1)</Code>，這些字元保證相同，不必比；否則 <Code>Z[i] = 0</Code>。</>,
            <>從目前的 <Code>Z[i]</Code> 繼續逐字元比 <Code>s[Z[i]]</Code> 和 <Code>s[i + Z[i]]</Code>，相同就加 1。鏡像值比剩餘格數小時，第一次比較就會失敗。</>,
            <>若 <Code>Z[i] &gt; 0</Code> 而且 <Code>i + Z[i] − 1 &gt; r</Code>，把視窗換成 <Code>[i, i + Z[i] − 1]</Code>。</>,
            <>要比對時對「模式、分隔字元、文字」求 Z，值等於 m 的位置減去 m + 1 就是文字裡的起點；要找週期時，最小的滿足 <Code>i + Z[i] = n</Code> 的 i 就是最短週期。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>s = aabcaabcaab。字串那一列藍色是目前的 i，下面一列黃色是視窗 [l, r]。i = 1 到 4 都在視窗外，只能逐字元比：Z[1] = 1，Z[2]、Z[3] 都是 0，i = 4 一口氣對上 7 個字元，視窗變成 [4, 10]，直接伸到字串結尾。接著 i = 5、6、7 都在視窗裡，綠色的鏡像位置 1、2、3，Z 值都比剩餘格數小，直接抄過來，零次比較。i = 8 的鏡像 Z[4] = 7，比剩下的 3 格大，只能確定 3 個字元相同，而視窗已經到底，所以 Z[8] = 3，視窗換成 [8, 10]；i = 9、10 再抄一次。最後 Z = [·, 1, 0, 0, 7, 1, 0, 0, 3, 1, 0]，i = 4 和 8 都滿足 i + Z[i] = n，最短週期是 4：s 由 aabc 重複拼成，最後一塊不完整。</p>
        <ZAlgoDemo />
      </Section>

      <Section id="code">
        <p>Python 放 Z 函數、用分隔字元做字串比對，以及正反各求一次 Z 陣列來找「最多錯一個字元」的位置。C++ 放 Z 函數、用最短週期找出串聯重複的單元和次數，以及判斷兩條環狀序列是否只是起點不同。兩種語言的視窗都用閉區間 [l, r]，和互動示範一致。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 3029", name: "Minimum Time to Revert Word to Initial State I（找滿足 i + Z[i] = n 的最小倍數）", diff: "Medium" },
            { src: "LeetCode 2223", name: "Sum of Scores of Built Strings（答案就是整個 Z 陣列的總和）", diff: "Hard" },
            { src: "LeetCode 3031", name: "Minimum Time to Revert Word to Initial State II（同上，長度到 10⁶ 必須線性）", diff: "Hard" },
            { src: "LeetCode 3036", name: "Number of Subarrays That Match a Pattern II（先轉成大小關係序列再比對）", diff: "Hard" },
            { src: "LeetCode 3303", name: "Find the Occurrence of First Almost Equal Substring（正反兩次 Z 陣列）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const zAlgoLesson: Lesson = { prereq: "KMP", Body };
