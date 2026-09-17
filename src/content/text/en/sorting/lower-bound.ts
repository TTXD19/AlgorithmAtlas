import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Merge Sort, Heap Sort, Binary Tree Basics",
  applications: [
    {
      title: "Is it worth optimising the comparison count further?",
      problem:
        "The team's sorting service already runs an O(n log n) algorithm, and someone proposes spending another two months driving down the average number of comparisons per element. Meanwhile a vendor claims their general-purpose sorting library is O(n).",
      why: "As long as an algorithm can only learn about the data by comparing two elements, the worst case needs at least log₂(n!) ≈ n log₂ n − 1.44n comparisons. Merge sort's worst case is about n log₂ n, a single lower-order term away from the bound, so there is very little left to squeeze out — and anything claiming to be general-purpose, comparison-only and O(n) has to be wrong somewhere. Going faster means replacing the model of computation, not reshuffling the order of the comparisons.",
    },
    {
      title: "Capacity planning for a billion records",
      problem:
        "A billion records have to be sorted by user score every night, the budget only covers a fixed number of machines, and you want to estimate the minimum comparison cost before the hardware is bought.",
      why: "The bound hands you the number directly: log₂(10⁹!) is roughly 10⁹ × (29.9 − 1.44) ≈ 28.5 billion comparisons, and no comparison sort can avoid them. If that overshoots the budget, the only way out is to leave the comparison model: when the scores are integers or of fixed width, switch to counting or radix sort, where each record costs a constant number of operations.",
    },
    {
      title: 'An interview question that rules out sorting',
      problem:
        "The question reads: find the longest run of consecutive integers in an array, in O(n) time. The instinctive approach is to sort first and then scan once.",
      why: 'Sorting first is Ω(n log n), and this bound says no way of writing that sort will ever reach O(n). The question is really hinting that you should change models: use a hash set to ask directly whether x+1 is present. A lookup is not a comparison — it treats the value itself as a location. Recognise the bound and you can tell at a glance that sorting is off the table.',
    },
  ],
  cue: "Can this be any faster, is O(n log n) the limit, decision trees, log₂(n!), a problem that demands O(n) yet looks like it needs sorting, comparisons only, information content, lower-bound arguments.",
  steps: [
    "Confirm the **model of computation**: can the algorithm only obtain information by comparing two elements? Once hashing, indexing or bit operations are in play, this bound no longer applies.",
    "Count **how many possible answers there are**: sorting n distinct elements has n!, searching a sorted array has n + 1.",
    "Draw any such algorithm as a decision tree: every comparison branches two ways, a tree of height h holds at most 2ʰ leaves, and every answer needs a leaf of its own.",
    "From `2ʰ ≥ number of answers` you get `h ≥ ⌈log₂ number of answers⌉`; for sorting that is ⌈log₂ n!⌉ = Ω(n log n).",
    "When you need it faster, the only move is to change the premise: counting or radix sort when the keys are small integers, an adaptive insertion sort when the input is nearly ordered, and no full sort at all when you only need the k-th smallest or the top K.",
  ],
  demoNote:
    "Pick n = 2, 3 or 4. The four numbers along the top are n!, log₂ n!, the fewest comparisons the worst case can need, and n log₂ n for reference. The row of boxes below shows how many leaves a binary tree of height h can hold: grey is too few, and blue marks the first height that fits all n! of them. For n = 3 an actual decision tree is drawn, so choosing an input shows how many comparisons it makes along the amber path and which leaf it lands on: [5, 2, 9] takes only 2 comparisons and [5, 9, 2] takes 3, but no input ever exceeds 3. The table at the bottom pushes n up to a million, where the ratio of log₂ n! to n log₂ n creeps toward 1.",
  codeNote:
    'The code turns the proof into numbers you can run: `lower_bound` computes ⌈log₂ n!⌉ exactly with integer arithmetic, and two sorts that may only compare through `less(x, y)` are then run over all n! permutations of n elements with their comparisons counted. The table shows two things: no algorithm ever drops below the bound, and from n = 5 onward the familiar algorithms sit one or two comparisons above it — the bound is an "at least", not an "exactly".',
  problems: [
    { src: "LeetCode 217", name: "Contains Duplicate (sorting at O(n log n) versus hashing at O(n), which is outside the comparison model)", diff: "Easy" },
    { src: "LeetCode 278", name: "First Bad Version (n possible answers, so at least log₂ n queries)", diff: "Easy" },
    { src: "LeetCode 128", name: "Longest Consecutive Sequence (O(n) required, so sorting first is out)", diff: "Medium" },
    { src: "LeetCode 164", name: "Maximum Gap (linear time required; bucket with the pigeonhole principle)", diff: "Medium" },
    { src: "LeetCode 41", name: "First Missing Positive (use values as indices and leave the comparison model)", diff: "Hard" },
  ],
};
