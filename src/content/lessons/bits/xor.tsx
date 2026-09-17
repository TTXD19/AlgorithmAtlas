import { XorTricksDemo } from "@/components/lesson/demos/XorTricksDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `def single_number(nums):
    """Every other value appears twice; find the one that appears once. O(n) time, O(1) space"""
    acc = 0
    for x in nums:
        acc ^= x                  # pairs cancel each other out: x ^ x = 0
    return acc                    # what is left is the odd one out: 0 ^ a = a


def missing_number(nums):
    """nums holds 0..n with one value missing (length n); find the missing one"""
    acc = len(nums)               # n has no matching index, so seed it in first
    for i, x in enumerate(nums):
        acc ^= i ^ x              # XOR in the expected i and the actual x
    return acc                    # present values appear twice and cancel; the gap remains


def two_single_numbers(nums):
    """Exactly two values a != b appear once; every other value appears twice"""
    diff = single_number(nums)    # pairs cancel, leaving a ^ b, which is never 0
    low = diff & -diff            # lowest set bit: a and b differ on this bit
    a = 0
    for x in nums:
        if x & low:               # split on that bit; equal values always land together
            a ^= x                # a is the only unpaired value in this group
    return sorted([a, diff ^ a])  # the other one is (a ^ b) ^ a = b


if __name__ == "__main__":
    print(single_number([5, 3, 9, 3, 5, 12, 9]))         # 12 (same values as the demo)
    print(missing_number([3, 0, 1]))                     # 2
    print(missing_number([9, 6, 4, 2, 3, 5, 7, 0, 1]))   # 8
    print(two_single_numbers([1, 2, 1, 3, 2, 5]))        # [3, 5]
    print(two_single_numbers([-4, 7, 7, 6]))             # [-4, 6] (negatives work too)

    a, b = 5, 9                   # swap with no temporary (Python would normally write a, b = b, a)
    a ^= b                        # a = 5 ^ 9 = 12
    b ^= a                        # b = 9 ^ 12 = 5
    a ^= b                        # a = 12 ^ 5 = 9
    print(a, b)                   # 9 5`;

const cpp = `#include <iostream>
#include <utility>
#include <vector>

// Every other value appears twice; find the one that appears once
int singleNumber(const std::vector<int>& nums) {
    int acc = 0;
    for (int x : nums) acc ^= x;        // x ^ x = 0, so pairs cancel each other out
    return acc;
}

// nums holds 0..n with one value missing (length n)
int missingNumber(const std::vector<int>& nums) {
    int n = (int)nums.size();
    int acc = n;                         // n has no matching index, so seed it in first
    for (int i = 0; i < n; i++) acc ^= i ^ nums[i];
    return acc;
}

// Exactly two values appear once and the rest appear twice; returns (smaller, larger)
std::pair<int, int> twoSingleNumbers(const std::vector<int>& nums) {
    unsigned diff = 0;
    for (int x : nums) diff ^= (unsigned)x;          // diff = a ^ b
    unsigned low = diff & (~diff + 1);               // lowest set bit; unsigned avoids the -INT_MIN overflow
    unsigned a = 0;
    for (int x : nums)
        if (((unsigned)x & low) != 0) a ^= (unsigned)x;  // the parens are required: != binds tighter than &
    int p = (int)a, q = (int)(diff ^ a);
    return p < q ? std::make_pair(p, q) : std::make_pair(q, p);
}

// XOR swap: if a and b are the same variable, the first step a ^= a clears it to 0
void xorSwap(int& a, int& b) {
    if (&a == &b) return;
    a ^= b;                              // a = a ^ b
    b ^= a;                              // b = b ^ (a ^ b) = the original a
    a ^= b;                              // a = (a ^ b) ^ a = the original b
}

int main() {
    std::cout << singleNumber({5, 3, 9, 3, 5, 12, 9}) << "\\n";        // 12
    std::cout << missingNumber({9, 6, 4, 2, 3, 5, 7, 0, 1}) << "\\n";  // 8
    auto [p, q] = twoSingleNumbers({1, 2, 1, 3, 2, 5});
    std::cout << p << " " << q << "\\n";                               // 3 5

    int a = 5, b = 9;
    xorSwap(a, b);
    std::cout << a << " " << b << "\\n";                               // 9 5
    std::vector<int> v = {7, 8};
    xorSwap(v[0], v[0]);                 // same slot: without the check this would become 0
    std::cout << v[0] << "\\n";                                        // 7
}`;

export const skeleton: LessonSkeleton = {
  demo: <XorTricksDemo />,
  code: { python, cpp },
};
