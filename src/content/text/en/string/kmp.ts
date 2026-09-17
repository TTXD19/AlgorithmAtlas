import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Rabin-Karp, amortised analysis",
  applications: [
    {
      title: "Finding the boundary string inside an upload stream",
      problem:
        "A browser uploads a 4 GB video. The form data arrives in multipart format, with a randomly generated boundary string separating the fields. The server receives the bytes from the network one chunk at a time, so reading all 4 GB into memory before searching is out of the question — and the boundary may well be split right across the seam between two chunks.",
      why: "KMP never moves the text pointer backwards, and its entire match state is a single integer j meaning \"the first j characters of the boundary match so far\". Each new chunk is scanned with that same j carried over, so a boundary cut in half is picked up again in the next chunk. Scanned bytes can be written to disk and dropped immediately, leaving only O(m) memory.",
    },
    {
      title: "Signature matching on packet payloads",
      problem:
        "An intrusion detection system looks for known attack signatures in every packet that passes. Brute-force matching is usually fast, but an attacker can deliberately send content on which every start position takes a long time to fail — a long run of a, say — bogging down the detector itself so that the real attack packets slip through behind it.",
      why: "KMP's worst case is O(n + m) flat: on a mismatch it shifts the pattern using nothing but the precomputed pi table, so no crafted input can degrade it, whereas hashing can be attacked with constructed collisions. Real deployments have thousands of signatures and switch to Aho–Corasick, KMP's multi-pattern generalisation, which builds the failure function of every signature onto one trie and matches them all in a single pass.",
    },
    {
      title: "Finding the overlap when assembling sequencing reads",
      problem:
        "A sequencer only reads short fragments of a few hundred bases at a time. Assembling a genome means working out how far the end of fragment A overlaps the start of fragment B — the end of GATTACA and the start of TACAGG share TACA, for instance. Trying one overlap length after another means re-comparing a whole stretch every time.",
      why: "Concatenate B, a separator #, and A, then take pi: the last cell is the longest length that is simultaneously a prefix of B and a suffix of A. Since # never appears in the sequences, no border can straddle it. One O(|A| + |B|) pass gives the answer, with no need to try each overlap length individually.",
    },
  ],
  cue: "Finding a pattern in a text with a guaranteed linear worst case, data arriving chunk by chunk with no going back, the longest string that is both a prefix and a suffix, the shortest period of a string, the overlap between the tail of one string and the head of another.",
  steps: [
    "Build the pi table: `pi[0] = 0`, `j = 0`; for i from 1 to m−1, while `j > 0` and `P[i] ≠ P[j]` set `j = pi[j−1]`; if `P[i] = P[j]` increment j; finally `pi[i] = j`.",
    "To search, set `j = 0` and scan T from the start. For each `T[i]`, while `j > 0` and `T[i] ≠ P[j]`, fall back to `j = pi[j−1]` while i stays put.",
    "If `T[i] = P[j]`, increment j; otherwise j is already 0 and you simply move on to the next character.",
    "If `j = m`, record the occurrence at `i − m + 1` and set `j = pi[m−1]` to keep looking for a possibly overlapping next one.",
    "For periods and overlaps, just read pi: the shortest period is `m − pi[m−1]`, and the longest overlap between the end of A and the start of B is the last cell of pi taken over B, #, A.",
  ],
  demoNote:
    "P = aabaaab, T = aabaabaaab. The first phase builds the pi table: the top row is P and the bottom row is a second copy of P aligned at position i − j, matching the pattern against itself. Green marks characters that match; yellow marks a mismatch that can still fall back, and the pi cell being consulted turns yellow at the same time; blue marks a mismatch where j is already 0. At i = 2 the fallback to j = 0 still does not match, so pi[2] = 0; at i = 5 the fallback to j = 1 does match, so pi[5] = 2. The finished table is pi = [0, 1, 0, 1, 2, 2, 3]. The second phase searches T: the first five characters aabaa all match, then T[5] = b mismatches P[5] = a. Brute force would shift P by one and restart from T[1]; KMP looks up pi[4] = 2, knows the matched aabaa begins and ends with aa, and slides P straight to position 3 with j = 2 while i stays where it is. T[5] = b then matches P[2], the rest matches all the way to the end, and P is found at position 3. Across the whole run, i moved forward exactly 10 steps.",
  codeNote:
    "Python has the prefix function, every occurrence including overlapping ones, and the shortest period derived from pi. C++ has a streaming matcher that keeps its state across chunks, showing that a boundary split across the seam is still found, plus the head-to-tail overlap of two sequences computed from pi.",
  problems: [
    { src: "LeetCode 28", name: "Find the Index of the First Occurrence in a String", diff: "Easy" },
    { src: "LeetCode 459", name: "Repeated Substring Pattern (the shortest period divides the length)", diff: "Easy" },
    { src: "LeetCode 1764", name: "Form Array by Concatenating Subarrays of Another Array (KMP over an integer array)", diff: "Medium" },
    { src: "LeetCode 1392", name: "Longest Happy Prefix (the answer is exactly pi[m−1])", diff: "Hard" },
    { src: "LeetCode 214", name: "Shortest Palindrome (take pi over s, #, and s reversed)", diff: "Hard" },
    { src: "LeetCode 3008", name: "Find Beautiful Indices in the Given Array II (two KMP passes, then two pointers)", diff: "Hard" },
  ],
};
