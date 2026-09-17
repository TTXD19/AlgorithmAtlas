import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Arrays, linear search",
  applications: [
    {
      title: "git bisect: which of a thousand commits broke the feature?",
      problem:
        "It worked last week and it is broken today, with a thousand commits in between. Checking out each one and running the tests means a thousand builds.",
      why: 'Commits are ordered, and "good → bad" flips exactly once: everything before some commit works and everything after it fails. Test the middle one, search forward if it is good and backward if it is bad, and each test halves the range — ten tests find it. That is precisely what git bisect does.',
    },
    {
      title: "Version compatibility: where did support start?",
      problem: 'A library has 200 past releases and a customer asks, "what is the earliest version that has this API?"',
      why: 'Whether the API exists is monotonic in the version number: it appears at some release and is there from then on. You are looking for the first version that has it, which is exactly the question lower_bound answers — eight tests pin it down.',
    },
    {
      title: "Dictionary and time-series lookups",
      problem:
        "A log sorted by time holds a hundred million entries and you need the first one after 10:30; or you are looking up a word in an alphabetically sorted dictionary.",
      why: 'The data is already in order, so each comparison throws away half of it. A hundred million entries take 27 comparisons. "The first entry ≥ some time" is lower_bound, and it is also the basic move a database index makes for a range query.',
    },
  ],
  cue: "Sorted data, monotonic predicates, the first position that satisfies a condition, the last one that does not, log n, halving the range, bisect.",
  steps: [
    'Check that the data is **monotonic** for your condition: all "no" in the first part, all "yes" in the second. Rewrite the question as "find the first \'yes\'".',
    'Use a half-open interval: `lo = 0`, `hi = n`. The answer ranges over `0..n`, where `n` means "everything is a no".',
    "`while lo < hi`: `mid = (lo + hi) // 2`.",
    "Condition holds (`a[mid] ≥ target`): `hi = mid`, keeping mid inside the range. It does not hold: `lo = mid + 1`, ruling mid out.",
    "When the loop ends, `lo == hi` and that is the answer. For upper_bound, change `≥` to `>`; to test existence, check `lo < n and a[lo] == target`.",
  ],
  demoNote:
    'The array contains 8 three times. Three modes over the same data and the same target: "find any one" uses the closed interval and stops the moment it hits a match, with no guarantee about which 8 comes back; lower_bound and upper_bound use the half-open interval, and the answer is wherever lo and hi finally meet. Note that hi is exclusive in the half-open version, which is why it can point at n, one past the end of the array.',
  codeNote:
    'Three functions — the classic closed-interval version, lower_bound and upper_bound — plus "first and last occurrence" assembled from them. Python\'s built-in `bisect_left` / `bisect_right` and C++\'s `std::lower_bound` / `std::upper_bound` are these two bounds, and writing them yourself is what makes their return values obvious.',
  problems: [
    { src: "LeetCode 704", name: "Binary Search", diff: "Easy" },
    { src: "LeetCode 35", name: "Search Insert Position (this is lower_bound)", diff: "Easy" },
    { src: "LeetCode 278", name: "First Bad Version (git bisect as a puzzle)", diff: "Easy" },
    { src: "LeetCode 34", name: "Find First and Last Position of Element in Sorted Array", diff: "Medium" },
    { src: "LeetCode 33", name: "Search in Rotated Sorted Array (work out which half is sorted)", diff: "Medium" },
    { src: "LeetCode 162", name: "Find Peak Element (binary search on uphill vs. downhill)", diff: "Medium" },
  ],
};
