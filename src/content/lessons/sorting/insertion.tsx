import { InsertionSortDemo } from "@/components/lesson/demos/InsertionSortDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `from bisect import bisect_right


# Insertion sort: a[0..i-1] is already sorted. Lift a[i], shift everything larger one slot right, drop it in the hole.
def insertion_sort(a):
    for i in range(1, len(a)):
        key = a[i]                          # the card in hand; a[i] is now a hole
        j = i - 1
        while j >= 0 and a[j] > key:        # strictly greater, so equals never cross: stable
            a[j + 1] = a[j]                 # shift one slot right, the hole moves left
            j -= 1
        a[j + 1] = key                      # drop it into the hole
    return a


# Variant 1: binary insertion sort.
# Binary search finds the slot, so comparisons drop to O(n log n); the moves are still O(n²). Good when comparing is expensive.
def binary_insertion_sort(a):
    for i in range(1, len(a)):
        key = a[i]
        pos = bisect_right(a, key, 0, i)    # land to the right of equal elements: stable
        a[pos + 1:i + 1] = a[pos:i]         # shift the whole block one slot right
        a[pos] = key
    return a


# Variant 2: sort only a[lo..hi] (both ends inclusive).
# A hybrid sort calls this once a run gets small, instead of recursing further.
def insertion_sort_range(a, lo, hi):
    for i in range(lo + 1, hi + 1):
        key = a[i]
        j = i - 1
        while j >= lo and a[j] > key:       # the left bound is lo, not 0
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key


if __name__ == "__main__":
    print(insertion_sort([5, 2, 9, 1, 7, 3, 8, 4]))                  # [1, 2, 3, 4, 5, 7, 8, 9]
    print(binary_insertion_sort(["pear", "fig", "apple", "kiwi"]))  # ['apple', 'fig', 'kiwi', 'pear']
    b = [9, 8, 7, 6, 5, 4, 3, 2, 1]
    insertion_sort_range(b, 2, 6)                                    # sorts indices 2..6 only
    print(b)                                                         # [9, 8, 3, 4, 5, 6, 7, 2, 1]`;

const cpp = `#include <vector>
#include <string>
#include <algorithm>
#include <iostream>

// Insertion sort: lift a[i], shift everything larger one slot right, drop it in the hole.
void insertionSort(std::vector<int>& a) {
    for (int i = 1; i < (int)a.size(); i++) {
        int key = a[i];                         // the card in hand
        int j = i - 1;
        while (j >= 0 && a[j] > key) {          // test j >= 0 first, or you read a[-1]
            a[j + 1] = a[j];                    // shift one slot right
            j--;
        }
        a[j + 1] = key;                         // drop it into the hole
    }
}

// Variant 1: binary insertion sort. Only pays off for expensive types (strings, objects).
template <typename T>
void binaryInsertionSort(std::vector<T>& a) {
    for (auto it = a.begin(); it != a.end(); ++it) {
        auto pos = std::upper_bound(a.begin(), it, *it);  // equals go to the right: stable
        std::rotate(pos, it, it + 1);           // [pos, it) moves right one, *it lands on pos
    }
}

// Variant 2: sort only a[lo..hi]. A hybrid sort calls this on small runs.
void insertionSortRange(std::vector<int>& a, int lo, int hi) {
    for (int i = lo + 1; i <= hi; i++) {
        int key = a[i];
        int j = i - 1;
        while (j >= lo && a[j] > key) {         // the left bound is lo, not 0
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = key;
    }
}

int main() {
    std::vector<int> a = {5, 2, 9, 1, 7, 3, 8, 4};
    insertionSort(a);
    for (int x : a) std::cout << x << ' ';      // 1 2 3 4 5 7 8 9
    std::cout << '\\n';

    std::vector<std::string> w = {"pear", "fig", "apple", "kiwi"};
    binaryInsertionSort(w);
    for (auto& s : w) std::cout << s << ' ';    // apple fig kiwi pear
    std::cout << '\\n';

    std::vector<int> b = {9, 8, 7, 6, 5, 4, 3, 2, 1};
    insertionSortRange(b, 2, 6);                // sorts indices 2..6 only
    for (int x : b) std::cout << x << ' ';      // 9 8 3 4 5 6 7 2 1
    std::cout << '\\n';
}`;

export const skeleton: LessonSkeleton = {
  demo: <InsertionSortDemo />,
  code: { python, cpp },
};
