import { LinearSearchDemo } from "@/components/lesson/demos/LinearSearchDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

const python = `# Linear search: scan from the front, return the index on a hit, -1 otherwise
def linear_search(nums, target):
    for i, x in enumerate(nums):
        if x == target:
            return i
    return -1


# Variant 1: return every position that satisfies a condition (passed in as a function)
# With an arbitrary predicate every element must be checked, so O(n) is already optimal
def find_all(items, pred):
    return [i for i, x in enumerate(items) if pred(x)]


# Variant 2: the sentinel. Park the target at the end so a hit is guaranteed,
# which saves one i < n bounds check per iteration of the loop
# This is a trick for languages like C; in Python it is usually slower than the for loop above
def sentinel_search(nums, target):
    n = len(nums)
    nums.append(target)                 # the sentinel (temporarily mutates nums)
    i = 0
    while nums[i] != target:
        i += 1
    nums.pop()                          # restore
    return i if i < n else -1           # stopped on the sentinel = it was never there


if __name__ == "__main__":
    data = [17, 4, 29, 8, 51, 23, 12, 46, 3, 35]
    print(linear_search(data, 46))                 # 7
    print(linear_search(data, 40))                 # -1
    print(find_all(data, lambda x: x % 2 == 0))    # [1, 3, 6, 7]
    print(sentinel_search(data, 46))               # 7
    print(sentinel_search(data, 40), len(data))    # -1 10 (sentinel already removed)
    # The built-in in and list.index are linear searches too; index raises ValueError on a miss
    print(40 in data, data.index(46))              # False 7`;

const cpp = `#include <vector>
#include <iostream>
#include <functional>
#include <algorithm>

// Linear search: return the index on a hit, -1 otherwise
int linearSearch(const std::vector<int>& nums, int target) {
    for (int i = 0; i < (int)nums.size(); i++) {
        if (nums[i] == target) return i;
    }
    return -1;
}

// Variant 1: return every position that satisfies the condition
std::vector<int> findAll(const std::vector<int>& items, const std::function<bool(int)>& pred) {
    std::vector<int> out;
    for (int i = 0; i < (int)items.size(); i++) {
        if (pred(items[i])) out.push_back(i);
    }
    return out;
}

// Variant 2: the sentinel — no bounds check inside the loop, restored before returning
// Taken by reference: copying the whole vector would cost O(n) and eat every comparison saved
int sentinelSearch(std::vector<int>& nums, int target) {
    int n = (int)nums.size();
    nums.push_back(target);              // the sentinel guarantees a hit
    int i = 0;
    while (nums[i] != target) i++;
    nums.pop_back();                     // restore
    return i < n ? i : -1;               // stopped on the sentinel = it was never there
}

int main() {
    std::vector<int> data = {17, 4, 29, 8, 51, 23, 12, 46, 3, 35};
    std::cout << linearSearch(data, 46) << "\\n";        // 7
    std::cout << linearSearch(data, 40) << "\\n";        // -1
    for (int i : findAll(data, [](int x) { return x % 2 == 0; })) std::cout << i << " ";  // 1 3 6 7
    std::cout << "\\n" << sentinelSearch(data, 46) << "\\n";  // 7
    std::cout << sentinelSearch(data, 40) << "\\n";      // -1
    std::cout << data.size() << "\\n";                   // 10 (sentinel already removed)
    // The STL's std::find is a linear search too: it returns an iterator, or end() on a miss
    auto it = std::find(data.begin(), data.end(), 46);
    std::cout << (it - data.begin()) << "\\n";           // 7
}`;

export const skeleton: LessonSkeleton = {
  demo: <LinearSearchDemo />,
  code: { python, cpp },
};
