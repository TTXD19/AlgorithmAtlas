import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { KmpDemo } from "@/components/lesson/demos/KmpDemo";
import type { Lesson } from "@/lib/lessons";

const python = `def prefix_function(p):
    """pi[i]：p[:i+1] 最長的「真前綴 = 後綴」的長度。O(m)"""
    pi = [0] * len(p)
    j = 0                                   # 目前的邊界長度
    for i in range(1, len(p)):              # 從 1 開始：整段不算自己的邊界
        while j > 0 and p[i] != p[j]:
            j = pi[j - 1]                   # 延不下去就退到更短的邊界，可能連退好幾次
        if p[i] == p[j]:
            j += 1
        pi[i] = j
    return pi


def kmp_search(text, pat):
    """pat 在 text 中所有出現位置（可重疊）。O(n + m)"""
    if not pat:
        return []
    pi, res, j = prefix_function(pat), [], 0
    for i, ch in enumerate(text):           # i 只往前走，text 換成串流也可以
        while j > 0 and ch != pat[j]:
            j = pi[j - 1]
        if ch == pat[j]:
            j += 1
        if j == len(pat):
            res.append(i - j + 1)
            j = pi[j - 1]                   # 不歸零，才找得到重疊的下一次
    return res


def min_period(s):
    """最短的 p，使得 s[i] == s[i + p] 對所有合法的 i 成立"""
    return len(s) - prefix_function(s)[-1] if s else 0


if __name__ == "__main__":
    print(prefix_function("aabaaab"))           # [0, 1, 0, 1, 2, 2, 3]
    print(kmp_search("aabaabaaab", "aabaaab"))   # [3]
    print(kmp_search("aaaaa", "aaa"))            # [0, 1, 2]
    for s in ["abcabcabc", "abcabca"]:
        p = min_period(s)
        print(s, p, len(s) % p == 0)            # abcabcabc 3 True：由 abc 重複組成
                                                # abcabca 3 False：週期是 3，但最後一段不完整`;

const cpp = `#include <cstddef>
#include <initializer_list>
#include <iostream>
#include <string>
#include <utility>
#include <vector>

// pi[i]：p[0..i] 最長的「真前綴 = 後綴」的長度
std::vector<std::size_t> prefixFunction(const std::string& p) {
    std::vector<std::size_t> pi(p.size(), 0);
    std::size_t j = 0;
    for (std::size_t i = 1; i < p.size(); i++) {
        while (j > 0 && p[i] != p[j]) j = pi[j - 1];
        if (p[i] == p[j]) j++;
        pi[i] = j;
    }
    return pi;
}

// 串流版 KMP：資料一塊一塊送進來，比對狀態 j 跨塊保留，讀過的資料不必留在記憶體
class StreamMatcher {
    std::string pat;
    std::vector<std::size_t> pi;
    std::size_t j = 0;        // 目前對上了 pat 的前 j 個字元
    std::size_t pos = 0;      // 整條串流已經讀了幾個位元組

public:
    explicit StreamMatcher(std::string p) : pat(std::move(p)), pi(prefixFunction(pat)) {}

    // 送進一塊資料，回傳這塊裡完成的出現位置（以整條串流計算的起點）
    std::vector<std::size_t> feed(const std::string& chunk) {
        std::vector<std::size_t> hits;
        if (pat.empty()) return hits;
        for (char c : chunk) {
            while (j > 0 && c != pat[j]) j = pi[j - 1];
            if (c == pat[j]) j++;
            pos++;
            if (j == pat.size()) {
                hits.push_back(pos - pat.size());
                j = pi[j - 1];
            }
        }
        return hits;
    }
};

// a 的結尾和 b 的開頭最長重疊多少：對 b + '#' + a 求 pi，最後一格就是答案（# 不能出現在字串裡）
std::size_t longestOverlap(const std::string& a, const std::string& b) {
    return prefixFunction(b + '#' + a).back();
}

int main() {
    for (std::size_t v : prefixFunction("aabaaab")) std::cout << v << ' ';   // 0 1 0 1 2 2 3
    std::cout << '\\n';

    StreamMatcher m("--boundary");      // 第一個分隔字串被切在兩塊資料的交界
    for (const char* chunk : {"field=1 --bou", "ndary field=2 --", "boundary--"})
        for (std::size_t at : m.feed(chunk)) std::cout << at << ' ';          // 8 27
    std::cout << '\\n';

    std::cout << longestOverlap("GATTACA", "TACAGG") << '\\n';               // 4（TACA）
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "上傳檔案時在資料流裡找分隔字串",
              problem: "瀏覽器上傳一個 4 GB 的影片，表單資料用 multipart 格式傳送，各欄位之間以一條隨機產生的分隔字串隔開。伺服器是一塊一塊從網路收到資料的，不可能先把 4 GB 全讀進記憶體再搜尋，而分隔字串還可能剛好被切在兩塊資料的交界。",
              why: "KMP 比對時文字指標從不回頭，整個比對狀態只有一個整數 j，代表「目前已經對上分隔字串的前 j 個字元」。每收到一塊資料就沿用同一個 j 往下掃，被切斷的分隔字串自然會在下一塊接上；掃過的資料可以立刻寫進檔案丟掉，記憶體只要 O(m)。",
            },
            {
              title: "封包內容的特徵比對",
              problem: "入侵偵測系統要在每個經過的封包裡找已知攻擊的特徵字串。暴力比對平常很快，但攻擊者可以故意送出讓每個起點都要比很久才失敗的內容，例如一長串 a，把偵測系統本身拖慢，讓後面的攻擊封包趁機通過。",
              why: "KMP 的最壞時間就是 O(n + m)：失配時只照事先算好的 pi 表移動模式，內容再怎麼構造都不會退化，雜湊法則有被構造碰撞的風險。實務上特徵有成千上萬條，會改用 KMP 的多模式推廣 Aho–Corasick，把所有特徵的失敗函數建在一棵字典樹上，一次掃描全部比對。",
            },
            {
              title: "組裝定序片段時找頭尾重疊",
              problem: "定序儀一次只能讀出幾百個鹼基的短片段，組裝基因組時要判斷片段 A 的結尾和片段 B 的開頭重疊多長，例如 GATTACA 的結尾和 TACAGG 的開頭共有 TACA。一個個長度去試，每試一次又要比一整段。",
              why: "把 B、分隔字元 #、A 接成一個字串求 pi，最後一格就是「B 的前綴同時是 A 的後綴」的最長長度；# 不會出現在序列裡，所以邊界不會跨過它。一次 O(|A| + |B|) 就得到答案，不必逐一嘗試每種重疊長度。",
            },
          ]}
          cue="在文字裡找一個模式而且要保證最壞線性、資料一塊一塊進來不能回頭、最長的既是前綴又是後綴的字串、字串的最短週期、兩段字串的頭尾重疊。"
        />
      </Section>

      <Section id="concept">
        <p>
          暴力比對在 <Code>T[i]</Code> 和 <Code>P[j]</Code> 失配時，會把 P 往右移一格、把 i 退回去重新比。浪費在於：失配之前已經確認 <Code>T[i−j..i−1] = P[0..j−1]</Code>，這段文字的內容其實完全由 P 決定，根本不必再看一次 T。所以「失配後 P 可以往右滑多遠而不漏掉答案」只和 P 本身有關，可以事先算好。這就是 <strong>KMP</strong>（Knuth–Morris–Pratt）的出發點。
        </p>
        <p>
          設已經對上 j 個字元。P 往右滑之後若還可能成功，滑過去的 P 開頭必須等於已對上那段 <Code>P[0..j−1]</Code> 的結尾，也就是 <Code>P[0..j−1]</Code> 的一個<strong>邊界</strong>：既是真前綴、又是後綴的字串。滑動量越小，需要的邊界越長，所以保留<strong>最長的邊界</strong>就是最小的可行滑動量，比它更小的滑動量需要更長的邊界，而那不存在，中間跳過的位置一定不是答案。定義<strong>前綴函數</strong> <Code>pi[i]</Code> 是 <Code>P[0..i]</Code> 最長邊界的長度，失配時令 <Code>j = pi[j−1]</Code>，i 不動，繼續拿 <Code>T[i]</Code> 和新的 <Code>P[j]</Code> 比，還是不合就再退，直到對上或 j = 0。例如 P = aabaaab 已經對上 aabaa，它的最長邊界是 aa，就直接滑到只保留 aa 對齊的位置。
        </p>
        <p>
          建 pi 表用的是同一套規則，只是拿 P 和自己比：j 是目前的邊界長度，<Code>P[i] = P[j]</Code> 時邊界延長一格，否則退到 <Code>pi[j−1]</Code> 再試。複雜度要用<strong>均攤分析</strong>：每處理一個字元 j 最多加 1，每次後退 j 至少減 1，而 j 不會小於 0，所以後退的總次數不會超過前進的總次數。建表 O(m)、搜尋 O(n)，合計 <strong>O(n + m)</strong>，而且是最壞情況的保證；額外空間只有 pi 表，<strong>O(m)</strong>。另一種常見寫法是對「P、#、T」接起來的整串求 pi，值等於 m 的位置就是一次出現。
        </p>
        <p>
          常見的坑：<Code>pi[0]</Code> 一定是 0，建表的 i 要從 1 開始，否則整段會被當成自己的邊界；失配時查的是 <Code>pi[j−1]</Code> 而不是 <Code>pi[j]</Code>；後退要用 while 而不是 if，可能要連退好幾次；找到一次之後 j 要設成 <Code>pi[m−1]</Code> 而不是 0，否則在 aaaaa 裡找 aaa 會漏掉重疊的出現。pi 表本身也很有用：字串的最短週期是 <Code>m − pi[m−1]</Code>，它能整除 m 時，字串就是由這段重複組成。和鄰近課程的關係：Rabin-Karp 用雜湊做到期望線性，KMP 則是確定性的；下一篇 Z-Algorithm 從另一個角度記錄「每個位置和開頭的共同前綴」，能解的問題幾乎相同；有很多模式時，把 pi 的想法搬到字典樹上就是 Aho–Corasick。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>建 pi 表：<Code>pi[0] = 0</Code>、<Code>j = 0</Code>；i 從 1 到 m−1，當 <Code>j &gt; 0</Code> 且 <Code>P[i] ≠ P[j]</Code> 時令 <Code>j = pi[j−1]</Code>；若 <Code>P[i] = P[j]</Code> 則 j 加 1；最後 <Code>pi[i] = j</Code>。</>,
            <>搜尋時令 <Code>j = 0</Code>，i 從頭掃 T。每讀一個 <Code>T[i]</Code>，只要 <Code>j &gt; 0</Code> 且 <Code>T[i] ≠ P[j]</Code>，就退到 <Code>j = pi[j−1]</Code>，i 不動。</>,
            <>若 <Code>T[i] = P[j]</Code>，j 加 1；否則此時 j 已經是 0，直接讀下一個字元。</>,
            <>若 <Code>j = m</Code>，記錄出現位置 <Code>i − m + 1</Code>，並令 <Code>j = pi[m−1]</Code>，繼續找可能重疊的下一次。</>,
            <>需要週期或重疊時直接讀 pi：最短週期是 <Code>m − pi[m−1]</Code>；A 的結尾和 B 的開頭的最長重疊，是「B、#、A」接起來求 pi 的最後一格。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>P = aabaaab、T = aabaabaaab。第一階段建 pi 表：上排是 P，下排是 P 的另一份複本，對齊在 i − j 的位置，拿自己和自己比。綠色是對上的字元；黃色是失配但還能後退，pi 表裡被查的那一格也同時變黃；藍色是失配而且 j 已經是 0。i = 2 退到 j = 0 仍然不同，所以 pi[2] = 0；i = 5 退到 j = 1 後就對上了，pi[5] = 2。建好的 pi = [0, 1, 0, 1, 2, 2, 3]。第二階段在 T 裡找：前五個字元 aabaa 全部對上，T[5] = b 和 P[5] = a 失配。暴力法會把 P 移一格、從 T[1] 重來；KMP 查 pi[4] = 2，知道已對上的 aabaa 頭尾都是 aa，直接把 P 滑到位置 3、j = 2，i 停在原地。T[5] = b 正好對上 P[2]，之後一路對到結尾，在位置 3 找到 P。整個過程 i 只往前走了 10 步。</p>
        <KmpDemo />
      </Section>

      <Section id="code">
        <p>Python 放前綴函數、找出所有出現位置（包含重疊的），以及用 pi 求最短週期。C++ 放跨資料塊保留狀態的串流比對器，示範分隔字串被切在兩塊資料交界時一樣找得到，另外用 pi 求兩段序列的頭尾重疊。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 28", name: "Find the Index of the First Occurrence in a String", diff: "Easy" },
            { src: "LeetCode 459", name: "Repeated Substring Pattern（最短週期能整除長度）", diff: "Easy" },
            { src: "LeetCode 1764", name: "Form Array by Concatenating Subarrays of Another Array（在整數陣列上跑 KMP）", diff: "Medium" },
            { src: "LeetCode 1392", name: "Longest Happy Prefix（答案就是 pi[m−1]）", diff: "Hard" },
            { src: "LeetCode 214", name: "Shortest Palindrome（對 s、#、反轉的 s 接起來求 pi）", diff: "Hard" },
            { src: "LeetCode 3008", name: "Find Beautiful Indices in the Given Array II（兩次 KMP 再用雙指標）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const kmpLesson: Lesson = { prereq: "Rabin-Karp、Amortized Analysis", Body };
