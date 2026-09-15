import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { TreeDpDemo } from "@/components/lesson/demos/TreeDpDemo";
import type { Lesson } from "@/lib/lessons";

const python = `from collections import defaultdict


class Node:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right


def diameter(root):
    """二元樹直徑（邊數）：回傳往下最長鏈，順便用「左鏈 + 右鏈」更新答案"""
    best = 0

    def down(node):
        nonlocal best
        if node is None:
            return -1                          # 空樹算 −1，葉子的鏈長才會是 0
        dl, dr = down(node.left) + 1, down(node.right) + 1
        best = max(best, dl + dr)              # 在 node 轉彎的路徑：只拿來更新答案
        return max(dl, dr)                     # 交給父節點的只能是一條直鏈

    down(root)
    return best


def max_path_sum(root):
    """LeetCode 124：節點值可以是負的，對答案沒幫助的鏈乾脆不接"""
    best = float("-inf")

    def gain(node):
        nonlocal best
        if node is None:
            return 0
        gl, gr = max(gain(node.left), 0), max(gain(node.right), 0)
        best = max(best, node.val + gl + gr)
        return node.val + max(gl, gr)

    gain(root)
    return best


def max_independent_set(n, edges, weight):
    """一般樹的最大權獨立集：有邊相連的兩點不能同時選。用迭代順序避免遞迴太深"""
    adj = defaultdict(list)
    for u, v in edges:
        adj[u].append(v)
        adj[v].append(u)
    order, parent, seen, stack = [], [-1] * n, [False] * n, [0]
    seen[0] = True
    while stack:                               # 先排出「父節點一定在子節點前面」的順序
        u = stack.pop()
        order.append(u)
        for v in adj[u]:
            if not seen[v]:
                seen[v], parent[v] = True, u
                stack.append(v)
    take, skip = weight[:], [0] * n            # take[u]：選 u 時子樹的最大值；skip[u]：不選 u
    for u in reversed(order):                  # 反過來處理，子節點一定先算完
        p = parent[u]
        if p != -1:
            take[p] += skip[u]                 # 選了父節點，這個子節點不能選
            skip[p] += max(take[u], skip[u])   # 沒選父節點，子節點選不選都可以
    return max(take[0], skip[0])


if __name__ == "__main__":
    N = Node                                   # 和互動示範同一棵樹
    tree = N("A", N("B", N("D", N("F"), N("G", None, N("H"))), N("E", None, N("I", None, N("J")))), N("C"))
    print(diameter(tree))                      # 6（H-G-D-B-E-I-J，不經過根 A）
    print(max_path_sum(N(-10, N(9), N(20, N(15), N(7)))))   # 42（15 → 20 → 7）
    # 組織圖：0 是總經理。主管和直屬部屬不同時邀請，參加意願分數總和最大
    print(max_independent_set(7, [(0, 1), (0, 2), (1, 3), (1, 4), (2, 5), (2, 6)], [5, 3, 6, 4, 2, 3, 3]))   # 17`;

const cpp = `#include <algorithm>
#include <functional>
#include <iostream>
#include <utility>
#include <vector>

// 一般樹的直徑：每個節點合併「最長」與「次長」兩條往下的鏈
int treeDiameter(const std::vector<std::vector<int>>& adj) {
    int best = 0;
    std::function<int(int, int)> down = [&](int u, int parent) {
        int first = 0, second = 0;
        for (int v : adj[u]) {
            if (v == parent) continue;                  // 無向邊，不要走回父節點
            int d = down(v, u) + 1;
            if (d > first) { second = first; first = d; }
            else if (d > second) second = d;
        }
        best = std::max(best, first + second);          // 在 u 轉彎的最長路徑
        return first;                                   // 往上只交出一條鏈
    };
    down(0, -1);
    return best;
}

// 換根 DP（LeetCode 834）：每個節點到所有節點的距離總和，兩趟走訪 O(n)
std::vector<long long> sumOfDistances(int n, const std::vector<std::pair<int, int>>& edges) {
    std::vector<std::vector<int>> adj(n);
    for (auto [u, v] : edges) { adj[u].push_back(v); adj[v].push_back(u); }
    std::vector<int> order, parent(n, -1), size(n, 1), depth(n, 0), stack = {0};
    std::vector<bool> seen(n, false);
    seen[0] = true;
    while (!stack.empty()) {                            // 父節點排在子節點前面的順序
        int u = stack.back(); stack.pop_back();
        order.push_back(u);
        for (int v : adj[u])
            if (!seen[v]) { seen[v] = true; parent[v] = u; depth[v] = depth[u] + 1; stack.push_back(v); }
    }
    std::vector<long long> ans(n, 0);
    for (int i = n - 1; i > 0; i--) size[parent[order[i]]] += size[order[i]];   // 第一趟：由下往上算子樹大小
    for (int u = 0; u < n; u++) ans[0] += depth[u];     // 以 0 為根的距離總和
    for (int i = 1; i < n; i++) {                       // 第二趟：由上往下換根
        int u = order[i];                               // 根從父節點移到 u：u 子樹裡的點近 1，其餘遠 1
        ans[u] = ans[parent[u]] - size[u] + (n - size[u]);
    }
    return ans;
}

int main() {
    std::vector<std::pair<int, int>> edges = {{0, 1}, {0, 2}, {2, 3}, {2, 4}, {2, 5}};
    std::vector<std::vector<int>> adj(6);
    for (auto [u, v] : edges) { adj[u].push_back(v); adj[v].push_back(u); }
    std::cout << treeDiameter(adj) << '\\n';            // 3（例如 1-0-2-3）
    for (long long s : sumOfDistances(6, edges)) std::cout << s << ' ';
    std::cout << '\\n';                                 // 8 12 6 10 10 10
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "公司尾牙的邀請名單",
              problem: "公司有 300 人，組織圖是一棵樹。人資替每個人估了一個「參加意願分數」，但為了讓大家放鬆，主管和他的直屬部屬不同時邀請。要讓受邀者的分數總和最大。",
              why: "每個人只有「邀」或「不邀」兩種決定，而限制只發生在主管與直屬部屬之間。所以每個節點記兩個值：邀他時整個子樹最多幾分（部屬全部不邀），不邀他時最多幾分（每個部屬各自挑邀或不邀較大的）。從基層往上算一遍，300 人各處理一次就有答案，而不是試 2³⁰⁰ 種名單。",
            },
            {
              title: "樹狀配送路網的最長配送時間",
              problem: "偏鄉的物流路網是一棵樹：一個轉運站連出幾條路，每條路再分岔，沒有環。公司想知道任兩個站點之間最遠要走幾段路，用來估計最壞情況的配送時間。",
              why: "最遠的兩點之間的路徑有一個「最高點」，在那裡由兩條往下的鏈拼成。對每個站點算出往下的最長鏈，並試著把最長與次長兩條鏈接起來更新答案，後序走訪一次就找到整個路網的直徑，不必對每一對站點各跑一次 BFS。",
            },
            {
              title: "服務中心蓋在哪個站點最省",
              problem: "同一個樹狀路網有 10 萬個站點，要挑一個蓋維修中心，讓它到所有站點的距離總和最小。每個站點各算一次距離總和是 O(n²)，要做一百億次。",
              why: "先以任一點為根，一趟算出每棵子樹的大小和根的距離總和；再一趟由上往下「換根」：根從 p 移到子節點 u 時，u 子樹裡的 size[u] 個站點各近 1、其他 n − size[u] 個各遠 1，所以 ans[u] = ans[p] − size[u] + (n − size[u])。兩趟 O(n) 就得到每個站點的答案。",
            },
          ]}
          cue="樹、子樹、由子節點的答案組合出父節點的答案、後序走訪、選或不選（相鄰不能同時選）、樹的直徑、經過某個節點的最長路徑、每個節點當根的答案（換根）。"
        />
      </Section>

      <Section id="concept">
        <p>
          樹沒有環，把某個節點當成根之後，每個節點底下的<strong>子樹彼此獨立</strong>，這正是 DP 需要的重疊子問題與最佳子結構。<strong>樹上 DP</strong> 替每個節點 u 定義 <Code>dp[u]</Code>，代表「只看 u 的子樹」時的答案，並且只用子節點的 dp 值算出來。計算順序因此必須是<strong>後序</strong>：先把所有子節點算完，再處理自己，這和 Traversal 那篇的後序走訪完全一樣，只是回傳值換成問題要的量。
        </p>
        <p>
          以<strong>樹的直徑</strong>為例，要分清兩個量。<Code>down[u]</Code> 是從 u 往下的最長鏈，會回傳給父節點，因為父節點只能把一條直鏈接上去；<Code>through[u] = 左鏈 + 右鏈</Code> 是「在 u 轉彎」的最長路徑，只拿來更新全域答案，<strong>不回傳</strong>。正確性來自一個觀察：樹上任何一條路徑都有唯一的最高節點，路徑在那裡由兩條往下的鏈組成，所以對每個節點都算一次 through，取最大值就不會漏掉任何路徑。直徑不一定經過根，這就是為什麼每個節點都要嘗試更新答案。
        </p>
        <p>
          當每個節點有「選或不選」這類決策時，每個節點存<strong>多個狀態</strong>。最大權獨立集記 <Code>take[u]</Code> 和 <Code>skip[u]</Code>：選 u 時子節點都不能選，<Code>take[u] = w[u] + Σ skip[v]</Code>；不選 u 時子節點自由，<Code>skip[u] = Σ max(take[v], skip[v])</Code>。每條邊只在它的子節點算完時被用到一次，總時間 <strong>O(n)</strong>；空間除了 dp 陣列，遞迴深度是樹高 <strong>O(h)</strong>，退化成一條鏈時就是 O(n)。要「每個節點當根」的答案時，用<strong>換根</strong>：第一趟由下往上算出以某個根的結果，第二趟由上往下，把父節點的答案用 O(1) 轉移給子節點，整體仍是 O(n)，而不是做 n 次 O(n)。
        </p>
        <p>
          常見的坑：把 through（轉彎的路徑）回傳給父節點，得到的「路徑」其實分岔了；節點值有負數時（Binary Tree Maximum Path Sum）要允許不接子樹的鏈，也就是和 0 取最大；一般樹用鄰接串列存時，遞迴要記住父節點，不然會沿著無向邊走回去；Python 對 10 萬個節點的鏈狀樹遞迴會超過預設上限 1000，改用迭代排出父在前的順序、再反向處理。和其他課程的關係：Binary Tree Basics 的「樹高」就是最簡單的樹上 DP；House Robber 那種一維的「相鄰不能同時選」搬到樹上，就是最大權獨立集；監視器覆蓋（Binary Tree Cameras）則需要三個狀態。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>選一個根，一般樹用 DFS 或 BFS 記下每個節點的 parent，並排出「父節點在子節點前面」的順序。</>,
            <>決定每個節點要<strong>回傳給父節點</strong>的量（例如往下最長鏈、選或不選的兩個值），以及它們如何由子節點的值算出。</>,
            <>後序處理：所有子節點算完才算自己；需要「在這個節點合併兩個子樹」的答案時，順便更新全域答案，但回傳的仍只是能往上接的部分。</>,
            <>答案在根，或是走訪過程中記下的全域最大值。</>,
            <>要每個節點當根的答案時，再做一趟由上往下的換根，用父節點的答案和子樹大小等資訊，O(1) 算出子節點的答案。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>一棵 10 個節點的二元樹，用後序走訪求直徑。每個節點算出兩個量：down 是往下最長的鏈，顯示在節點下方並回傳給父節點；through 是左鏈加右鏈，只用來更新全域答案。藍色是正在處理的節點，黃色是它的子節點，綠色是目前找到的直徑路徑，灰色是還沒走到的節點。答案先在 G、D 更新，最後在 B 更新成 6：H → G → D → B → E → I → J。處理到根 A 時經過它的路徑只有 5，這條直徑根本不經過根，所以每個節點都得嘗試更新答案。</p>
        <TreeDpDemo />
      </Section>

      <Section id="code">
        <p>Python 放二元樹直徑、允許負值的最大路徑和，以及用迭代順序處理一般樹的最大權獨立集（組織圖邀請名單的例子）。C++ 放一般樹的直徑（合併最長與次長兩條鏈），和兩趟走訪的換根 DP：每個節點到所有節點的距離總和。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 543", name: "Diameter of Binary Tree", diff: "Easy" },
            { src: "LeetCode 337", name: "House Robber III（選或不選兩個狀態）", diff: "Medium" },
            { src: "LeetCode 124", name: "Binary Tree Maximum Path Sum（負的鏈不接）", diff: "Hard" },
            { src: "LeetCode 968", name: "Binary Tree Cameras（每個節點三個狀態）", diff: "Hard" },
            { src: "LeetCode 2246", name: "Longest Path With Different Adjacent Characters（一般樹的直徑，取最長與次長）", diff: "Hard" },
            { src: "LeetCode 834", name: "Sum of Distances in Tree（換根 DP）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const treeDpLesson: Lesson = { prereq: "Traversal、DFS、Memoization & Tabulation", Body };
