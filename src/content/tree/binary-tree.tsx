import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { TreeBasicsDemo } from "@/components/lesson/demos/TreeBasicsDemo";
import type { Lesson } from "@/lib/lessons";

const python = `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right


def height(node):
    """高度：從這個節點往下最長的邊數。空樹是 -1，葉是 0。"""
    if node is None:
        return -1
    return 1 + max(height(node.left), height(node.right))


def size(node):
    """子樹大小：包含自己的節點數"""
    if node is None:
        return 0
    return 1 + size(node.left) + size(node.right)


def is_leaf(node):
    return node.left is None and node.right is None


def from_level_order(values):
    """從層序陣列建樹（None 代表空位），LeetCode 的輸入格式"""
    if not values:
        return None
    nodes = [TreeNode(v) if v is not None else None for v in values]
    for i, node in enumerate(nodes):
        if node is None:
            continue
        l, r = 2 * i + 1, 2 * i + 2      # 完全二元樹的索引關係
        if l < len(nodes):
            node.left = nodes[l]
        if r < len(nodes):
            node.right = nodes[r]
    return nodes[0]


root = from_level_order([1, 2, 3, 4, 5, 6, 7])
print(height(root), size(root))   # 2 7`;

const cpp = `#include <algorithm>
#include <vector>

struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};

// 高度：空樹 -1，葉 0
int height(TreeNode* n) {
    if (!n) return -1;
    return 1 + std::max(height(n->left), height(n->right));
}

int size(TreeNode* n) {
    if (!n) return 0;
    return 1 + size(n->left) + size(n->right);
}

bool isLeaf(TreeNode* n) { return n && !n->left && !n->right; }

// 從層序陣列建樹，-1 代表空位
TreeNode* fromLevelOrder(const std::vector<int>& vals) {
    if (vals.empty()) return nullptr;
    std::vector<TreeNode*> nodes;
    for (int v : vals) nodes.push_back(v == -1 ? nullptr : new TreeNode(v));
    for (size_t i = 0; i < nodes.size(); i++) {
        if (!nodes[i]) continue;
        size_t l = 2 * i + 1, r = 2 * i + 2;
        if (l < nodes.size()) nodes[i]->left = nodes[l];
        if (r < nodes.size()) nodes[i]->right = nodes[r];
    }
    return nodes[0];
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "資料夾、DOM、JSON 都是樹",
              problem: "資料夾裡有資料夾，HTML 標籤裡有標籤，JSON 物件裡有物件。這些東西沒有固定深度，也不能用陣列的索引描述「誰在誰底下」。",
              why: "樹是表達「階層」最自然的結構。先在最簡單的二元樹上把深度、高度、葉節點、子樹這些詞學會，之後所有樹狀資料都用同一套語言描述。",
            },
            {
              title: "堆積為什麼可以用陣列存",
              problem: "上一個主題的堆積用陣列存，索引 i 的子節點在 2i+1 與 2i+2。這個關係從哪來？",
              why: "那是完全二元樹的性質：每層填滿才往下、同層由左往右，層序編號就沒有空洞。理解這點，就知道為什麼一般的樹不能這樣存。",
            },
            {
              title: "面試的樹題全部從這裡開始",
              problem: "求樹高、數節點、判斷是不是平衡、找最深的葉：LeetCode 上幾十題都是同一個形狀。",
              why: "它們都是「對左右子樹遞迴，再用兩個結果組合出自己的答案」。這個模式在這篇先練熟，後面的走訪、BST、樹上 DP 都是它的延伸。",
            },
          ]}
          cue="階層、巢狀、父與子、深度、高度、葉節點、左右子樹、完全二元樹。"
        />
      </Section>

      <Section id="concept">
        <p>
          樹是<strong>沒有環的連通圖</strong>，但更直覺的說法是：一個<strong>根</strong>節點，底下掛著零個或多個<strong>子樹</strong>，每棵子樹又是一棵樹。這個「自己包含自己」的定義，就是為什麼樹的演算法幾乎都用遞迴寫。二元樹是每個節點最多兩個子節點的樹，分成<strong>左子樹</strong>與<strong>右子樹</strong>，左右有別。
        </p>
        <p>
          幾個一定要分清楚的詞。<strong>深度</strong>是從根往下到這個節點的邊數，根的深度是 0。<strong>高度</strong>是從這個節點往下到最遠葉節點的邊數，葉的高度是 0；樹的高度就是根的高度。<strong>葉節點</strong>沒有子節點；<strong>內部節點</strong>至少有一個。深度由上往下數，高度由下往上數，兩者方向相反。
        </p>
        <p>
          <strong>完全二元樹</strong>是每一層都填滿、只有最後一層可以不滿而且靠左的樹。它有一個很好的性質：用層序把節點編號 0, 1, 2, …，索引 i 的父節點在 <Code>(i − 1) / 2</Code>，子節點在 <Code>2i + 1</Code> 與 <Code>2i + 2</Code>，不會有空洞。堆積就是靠這點用陣列存的。<strong>滿二元樹</strong>更嚴格：每個節點要嘛沒有子節點、要嘛剛好兩個。
        </p>
        <p>
          n 個節點的二元樹，高度最小是 ⌊log₂ n⌋（每層都塞滿），最大是 n − 1（退化成鏈）。之後很多結構的複雜度寫成 O(h)，h 是高度；能不能保持 h ≈ log n，就是「平衡」那一篇的主題。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>對樹的問題，先問：<strong>空樹的答案是什麼</strong>？高度是 −1、大小是 0、總和是 0。這是遞迴的 base case。</>,
            <>假設左子樹和右子樹的答案已經算好（分別叫 L 和 R），<strong>自己的答案怎麼由 L、R 和自己的值組合出來</strong>？高度是 1 + max(L, R)，大小是 1 + L + R。</>,
            <>寫成函式：先處理空樹，再遞迴左右，最後組合。這三行就是絕大多數樹題的骨架。</>,
            <>估複雜度：每個節點恰好被拜訪一次，O(n) 時間；遞迴深度等於樹高，O(h) 空間。</>,
            <>要建測試用的樹時，用層序陣列配合 <Code>2i + 1</Code>、<Code>2i + 2</Code> 建，這也是 LeetCode 的輸入格式。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>點任一個節點，右邊顯示它的深度、高度、子樹大小，下方的陣列會標出它在層序表示裡的位置，以及父與子的索引怎麼算。</p>
        <TreeBasicsDemo />
      </Section>

      <Section id="code">
        <p>節點的定義、三個最基本的遞迴函式，以及從層序陣列建樹的方法。注意高度的 base case 是 −1，這樣葉的高度才會是 0。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 104", name: "Maximum Depth of Binary Tree", diff: "Easy" },
            { src: "LeetCode 222", name: "Count Complete Tree Nodes（利用完全二元樹性質做到 O(log² n)）", diff: "Easy" },
            { src: "LeetCode 110", name: "Balanced Binary Tree", diff: "Easy" },
            { src: "LeetCode 543", name: "Diameter of Binary Tree", diff: "Easy" },
            { src: "LeetCode 226", name: "Invert Binary Tree", diff: "Easy" },
            { src: "LeetCode 100", name: "Same Tree", diff: "Easy" },
          ]}
        />
      </Section>
    </>
  );
}

export const binaryTreeLesson: Lesson = { prereq: "Recursion", Body };
