import { ManacherDemo } from "@/components/lesson/demos/ManacherDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `def manacher(s):
    """Palindrome radii p over t = #s[0]#s[1]#…#. p[i] is exactly the palindrome's length in s. O(n)"""
    t = [None] * (2 * len(s) + 1)
    t[1::2] = s                                 # characters at odd positions, separators at even ones (None equals no character)
    n = len(t)
    p = [0] * n
    c = r = 0                                   # the palindrome reaching furthest right: centre c, right edge r = c + p[c]
    for i in range(n):
        if i < r:
            p[i] = min(p[2 * c - i], r - i)     # copy the mirror's radius, but borrow no further than the right edge
        while i - p[i] - 1 >= 0 and i + p[i] + 1 < n and t[i - p[i] - 1] == t[i + p[i] + 1]:
            p[i] += 1                           # past the right edge there is nothing to copy, so compare outward
        if i + p[i] > r:
            c, r = i, i + p[i]
    return p


def longest_palindrome(s):
    p = manacher(s)
    i = max(range(len(p)), key=p.__getitem__)
    start = (i - p[i]) // 2                     # convert a position in t back to a position in s
    return s[start:start + p[i]]


def count_palindromes(s):
    """Palindromic substrings in total (different positions count separately): each centre gives ceil(p / 2)"""
    return sum((v + 1) // 2 for v in manacher(s))


class PalindromeQuery:
    """O(n) preprocessing, then every 'is s[l..r] a palindrome?' question is O(1)"""

    def __init__(self, s):
        self.p = manacher(s)

    def is_palindrome(self, l, r):              # closed interval [l, r]; its centre in t is l + r + 1
        return self.p[l + r + 1] >= r - l + 1


if __name__ == "__main__":
    print(manacher("abaaba"))                   # [0, 1, 0, 3, 0, 1, 6, 1, 0, 3, 0, 1, 0]
    print(longest_palindrome("forgeeksskeegfor"))   # geeksskeeg
    print(count_palindromes("aaa"), count_palindromes("abaaba"))   # 6 11
    q = PalindromeQuery("abaaba")
    print(q.is_palindrome(1, 4), q.is_palindrome(0, 3), q.is_palindrome(0, 2))   # True False True: baab, abaa, aba`;

const cpp = `#include <algorithm>
#include <cstddef>
#include <iostream>
#include <string>
#include <vector>

std::string withSeparators(const std::string& s) {
    std::string t = "#";
    for (char ch : s) { t += ch; t += '#'; }
    return t;
}

// Palindrome radii over a t that already carries separators. match(x, y) decides whether two symmetric positions agree:
// equality for ordinary palindromes, complementarity for DNA. A centre must also match itself or the symmetry argument breaks
template <class Match>
std::vector<std::size_t> radii(const std::string& t, Match match) {
    std::size_t n = t.size(), c = 0, r = 0;
    std::vector<std::size_t> p(n, 0);
    for (std::size_t i = 0; i < n; i++) {
        if (!match(t[i], t[i])) continue;                 // cannot be a centre (no DNA base complements itself), radius 0
        if (i < r) p[i] = std::min(p[2 * c - i], r - i);
        while (i >= p[i] + 1 && i + p[i] + 1 < n && match(t[i - p[i] - 1], t[i + p[i] + 1])) p[i]++;
        if (i + p[i] > r) { c = i; r = i + p[i]; }
    }
    return p;
}

std::string longestPalindrome(const std::string& s) {
    std::vector<std::size_t> p = radii(withSeparators(s), [](char x, char y) { return x == y; });
    std::size_t i = static_cast<std::size_t>(std::max_element(p.begin(), p.end()) - p.begin());
    return s.substr((i - p[i]) / 2, p[i]);
}

// Stretches of DNA whose reverse complement is themselves, such as GAATTC, the site the restriction enzyme EcoRI cuts.
// Returns the start and the text of every complementary palindrome of length at least minLen that cannot extend further
std::vector<std::pair<std::size_t, std::string>> dnaPalindromes(const std::string& dna, std::size_t minLen) {
    auto comp = [](char ch) { return ch == 'A' ? 'T' : ch == 'T' ? 'A' : ch == 'C' ? 'G' : ch == 'G' ? 'C' : ch; };
    std::vector<std::size_t> p = radii(withSeparators(dna), [&](char x, char y) { return comp(x) == y; });
    std::vector<std::pair<std::size_t, std::string>> res;
    for (std::size_t i = 0; i < p.size(); i += 2)          // only the separators (the even positions) can be centres
        if (p[i] >= minLen) res.push_back({(i - p[i]) / 2, dna.substr((i - p[i]) / 2, p[i])});
    return res;
}

int main() {
    std::cout << longestPalindrome("abaaba") << ' ' << longestPalindrome("forgeeksskeegfor") << '\\n';   // abaaba geeksskeeg
    for (const auto& [pos, site] : dnaPalindromes("CCGAATTCAGTGGATCCGG", 6))
        std::cout << pos << ' ' << site << '\\n';   // 2 GAATTC (EcoRI)
                                                     // 11 GGATCC (BamHI)
}`;

export const skeleton: LessonSkeleton = {
  demo: <ManacherDemo />,
  code: { python, cpp },
};
