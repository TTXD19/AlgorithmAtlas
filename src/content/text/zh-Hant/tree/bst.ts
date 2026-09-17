import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Binary Tree Basics、Traversal、Binary Search",
  applications: [
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
  ],
  cue: "有序集合、範圍查詢、前驅／後繼、第 k 小、既要插入又要查詢、中序有序。",
  steps: [
    "**搜尋 / 插入**：從根開始，目標小於節點往左、大於往右。搜尋碰到相等就回傳，碰到空就是不存在；插入碰到空就放在那裡。",
    "**刪除**：先找到節點。0 或 1 個子節點，用那個子節點（或空）取代自己。",
    "2 個子節點：往右子樹一路往左找到後繼，把後繼的值複製到自己，然後遞迴去右子樹刪除後繼（它最多只有一個右子節點，落入前一種情況）。",
    "**驗證**：帶著 (lo, hi) 範圍往下遞迴，往左時把 hi 換成自己，往右時把 lo 換成自己。每個節點必須嚴格落在範圍內。",
    "**範圍查詢 / 第 k 小**：用中序走訪，加上「值已經比 lo 小就不往左、比 hi 大就不往右」的剪枝，或計數到 k 就停。",
  ],
  demoNote: "依序插入七個值建樹，接著搜尋一個存在與一個不存在的值，再插入 45，最後刪除有兩個子節點的 30，看後繼 40 怎麼補上來。",
  codeNote: "搜尋、插入、刪除三個基本操作，加上最常考的驗證與範圍查詢。刪除的遞迴寫法「回傳這棵子樹的新根」，讓父節點不用特別處理。",
  problems: [
    { src: "LeetCode 700", name: "Search in a Binary Search Tree", diff: "Easy" },
    { src: "LeetCode 701", name: "Insert into a Binary Search Tree", diff: "Medium" },
    { src: "LeetCode 450", name: "Delete Node in a BST", diff: "Medium" },
    { src: "LeetCode 98", name: "Validate Binary Search Tree", diff: "Medium" },
    { src: "LeetCode 230", name: "Kth Smallest Element in a BST", diff: "Medium" },
    { src: "LeetCode 235", name: "Lowest Common Ancestor of a BST", diff: "Medium" },
    { src: "LeetCode 108", name: "Convert Sorted Array to BST（建一棵平衡的）", diff: "Easy" },
  ],
};
