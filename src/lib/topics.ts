export type GlyphId =
  | "foundations" | "arrays" | "linked-list" | "stack" | "heap" | "tree" | "graph-ds"
  | "sort" | "search" | "backtracking" | "divide" | "greedy" | "graph" | "dp" | "string" | "bits" | "math";
export type SubState = "ready" | "draft";
export type Level = 1 | 2 | 3;
export type TopicKind = "ds" | "algo";

/** 一個現實世界的應用情境：先講問題，再講為什麼這個主題能解。 */
export interface Application {
  title: string;
  desc: string;
  /** 對應到哪個細項（可選），用來從應用連回課程 */
  sub?: string;
}

export interface Subtopic {
  id: string;
  name: string;
  zh: string;
  desc?: string;
  /** 一句話說明現實中用在哪 */
  apply: string;
  time: string;
  space: string;
  lvl: Level;
  state: SubState;
}

export interface Topic {
  id: string;
  en: string;
  zh: string;
  glyph: GlyphId;
  /** 資料結構或演算法 */
  kind: TopicKind;
  desc: string;
  intro?: string;
  /** 為什麼要學這個主題：3～4 個現實應用 */
  applications: Application[];
  prereq?: string[];
  subs: Subtopic[];
}

export const TOPICS: Topic[] = [
  /* ======================= 第一部分：資料結構 ======================= */
  {
    id: "foundations",
    en: "Foundations",
    zh: "基礎",
    glyph: "foundations",
    kind: "ds",
    desc: "怎麼衡量一個演算法好不好。全站的共同語言。",
    intro: "在學任何資料結構或演算法之前，先建立三個工具：用 Big-O 描述成本、用遞迴思考問題、用攤銷分析解釋「平均起來很快」。之後每一篇的複雜度欄位都以這裡為基礎。",
    applications: [
      { title: "為什麼程式在測試機很快、上線就超時", desc: "資料量從 100 筆變成 100 萬筆，O(n²) 的程式慢一萬倍，O(n log n) 只慢兩萬倍左右。Big-O 讓你在寫程式前就預測這件事。", sub: "big-o" },
      { title: "為什麼動態陣列的 push 算 O(1)", desc: "陣列滿了要搬家，那一次是 O(n)，但平均下來每次 push 還是常數時間。攤銷分析解釋這種「偶爾很慢、整體很快」的結構。", sub: "amortized" },
      { title: "把問題交給「更小的自己」", desc: "資料夾裡有資料夾、運算式裡有運算式。遞迴讓你只描述一層的規則，其餘交給同一個函式處理，樹、DFS、分治、DP 都建立在這上面。", sub: "recursion" },
    ],
    subs: [
      { id: "big-o", name: "Big-O Notation", zh: "時間與空間複雜度", desc: "用輸入大小 n 描述成本的成長速度", apply: "估算程式能不能撐住資料量、面試必問", time: "—", space: "—", lvl: 1, state: "ready" },
      { id: "recursion", name: "Recursion", zh: "遞迴", desc: "函式呼叫自己，用呼叫堆疊記住回來的路", apply: "樹的走訪、DFS、分治、DP 的起點", time: "視遞迴樹", space: "O(深度)", lvl: 1, state: "ready" },
      { id: "amortized", name: "Amortized Analysis", zh: "攤銷分析", desc: "一連串操作的平均成本，而不是最壞單次", apply: "解釋動態陣列、雜湊表擴容、併查集為何夠快", time: "—", space: "—", lvl: 2, state: "ready" },
    ],
  },
  {
    id: "arrays",
    en: "Array & Hashing",
    zh: "陣列與雜湊",
    glyph: "arrays",
    kind: "ds",
    desc: "最基本的兩種容器：靠位置存取，或靠鍵存取。",
    intro: "陣列用連續記憶體換取 O(1) 的位置存取，雜湊表用雜湊函數換取 O(1) 的鍵值存取。這兩個結構是幾乎所有程式的地基，也是很多面試題的第一個工具。",
    applications: [
      { title: "資料庫的快取與 Session", desc: "使用者 ID 對應到登入狀態、URL 對應到快取內容，都是雜湊表。Redis 的核心就是一個大雜湊表。", sub: "hash-table" },
      { title: "「這個字母出現幾次」", desc: "統計字元頻率、判斷兩個字是不是同字母異序、找出重複的元素，雜湊表把每個查詢都變成 O(1)。", sub: "hash-map-apps" },
      { title: "報表的區間加總", desc: "問「第 1000 到 5000 天的營收總和」，先算一次前綴和，之後每個問題都只要一次減法。", sub: "prefix-sum" },
      { title: "影像與棋盤", desc: "圖片是二維陣列，旋轉 90 度、螺旋走訪、在棋盤上找連通格子，都是二維陣列操作。", sub: "matrix" },
    ],
    subs: [
      { id: "array", name: "Array & Dynamic Array", zh: "陣列與動態陣列", desc: "連續記憶體，存取 O(1)，中間插入要搬移", apply: "所有語言的 list / vector", time: "存取 O(1)、插入 O(n)", space: "O(n)", lvl: 1, state: "ready" },
      { id: "prefix-sum", name: "Prefix Sum", zh: "前綴和", desc: "預先累加，區間和變成一次減法", apply: "報表區間加總、子陣列和問題", time: "建 O(n)、查 O(1)", space: "O(n)", lvl: 1, state: "ready" },
      { id: "hash-table", name: "Hash Table", zh: "雜湊表", desc: "雜湊函數、碰撞處理、負載因子", apply: "快取、Session、資料庫索引、去重", time: "平均 O(1)", space: "O(n)", lvl: 1, state: "ready" },
      { id: "hash-map-apps", name: "Hash Set / Map Patterns", zh: "計數與去重", desc: "Two Sum、Group Anagrams 這類「用空間換時間」的模式", apply: "頻率統計、配對查找", time: "O(n)", space: "O(n)", lvl: 1, state: "ready" },
      { id: "matrix", name: "Matrix", zh: "二維陣列", desc: "旋轉、轉置、螺旋走訪、四方向移動", apply: "影像處理、棋盤遊戲、網格地圖", time: "O(mn)", space: "O(mn)", lvl: 1, state: "ready" },
    ],
  },
  {
    id: "linked-list",
    en: "Linked List",
    zh: "鏈結串列",
    glyph: "linked-list",
    kind: "ds",
    desc: "用指標把節點串起來。插入刪除 O(1)，但不能跳著存取。",
    intro: "鏈結串列放棄連續記憶體，換取在已知位置 O(1) 插入與刪除。它本身用得不算多，但指標操作的直覺、快慢指標技巧，以及作為 LRU 快取與樹的前身，讓它成為必經之路。",
    applications: [
      { title: "瀏覽器的上一頁／下一頁", desc: "每個頁面記住前一頁和後一頁，就是雙向鏈結串列。音樂播放清單、編輯器的 undo/redo 也是。", sub: "doubly" },
      { title: "LRU 快取", desc: "最近用過的移到最前面、太久沒用的從尾巴踢掉，配合雜湊表就能 O(1) 完成。作業系統的分頁置換、CDN 快取都用這個。", sub: "doubly" },
      { title: "判斷有沒有環", desc: "一快一慢兩個指標在跑道上跑，有環就一定會相遇。這個技巧不用額外記憶體，也能找出串列中點。", sub: "fast-slow" },
    ],
    subs: [
      { id: "singly", name: "Singly Linked List", zh: "單向鏈結串列", desc: "節點、指標、頭節點與哨兵節點", apply: "理解指標、實作佇列與堆疊", time: "插入 O(1)、查 O(n)", space: "O(n)", lvl: 1, state: "ready" },
      { id: "doubly", name: "Doubly Linked List", zh: "雙向鏈結串列", desc: "可以雙向走，O(1) 刪除任意已知節點", apply: "LRU 快取、瀏覽紀錄、undo/redo", time: "O(1) 刪除", space: "O(n)", lvl: 1, state: "ready" },
      { id: "reverse", name: "Reverse Linked List", zh: "反轉串列", desc: "迭代三指標與遞迴兩種寫法", apply: "指標操作的基本功、面試高頻", time: "O(n)", space: "O(1)", lvl: 1, state: "ready" },
      { id: "fast-slow", name: "Fast & Slow Pointers", zh: "快慢指標", desc: "找中點、環偵測（Floyd）、環的起點", apply: "偵測循環參照、找中點切半", time: "O(n)", space: "O(1)", lvl: 2, state: "ready" },
      { id: "merge-lists", name: "Merge Lists", zh: "合併串列", desc: "合併兩條有序串列，K 條時用堆積", apply: "合併排序的核心、合併多個有序資料流", time: "O(n+m)", space: "O(1)", lvl: 2, state: "ready" },
    ],
  },
  {
    id: "stack-queue",
    en: "Stack & Queue",
    zh: "堆疊與佇列",
    glyph: "stack",
    kind: "ds",
    desc: "後進先出與先進先出。順序本身就是資訊。",
    intro: "堆疊記住「最近發生的事」，佇列記住「最早發生的事」。它們簡單到用陣列就能做，卻決定了 DFS 與 BFS 的行為，單調堆疊與單調佇列更是把 O(n²) 壓成 O(n) 的利器。",
    applications: [
      { title: "編輯器的括號配對與 undo", desc: "遇到左括號就推入，遇到右括號就彈出比對。Ctrl+Z 也是把每個操作推進堆疊，undo 就彈出來。", sub: "stack" },
      { title: "印表機與訊息佇列", desc: "先送出的工作先印、先進來的訊息先處理。Kafka、RabbitMQ 這類系統的核心抽象就是佇列。", sub: "queue" },
      { title: "股價「下一次比今天高是哪天」", desc: "對每一天問「之後第一個更高的價格」，暴力是 O(n²)。單調堆疊只掃一遍，每個元素進出各一次。", sub: "monotonic-stack" },
      { title: "監控儀表板的視窗最大值", desc: "每秒問「過去 60 秒的最大延遲」。單調佇列讓視窗滑動時，取最大值仍是 O(1)。", sub: "monotonic-queue" },
    ],
    subs: [
      { id: "stack", name: "Stack", zh: "堆疊", desc: "push / pop / peek，呼叫堆疊與括號配對", apply: "undo、括號檢查、運算式求值、DFS", time: "O(1)", space: "O(n)", lvl: 1, state: "ready" },
      { id: "queue", name: "Queue & Deque", zh: "佇列與雙端佇列", desc: "環狀陣列實作、雙端佇列", apply: "工作排程、訊息佇列、BFS", time: "O(1)", space: "O(n)", lvl: 1, state: "ready" },
      { id: "monotonic-stack", name: "Monotonic Stack", zh: "單調堆疊", desc: "維持遞增或遞減，找下一個更大／更小元素", apply: "股價分析、直方圖最大矩形、每日溫度", time: "O(n)", space: "O(n)", lvl: 2, state: "ready" },
      { id: "monotonic-queue", name: "Monotonic Queue", zh: "單調佇列", desc: "滑動視窗中 O(1) 取最大值", apply: "即時監控的視窗極值、DP 優化", time: "O(n)", space: "O(k)", lvl: 3, state: "ready" },
    ],
  },
  {
    id: "heap",
    en: "Heap / Priority Queue",
    zh: "堆積",
    glyph: "heap",
    kind: "ds",
    desc: "隨時拿到最大或最小的那個，只要 O(log n)。",
    intro: "堆積是一棵用陣列存的完全二元樹，父節點永遠比子節點小（或大）。它不排序全部資料，只保證頂端是極值，所以插入與取出都是對數時間，是優先佇列的標準實作。",
    applications: [
      { title: "作業系統的工作排程", desc: "高優先度的程序先跑，新程序隨時加入。優先佇列讓「加入」和「取最高優先」都很快，Linux 的 CFS 用的是類似結構。", sub: "binary-heap" },
      { title: "熱門文章 Top 10", desc: "一千萬篇文章要取閱讀數前十，不用全部排序。維持一個大小為 10 的最小堆積，掃一遍就好。", sub: "top-k" },
      { title: "即時中位數", desc: "資料流不斷進來，隨時要報中位數。一個最大堆積管左半、一個最小堆積管右半，中位數永遠在兩個頂端。", sub: "two-heaps" },
    ],
    subs: [
      { id: "binary-heap", name: "Binary Heap", zh: "二元堆積", desc: "陣列表示、sift up / sift down、heapify", apply: "優先佇列、Dijkstra、事件模擬", time: "push/pop O(log n)", space: "O(n)", lvl: 2, state: "ready" },
      { id: "top-k", name: "Top-K Problems", zh: "前 K 大", desc: "維持大小為 K 的堆積，或用 Quick Select", apply: "排行榜、推薦系統取前 K 個候選", time: "O(n log k)", space: "O(k)", lvl: 2, state: "ready" },
      { id: "two-heaps", name: "Two Heaps", zh: "雙堆積", desc: "左最大堆、右最小堆，維持平衡", apply: "資料流中位數、滑動視窗中位數", time: "O(log n)", space: "O(n)", lvl: 3, state: "ready" },
    ],
  },
  {
    id: "tree",
    en: "Tree",
    zh: "樹",
    glyph: "tree",
    kind: "ds",
    desc: "沒有環的階層結構。遞迴在這裡最自然。",
    intro: "樹是「一個節點底下有更多節點」的結構，天生對應遞迴。從二元樹的走訪開始，二元搜尋樹把「有序」和「動態插入」結合，字典樹處理字串，線段樹與樹狀陣列則處理區間查詢。",
    applications: [
      { title: "檔案系統與網頁 DOM", desc: "資料夾裡有資料夾、HTML 標籤裡有標籤。計算資料夾大小、渲染網頁、序列化 JSON，都是樹的走訪。", sub: "traversal" },
      { title: "資料庫索引與有序集合", desc: "MySQL 的索引是 B-tree，Redis 的 sorted set、Java 的 TreeMap 是平衡搜尋樹。要「快速找到、還要保持有序」就靠 BST 家族。", sub: "bst" },
      { title: "搜尋列的自動補全", desc: "打「alg」就跳出「algorithm」，字典樹沿著字母一路走下去，每一層就是下一個字元。", sub: "trie" },
      { title: "即時排行與區間統計", desc: "十萬筆資料不斷更新，還要隨時問「第 1000 到 2000 筆的總和」。線段樹與樹狀陣列讓查詢與更新都是對數時間。", sub: "segment" },
    ],
    subs: [
      { id: "binary-tree", name: "Binary Tree Basics", zh: "二元樹基礎", desc: "高度、深度、完全二元樹、陣列表示", apply: "堆積、表達式樹、決策樹的共同基礎", time: "—", space: "O(n)", lvl: 1, state: "ready" },
      { id: "traversal", name: "Traversal", zh: "前中後序與層序走訪", desc: "遞迴與迭代兩種寫法，層序用佇列", apply: "算資料夾大小、序列化樹、運算式求值", time: "O(n)", space: "O(h)", lvl: 1, state: "ready" },
      { id: "bst", name: "BST", zh: "二元搜尋樹", desc: "插入、刪除、驗證、中序即有序", apply: "有序集合、範圍查詢、資料庫索引的原型", time: "O(h)", space: "O(h)", lvl: 2, state: "ready" },
      { id: "balanced", name: "Balanced BST", zh: "平衡樹概念", desc: "AVL 與紅黑樹為什麼能保證 O(log n)，講概念不實作", apply: "TreeMap、std::map、資料庫索引", time: "O(log n)", space: "O(n)", lvl: 3, state: "ready" },
      { id: "trie", name: "Trie", zh: "字典樹", desc: "每層一個字元，共用前綴", apply: "自動補全、拼字檢查、IP 路由表", time: "O(L)", space: "O(ΣL)", lvl: 2, state: "ready" },
      { id: "segment", name: "Segment Tree", zh: "線段樹", desc: "區間查詢與單點更新，懶標記做區間更新", apply: "區間和／區間最大值的動態查詢", time: "O(log n)", space: "O(n)", lvl: 3, state: "ready" },
      { id: "fenwick", name: "Fenwick Tree (BIT)", zh: "樹狀陣列", desc: "用位元技巧做前綴和的動態版本", apply: "線段樹的輕量替代、逆序對計數", time: "O(log n)", space: "O(n)", lvl: 3, state: "ready" },
    ],
  },
  {
    id: "graph-ds",
    en: "Graph Representation",
    zh: "圖的表示",
    glyph: "graph-ds",
    kind: "ds",
    desc: "怎麼在程式裡存一張圖，以及怎麼快速回答「連在一起嗎」。",
    intro: "圖由節點與邊組成，能描述任何「東西之間有關聯」的問題。這個主題只講怎麼存：鄰接串列與鄰接矩陣各適合什麼，以及併查集這個專門回答連通性的結構。演算法放在 Graph Algorithms。",
    applications: [
      { title: "社群網路的好友關係", desc: "十億個使用者、每人幾百個好友。鄰接矩陣要 10¹⁸ 格放不下，鄰接串列只存實際存在的邊。", sub: "adjacency" },
      { title: "網路是否還連通", desc: "機房之間不斷加線、斷線，隨時要問「A 和 B 還連得到嗎」。併查集把這個問題壓到幾乎常數時間。", sub: "union-find" },
      { title: "相片裡的人臉分群", desc: "兩張臉相似就連一條邊，最後每個連通分量就是同一個人。併查集是最簡單的分群工具。", sub: "union-find" },
    ],
    subs: [
      { id: "adjacency", name: "Adjacency List / Matrix", zh: "鄰接串列與矩陣", desc: "有向、無向、帶權，稀疏與稠密的取捨", apply: "所有圖論演算法的輸入格式", time: "O(V+E) / O(V²)", space: "O(V+E) / O(V²)", lvl: 1, state: "ready" },
      { id: "union-find", name: "Union-Find", zh: "併查集", desc: "路徑壓縮、按秩合併", apply: "連通判斷、分群、Kruskal 的核心", time: "O(α(n))", space: "O(n)", lvl: 2, state: "ready" },
    ],
  },

  /* ======================= 第二部分：演算法 ======================= */
  {
    id: "sorting",
    en: "Sorting",
    zh: "排序",
    glyph: "sort",
    kind: "algo",
    desc: "把資料排好順序。從 O(n²) 到 O(n log n)，比較的邊界在哪裡。",
    intro: "排序是最常被呼叫的演算法，也是理解分治、穩定性、下界證明的最佳教材。學完你會知道語言內建的 sort 為什麼那樣設計，以及什麼時候可以突破 n log n。",
    applications: [
      { title: "電商與排行榜", desc: "依價格、評分、銷量排列商品，或每分鐘更新的遊戲排行榜。資料一大，O(n²) 和 O(n log n) 的差距就是能不能即時回應。", sub: "quick" },
      { title: "資料庫的 ORDER BY 與外部排序", desc: "資料庫背後就是排序演算法；記憶體放不下時用的是合併排序的外部版本，一次只讀一塊進來。", sub: "merge" },
      { title: "排序是很多演算法的前置", desc: "二分搜尋、去除重複、合併時間區間、找中位數，都先假設資料有序。排好序，後面的問題會突然變簡單。", sub: "insertion" },
      { title: "整數資料的特殊情況", desc: "年齡、分數、郵遞區號這種範圍固定的整數，不用比較也能排，這就是計數排序與基數排序能突破 n log n 的原因。", sub: "counting" },
    ],
    subs: [
      { id: "bubble", name: "Bubble Sort", zh: "氣泡排序", desc: "相鄰交換，最直覺但最慢", apply: "教學用，理解「相鄰交換」與穩定性", time: "O(n²)", space: "O(1)", lvl: 1, state: "ready" },
      { id: "selection", name: "Selection Sort", zh: "選擇排序", desc: "每輪選最小的放到前面", apply: "交換次數最少，寫入昂貴的場合", time: "O(n²)", space: "O(1)", lvl: 1, state: "ready" },
      { id: "insertion", name: "Insertion Sort", zh: "插入排序", desc: "像整理撲克牌，近乎有序時 O(n)", apply: "小陣列或幾乎有序的資料，內建排序在小段落會切換用它", time: "O(n²)", space: "O(1)", lvl: 1, state: "ready" },
      { id: "merge", name: "Merge Sort", zh: "合併排序", desc: "切半、各自排、合併，穩定", apply: "外部排序大檔案、鏈結串列排序、逆序對", time: "O(n log n)", space: "O(n)", lvl: 2, state: "ready" },
      { id: "quick", name: "Quick Sort", zh: "快速排序", desc: "選 pivot 分兩邊，平均最快", apply: "大多數語言內建排序的基礎，Quick Select 找第 k 大", time: "平均 O(n log n)", space: "O(log n)", lvl: 2, state: "ready" },
      { id: "heap-sort", name: "Heap Sort", zh: "堆積排序", desc: "先 heapify 再逐個取出，原地", apply: "記憶體受限又要保證 n log n 的場合", time: "O(n log n)", space: "O(1)", lvl: 2, state: "ready" },
      { id: "counting", name: "Counting Sort", zh: "計數排序", desc: "數每個值出現幾次，不比較", apply: "範圍小的整數，例如成績、年齡分布", time: "O(n+k)", space: "O(n+k)", lvl: 2, state: "ready" },
      { id: "radix", name: "Radix / Bucket Sort", zh: "基數與桶排序", desc: "按位數或按區間分桶", apply: "固定長度的整數或字串，例如電話號碼", time: "O(d·n)", space: "O(n+k)", lvl: 2, state: "ready" },
      { id: "lower-bound", name: "Sorting Lower Bound", zh: "比較排序下界", desc: "用決策樹證明比較排序至少 Ω(n log n)", apply: "知道什麼時候不可能更快", time: "Ω(n log n)", space: "—", lvl: 3, state: "ready" },
    ],
  },
  {
    id: "searching",
    en: "Searching & Two Pointers",
    zh: "搜尋與雙指標",
    glyph: "search",
    kind: "algo",
    desc: "在資料裡找東西。有序的資料能讓每一步砍掉一半。",
    intro: "從最單純的線性搜尋，到利用有序性的二分搜尋，再到雙指標與滑動視窗這兩個把 O(n²) 壓成 O(n) 的陣列技巧。這些是面試與日常工程中出現頻率最高的一組工具。",
    applications: [
      { title: "git bisect 找出壞掉的 commit", desc: "一千個 commit 裡哪一個引入 bug？每次測中間那個，十次就找到。這就是二分搜尋，資料只要「有序」就能用。", sub: "binary" },
      { title: "「最少要多快才來得及」", desc: "Koko 吃香蕉、貨船最小載重：答案本身有單調性（越快一定越來得及），就能對答案二分，每次驗證一下可不可行。", sub: "binary-answer" },
      { title: "監控系統的「過去 5 分鐘平均」", desc: "資料一直進來，視窗一直往前滑。滑動視窗讓每筆資料只被加一次、減一次，不用每次重算整個區間。", sub: "sliding" },
      { title: "有序陣列裡找兩數之和", desc: "一左一右兩個指標往中間夾，比暴力的雙迴圈少一個 n。很多陣列題都是這個模式的變形。", sub: "two-pointers" },
    ],
    subs: [
      { id: "linear", name: "Linear Search", zh: "線性搜尋", desc: "一個一個看，無序資料唯一的選擇", apply: "小資料、無序資料、只找一次", time: "O(n)", space: "O(1)", lvl: 1, state: "ready" },
      { id: "binary", name: "Binary Search", zh: "二分搜尋", desc: "lower bound / upper bound 的邊界寫法", apply: "git bisect、字典查詢、版本相容性測試", time: "O(log n)", space: "O(1)", lvl: 1, state: "ready" },
      { id: "binary-answer", name: "Binary Search on Answer", zh: "二分答案", desc: "答案有單調性就能二分，配合可行性檢查", apply: "分配問題、最小化最大值", time: "O(n log R)", space: "O(1)", lvl: 3, state: "ready" },
      { id: "two-pointers", name: "Two Pointers", zh: "雙指標", desc: "對撞指標與同向指標", apply: "有序陣列配對、去重、回文判斷", time: "O(n)", space: "O(1)", lvl: 2, state: "ready" },
      { id: "sliding", name: "Sliding Window", zh: "滑動視窗", desc: "固定長度與可變長度兩種", apply: "串流統計、限流（rate limit）、最長不重複子字串", time: "O(n)", space: "O(k)", lvl: 2, state: "ready" },
    ],
  },
  {
    id: "backtracking",
    en: "Recursion & Backtracking",
    zh: "遞迴與回溯",
    glyph: "backtracking",
    kind: "algo",
    desc: "把所有可能都試一遍，但走不通就立刻回頭。",
    intro: "回溯是有紀律的窮舉：每一步做一個選擇、往下遞迴、回來時撤銷選擇。它是 DFS 在「決策樹」上的版本，解數獨、排列組合、N 皇后都靠它，剪枝則決定跑得快不快。",
    applications: [
      { title: "自動排課與座位安排", desc: "每門課選一個時段，衝突就換下一個，全部都不行就退回上一門課重選。這正是回溯，N 皇后是它的教科書版本。", sub: "n-queens" },
      { title: "密碼強度與組合列舉", desc: "列出所有可能的子集、排列、組合，例如測試所有功能開關的組合、產生所有可能的密碼變體。", sub: "subsets" },
      { title: "解數獨與填字遊戲", desc: "每格填一個數字，違反規則就回頭改。人腦解法和程式解法是同一個結構。", sub: "combinations" },
    ],
    subs: [
      { id: "subsets", name: "Subsets", zh: "子集", desc: "每個元素選或不選，2ⁿ 種", apply: "功能開關組合測試、冪集列舉", time: "O(2ⁿ·n)", space: "O(n)", lvl: 2, state: "ready" },
      { id: "permutations", name: "Permutations", zh: "排列", desc: "用 used 陣列或交換法", apply: "排程順序、路徑列舉", time: "O(n!·n)", space: "O(n)", lvl: 2, state: "ready" },
      { id: "combinations", name: "Combinations & Combination Sum", zh: "組合與剪枝", desc: "從 start 開始避免重複，排序後提前剪枝", apply: "湊金額、選隊員", time: "指數", space: "O(n)", lvl: 2, state: "ready" },
      { id: "n-queens", name: "N-Queens", zh: "N 皇后", desc: "逐列放置，用集合記錄被攻擊的欄與對角線", apply: "約束滿足問題的原型：排課、排班", time: "指數", space: "O(n)", lvl: 3, state: "ready" },
      { id: "word-search", name: "Word Search", zh: "網格回溯", desc: "在網格上 DFS 並回復標記", apply: "文字遊戲、迷宮路徑列舉", time: "O(m·n·4ᴸ)", space: "O(L)", lvl: 2, state: "ready" },
    ],
  },
  {
    id: "divide-conquer",
    en: "Divide & Conquer",
    zh: "分治",
    glyph: "divide",
    kind: "algo",
    desc: "切成小塊各自解決，再把答案合起來。",
    intro: "分治是 O(n log n) 的來源：把問題切半、遞迴解決、合併結果。合併排序與快速排序是它最有名的例子，這裡把它當成通用方法來學，並用 Master Theorem 算複雜度。",
    applications: [
      { title: "為什麼切一半就能變快", desc: "n 個東西兩兩比要 n² 次，但切成兩半各比再合併，只要 n log n。Master Theorem 讓你不用每次都手推遞迴式。", sub: "master" },
      { title: "加密與大數運算", desc: "RSA 要算 a 的幾百位次方再取模，快速冪把指數切半，幾百次乘法就完成，不然算到宇宙毀滅。", sub: "fast-pow" },
      { title: "統計「有多少對是反的」", desc: "評分系統要算兩份排名差多遠，本質是逆序對數量。在合併排序的合併步驟順便數，n log n 就好。", sub: "inversions" },
    ],
    subs: [
      { id: "master", name: "Master Theorem", zh: "遞迴式求解", desc: "T(n) = aT(n/b) + f(n) 的三種情況", apply: "快速判斷分治演算法的複雜度", time: "—", space: "—", lvl: 2, state: "ready" },
      { id: "max-subarray", name: "Maximum Subarray", zh: "最大子陣列", desc: "分治版與 Kadane 線性版的對照", apply: "股票最佳買賣區間、訊號分析", time: "O(n log n) / O(n)", space: "O(log n)", lvl: 2, state: "ready" },
      { id: "fast-pow", name: "Fast Exponentiation", zh: "快速冪", desc: "指數切半，遞迴或位元迭代", apply: "RSA、模運算、矩陣快速冪算費氏", time: "O(log n)", space: "O(1)", lvl: 2, state: "ready" },
      { id: "inversions", name: "Count Inversions", zh: "逆序對", desc: "在合併排序的合併步驟計數", apply: "排名相似度、資料「有多亂」的度量", time: "O(n log n)", space: "O(n)", lvl: 3, state: "ready" },
    ],
  },
  {
    id: "greedy",
    en: "Greedy",
    zh: "貪婪法",
    glyph: "greedy",
    kind: "algo",
    desc: "每一步都選當下最好的。什麼時候這樣做會是全域最佳？",
    intro: "貪婪法不回頭、不試錯，只做眼前最好的選擇，所以通常最快。代價是它不一定對：這個主題的重點不只是寫出貪婪解，而是學會用交換論證判斷什麼時候可以貪。",
    applications: [
      { title: "會議室與課表排程", desc: "一堆會議時段，最多能排幾場不衝突？每次選最早結束的那場，這個直覺選法可以被證明是最佳的。", sub: "interval" },
      { title: "zip 與 JPEG 裡的壓縮", desc: "常出現的字元給短編碼、少出現的給長編碼。霍夫曼編碼每次合併頻率最低的兩個，貪婪卻是最佳。", sub: "huffman" },
      { title: "找零與作業系統排程", desc: "收銀機從最大面額開始找，作業系統先跑最短的工作。這些策略有的一定對，有的在特定幣值下會錯，差別在哪是這個主題的重點。", sub: "coin" },
      { title: "能不能跳到終點", desc: "每格寫著最多能往前跳幾步。只要一直維持「目前最遠能到哪」，掃一遍就知道答案，不必試每條路。", sub: "jump" },
    ],
    subs: [
      { id: "principles", name: "Greedy Principles", zh: "貪婪正確性", desc: "貪婪選擇性質、交換論證", apply: "判斷一題能不能貪，不能就轉 DP", time: "—", space: "—", lvl: 2, state: "ready" },
      { id: "coin", name: "Coin Change (Greedy)", zh: "找零問題", desc: "標準幣值可以貪，任意幣值會錯", apply: "收銀找零、理解貪婪何時會失敗", time: "O(n)", space: "O(1)", lvl: 1, state: "ready" },
      { id: "interval", name: "Interval Scheduling", zh: "區間排程", desc: "按結束時間排序，Merge Intervals、Meeting Rooms", apply: "會議室安排、CPU 工作排程、廣告時段", time: "O(n log n)", space: "O(1)", lvl: 2, state: "ready" },
      { id: "jump", name: "Jump Game", zh: "跳躍遊戲", desc: "維護最遠可達位置", apply: "資源夠不夠到達目標的快速判斷", time: "O(n)", space: "O(1)", lvl: 2, state: "ready" },
      { id: "huffman", name: "Huffman Coding", zh: "霍夫曼編碼", desc: "用堆積每次合併最小的兩個頻率", apply: "zip、JPEG、MP3 的熵編碼階段", time: "O(n log n)", space: "O(n)", lvl: 3, state: "ready" },
    ],
  },
  {
    id: "graph",
    en: "Graph Algorithms",
    zh: "圖論演算法",
    glyph: "graph",
    kind: "algo",
    desc: "從走訪開始，延伸到最短路徑、相依順序與連通性。",
    intro: "圖能描述地圖、社交網路、任務相依關係等各種「東西之間有關聯」的問題。本主題從兩種基本走訪方式出發，再逐步進入環偵測、拓撲排序、各種最短路徑與最小生成樹。",
    applications: [
      { title: "地圖導航", desc: "路口是節點、道路是邊。問「最少轉幾次」用 BFS，問「最快幾分鐘」就要考慮邊的權重，那是 Dijkstra。", sub: "dijkstra" },
      { title: "社群平台的「你可能認識」", desc: "從你出發走兩步能到的人，就是好友的好友。BFS 一層一層往外找，正好對應「幾度人脈」。", sub: "bfs" },
      { title: "套件安裝與編譯順序", desc: "A 依賴 B、B 依賴 C，npm 或 Makefile 得先裝 C。這是拓撲排序，而且要先用環偵測確認沒有循環依賴。", sub: "topo" },
      { title: "鋪設網路線路", desc: "要把所有機房連起來又讓總線路成本最低，這是最小生成樹，Kruskal 會用到併查集。", sub: "mst" },
    ],
    prereq: ["Queue", "Stack", "遞迴", "鄰接串列"],
    subs: [
      { id: "bfs", name: "BFS", zh: "廣度優先搜尋", desc: "一層一層向外擴散，天生適合找無權圖最短路徑", apply: "最少步數、幾度人脈、爬蟲逐層抓取", time: "O(V+E)", space: "O(V)", lvl: 1, state: "ready" },
      { id: "dfs", name: "DFS", zh: "深度優先搜尋", desc: "一路走到底再回頭，是連通分量與拓撲排序的基礎", apply: "遍歷資料夾、油漆桶填色、偵測循環依賴", time: "O(V+E)", space: "O(V)", lvl: 1, state: "ready" },
      { id: "grid", name: "Grid as Graph", zh: "網格圖", desc: "把二維陣列當圖，四方向就是邊", apply: "數島嶼、迷宮、影像連通區域", time: "O(mn)", space: "O(mn)", lvl: 1, state: "ready" },
      { id: "cycle", name: "Cycle Detection", zh: "環偵測", desc: "有向圖用三色標記，無向圖用併查集", apply: "循環依賴、死鎖偵測", time: "O(V+E)", space: "O(V)", lvl: 2, state: "ready" },
      { id: "topo", name: "Topological Sort", zh: "拓撲排序", desc: "Kahn 的入度法與 DFS 完成順序法", apply: "套件安裝順序、課程先修、建置流程", time: "O(V+E)", space: "O(V)", lvl: 2, state: "ready" },
      { id: "bipartite", name: "Bipartite Check", zh: "二分圖判定", desc: "兩色染色，相鄰不同色", apply: "配對問題、衝突分組", time: "O(V+E)", space: "O(V)", lvl: 2, state: "ready" },
      { id: "dijkstra", name: "Dijkstra", zh: "單源最短路徑", desc: "非負權重圖上，用優先佇列逐步確定最短距離", apply: "導航最快路線、網路路由", time: "O((V+E) log V)", space: "O(V)", lvl: 2, state: "ready" },
      { id: "bellman-ford", name: "Bellman-Ford", zh: "含負權最短路徑", desc: "鬆弛 V−1 輪，第 V 輪還能鬆弛就有負環", apply: "匯率套利偵測、負權邊的路徑", time: "O(VE)", space: "O(V)", lvl: 3, state: "ready" },
      { id: "floyd", name: "Floyd-Warshall", zh: "全點對最短路徑", desc: "三層迴圈的 DP，適合稠密小圖", apply: "小型網路的路由表、任兩點距離查詢", time: "O(V³)", space: "O(V²)", lvl: 3, state: "draft" },
      { id: "dag-shortest", name: "Shortest Path in DAG", zh: "DAG 最短路徑", desc: "先拓撲排序再依序鬆弛，負權也可以", apply: "專案排程的關鍵路徑", time: "O(V+E)", space: "O(V)", lvl: 2, state: "draft" },
      { id: "mst", name: "MST: Kruskal & Prim", zh: "最小生成樹", desc: "Kruskal 按邊排序加併查集，Prim 用堆積", apply: "鋪設電纜或光纖、叢集分析", time: "O(E log E)", space: "O(V)", lvl: 3, state: "draft" },
    ],
  },
  {
    id: "dp",
    en: "Dynamic Programming",
    zh: "動態規劃",
    glyph: "dp",
    kind: "algo",
    desc: "把大問題拆成重疊的子問題，記住答案就不用重算。",
    intro: "DP 的核心是兩件事：子問題會重複出現、大問題的最佳解由子問題的最佳解組成。從記憶化開始，學會定義狀態、寫轉移式、決定順序，再看背包、序列、網格、區間、位元遮罩與樹上這幾種最常見的狀態設計。",
    applications: [
      { title: "拼字檢查與自動校正", desc: "「teh」和「the」差多少？編輯距離算的就是最少改幾個字，輸入法、搜尋引擎的「你是不是要找」都靠它。", sub: "edit-distance" },
      { title: "Git diff 與版本比對", desc: "兩份文字哪些行沒變、哪些行新增或刪除，本質是最長共同子序列。", sub: "lcs" },
      { title: "預算與資源分配", desc: "廣告預算有限、每個方案有成本和效益，選哪些組合效益最大。這是背包問題，雲端資源配置也是同一題。", sub: "knapsack" },
      { title: "為什麼不能只用遞迴", desc: "費氏數列直接遞迴會重算同樣的子問題幾百萬次。記住答案，就從指數時間變成線性時間，這就是 DP 的起點。", sub: "memo" },
    ],
    subs: [
      { id: "memo", name: "Memoization & Tabulation", zh: "記憶化與表格法", desc: "Fibonacci、Climbing Stairs，自頂向下與自底向上", apply: "任何有重疊子問題的遞迴，先加快取再說", time: "O(n)", space: "O(n)", lvl: 1, state: "ready" },
      { id: "dp-1d", name: "1-D DP", zh: "一維 DP", desc: "House Robber、Decode Ways，狀態只跟前幾項有關", apply: "序列決策、簡單的排程與計數", time: "O(n)", space: "O(1)", lvl: 2, state: "ready" },
      { id: "knapsack", name: "0/1 Knapsack", zh: "背包問題", desc: "每個物品選或不選，二維表與空間壓縮", apply: "預算分配、投資組合、貨櫃裝載", time: "O(nW)", space: "O(W)", lvl: 2, state: "ready" },
      { id: "unbounded", name: "Unbounded Knapsack", zh: "完全背包", desc: "物品可重複選，Coin Change 的 DP 版", apply: "找零最少硬幣數、無限供應的採購", time: "O(nW)", space: "O(W)", lvl: 2, state: "ready" },
      { id: "lis", name: "LIS", zh: "最長遞增子序列", desc: "O(n²) 的 DP 與 O(n log n) 的耐心排序", apply: "股價趨勢分析、俄羅斯套娃信封問題", time: "O(n log n)", space: "O(n)", lvl: 3, state: "ready" },
      { id: "lcs", name: "LCS", zh: "最長共同子序列", desc: "二維表，相等就對角線加一", apply: "diff 工具、DNA 序列比對、抄襲比對", time: "O(mn)", space: "O(mn)", lvl: 2, state: "ready" },
      { id: "edit-distance", name: "Edit Distance", zh: "編輯距離", desc: "插入、刪除、取代三種操作的最小次數", apply: "拼字校正、模糊搜尋、語音辨識評分", time: "O(mn)", space: "O(mn)", lvl: 3, state: "ready" },
      { id: "grid-dp", name: "Grid DP", zh: "網格路徑", desc: "Unique Paths、Min Path Sum，只能往右或往下", apply: "機器人路徑計數、影像接縫裁切", time: "O(mn)", space: "O(n)", lvl: 2, state: "ready" },
      { id: "interval-dp", name: "Interval DP", zh: "區間 DP", desc: "Burst Balloons、矩陣鏈乘，枚舉分割點", apply: "最佳括號化、多邊形三角剖分", time: "O(n³)", space: "O(n²)", lvl: 3, state: "ready" },
      { id: "bitmask-dp", name: "Bitmask DP", zh: "位元遮罩 DP", desc: "用整數的位元表示集合狀態", apply: "TSP、小規模指派問題", time: "O(2ⁿ·n²)", space: "O(2ⁿ·n)", lvl: 3, state: "ready" },
      { id: "tree-dp", name: "Tree DP", zh: "樹上 DP", desc: "後序走訪，由子樹答案組合父節點答案", apply: "樹的直徑、最大路徑和、樹上獨立集", time: "O(n)", space: "O(h)", lvl: 3, state: "ready" },
    ],
  },
  {
    id: "string",
    en: "String Algorithms",
    zh: "字串演算法",
    glyph: "string",
    kind: "algo",
    desc: "比對、搜尋與雜湊。前綴函數是這裡的關鍵工具。",
    intro: "字串比對的暴力法最壞是 O(nm)。這個主題的每個演算法都在用不同方式避免重複比對：雜湊用數字代替字串、KMP 與 Z 利用已比對過的資訊、Manacher 利用回文的對稱性。",
    applications: [
      { title: "編輯器的 Ctrl+F 與 grep", desc: "在一億字的 log 裡找一段字串，暴力比對最壞是 O(nm)。KMP 利用「已經比對過的部分」不回頭，做到線性時間。", sub: "kmp" },
      { title: "抄襲與重複內容偵測", desc: "把每一段文字算成一個雜湊值，比對雜湊比比對文字快得多。Rabin-Karp 的滾動雜湊讓視窗移動時不用重算。", sub: "rabin-karp" },
      { title: "DNA 序列分析", desc: "基因序列就是很長的 ACGT 字串。找特定片段、找回文結構（限制酶切位常是回文），都是字串演算法。", sub: "manacher" },
      { title: "搜尋引擎的關鍵字比對", desc: "同時要在文件裡找幾千個關鍵字，字典樹把所有關鍵字疊在一起，掃一遍文件就全部找到。", sub: "trie-apps" },
    ],
    subs: [
      { id: "hashing", name: "String Hashing", zh: "字串雜湊", desc: "多項式雜湊、模數與碰撞", apply: "快速比較子字串是否相等", time: "O(n)", space: "O(n)", lvl: 2, state: "ready" },
      { id: "rabin-karp", name: "Rabin-Karp", zh: "滾動雜湊比對", desc: "視窗移動時 O(1) 更新雜湊", apply: "抄襲偵測、多模式比對", time: "平均 O(n+m)", space: "O(1)", lvl: 2, state: "ready" },
      { id: "kmp", name: "KMP", zh: "前綴函數比對", desc: "失敗函數讓比對指標不回頭", apply: "文字搜尋、入侵偵測系統的特徵比對", time: "O(n+m)", space: "O(m)", lvl: 3, state: "ready" },
      { id: "z-algo", name: "Z-Algorithm", zh: "Z 函數", desc: "每個位置與整串的最長共同前綴", apply: "字串比對、週期偵測", time: "O(n+m)", space: "O(n)", lvl: 3, state: "ready" },
      { id: "manacher", name: "Manacher", zh: "最長回文", desc: "利用已知回文的對稱性省掉重複展開", apply: "DNA 回文片段、文字分析", time: "O(n)", space: "O(n)", lvl: 3, state: "ready" },
      { id: "trie-apps", name: "Trie Applications", zh: "字典樹應用", desc: "自動補全、Word Search II、多模式比對", apply: "搜尋建議、敏感詞過濾", time: "O(L)", space: "O(ΣL)", lvl: 2, state: "draft" },
    ],
  },
  {
    id: "bits",
    en: "Bit Manipulation",
    zh: "位元運算",
    glyph: "bits",
    kind: "algo",
    desc: "直接操作 0 與 1。又快又省，還能表示集合。",
    intro: "整數在記憶體裡就是一串位元。AND、OR、XOR、移位這幾個運算都是單一 CPU 指令，用對了能把某些問題壓到常數時間，也能用一個整數表示一整個集合。",
    applications: [
      { title: "權限與功能開關", desc: "讀、寫、執行各佔一個位元，一個整數就存完所有權限。Unix 的 chmod 755、遊戲的狀態旗標都是這樣存。", sub: "basics" },
      { title: "找出落單的那一個", desc: "一組資料每個都出現兩次，只有一個出現一次。全部 XOR 起來，成對的互相抵消，剩下的就是答案，不用任何額外記憶體。", sub: "xor" },
      { title: "網路遮罩與雜湊", desc: "IP 的子網路遮罩、雜湊表的取模用 AND 代替、布隆過濾器，底層都是位元運算。", sub: "counting-bits" },
    ],
    subs: [
      { id: "basics", name: "Bitwise Basics", zh: "基本運算", desc: "AND / OR / XOR / NOT / 移位，取位、設位、清位", apply: "權限旗標、硬體暫存器、壓縮儲存", time: "O(1)", space: "O(1)", lvl: 1, state: "ready" },
      { id: "xor", name: "XOR Tricks", zh: "XOR 技巧", desc: "a ^ a = 0、a ^ 0 = a，交換與抵消", apply: "Single Number、缺少的數字、不用暫存變數的交換", time: "O(n)", space: "O(1)", lvl: 2, state: "ready" },
      { id: "counting-bits", name: "Counting Bits", zh: "位元計數", desc: "Brian Kernighan 的 n & (n−1)", apply: "漢明距離、population count", time: "O(n)", space: "O(1)", lvl: 2, state: "ready" },
      { id: "subset-enum", name: "Subset Enumeration", zh: "位元列舉子集", desc: "0 到 2ⁿ−1 每個整數就是一個子集", apply: "小規模組合問題、Bitmask DP 的前置", time: "O(2ⁿ)", space: "O(1)", lvl: 2, state: "ready" },
    ],
  },
  {
    id: "math",
    en: "Math & Number Theory",
    zh: "數學與數論",
    glyph: "math",
    kind: "algo",
    desc: "演算法題裡最常用到的幾個數學工具。",
    intro: "不是要學數學系的數論，而是把演算法題最常碰到的幾個工具準備好：最大公因數、質數篩、模運算與快速冪、組合計數。這些在加密、雜湊與計數問題裡反覆出現。",
    applications: [
      { title: "HTTPS 背後的 RSA", desc: "公鑰加密靠大質數與模運算：產生質數、算模反元素、做模冪。這裡的每一篇都是它的零件。", sub: "modular" },
      { title: "螢幕比例與分數化簡", desc: "1920×1080 是 16:9，靠的是最大公因數。分數運算、週期對齊、齒輪比都是同一個工具。", sub: "gcd" },
      { title: "「有幾種走法」", desc: "從左上到右下有幾條路、抽 5 張牌有幾種組合。組合數在計數問題與機率裡到處都是，但要注意溢位與取模。", sub: "combinatorics" },
    ],
    subs: [
      { id: "gcd", name: "GCD & LCM", zh: "最大公因數", desc: "歐幾里得輾轉相除與擴展歐幾里得", apply: "分數化簡、比例、週期同步", time: "O(log n)", space: "O(1)", lvl: 1, state: "ready" },
      { id: "sieve", name: "Sieve of Eratosthenes", zh: "質數篩", desc: "從小到大劃掉倍數", apply: "產生質數表、因數分解", time: "O(n log log n)", space: "O(n)", lvl: 2, state: "draft" },
      { id: "modular", name: "Modular Arithmetic", zh: "模運算", desc: "模加乘、快速冪、費馬小定理求反元素", apply: "RSA、雜湊、答案取模 10⁹+7", time: "O(log n)", space: "O(1)", lvl: 2, state: "draft" },
      { id: "combinatorics", name: "Combinatorics", zh: "組合計數", desc: "Pascal 三角、C(n,k)、預算階乘取模", apply: "路徑計數、機率、抽樣", time: "O(n)", space: "O(n)", lvl: 2, state: "draft" },
    ],
  },
];

export const LEVEL_LABEL: Record<Level, string> = { 1: "入門", 2: "進階", 3: "困難" };
export const KIND_LABEL: Record<TopicKind, string> = { ds: "資料結構", algo: "演算法" };

export function getTopic(id: string) {
  return TOPICS.find((t) => t.id === id);
}
export function getSubtopic(topicId: string, subId: string) {
  const t = getTopic(topicId);
  const s = t?.subs.find((x) => x.id === subId);
  return t && s ? { topic: t, sub: s } : undefined;
}
export const lessonKey = (topicId: string, subId: string) => `${topicId}/${subId}`;
