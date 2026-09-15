import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { TraversalDemo } from "@/components/lesson/demos/TraversalDemo";
import type { Lesson } from "@/lib/lessons";

const python = `from collections import deque


# 三種深度優先走訪，只差「拜訪自己」放在哪一行
def preorder(node, out):
    if node is None:
        return
    out.append(node.val)          # 自己
    preorder(node.left, out)      # 左
    preorder(node.right, out)     # 右

def inorder(node, out):
    if node is None:
        return
    inorder(node.left, out)       # 左
    out.append(node.val)          # 自己
    inorder(node.right, out)      # 右

def postorder(node, out):
    if node is None:
        return
    postorder(node.left, out)     # 左
    postorder(node.right, out)    # 右
    out.append(node.val)          # 自己


# 層序：用佇列，一次處理一整層
def level_order(root):
    if root is None:
        return []
    out = []
    queue = deque([root])
    while queue:
        level = []
        for _ in range(len(queue)):   # 這一圈只處理目前這一層
            node = queue.popleft()
            level.append(node.val)
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        out.append(level)
    return out


# 中序的迭代版：用明確的堆疊取代遞迴
def inorder_iter(root):
    out, stack, node = [], [], root
    while node or stack:
        while node:                   # 一路往左，沿途推入
            stack.append(node)
            node = node.left
        node = stack.pop()            # 沒有左邊了，處理自己
        out.append(node.val)
        node = node.right             # 換右子樹`;

const cpp = `#include <vector>
#include <stack>
#include <queue>

struct TreeNode { int val; TreeNode *left, *right; };

void preorder(TreeNode* n, std::vector<int>& out) {
    if (!n) return;
    out.push_back(n->val);
    preorder(n->left, out);
    preorder(n->right, out);
}

void inorder(TreeNode* n, std::vector<int>& out) {
    if (!n) return;
    inorder(n->left, out);
    out.push_back(n->val);
    inorder(n->right, out);
}

void postorder(TreeNode* n, std::vector<int>& out) {
    if (!n) return;
    postorder(n->left, out);
    postorder(n->right, out);
    out.push_back(n->val);
}

std::vector<std::vector<int>> levelOrder(TreeNode* root) {
    std::vector<std::vector<int>> out;
    if (!root) return out;
    std::queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        int sz = q.size();
        std::vector<int> level;
        for (int i = 0; i < sz; i++) {
            TreeNode* n = q.front(); q.pop();
            level.push_back(n->val);
            if (n->left) q.push(n->left);
            if (n->right) q.push(n->right);
        }
        out.push_back(level);
    }
    return out;
}

std::vector<int> inorderIter(TreeNode* root) {
    std::vector<int> out;
    std::stack<TreeNode*> st;
    TreeNode* n = root;
    while (n || !st.empty()) {
        while (n) { st.push(n); n = n->left; }
        n = st.top(); st.pop();
        out.push_back(n->val);
        n = n->right;
    }
    return out;
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "計算資料夾大小要用後序",
              problem: "要知道一個資料夾多大，得先知道每個子資料夾多大。也就是「子節點先處理完，自己才能處理」。",
              why: "後序走訪正是這個順序。刪除整棵樹、算子樹總和、判斷子樹是否平衡，凡是「答案由子樹組合而來」的都是後序。",
            },
            {
              title: "序列化與複製一棵樹要用前序",
              problem: "把樹存成字串、傳到另一台機器、再還原成同樣的樹。或是複製一棵樹。",
              why: "前序先記錄自己再往下，讀回來時第一個值就是根，能一邊讀一邊建。配合空節點的標記，一個前序序列就能唯一還原整棵樹。",
            },
            {
              title: "BST 的中序就是排序結果",
              problem: "二元搜尋樹裡「左 < 自己 < 右」，要把所有值由小到大列出來。",
              why: "先左、再自己、後右，正好是由小到大。驗證一棵樹是不是 BST、找第 k 小、找兩個錯位的節點，都靠中序。",
            },
            {
              title: "一層一層印出組織圖要用層序",
              problem: "公司組織圖要按階層印：先所有副總、再所有經理。或者找離根最近的某個節點。",
              why: "層序用佇列而不是遞迴，同一層的節點一定在下一層之前被處理，它就是樹上的 BFS。",
            },
          ]}
          cue="先處理子節點還是自己、由小到大列出、按層印、序列化、樹上的 BFS 或 DFS。"
        />
      </Section>

      <Section id="concept">
        <p>
          走訪就是<strong>把每個節點恰好拜訪一次</strong>，差別只在順序。深度優先的三種走訪，遞迴骨架完全一樣：處理左子樹、處理右子樹、處理自己，差別是「處理自己」那一行放在<strong>前面</strong>（前序）、<strong>中間</strong>（中序）還是<strong>後面</strong>（後序）。名字裡的前中後，指的就是自己相對於左右子樹的位置。
        </p>
        <p>
          怎麼選：答案要<strong>從上往下傳</strong>（例如路徑、深度）用前序；要<strong>從下往上組合</strong>（例如高度、子樹和）用後序；要<strong>有序輸出</strong> BST 用中序。三種走訪都是 O(n) 時間、O(h) 空間，h 是樹高，那是遞迴呼叫堆疊的深度。
        </p>
        <p>
          <strong>層序</strong>不用遞迴，用<strong>佇列</strong>：取出一個節點，把它的子節點放到尾端。因為佇列先進先出，同一層的節點一定排在下一層前面。若要「一層一層分組」，每一圈先記下目前佇列長度，只處理那麼多個。這就是圖論裡 BFS 的樹版本，空間是最寬那一層的節點數。
        </p>
        <p>
          遞迴太深會爆堆疊時，改用<strong>明確的堆疊</strong>模擬。中序的迭代版最常考：一路往左把節點推入，走到底彈出處理，再轉向右子樹。理解它的關鍵是：堆疊裡放的是「左邊還沒處理完、自己也還沒處理」的節點。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>決定順序：答案往下傳用<strong>前序</strong>，答案往上組用<strong>後序</strong>，BST 要排序用<strong>中序</strong>，按層處理用<strong>層序</strong>。</>,
            <>遞迴版：<Code>if node is None: return</Code>，然後把「處理自己」放在遞迴左、遞迴右的前、中或後。</>,
            <>層序版：佇列放入根；迴圈取出一個、處理、把子節點放入尾端。要分層就在每圈開頭記下佇列長度。</>,
            <>需要迭代版時，用堆疊模擬：前序最簡單（先推右再推左）；中序用「一路往左」的寫法；後序可以做「自右左」的前序再反轉。</>,
            <>檢查複雜度：每個節點進出一次，O(n)；額外空間是樹高（DFS）或最寬一層（BFS）。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>切換四種走訪，逐步看拜訪順序。深度優先的三種顯示呼叫堆疊，層序顯示佇列。這棵樹的中序剛好是 1 到 7，因為它是一棵 BST。</p>
        <TraversalDemo />
      </Section>

      <Section id="code">
        <p>前中後序三個函式並排看，只有一行位置不同。層序用佇列並分層輸出，最後是中序的迭代版。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 94", name: "Binary Tree Inorder Traversal（遞迴與迭代各寫一次）", diff: "Easy" },
            { src: "LeetCode 102", name: "Binary Tree Level Order Traversal", diff: "Medium" },
            { src: "LeetCode 199", name: "Binary Tree Right Side View（層序取每層最後一個）", diff: "Medium" },
            { src: "LeetCode 105", name: "Construct Binary Tree from Preorder and Inorder", diff: "Medium" },
            { src: "LeetCode 297", name: "Serialize and Deserialize Binary Tree", diff: "Hard" },
            { src: "LeetCode 236", name: "Lowest Common Ancestor（後序思維）", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const traversalLesson: Lesson = { prereq: "Binary Tree Basics、Queue、Stack", Body };
