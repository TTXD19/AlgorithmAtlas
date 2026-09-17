import { CountingBitsDemo } from "@/components/lesson/demos/CountingBitsDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `def popcount_naive(n):
    """Bit by bit: look at the lowest bit, then shift right. Iterations = the bit length"""
    n &= 0xFFFFFFFF                     # treat it as 32-bit unsigned, so negatives do not loop forever
    count = 0
    while n:
        count += n & 1
        n >>= 1
    return count


def popcount(n):
    """Brian Kernighan: clear the lowest set bit each time. Iterations = the number of 1s"""
    n &= 0xFFFFFFFF
    count = 0
    while n:
        n &= n - 1                      # clears the lowest set bit, higher bits untouched
        count += 1
    return count


def count_bits(n):
    """The number of 1s in every value from 0 to n (LeetCode 338). O(n)"""
    bits = [0] * (n + 1)
    for i in range(1, n + 1):
        bits[i] = bits[i & (i - 1)] + 1  # i & (i-1) is smaller and has one 1 fewer, so it is already filled in
        # another recurrence: bits[i] = bits[i >> 1] + (i & 1)
    return bits


def total_hamming_distance(nums):
    """Total Hamming distance over every pair (LeetCode 477). Count per bit, O(32n)"""
    n, total = len(nums), 0
    for b in range(32):
        ones = sum((x >> b) & 1 for x in nums)
        total += ones * (n - ones)      # on this bit, every 1 pairs with every 0
    return total


if __name__ == "__main__":
    print(popcount(181))                # 5 (10110101)
    print(popcount_naive(181))          # 5, but the loop ran 8 times
    print(popcount(0xFFFFFFC0))         # 26: the mask 255.255.255.192 is /26
    print(popcount(-1))                 # 32 (-1 is all 1s in 32-bit two's complement)
    print(popcount(1 ^ 4))              # 2: the Hamming distance between 1 and 4
    print(64 & 63 == 0)                 # True: a single 1 bit, so a power of two (in Python & binds tighter than ==)
    print(count_bits(8))                # [0, 1, 1, 2, 1, 2, 2, 3, 1]
    print(total_hamming_distance([4, 14, 2]))  # 6
    print((181).bit_count())            # 5 (built in since Python 3.10; before that, bin(181).count("1"))`;

const cpp = `#include <bitset>
#include <cstdint>
#include <iostream>
#include <vector>

// Bit by bit: look at the lowest bit, then shift right. Iterations = the bit length
int popcountNaive(std::uint32_t n) {
    int count = 0;
    while (n) {
        count += n & 1;
        n >>= 1;              // an unsigned shift fills with 0; a signed negative fills with 1 and never ends
    }
    return count;
}

// Brian Kernighan: clear the lowest set bit each time. Iterations = the number of 1s
int popcount(std::uint32_t n) {
    int count = 0;
    while (n) {
        n &= n - 1;           // clears the lowest set bit, higher bits untouched
        ++count;
    }
    return count;
}

// The number of 1s in every value from 0 to n (LeetCode 338). O(n)
std::vector<int> countBits(int n) {
    std::vector<int> bits(n + 1, 0);
    for (int i = 1; i <= n; ++i)
        bits[i] = bits[i & (i - 1)] + 1;   // bits[i >> 1] + (i & 1) works just as well
    return bits;
}

// Total Hamming distance over every pair (LeetCode 477). Count per bit, O(32n)
long long totalHammingDistance(const std::vector<int>& nums) {
    long long n = static_cast<long long>(nums.size()), total = 0;
    for (int b = 0; b < 32; ++b) {
        long long ones = 0;
        for (int x : nums) ones += (static_cast<std::uint32_t>(x) >> b) & 1;
        total += ones * (n - ones);        // on this bit, every 1 pairs with every 0
    }
    return total;
}

int main() {
    std::cout << popcount(181) << "\\n";                      // 5 (10110101)
    std::cout << popcountNaive(181) << "\\n";                 // 5, but the loop ran 8 times
    std::cout << popcount(0xFFFFFFC0u) << "\\n";              // 26: 255.255.255.192 is /26
    std::cout << popcount(static_cast<std::uint32_t>(-1)) << "\\n";  // 32
    std::cout << popcount(1 ^ 4) << "\\n";                    // 2: the Hamming distance between 1 and 4
    std::cout << ((64 & 63) == 0) << "\\n";                   // 1: a power of two. In C++ == binds tighter than &, so keep the parentheses
    for (int v : countBits(8)) std::cout << v << ' ';        // 0 1 1 2 1 2 2 3 1
    std::cout << "\\n" << totalHammingDistance({4, 14, 2}) << "\\n";  // 6
    // In practice, use a built-in: std::bitset, GCC/Clang's __builtin_popcount, C++20's std::popcount
    std::cout << std::bitset<32>(181).count() << "\\n";       // 5
}`;

export const skeleton: LessonSkeleton = {
  demo: <CountingBitsDemo />,
  code: { python, cpp },
};
