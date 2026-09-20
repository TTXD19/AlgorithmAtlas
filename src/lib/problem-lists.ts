import type { Locale } from "./i18n";

/**
 * 面試題單：NeetCode 150（含 Blind 75 標記）。
 *
 * 資料來自 NeetCode 的公開 repo（neetcode-gh/leetcode 的 .problemSiteData.json），
 * 只留題號、題名、slug、難度、分類。分類順序照 NeetCode 的路線圖，
 * 跟本站的學習路線節點幾乎一對一，PATTERNS 把它們對起來。
 * premium 的題目 LeetCode 要付費，改連 LintCode 的免費版。
 */
export interface ListProblem {
  id: number;
  title: string;
  slug: string;
  diff: "Easy" | "Medium" | "Hard";
  pattern: string;
  blind75?: boolean;
  premium?: boolean;
  freeLink?: string;
}

export type ListId = "blind75" | "neetcode150";

export const LIST_META: Record<ListId, { name: string; count: number }> = {
  blind75: { name: "Blind 75", count: 75 },
  neetcode150: { name: "NeetCode 150", count: 150 },
};

/** 分類 → 學習路線節點（沒有對應課程的題目會連到這個節點），以及中文名 */
export const PATTERNS: Record<string, { node: string; zh: string }> = {
  "Arrays & Hashing": { node: "arrays", zh: "陣列與雜湊" },
  "Two Pointers": { node: "two-pointers", zh: "雙指標" },
  "Sliding Window": { node: "sliding-window", zh: "滑動視窗" },
  "Stack": { node: "stack", zh: "堆疊" },
  "Binary Search": { node: "binary-search", zh: "二分搜尋" },
  "Linked List": { node: "linked-list", zh: "鏈結串列" },
  "Trees": { node: "trees", zh: "樹" },
  "Tries": { node: "tries", zh: "字典樹" },
  "Heap / Priority Queue": { node: "heap", zh: "堆積" },
  "Backtracking": { node: "backtracking", zh: "回溯" },
  "Graphs": { node: "graphs", zh: "圖" },
  "Advanced Graphs": { node: "adv-graphs", zh: "進階圖論" },
  "1-D Dynamic Programming": { node: "dp1", zh: "一維 DP" },
  "2-D Dynamic Programming": { node: "dp2", zh: "二維 DP" },
  "Greedy": { node: "greedy", zh: "貪婪法" },
  "Intervals": { node: "greedy", zh: "區間" },
  "Math & Geometry": { node: "math", zh: "數學與幾何" },
  "Bit Manipulation": { node: "bits", zh: "位元運算" },
};

export function patternLabel(pattern: string, locale: Locale) {
  return locale === "en" ? pattern : PATTERNS[pattern]?.zh ?? pattern;
}

export function problemsOf(list: ListId): ListProblem[] {
  return list === "blind75" ? PROBLEMS.filter((p) => p.blind75) : PROBLEMS;
}

export function listProblemUrl(p: ListProblem) {
  return p.premium && p.freeLink ? p.freeLink : `https://leetcode.com/problems/${p.slug}/`;
}

export const PROBLEMS: ListProblem[] = [
  { id: 217, title: "Contains Duplicate", slug: "contains-duplicate", diff: "Easy", pattern: "Arrays & Hashing", blind75: true },
  { id: 242, title: "Valid Anagram", slug: "valid-anagram", diff: "Easy", pattern: "Arrays & Hashing", blind75: true },
  { id: 1, title: "Two Sum", slug: "two-sum", diff: "Easy", pattern: "Arrays & Hashing", blind75: true },
  { id: 49, title: "Group Anagrams", slug: "group-anagrams", diff: "Medium", pattern: "Arrays & Hashing", blind75: true },
  { id: 347, title: "Top K Frequent Elements", slug: "top-k-frequent-elements", diff: "Medium", pattern: "Arrays & Hashing", blind75: true },
  { id: 238, title: "Product of Array Except Self", slug: "product-of-array-except-self", diff: "Medium", pattern: "Arrays & Hashing", blind75: true },
  { id: 36, title: "Valid Sudoku", slug: "valid-sudoku", diff: "Medium", pattern: "Arrays & Hashing" },
  { id: 271, title: "Encode and Decode Strings", slug: "encode-and-decode-strings", diff: "Medium", pattern: "Arrays & Hashing", blind75: true, premium: true, freeLink: "https://www.lintcode.com/problem/659/" },
  { id: 128, title: "Longest Consecutive Sequence", slug: "longest-consecutive-sequence", diff: "Medium", pattern: "Arrays & Hashing", blind75: true },
  { id: 125, title: "Valid Palindrome", slug: "valid-palindrome", diff: "Easy", pattern: "Two Pointers", blind75: true },
  { id: 167, title: "Two Sum II Input Array Is Sorted", slug: "two-sum-ii-input-array-is-sorted", diff: "Medium", pattern: "Two Pointers" },
  { id: 15, title: "3Sum", slug: "3sum", diff: "Medium", pattern: "Two Pointers", blind75: true },
  { id: 11, title: "Container With Most Water", slug: "container-with-most-water", diff: "Medium", pattern: "Two Pointers", blind75: true },
  { id: 42, title: "Trapping Rain Water", slug: "trapping-rain-water", diff: "Hard", pattern: "Two Pointers" },
  { id: 121, title: "Best Time to Buy And Sell Stock", slug: "best-time-to-buy-and-sell-stock", diff: "Easy", pattern: "Sliding Window", blind75: true },
  { id: 3, title: "Longest Substring Without Repeating Characters", slug: "longest-substring-without-repeating-characters", diff: "Medium", pattern: "Sliding Window", blind75: true },
  { id: 424, title: "Longest Repeating Character Replacement", slug: "longest-repeating-character-replacement", diff: "Medium", pattern: "Sliding Window", blind75: true },
  { id: 567, title: "Permutation In String", slug: "permutation-in-string", diff: "Medium", pattern: "Sliding Window" },
  { id: 76, title: "Minimum Window Substring", slug: "minimum-window-substring", diff: "Hard", pattern: "Sliding Window", blind75: true },
  { id: 239, title: "Sliding Window Maximum", slug: "sliding-window-maximum", diff: "Hard", pattern: "Sliding Window" },
  { id: 20, title: "Valid Parentheses", slug: "valid-parentheses", diff: "Easy", pattern: "Stack", blind75: true },
  { id: 155, title: "Min Stack", slug: "min-stack", diff: "Medium", pattern: "Stack" },
  { id: 150, title: "Evaluate Reverse Polish Notation", slug: "evaluate-reverse-polish-notation", diff: "Medium", pattern: "Stack" },
  { id: 22, title: "Generate Parentheses", slug: "generate-parentheses", diff: "Medium", pattern: "Stack" },
  { id: 739, title: "Daily Temperatures", slug: "daily-temperatures", diff: "Medium", pattern: "Stack" },
  { id: 853, title: "Car Fleet", slug: "car-fleet", diff: "Medium", pattern: "Stack" },
  { id: 84, title: "Largest Rectangle In Histogram", slug: "largest-rectangle-in-histogram", diff: "Hard", pattern: "Stack" },
  { id: 704, title: "Binary Search", slug: "binary-search", diff: "Easy", pattern: "Binary Search" },
  { id: 74, title: "Search a 2D Matrix", slug: "search-a-2d-matrix", diff: "Medium", pattern: "Binary Search" },
  { id: 875, title: "Koko Eating Bananas", slug: "koko-eating-bananas", diff: "Medium", pattern: "Binary Search" },
  { id: 153, title: "Find Minimum In Rotated Sorted Array", slug: "find-minimum-in-rotated-sorted-array", diff: "Medium", pattern: "Binary Search", blind75: true },
  { id: 33, title: "Search In Rotated Sorted Array", slug: "search-in-rotated-sorted-array", diff: "Medium", pattern: "Binary Search", blind75: true },
  { id: 981, title: "Time Based Key Value Store", slug: "time-based-key-value-store", diff: "Medium", pattern: "Binary Search" },
  { id: 4, title: "Median of Two Sorted Arrays", slug: "median-of-two-sorted-arrays", diff: "Hard", pattern: "Binary Search" },
  { id: 206, title: "Reverse Linked List", slug: "reverse-linked-list", diff: "Easy", pattern: "Linked List", blind75: true },
  { id: 21, title: "Merge Two Sorted Lists", slug: "merge-two-sorted-lists", diff: "Easy", pattern: "Linked List", blind75: true },
  { id: 143, title: "Reorder List", slug: "reorder-list", diff: "Medium", pattern: "Linked List", blind75: true },
  { id: 19, title: "Remove Nth Node From End of List", slug: "remove-nth-node-from-end-of-list", diff: "Medium", pattern: "Linked List", blind75: true },
  { id: 138, title: "Copy List With Random Pointer", slug: "copy-list-with-random-pointer", diff: "Medium", pattern: "Linked List" },
  { id: 2, title: "Add Two Numbers", slug: "add-two-numbers", diff: "Medium", pattern: "Linked List" },
  { id: 141, title: "Linked List Cycle", slug: "linked-list-cycle", diff: "Easy", pattern: "Linked List", blind75: true },
  { id: 287, title: "Find The Duplicate Number", slug: "find-the-duplicate-number", diff: "Medium", pattern: "Linked List" },
  { id: 146, title: "LRU Cache", slug: "lru-cache", diff: "Medium", pattern: "Linked List" },
  { id: 23, title: "Merge K Sorted Lists", slug: "merge-k-sorted-lists", diff: "Hard", pattern: "Linked List", blind75: true },
  { id: 25, title: "Reverse Nodes In K Group", slug: "reverse-nodes-in-k-group", diff: "Hard", pattern: "Linked List" },
  { id: 226, title: "Invert Binary Tree", slug: "invert-binary-tree", diff: "Easy", pattern: "Trees", blind75: true },
  { id: 104, title: "Maximum Depth of Binary Tree", slug: "maximum-depth-of-binary-tree", diff: "Easy", pattern: "Trees", blind75: true },
  { id: 543, title: "Diameter of Binary Tree", slug: "diameter-of-binary-tree", diff: "Easy", pattern: "Trees" },
  { id: 110, title: "Balanced Binary Tree", slug: "balanced-binary-tree", diff: "Easy", pattern: "Trees" },
  { id: 100, title: "Same Tree", slug: "same-tree", diff: "Easy", pattern: "Trees", blind75: true },
  { id: 572, title: "Subtree of Another Tree", slug: "subtree-of-another-tree", diff: "Easy", pattern: "Trees", blind75: true },
  { id: 235, title: "Lowest Common Ancestor of a Binary Search Tree", slug: "lowest-common-ancestor-of-a-binary-search-tree", diff: "Medium", pattern: "Trees", blind75: true },
  { id: 102, title: "Binary Tree Level Order Traversal", slug: "binary-tree-level-order-traversal", diff: "Medium", pattern: "Trees", blind75: true },
  { id: 199, title: "Binary Tree Right Side View", slug: "binary-tree-right-side-view", diff: "Medium", pattern: "Trees" },
  { id: 1448, title: "Count Good Nodes In Binary Tree", slug: "count-good-nodes-in-binary-tree", diff: "Medium", pattern: "Trees" },
  { id: 98, title: "Validate Binary Search Tree", slug: "validate-binary-search-tree", diff: "Medium", pattern: "Trees", blind75: true },
  { id: 230, title: "Kth Smallest Element In a Bst", slug: "kth-smallest-element-in-a-bst", diff: "Medium", pattern: "Trees", blind75: true },
  { id: 105, title: "Construct Binary Tree From Preorder And Inorder Traversal", slug: "construct-binary-tree-from-preorder-and-inorder-traversal", diff: "Medium", pattern: "Trees", blind75: true },
  { id: 124, title: "Binary Tree Maximum Path Sum", slug: "binary-tree-maximum-path-sum", diff: "Hard", pattern: "Trees", blind75: true },
  { id: 297, title: "Serialize And Deserialize Binary Tree", slug: "serialize-and-deserialize-binary-tree", diff: "Hard", pattern: "Trees", blind75: true },
  { id: 208, title: "Implement Trie Prefix Tree", slug: "implement-trie-prefix-tree", diff: "Medium", pattern: "Tries", blind75: true },
  { id: 211, title: "Design Add And Search Words Data Structure", slug: "design-add-and-search-words-data-structure", diff: "Medium", pattern: "Tries", blind75: true },
  { id: 212, title: "Word Search II", slug: "word-search-ii", diff: "Hard", pattern: "Tries", blind75: true },
  { id: 703, title: "Kth Largest Element In a Stream", slug: "kth-largest-element-in-a-stream", diff: "Easy", pattern: "Heap / Priority Queue" },
  { id: 1046, title: "Last Stone Weight", slug: "last-stone-weight", diff: "Easy", pattern: "Heap / Priority Queue" },
  { id: 973, title: "K Closest Points to Origin", slug: "k-closest-points-to-origin", diff: "Medium", pattern: "Heap / Priority Queue" },
  { id: 215, title: "Kth Largest Element In An Array", slug: "kth-largest-element-in-an-array", diff: "Medium", pattern: "Heap / Priority Queue" },
  { id: 621, title: "Task Scheduler", slug: "task-scheduler", diff: "Medium", pattern: "Heap / Priority Queue" },
  { id: 355, title: "Design Twitter", slug: "design-twitter", diff: "Medium", pattern: "Heap / Priority Queue" },
  { id: 295, title: "Find Median From Data Stream", slug: "find-median-from-data-stream", diff: "Hard", pattern: "Heap / Priority Queue", blind75: true },
  { id: 78, title: "Subsets", slug: "subsets", diff: "Medium", pattern: "Backtracking" },
  { id: 39, title: "Combination Sum", slug: "combination-sum", diff: "Medium", pattern: "Backtracking", blind75: true },
  { id: 46, title: "Permutations", slug: "permutations", diff: "Medium", pattern: "Backtracking" },
  { id: 90, title: "Subsets II", slug: "subsets-ii", diff: "Medium", pattern: "Backtracking" },
  { id: 40, title: "Combination Sum II", slug: "combination-sum-ii", diff: "Medium", pattern: "Backtracking" },
  { id: 79, title: "Word Search", slug: "word-search", diff: "Medium", pattern: "Backtracking", blind75: true },
  { id: 131, title: "Palindrome Partitioning", slug: "palindrome-partitioning", diff: "Medium", pattern: "Backtracking" },
  { id: 17, title: "Letter Combinations of a Phone Number", slug: "letter-combinations-of-a-phone-number", diff: "Medium", pattern: "Backtracking" },
  { id: 51, title: "N Queens", slug: "n-queens", diff: "Hard", pattern: "Backtracking" },
  { id: 200, title: "Number of Islands", slug: "number-of-islands", diff: "Medium", pattern: "Graphs", blind75: true },
  { id: 133, title: "Clone Graph", slug: "clone-graph", diff: "Medium", pattern: "Graphs", blind75: true },
  { id: 695, title: "Max Area of Island", slug: "max-area-of-island", diff: "Medium", pattern: "Graphs" },
  { id: 417, title: "Pacific Atlantic Water Flow", slug: "pacific-atlantic-water-flow", diff: "Medium", pattern: "Graphs", blind75: true },
  { id: 130, title: "Surrounded Regions", slug: "surrounded-regions", diff: "Medium", pattern: "Graphs" },
  { id: 994, title: "Rotting Oranges", slug: "rotting-oranges", diff: "Medium", pattern: "Graphs" },
  { id: 286, title: "Walls And Gates", slug: "walls-and-gates", diff: "Medium", pattern: "Graphs", premium: true, freeLink: "https://www.lintcode.com/problem/663/" },
  { id: 207, title: "Course Schedule", slug: "course-schedule", diff: "Medium", pattern: "Graphs", blind75: true },
  { id: 210, title: "Course Schedule II", slug: "course-schedule-ii", diff: "Medium", pattern: "Graphs" },
  { id: 684, title: "Redundant Connection", slug: "redundant-connection", diff: "Medium", pattern: "Graphs" },
  { id: 323, title: "Number of Connected Components In An Undirected Graph", slug: "number-of-connected-components-in-an-undirected-graph", diff: "Medium", pattern: "Graphs", blind75: true, premium: true, freeLink: "https://www.lintcode.com/problem/3651/" },
  { id: 261, title: "Graph Valid Tree", slug: "graph-valid-tree", diff: "Medium", pattern: "Graphs", blind75: true, premium: true, freeLink: "https://www.lintcode.com/problem/178/" },
  { id: 127, title: "Word Ladder", slug: "word-ladder", diff: "Hard", pattern: "Graphs" },
  { id: 332, title: "Reconstruct Itinerary", slug: "reconstruct-itinerary", diff: "Hard", pattern: "Advanced Graphs" },
  { id: 1584, title: "Min Cost to Connect All Points", slug: "min-cost-to-connect-all-points", diff: "Medium", pattern: "Advanced Graphs" },
  { id: 743, title: "Network Delay Time", slug: "network-delay-time", diff: "Medium", pattern: "Advanced Graphs" },
  { id: 778, title: "Swim In Rising Water", slug: "swim-in-rising-water", diff: "Hard", pattern: "Advanced Graphs" },
  { id: 269, title: "Alien Dictionary", slug: "alien-dictionary", diff: "Hard", pattern: "Advanced Graphs", blind75: true, premium: true, freeLink: "https://www.lintcode.com/problem/892/" },
  { id: 787, title: "Cheapest Flights Within K Stops", slug: "cheapest-flights-within-k-stops", diff: "Medium", pattern: "Advanced Graphs" },
  { id: 70, title: "Climbing Stairs", slug: "climbing-stairs", diff: "Easy", pattern: "1-D Dynamic Programming", blind75: true },
  { id: 746, title: "Min Cost Climbing Stairs", slug: "min-cost-climbing-stairs", diff: "Easy", pattern: "1-D Dynamic Programming" },
  { id: 198, title: "House Robber", slug: "house-robber", diff: "Medium", pattern: "1-D Dynamic Programming", blind75: true },
  { id: 213, title: "House Robber II", slug: "house-robber-ii", diff: "Medium", pattern: "1-D Dynamic Programming", blind75: true },
  { id: 5, title: "Longest Palindromic Substring", slug: "longest-palindromic-substring", diff: "Medium", pattern: "1-D Dynamic Programming", blind75: true },
  { id: 647, title: "Palindromic Substrings", slug: "palindromic-substrings", diff: "Medium", pattern: "1-D Dynamic Programming", blind75: true },
  { id: 91, title: "Decode Ways", slug: "decode-ways", diff: "Medium", pattern: "1-D Dynamic Programming", blind75: true },
  { id: 322, title: "Coin Change", slug: "coin-change", diff: "Medium", pattern: "1-D Dynamic Programming", blind75: true },
  { id: 152, title: "Maximum Product Subarray", slug: "maximum-product-subarray", diff: "Medium", pattern: "1-D Dynamic Programming", blind75: true },
  { id: 139, title: "Word Break", slug: "word-break", diff: "Medium", pattern: "1-D Dynamic Programming", blind75: true },
  { id: 300, title: "Longest Increasing Subsequence", slug: "longest-increasing-subsequence", diff: "Medium", pattern: "1-D Dynamic Programming", blind75: true },
  { id: 416, title: "Partition Equal Subset Sum", slug: "partition-equal-subset-sum", diff: "Medium", pattern: "1-D Dynamic Programming" },
  { id: 62, title: "Unique Paths", slug: "unique-paths", diff: "Medium", pattern: "2-D Dynamic Programming", blind75: true },
  { id: 1143, title: "Longest Common Subsequence", slug: "longest-common-subsequence", diff: "Medium", pattern: "2-D Dynamic Programming", blind75: true },
  { id: 309, title: "Best Time to Buy And Sell Stock With Cooldown", slug: "best-time-to-buy-and-sell-stock-with-cooldown", diff: "Medium", pattern: "2-D Dynamic Programming" },
  { id: 518, title: "Coin Change II", slug: "coin-change-ii", diff: "Medium", pattern: "2-D Dynamic Programming" },
  { id: 494, title: "Target Sum", slug: "target-sum", diff: "Medium", pattern: "2-D Dynamic Programming" },
  { id: 97, title: "Interleaving String", slug: "interleaving-string", diff: "Medium", pattern: "2-D Dynamic Programming" },
  { id: 329, title: "Longest Increasing Path In a Matrix", slug: "longest-increasing-path-in-a-matrix", diff: "Hard", pattern: "2-D Dynamic Programming" },
  { id: 115, title: "Distinct Subsequences", slug: "distinct-subsequences", diff: "Hard", pattern: "2-D Dynamic Programming" },
  { id: 72, title: "Edit Distance", slug: "edit-distance", diff: "Medium", pattern: "2-D Dynamic Programming" },
  { id: 312, title: "Burst Balloons", slug: "burst-balloons", diff: "Hard", pattern: "2-D Dynamic Programming" },
  { id: 10, title: "Regular Expression Matching", slug: "regular-expression-matching", diff: "Hard", pattern: "2-D Dynamic Programming" },
  { id: 53, title: "Maximum Subarray", slug: "maximum-subarray", diff: "Medium", pattern: "Greedy", blind75: true },
  { id: 55, title: "Jump Game", slug: "jump-game", diff: "Medium", pattern: "Greedy", blind75: true },
  { id: 45, title: "Jump Game II", slug: "jump-game-ii", diff: "Medium", pattern: "Greedy" },
  { id: 134, title: "Gas Station", slug: "gas-station", diff: "Medium", pattern: "Greedy" },
  { id: 846, title: "Hand of Straights", slug: "hand-of-straights", diff: "Medium", pattern: "Greedy" },
  { id: 1899, title: "Merge Triplets to Form Target Triplet", slug: "merge-triplets-to-form-target-triplet", diff: "Medium", pattern: "Greedy" },
  { id: 763, title: "Partition Labels", slug: "partition-labels", diff: "Medium", pattern: "Greedy" },
  { id: 678, title: "Valid Parenthesis String", slug: "valid-parenthesis-string", diff: "Medium", pattern: "Greedy" },
  { id: 57, title: "Insert Interval", slug: "insert-interval", diff: "Medium", pattern: "Intervals", blind75: true },
  { id: 56, title: "Merge Intervals", slug: "merge-intervals", diff: "Medium", pattern: "Intervals", blind75: true },
  { id: 435, title: "Non Overlapping Intervals", slug: "non-overlapping-intervals", diff: "Medium", pattern: "Intervals", blind75: true },
  { id: 252, title: "Meeting Rooms", slug: "meeting-rooms", diff: "Easy", pattern: "Intervals", blind75: true, premium: true, freeLink: "https://www.lintcode.com/problem/920/" },
  { id: 253, title: "Meeting Rooms II", slug: "meeting-rooms-ii", diff: "Medium", pattern: "Intervals", blind75: true, premium: true, freeLink: "https://www.lintcode.com/problem/919/" },
  { id: 1851, title: "Minimum Interval to Include Each Query", slug: "minimum-interval-to-include-each-query", diff: "Hard", pattern: "Intervals" },
  { id: 48, title: "Rotate Image", slug: "rotate-image", diff: "Medium", pattern: "Math & Geometry", blind75: true },
  { id: 54, title: "Spiral Matrix", slug: "spiral-matrix", diff: "Medium", pattern: "Math & Geometry", blind75: true },
  { id: 73, title: "Set Matrix Zeroes", slug: "set-matrix-zeroes", diff: "Medium", pattern: "Math & Geometry", blind75: true },
  { id: 202, title: "Happy Number", slug: "happy-number", diff: "Easy", pattern: "Math & Geometry" },
  { id: 66, title: "Plus One", slug: "plus-one", diff: "Easy", pattern: "Math & Geometry" },
  { id: 50, title: "Pow(x, n)", slug: "powx-n", diff: "Medium", pattern: "Math & Geometry" },
  { id: 43, title: "Multiply Strings", slug: "multiply-strings", diff: "Medium", pattern: "Math & Geometry" },
  { id: 2013, title: "Detect Squares", slug: "detect-squares", diff: "Medium", pattern: "Math & Geometry" },
  { id: 136, title: "Single Number", slug: "single-number", diff: "Easy", pattern: "Bit Manipulation" },
  { id: 191, title: "Number of 1 Bits", slug: "number-of-1-bits", diff: "Easy", pattern: "Bit Manipulation", blind75: true },
  { id: 338, title: "Counting Bits", slug: "counting-bits", diff: "Easy", pattern: "Bit Manipulation", blind75: true },
  { id: 190, title: "Reverse Bits", slug: "reverse-bits", diff: "Easy", pattern: "Bit Manipulation", blind75: true },
  { id: 268, title: "Missing Number", slug: "missing-number", diff: "Easy", pattern: "Bit Manipulation", blind75: true },
  { id: 371, title: "Sum of Two Integers", slug: "sum-of-two-integers", diff: "Medium", pattern: "Bit Manipulation", blind75: true },
  { id: 7, title: "Reverse Integer", slug: "reverse-integer", diff: "Medium", pattern: "Bit Manipulation" },
];
