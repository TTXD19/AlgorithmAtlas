import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { MemoDemo } from "@/components/lesson/demos/MemoDemo";
import type { Lesson } from "@/lib/lessons";

const python = `from functools import cache


# 1. 純遞迴：照定義寫，呼叫次數約 1.618ⁿ，n = 40 就要三億多次
def fib_naive(n):
    if n <= 1:
        return n
    return fib_naive(n - 1) + fib_naive(n - 2)


# 2. 記憶化（自頂向下）：原本的遞迴 + 以參數為 key 的快取
def fib_memo(n, memo=None):
    if memo is None:                       # 別寫 memo={}：預設值只建立一次，會被所有呼叫共用
        memo = {}
    if n in memo:                          # 先查快取
        return memo[n]
    if n <= 1:
        result = n                         # base case
    else:
        result = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    memo[n] = result                       # 算完先存再回傳
    return result


@cache                                     # 標準庫幫你做同一件事：參數就是快取的 key
def fib_cached(n):
    return n if n <= 1 else fib_cached(n - 1) + fib_cached(n - 2)


# 3. 表格法（自底向上）：不遞迴，從 base case 往上填
def fib_table(n):
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):              # 算 dp[i] 時，dp[i-1] 和 dp[i-2] 一定已經填好
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]


# 4. 空間壓縮：dp[i] 只用到前兩格，留兩個變數就夠，O(1) 空間
def fib_rolling(n):
    a, b = 0, 1                            # a = fib(i)，b = fib(i+1)
    for _ in range(n):
        a, b = b, a + b
    return a


# 推廣：爬 n 階，每次可以走 steps 裡任一種步數，有幾種走法（steps = [1, 2] 就是 LeetCode 70）
def climb_memo(n, steps):
    @cache                                 # 快取定義在函式裡：每次呼叫 climb_memo 都是新的一份
    def ways(i):                           # 狀態只有 i；steps 在這次呼叫中不變，不必放進 key
        if i == 0:
            return 1                       # 已經站在第 0 階：一種走法（什麼都不做）
        return sum(ways(i - s) for s in steps if s <= i)
    return ways(n)


def climb_table(n, steps):
    dp = [1] + [0] * n                     # dp[i] = 走到第 i 階的走法數
    for i in range(1, n + 1):
        dp[i] = sum(dp[i - s] for s in steps if s <= i)
    return dp[n]


if __name__ == "__main__":
    print(fib_naive(20), fib_memo(20), fib_cached(20))    # 6765 6765 6765
    print(fib_table(90), fib_rolling(90))                 # 2880067194370816120 2880067194370816120
    print(climb_memo(10, [1, 2]), climb_table(10, [1, 2]))          # 89 89
    print(climb_memo(10, [1, 3, 5]), climb_table(10, [1, 3, 5]))    # 47 47
    print(len(str(fib_table(5000))))                      # 1045（fib(5000) 有 1045 位數）
    # fib_memo(5000) 則會 RecursionError：遞迴深度超過 Python 預設上限 1000`;

const cpp = `#include <iostream>
#include <vector>

// 純遞迴：呼叫次數約 1.618ⁿ
long long fibNaive(int n) {
    if (n <= 1) return n;
    return fibNaive(n - 1) + fibNaive(n - 2);
}

// 記憶化（自頂向下）：memo[n] == -1 代表還沒算過
long long fibMemo(int n, std::vector<long long>& memo) {
    if (memo[n] != -1) return memo[n];                  // 快取命中
    memo[n] = n <= 1 ? n : fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
    return memo[n];                                     // 算完先存再回傳
}

// 表格法（自底向上）：由小到大填，dp[i] 依賴的格子一定已經填好
long long fibTable(int n) {
    if (n <= 1) return n;
    std::vector<long long> dp(n + 1, 0);
    dp[1] = 1;
    for (int i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
    return dp[n];
}

// 空間壓縮：只留前兩格。long long 最多裝得下 fib(92)
long long fibRolling(int n) {
    if (n == 0) return 0;
    long long prev = 0, cur = 1;                        // fib(i-1)、fib(i)，從 i = 1 開始
    for (int i = 2; i <= n; i++) {
        long long next = prev + cur;
        prev = cur;
        cur = next;
    }
    return cur;
}

// 推廣：每次可以走 steps 裡任一種步數，走到第 n 階有幾種走法
long long climbTable(int n, const std::vector<int>& steps) {
    std::vector<long long> dp(n + 1, 0);
    dp[0] = 1;                                          // 站在第 0 階：一種走法
    for (int i = 1; i <= n; i++)
        for (int s : steps)
            if (s <= i) dp[i] += dp[i - s];
    return dp[n];
}

int main() {
    std::vector<long long> memo(91, -1);                // 大小 n + 1，全部標成「沒算過」
    std::cout << fibNaive(20) << " " << fibMemo(20, memo) << "\\n";   // 6765 6765
    std::cout << fibMemo(90, memo) << "\\n";            // 2880067194370816120
    std::cout << fibTable(90) << " " << fibRolling(92) << "\\n";      // 2880067194370816120 7540113804746346429
    std::cout << climbTable(10, {1, 2}) << " " << climbTable(10, {1, 3, 5}) << "\\n";  // 89 47
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "試算表改一格，整本活頁簿要重算",
              problem: "財務模型裡有 2 萬個公式儲存格，「匯率」「稅率」這種格子被上千個公式引用，公式又引用別的公式。如果每個公式求值時都把引用到的格子遞迴重算一遍，共用的格子會被算上千次，依賴鏈一層層疊上去就是指數級的工作量。",
              why: "一個儲存格的值只由它的公式和引用到的格子決定，同一格不管被誰問，答案都一樣，這就是重疊子問題。第一次算完就記在格子上，之後被引用直接讀，總工作量只剩「儲存格數 + 引用數」。若先依相依關係排好順序，從不引用別人的格子一路算上去，就是表格法的做法。",
            },
            {
              title: "棋類 AI 的置換表",
              problem: "井字棋從空盤下到分出勝負共有 255,168 種對局，完整的搜尋樹有 54 萬多個節點。但「先下左上再下中間」和「先下中間再下左上」會走到同一個盤面，不同的盤面其實只有 5,478 個。",
              why: "一個盤面的勝負只由「棋子位置 + 輪到誰」決定，跟怎麼走到這裡無關，所以能用盤面當 key，把評估結果存進雜湊表，第二次遇到直接查表。西洋棋引擎的 transposition table 就是這種記憶化，而且盤面多到不可能全部列出，只能記住實際搜到的那些，這正是記憶化勝過表格法的地方。",
            },
            {
              title: "選擇權定價的二項式樹",
              problem: "把距離到期的時間切成 500 步，每一步股價只會上漲或下跌一個固定比例。逐條路徑去算要面對 2⁵⁰⁰ 條路徑，但先漲後跌和先跌後漲是同一個價格，不同的節點只有 125,751 個。",
              why: "每個節點的價值只由「第幾步、漲了幾次」決定，而且第 t 步只依賴第 t+1 步的兩個節點。從到期日那一層（501 個價格，價值可以直接算）往回一層層填，就是表格法；每層只需要下一層，一個長度 501 的陣列反覆覆寫就夠，也不用擔心 500 層深的遞迴。",
            },
          ]}
          cue="重疊子問題、同樣的參數被算很多次、遞迴樹裡有重複的節點、有幾種方法、最少／最多、純函式、@cache、遞迴太深、自頂向下、自底向上。"
        />
      </Section>

      <Section id="concept">
        <p>
          費氏數列照定義寫成 <Code>fib(n) = fib(n−1) + fib(n−2)</Code>，遞迴樹會長出大量重複的節點：算 <Code>fib(6)</Code> 時 <Code>fib(2)</Code> 被完整算了 5 次。問題不在遞迴本身，而在<strong>沒有人記得算過什麼</strong>。<strong>記憶化（memoization）</strong>是自頂向下：保留原本的遞迴，只加一個以參數為 key 的快取，進函式先查、算完先存。<strong>表格法（tabulation）</strong>是自底向上：不遞迴，先想清楚誰依賴誰，從 base case 開始用迴圈把 <Code>dp[0]</Code>、<Code>dp[1]</Code>、<Code>dp[2]</Code>… 依序填滿。兩者解的是同一組子問題、用同一個轉移式，差別只在順序由誰決定：記憶化讓遞迴按需要自己去問，表格法由你事先排好。
        </p>
        <p>
          能這樣做有一個前提：函式必須是<strong>純函式</strong>，回傳值只由參數決定，不依賴全域變數，也不依賴「怎麼走到這裡」。這樣同一組參數第二次被問到時，快取裡的答案一定仍然正確。這組參數就是 DP 的<strong>狀態</strong>，快取的 key 必須包含所有會影響答案的資訊，少一個就會把不同的問題當成同一個。表格法的正確性則靠<strong>填表順序</strong>：算 <Code>dp[i]</Code> 時，它依賴的格子必須都已經填好，也就是按子問題依賴關係的拓撲順序填。對 i 做歸納：base case 正確，每一格只用已經正確的格子算出來，整張表就正確。依賴關係如果有環，兩種寫法都不成立，記憶化會無限遞迴。
        </p>
        <p>
          複雜度的通用公式是<strong>狀態數 × 每個狀態的轉移成本</strong>。費氏數列有 <Code>n+1</Code> 個狀態、每個 O(1)，所以是 <strong>O(n)</strong>。對照純遞迴：呼叫次數滿足 <Code>c(n) = c(n−1) + c(n−2) + 1</Code>，解出來是 <Code>2·fib(n+1) − 1</Code>，大約以 1.618ⁿ 成長，<Code>n = 40</Code> 就要 3 億 3 千多萬次呼叫；記憶化版只有 <Code>2n − 1</Code> 次，其中 <Code>n+1</Code> 次真正計算，其餘都是快取命中。空間上，記憶化要 O(n) 的快取加上 O(n) 深的呼叫堆疊；表格法只要 O(n) 的陣列，而且 <Code>dp[i]</Code> 只用到前兩格，可以改成兩個變數滾動，降到 <strong>O(1)</strong>。
        </p>
        <p>
          怎麼選：記憶化最好寫，暴力遞迴加三行就好，而且<strong>只會算到真正走得到的狀態</strong>，狀態範圍極大但實際走到的很少時只能用它；代價是遞迴深度，Python 預設上限 1000 層，<Code>fib_memo(5000)</Code> 會直接 <Code>RecursionError</Code>。表格法沒有遞迴、常數小、方便做空間壓縮，但要自己想清楚填表順序，而且每個狀態都會算到。常見的坑：Python 把 <Code>memo={}</Code> 寫成預設參數，換一組輸入仍讀到上一組的答案；<Code>@cache</Code> 的參數必須可雜湊，串列要改成 tuple 或改用索引當狀態；C++ 的 <Code>long long</Code> 到 <Code>fib(93)</Code> 就溢位。和相鄰課程的差別：<strong>分治</strong>的子問題不重疊（合併排序的左右兩半沒有交集），加快取沒有幫助；<strong>回溯</strong>要列出每一條路徑，若只問「有幾種」「最好是多少」，而且之後怎麼走只取決於目前狀態，就能改寫成記憶化。下一課的一維 DP 會把表格法加空間壓縮當成預設寫法。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>先寫出<strong>暴力遞迴</strong>，把函式的意義說清楚：<Code>ways(i)</Code> 回傳「走到第 i 階有幾種走法」。參數就是狀態，base case 寫在最前面。</>,
            <>確認兩件事：遞迴樹裡<strong>同一組參數出現不只一次</strong>（重疊子問題），而且回傳值<strong>只由參數決定</strong>。不依賴全域變數或走過的路徑，才能快取。</>,
            <><strong>記憶化</strong>：開一個以狀態為 key 的 dict 或陣列（沒算過標成 −1）。進函式先查，有就回傳；沒有就照原本的遞迴算，<strong>存進快取再回傳</strong>。Python 可以直接加 <Code>@cache</Code>。</>,
            <><strong>表格法</strong>：把函式換成陣列 <Code>dp</Code>，先填 base case，再用迴圈照「被依賴的先算」的順序填，每一格套同一個轉移式。<Code>dp[i]</Code> 依賴比 i 小的格子，就讓 i 由小到大。</>,
            <><strong>空間壓縮</strong>：看轉移式只用到哪幾格。只用到前 k 格就改成 k 個變數滾動，空間從 O(n) 降到 O(1)。</>,
            <>估算<strong>狀態數 × 轉移成本</strong>確認在時限內。遞迴深度可能上萬時改用表格法；狀態範圍很大但實際走到的很少時，留在記憶化。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>計算 fib(6)，畫面上的樹用 f(n) 代表 fib(n)。整棵遞迴樹一開始是淡色，按「下一步」依呼叫順序點亮，藍色是正在進行的那次呼叫，灰底是第一次碰到的 base case。「純遞迴」模式共 25 次呼叫，黃色是重算已經算過的子問題，佔了 18 次，連整棵 f(4)、f(3) 子樹都被重新展開。切到「記憶化」，同一個問題只剩 11 次呼叫，綠色是快取命中，底下的子樹不再展開。樹下方的卡片統計兩種模式的呼叫次數，旁邊的小表列出 n = 6、10、20、30 時的差距，到 n = 30 已經是 2,692,537 次對 59 次。</p>
        <MemoDemo />
      </Section>

      <Section id="code">
        <p>同一個 fib 寫成四個版本：純遞迴、記憶化（手寫快取與 <Code>@cache</Code>）、表格法、兩個變數的空間壓縮版，方便對照每一步改了什麼；C++ 的快取用陣列，以 −1 代表還沒算過。再用「每次可以選不同步數的爬樓梯」示範同一套轉換套在有多個選擇的轉移式上，Python 的記憶化版刻意把 <Code>@cache</Code> 放在函式裡，避免不同的 steps 共用快取。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 509", name: "Fibonacci Number（記憶化、表格法、滾動變數各寫一次）", diff: "Easy" },
            { src: "LeetCode 70", name: "Climbing Stairs（從暴力遞迴改成表格法）", diff: "Easy" },
            { src: "LeetCode 1137", name: "N-th Tribonacci Number（滾動三個變數）", diff: "Easy" },
            { src: "LeetCode 377", name: "Combination Sum IV（程式碼裡的爬樓梯推廣）", diff: "Medium" },
            { src: "LeetCode 2140", name: "Solving Questions With Brainpower（從後往前填表）", diff: "Medium" },
            { src: "LeetCode 1553", name: "Minimum Number of Days to Eat N Oranges（n 到 2×10⁹，只能記憶化）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const memoLesson: Lesson = { prereq: "Recursion、Hash Table", Body };
