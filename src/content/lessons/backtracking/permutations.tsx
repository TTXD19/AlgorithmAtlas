import { PermutationsDemo } from "@/components/lesson/demos/PermutationsDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `# Permutations (LeetCode 46): the used array records who is already on the path
def permute(nums):
    ans = []
    path = []
    used = [False] * len(nums)

    def dfs():
        if len(path) == len(nums):        # every position is filled
            ans.append(path[:])
            return
        for j in range(len(nums)):
            if used[j]:                   # already on the path, skip it
                continue
            used[j] = True                # make the choice
            path.append(nums[j])
            dfs()
            path.pop()                    # undo the choice
            used[j] = False

    dfs()
    return ans


# Swap version: swap position i with every element from i onward; no used array, no path
def permute_swap(nums):
    ans = []

    def dfs(i):
        if i == len(nums):
            ans.append(nums[:])
            return
        for j in range(i, len(nums)):
            nums[i], nums[j] = nums[j], nums[i]   # choose: put nums[j] at position i
            dfs(i + 1)
            nums[i], nums[j] = nums[j], nums[i]   # undo: swap it back

    dfs(0)
    return ans


# Permutations with duplicates (LeetCode 47): sort first, then equal values must be used in order
def permute_unique(nums):
    nums = sorted(nums)                   # sort into a new list, leaving the caller's input alone
    ans = []
    path = []
    used = [False] * len(nums)

    def dfs():
        if len(path) == len(nums):
            ans.append(path[:])
            return
        for j in range(len(nums)):
            if used[j]:
                continue
            if j > 0 and nums[j] == nums[j - 1] and not used[j - 1]:
                continue                  # this value was already tried at this position
            used[j] = True
            path.append(nums[j])
            dfs()
            path.pop()
            used[j] = False

    dfs()
    return ans


if __name__ == "__main__":
    print(permute([1, 2, 3]))
    # [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]
    print(permute_swap([1, 2, 3]))       # the same 6, but the last two come in a different order
    # [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 2, 1], [3, 1, 2]]
    print(permute_unique([1, 1, 2]))
    # [[1, 1, 2], [1, 2, 1], [2, 1, 1]]`;

const cpp = `#include <vector>
#include <algorithm>

// Permutations: the used array
void dfsUsed(const std::vector<int>& nums, std::vector<bool>& used, std::vector<int>& path, std::vector<std::vector<int>>& ans) {
    if (path.size() == nums.size()) {     // every position is filled
        ans.push_back(path);
        return;
    }
    for (int j = 0; j < (int)nums.size(); j++) {
        if (used[j]) continue;            // already on the path
        used[j] = true;                   // make the choice
        path.push_back(nums[j]);
        dfsUsed(nums, used, path, ans);
        path.pop_back();                  // undo the choice
        used[j] = false;
    }
}

std::vector<std::vector<int>> permute(const std::vector<int>& nums) {
    std::vector<std::vector<int>> ans;
    std::vector<int> path;
    std::vector<bool> used(nums.size(), false);
    dfsUsed(nums, used, path, ans);
    return ans;
}

// Swap version: swap position i with every element after it
void dfsSwap(std::vector<int>& nums, int i, std::vector<std::vector<int>>& ans) {
    if (i == (int)nums.size()) { ans.push_back(nums); return; }
    for (int j = i; j < (int)nums.size(); j++) {
        std::swap(nums[i], nums[j]);      // make the choice
        dfsSwap(nums, i + 1, ans);
        std::swap(nums[i], nums[j]);      // undo it
    }
}

std::vector<std::vector<int>> permuteSwap(std::vector<int> nums) {
    std::vector<std::vector<int>> ans;
    dfsSwap(nums, 0, ans);
    return ans;
}

// With duplicates: after sorting, an equal value cannot be used unless the previous one was
void dfsUnique(const std::vector<int>& nums, std::vector<bool>& used, std::vector<int>& path, std::vector<std::vector<int>>& ans) {
    if (path.size() == nums.size()) { ans.push_back(path); return; }
    for (int j = 0; j < (int)nums.size(); j++) {
        if (used[j]) continue;
        if (j > 0 && nums[j] == nums[j - 1] && !used[j - 1]) continue;
        used[j] = true;
        path.push_back(nums[j]);
        dfsUnique(nums, used, path, ans);
        path.pop_back();
        used[j] = false;
    }
}

std::vector<std::vector<int>> permuteUnique(std::vector<int> nums) {
    std::sort(nums.begin(), nums.end());
    std::vector<std::vector<int>> ans;
    std::vector<int> path;
    std::vector<bool> used(nums.size(), false);
    dfsUnique(nums, used, path, ans);
    return ans;
}`;

export const skeleton: LessonSkeleton = {
  demo: <PermutationsDemo />,
  code: { python, cpp },
};
