import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Binary Tree Basics、Queue、Stack",
  applications: [
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
  ],
  cue: "先處理子節點還是自己、由小到大列出、按層印、序列化、樹上的 BFS 或 DFS。",
  steps: [
    "決定順序：答案往下傳用**前序**，答案往上組用**後序**，BST 要排序用**中序**，按層處理用**層序**。",
    "遞迴版：`if node is None: return`，然後把「處理自己」放在遞迴左、遞迴右的前、中或後。",
    "層序版：佇列放入根；迴圈取出一個、處理、把子節點放入尾端。要分層就在每圈開頭記下佇列長度。",
    "需要迭代版時，用堆疊模擬：前序最簡單（先推右再推左）；中序用「一路往左」的寫法；後序可以做「自右左」的前序再反轉。",
    "檢查複雜度：每個節點進出一次，O(n)；額外空間是樹高（DFS）或最寬一層（BFS）。",
  ],
  demoNote:
    "切換四種走訪，逐步看拜訪順序。深度優先的三種顯示呼叫堆疊，層序顯示佇列。這棵樹的中序剛好是 1 到 7，因為它是一棵 BST。",
  codeNote: "前中後序三個函式並排看，只有一行位置不同。層序用佇列並分層輸出，最後是中序的迭代版。",
  problems: [
    { src: "LeetCode 94", name: "Binary Tree Inorder Traversal（遞迴與迭代各寫一次）", diff: "Easy" },
    { src: "LeetCode 102", name: "Binary Tree Level Order Traversal", diff: "Medium" },
    { src: "LeetCode 199", name: "Binary Tree Right Side View（層序取每層最後一個）", diff: "Medium" },
    { src: "LeetCode 105", name: "Construct Binary Tree from Preorder and Inorder", diff: "Medium" },
    { src: "LeetCode 297", name: "Serialize and Deserialize Binary Tree", diff: "Hard" },
    { src: "LeetCode 236", name: "Lowest Common Ancestor（後序思維）", diff: "Medium" },
  ],
};
