import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "String hashing, sliding window",
  applications: [
    {
      title: "Plagiarism detection in programming assignments",
      problem:
        "A course has 300 programming submissions to compare pairwise, looking for copied work. Renaming variables, reordering functions or inserting a few comment lines should not drop the similarity to zero, and comparing every pair character by character means more than forty thousand pairs, each one a long string comparison.",
      why: "Stanford's MOSS normalises each submission, hashes every length-k fragment, and keeps a subset of those hashes as \"fingerprints\" — the more fingerprints two submissions share, the more suspicious the pair. An n-character file has n − k + 1 fragments, and a rolling hash produces each one in O(1), so the whole submission costs O(n).",
    },
    {
      title: "rsync only sends the parts that changed",
      problem:
        "A 2 GB file sits on the server and the local copy differs only by a few hundred bytes inserted in the middle. Re-sending the whole thing is wasteful, and chunking at fixed offsets does not work either: after an insertion, every later block is shifted out of alignment.",
      why: "The receiver cuts the old file into fixed-size blocks and sends a weak and a strong hash for each. The sender slides a window over every single offset of the new file, updating a rolling checksum in O(1), and looks each value up to see whether some block has the same weak hash; on a match it confirms with the strong hash. That is exactly Rabin-Karp's \"compare hashes first, then verify\" structure, which is why the shifted blocks are still found.",
    },
    {
      title: "Searching for thousands of keywords at once",
      problem:
        "A lab has 20,000 primer sequences of length 20 and needs every position where each one occurs in a 5-million-base genome. Running a string search once per primer means scanning the genome from the top 20,000 times.",
      why: "When the patterns share a length, all their hashes go into one hash table and the text is scanned once: each window updates its hash in O(1) and does one O(1) lookup, and only a lookup hit triggers a character-by-character check. The total is O(n + total pattern length) plus the cost of verifying hits, which barely depends on how many patterns there are.",
    },
  ],
  cue: "Finding fixed-length fragments in a long text, searching for many equal-length patterns at once, comparing every length-k substring, needing a fingerprint each time the window moves one place, expected linear time being good enough.",
  steps: [
    "Return straight away if the pattern is longer than the text. Compute `hash(P)` and the first window's `hash(T[0, m))`, and precompute `top = B^(m−1) mod M`.",
    "Check the current window i: if its hash differs from `hash(P)`, skip it, because it cannot possibly match.",
    "On a hash match, compare `T[i, i+m)` with P character by character, and record position i only if every character agrees; a mismatch is a collision, so move on.",
    "Unless this is the last window, roll: `hash = ((hash − T[i]·top)·B + T[i+m]) mod M`, adding M first if the subtraction would go negative.",
    "Repeat until `i = n − m`. With several patterns of the same length, put their hashes in a hash table and do one lookup per window.",
  ],
  demoNote:
    "Searching for P = abra in T = abracadabra, with B = 31 and a = 1 as in the previous lesson and a deliberately tiny modulus M = 101. hash(P) = 53, and the weight of the top digit is 31³ mod 101 = 97. Yellow is the current window; on each slide, grey is the character that just left and blue the one that just arrived, with the O(1) rolling formula shown in the box. The eight windows hash to 53, 53, 74, 86, 64, 35, 15 and 53 in order: window 0 matches on hash, turns green once the character-by-character check passes, and is a genuine hit; window 1 holds brac, which also hashes to 53, but the very first character disagrees during verification and is marked in blue — that is a collision; the five in the middle have different hashes and are skipped outright; window 7 hits again. The answer is positions 0 and 7.",
  codeNote:
    "Python has single-pattern Rabin-Karp plus a version that shares one scan between several equal-length patterns, both verifying character by character after a hash match. C++ has the single-pattern version, adding M before subtracting because the arithmetic is unsigned, along with the 2-bit rolling encoding for DNA fragments: with only 4 letters the rolling value cannot collide at all, so no modulus is needed.",
  problems: [
    { src: "LeetCode 796", name: "Rotate String (look for goal inside s + s)", diff: "Easy" },
    { src: "LeetCode 1461", name: "Check If a String Contains All Binary Codes of Size K (roll a window of bits)", diff: "Medium" },
    { src: "LeetCode 187", name: "Repeated DNA Sequences (2-bit rolling encoding)", diff: "Medium" },
    { src: "LeetCode 686", name: "Repeated String Match", diff: "Medium" },
    { src: "LeetCode 2156", name: "Find Substring With Given Hash Value (roll the other way, right to left)", diff: "Hard" },
    { src: "LeetCode 1923", name: "Longest Common Subpath (binary search the length, intersect each path's rolling hashes)", diff: "Hard" },
  ],
};
