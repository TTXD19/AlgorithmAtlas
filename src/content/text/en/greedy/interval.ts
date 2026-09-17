import type { LessonText } from "@/lib/lesson-model";

export const text: LessonText = {
  prereq: "Greedy Principles",
  applications: [
    {
      title: "One room, as many meetings as possible",
      problem:
        "Nine teams have all booked the same meeting room and their slots overlap. The office manager wants to fit in as many meetings as possible without moving anyone's time. Trying every combination is 2⁹ possibilities, and it explodes the moment a few more requests arrive.",
      why: "Sort by finish time and take, each time, the earliest-finishing meeting that does not clash. Finishing early leaves more of the day for whatever comes next, and an exchange argument turns that intuition into a proof that the result is optimal. One sort and one pass: O(n log n).",
    },
    {
      title: "Scheduling jobs on a CPU",
      problem:
        "An operating system can run one job at a time, and each job has an arrival time and a duration. You want either to finish as many jobs as possible, or to keep the average waiting time as low as possible.",
      why: '"As many jobs as possible" is interval scheduling: run whichever finishes earliest. "The lowest average wait" is its close relative, shortest job first, and the same exchange argument proves it — swap a long job with a shorter one that follows it and the total waiting time can only go down.',
    },
    {
      title: "Ad slots and machine bookings",
      problem:
        "An agency wants to squeeze as many ads as possible into a day's programming, each with a fixed slot. A factory machine is booked by several orders, and the overlapping bookings have to be merged into blocks to work out how long it is occupied. Or, turned around: how many orders run at the same time, and so how many machines are needed?",
      why: "All three are variations on the same interval problem: pick as many non-overlapping intervals as possible (sort by finish time), merge the overlapping ones (sort by start time), and count how many overlap at once (a sweep line). Recognising the shape tells you which key to sort on.",
    },
  ],
  cue: "Meeting rooms, time slots, non-overlapping, the most you can fit in, merging intervals, how many run at once, sorting by finish time.",
  steps: [
    "Sort every interval by **finish time**, smallest first.",
    "Initialise `last_end = −∞`, the finish time of the last interval chosen so far.",
    "Take each interval (s, e) in turn: if `s >= last_end`, choose it and set `last_end = e`; otherwise skip it.",
    "When the sweep ends you have the answer: the chosen intervals do not overlap, and no larger set exists.",
    "Variations: to **merge**, sort by start time and extend the finish instead; to **count how many run at once**, switch to a sweep line with +1 at each start and −1 at each end.",
  ],
  demoNote:
    'Nine meetings are competing for one room. The first step sorts them by finish time, and after that each step considers one meeting: if its start is no earlier than the amber line (the running finish time), it goes in, otherwise it is skipped. Watch how long meetings like B "Interview" and G "One-on-one" get eliminated without any special handling.',
  codeNote:
    "Interval scheduling itself, plus its two most common variations: merging overlapping intervals, and counting the fewest rooms. All three are a sort followed by a single pass, and only the sort key and what happens during the pass change.",
  problems: [
    { src: "LeetCode 2446", name: "Determine if Two Events Have Conflict (do two intervals overlap?)", diff: "Easy" },
    { src: "LeetCode 435", name: "Non-overlapping Intervals (n minus the interval-scheduling answer)", diff: "Medium" },
    { src: "LeetCode 56", name: "Merge Intervals", diff: "Medium" },
    { src: "LeetCode 2406", name: "Divide Intervals Into Minimum Number of Groups (the fewest rooms again: a sweep line or a min-heap)", diff: "Medium" },
    { src: "LeetCode 452", name: "Minimum Number of Arrows to Burst Balloons", diff: "Medium" },
    { src: "LeetCode 1353", name: "Maximum Number of Events That Can Be Attended (each day, take the one that finishes earliest)", diff: "Medium" },
  ],
};
