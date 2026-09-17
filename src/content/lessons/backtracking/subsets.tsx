import { SubsetsDemo } from "@/components/lesson/demos/SubsetsDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `# Subsets (LeetCode 78): every element is either taken or skipped
def subsets(nums):
    ans = []
    path = []

    def dfs(i):
        if i == len(nums):            # every element has been decided
            ans.append(path[:])       # copy it: path keeps changing afterwards
            return
        path.append(nums[i])          # make a choice: take nums[i]
        dfs(i + 1)
        path.pop()                    # undo the choice
        dfs(i + 1)                    # the other branch: skip nums[i]

    dfs(0)
    return ans


# Another shape: each level decides who goes next, so every node is a subset
# start only lets you pick to the right, so [1, 2] and [2, 1] never both appear
def subsets_start(nums):
    ans = []
    path = []

    def dfs(start):
        ans.append(path[:])           # collect as soon as you enter a node
        for j in range(start, len(nums)):
            path.append(nums[j])
            dfs(j + 1)
            path.pop()

    dfs(0)
    return ans


# Subsets with duplicates (LeetCode 90): sort first, then skip repeated values within a level
def subsets_with_dup(nums):
    nums = sorted(nums)               # sorted() returns a new list, leaving the caller's input alone
    ans = []
    path = []

    def dfs(start):
        ans.append(path[:])
        for j in range(start, len(nums)):
            if j > start and nums[j] == nums[j - 1]:   # this value was already tried at this level
                continue
            path.append(nums[j])
            dfs(j + 1)
            path.pop()

    dfs(0)
    return ans


if __name__ == "__main__":
    print(subsets([1, 2, 3]))
    # [[1, 2, 3], [1, 2], [1, 3], [1], [2, 3], [2], [3], []]
    print(subsets_start([1, 2, 3]))
    # [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]
    print(subsets_with_dup([1, 2, 2]))
    # [[], [1], [1, 2], [1, 2, 2], [2], [2, 2]]`;

const cpp = `#include <vector>
#include <algorithm>

// Subsets: every element is either taken or skipped
void dfsPick(const std::vector<int>& nums, int i, std::vector<int>& path, std::vector<std::vector<int>>& ans) {
    if (i == (int)nums.size()) {      // every element has been decided
        ans.push_back(path);
        return;
    }
    path.push_back(nums[i]);          // make a choice: take nums[i]
    dfsPick(nums, i + 1, path, ans);
    path.pop_back();                  // undo the choice
    dfsPick(nums, i + 1, path, ans);  // the other branch: skip nums[i]
}

std::vector<std::vector<int>> subsets(const std::vector<int>& nums) {
    std::vector<std::vector<int>> ans;
    std::vector<int> path;
    dfsPick(nums, 0, path, ans);
    return ans;
}

// Another shape: each level decides who goes next; start only picks to the right, so every node is a subset
void dfsStart(const std::vector<int>& nums, int start, std::vector<int>& path, std::vector<std::vector<int>>& ans) {
    ans.push_back(path);              // collect as soon as you enter a node
    for (int j = start; j < (int)nums.size(); j++) {
        path.push_back(nums[j]);
        dfsStart(nums, j + 1, path, ans);
        path.pop_back();
    }
}

std::vector<std::vector<int>> subsetsStart(const std::vector<int>& nums) {
    std::vector<std::vector<int>> ans;
    std::vector<int> path;
    dfsStart(nums, 0, path, ans);
    return ans;
}

// With duplicates: sort first, then skip repeated values within a level
void dfsDup(const std::vector<int>& nums, int start, std::vector<int>& path, std::vector<std::vector<int>>& ans) {
    ans.push_back(path);              // collect as soon as you enter a node
    for (int j = start; j < (int)nums.size(); j++) {
        if (j > start && nums[j] == nums[j - 1]) continue;   // already tried this value at this level
        path.push_back(nums[j]);
        dfsDup(nums, j + 1, path, ans);
        path.pop_back();
    }
}

std::vector<std::vector<int>> subsetsWithDup(std::vector<int> nums) {
    std::sort(nums.begin(), nums.end());
    std::vector<std::vector<int>> ans;
    std::vector<int> path;
    dfsDup(nums, 0, path, ans);
    return ans;
}`;

export const skeleton: LessonSkeleton = {
  demo: <SubsetsDemo />,
  code: { python, cpp },
};
