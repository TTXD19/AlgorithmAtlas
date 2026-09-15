import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Applications } from "@/components/lesson/parts";
import { BSTDemo } from "@/components/lesson/demos/BSTDemo";
import type { Lesson } from "@/lib/lessons";

const python = `class Node:
    def __init__(self, key):
        self.key = key
        self.left = None
        self.right = None


def search(node, key):
    """每次比較砍掉一整棵子樹。O(h)"""
    while node and node.key != key:
        node = node.left if key < node.key else node.right
    return node


def insert(node, key):
    """遞迴版：回傳插入後這棵子樹的根"""
    if node is None:
        return Node(key)
    if key < node.key:
        node.left = insert(node.left, key)
    elif key > node.key:
        node.right = insert(node.right, key)
    return node                       # 相等就不重複插入


def delete(node, key):
    if node is None:
        return None
    if key < node.key:
        node.left = delete(node.left, key)
    elif key > node.key:
        node.right = delete(node.right, key)
    else:
        # 找到了，分三種情況
        if node.left is None:         # 0 或 1 個子節點：直接接上另一邊
            return node.right
        if node.right is None:
            return node.left
        succ = node.right             # 2 個子節點：找右子樹最小值（中序後繼）
        while succ.left:
            succ = succ.left
        node.key = succ.key           # 用後繼的值取代自己
        node.right = delete(node.right, succ.key)   # 再去右子樹刪掉後繼
    return node


def is_valid_bst(node, lo=float("-inf"), hi=float("inf")):
    """驗證：每個節點都要在祖先給的範圍內，只跟父節點比是不夠的"""
    if node is None:
        return True
    if not (lo < node.key < hi):
        return False
    return is_valid_bst(node.left, lo, node.key) and is_valid_bst(node.right, node.key, hi)


def range_query(node, lo, hi, out):
    """列出 [lo, hi] 內的所有鍵：中序走訪加剪枝"""
    if node is None:
        return
    if lo < node.key:
        range_query(node.left, lo, hi, out)
    if lo <= node.key <= hi:
        out.append(node.key)
    if node.key < hi:
        range_query(node.right, lo, hi, out)`;

const cpp = `#include <climits>
#include <vector>

struct Node {
    int key;
    Node *left = nullptr, *right = nullptr;
    Node(int k) : key(k) {}
};

Node* search(Node* n, int key) {
    while (n && n->key != key) n = key < n->key ? n->left : n->right;
    return n;
}

Node* insert(Node* n, int key) {
    if (!n) return new Node(key);
    if (key < n->key) n->left = insert(n->left, key);
    else if (key > n->key) n->right = insert(n->right, key);
    return n;
}

Node* remove(Node* n, int key) {
    if (!n) return nullptr;
    if (key < n->key) n->left = remove(n->left, key);
    else if (key > n->key) n->right = remove(n->right, key);
    else {
        if (!n->left) { Node* r = n->right; delete n; return r; }
        if (!n->right) { Node* l = n->left; delete n; return l; }
        Node* succ = n->right;
        while (succ->left) succ = succ->left;
        n->key = succ->key;
        n->right = remove(n->right, succ->key);
    }
    return n;
}

bool isValidBST(Node* n, long lo = LONG_MIN, long hi = LONG_MAX) {
    if (!n) return true;
    if (n->key <= lo || n->key >= hi) return false;
    return isValidBST(n->left, lo, n->key) && isValidBST(n->right, n->key, hi);
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "既要快速查找，又要保持有序",
              problem: "雜湊表查找 O(1)，但問「比 50 大的最小鍵是誰」「範圍在 30 到 70 之間的有哪些」它答不出來；有序陣列能答，但插入要搬移 O(n)。",
              why: "BST 兩者兼顧：查找、插入、刪除都是 O(h)，而且中序走訪就是有序序列，範圍查詢、前驅後繼都是自然的操作。Java 的 TreeMap、C++ 的 std::map、Redis 的 sorted set 都是這個家族。",
            },
            {
              title: "資料庫索引的原型",
              problem: "資料庫要在幾千萬筆資料裡找 WHERE age BETWEEN 30 AND 40，還要隨時能插入新資料。",
              why: "索引本質上是搜尋樹。實際用的 B-tree 是 BST 的多路版本，讓每個節點塞滿一個磁碟區塊，但「往左小、往右大、中序有序」的思路完全相同。",
            },
            {
              title: "為什麼「只跟父節點比」是錯的",
              problem: "驗證一棵樹是不是 BST，很多人只檢查每個節點比左子大、比右子小，結果被一個藏在深處的節點打臉。",
              why: "BST 的規則是整棵左子樹都小於自己，不只是左子節點。正確做法是把祖先給的上下界一路往下傳。這是理解 BST 定義最好的一道題。",
            },
          ]}
          cue="有序集合、範圍查詢、前驅／後繼、第 k 小、既要插入又要查詢、中序有序。"
        />
      </Section>

      <Section id="concept">
        <p>
          二元搜尋樹只加一條規則：對每個節點，<strong>整棵左子樹的值都比它小，整棵右子樹的值都比它大</strong>。注意是整棵子樹，不只是直接的子節點。這條規則讓每次比較都能<strong>丟掉一整棵子樹</strong>：目標比自己小就只看左邊，比自己大就只看右邊，和二分搜尋是同一個想法。
        </p>
        <p>
          <strong>搜尋</strong>從根開始往下比；<strong>插入</strong>就是搜尋到空位，把新節點掛在那裡，所以新節點一定是葉。<strong>刪除</strong>要分三種情況：沒有子節點直接拿掉；一個子節點就讓子節點頂上；兩個子節點時不能直接拿掉，找<strong>中序後繼</strong>（右子樹最左邊的節點，它一定沒有左子節點），把它的值複製過來，再去右子樹刪掉後繼。這樣左 &lt; 自己 &lt; 右依然成立。
        </p>
        <p>
          所有操作的成本都是<strong>樹高 h</strong>。隨機順序插入時 h 大約是 log n，但如果依序插入已排序的資料，樹會退化成一條鏈，h = n，BST 就變成鏈結串列。這就是下一篇平衡樹要解決的問題。
        </p>
        <p>
          <strong>中序走訪就是排序結果</strong>，這是 BST 最常被利用的性質。找第 k 小就是中序的第 k 個；驗證 BST 可以檢查中序是否嚴格遞增；範圍查詢就是中序加上「超出範圍就不往那邊走」的剪枝。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <><strong>搜尋 / 插入</strong>：從根開始，目標小於節點往左、大於往右。搜尋碰到相等就回傳，碰到空就是不存在；插入碰到空就放在那裡。</>,
            <><strong>刪除</strong>：先找到節點。0 或 1 個子節點，用那個子節點（或空）取代自己。</>,
            <>2 個子節點：往右子樹一路往左找到後繼，把後繼的值複製到自己，然後遞迴去右子樹刪除後繼（它最多只有一個右子節點，落入前一種情況）。</>,
            <><strong>驗證</strong>：帶著 (lo, hi) 範圍往下遞迴，往左時把 hi 換成自己，往右時把 lo 換成自己。每個節點必須嚴格落在範圍內。</>,
            <><strong>範圍查詢 / 第 k 小</strong>：用中序走訪，加上「值已經比 lo 小就不往左、比 hi 大就不往右」的剪枝，或計數到 k 就停。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>依序插入七個值建樹，接著搜尋一個存在與一個不存在的值，再插入 45，最後刪除有兩個子節點的 30，看後繼 40 怎麼補上來。</p>
        <BSTDemo />
      </Section>

      <Section id="code">
        <p>搜尋、插入、刪除三個基本操作，加上最常考的驗證與範圍查詢。刪除的遞迴寫法「回傳這棵子樹的新根」，讓父節點不用特別處理。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 700", name: "Search in a Binary Search Tree", diff: "Easy" },
            { src: "LeetCode 701", name: "Insert into a Binary Search Tree", diff: "Medium" },
            { src: "LeetCode 450", name: "Delete Node in a BST", diff: "Medium" },
            { src: "LeetCode 98", name: "Validate Binary Search Tree", diff: "Medium" },
            { src: "LeetCode 230", name: "Kth Smallest Element in a BST", diff: "Medium" },
            { src: "LeetCode 235", name: "Lowest Common Ancestor of a BST", diff: "Medium" },
            { src: "LeetCode 108", name: "Convert Sorted Array to BST（建一棵平衡的）", diff: "Easy" },
          ]}
        />
      </Section>
    </>
  );
}

export const bstLesson: Lesson = { prereq: "Binary Tree Basics、Traversal、Binary Search", Body };
