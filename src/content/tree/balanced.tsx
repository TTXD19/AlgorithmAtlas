import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { BalancedDemo } from "@/components/lesson/demos/BalancedDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# AVL 樹：每個節點的左右子樹高度差不超過 1。這裡只實作插入，看懂旋轉即可。
class Node:
    def __init__(self, key):
        self.key = key
        self.left = self.right = None
        self.height = 1                      # 葉的高度記為 1，方便算


def h(n):
    return n.height if n else 0

def update(n):
    n.height = 1 + max(h(n.left), h(n.right))

def balance(n):
    return h(n.left) - h(n.right)            # 正的表示左邊重


def rotate_right(y):
    #      y                x
    #     / \\              / \\
    #    x   C    -->     A   y
    #   / \\                  / \\
    #  A   B                B   C
    x = y.left
    y.left = x.right
    x.right = y
    update(y); update(x)                     # 先更新下面的 y，再更新上面的 x
    return x

def rotate_left(x):
    y = x.right
    x.right = y.left
    y.left = x
    update(x); update(y)
    return y


def insert(n, key):
    if n is None:
        return Node(key)
    if key < n.key:
        n.left = insert(n.left, key)
    else:
        n.right = insert(n.right, key)
    update(n)
    b = balance(n)
    if b > 1:                                # 左邊太重
        if key > n.left.key:                 # 插在左子的右邊（LR）：先把左子左旋
            n.left = rotate_left(n.left)
        return rotate_right(n)               # 再右旋自己（LL）
    if b < -1:                               # 右邊太重
        if key < n.right.key:                # RL：先把右子右旋
            n.right = rotate_right(n.right)
        return rotate_left(n)                # RR
    return n


# 實務上用語言內建的平衡樹，不用自己寫：
# Python 沒有內建，常用 sortedcontainers.SortedList；
# Java 用 TreeMap / TreeSet；C++ 用 std::map / std::set（紅黑樹）。`;

const cpp = `#include <algorithm>
#include <map>
#include <set>

// AVL 插入
struct Node {
    int key, height = 1;
    Node *left = nullptr, *right = nullptr;
    Node(int k) : key(k) {}
};

int h(Node* n) { return n ? n->height : 0; }
void update(Node* n) { n->height = 1 + std::max(h(n->left), h(n->right)); }
int balance(Node* n) { return h(n->left) - h(n->right); }

Node* rotateRight(Node* y) {
    Node* x = y->left;
    y->left = x->right;
    x->right = y;
    update(y); update(x);
    return x;
}
Node* rotateLeft(Node* x) {
    Node* y = x->right;
    x->right = y->left;
    y->left = x;
    update(x); update(y);
    return y;
}

Node* insert(Node* n, int key) {
    if (!n) return new Node(key);
    if (key < n->key) n->left = insert(n->left, key);
    else n->right = insert(n->right, key);
    update(n);
    int b = balance(n);
    if (b > 1) {
        if (key > n->left->key) n->left = rotateLeft(n->left);   // LR
        return rotateRight(n);                                     // LL
    }
    if (b < -1) {
        if (key < n->right->key) n->right = rotateRight(n->right); // RL
        return rotateLeft(n);                                      // RR
    }
    return n;
}

// 實務上：std::map / std::set 底層是紅黑樹，插入、查找、刪除都保證 O(log n)
std::set<int> s;                 // s.insert(5); s.lower_bound(3); s.erase(5);
std::map<int, int> m;            // m[3] = 7; auto it = m.upper_bound(3);`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "依序插入排好序的資料",
              problem: "把使用者依註冊時間插入 BST，ID 又是遞增的。結果樹退化成一條鏈，每次查找 O(n)，跟沒建樹一樣。",
              why: "平衡樹在每次插入或刪除後檢查左右高度，失衡就用旋轉調整，保證高度始終是 O(log n)。輸入是什麼順序都不怕。",
            },
            {
              title: "std::map、TreeMap、Redis sorted set 的底層",
              problem: "這些「有序 map」要保證最壞情況也是 O(log n)，不能被特定輸入打成 O(n)。",
              why: "它們用的是紅黑樹，一種比 AVL 寬鬆一點、旋轉次數更少的平衡樹。你不用自己寫，但要知道它們為什麼能保證效能，以及什麼時候該選它們而不是雜湊表。",
            },
            {
              title: "資料庫索引：B-tree",
              problem: "索引存在磁碟上，每讀一個節點就是一次磁碟 I/O，二元樹的 log₂ n 層太多了。",
              why: "B-tree 是平衡樹的多路版本：一個節點放幾百個鍵，樹高只有 3 到 4 層。平衡的想法相同，只是把「二元」換成「多元」來配合磁碟區塊。",
            },
          ]}
          cue="最壞情況也要 O(log n)、輸入可能已排序、有序 map、std::map、TreeMap、旋轉、AVL、紅黑樹、B-tree。"
        />
      </Section>

      <Section id="concept">
        <p>
          BST 的所有操作都是 O(h)，問題是 h 可能是 n。<strong>平衡樹</strong>就是在每次修改後多做一點工作，讓 h 維持在 O(log n)。做法都一樣：定義一個「平衡條件」，修改後沿著路徑往上檢查，違反就用<strong>旋轉</strong>修復。旋轉是 O(1) 的指標調整，而且<strong>不破壞中序順序</strong>，所以 BST 的規則在旋轉後依然成立。
        </p>
        <p>
          <strong>AVL 樹</strong>的條件最直接：每個節點左右子樹的高度差不超過 1。插入後某個節點差變成 2，看新節點落在哪個方向，分四種情況：LL 右旋一次、RR 左旋一次、LR 先左旋子節點再右旋自己、RL 相反。AVL 的高度最多約 1.44 log n，查找最快，但插入刪除的旋轉比較頻繁。
        </p>
        <p>
          <strong>紅黑樹</strong>把條件放寬：節點塗紅或黑，規定根是黑的、紅節點的子節點必須是黑的、每條從根到葉的路徑黑節點數相同。這保證最長路徑不超過最短路徑的兩倍，高度最多約 2 log n。查找比 AVL 慢一點，但每次修改最多旋轉兩三次，所以標準庫幾乎都選它。<strong>B-tree</strong> 則是把每個節點放很多鍵，專為磁碟設計。
        </p>
        <p>
          這篇的目標不是背旋轉的四種情況，而是理解三件事：為什麼需要平衡、旋轉為什麼不會破壞 BST、以及實務上直接用 <Code>std::map</Code>、<Code>TreeMap</Code>、<Code>SortedList</Code> 就好。需要自己實作平衡樹的機會非常少。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>正常做 BST 插入，遞迴回到每個祖先時<strong>更新高度</strong>，並計算左右高度差 b。</>,
            <>b 在 [−1, 1] 內就沒事，回傳自己。</>,
            <>b &gt; 1（左邊重）：若新鍵落在左子的右邊（LR），先對左子<strong>左旋</strong>；然後對自己<strong>右旋</strong>，回傳新的根。</>,
            <>b &lt; −1（右邊重）：若新鍵落在右子的左邊（RL），先對右子<strong>右旋</strong>；然後對自己<strong>左旋</strong>。</>,
            <>旋轉後記得更新受影響兩個節點的高度，先更新下面的、再更新上面的。實務上除非面試要求，否則用標準庫。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>把 1 到 7 依序插入，這是 BST 最壞的輸入。左邊的普通 BST 長成一條鏈，右邊的 AVL 每次失衡就旋轉。節點下方的 b 是左右高度差。</p>
        <BalancedDemo />
      </Section>

      <Section id="code">
        <p>只實作 AVL 插入，重點是兩個旋轉函式與四種情況的判斷。最後提醒實務上該用哪個標準庫容器。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 110", name: "Balanced Binary Tree（判斷是否平衡）", diff: "Easy" },
            { src: "LeetCode 1382", name: "Balance a Binary Search Tree（中序取出再重建）", diff: "Medium" },
            { src: "LeetCode 108", name: "Convert Sorted Array to Binary Search Tree", diff: "Easy" },
            { src: "LeetCode 729", name: "My Calendar I（用有序 map 找前後區間）", diff: "Medium" },
            { src: "LeetCode 220", name: "Contains Duplicate III（有序集合的視窗查詢）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const balancedLesson: Lesson = { prereq: "BST", Body };
