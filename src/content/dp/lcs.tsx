import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { LcsDemo } from "@/components/lesson/demos/LcsDemo";
import type { Lesson } from "@/lib/lessons";

const python = `def lcs_table(a, b):
    """dp[i][j]：a 的前 i 個與 b 的前 j 個元素的 LCS 長度。O(mn)"""
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]   # 第 0 列、第 0 行是空序列，全是 0
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1  # 相同：接在兩邊都去掉它的 LCS 後面
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])   # 不同：至少捨棄一邊的這個字
    return dp


def lcs_string(a, b):
    """從右下角沿著來源往回走，還原一個 LCS（平手時優先往左，和互動示範相同）"""
    dp = lcs_table(a, b)
    i, j, out = len(a), len(b), []
    while i > 0 and j > 0:
        if a[i - 1] == b[j - 1]:
            out.append(a[i - 1])
            i, j = i - 1, j - 1
        elif dp[i][j - 1] >= dp[i - 1][j]:
            j -= 1
        else:
            i -= 1
    return "".join(reversed(out))


def diff(old, new):
    """逐行比對：LCS 裡的行保留，其餘標成刪除（-）或新增（+）"""
    dp = lcs_table(old, new)
    i, j, out = len(old), len(new), []
    while i > 0 or j > 0:
        if i > 0 and j > 0 and old[i - 1] == new[j - 1]:
            out.append("  " + old[i - 1]); i -= 1; j -= 1
        elif j > 0 and (i == 0 or dp[i][j - 1] >= dp[i - 1][j]):
            out.append("+ " + new[j - 1]); j -= 1
        else:
            out.append("- " + old[i - 1]); i -= 1
    return out[::-1]


if __name__ == "__main__":
    print(lcs_table("PYTHON", "TYPHOON")[-1][-1], lcs_string("PYTHON", "TYPHOON"))   # 4 THON
    old = ["import os", "x = 1", "print(x)", "return x"]
    new = ["import os", "import sys", "x = 2", "print(x)", "return x"]
    print("\\n".join(diff(old, new)))
    #   import os
    # - x = 1
    # + import sys
    # + x = 2
    #   print(x)
    #   return x`;

const cpp = `#include <algorithm>
#include <iostream>
#include <string>
#include <vector>

// 完整二維表：要還原 LCS 字串時需要它
std::string lcsString(const std::string& a, const std::string& b) {
    int m = (int)a.size(), n = (int)b.size();
    std::vector<std::vector<int>> dp(m + 1, std::vector<int>(n + 1, 0));
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = a[i - 1] == b[j - 1] ? dp[i - 1][j - 1] + 1
                                             : std::max(dp[i - 1][j], dp[i][j - 1]);
    std::string out;
    for (int i = m, j = n; i > 0 && j > 0;) {       // 從右下角往回走
        if (a[i - 1] == b[j - 1]) { out += a[i - 1]; i--; j--; }
        else if (dp[i][j - 1] >= dp[i - 1][j]) j--;
        else i--;
    }
    std::reverse(out.begin(), out.end());
    return out;
}

// 只要長度：每一列只依賴上一列，滾動兩列，空間 O(min(m, n))
int lcsLength(std::string a, std::string b) {
    if (a.size() < b.size()) std::swap(a, b);       // 讓 b 是短的
    std::vector<int> prev(b.size() + 1, 0), cur(b.size() + 1, 0);
    for (char ch : a) {
        for (std::size_t j = 1; j <= b.size(); j++)
            cur[j] = ch == b[j - 1] ? prev[j - 1] + 1 : std::max(prev[j], cur[j - 1]);
        std::swap(prev, cur);
    }
    return prev[b.size()];
}

int main() {
    std::cout << lcsString("PYTHON", "TYPHOON") << ' ' << lcsLength("PYTHON", "TYPHOON") << '\\n';   // THON 4
    std::cout << lcsString("ABCBDAB", "BDCABA") << ' ' << lcsLength("ABCBDAB", "BDCABA") << '\\n';   // BDAB 4
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "git diff：這次改了哪幾行",
              problem: "一份 1,200 行的設定檔改了幾處，程式碼審查工具要標出哪些行沒變、哪些行被刪、哪些行是新加的，而且「沒變的行」要盡量多，審查的人才不會被一大片紅綠淹沒。",
              why: "把每一行當成一個元素，兩個版本的最長共同子序列就是「沒變的行」，其餘的在舊版標成刪除、在新版標成新增。git 預設的 Myers 演算法算的正是「只用刪除與新增的最短編輯」，它和 LCS 是同一個問題，只是針對差異很小的情況做了加速。",
            },
            {
              title: "兩段基因序列有多相似",
              problem: "研究人員比對兩個物種同一個基因的片段，各約 1 萬個鹼基（A、C、G、T）。演化過程中有些鹼基被插入或刪除，位置整個錯開，逐格比對會完全失準。",
              why: "LCS 允許中間跳過任意個字，只要求保留下來的字前後順序一致，正好容忍插入與刪除造成的錯位。1 萬 × 1 萬的表是一億格，每格 O(1)。生物資訊裡的 Needleman–Wunsch 全域比對就是在同一張表上，把「相同加一」換成可調的得分與罰分。",
            },
            {
              title: "自動摘要與作業抄襲的相似度分數",
              problem: "系統產生了一段摘要，要和人工寫的參考摘要比較像不像；或者兩份報告各 3,000 字，老師想先篩出疑似抄襲的配對。字的順序被稍微打亂或中間插了幾句，都不該讓分數歸零。",
              why: "LCS 長度除以參考文字的長度，就是摘要評分常用的 ROUGE-L。它只看「依序出現」的共同字詞，不要求連續，所以插幾句話、換個說法，分數只會小幅下降；整段照抄則會非常接近 1。",
            },
          ]}
          cue="兩個序列、共同的部分、保持相對順序但可以不連續、diff、比對、刪除與插入最少、相似度、dp[i][j] 看兩個前綴。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>子序列</strong>是從序列裡刪掉任意幾個元素、剩下的保持原本順序，不必連續；<strong>最長共同子序列（LCS）</strong>就是同時是 A 和 B 子序列的最長那一個。暴力法列出 A 的 2ᵐ 個子序列逐一檢查，完全不可行。DP 的狀態定義成兩個<strong>前綴</strong>：<Code>dp[i][j]</Code> 是「A 的前 i 個」和「B 的前 j 個」的 LCS 長度，表大小 <Code>(m+1) × (n+1)</Code>，第 0 列和第 0 行代表空序列，全是 0，答案在右下角 <Code>dp[m][n]</Code>。
        </p>
        <p>
          轉移只看兩個前綴的<strong>最後一個元素</strong>。若 <Code>A[i−1] = B[j−1]</Code>，一定存在一個最長的 LCS 以它結尾：就算某個 LCS 沒用到這對字，把它最後一個字換成這對字仍然合法、長度不變，所以 <Code>dp[i][j] = dp[i−1][j−1] + 1</Code>。若兩者不同，它們不可能同時是 LCS 的最後一個字，至少有一個沒被用到：沒用到 A 的就是 <Code>dp[i−1][j]</Code>，沒用到 B 的就是 <Code>dp[i][j−1]</Code>，取較大者。每一格只依賴上方、左方、左上方，<strong>逐列由左到右</strong>填就保證用到的格子都已算好。
        </p>
        <p>
          複雜度是 m×n 格、每格 O(1)，<strong>O(mn)</strong> 時間。空間：要還原 LCS 本身就得留著整張表，<strong>O(mn)</strong>，從右下角開始，相同就收下這個字往左上走，不同就往較大的那一邊走；只要長度的話，每一列只用到上一列，滾動兩列降到 <strong>O(min(m, n))</strong>。兩段一萬字的文字是一億格，時間還可以，但整張表要好幾百 MB，這時要改用 Hirschberg 的分治法在線性空間裡還原答案。
        </p>
        <p>
          常見的坑：<strong>子序列</strong>和<strong>子字串</strong>分不清，「最長共同子字串」要求連續，轉移變成相同時 <Code>dp[i−1][j−1] + 1</Code>、不同時歸零，答案是整張表的最大值而不是右下角；索引差一，<Code>dp</Code> 的第 i 列對應的是 <Code>A[i−1]</Code>；以為 LCS 唯一，平手時往上或往左會得到不同但一樣長的答案。和鄰近課程的關係：只允許刪除與插入時，把 A 變成 B 的最少步數是 <Code>m + n − 2·LCS</Code>，再加上「取代」就是下一篇的 Edit Distance，填表方式完全一樣；LIS 那篇提過，當其中一個序列元素互不重複時，LCS 可以轉成 LIS，用 O(n log n) 解決。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>開一張 <Code>(m+1) × (n+1)</Code> 的表 <Code>dp</Code>，第 0 列與第 0 行全部是 0，代表和空序列的 LCS。</>,
            <>i 從 1 到 m、j 從 1 到 n 逐格填：<Code>A[i−1] == B[j−1]</Code> 就 <Code>dp[i][j] = dp[i−1][j−1] + 1</Code>，否則取 <Code>max(dp[i−1][j], dp[i][j−1])</Code>。</>,
            <>右下角 <Code>dp[m][n]</Code> 就是 LCS 的長度。</>,
            <>要還原 LCS：從 <Code>(m, n)</Code> 出發，字相同就收下並往左上走；不同就往 dp 值較大的上方或左方走，平手任選一邊。收下的字反轉就是答案；沿路往上是「刪除 A 的字」、往左是「插入 B 的字」，就是 diff。</>,
            <>只要長度時改成滾動兩列，讓短的序列當列寬，空間降到 <Code>O(min(m, n))</Code>。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>A = PYTHON、B = TYPHOON，P、Y、T 三個字在兩邊的順序顛倒，所以 LCS 不只一種。先逐列填表：藍色是正在填的格子，黃色是它讀取的格子，字相同時讀左上方，不同時比較上方和左方，格子左上角的小箭頭記下答案從哪裡來（平手固定記 ←）。填完後從右下角回溯，綠框是回溯路徑，實心綠色是屬於 LCS 的字；下方同時長出 diff，綠色是保留、黃色 − 是從 A 刪除、藍色 + 是從 B 插入。這條路走出來的 LCS 是 THON，最後一步會列出平手時改走別的方向能得到的另外兩個，長度一樣是 4。</p>
        <LcsDemo />
      </Section>

      <Section id="code">
        <p>Python 放完整的表格、還原 LCS 字串，以及把每一行當成元素的 diff，範例輸出就是 git diff 的樣子。C++ 放需要整張表的字串還原版，和只要長度、滾動兩列的省空間版。兩種語言的回溯在平手時都優先往左，和互動示範得到同一個答案。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 1143", name: "Longest Common Subsequence", diff: "Medium" },
            { src: "LeetCode 1035", name: "Uncrossed Lines（連線不交叉就是保持順序，換個包裝的 LCS）", diff: "Medium" },
            { src: "LeetCode 583", name: "Delete Operation for Two Strings（答案是 m + n − 2·LCS）", diff: "Medium" },
            { src: "LeetCode 718", name: "Maximum Length of Repeated Subarray（對照：要求連續就是子字串）", diff: "Medium" },
            { src: "LeetCode 712", name: "Minimum ASCII Delete Sum for Two Strings（把「長度」換成字元值的總和）", diff: "Medium" },
            { src: "LeetCode 1092", name: "Shortest Common Supersequence（先求 LCS 表，再沿路把兩邊的字都放進去）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const lcsLesson: Lesson = { prereq: "Memoization & Tabulation、1-D DP", Body };
