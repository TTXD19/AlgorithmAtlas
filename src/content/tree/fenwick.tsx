import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { FenwickDemo } from "@/components/lesson/demos/FenwickDemo";
import type { Lesson } from "@/lib/lessons";

const python = `class Fenwick:
    """樹狀陣列（Binary Indexed Tree）：前綴和 + 單點加值，索引從 1 開始。"""

    def __init__(self, n):
        self.n = n
        self.tree = [0] * (n + 1)

    def update(self, i, delta):
        """a[i] += delta。往上跳到每個「也負責 i」的格子"""
        while i <= self.n:
            self.tree[i] += delta
            i += i & -i                    # 加上 lowbit

    def prefix(self, i):
        """a[1] + ... + a[i]。往下跳，把負責的區段一段段接起來"""
        s = 0
        while i > 0:
            s += self.tree[i]
            i -= i & -i                    # 去掉 lowbit
        return s

    def range_sum(self, l, r):
        return self.prefix(r) - self.prefix(l - 1)

    @classmethod
    def from_list(cls, a):
        """O(n) 建樹：每個格子把自己加給「上一層負責它的格子」"""
        f = cls(len(a))
        for i, x in enumerate(a, start=1):
            f.tree[i] += x
            j = i + (i & -i)
            if j <= f.n:
                f.tree[j] += f.tree[i]
        return f


f = Fenwick.from_list([5, 3, 8, 6, 2, 7, 4, 1])
print(f.prefix(6))          # 31
f.update(3, 2)
print(f.range_sum(2, 5))    # 3 + 10 + 6 + 2 = 21


# 經典應用：逆序對 / 右邊比自己小的數有幾個
def count_smaller_to_right(nums):
    ranks = {v: i + 1 for i, v in enumerate(sorted(set(nums)))}   # 離散化成 1..m
    f = Fenwick(len(ranks))
    out = []
    for v in reversed(nums):                # 從右往左掃
        out.append(f.prefix(ranks[v] - 1))  # 已經出現、且比 v 小的有幾個
        f.update(ranks[v], 1)
    return out[::-1]`;

const cpp = `#include <vector>

class Fenwick {
    int n;
    std::vector<long long> tree;
public:
    Fenwick(int n) : n(n), tree(n + 1, 0) {}

    void update(int i, long long delta) {
        for (; i <= n; i += i & -i) tree[i] += delta;
    }
    long long prefix(int i) {
        long long s = 0;
        for (; i > 0; i -= i & -i) s += tree[i];
        return s;
    }
    long long rangeSum(int l, int r) { return prefix(r) - prefix(l - 1); }
};

// 用法（1-indexed）
// Fenwick f(8);
// for (int i = 1; i <= 8; i++) f.update(i, a[i]);
// f.prefix(6); f.update(3, 2); f.rangeSum(2, 5);`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "和線段樹同樣的問題，一半的程式碼",
              problem: "前綴和加單點更新是最常見的動態區間問題。線段樹能做，但要寫 build、query、update 三個遞迴，面試時容易寫錯。",
              why: "樹狀陣列用兩個五行的迴圈解決同樣的問題，記憶體只要 n+1 個格子，常數也更小。只要問題能化成「前綴和」，它就是首選。",
            },
            {
              title: "數逆序對、右邊比我小的有幾個",
              problem: "對每個元素問「它右邊有幾個比它小」。這是評分排名相似度、排序「有多亂」的基本量。暴力 O(n²)。",
              why: "從右往左掃，把看過的值當成計數放進樹狀陣列，每個元素查一次「比我小的值目前有幾個」，就是一個前綴和。O(n log n)。",
            },
            {
              title: "即時排名",
              problem: "遊戲分數不斷更新，要隨時查「分數比 x 低的玩家有幾個」，也就是 x 的排名。",
              why: "以分數為索引、人數為值，排名就是前綴和，分數變動就是一次減一、一次加一。兩種操作都是 O(log n)。",
            },
          ]}
          cue="前綴和但資料會變、逆序對、比我小的有幾個、動態排名、想要比線段樹輕的東西。"
        />
      </Section>

      <Section id="concept">
        <p>
          樹狀陣列用一個和原陣列等長的陣列 <Code>tree</Code>，每個格子負責一段區間，長度由索引的<strong>二進位最低位的 1</strong>決定：<Code>lowbit(i) = i &amp; −i</Code>。tree[6]（110₂）負責 2 個元素 a[5..6]；tree[8]（1000₂）負責 8 個元素 a[1..8]；奇數只負責自己。這種切法的巧妙之處：任何前綴 [1, i] 都能拆成 O(log n) 段負責區間，任何位置也只被 O(log n) 個格子負責。
        </p>
        <p>
          <strong>前綴和</strong>：從 i 開始，加 tree[i]，然後 <Code>i −= lowbit(i)</Code>，也就是把最低位的 1 拿掉，跳到「前一段」。每跳一次少一個 1，最多 log n 次。<strong>單點更新</strong>：從 i 開始，tree[i] 加 delta，然後 <Code>i += lowbit(i)</Code>，跳到下一個也負責 i 的格子，直到超出 n。同樣最多 log n 次。
        </p>
        <p>
          兩個操作長得幾乎一樣，差在一個減 lowbit、一個加 lowbit。理解「為什麼減 lowbit 剛好跳到前一段」需要看二進位，示範裡把每個格子負責的區間畫出來，跟著跳幾次就會有感覺。
        </p>
        <p>
          和<strong>線段樹</strong>比：樹狀陣列只能做「前綴」型的查詢（和、XOR、計數這類能相減的運算），區間最大值它做不到，因為最大值沒有反運算。但只要問題是前綴和，它更短、更快、更省記憶體。兩者的關係像是專用工具和通用工具。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>索引從 <strong>1</strong> 開始（0 的 lowbit 是 0，會無限迴圈）。開 <Code>tree = [0] * (n + 1)</Code>。</>,
            <><strong>update(i, delta)</strong>：<Code>while i ≤ n: tree[i] += delta; i += i &amp; −i</Code>。</>,
            <><strong>prefix(i)</strong>：<Code>s = 0; while i &gt; 0: s += tree[i]; i −= i &amp; −i</Code>。</>,
            <>區間和 [l, r] = <Code>prefix(r) − prefix(l − 1)</Code>。</>,
            <>值域很大時先<strong>離散化</strong>（把值對應到 1..m 的排名），再以排名為索引。逆序對、動態排名都是這樣做。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>上方的橫條是每個 tree[i] 負責的區間。算 prefix(6) 時看 i 怎麼從 6 跳到 4 再跳到 0；update(3) 時看 i 怎麼從 3 跳到 4 再跳到 8。每一步都顯示二進位與 lowbit。</p>
        <FenwickDemo />
      </Section>

      <Section id="code">
        <p>完整實作只有兩個迴圈，加上 O(n) 建樹與逆序對的經典應用。注意離散化那一步。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 307", name: "Range Sum Query - Mutable（用樹狀陣列再做一次）", diff: "Medium" },
            { src: "LeetCode 315", name: "Count of Smaller Numbers After Self", diff: "Hard" },
            { src: "LeetCode 493", name: "Reverse Pairs", diff: "Hard" },
            { src: "LeetCode 1409", name: "Queries on a Permutation With Key", diff: "Medium" },
            { src: "LeetCode 2179", name: "Count Good Triplets in an Array", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const fenwickLesson: Lesson = { prereq: "Prefix Sum、Bitwise Basics、Segment Tree", Body };
