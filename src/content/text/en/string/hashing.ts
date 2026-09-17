import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Hash tables, prefix sums, binary search",
  applications: [
    {
      title: "Finding the longest copy-pasted block",
      problem:
        "You have a 500,000-character source file and want the longest substring that occurs at least twice, as a lead on duplicated code. Enumerating every pair of start positions is already hundreds of billions of pairs, and each pair still has to be compared character by character. It simply will not finish.",
      why: "If a block of length L repeats, so does one of length L−1, so the length can be binary searched. For each guessed L, drop the hash of every length-L substring into a set and look for a repeat. Substring hashes come out in O(1), so each round costs O(n) and the whole problem drops to O(n log n).",
    },
    {
      title: "String keys in hash tables, and HashDoS",
      problem:
        "A web backend puts user-submitted form field names into a hash table. If an attacker deliberately sends tens of thousands of names that all hash to the same value, every key lands in one bucket, each insertion has to be compared against the whole chain, and a single request can keep the server busy for seconds.",
      why: "Java's String.hashCode is exactly a polynomial hash with base 31 and natural overflow. \"Aa\" and \"BB\" both come to 2112, and any concatenation of them collides too, so there are 2ⁿ colliding strings of length 2n. The HashDoS attack disclosed in late 2011 exploited precisely this fixed base; afterwards Python, Ruby and others switched to a hash seed randomised at every startup, and Java 8 turned over-full buckets into balanced trees. When you write your own string hash, randomise the base as well.",
    },
    {
      title: "Sorting all the suffixes",
      problem:
        "Building a suffix array for a genome, or running the Burrows–Wheeler transform that bzip2 uses, means putting all the suffixes of one long string in order. An ordinary sort spends up to O(n) comparing a single pair of suffixes, which makes O(n² log n) for all n of them.",
      why: "Comparing two suffixes means finding their longest common prefix and then comparing the next character. \"The first L characters match\" is monotonic in L, so substring hashing lets you binary search that prefix length: each comparison drops to O(log n) and the whole sort to O(n log² n). The specialised SA-IS algorithm gets to O(n), but the hashing version is a few dozen lines.",
    },
  ],
  cue: "Checking a great many pairs of substrings for equality, putting substrings into a set or hash table, binary searching a length to find the longest repeat, longest common prefixes, lexicographic comparison — and a vanishingly small chance of being wrong is acceptable.",
  steps: [
    "Pick a large prime M (`2⁶¹−1` is common, or use `10⁹+7` and `998244353` together) and draw the base B at random from `[256, M)` when the program starts.",
    "Build the tables left to right: `h[0] = 0`, `pw[0] = 1`, `h[i+1] = (h[i]·B + s[i]) mod M`, `pw[i+1] = pw[i]·B mod M`.",
    "Take the hash of a substring `s[l, r)` as `(h[r] − h[l]·pw[r−l]) mod M`, adding M if the result came out negative.",
    "Compare two ranges: different lengths or different hashes mean they definitely differ; equal hashes count as equal, and when the answer has to be exact, confirm character by character.",
    "For the longest repeat or the longest common prefix, binary search the length using the fact that if L works so does L−1, and make every check an O(1) substring hash.",
  ],
  demoNote:
    "s = abcabca, with base B = 31 and modulus M = 101 so the arithmetic stays doable by hand, and character values a = 1, b = 2, c = 3. The first half builds the tables one character at a time: blue marks the character just read and the h and pw values just computed, and the box spells out the arithmetic for that step. Once the tables are built, three comparisons follow: yellow marks the first range together with the h and pw cells the formula uses, and the second range turns green when its hash matches and blue when it does not. s[0, 3) and s[3, 6) are both abc and both hash to 16; s[1, 4) and s[4, 7) are both bca and both hash to 97; abc against bca is 16 against 97, which must differ, so no character-by-character check is needed. M = 101 only has 101 possible values, so collisions appear as soon as there are many substrings — in real use, switch to one of the large moduli above.",
  codeNote:
    "Python uses the single modulus 2⁶¹−1 (Python integers never overflow), demonstrates substring comparison and the binary search for the longest repeated block, and finally reproduces the Java string-hash collision. C++ uses the two moduli 10⁹+7 and 998244353, keeps every multiplication inside 64 bits, and sorts suffixes by binary searching their longest common prefix with hashes. Both languages randomise the base at startup, so the hash values differ on every run while the printed answers stay the same.",
  problems: [
    { src: "LeetCode 187", name: "Repeated DNA Sequences (fixed length 10, hashes into a set)", diff: "Medium" },
    { src: "LeetCode 718", name: "Maximum Length of Repeated Subarray (arrays hash too; binary search the length)", diff: "Medium" },
    { src: "LeetCode 1044", name: "Longest Duplicate Substring (binary search plus a hash set; mind the collisions)", diff: "Hard" },
    { src: "LeetCode 1147", name: "Longest Chunked Palindrome Decomposition (greedy from both ends, hashing to compare the two chunks)", diff: "Hard" },
    { src: "LeetCode 1316", name: "Distinct Echo Substrings (substring hashes to test the two halves, then deduplicate)", diff: "Hard" },
    { src: "LeetCode 2223", name: "Sum of Scores of Built Strings (common prefix of each suffix with the whole string, by binary search; the Z-Algorithm lesson revisits it)", diff: "Hard" },
  ],
};
