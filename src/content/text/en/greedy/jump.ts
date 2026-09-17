import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Greedy principles, arrays",
  applications: [
    {
      title: "Planning charging stops for an electric car",
      problem:
        "A highway has a handful of charging stations, and a full charge at each one takes you a different distance. Starting at the beginning, can you reach the end at all? And what is the fewest number of stops? Trying every combination of stops is exponential.",
      why: "All you have to maintain is a single number — the furthest point you can currently reach — while sweeping left to right. Each station updates that ceiling, and the first station beyond the ceiling is the one you cannot reach. The fewest stops comes from the same sweep, plus a count of where each segment's boundary falls. O(n), with no combinations tried at all.",
    },
    {
      title: "Will the resources last until the goal?",
      problem:
        "Each phase of a project produces a certain amount of budget headroom and consumes some as well. Starting from the first phase, can you stay solvent all the way to delivery? And which phase would you have to start from to survive a full cycle?",
      why: "This is the shape of the Gas Station problem: every cell has an income and an expense, and you ask whether you can complete the loop. The key greedy observation is that if you start at A and the tank goes negative before B, then no starting point between A and B works either — so the candidate start jumps straight past B, and the whole thing is still one sweep.",
    },
    {
      title: "Video stitching and garden sprinklers",
      problem:
        "You have a pile of clips, each covering some [start, end], and want to cover the whole span from 0 to T with the fewest clips. Or: every sprinkler in a garden has a coverage radius and you want to open the fewest of them to water the whole strip.",
      why: "Work out how far each position can \"jump\" to and it becomes Jump Game II: pick the reach that extends furthest at each level, and the number of levels is the fewest clips. Once you recognise furthest-reachable as the state to track, a lot of covering problems turn out to be the same problem.",
    },
  ],
  cue: "Whether the end is reachable, furthest reachable position, fewest jumps, how many steps forward each cell allows, covering a whole span with the fewest pieces, whether a fuel tank ever goes negative.",
  steps: [
    "`far = 0`. Sweep rightwards starting at i = 0.",
    "If `i > far`, cell i cannot be reached, so return false.",
    "`far = max(far, i + nums[i])`. If `far >= n − 1`, return true.",
    "For the fewest-jumps version, also track `cur_end` (the right edge of the current jump) and `jumps`. When the sweep reaches `i == cur_end`, do `jumps += 1` and `cur_end = far`.",
    "The loop only runs to n − 2, stops early once `cur_end >= n − 1`, and returns jumps.",
  ],
  demoNote:
    "Switch between the two problems and the two arrays. Green cells are the ones currently known to be reachable, and far only ever grows to the right. The fewest-jumps version adds the yellow boundary cur_end, and reaching that boundary costs one jump; the yellow cells mark where each jump starts. Try the array that gets stuck on a 0 and watch how far grinds to a halt.",
  codeNote:
    "Reachability, fewest jumps, and the identically shaped Gas Station problem. All three functions are one sweep plus a variable or two.",
  problems: [
    { src: "LeetCode 55", name: "Jump Game", diff: "Medium" },
    { src: "LeetCode 45", name: "Jump Game II", diff: "Medium" },
    { src: "LeetCode 134", name: "Gas Station", diff: "Medium" },
    { src: "LeetCode 1024", name: "Video Stitching (interval cover; the same as Jump Game II)", diff: "Medium" },
    { src: "LeetCode 1306", name: "Jump Game III (jumps may go left, so use BFS)", diff: "Medium" },
    { src: "LeetCode 1326", name: "Minimum Number of Taps to Open to Water a Garden", diff: "Hard" },
  ],
};
