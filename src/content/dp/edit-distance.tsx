import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { EditDistanceDemo } from "@/components/lesson/demos/EditDistanceDemo";
import type { Lesson } from "@/lib/lessons";

const python = `def edit_table(a, b):
    """dp[i][j]：把 a 的前 i 個字變成 b 的前 j 個字，最少要幾次插入、刪除或取代"""
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i                               # 變成空字串：刪 i 次
    for j in range(n + 1):
        dp[0][j] = j                               # 從空字串變出來：插入 j 次
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]        # 最後一個字相同，不用動
            else:
                dp[i][j] = 1 + min(dp[i - 1][j - 1],   # 取代 a[i-1] → b[j-1]
                                   dp[i - 1][j],       # 刪除 a[i-1]
                                   dp[i][j - 1])       # 插入 b[j-1]
    return dp


def edit_script(a, b):
    """從右下角往回走，還原實際的操作（相同時優先取代，其次刪除，最後插入）"""
    dp = edit_table(a, b)
    i, j, ops = len(a), len(b), []
    while i > 0 or j > 0:
        if i > 0 and j > 0 and a[i - 1] == b[j - 1]:
            i, j = i - 1, j - 1                    # 相同，不算一步
        elif i > 0 and j > 0 and dp[i][j] == dp[i - 1][j - 1] + 1:
            ops.append(f"取代 {a[i - 1]}→{b[j - 1]}")
            i, j = i - 1, j - 1
        elif i > 0 and dp[i][j] == dp[i - 1][j] + 1:
            ops.append(f"刪除 {a[i - 1]}")
            i -= 1
        else:
            ops.append(f"插入 {b[j - 1]}")
            j -= 1
    return ops[::-1]


def edit_distance(a, b):
    """只要距離：滾動一列。cur[j] 用到的左上角就是 prev[j-1]"""
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i] + [0] * len(b)
        for j, cb in enumerate(b, 1):
            cur[j] = prev[j - 1] if ca == cb else 1 + min(prev[j - 1], prev[j], cur[j - 1])
        prev = cur
    return prev[-1]


if __name__ == "__main__":
    print(edit_table("horse", "ros")[-1][-1], edit_script("horse", "ros"))
    # 3 ['取代 h→r', '刪除 r', '刪除 e']（和互動示範相同）
    print(edit_distance("intention", "execution"), edit_distance("recieve", "receive"))   # 5 2
    words = ["the", "ten", "tea", "eh", "tech", "then"]
    print(sorted(words, key=lambda w: (edit_distance("teh", w), w)))
    # ['eh', 'tea', 'tech', 'ten', 'the', 'then']：the 要 2 步，因為「兩個字對調」算兩次取代`;

const cpp = `#include <algorithm>
#include <cstdlib>
#include <iostream>
#include <string>
#include <vector>

// 只要距離：滾動一列，額外用一個變數記住左上角，空間 O(n)
int editDistance(const std::string& a, const std::string& b) {
    int n = (int)b.size();
    std::vector<int> dp(n + 1);
    for (int j = 0; j <= n; j++) dp[j] = j;          // 第 0 列：插入 j 次
    for (std::size_t i = 1; i <= a.size(); i++) {
        int diag = dp[0];                            // 左上角 dp[i-1][0]
        dp[0] = (int)i;                              // 第 0 行：刪除 i 次
        for (int j = 1; j <= n; j++) {
            int up = dp[j];                          // 還沒覆寫前是上一列的 dp[i-1][j]
            dp[j] = a[i - 1] == b[j - 1] ? diag : 1 + std::min({diag, up, dp[j - 1]});
            diag = up;                               // 下一格的左上角
        }
    }
    return dp[n];
}

// 只找距離不超過 k 的候選：只算 |i − j| <= k 的斜帶，O(k·n)
bool withinK(const std::string& a, const std::string& b, int k) {
    int m = (int)a.size(), n = (int)b.size();
    if (std::abs(m - n) > k) return false;           // 長度差就超過 k，不用算
    const int BIG = k + 1;
    std::vector<std::vector<int>> dp(m + 1, std::vector<int>(n + 1, BIG));
    for (int i = 0; i <= std::min(m, k); i++) dp[i][0] = i;
    for (int j = 0; j <= std::min(n, k); j++) dp[0][j] = j;
    for (int i = 1; i <= m; i++)
        for (int j = std::max(1, i - k); j <= std::min(n, i + k); j++)
            dp[i][j] = std::min(BIG, a[i - 1] == b[j - 1] ? dp[i - 1][j - 1]
                                     : 1 + std::min({dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]}));
    return dp[m][n] <= k;
}

int main() {
    std::cout << editDistance("horse", "ros") << ' ' << editDistance("intention", "execution") << '\\n';   // 3 5
    std::cout << withinK("kitten", "sitting", 2) << ' ' << withinK("kitten", "sitting", 3) << '\\n';     // 0 1
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "搜尋框的「你是不是要找」",
              problem: "使用者在電商搜尋框打了「recieve」，站內沒有這個字。系統要在十萬個商品關鍵字裡，挑出最可能是他想打的那幾個。",
              why: "把兩個字的差異量化成「最少要幾次插入、刪除或取代」：recieve 到 receive 是 2、到 receipt 是 4。先用長度差剔除明顯不可能的候選，再只算距離 ≤ 2 的斜帶，一次查詢只要幾毫秒。但 recieve 到 relieve 只有 1，比 receive 還近，所以實際的拼字建議會再搭配詞頻，或改用把「相鄰兩字對調」算成一步的 Damerau 距離，recieve 到 receive 就只要 1 步。",
            },
            {
              title: "語音辨識的錯誤率",
              problem: "語音辨識模型把一段 20 個詞的語音轉成文字，和人工聽打的參考稿比較：有的詞聽錯、有的漏掉、有的多出來。團隊要一個能跨版本比較的準確度指標。",
              why: "把每個「詞」當成一個字元算編輯距離：取代是聽錯、刪除是漏聽、插入是多聽。距離除以參考稿的詞數就是業界通用的詞錯誤率（WER），例如距離 3、參考稿 20 個詞，WER 就是 15%。表格回溯還能列出到底錯在哪幾個詞。",
            },
            {
              title: "OCR 辨識出的品名對回商品資料庫",
              problem: "發票掃描後辨識出「鮮奶茶大杯（去冰）」，但 OCR 偶爾會把「杯」認成「林」、漏掉括號。系統要把它對應到商品主檔裡最接近的品項才能自動記帳。",
              why: "逐字計算和每個候選品名的編輯距離，距離最小而且低於門檻的就自動配對，太遠的才丟給人工確認。編輯距離容忍少數字元的錯漏，比「完全相同才算」實用得多，而且三種操作的成本可以依 OCR 常見的錯誤類型調整。",
            },
          ]}
          cue="兩個字串有多像、最少幾步把 A 變成 B、插入刪除取代、拼字校正、模糊比對、容錯搜尋、詞錯誤率、dp[i][j] 看兩個前綴。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>編輯距離</strong>（Levenshtein 距離）是把字串 A 變成 B 所需的最少操作次數，允許三種操作：<strong>插入</strong>一個字、<strong>刪除</strong>一個字、把一個字<strong>取代</strong>成另一個字。狀態和 LCS 一樣看兩個前綴：<Code>dp[i][j]</Code> 是「A 的前 i 個字變成 B 的前 j 個字」的最少步數。邊界很直觀：<Code>dp[i][0] = i</Code>（刪光），<Code>dp[0][j] = j</Code>（全部插入），答案在 <Code>dp[m][n]</Code>。
        </p>
        <p>
          轉移同樣只看最後一個字。若 <Code>A[i−1] = B[j−1]</Code>，這兩個字直接對上，<Code>dp[i][j] = dp[i−1][j−1]</Code>，不用花任何一步。若不同，在任何一組最佳操作裡，A 的最後一個字只有三種下場：被<strong>取代</strong>成 B 的最後一個字（左上 <Code>dp[i−1][j−1]</Code> + 1）、被<strong>刪除</strong>（上方 <Code>dp[i−1][j]</Code> + 1），或者它留著、B 的最後一個字是<strong>插入</strong>的（左方 <Code>dp[i][j−1]</Code> + 1）。三種情況涵蓋了所有可能，取最小值就是答案。填表順序和 LCS 一樣逐列由左到右。
        </p>
        <p>
          複雜度 <strong>O(mn)</strong> 時間；要還原操作序列需要整張表 <strong>O(mn)</strong>，從右下角看每一格是由哪一項算出來的往回走即可。只要距離時，每一列只依賴上一列，但轉移用到「左上角」，覆寫前要先用一個變數存起來，空間降到 <strong>O(min(m, n))</strong>。實務上常只關心「距離是否 ≤ k」，例如拼字建議只看 1、2 步內的字：距離 ≤ k 的路徑一定待在 <Code>|i − j| ≤ k</Code> 的斜帶裡，只算這條帶子就是 <strong>O(k·n)</strong>，長度差超過 k 更可以直接跳過。
        </p>
        <p>
          常見的坑：字相同時還加 1；邊界的第 0 列、第 0 行忘了初始化成 0..n、0..m；把「兩個相鄰字對調」當成一步，Levenshtein 距離裡 teh → the 其實要兩次取代，想算一步要改用多了「交換」操作的 Damerau 距離。三種操作的成本不一定要相同，OCR 或語音辨識常把某些取代設得比較便宜，轉移式照樣成立，只是把 +1 換成各自的成本。和上一篇的關係：拿掉「取代」、只准插入與刪除，答案就變成 <Code>m + n − 2·LCS</Code>；同樣「兩個前綴」的表格也出現在 Interleaving String、Distinct Subsequences 和萬用字元比對。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>開 <Code>(m+1) × (n+1)</Code> 的表，<Code>dp[i][0] = i</Code>、<Code>dp[0][j] = j</Code>。</>,
            <>逐列由左到右填：<Code>A[i−1] == B[j−1]</Code> 就 <Code>dp[i][j] = dp[i−1][j−1]</Code>；否則 <Code>1 + min(左上, 上, 左)</Code>，分別對應取代、刪除、插入。</>,
            <><Code>dp[m][n]</Code> 就是編輯距離。</>,
            <>要操作序列：從 <Code>(m, n)</Code> 往回走，看這一格等於哪一個來源（加上該步的成本），往那裡移動並記下操作，走到 <Code>(0, 0)</Code> 後反轉。</>,
            <>只要距離時滾動一列並暫存左上角；只問「是否 ≤ k」就只算 <Code>|i − j| ≤ k</Code> 的斜帶。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>把 horse 變成 ros，這是 LeetCode 72 的範例。先填第 0 列與第 0 行，接著逐格填：藍色是正在填的格子，黃色是這一格最後選用的來源，格子左上角的小箭頭記下來源方向（↖ 相同或取代、↑ 刪除、← 插入；幾個來源一樣小時，依取代、刪除、插入的順序挑）。填完後從右下角回溯，綠色是回溯路徑，右側會依序列出操作：取代 h → r、刪除 r、刪除 e，共 3 步，正好等於右下角的值。</p>
        <EditDistanceDemo />
      </Section>

      <Section id="code">
        <p>Python 放完整表格、還原操作序列，以及滾動一列的省空間版，最後用 teh 的拼字建議示範「對調兩個字」在 Levenshtein 距離裡算兩步。C++ 放只用一列加一個左上角變數的寫法，以及只算斜帶、判斷距離是否 ≤ k 的版本。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 72", name: "Edit Distance", diff: "Medium" },
            { src: "LeetCode 97", name: "Interleaving String（同樣是兩個前綴的表格）", diff: "Medium" },
            { src: "LeetCode 115", name: "Distinct Subsequences（把「最少步數」換成「方法數」）", diff: "Hard" },
            { src: "LeetCode 44", name: "Wildcard Matching（* 可以對上任意長度）", diff: "Hard" },
            { src: "LeetCode 1312", name: "Minimum Insertion Steps to Make a String Palindrome（和自己的反轉比對）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const editDistanceLesson: Lesson = { prereq: "LCS", Body };
