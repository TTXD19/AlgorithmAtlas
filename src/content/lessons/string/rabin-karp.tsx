import { RabinKarpDemo } from "@/components/lesson/demos/RabinKarpDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

const python = `import random

M = 1_000_000_007
B = random.randrange(256, M)            # pick the base at random so nobody can construct collisions in advance


def poly_hash(s):
    x = 0
    for ch in s:
        x = (x * B + ord(ch)) % M
    return x


def rabin_karp(text, pat):
    """Every position where pat occurs in text. Each window updates in O(1), so O(n + m) expected."""
    n, m = len(text), len(pat)
    if m == 0 or m > n:
        return []
    top = pow(B, m - 1, M)              # weight of the window's top digit, used to subtract the character that leaves
    hp, hw = poly_hash(pat), poly_hash(text[:m])
    res = []
    for i in range(n - m + 1):
        if hw == hp and text[i:i + m] == pat:   # only verify character by character on a hash match; collisions stop here
            res.append(i)
        if i + m < n:                   # drop the top digit, shift left one place, add the incoming character
            hw = ((hw - ord(text[i]) * top) * B + ord(text[i + m])) % M
    return res


def find_many(text, patterns):
    """Several patterns of the *same length* at once: their hashes go in a dict and the text is scanned once."""
    m = len(patterns[0])
    if m == 0 or m > len(text):
        return []
    table = {}
    for p in patterns:
        table.setdefault(poly_hash(p), []).append(p)
    top = pow(B, m - 1, M)
    hw, res = poly_hash(text[:m]), []
    for i in range(len(text) - m + 1):
        for p in table.get(hw, []):     # one hash value can hold several patterns, so verify each of them
            if text[i:i + m] == p:
                res.append((i, p))
        if i + m < len(text):
            hw = ((hw - ord(text[i]) * top) * B + ord(text[i + m])) % M
    return res


if __name__ == "__main__":
    print(rabin_karp("abracadabra", "abra"))    # [0, 7]
    print(rabin_karp("aaaaa", "aa"))            # [0, 1, 2, 3]
    print(find_many("ACGTTGCAACGTAGGT", ["ACGT", "AGGT", "TTTT"]))
    # [(0, 'ACGT'), (8, 'ACGT'), (12, 'AGGT')]`;

const cpp = `#include <chrono>
#include <cstddef>
#include <iostream>
#include <random>
#include <string>
#include <unordered_map>
#include <vector>

const unsigned long long M = 1000000007ULL;
std::mt19937_64 rng(static_cast<unsigned long long>(std::chrono::steady_clock::now().time_since_epoch().count()));
const unsigned long long B = rng() % (M - 256) + 256;

// Every position where pat occurs in text. O(n + m) expected
std::vector<std::size_t> rabinKarp(const std::string& text, const std::string& pat) {
    std::size_t n = text.size(), m = pat.size();
    std::vector<std::size_t> res;
    if (m == 0 || m > n) return res;
    unsigned long long top = 1, hp = 0, hw = 0;
    for (std::size_t i = 0; i + 1 < m; i++) top = top * B % M;          // B^(m-1)
    for (std::size_t i = 0; i < m; i++) {
        hp = (hp * B + static_cast<unsigned char>(pat[i])) % M;
        hw = (hw * B + static_cast<unsigned char>(text[i])) % M;
    }
    for (std::size_t i = 0; i + m <= n; i++) {
        if (hw == hp && text.compare(i, m, pat) == 0) res.push_back(i);   // verify character by character
        if (i + m < n) {
            unsigned long long out = static_cast<unsigned char>(text[i]) * top % M;
            hw = (hw + M - out) % M;                                       // add M before subtracting: unsigned never goes negative
            hw = (hw * B + static_cast<unsigned char>(text[i + m])) % M;
        }
    }
    return res;
}

// Every length-k DNA fragment that shows up more than once (k ≤ 32).
// With only 4 letters, each character fits in exactly 2 bits, so this rolling "hash" is a collision-free encoding
std::vector<std::string> repeatedSequences(const std::string& s, std::size_t k) {
    std::vector<std::string> res;
    if (k == 0 || k > 32 || s.size() < k) return res;
    auto code = [](char c) -> unsigned long long { return c == 'A' ? 0 : c == 'C' ? 1 : c == 'G' ? 2 : 3; };
    unsigned long long mask = k == 32 ? ~0ULL : (1ULL << (2 * k)) - 1, x = 0;
    std::unordered_map<unsigned long long, int> seen;
    for (std::size_t i = 0; i < s.size(); i++) {
        x = ((x << 2) | code(s[i])) & mask;             // shift up two bits, add the new character; the mask evicts the oldest
        if (i + 1 >= k && ++seen[x] == 2) res.push_back(s.substr(i + 1 - k, k));
    }
    return res;
}

int main() {
    for (std::size_t i : rabinKarp("abracadabra", "abra")) std::cout << i << ' ';   // 0 7
    std::cout << '\\n';
    for (const std::string& t : repeatedSequences("AAAAACCCCCAAAAACCCCCCAAAAAGGGTTT", 10)) std::cout << t << ' ';
    std::cout << '\\n';                                                    // AAAAACCCCC CCCCCAAAAA
}`;

export const skeleton: LessonSkeleton = {
  demo: <RabinKarpDemo />,
  code: { python, cpp },
};
