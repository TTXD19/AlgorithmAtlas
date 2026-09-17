import { IntervalSchedulingDemo } from "@/components/lesson/demos/IntervalSchedulingDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

const python = `# Interval scheduling: the most meetings one room can host (greedy by finish time)
def max_meetings(intervals):
    intervals = sorted(intervals, key=lambda iv: iv[1])   # sort by finish time
    chosen = []
    last_end = float("-inf")
    for s, e in intervals:
        if s >= last_end:                    # no clash with the previous one (touching ends are fine)
            chosen.append((s, e))
            last_end = e
    return chosen


# Merge overlapping intervals (LeetCode 56): sort by start time, join whatever touches
def merge_intervals(intervals):
    intervals = sorted(intervals, key=lambda iv: iv[0])
    merged = []
    for s, e in intervals:
        if merged and s <= merged[-1][1]:    # overlaps the previous block
            merged[-1][1] = max(merged[-1][1], e)
        else:
            merged.append([s, e])
    return merged


# Fewest rooms needed (LeetCode 253): a sweep line for how many meetings run at once
def min_rooms(intervals):
    events = []
    for s, e in intervals:
        events.append((s, 1))                # a start: +1
        events.append((e, -1))               # an end: -1
    events.sort()                            # at the same instant ends come before starts (-1 < 1)
    rooms = best = 0
    for _, d in events:
        rooms += d
        best = max(best, rooms)
    return best


if __name__ == "__main__":
    mtgs = [(0, 3), (1, 6), (2, 4), (4, 7), (6, 8), (7, 11), (8, 12), (10, 14), (13, 16)]
    print(max_meetings(mtgs))                # [(0, 3), (4, 7), (7, 11), (13, 16)]
    print(merge_intervals([[1, 3], [2, 6], [8, 10], [9, 12]]))   # [[1, 6], [8, 12]]
    print(min_rooms([(0, 30), (5, 10), (15, 20)]))              # 2`;

const cpp = `#include <vector>
#include <algorithm>
#include <climits>
#include <cstdio>

using Iv = std::pair<int, int>;               // (start, end)

// Interval scheduling: the most meetings one room can host
std::vector<Iv> maxMeetings(std::vector<Iv> ivs) {
    std::sort(ivs.begin(), ivs.end(), [](const Iv& a, const Iv& b) { return a.second < b.second; });
    std::vector<Iv> chosen;
    int lastEnd = INT_MIN;
    for (auto& [s, e] : ivs) {
        if (s >= lastEnd) { chosen.push_back({s, e}); lastEnd = e; }
    }
    return chosen;
}

// Merge overlapping intervals: sort by start time
std::vector<Iv> mergeIntervals(std::vector<Iv> ivs) {
    std::sort(ivs.begin(), ivs.end());        // std::pair compares first before second
    std::vector<Iv> merged;
    for (auto& [s, e] : ivs) {
        if (!merged.empty() && s <= merged.back().second)
            merged.back().second = std::max(merged.back().second, e);
        else
            merged.push_back({s, e});
    }
    return merged;
}

// Fewest rooms: a sweep line
int minRooms(const std::vector<Iv>& ivs) {
    std::vector<std::pair<int, int>> events;  // (time, +1 or -1)
    for (auto& [s, e] : ivs) { events.push_back({s, 1}); events.push_back({e, -1}); }
    std::sort(events.begin(), events.end());  // at the same instant -1 comes before +1
    int rooms = 0, best = 0;
    for (auto& [t, d] : events) { rooms += d; best = std::max(best, rooms); }
    return best;
}

int main() {
    std::vector<Iv> mtgs = {{0, 3}, {1, 6}, {2, 4}, {4, 7}, {6, 8}, {7, 11}, {8, 12}, {10, 14}, {13, 16}};
    printf("%zu\\n", maxMeetings(mtgs).size());                            // 4
    printf("%zu\\n", mergeIntervals({{1, 3}, {2, 6}, {8, 10}, {9, 12}}).size());   // 2
    printf("%d\\n", minRooms({{0, 30}, {5, 10}, {15, 20}}));               // 2
}`;

export const skeleton: LessonSkeleton = {
  demo: <IntervalSchedulingDemo />,
  code: { python, cpp },
};
