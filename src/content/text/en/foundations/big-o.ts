import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "None — this is the starting point",
  applications: [
    {
      title: "Fast on the test machine, times out in production",
      problem:
        "Locally, 100 rows take 0.01 seconds; in production, a million rows never finish. With two nested loops, ten thousand times the data means a hundred million times the work.",
      why: "Big-O describes how the running time grows with the size of the data, so you can predict this while you are writing the code instead of discovering it after launch.",
    },
    {
      title: "\"And what is the complexity of that?\"",
      problem:
        "Almost every algorithm interview asks about time and space complexity and then asks you to improve it. It is the shared language of the industry.",
      why: "Saying O(n²) is far more precise than saying \"it will probably take a while\", and everyone who hears it knows exactly what you mean.",
    },
    {
      title: "Deciding whether an optimisation is worth it",
      problem:
        "A colleague wants to take a function from O(n) to O(log n), but n never exceeds 10 in that function.",
      why: "Big-O is a growth trend, not an absolute speed. Understanding what it means also tells you when you can safely ignore it.",
    },
  ],
  cue: "The complexity of this code, how much slower it gets with ten times the data, whether it can be faster, what n actually is.",
  steps: [
    "Work out what \"n\" is: array length, string length, node count. Two inputs means two variables, as in O(m·n).",
    "Look at the **nesting and the range** of the loops: one loop over n is O(n), two nested loops over n each are O(n²), and a loop that halves the range each time is O(log n).",
    "Look at what the **functions you call** actually do: calling an O(n) function inside a loop makes the whole thing O(n²). A built-in `sort` is O(n log n), and `in` is O(n) on a list but O(1) on a set.",
    "Add the pieces up, then **drop the constants and the smaller terms**: 2n² + 5n + 100 → O(n²).",
    "Quote the **worst case** by default. If the problem emphasises the average or amortised cost, say so separately.",
  ],
  demoNote:
    "Change n and compare the operation counts for seven complexity classes. The right-hand column assumes one nanosecond per operation and converts that into how long you would actually wait.",
  codeNote:
    "The same \"are there any duplicates?\" problem, written two ways that are a factor of n apart. As you read the code, practise counting the complexity of each piece with the steps above.",
  problemsNote:
    "The point of these is not to solve them but to write the brute-force version first, work out its complexity, and then find a way to drop it by one order.",
  problems: [
    { src: "LeetCode 217", name: "Contains Duplicate (O(n²) → O(n))", diff: "Easy" },
    { src: "LeetCode 1", name: "Two Sum (O(n²) → O(n))", diff: "Easy" },
    { src: "LeetCode 704", name: "Binary Search (O(n) → O(log n))", diff: "Easy" },
    { src: "LeetCode 189", name: "Rotate Array (O(n) time, O(1) space)", diff: "Medium" },
  ],
};
