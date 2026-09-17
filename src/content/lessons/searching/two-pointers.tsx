import { TwoPointersDemo } from "@/components/lesson/demos/TwoPointersDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `# Converging pointers: two sum on a sorted array, returning 0-based indices
# (LeetCode 167 wants them 1-based, so add 1 to each before submitting)
def two_sum_sorted(nums, target):
    l, r = 0, len(nums) - 1
    while l < r:
        s = nums[l] + nums[r]
        if s == target:
            return [l, r]
        if s < target:
            l += 1                         # nums[l] falls short even with the largest partner, so drop it
        else:
            r -= 1                         # nums[r] overshoots even with the smallest partner, so drop it
    return [-1, -1]


# Same-direction pointers: remove duplicates from a sorted array in place (LeetCode 26), returning the new length
# w is the next slot to write to; r does the reading
def remove_duplicates(nums):
    if not nums:
        return 0
    w = 1
    for r in range(1, len(nums)):
        if nums[r] != nums[w - 1]:         # only a value unlike the last one kept is new
            nums[w] = nums[r]
            w += 1
    return w                               # nums[:w] is the result


# Another classic for converging pointers: 3Sum (LeetCode 15)
# Sort, pin one value, and squeeze the remaining two with a two-sum scan
def three_sum(nums):
    nums.sort()
    out = []
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue                       # skip a repeated first value
        l, r = i + 1, len(nums) - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if s < 0:
                l += 1
            elif s > 0:
                r -= 1
            else:
                out.append([nums[i], nums[l], nums[r]])
                l += 1
                r -= 1
                while l < r and nums[l] == nums[l - 1]:
                    l += 1                 # skip a repeated second value
    return out


if __name__ == "__main__":
    print(two_sum_sorted([2, 3, 5, 8, 11, 14, 17, 21], 25))   # [3, 6]
    a = [1, 1, 2, 2, 2, 3, 5, 5, 6, 6]
    n = remove_duplicates(a)
    print(a[:n])                                              # [1, 2, 3, 5, 6]
    print(three_sum([-1, 0, 1, 2, -1, -4]))                   # [[-1, -1, 2], [-1, 0, 1]]`;

const cpp = `#include <vector>
#include <iostream>
#include <algorithm>

// Converging pointers: two sum on a sorted array, returning 0-based indices
std::vector<int> twoSumSorted(const std::vector<int>& nums, int target) {
    int l = 0, r = (int)nums.size() - 1;
    while (l < r) {
        long long s = (long long)nums[l] + nums[r];   // adding two large ints can overflow
        if (s == target) return {l, r};
        if (s < target) l++;               // drop nums[l]
        else r--;                          // drop nums[r]
    }
    return {-1, -1};
}

// Same-direction pointers: remove duplicates in place, returning the new length
int removeDuplicates(std::vector<int>& nums) {
    if (nums.empty()) return 0;
    int w = 1;
    for (int r = 1; r < (int)nums.size(); r++) {
        if (nums[r] != nums[w - 1]) nums[w++] = nums[r];
    }
    return w;
}

// 3Sum: pin one value and squeeze the other two
std::vector<std::vector<int>> threeSum(std::vector<int> nums) {
    std::sort(nums.begin(), nums.end());
    std::vector<std::vector<int>> out;
    int n = (int)nums.size();
    for (int i = 0; i + 2 < n; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        int l = i + 1, r = n - 1;
        while (l < r) {
            long long s = (long long)nums[i] + nums[l] + nums[r];
            if (s < 0) l++;
            else if (s > 0) r--;
            else {
                out.push_back({nums[i], nums[l], nums[r]});
                l++; r--;
                while (l < r && nums[l] == nums[l - 1]) l++;
            }
        }
    }
    return out;
}

int main() {
    auto p = twoSumSorted({2, 3, 5, 8, 11, 14, 17, 21}, 25);
    std::cout << p[0] << " " << p[1] << "\\n";                 // 3 6
    std::vector<int> a = {1, 1, 2, 2, 2, 3, 5, 5, 6, 6};
    int n = removeDuplicates(a);
    for (int i = 0; i < n; i++) std::cout << a[i] << " ";     // 1 2 3 5 6
    std::cout << "\\n";
    for (auto& t : threeSum({-1, 0, 1, 2, -1, -4})) std::cout << t[0] << "," << t[1] << "," << t[2] << "  ";
    std::cout << "\\n";                                        // -1,-1,2  -1,0,1
}`;

export const skeleton: LessonSkeleton = {
  demo: <TwoPointersDemo />,
  code: { python, cpp },
};
