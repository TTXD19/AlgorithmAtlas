import { GrowthDemo } from "@/components/lesson/demos/GrowthDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `# O(1): the same amount of work no matter how big n is
def first(items):
    return items[0]

# O(n): the loop runs n times
def total(items):
    s = 0
    for x in items:
        s += x
    return s

# O(n²): two nested loops, each running n times
def has_duplicate_slow(items):
    n = len(items)
    for i in range(n):
        for j in range(i + 1, n):
            if items[i] == items[j]:
                return True
    return False

# O(n): a hash set replaces the inner loop, taking space from O(1) to O(n)
def has_duplicate(items):
    seen = set()
    for x in items:
        if x in seen:
            return True
        seen.add(x)
    return False

# O(log n): every step halves the range
def binary_search(sorted_items, target):
    lo, hi = 0, len(sorted_items) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if sorted_items[mid] == target:
            return mid
        if sorted_items[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`;

const cpp = `#include <vector>
#include <unordered_set>

// O(1)
int first(const std::vector<int>& v) { return v[0]; }

// O(n)
long long total(const std::vector<int>& v) {
    long long s = 0;
    for (int x : v) s += x;
    return s;
}

// O(n²)
bool hasDuplicateSlow(const std::vector<int>& v) {
    for (size_t i = 0; i < v.size(); i++)
        for (size_t j = i + 1; j < v.size(); j++)
            if (v[i] == v[j]) return true;
    return false;
}

// O(n) time, O(n) space
bool hasDuplicate(const std::vector<int>& v) {
    std::unordered_set<int> seen;
    for (int x : v) {
        if (seen.count(x)) return true;
        seen.insert(x);
    }
    return false;
}

// O(log n)
int binarySearch(const std::vector<int>& v, int target) {
    int lo = 0, hi = (int)v.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (v[mid] == target) return mid;
        if (v[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}`;

export const skeleton: LessonSkeleton = {
  demo: <GrowthDemo />,
  code: { python, cpp },
};
