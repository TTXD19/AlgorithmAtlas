import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { SegmentTreeDemo } from "@/components/lesson/demos/SegmentTreeDemo";
import type { Lesson } from "@/lib/lessons";

const python = `class SegmentTree:
    """區間和，支援單點更新。tree[i] 的子節點是 2i 與 2i+1（1-indexed 的堆式存法）"""

    def __init__(self, a):
        self.n = len(a)
        self.tree = [0] * (4 * self.n)       # 4n 一定夠
        self._build(1, 0, self.n - 1, a)

    def _build(self, node, lo, hi, a):
        if lo == hi:
            self.tree[node] = a[lo]
            return
        mid = (lo + hi) // 2
        self._build(2 * node, lo, mid, a)
        self._build(2 * node + 1, mid + 1, hi, a)
        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]

    def query(self, ql, qh):
        return self._query(1, 0, self.n - 1, ql, qh)

    def _query(self, node, lo, hi, ql, qh):
        if qh < lo or hi < ql:                # 完全不相交
            return 0
        if ql <= lo and hi <= qh:             # 完全包含：直接用
            return self.tree[node]
        mid = (lo + hi) // 2                  # 部分重疊：分下去
        return (self._query(2 * node, lo, mid, ql, qh) +
                self._query(2 * node + 1, mid + 1, hi, ql, qh))

    def update(self, i, value):
        self._update(1, 0, self.n - 1, i, value)

    def _update(self, node, lo, hi, i, value):
        if lo == hi:
            self.tree[node] = value
            return
        mid = (lo + hi) // 2
        if i <= mid:
            self._update(2 * node, lo, mid, i, value)
        else:
            self._update(2 * node + 1, mid + 1, hi, i, value)
        self.tree[node] = self.tree[2 * node] + self.tree[2 * node + 1]   # 回頭更新祖先


st = SegmentTree([5, 3, 8, 6, 2, 7, 4, 1])
print(st.query(2, 5))     # 8 + 6 + 2 + 7 = 23
st.update(3, 10)
print(st.query(2, 5))     # 27

# 換成區間最大值：把三處的「+」改成 max，不相交時回傳 -inf 即可`;

const cpp = `#include <vector>
#include <algorithm>

class SegmentTree {
    int n;
    std::vector<long long> tree;

    void build(int node, int lo, int hi, const std::vector<int>& a) {
        if (lo == hi) { tree[node] = a[lo]; return; }
        int mid = (lo + hi) / 2;
        build(2 * node, lo, mid, a);
        build(2 * node + 1, mid + 1, hi, a);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }
    long long query(int node, int lo, int hi, int ql, int qh) {
        if (qh < lo || hi < ql) return 0;                 // 不相交
        if (ql <= lo && hi <= qh) return tree[node];      // 完全包含
        int mid = (lo + hi) / 2;
        return query(2 * node, lo, mid, ql, qh) + query(2 * node + 1, mid + 1, hi, ql, qh);
    }
    void update(int node, int lo, int hi, int i, int value) {
        if (lo == hi) { tree[node] = value; return; }
        int mid = (lo + hi) / 2;
        if (i <= mid) update(2 * node, lo, mid, i, value);
        else update(2 * node + 1, mid + 1, hi, i, value);
        tree[node] = tree[2 * node] + tree[2 * node + 1];
    }
public:
    SegmentTree(const std::vector<int>& a) : n(a.size()), tree(4 * a.size()) { build(1, 0, n - 1, a); }
    long long query(int ql, int qh) { return query(1, 0, n - 1, ql, qh); }
    void update(int i, int value) { update(1, 0, n - 1, i, value); }
};`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "即時排行榜的區間統計",
              problem: "十萬個玩家的分數不斷變動，同時要一直回答「第 1000 到 2000 名的總分」「這個區段的最高分」。前綴和查得快但更新要 O(n)，直接算則查詢要 O(n)。",
              why: "線段樹把陣列切成一層層的區間，每個節點存那段的總和（或最大值）。查詢只要拼幾個現成的區間，更新只要沿一條路徑改，兩者都是 O(log n)。",
            },
            {
              title: "監控系統的時間窗查詢",
              problem: "每秒一個延遲數字，要問「任意時段的最大延遲」，資料還在持續進來。",
              why: "把「和」換成「最大值」就是同一棵樹，程式碼只改三個運算子。任何有結合律的運算（和、最大、最小、GCD）都能用線段樹做區間查詢。",
            },
            {
              title: "計算幾何與掃描線",
              problem: "很多矩形疊在一起要算聯集面積，或一堆線段問哪些互相相交。",
              why: "掃描線從左掃到右，用線段樹維護「目前被覆蓋的 y 區間」。這需要區間更新，會用到懶標記，是線段樹的進階用法。",
            },
          ]}
          cue="區間和／區間最大值、同時要查詢又要更新、O(n) 太慢、有結合律的運算、掃描線。"
        />
      </Section>

      <Section id="concept">
        <p>
          線段樹的每個節點負責一段<strong>連續的索引區間</strong>，並存那段的彙總值。根負責 [0, n−1]，切一半給兩個子節點，一直切到葉節點負責單一元素。這是一棵高度 log n 的樹，通常用陣列存，節點 i 的子節點是 2i 與 2i+1，開 4n 的空間一定夠。
        </p>
        <p>
          <strong>查詢 [l, r]</strong> 從根開始，每個節點看自己的區間和 [l, r] 的關係：<strong>完全不相交</strong>就回傳空值（和是 0，最大值是 −∞）；<strong>完全被包含</strong>就直接回傳自己存的值，整棵子樹都不用進去；<strong>部分重疊</strong>才分給兩個子節點。任何一層最多只有兩個節點是「部分重疊」，所以總共碰 O(log n) 個節點。
        </p>
        <p>
          <strong>單點更新</strong>更簡單：從根走到那個葉，改掉葉的值，回頭把路徑上每個祖先重新用子節點算一次。一條路徑，O(log n)。<strong>建樹</strong>是後序走訪一次，O(n)。
        </p>
        <p>
          運算只要有<strong>結合律</strong>就能換：和、最大、最小、GCD、XOR，甚至矩陣乘法。需要<strong>區間更新</strong>（把 [l, r] 全部加 v）時，用<strong>懶標記</strong>：先在剛好覆蓋的節點記下「底下都要加 v」，真的往下走時才推下去。這是線段樹最常見的進階版本，也是它和下一篇樹狀陣列分工的地方：樹狀陣列更輕、更快寫，但只擅長前綴和與單點更新。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>決定每個節點存什麼（和、最大值……）與「空區間」的值（0、−∞……）。開 <Code>tree = [0] * (4n)</Code>。</>,
            <><strong>build(node, lo, hi)</strong>：lo == hi 就填入 a[lo]；否則切半遞迴，最後 <Code>tree[node] = 合併(左, 右)</Code>。</>,
            <><strong>query(node, lo, hi, ql, qh)</strong>：不相交回傳空值；完全包含回傳 <Code>tree[node]</Code>；否則合併左右子節點的查詢結果。</>,
            <><strong>update(node, lo, hi, i, v)</strong>：走到葉改值，回頭沿路重算祖先。</>,
            <>要區間更新就加懶標記：每個節點多一個 <Code>lazy</Code>，進入子節點前先把標記推下去。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>八個元素的區間和。查 [2, 5] 時注意哪些節點被直接採用（綠）、哪些被跳過（灰）、哪些要往下分。接著把索引 3 加 4，看一條路徑上的祖先怎麼被更新。</p>
        <SegmentTreeDemo />
      </Section>

      <Section id="code">
        <p>區間和加單點更新的完整實作，用 1-indexed 的堆式陣列存節點。最後一行提醒換成最大值只要改三個地方。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 307", name: "Range Sum Query - Mutable", diff: "Medium" },
            { src: "LeetCode 315", name: "Count of Smaller Numbers After Self", diff: "Hard" },
            { src: "LeetCode 2407", name: "Longest Increasing Subsequence II（區間最大值）", diff: "Hard" },
            { src: "LeetCode 218", name: "The Skyline Problem（掃描線思維）", diff: "Hard" },
            { src: "LeetCode 850", name: "Rectangle Area II（掃描線 + 區間覆蓋）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const segmentLesson: Lesson = { prereq: "Recursion、Prefix Sum、Binary Tree Basics", Body };
