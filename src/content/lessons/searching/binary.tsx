import { BinarySearchDemo } from "@/components/lesson/demos/BinarySearchDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `# Classic version: closed interval [lo, hi]. Returns the index of any matching target, -1 if absent.
def binary_search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:                        # closed interval: lo == hi still leaves one element to check
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1                   # mid has been checked, rule it out
        else:
            hi = mid - 1
    return -1


# lower_bound: the first i with nums[i] >= target (n if there is none).
# Half-open interval [lo, hi). The answer ranges over 0..n, so hi starts at n.
def lower_bound(nums, target):
    lo, hi = 0, len(nums)
    while lo < hi:                         # half-open interval: lo == hi means the range is empty
        mid = (lo + hi) // 2
        if nums[mid] >= target:
            hi = mid                       # mid may be the answer, keep it in the range
        else:
            lo = mid + 1                   # mid definitely is not the answer
    return lo                              # lo == hi by now


# upper_bound: the first i with nums[i] > target. One equals sign away from the above.
def upper_bound(nums, target):
    lo, hi = 0, len(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > target:
            hi = mid
        else:
            lo = mid + 1
    return lo


# The two bounds answer the usual questions between them
def first_and_last(nums, target):          # LeetCode 34
    lo = lower_bound(nums, target)
    if lo == len(nums) or nums[lo] != target:
        return [-1, -1]
    return [lo, upper_bound(nums, target) - 1]


if __name__ == "__main__":
    a = [2, 5, 8, 8, 8, 13, 21, 34, 55, 89]
    print(binary_search(a, 8))     # 4 (any one of them)
    print(lower_bound(a, 8))       # 2
    print(upper_bound(a, 8))       # 5
    print(first_and_last(a, 8))    # [2, 4]
    print(lower_bound(a, 9))       # 5 (absent: the insertion point)
    # Built in: bisect.bisect_left is lower_bound, bisect_right is upper_bound`;

const cpp = `#include <vector>
#include <iostream>
#include <algorithm>

// Classic version: closed interval [lo, hi]
int binarySearch(const std::vector<int>& nums, int target) {
    int lo = 0, hi = (int)nums.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;      // keeps lo + hi from overflowing
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}

// lower_bound: the first i with nums[i] >= target, half-open interval [lo, hi)
int lowerBound(const std::vector<int>& nums, int target) {
    int lo = 0, hi = (int)nums.size();
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] >= target) hi = mid;  // mid may be the answer, keep it
        else lo = mid + 1;                  // mid definitely is not the answer
    }
    return lo;
}

// upper_bound: the first i with nums[i] > target
int upperBound(const std::vector<int>& nums, int target) {
    int lo = 0, hi = (int)nums.size();
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] > target) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}

int main() {
    std::vector<int> a = {2, 5, 8, 8, 8, 13, 21, 34, 55, 89};
    std::cout << binarySearch(a, 8) << "\\n";   // 4
    std::cout << lowerBound(a, 8) << "\\n";     // 2
    std::cout << upperBound(a, 8) << "\\n";     // 5
    std::cout << lowerBound(a, 9) << "\\n";     // 5 (absent: the insertion point)
    // The STL functions of the same name return iterators; subtract begin() for the index
    std::cout << (std::lower_bound(a.begin(), a.end(), 8) - a.begin()) << "\\n";  // 2
    std::cout << (std::upper_bound(a.begin(), a.end(), 8) - a.begin()) << "\\n";  // 5
}`;

export const skeleton: LessonSkeleton = {
  demo: <BinarySearchDemo />,
  code: { python, cpp },
};
