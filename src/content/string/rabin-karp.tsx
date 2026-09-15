import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { RabinKarpDemo } from "@/components/lesson/demos/RabinKarpDemo";
import type { Lesson } from "@/lib/lessons";

const python = `import random

M = 1_000_000_007
B = random.randrange(256, M)            # 底數隨機選，別人無法事先構造大量碰撞


def poly_hash(s):
    x = 0
    for ch in s:
        x = (x * B + ord(ch)) % M
    return x


def rabin_karp(text, pat):
    """pat 在 text 中出現的所有位置。每個視窗 O(1) 更新，期望 O(n + m)"""
    n, m = len(text), len(pat)
    if m == 0 or m > n:
        return []
    top = pow(B, m - 1, M)              # 視窗最高位的權重，滑動時用來減掉離開的字元
    hp, hw = poly_hash(pat), poly_hash(text[:m])
    res = []
    for i in range(n - m + 1):
        if hw == hp and text[i:i + m] == pat:   # 雜湊相同才逐字元確認，碰撞會在這裡被擋掉
            res.append(i)
        if i + m < n:                   # 減掉最高位、整體左移一位、補上新進來的字元
            hw = ((hw - ord(text[i]) * top) * B + ord(text[i + m])) % M
    return res


def find_many(text, patterns):
    """多個「長度相同」的模式一起找：雜湊放進字典，文字只掃一次"""
    m = len(patterns[0])
    if m == 0 or m > len(text):
        return []
    table = {}
    for p in patterns:
        table.setdefault(poly_hash(p), []).append(p)
    top = pow(B, m - 1, M)
    hw, res = poly_hash(text[:m]), []
    for i in range(len(text) - m + 1):
        for p in table.get(hw, []):     # 同一個雜湊值底下可能有好幾個模式，逐一確認
            if text[i:i + m] == p:
                res.append((i, p))
        if i + m < len(text):
            hw = ((hw - ord(text[i]) * top) * B + ord(text[i + m])) % M
    return res


if __name__ == "__main__":
    print(rabin_karp("abracadabra", "abra"))    # [0, 7]
    print(rabin_karp("aaaaa", "aa"))            # [0, 1, 2, 3]
    print(find_many("ACGTTGCAACGTAGGT", ["ACGT", "AGGT", "TTTT"]))
    # [(0, 'ACGT'), (8, 'ACGT'), (12, 'AGGT')]`;

const cpp = `#include <chrono>
#include <cstddef>
#include <iostream>
#include <random>
#include <string>
#include <unordered_map>
#include <vector>

const unsigned long long M = 1000000007ULL;
std::mt19937_64 rng(static_cast<unsigned long long>(std::chrono::steady_clock::now().time_since_epoch().count()));
const unsigned long long B = rng() % (M - 256) + 256;

// pat 在 text 中所有出現位置，期望 O(n + m)
std::vector<std::size_t> rabinKarp(const std::string& text, const std::string& pat) {
    std::size_t n = text.size(), m = pat.size();
    std::vector<std::size_t> res;
    if (m == 0 || m > n) return res;
    unsigned long long top = 1, hp = 0, hw = 0;
    for (std::size_t i = 0; i + 1 < m; i++) top = top * B % M;          // B^(m-1)
    for (std::size_t i = 0; i < m; i++) {
        hp = (hp * B + static_cast<unsigned char>(pat[i])) % M;
        hw = (hw * B + static_cast<unsigned char>(text[i])) % M;
    }
    for (std::size_t i = 0; i + m <= n; i++) {
        if (hw == hp && text.compare(i, m, pat) == 0) res.push_back(i);   // 逐字元確認
        if (i + m < n) {
            unsigned long long out = static_cast<unsigned char>(text[i]) * top % M;
            hw = (hw + M - out) % M;                                       // 先加 M 再減，無號數不會變負
            hw = (hw * B + static_cast<unsigned char>(text[i + m])) % M;
        }
    }
    return res;
}

// 找出所有出現超過一次、長度 k 的 DNA 片段（k ≤ 32）。
// 字母只有 4 種，每個字元剛好用 2 個位元表示，這個滾動「雜湊」是完全不會碰撞的編碼
std::vector<std::string> repeatedSequences(const std::string& s, std::size_t k) {
    std::vector<std::string> res;
    if (k == 0 || k > 32 || s.size() < k) return res;
    auto code = [](char c) -> unsigned long long { return c == 'A' ? 0 : c == 'C' ? 1 : c == 'G' ? 2 : 3; };
    unsigned long long mask = k == 32 ? ~0ULL : (1ULL << (2 * k)) - 1, x = 0;
    std::unordered_map<unsigned long long, int> seen;
    for (std::size_t i = 0; i < s.size(); i++) {
        x = ((x << 2) | code(s[i])) & mask;             // 左移兩位、補上新字元，最舊的字元被 mask 擠掉
        if (i + 1 >= k && ++seen[x] == 2) res.push_back(s.substr(i + 1 - k, k));
    }
    return res;
}

int main() {
    for (std::size_t i : rabinKarp("abracadabra", "abra")) std::cout << i << ' ';   // 0 7
    std::cout << '\\n';
    for (const std::string& t : repeatedSequences("AAAAACCCCCAAAAACCCCCCAAAAAGGGTTT", 10)) std::cout << t << ' ';
    std::cout << '\\n';                                                    // AAAAACCCCC CCCCCAAAAA
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "程式作業的抄襲偵測",
              problem: "一門課 300 份程式作業要兩兩比對，找出抄襲的組合。改變數名稱、調換函式順序、插幾行註解，都不該讓相似度掉到零；兩兩逐字比對則是四萬多對、每對又是長字串比較。",
              why: "Stanford 的 MOSS 系統先把每份作業正規化，再取出所有長度 k 的片段算雜湊，從中挑出一部分當作「指紋」，兩份作業共有的指紋越多就越可疑。n 個字元有 n − k + 1 個片段，滾動雜湊讓每個片段 O(1) 算出，整份作業 O(n)。",
            },
            {
              title: "rsync 只傳送改變的部分",
              problem: "伺服器上有一個 2 GB 的檔案，本機的版本只在中間插入了幾百個位元組。整份重傳太浪費；按固定位移切塊比對也不行，因為插入之後，後面每一塊的位置都錯開了。",
              why: "接收端把舊檔切成固定大小的區塊，傳來每一塊的弱雜湊和強雜湊。傳送端在新檔的「每一個」位移上滑動視窗，用滾動校驗和 O(1) 更新，查表看有沒有某一塊的弱雜湊相同，相同再用強雜湊確認。這和 Rabin-Karp「先比雜湊、再確認」的結構完全一樣，所以位移錯開也找得到。",
            },
            {
              title: "同時找很多個關鍵字",
              problem: "實驗室有 2 萬條長度 20 的引子序列，要在一段 500 萬鹼基的基因組裡找出每一條出現的位置。一條一條跑字串搜尋，就是把基因組從頭掃 2 萬次。",
              why: "長度相同的模式可以把雜湊值全部放進雜湊表，文字只掃一次：每個視窗 O(1) 更新雜湊、O(1) 查表，查到才逐字元確認。總時間是 O(n + 所有模式的總長) 加上命中的確認成本，和模式的數量幾乎無關。",
            },
          ]}
          cue="在長文字裡找固定長度的片段、同時找很多個等長模式、比對所有長度 k 的子字串、視窗每移一格就要一個指紋、只需要期望線性時間。"
        />
      </Section>

      <Section id="concept">
        <p>
          暴力比對在每個起點逐字元比，最壞 <strong>O(nm)</strong>，例如文字是一百萬個 a、模式是 999 個 a 接一個 b，每個起點都要比到最後一個字元才失敗。Rabin-Karp 的想法是先比<strong>雜湊</strong>：模式 P 的雜湊算一次，文字 T 裡每個長度 m 的視窗也算雜湊，雜湊不同就一定不相等，直接跳過。可是如果每個視窗都從頭算，一個視窗就要 O(m)，總共還是 O(nm)，所以關鍵在於讓雜湊能<strong>滾動</strong>。
        </p>
        <p>
          <strong>滾動雜湊</strong>沿用上一篇的多項式雜湊，視窗是一個 B 進位、m 位的數。往右滑一格時：減掉最高位的 <Code>T[i]·B^(m−1)</Code>，整體乘 B 往左推一位，再加上新進來的 <Code>T[i+m]</Code>，也就是 <Code>hash(i+1) = (hash(i) − T[i]·B^(m−1))·B + T[i+m]</Code>，全部 mod M。十進位的例子：四位數視窗從 1234 滑到 2345，就是 (1234 − 1 × 1000) × 10 + 5。<Code>B^(m−1)</Code> 事先算好，每一格只剩幾次加減乘，O(1)。
        </p>
        <p>
          雜湊相同不代表字串相同，所以要<strong>逐字元確認</strong>，確認失敗的就是碰撞造成的假陽性。複雜度：P 和第一個視窗 O(m)，n − m + 1 次滑動各 O(1)；每次確認 O(m)，但假陽性的機率大約 1/M，模數夠大時幾乎不會發生，所以期望時間是 <strong>O(n + m + 命中次數 × m)</strong>，只問「有沒有出現」時找到第一個就停，就是期望 <strong>O(n + m)</strong>。最壞情況仍是 O(nm)：模式在文字裡重疊出現非常多次（T 全是 a、P 也全是 a），或模數和底數被猜到而遭刻意構造碰撞。額外空間只有幾個整數，O(1)。
        </p>
        <p>
          常見的坑：減掉最高位後可能是負數，C++ 要先加 M；<Code>B^(m−1)</Code> 在迴圈裡重算會把每格變回 O(m)；忘了逐字元確認，碰撞時就回報錯誤的位置；最後一個視窗滑完不要再讀 <Code>T[i+m]</Code>，會越界。字母很少、模式很短時，可以把每個字元編成固定位元（DNA 一個鹼基 2 位元），滾動值就是完全不會碰撞的編碼。和鄰近課程的關係：上一篇的前綴雜湊用 <Code>get(i, i+m)</Code> 也能比對每個視窗，但要 O(n) 空間，滾動版只要 O(1)；需要保證最壞 O(n + m) 的單一模式比對用下一篇 KMP；長度不同的大量模式則交給字典樹上的 Aho–Corasick。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>模式比文字長就直接回傳。算出 <Code>hash(P)</Code>、第一個視窗 <Code>hash(T[0, m))</Code>，並預先算好 <Code>top = B^(m−1) mod M</Code>。</>,
            <>檢查目前視窗 i：雜湊和 <Code>hash(P)</Code> 不同就跳過，一定不是。</>,
            <>雜湊相同就逐字元比較 <Code>T[i, i+m)</Code> 和 P，全部相同才記錄位置 i；不同就是碰撞，略過。</>,
            <>還沒到最後一個視窗就滾動：<Code>hash = ((hash − T[i]·top)·B + T[i+m]) mod M</Code>，減完是負數要先加 M。</>,
            <>重複到 <Code>i = n − m</Code>。有多個長度相同的模式時，把它們的雜湊放進雜湊表，每個視窗查一次表即可。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>在 T = abracadabra 裡找 P = abra，和上一篇一樣取 B = 31、a = 1，模數故意用很小的 M = 101。hash(P) = 53，最高位的權重 31³ mod 101 = 97。黃色是目前的視窗，每次滑動時灰色是剛離開的字元、藍色是剛進來的字元，框裡是 O(1) 的滾動算式。八個視窗的雜湊依序是 53、53、74、86、64、35、15、53：視窗 0 雜湊相同，逐字元確認後變綠色，是真的命中；視窗 1 的 brac 雜湊也是 53，確認時第一個字就不同，藍色標出不相符的字元，這就是碰撞；中間五個雜湊不同，直接跳過；視窗 7 再次命中。最後找到位置 0 和 7。</p>
        <RabinKarpDemo />
      </Section>

      <Section id="code">
        <p>Python 放單一模式的 Rabin-Karp，以及多個等長模式共用一次掃描的版本，兩者都在雜湊相同後逐字元確認。C++ 放單一模式版，用無號整數時先加 M 再減；另外附上 DNA 片段的 2 位元滾動編碼，這題因為字母只有 4 種，滾動值本身就不會碰撞，不需要模數。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 796", name: "Rotate String（在 s + s 裡找 goal）", diff: "Easy" },
            { src: "LeetCode 1461", name: "Check If a String Contains All Binary Codes of Size K（位元視窗滾動）", diff: "Medium" },
            { src: "LeetCode 187", name: "Repeated DNA Sequences（2 位元滾動編碼）", diff: "Medium" },
            { src: "LeetCode 686", name: "Repeated String Match", diff: "Medium" },
            { src: "LeetCode 2156", name: "Find Substring With Given Hash Value（反過來從右往左滾動）", diff: "Hard" },
            { src: "LeetCode 1923", name: "Longest Common Subpath（二分長度，每條路徑滾動雜湊取交集）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const rabinKarpLesson: Lesson = { prereq: "String Hashing、Sliding Window", Body };
