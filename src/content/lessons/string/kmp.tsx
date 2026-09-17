import { KmpDemo } from "@/components/lesson/demos/KmpDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

const python = `def prefix_function(p):
    """pi[i]: length of the longest proper prefix of p[:i+1] that is also a suffix. O(m)"""
    pi = [0] * len(p)
    j = 0                                   # current border length
    for i in range(1, len(p)):              # start at 1: a segment is not a border of itself
        while j > 0 and p[i] != p[j]:
            j = pi[j - 1]                   # cannot extend, so fall back to a shorter border, maybe several times
        if p[i] == p[j]:
            j += 1
        pi[i] = j
    return pi


def kmp_search(text, pat):
    """Every position where pat occurs in text, overlaps included. O(n + m)"""
    if not pat:
        return []
    pi, res, j = prefix_function(pat), [], 0
    for i, ch in enumerate(text):           # i only ever moves forward, so text could be a stream
        while j > 0 and ch != pat[j]:
            j = pi[j - 1]
        if ch == pat[j]:
            j += 1
        if j == len(pat):
            res.append(i - j + 1)
            j = pi[j - 1]                   # do not reset to 0, or the next overlapping hit is missed
    return res


def min_period(s):
    """The smallest p for which s[i] == s[i + p] holds at every valid i"""
    return len(s) - prefix_function(s)[-1] if s else 0


if __name__ == "__main__":
    print(prefix_function("aabaaab"))           # [0, 1, 0, 1, 2, 2, 3]
    print(kmp_search("aabaabaaab", "aabaaab"))   # [3]
    print(kmp_search("aaaaa", "aaa"))            # [0, 1, 2]
    for s in ["abcabcabc", "abcabca"]:
        p = min_period(s)
        print(s, p, len(s) % p == 0)            # abcabcabc 3 True: built by repeating abc
                                                # abcabca 3 False: the period is 3, but the last copy is incomplete`;

const cpp = `#include <cstddef>
#include <initializer_list>
#include <iostream>
#include <string>
#include <utility>
#include <vector>

// pi[i]: length of the longest proper prefix of p[0..i] that is also a suffix
std::vector<std::size_t> prefixFunction(const std::string& p) {
    std::vector<std::size_t> pi(p.size(), 0);
    std::size_t j = 0;
    for (std::size_t i = 1; i < p.size(); i++) {
        while (j > 0 && p[i] != p[j]) j = pi[j - 1];
        if (p[i] == p[j]) j++;
        pi[i] = j;
    }
    return pi;
}

// Streaming KMP: data arrives chunk by chunk, the match state j carries across chunks, and consumed bytes need not stay in memory
class StreamMatcher {
    std::string pat;
    std::vector<std::size_t> pi;
    std::size_t j = 0;        // the first j characters of pat match so far
    std::size_t pos = 0;      // bytes consumed from the stream as a whole

public:
    explicit StreamMatcher(std::string p) : pat(std::move(p)), pi(prefixFunction(pat)) {}

    // Feed one chunk and return the occurrences completed inside it (offsets within the whole stream)
    std::vector<std::size_t> feed(const std::string& chunk) {
        std::vector<std::size_t> hits;
        if (pat.empty()) return hits;
        for (char c : chunk) {
            while (j > 0 && c != pat[j]) j = pi[j - 1];
            if (c == pat[j]) j++;
            pos++;
            if (j == pat.size()) {
                hits.push_back(pos - pat.size());
                j = pi[j - 1];
            }
        }
        return hits;
    }
};

// How far the tail of a overlaps the head of b: take pi over b + '#' + a, and the last cell is the answer (# must not occur in either string)
std::size_t longestOverlap(const std::string& a, const std::string& b) {
    return prefixFunction(b + '#' + a).back();
}

int main() {
    for (std::size_t v : prefixFunction("aabaaab")) std::cout << v << ' ';   // 0 1 0 1 2 2 3
    std::cout << '\\n';

    StreamMatcher m("--boundary");      // the first delimiter is split across two chunks
    for (const char* chunk : {"field=1 --bou", "ndary field=2 --", "boundary--"})
        for (std::size_t at : m.feed(chunk)) std::cout << at << ' ';          // 8 27
    std::cout << '\\n';

    std::cout << longestOverlap("GATTACA", "TACAGG") << '\\n';               // 4 (TACA)
}`;

export const skeleton: LessonSkeleton = {
  demo: <KmpDemo />,
  code: { python, cpp },
};
