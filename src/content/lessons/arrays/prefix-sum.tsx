import { PrefixSumDemo } from "@/components/lesson/demos/PrefixSumDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `# Build in O(n): P[i] = a[0] + ... + a[i-1], with one spare slot so P[0] = 0
def build_prefix(a):
    p = [0] * (len(a) + 1)
    for i, x in enumerate(a):
        p[i + 1] = p[i] + x
    return p

# Query in O(1): the sum of a[l..r]
def range_sum(p, l, r):
    return p[r + 1] - p[l]


a = [3, 1, 4, 1, 5, 9, 2, 6]
p = build_prefix(a)          # [0, 3, 4, 8, 9, 14, 23, 25, 31]
range_sum(p, 2, 5)           # 4+1+5+9 = 19 = p[6] - p[2]


# Prefix sums + a hash table: how many subarrays sum to exactly k (LeetCode 560)
# sum of the subarray (i, j] = P[j] - P[i] = k  ⇔  P[i] = P[j] - k
# so on reaching j, ask how many earlier prefix sums equal P[j] - k
def subarray_sum(nums, k):
    count = 0
    seen = {0: 1}            # prefix sum 0 has already occurred once (the empty prefix)
    running = 0
    for x in nums:
        running += x
        count += seen.get(running - k, 0)
        seen[running] = seen.get(running, 0) + 1
    return count


# 2D prefix sums: S[r][c] is the total of the rectangle from the top-left corner to (r-1, c-1)
def build_2d(grid):
    m, n = len(grid), len(grid[0])
    s = [[0] * (n + 1) for _ in range(m + 1)]
    for r in range(m):
        for c in range(n):
            s[r+1][c+1] = grid[r][c] + s[r][c+1] + s[r+1][c] - s[r][c]
    return s

def rect_sum(s, r1, c1, r2, c2):     # top-left (r1,c1) to bottom-right (r2,c2)
    return s[r2+1][c2+1] - s[r1][c2+1] - s[r2+1][c1] + s[r1][c1]`;

const cpp = `#include <vector>
#include <unordered_map>

// Build in O(n)
std::vector<long long> buildPrefix(const std::vector<int>& a) {
    std::vector<long long> p(a.size() + 1, 0);
    for (size_t i = 0; i < a.size(); i++) p[i + 1] = p[i] + a[i];
    return p;
}

// Query in O(1)
long long rangeSum(const std::vector<long long>& p, int l, int r) {
    return p[r + 1] - p[l];
}

// Prefix sums + a hash table: the number of subarrays summing to k
int subarraySum(const std::vector<int>& nums, int k) {
    std::unordered_map<long long, int> seen;
    seen[0] = 1;
    long long running = 0;
    int count = 0;
    for (int x : nums) {
        running += x;
        auto it = seen.find(running - k);
        if (it != seen.end()) count += it->second;
        seen[running]++;
    }
    return count;
}

// 2D prefix sums
std::vector<std::vector<long long>> build2D(const std::vector<std::vector<int>>& g) {
    int m = g.size(), n = g[0].size();
    std::vector<std::vector<long long>> s(m + 1, std::vector<long long>(n + 1, 0));
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++)
            s[r+1][c+1] = g[r][c] + s[r][c+1] + s[r+1][c] - s[r][c];
    return s;
}

long long rectSum(const std::vector<std::vector<long long>>& s, int r1, int c1, int r2, int c2) {
    return s[r2+1][c2+1] - s[r1][c2+1] - s[r2+1][c1] + s[r1][c1];
}`;

const javascript = `// Build in O(n): P[i] = a[0] + ... + a[i-1], with one spare slot so P[0] = 0
function buildPrefix(a) {
  const p = new Array(a.length + 1).fill(0);
  for (let i = 0; i < a.length; i++) p[i + 1] = p[i] + a[i];
  return p;
}

// Query in O(1): the sum of a[l..r]
function rangeSum(p, l, r) {
  return p[r + 1] - p[l];
}

const a = [3, 1, 4, 1, 5, 9, 2, 6];
const p = buildPrefix(a);    // [0, 3, 4, 8, 9, 14, 23, 25, 31]
rangeSum(p, 2, 5);           // 4+1+5+9 = 19 = p[6] - p[2]


// Prefix sums + a hash map: how many subarrays sum to exactly k (LeetCode 560)
// sum of the subarray (i, j] = P[j] - P[i] = k  ⇔  P[i] = P[j] - k
// so on reaching j, ask how many earlier prefix sums equal P[j] - k
function subarraySum(nums, k) {
  let count = 0;
  const seen = new Map([[0, 1]]);   // prefix sum 0 has already occurred once (the empty prefix)
  let running = 0;
  for (const x of nums) {
    running += x;
    count += seen.get(running - k) ?? 0;
    seen.set(running, (seen.get(running) ?? 0) + 1);
  }
  return count;
}


// 2D prefix sums: S[r][c] is the total of the rectangle from the top-left corner to (r-1, c-1)
function build2d(grid) {
  const m = grid.length, n = grid[0].length;
  const s = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      s[r + 1][c + 1] = grid[r][c] + s[r][c + 1] + s[r + 1][c] - s[r][c];
    }
  }
  return s;
}

function rectSum(s, r1, c1, r2, c2) {    // top-left (r1,c1) to bottom-right (r2,c2)
  return s[r2 + 1][c2 + 1] - s[r1][c2 + 1] - s[r2 + 1][c1] + s[r1][c1];
}`;

export const skeleton: LessonSkeleton = {
  demo: <PrefixSumDemo />,
  code: { python, cpp, javascript },
};
