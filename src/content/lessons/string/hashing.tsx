import { HashingDemo } from "@/components/lesson/demos/HashingDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

const python = `import random


class PrefixHash:
    """Polynomial prefix hashing: O(n) to build, then O(1) for any substring s[l:r]"""
    M = (1 << 61) - 1                   # Mersenne prime; Python ints never overflow, so use it directly
    B = random.randrange(256, M)        # random base: nobody can construct collisions ahead of time

    def __init__(self, s):
        n = len(s)
        self.h = [0] * (n + 1)          # h[i] = hash of s[:i]
        self.pw = [1] * (n + 1)         # pw[i] = B^i mod M
        for i, ch in enumerate(s):
            self.h[i + 1] = (self.h[i] * self.B + ord(ch)) % self.M   # code points are never 0
            self.pw[i + 1] = self.pw[i] * self.B % self.M

    def get(self, l, r):
        """Hash of s[l:r]: inside h[r] the first l characters were scaled by B^(r-l), so subtract that"""
        return (self.h[r] - self.h[l] * self.pw[r - l]) % self.M   # Python's % is never negative


def longest_duplicate(s):
    """Longest substring occurring at least twice (overlaps allowed). If length L repeats, so does L-1, so binary search the length"""
    ph = PrefixHash(s)

    def find(L):                        # a start index of some length-L substring seen twice, or -1
        seen = set()
        for i in range(len(s) - L + 1):
            x = ph.get(i, i + L)
            if x in seen:
                return i
            seen.add(x)
        return -1

    lo, hi, best = 1, len(s) - 1, ""
    while lo <= hi:                     # O(n) per guess, O(n log n) in total
        mid = (lo + hi) // 2
        i = find(mid)
        if i == -1:
            hi = mid - 1
        else:
            best, lo = s[i:i + mid], mid + 1
    return best


def java_hash(s):
    """Java's String.hashCode: fixed base 31, natural overflow (mod 2³²)"""
    x = 0
    for ch in s:
        x = (x * 31 + ord(ch)) & 0xFFFFFFFF
    return x


if __name__ == "__main__":
    ph = PrefixHash("abcabca")
    print(ph.get(0, 3) == ph.get(3, 6), ph.get(0, 3) == ph.get(1, 4))   # True False
    print(longest_duplicate("banana"), longest_duplicate("to be or not to be"))   # ana to be
    print(repr(longest_duplicate("abcd")))                              # ''
    print(java_hash("Aa"), java_hash("BB"), java_hash("AaBB"), java_hash("BBAa"))   # 2112 2112 2031744 2031744`;

const cpp = `#include <algorithm>
#include <chrono>
#include <cstddef>
#include <iostream>
#include <numeric>
#include <random>
#include <string>
#include <unordered_set>
#include <vector>

// Double hashing: two primes near 10⁹, so every product stays under 10¹⁸ and fits in 64 bits
const unsigned long long M1 = 1000000007ULL, M2 = 998244353ULL;
std::mt19937_64 rng(static_cast<unsigned long long>(std::chrono::steady_clock::now().time_since_epoch().count()));
const unsigned long long B1 = rng() % (M1 - 256) + 256, B2 = rng() % (M2 - 256) + 256;   // bases chosen at startup

struct PrefixHash {
    std::vector<unsigned long long> h1, h2, p1, p2;

    explicit PrefixHash(const std::string& s)
        : h1(s.size() + 1, 0), h2(s.size() + 1, 0), p1(s.size() + 1, 1), p2(s.size() + 1, 1) {
        for (std::size_t i = 0; i < s.size(); i++) {
            unsigned long long c = static_cast<unsigned char>(s[i]);
            h1[i + 1] = (h1[i] * B1 + c) % M1;
            h2[i + 1] = (h2[i] * B2 + c) % M2;
            p1[i + 1] = p1[i] * B1 % M1;
            p2[i + 1] = p2[i] * B2 % M2;
        }
    }

    // Hash of s[l, r), with both residues packed into one 64-bit integer. Add M before subtracting, or the unsigned value wraps around
    unsigned long long get(std::size_t l, std::size_t r) const {
        unsigned long long a = (h1[r] + M1 - h1[l] * p1[r - l] % M1) % M1;
        unsigned long long b = (h2[r] + M2 - h2[l] * p2[r - l] % M2) % M2;
        return a << 32 | b;
    }
};

// Longest substring occurring at least twice: binary search the length, dropping every length-L hash into a set
std::string longestDuplicate(const std::string& s) {
    PrefixHash ph(s);
    std::string best;
    std::size_t lo = 1, hi = s.empty() ? 0 : s.size() - 1;
    while (lo <= hi) {
        std::size_t mid = (lo + hi) / 2, found = s.size();
        std::unordered_set<unsigned long long> seen;
        for (std::size_t i = 0; i + mid <= s.size(); i++)
            if (!seen.insert(ph.get(i, i + mid)).second) { found = i; break; }
        if (found == s.size()) hi = mid - 1;
        else { best = s.substr(found, mid); lo = mid + 1; }
    }
    return best;
}

// Longest common prefix of the suffixes s[i:] and s[j:]. "the first L characters match" is monotonic in L, so binary search it in O(log n)
std::size_t lcp(const PrefixHash& ph, std::size_t n, std::size_t i, std::size_t j) {
    std::size_t lo = 0, hi = n - std::max(i, j);
    while (lo < hi) {
        std::size_t mid = (lo + hi + 1) / 2;
        if (ph.get(i, i + mid) == ph.get(j, j + mid)) lo = mid;
        else hi = mid - 1;
    }
    return lo;
}

// Suffix sorting: comparing two suffixes = find their LCP, then compare the next character. O(log n) per comparison, O(n log² n) overall
std::vector<std::size_t> suffixArray(const std::string& s) {
    PrefixHash ph(s);
    std::size_t n = s.size();
    std::vector<std::size_t> sa(n);
    std::iota(sa.begin(), sa.end(), std::size_t{0});
    std::sort(sa.begin(), sa.end(), [&](std::size_t i, std::size_t j) {
        std::size_t k = lcp(ph, n, i, j);
        if (j + k == n) return false;       // s[j:] ran out, so it cannot be the larger one
        if (i + k == n) return true;        // s[i:] is a prefix of s[j:], and the shorter one sorts first
        return s[i + k] < s[j + k];
    });
    return sa;
}

int main() {
    PrefixHash ph("abcabca");
    std::cout << (ph.get(0, 3) == ph.get(3, 6)) << ' ' << (ph.get(0, 3) == ph.get(1, 4)) << '\\n';   // 1 0
    std::cout << longestDuplicate("banana") << '\\n';                  // ana
    for (std::size_t i : suffixArray("banana")) std::cout << i << ' ';   // 5 3 1 0 4 2
    std::cout << '\\n';
}`;

export const skeleton: LessonSkeleton = {
  demo: <HashingDemo />,
  code: { python, cpp },
};
