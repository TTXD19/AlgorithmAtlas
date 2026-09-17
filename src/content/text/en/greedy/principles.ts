import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Big-O Notation",
  applications: [
    {
      title: "Will taking the best option right now come back to bite you?",
      problem:
        'Scheduling meetings, making change, compressing a file, planning a route — a great many problems have an obvious "take whatever looks best right now" approach. It runs fast and the code is short, but sometimes it returns the wrong answer, and it does so quietly: no exception, no warning.',
      why: 'Greedy is not one algorithm, it is a way of making decisions. What this lesson teaches is the test: when does "locally best" add up to "globally best", and when does it not? Judge it right and you get the fastest solution available; judge it wrong and you move to DP or to search.',
    },
    {
      title: "The first fork in an interview question",
      problem:
        "Faced with an optimisation problem, you have a couple of minutes to decide between greedy and DP. Take the wrong turn and either you finish the greedy solution only to be handed a counterexample, or you spend half the interview on a DP when a single sort would have done.",
      why: "There is a fixed routine: guess a greedy rule, look for a counterexample, and if none turns up, try to prove the rule with an exchange argument. This lesson walks through that routine once, and every greedy solution in the lessons that follow is confirmed the same way.",
    },
    {
      title: "The data is too big for a DP table",
      problem:
        "DP is guaranteed correct, but the number of states is often O(n²) or worse. With millions of inputs, neither the memory nor the time holds up.",
      why: "A problem whose greedy rule can be proved correct usually needs nothing more than a sort and a single scan: O(n log n) time and O(1) extra space. That is why greedy is worth learning — it is the cheapest optimisation method there is, as long as you know when it applies.",
    },
  ],
  cue: "Take the largest / smallest / earliest at every step, sort then scan once, never look back, locally optimal, exchange argument, counterexample.",
  steps: [
    "Write the problem as a sequence of choices, where each choice leaves behind a smaller problem of the same shape.",
    "Guess a **sort key** (earliest finish, smallest, best ratio, …), sort by it, scan through, and take whatever fits.",
    "**Hunt for a counterexample** on small inputs: work 5 to 10 elements through by hand, or write a brute-force solution and compare on n ≤ 15. One counterexample means a different key, or no greedy at all.",
    "If nothing turns up, build an **exchange argument**: take any optimal solution O, replace its first choice that differs from the greedy one with the greedy choice, and argue that the result is still valid and no worse.",
    "Confirm the **optimal substructure**: after the first choice, what is left has the same shape. With both properties in hand the greedy answer is optimal, and the cost is usually O(n log n).",
  ],
  demoNote:
    "The same seven intervals under three greedy rules, stepping through what each rule takes and what it skips. The optimum is four. The panel at the bottom right explains why the rule works or why it fails: the correct one gets an exchange argument, and each wrong one gets a concrete counterexample.",
  codeNote:
    "A generic sort-then-scan skeleton with three interchangeable sort keys, plus a brute-force solution to check against. This is exactly how you hunt for counterexamples: run greedy and brute force side by side on small inputs. So that all three rules can share it, the skeleton compares every candidate against all the intervals chosen so far; once you have committed to sorting by finish time, comparing against the last chosen one is enough, and the Interval Scheduling lesson writes it that way in O(n log n).",
  problems: [
    { src: "LeetCode 455", name: "Assign Cookies (sort, then two pointers)", diff: "Easy" },
    { src: "LeetCode 1029", name: "Two City Scheduling (sort by the difference)", diff: "Medium" },
    { src: "LeetCode 763", name: "Partition Labels", diff: "Medium" },
    { src: "LeetCode 406", name: "Queue Reconstruction by Height", diff: "Medium" },
    { src: "LeetCode 621", name: "Task Scheduler", diff: "Medium" },
    { src: "LeetCode 135", name: "Candy (two greedy passes)", diff: "Hard" },
  ],
};
