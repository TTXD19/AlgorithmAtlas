import { BubbleSortDemo } from "@/components/lesson/demos/BubbleSortDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `# Bubble sort: compare neighbouring cells and swap the bigger one to the right.
# After each pass, that pass's largest element has been pushed to the end.
def bubble_sort(a):
    n = len(a)
    for i in range(n - 1):
        swapped = False
        for j in range(n - 1 - i):          # the last i cells are settled, skip them
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        if not swapped:                      # a whole pass with no swap means it is sorted
            break
    return a


# Variant: cocktail sort (bidirectional bubble).
# One pass pushes the largest right, the next pushes the smallest left. Far quicker when a
# small value is stuck at the end (a "turtle"), but still O(n²) at worst: on a fully reversed
# input it makes exactly as many comparisons as bubble sort.
def cocktail_sort(a):
    lo, hi = 0, len(a) - 1
    while lo < hi:
        swapped = False
        for j in range(lo, hi):             # push the largest right
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        hi -= 1
        for j in range(hi, lo, -1):         # push the smallest left
            if a[j - 1] > a[j]:
                a[j - 1], a[j] = a[j], a[j - 1]
                swapped = True
        lo += 1
        if not swapped:
            break
    return a


if __name__ == "__main__":
    print(bubble_sort([5, 2, 9, 1, 7, 3, 8, 4]))     # [1, 2, 3, 4, 5, 7, 8, 9]
    print(cocktail_sort([5, 2, 9, 1, 7, 3, 8, 4]))   # [1, 2, 3, 4, 5, 7, 8, 9]`;

const cpp = `#include <vector>
#include <utility>
#include <iostream>

// Bubble sort: compare neighbours, swap the bigger one right, stop early on a pass with no swap
void bubbleSort(std::vector<int>& a) {
    int n = (int)a.size();
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - 1 - i; j++) {   // the last i cells are settled
            if (a[j] > a[j + 1]) {
                std::swap(a[j], a[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;                    // already sorted
    }
}

// Variant: cocktail sort (bidirectional bubble)
void cocktailSort(std::vector<int>& a) {
    int lo = 0, hi = (int)a.size() - 1;
    while (lo < hi) {
        bool swapped = false;
        for (int j = lo; j < hi; j++)           // push the largest right
            if (a[j] > a[j + 1]) { std::swap(a[j], a[j + 1]); swapped = true; }
        hi--;
        for (int j = hi; j > lo; j--)           // push the smallest left
            if (a[j - 1] > a[j]) { std::swap(a[j - 1], a[j]); swapped = true; }
        lo++;
        if (!swapped) break;
    }
}

int main() {
    std::vector<int> a = {5, 2, 9, 1, 7, 3, 8, 4};
    bubbleSort(a);
    for (int x : a) std::cout << x << ' ';      // 1 2 3 4 5 7 8 9
    std::cout << '\\n';

    // 1 is the "turtle": bubble sort needs all 7 passes, cocktail sort sends it to the front in one round trip
    std::vector<int> b = {2, 3, 4, 5, 7, 8, 9, 1};
    cocktailSort(b);
    for (int x : b) std::cout << x << ' ';      // 1 2 3 4 5 7 8 9
    std::cout << '\\n';
}`;

export const skeleton: LessonSkeleton = {
  demo: <BubbleSortDemo />,
  code: { python, cpp },
};
