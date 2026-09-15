import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { UnionFindDemo } from "@/components/lesson/demos/UnionFindDemo";
import type { Lesson } from "@/lib/lessons";

const python = `class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))     # 一開始每個人自己是根
        self.size = [1] * n              # 每棵樹的大小，合併時用
        self.count = n                   # 目前有幾群

    def find(self, x):
        """找根。路徑壓縮：回程時把沿路節點全部直接接到根"""
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, a, b):
        """合併兩群。回傳 False 表示本來就同群（這個訊號能偵測環）"""
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        if self.size[ra] < self.size[rb]:    # 按大小合併：小樹掛到大樹下
            ra, rb = rb, ra
        self.parent[rb] = ra
        self.size[ra] += self.size[rb]
        self.count -= 1
        return True

    def connected(self, a, b):
        return self.find(a) == self.find(b)


# 用法：算連通分量數（LeetCode 547 Number of Provinces 的核心）
uf = UnionFind(8)
for a, b in [(0, 1), (2, 3), (1, 3), (4, 5), (6, 7), (5, 7)]:
    uf.union(a, b)
print(uf.count)                 # 2 群：{0,1,2,3} 與 {4,5,6,7}
print(uf.connected(0, 4))       # False

# 無向圖偵測環：加一條邊時兩端已經同群，這條邊就成了環
def has_cycle(n, edges):
    uf = UnionFind(n)
    return any(not uf.union(a, b) for a, b in edges)`;

const cpp = `#include <vector>
#include <numeric>

class UnionFind {
    std::vector<int> parent, sz;
public:
    int count;
    UnionFind(int n) : parent(n), sz(n, 1), count(n) {
        std::iota(parent.begin(), parent.end(), 0);
    }
    int find(int x) {
        while (parent[x] != x) {
            parent[x] = parent[parent[x]];   // 路徑減半：一邊走一邊往上接
            x = parent[x];
        }
        return x;
    }
    bool unite(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;
        if (sz[ra] < sz[rb]) std::swap(ra, rb);
        parent[rb] = ra;
        sz[ra] += sz[rb];
        count--;
        return true;
    }
    bool connected(int a, int b) { return find(a) == find(b); }
};`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "網路還連通嗎",
              problem: "機房之間不斷加線、拉線，每次變動後都要回答「A 和 B 還連得到嗎」。每問一次就跑一次 BFS 太貴。",
              why: "併查集把「同一個連通分量」的節點放進同一群，加線就是合併兩群，查連通就是看兩點的群是否相同。兩個操作攤銷後幾乎是常數時間。",
            },
            {
              title: "相片裡的人臉分群",
              problem: "幾萬張人臉，兩張夠相似就連一條邊，最後要知道有幾個人、每張臉屬於誰。",
              why: "每條「相似」的邊做一次合併，最後每個根代表一個人。連通分量計數是併查集最直接的用途，Number of Provinces 就是這題。",
            },
            {
              title: "Kruskal 最小生成樹的核心",
              problem: "按權重由小到大加邊，但加進來的邊不能形成環。怎麼快速判斷「這條邊會不會成環」？",
              why: "兩端已經同群，這條邊就多餘。併查集的 union 回傳 false 就是這個訊號。少了它，Kruskal 每加一條邊都得重新走訪。",
            },
          ]}
          cue="在不在同一群、動態加邊、連通分量有幾個、加這條邊會不會成環、只合併不拆開。"
        />
      </Section>

      <Section id="concept">
        <p>
          併查集維護一堆<strong>互不相交的集合</strong>，只支援兩個操作：<strong>find(x)</strong> 回傳 x 所在集合的代表，<strong>union(a, b)</strong> 把兩個集合合併。它用一個 <Code>parent</Code> 陣列表示一片森林：每個集合是一棵樹，根就是代表，<Code>parent[根] = 根</Code>。find 就是沿著 parent 往上走到根；union 就是把一棵樹的根接到另一棵樹的根底下。
        </p>
        <p>
          樸素版的樹可能長成一條鏈，find 變成 O(n)。兩個優化把它壓到幾乎常數。<strong>路徑壓縮</strong>：find 的回程把沿路每個節點的 parent 直接改成根，下次再問就是一步。<strong>按大小（或按秩）合併</strong>：永遠把小樹掛到大樹底下，樹高最多 log n。兩者一起用，m 次操作總共 O(m · α(n))，α 是反阿克曼函數，在任何實際的 n 下都不超過 5，所以當成常數。
        </p>
        <p>
          它的限制也要記得：<strong>只能合併，不能拆開</strong>。需要刪邊的問題（例如「拿掉這條線之後還連通嗎」）通常反過來做：先把所有邊都不加，從最後一步倒著加回來。另外它只回答「連通與否」，不回答「怎麼走」，路徑要靠 BFS 或 DFS。
        </p>
        <p>
          一個常被忽略的功能：<strong>union 回傳 false 表示兩端早就同群</strong>，也就是這條邊形成了環。無向圖偵測環、Kruskal 挑邊、判斷一組邊是不是樹，都靠這個訊號。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>初始化 <Code>parent[i] = i</Code>、<Code>size[i] = 1</Code>、群數 <Code>count = n</Code>。</>,
            <><strong>find(x)</strong>：<Code>parent[x] ≠ x</Code> 就遞迴找 <Code>parent[x]</Code> 的根，並把 <Code>parent[x]</Code> 改成那個根（路徑壓縮）。</>,
            <><strong>union(a, b)</strong>：找兩邊的根。相同就回傳 false；不同就把 size 小的根接到大的底下，更新 size，<Code>count −= 1</Code>。</>,
            <><strong>connected(a, b)</strong> 就是 <Code>find(a) == find(b)</Code>；連通分量數就是 <Code>count</Code>。</>,
            <>節點不是整數時，先用雜湊表把它們對應到 0..n−1。需要「刪邊」時考慮離線倒著做。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>八個節點，依序執行一串 union 與 find。看 parent 陣列怎麼變、樹怎麼長，以及路徑壓縮發生時哪些節點被直接接到根。</p>
        <UnionFindDemo />
      </Section>

      <Section id="code">
        <p>含路徑壓縮與按大小合併的完整實作，附上連通分量計數與無向圖偵測環兩個最常見的用法。C++ 版用迭代的路徑減半，避免遞迴。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 547", name: "Number of Provinces", diff: "Medium" },
            { src: "LeetCode 684", name: "Redundant Connection（偵測環）", diff: "Medium" },
            { src: "LeetCode 200", name: "Number of Islands（用併查集再做一次）", diff: "Medium" },
            { src: "LeetCode 721", name: "Accounts Merge（節點是字串）", diff: "Medium" },
            { src: "LeetCode 1584", name: "Min Cost to Connect All Points（Kruskal 前置）", diff: "Medium" },
            { src: "LeetCode 1319", name: "Number of Operations to Make Network Connected", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const unionFindLesson: Lesson = { prereq: "Array、Recursion、Amortized Analysis", Body };
