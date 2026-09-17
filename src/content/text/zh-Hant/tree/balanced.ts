import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "BST",
  applications: [
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
  ],
  cue: "最壞情況也要 O(log n)、輸入可能已排序、有序 map、std::map、TreeMap、旋轉、AVL、紅黑樹、B-tree。",
  steps: [
    "正常做 BST 插入，遞迴回到每個祖先時**更新高度**，並計算左右高度差 b。",
    "b 在 [−1, 1] 內就沒事，回傳自己。",
    "b > 1（左邊重）：若新鍵落在左子的右邊（LR），先對左子**左旋**；然後對自己**右旋**，回傳新的根。",
    "b < −1（右邊重）：若新鍵落在右子的左邊（RL），先對右子**右旋**；然後對自己**左旋**。",
    "旋轉後記得更新受影響兩個節點的高度，先更新下面的、再更新上面的。實務上除非面試要求，否則用標準庫。",
  ],
  demoNote: "把 1 到 7 依序插入，這是 BST 最壞的輸入。左邊的普通 BST 長成一條鏈，右邊的 AVL 每次失衡就旋轉。節點下方的 b 是左右高度差。",
  codeNote: "只實作 AVL 插入，重點是兩個旋轉函式與四種情況的判斷。最後提醒實務上該用哪個標準庫容器。",
  problems: [
    { src: "LeetCode 110", name: "Balanced Binary Tree（判斷是否平衡）", diff: "Easy" },
    { src: "LeetCode 1382", name: "Balance a Binary Search Tree（中序取出再重建）", diff: "Medium" },
    { src: "LeetCode 108", name: "Convert Sorted Array to Binary Search Tree", diff: "Easy" },
    { src: "LeetCode 729", name: "My Calendar I（用有序 map 找前後區間）", diff: "Medium" },
    { src: "LeetCode 220", name: "Contains Duplicate III（有序集合的視窗查詢）", diff: "Hard" },
  ],
};
