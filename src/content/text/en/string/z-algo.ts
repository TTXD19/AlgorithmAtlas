import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "KMP",
  applications: [
    {
      title: "Sequence search that tolerates one mutation",
      problem:
        "You are hunting for a 25-base probe sequence in a bacterial genome of five million bases, but the sample may carry a point mutation, so every position that matches with at most one wrong base has to be reported. Exact matching with KMP never finds those positions, and brute force compares 25 characters at every starting point.",
      why: "The Z function answers exactly one question: starting here, how many characters match the beginning of the pattern? Run it once over pattern, separator and genome and each position tells you that it matches a characters from the front. Reverse both strings, run it again, and you get b characters matching from the back. As long as a + b is at least m − 1, at most one character in the middle can differ. Two O(n + m) passes settle every position in the genome.",
    },
    {
      title: "Detecting tandem repeats",
      problem:
        "Huntington's disease is tied to how many times the three bases CAG repeat inside the HTT gene; past a certain count the disease develops. Analysing a sequencing read means deciding whether a stretch is one short unit repeated over and over, what that unit is, and how many times it repeats.",
      why: "If shifting the string p places to the right leaves the overlapping part identical, then p is a period — and that is precisely the condition i + Z[i] = n at i = p. Compute the Z array once over the whole stretch, and the smallest such i is the length of the shortest repeating unit. That gives you the unit and the repeat count in O(n), with no need to try one length after another.",
    },
    {
      title: "Comparing circular DNA",
      problem:
        "A bacterial plasmid is circular DNA, so where an assembled sequence starts is arbitrary. Two labs each assemble a sequence of 8,000 bases, and you have to decide whether they are the same plasmid read from different starting points.",
      why: "b is a rotation of a exactly when the two are the same length and b occurs inside a + a. Compute the Z array over b, a separator and a + a; if any position holds a value equal to the length of b, it is the same circle, in O(n). This pattern-separator-text concatenation is the standard way to do string matching with the Z function.",
    },
  ],
  cue: "The longest common prefix between the string and each of its suffixes, hunting for Z values equal to m over pattern + separator + text, periods and repeating units, matching that tolerates a few errors (one pass forwards, one backwards), string rotation.",
  steps: [
    "Set `Z[0] = n` and the window to `l = r = 0`, then sweep i from 1 up to n − 1.",
    "If `i ≤ r`, start with `Z[i] = min(Z[i − l], r − i + 1)` — those characters are guaranteed to match, so there is nothing to compare. Otherwise start with `Z[i] = 0`.",
    "Carry on from the current `Z[i]`, comparing `s[Z[i]]` against `s[i + Z[i]]` one character at a time and adding 1 on every match. When the mirror value is smaller than the number of cells left, the very first comparison fails.",
    "If `Z[i] > 0` and `i + Z[i] − 1 > r`, replace the window with `[i, i + Z[i] − 1]`.",
    "To match, run Z over pattern, separator and text: subtract m + 1 from each position whose value is m and you have a starting point in the text. To find a period, the smallest i satisfying `i + Z[i] = n` is the shortest period.",
  ],
  demoNote:
    "s = aabcaabcaab. In the string row, blue is the current i; the row underneath shows the window [l, r] in amber. Positions i = 1 through 4 all sit outside the window and have to compare character by character: Z[1] = 1, Z[2] and Z[3] are both 0, and i = 4 matches 7 characters in one go, pushing the window out to [4, 10], right up to the end of the string. Then i = 5, 6 and 7 all fall inside the window, their green mirror positions are 1, 2 and 3, and every one of those Z values is smaller than the number of cells left, so they are copied straight across with zero comparisons. At i = 8 the mirror Z[4] = 7 is larger than the 3 cells remaining, so only 3 characters are guaranteed to match, and since the window already runs to the end, Z[8] = 3 and the window becomes [8, 10]; i = 9 and 10 copy once more. The finished array is Z = [·, 1, 0, 0, 7, 1, 0, 0, 3, 1, 0]. Both i = 4 and i = 8 satisfy i + Z[i] = n, so the shortest period is 4: s is aabc repeated, with the last block left incomplete.",
  codeNote:
    'Python has the Z function, string matching through a separator, and the forward-and-backward pair of Z arrays that locates every position matching with at most one wrong character. C++ has the Z function, the shortest period used to pull out the unit and the count of a tandem repeat, and a check for whether two circular sequences differ only in where they start. Both languages treat the window as the closed interval [l, r], matching the demo.',
  problems: [
    { src: "LeetCode 3029", name: "Minimum Time to Revert Word to Initial State I (find the smallest multiple with i + Z[i] = n)", diff: "Medium" },
    { src: "LeetCode 2223", name: "Sum of Scores of Built Strings (the answer is the sum of the whole Z array)", diff: "Hard" },
    { src: "LeetCode 3031", name: "Minimum Time to Revert Word to Initial State II (same as above; at length 10⁶ it has to be linear)", diff: "Hard" },
    { src: "LeetCode 3036", name: "Number of Subarrays That Match a Pattern II (convert to a sequence of comparisons first, then match)", diff: "Hard" },
    { src: "LeetCode 3303", name: "Find the Occurrence of First Almost Equal Substring (one Z array forwards, one backwards)", diff: "Hard" },
  ],
};
