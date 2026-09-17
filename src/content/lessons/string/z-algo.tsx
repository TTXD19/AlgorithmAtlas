import { ZAlgoDemo } from "@/components/lesson/demos/ZAlgoDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

const python = `def z_function(s):
    """z[i]: the length of the longest common prefix of s and s[i:]. O(n)"""
    n = len(s)
    z = [0] * n
    if n:
        z[0] = n
    l = r = 0                                   # window [l, r]: s[l..r] matches s[0..r-l]
    for i in range(1, n):
        if i <= r:
            z[i] = min(z[i - l], r - i + 1)     # copy the mirror, but borrow no further than the window edge
        while i + z[i] < n and s[z[i]] == s[i + z[i]]:
            z[i] += 1                           # past the window there is nothing to reuse, so compare directly
        if z[i] and i + z[i] - 1 > r:           # only move the window when the right end reaches further
            l, r = i, i + z[i] - 1
    return z


def z_search(text, pat):
    """Run Z over pat + separator + text; every value equal to m is one occurrence"""
    m = len(pat)
    if m == 0:
        return []
    z = z_function(pat + "\\0" + text)          # the separator is in neither string, so no Z value exceeds m
    return [i - m - 1 for i in range(m + 1, len(z)) if z[i] == m]


def almost_match(text, pat):
    """Occurrences with at most one wrong character: a match from the front, b from the back, a + b >= m - 1"""
    n, m = len(text), len(pat)
    if m == 0 or m > n:
        return []
    front = z_function(pat + "\\0" + text)
    back = z_function(pat[::-1] + "\\0" + text[::-1])   # a prefix of the reversal is a suffix of the original
    res = []
    for i in range(n - m + 1):
        a = front[m + 1 + i]                    # how many characters text[i:] shares with pat from the front
        b = back[m + 1 + (n - i - m)]           # how many characters text[i:i+m] shares with pat from the back
        if a + b >= m - 1:
            res.append(i)
    return res


if __name__ == "__main__":
    print(z_function("aabcaabcaab"))            # [11, 1, 0, 0, 7, 1, 0, 0, 3, 1, 0]
    print(z_search("abracadabra", "abra"))      # [0, 7]
    print(almost_match("ACGTTACGAACGT", "ACGT"))   # [0, 5, 9]: position 5 is ACGA, one mismatch`;

const cpp = `#include <algorithm>
#include <cstddef>
#include <iostream>
#include <string>
#include <vector>

std::vector<std::size_t> zFunction(const std::string& s) {
    std::size_t n = s.size();
    std::vector<std::size_t> z(n, 0);
    if (n) z[0] = n;
    std::size_t l = 0, r = 0;                                   // window [l, r]
    for (std::size_t i = 1; i < n; i++) {
        if (i <= r) z[i] = std::min(z[i - l], r - i + 1);
        while (i + z[i] < n && s[z[i]] == s[i + z[i]]) z[i]++;
        if (z[i] && i + z[i] - 1 > r) { l = i; r = i + z[i] - 1; }
    }
    return z;
}

// Shortest period: the smallest i with i + Z[i] = n (shift s right by i and the overlap is identical)
std::size_t minPeriod(const std::string& s) {
    std::vector<std::size_t> z = zFunction(s);
    for (std::size_t i = 1; i < s.size(); i++)
        if (i + z[i] == s.size()) return i;
    return s.size();
}

// Circular sequences: b is a rotation of a iff they are equally long and b occurs in a + a (# must not appear in either)
bool isRotation(const std::string& a, const std::string& b) {
    if (a.size() != b.size()) return false;
    if (a.empty()) return true;
    std::vector<std::size_t> z = zFunction(b + '#' + a + a);
    for (std::size_t i = b.size() + 1; i < z.size(); i++)
        if (z[i] == b.size()) return true;
    return false;
}

int main() {
    for (std::size_t v : zFunction("aabcaabcaab")) std::cout << v << ' ';   // 11 1 0 0 7 1 0 0 3 1 0
    std::cout << '\\n';

    std::string read = "CAGCAGCAGCAGCAG";
    std::size_t p = minPeriod(read);
    std::cout << read.substr(0, p) << ' ' << read.size() / p << ' ' << (read.size() % p == 0) << '\\n';   // CAG 5 1

    std::cout << isRotation("ATGCCGTA", "CGTAATGC") << ' ' << isRotation("ATGCCGTA", "CGTAATCG") << '\\n';   // 1 0
}`;

export const skeleton: LessonSkeleton = {
  demo: <ZAlgoDemo />,
  code: { python, cpp },
};
