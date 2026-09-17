import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Z-Algorithm",
  applications: [
    {
      title: "Locating restriction enzyme sites",
      problem:
        "A molecular biology experiment needs to know where a restriction enzyme will cut a 50,000-base plasmid. Many enzymes recognise a stretch whose reverse complement is itself — EcoRI looks for GAATTC, and reading it backwards while swapping A with T and C with G gives GAATTC again.",
      why: "Replace \"symmetric positions are equal\" with \"symmetric positions are complementary\" and Manacher's mirror argument still holds, because applying complementation twice returns the original base. The one extra rule is that a centre has to fall between two bases, since no base complements itself. A single O(n) pass gives how far every centre extends, listing every complementary palindrome of length 6 or more so they can be checked against the table of recognition sequences.",
    },
    {
      title: "Measuring palindrome density in a viral genome",
      problem:
        "Researchers have noticed that some regions of herpesvirus genomes are unusually dense in palindromic sequences, and that those regions often sit near origins of DNA replication. Over a genome of more than 200,000 bases, they want a sliding window that counts the palindromes in each stretch and flags the dense ones.",
      why: "Once Manacher has the longest palindromic radius at every centre, every shorter palindrome around that same centre is automatically valid too, so the palindrome count per centre follows straight from the radius without expanding anything. The whole genome is processed in O(n), and a prefix sum then answers the count for any window in O(1).",
    },
    {
      title: "Answering huge numbers of \"is this stretch a palindrome?\" queries",
      problem:
        "Cutting a string of length 2,000 into the fewest palindromic pieces means a dynamic program that enumerates split points and asks \"is s[l..r] a palindrome?\" millions of times. A related family of problems has a string of length 100,000 and 100,000 queries. Comparing from both ends inward costs O(n) per query in the worst case.",
      why: "After separators are inserted, the centre of s[l..r] sits at l + r + 1, and the stretch is a palindrome exactly when that centre's radius is at least r − l + 1. Manacher preprocesses in O(n) and then answers each query in O(1), with no O(n²) palindrome table needed.",
    },
  ],
  cue: "Longest palindromic substring, number of palindromic substrings, how far a palindrome extends from each position, many range palindrome queries, reverse-complement stretches of DNA, needing something faster than O(n²) centre expansion.",
  steps: [
    "Insert a separator between every pair of characters in s and at both ends, giving a T of length `2n + 1`. Set every entry of p to 0 and `c = r = 0`.",
    "For each i: if `i < r`, set `p[i] = min(p[2c − i], r − i)`; otherwise set `p[i] = 0`.",
    "While neither end runs off the string and `T[i − p[i] − 1] = T[i + p[i] + 1]`, increment p[i].",
    "If `i + p[i] > r`, set `c = i` and `r = i + p[i]`.",
    "Read off the answers: the largest `p[i]` is the longest palindrome's length, starting at `(i − p[i]) / 2` in s; and `s[l..r]` is a palindrome exactly when `p[l + r + 1] ≥ r − l + 1`.",
  ],
  demoNote:
    "s = abaaba becomes T = #a#b#a#a#b#a# once the # separators go in, 13 characters long. In the first row blue is i, green is its mirror 2c − i about the current centre, and yellow is the palindrome that grows out from i; the second row marks the palindrome that reaches furthest right. i = 1 and i = 3 both sit outside the right edge and have to expand honestly, and i = 3 — centred on b — reaches radius 3, that is aba, pushing the right edge out to 6. The mirror of i = 4 is 2, and p[2] = 0 is smaller than the 2 slots left to the right edge, so the 0 is copied straight over. i = 6 is the # between the two a's; its mirror gives p[0] = 0, which equals the 0 slots left to the right edge, so it has to expand on its own — all the way to both ends of T, radius 6, pushing the right edge to 12. After that i = 7, 8 and 10 all copy their mirrors, while at i = 9, 11 and 12 the mirror radius exactly reaches the right edge, but since the right edge is already the end of the string they stop after one comparison. The largest p is at i = 6, which corresponds to abaaba: length 6, starting at 0 in s.",
  codeNote:
    "Python uses None as the separator, which is guaranteed to equal no character, and demonstrates the longest palindrome, the palindromic substring count, and O(1) range palindrome queries. C++ pulls \"do these two symmetric positions agree?\" out into a parameter, so one Manacher finds both ordinary palindromes and complementary palindromes in DNA. A position that does not match itself cannot be a centre — a line that changes nothing for ordinary palindromes, but which rules out spurious base-centred palindromes in DNA. The two stretches the example turns up are precisely the EcoRI and BamHI cut sites.",
  problems: [
    { src: "LeetCode 5", name: "Longest Palindromic Substring", diff: "Medium" },
    { src: "LeetCode 647", name: "Palindromic Substrings (each centre contributes ⌈p / 2⌉)", diff: "Medium" },
    { src: "LeetCode 132", name: "Palindrome Partitioning II (turn the DP's palindrome test into an O(1) query)", diff: "Hard" },
    { src: "LeetCode 2472", name: "Maximum Number of Non-overlapping Palindrome Substrings", diff: "Hard" },
    { src: "LeetCode 1960", name: "Maximum Product of the Length of Two Palindromic Substrings (Manacher plus prefix and suffix maxima)", diff: "Hard" },
    { src: "LeetCode 3327", name: "Check if DFS Strings Are Palindromes (run Manacher over the tree's traversal order)", diff: "Hard" },
  ],
};
