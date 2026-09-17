import { CombinationsDemo } from "@/components/lesson/demos/CombinationsDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `# Combination Sum (LeetCode 39): every number may be reused to reach target
def combination_sum(candidates, target):
    candidates = sorted(candidates)         # sorting is what makes pruning possible (a new list, so the caller's input is untouched)
    ans = []
    path = []

    def dfs(start, remain):
        if remain == 0:                     # hit the target exactly
            ans.append(path[:])
            return
        for i in range(start, len(candidates)):
            if candidates[i] > remain:      # prune: everything to the right is larger, so end the loop
                break
            path.append(candidates[i])      # make a choice
            dfs(i, remain - candidates[i])  # reusable, so the next level still starts at i
            path.pop()                      # undo the choice

    dfs(0, target)
    return ans


# Combinations C(n, k) (LeetCode 77): choose k of 1..n. Prune when too few numbers are left to fill the rest
def combine(n, k):
    ans = []
    path = []

    def dfs(start):
        if len(path) == k:
            ans.append(path[:])
            return
        need = k - len(path)                # how many more to choose
        for i in range(start, n - need + 2):   # from i onward, at least need numbers must remain
            path.append(i)
            dfs(i + 1)                      # each number is used once, so the next level starts at i+1
            path.pop()

    dfs(1)
    return ans


# Combination Sum II (LeetCode 40): each number is used once, and the input has duplicates
def combination_sum2(candidates, target):
    candidates = sorted(candidates)
    ans = []
    path = []

    def dfs(start, remain):
        if remain == 0:
            ans.append(path[:])
            return
        for i in range(start, len(candidates)):
            if candidates[i] > remain:
                break
            if i > start and candidates[i] == candidates[i - 1]:
                continue                    # skip a repeated value at the same level
            path.append(candidates[i])
            dfs(i + 1, remain - candidates[i])
            path.pop()

    dfs(0, target)
    return ans


if __name__ == "__main__":
    print(combination_sum([2, 3, 6, 7], 7))         # [[2, 2, 3], [7]]
    print(combine(4, 2))                            # [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]]
    print(combination_sum2([10, 1, 2, 7, 6, 1, 5], 8))
    # [[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]] (the two 1s produce [1, 7] only once)`;

const cpp = `#include <vector>
#include <algorithm>

// Combination Sum: every number may be reused
void dfsSum(const std::vector<int>& c, int start, int remain, std::vector<int>& path, std::vector<std::vector<int>>& ans) {
    if (remain == 0) { ans.push_back(path); return; }      // hit the target exactly
    for (int i = start; i < (int)c.size(); i++) {
        if (c[i] > remain) break;         // prune: sorted, so everything to the right is larger
        path.push_back(c[i]);             // make a choice
        dfsSum(c, i, remain - c[i], path, ans);   // reusable, so still start at i
        path.pop_back();                  // undo the choice
    }
}

std::vector<std::vector<int>> combinationSum(std::vector<int> candidates, int target) {
    std::sort(candidates.begin(), candidates.end());
    std::vector<std::vector<int>> ans;
    std::vector<int> path;
    dfsSum(candidates, 0, target, path, ans);
    return ans;
}

// Combinations C(n, k): stop when too few numbers are left to fill the rest
void dfsCombine(int n, int k, int start, std::vector<int>& path, std::vector<std::vector<int>>& ans) {
    if ((int)path.size() == k) { ans.push_back(path); return; }
    int need = k - (int)path.size();
    for (int i = start; i <= n - need + 1; i++) {
        path.push_back(i);
        dfsCombine(n, k, i + 1, path, ans);   // each number is used once
        path.pop_back();
    }
}

std::vector<std::vector<int>> combine(int n, int k) {
    std::vector<std::vector<int>> ans;
    std::vector<int> path;
    dfsCombine(n, k, 1, path, ans);
    return ans;
}

// Combination Sum II: each number is used once, and the input has duplicates
void dfsSum2(const std::vector<int>& c, int start, int remain, std::vector<int>& path, std::vector<std::vector<int>>& ans) {
    if (remain == 0) { ans.push_back(path); return; }
    for (int i = start; i < (int)c.size(); i++) {
        if (c[i] > remain) break;
        if (i > start && c[i] == c[i - 1]) continue;   // skip a repeated value at the same level
        path.push_back(c[i]);
        dfsSum2(c, i + 1, remain - c[i], path, ans);
        path.pop_back();
    }
}

std::vector<std::vector<int>> combinationSum2(std::vector<int> candidates, int target) {
    std::sort(candidates.begin(), candidates.end());
    std::vector<std::vector<int>> ans;
    std::vector<int> path;
    dfsSum2(candidates, 0, target, path, ans);
    return ans;
}`;

export const skeleton: LessonSkeleton = {
  demo: <CombinationsDemo />,
  code: { python, cpp },
};
