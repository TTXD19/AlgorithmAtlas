import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Subset enumeration, memoization and tabulation",
  applications: [
    {
      title: "A courier with 12 stops on one run",
      problem:
        "A delivery platform has to order the 12 stops on a courier's run and bring them back to the restaurant, with the distance matrix already computed by a maps service. Brute-forcing every order means 12! ≈ 480 million of them, and dispatch has to answer within a second.",
      why: 'When you decide where to go next, the only things that matter are which stops are already delivered and where you are standing now; the order you delivered them in has no effect on the distance still to come. Store the delivered stops as a 12-bit integer mask and there are only 2¹² × 12 = 49,152 states, each trying 12 next stops — roughly 590,000 operations. This is the Held–Karp algorithm.',
    },
    {
      title: "Five engineers, five projects",
      problem:
        "Each engineer estimates a different number of hours for each project, one project per person, and the manager wants the total hours as low as possible. There are 5! = 120 assignments; grow the team to 16 and there are 2×10¹³.",
      why: "Pick a project for engineer 0, then 1, then 2, and so on, keeping the already-taken projects in a mask. Which engineer comes next is exactly the number of 1 bits in the mask, so the state is just the mask itself. Sixteen people give only 65,536 states, each trying 16 projects — about a million operations. Beyond that, switch to the Hungarian algorithm.",
    },
    {
      title: "Staffing: cover every day of the week with the fewest hires",
      problem:
        "A coffee shop needs someone behind the counter all 7 days, and each of the 30 applicants is only available on certain days. The owner wants the smallest number of hires that covers every day.",
      why: "There are only 2⁷ = 128 possible answers to \"which days are covered so far\". Start from the empty set, OR in each new hire's available days, and let dp[covered] remember the fewest people needed to cover that set. 128 states × 30 applicants finishes it, far faster than trying combinations of the 30 people.",
    },
  ],
  cue: "n ≤ 20, each element either used or unused, visit every point once (TSP), assignment, cover every requirement, the state is a set, dp[mask], dp[mask][last], 2ⁿ states.",
  steps: [
    "Confirm the size is small (n up to about 20) and that later decisions depend on **which** elements have been used.",
    "Define the state: `dp[mask]`, or `dp[mask][j]` when you also need to know the last element. Bit i stands for element i.",
    "Set the base case, such as `dp[1][0] = 0` for TSP (only start city 0 visited) or `dp[0] = 0` for assignment.",
    "Sweep mask in ascending order. For each reachable state, try adding an unused element k and update the next state via `mask | (1 << k)`, recording a parent if you need to reconstruct the solution.",
    "The answer sits at the full set `(1 << n) − 1`. For TSP, add the edge back to the start and take the minimum; following the parents backwards gives the route.",
  ],
  demoNote:
    "A complete distance graph on 4 cities, starting at city 0, visiting each city once and returning to 0. The table on the right lists the 8 masks that contain the start; each cell dp[mask][j] is the cheapest way to cover mask and stop at j, and the masks are filled in ascending order. Filling one cell means checking every possible previous stop: blue in the table is the state being filled, yellow is the dp[mask without j][previous] it reads. The graph on the left follows along, marking the current position blue, the previous stop yellow, and the cities already in the mask green, with the edge under consideration drawn in blue. Once every city is covered, add the distance back to 0: the shortest tour is 80, along 0 → 2 → 3 → 1 → 0. That last step is also why DP beats enumerating permutations as n grows.",
  codeNote:
    'Python has the "push" form of TSP (including route reconstruction) and the assignment problem, which needs only the mask and never the last position. C++ has the "pull" form of TSP, matching the interactive demo, plus the fewest-hires staffing cover: the state is the set of days already staffed, and each hire ORs in the days they can work.',
  problems: [
    { src: "LeetCode 526", name: "Beautiful Arrangement (mask is the numbers used, the next position is the popcount)", diff: "Medium" },
    { src: "LeetCode 1986", name: "Minimum Number of Work Sessions to Finish the Tasks (mask is the finished tasks)", diff: "Medium" },
    { src: "LeetCode 698", name: "Partition to K Equal Sum Subsets (dp[mask] tracks how full the current bucket is)", diff: "Medium" },
    { src: "LeetCode 1879", name: "Minimum XOR Sum of Two Arrays (the assignment problem in disguise)", diff: "Hard" },
    { src: "LeetCode 847", name: "Shortest Path Visiting All Nodes (BFS over (mask, node))", diff: "Hard" },
    { src: "LeetCode 943", name: "Find the Shortest Superstring (TSP with overlap length as the distance)", diff: "Hard" },
  ],
};
