import { CallStackDemo } from "@/components/lesson/demos/CallStackDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `def factorial(n):
    if n == 1:                      # base case: the smallest problem, answered outright
        return 1
    return n * factorial(n - 1)     # recursive case: hand it to a smaller copy of yourself


def total(items):
    # Sum of a list: the first element + the sum of the rest
    if not items:
        return 0
    return items[0] + total(items[1:])


def folder_size(folder):
    # Folder size = every file in it + every subfolder in it
    size = sum(f.size for f in folder.files)
    for sub in folder.subfolders:
        size += folder_size(sub)    # a subfolder has exactly the same shape as this folder
    return size


def factorial_iter(n):
    # The iterative version of the same thing: no call stack, O(1) space
    result = 1
    for k in range(2, n + 1):
        result *= k
    return result`;

const cpp = `#include <vector>

long long factorial(int n) {
    if (n == 1) return 1;               // base case
    return n * factorial(n - 1);        // recursive case
}

long long total(const std::vector<int>& items, size_t i = 0) {
    if (i == items.size()) return 0;    // reached the end
    return items[i] + total(items, i + 1);
}

struct Folder {
    std::vector<long long> fileSizes;
    std::vector<Folder> subfolders;
};

long long folderSize(const Folder& f) {
    long long size = 0;
    for (long long s : f.fileSizes) size += s;
    for (const Folder& sub : f.subfolders) size += folderSize(sub);
    return size;
}

long long factorialIter(int n) {
    long long r = 1;
    for (int k = 2; k <= n; k++) r *= k;
    return r;
}`;

export const skeleton: LessonSkeleton = {
  demo: <CallStackDemo />,
  code: { python, cpp },
};
