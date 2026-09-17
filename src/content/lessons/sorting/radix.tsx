import { RadixSortDemo } from "@/components/lesson/demos/RadixSortDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `# LSD radix sort: non-negative integers. Lowest digit first, each pass a stable counting sort on one digit.
def radix_sort(a, base=10):
    if not a:
        return a
    exp, biggest = 1, max(a)
    while biggest // exp > 0:                # there is still a higher digit
        count = [0] * base
        for x in a:
            count[x // exp % base] += 1
        for d in range(1, base):
            count[d] += count[d - 1]
        out = [0] * len(a)
        for x in reversed(a):                # back to front: ties on this digit keep the last pass's order
            d = x // exp % base
            count[d] -= 1
            out[count[d]] = x
        a, exp = out, exp * base
    return a


# Fixed-length strings (phone numbers, dates): walk back from the last character, bucketing by character
def radix_sort_strings(words):
    for pos in range(len(words[0]) - 1, -1, -1):
        buckets = [[] for _ in range(128)]   # ASCII
        for w in words:
            buckets[ord(w[pos])].append(w)   # appended in the current order, so the pass stays stable
        words = [w for b in buckets for w in b]
    return words


# Bucket sort: roughly uniform floats in [0, 1). With n buckets, each one holds O(1) items on average.
def bucket_sort(xs):
    n = len(xs)
    buckets = [[] for _ in range(n)]
    for x in xs:
        buckets[min(int(x * n), n - 1)].append(x)   # bucket i covers [i/n, (i+1)/n)
    return [x for b in buckets for x in sorted(b)]  # each bucket is tiny; sort it, then concatenate


if __name__ == "__main__":
    print(radix_sort([52, 29, 91, 17, 73, 38, 84, 45, 24]))   # [17, 24, 29, 38, 45, 52, 73, 84, 91]
    print(radix_sort([170, 45, 75, 90, 802, 24, 2, 66], base=256))
    # [2, 24, 45, 66, 75, 90, 170, 802] (base 256: one byte per pass, so two passes finish it)
    print(radix_sort_strings(["0912", "0203", "0911", "0122", "0203"]))
    # ['0122', '0203', '0203', '0911', '0912']
    print(bucket_sort([0.78, 0.17, 0.39, 0.26, 0.72, 0.94, 0.21, 0.12, 0.23, 0.68]))
    # [0.12, 0.17, 0.21, 0.23, 0.26, 0.39, 0.68, 0.72, 0.78, 0.94]`;

const cpp = `#include <algorithm>
#include <cstdint>
#include <iostream>
#include <vector>

// LSD radix sort: 32-bit unsigned integers, 8 bits per pass (base 256), always 4 passes
void radixSort(std::vector<std::uint32_t>& a) {
    std::vector<std::uint32_t> buf(a.size());
    for (int shift = 0; shift < 32; shift += 8) {
        std::size_t start[257] = {};
        for (auto x : a) start[((x >> shift) & 0xFF) + 1]++;
        for (int d = 0; d < 256; d++) start[d + 1] += start[d];   // start[d]: where digit d's run begins
        for (auto x : a) buf[start[(x >> shift) & 0xFF]++] = x;  // fill each run front to back: stable
        a.swap(buf);                                             // after 4 passes the result is back in a
    }
}

// Bucket sort: roughly uniform floats in [0, 1)
std::vector<double> bucketSort(const std::vector<double>& xs) {
    std::size_t n = xs.size();
    std::vector<std::vector<double>> buckets(n);
    for (double x : xs)
        buckets[std::min(n - 1, static_cast<std::size_t>(x * n))].push_back(x);
    std::vector<double> out;
    out.reserve(n);
    for (auto& b : buckets) {
        std::sort(b.begin(), b.end());          // O(1) items per bucket on average, so this is near-free
        out.insert(out.end(), b.begin(), b.end());
    }
    return out;
}

int main() {
    std::vector<std::uint32_t> a = {3000000000u, 52, 29, 91, 17, 73, 38, 84, 45, 24, 65536};
    radixSort(a);
    for (auto x : a) std::cout << x << ' ';
    std::cout << '\\n';   // 17 24 29 38 45 52 73 84 91 65536 3000000000

    for (double x : bucketSort({0.78, 0.17, 0.39, 0.26, 0.72, 0.94, 0.21, 0.12, 0.23, 0.68}))
        std::cout << x << ' ';
    std::cout << '\\n';   // 0.12 0.17 0.21 0.23 0.26 0.39 0.68 0.72 0.78 0.94
}`;

export const skeleton: LessonSkeleton = {
  demo: <RadixSortDemo />,
  code: { python, cpp },
};
