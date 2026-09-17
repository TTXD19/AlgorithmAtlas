import { SubsetEnumDemo } from "@/components/lesson/demos/SubsetEnumDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `# Bit i set means element i is chosen: every integer from 0 to 2ⁿ−1 is exactly one subset
def subsets(items):
    n = len(items)
    out = []
    for mask in range(1 << n):                   # 2ⁿ masks
        out.append([items[i] for i in range(n) if mask >> i & 1])
    return out


# Application: skills[i] is person i's skill set as bits. Smallest team whose skills cover need.
def smallest_team(skills, need):
    n = len(skills)
    best = -1
    for mask in range(1 << n):
        have = 0
        for i in range(n):
            if mask >> i & 1:
                have |= skills[i]                # union is OR
        if (have & need) == need and (best == -1 or mask.bit_count() < best.bit_count()):
            best = mask                          # bit_count() is the size of the team
    if best == -1:
        return None                              # even everybody together falls short
    return [i for i in range(n) if best >> i & 1]


# Sum of every subset, O(2ⁿ): before bit i is added to mask, mask's own sum is already known
def subset_sums(nums):
    sums = [0] * (1 << len(nums))
    for i, x in enumerate(nums):
        for mask in range(1 << i):               # subsets of the first i elements only
            sums[mask | 1 << i] = sums[mask] + x
    return sums


# Every submask of mask, largest first, including mask itself and 0
def submasks(mask):
    sub = mask
    while True:
        yield sub
        if sub == 0:                             # stop after 0, else (0 - 1) & mask jumps back to mask
            break
        sub = (sub - 1) & mask                   # subtract 1, AND back with mask, next submask


if __name__ == "__main__":
    print(subsets(["A", "B", "C"]))
    # [[], ['A'], ['B'], ['A', 'B'], ['C'], ['A', 'C'], ['B', 'C'], ['A', 'B', 'C']]

    # bit 0 frontend, bit 1 backend, bit 2 database, bit 3 DevOps
    skills = [0b0011, 0b0100, 0b1100, 0b0001, 0b1010]
    print(smallest_team(skills, 0b1111))         # [0, 2]

    print(subset_sums([3, 5, 9]))                # [0, 3, 5, 8, 9, 12, 14, 17]
    print([format(s, "04b") for s in submasks(0b1011)])
    # ['1011', '1010', '1001', '1000', '0011', '0010', '0001', '0000']

    n = 5                                        # list the submasks of every mask: 3ⁿ in total
    print(sum(1 for mask in range(1 << n) for _ in submasks(mask)), 3 ** n)   # 243 243`;

const cpp = `#include <bitset>
#include <iostream>
#include <string>
#include <vector>

// Bit i set means element i is chosen: every integer from 0 to 2ⁿ−1 is exactly one subset
std::vector<std::string> subsets(const std::string& items) {
    int n = static_cast<int>(items.size());
    std::vector<std::string> out;
    for (int mask = 0; mask < (1 << n); mask++) {        // use 1LL << n once n ≥ 31
        std::string s;
        for (int i = 0; i < n; i++)
            if ((mask >> i) & 1) s += items[i];
        out.push_back(s);
    }
    return out;
}

// Application: smallest team whose skills cover need; returns its mask (-1 = impossible)
int smallestTeam(const std::vector<int>& skills, int need) {
    int n = static_cast<int>(skills.size()), best = -1;
    auto size = [](int m) { return std::bitset<32>(m).count(); };   // number of 1s = team size
    for (int mask = 0; mask < (1 << n); mask++) {
        int have = 0;
        for (int i = 0; i < n; i++)
            if ((mask >> i) & 1) have |= skills[i];       // union is OR
        // The parentheses are required: in C++ == binds tighter than &
        if ((have & need) == need && (best == -1 || size(mask) < size(best))) best = mask;
    }
    return best;
}

// Sum of every subset, O(2ⁿ): before bit i is added to mask, mask's own sum is already known
std::vector<long long> subsetSums(const std::vector<int>& nums) {
    int n = static_cast<int>(nums.size());
    std::vector<long long> sums(1 << n, 0);
    for (int i = 0; i < n; i++)
        for (int mask = 0; mask < (1 << i); mask++)      // subsets of the first i elements only
            sums[mask | (1 << i)] = sums[mask] + nums[i];
    return sums;
}

// Every submask of mask, largest first, including mask itself and 0
std::vector<int> submasks(int mask) {
    std::vector<int> out;
    for (int sub = mask; ; sub = (sub - 1) & mask) {     // subtract 1, then AND back with mask
        out.push_back(sub);
        if (sub == 0) break;                            // stop after 0, else it jumps back to mask
    }
    return out;
}

int main() {
    for (const std::string& s : subsets("ABC")) std::cout << '{' << s << "} ";
    std::cout << "\\n";                                  // {} {A} {B} {AB} {C} {AC} {BC} {ABC}

    // bit 0 frontend, bit 1 backend, bit 2 database, bit 3 DevOps
    std::vector<int> skills = {0b0011, 0b0100, 0b1100, 0b0001, 0b1010};
    std::cout << std::bitset<5>(smallestTeam(skills, 0b1111)) << "\\n";   // 00101 (people 0 and 2)

    for (long long s : subsetSums({3, 5, 9})) std::cout << s << ' ';
    std::cout << "\\n";                                  // 0 3 5 8 9 12 14 17

    for (int sub : submasks(0b1011)) std::cout << std::bitset<4>(sub) << ' ';
    std::cout << "\\n";                                  // 1011 1010 1001 1000 0011 0010 0001 0000

    int n = 5, total = 0;                               // list the submasks of every mask
    for (int mask = 0; mask < (1 << n); mask++) total += static_cast<int>(submasks(mask).size());
    std::cout << total << "\\n";                         // 243 = 3⁵
}`;

export const skeleton: LessonSkeleton = {
  demo: <SubsetEnumDemo />,
  code: { python, cpp },
};
