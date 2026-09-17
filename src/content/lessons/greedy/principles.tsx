import { GreedyPrinciplesDemo } from "@/components/lesson/demos/GreedyPrinciplesDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `# Interval scheduling: one skeleton, three sort keys, and only "earliest finish" is correct
def schedule(intervals, key):
    """intervals is a list of (start, end); key decides the greedy order.
    Returns the chosen intervals, none of which overlap (touching endpoints are allowed)."""
    chosen = []
    for s, e in sorted(intervals, key=key):
        # Only take an interval that clashes with none of the chosen ones. Comparing against the
        # last finish time alone is not enough: sorting by length can hand us an earlier interval later
        if all(e <= cs or s >= ce for cs, ce in chosen):
            chosen.append((s, e))
    return chosen


def by_start(iv):                             # earliest start: wrong
    return iv[0]

def by_length(iv):                            # shortest: wrong
    return (iv[1] - iv[0], iv[0])

def by_end(iv):                               # earliest finish: correct
    return iv[1]


# Brute force: enumerate every subset on small inputs and see whether greedy reached the optimum
# Run this first when no exchange argument comes to mind; a counterexample saves you the proof
from itertools import combinations

def brute_force(intervals):
    n = len(intervals)
    for r in range(n, 0, -1):                 # largest sizes first, so the first feasible one is optimal
        for subset in combinations(intervals, r):
            ok = all(a[1] <= b[0] or b[1] <= a[0] for a, b in combinations(subset, 2))
            if ok:
                return r
    return 0


if __name__ == "__main__":
    ivs = [(0, 12), (1, 5), (4, 7), (6, 10), (11, 14), (13, 16), (15, 18)]
    print(brute_force(ivs))                   # 4
    for name, key in [("start", by_start), ("length", by_length), ("end", by_end)]:
        print(name, len(schedule(ivs, key)))  # start 2, length 3, end 4`;

const cpp = `#include <vector>
#include <algorithm>
#include <functional>
#include <cstdio>

using Iv = std::pair<int, int>;               // (start, end)

// Sort by cmp, then take each interval in turn: only if it clashes with none already chosen
std::vector<Iv> schedule(std::vector<Iv> ivs, std::function<bool(const Iv&, const Iv&)> cmp) {
    std::sort(ivs.begin(), ivs.end(), cmp);
    std::vector<Iv> chosen;
    for (auto& [s, e] : ivs) {
        bool ok = true;
        for (auto& [cs, ce] : chosen)
            if (!(e <= cs || s >= ce)) { ok = false; break; }
        if (ok) chosen.push_back({s, e});
    }
    return chosen;
}

bool byStart(const Iv& a, const Iv& b) { return a.first < b.first; }          // wrong
bool byLength(const Iv& a, const Iv& b) {                                       // wrong
    int la = a.second - a.first, lb = b.second - b.first;
    return la != lb ? la < lb : a.first < b.first;
}
bool byEnd(const Iv& a, const Iv& b) { return a.second < b.second; }            // correct

// Brute force: enumerate every subset (only runnable for n ≤ 20)
int bruteForce(const std::vector<Iv>& ivs) {
    int n = ivs.size(), best = 0;
    for (int mask = 0; mask < (1 << n); mask++) {
        bool ok = true;
        for (int i = 0; i < n && ok; i++) if (mask >> i & 1)
            for (int j = i + 1; j < n && ok; j++) if (mask >> j & 1)
                if (!(ivs[i].second <= ivs[j].first || ivs[j].second <= ivs[i].first)) ok = false;
        if (ok) best = std::max(best, __builtin_popcount(mask));
    }
    return best;
}

int main() {
    std::vector<Iv> ivs = {{0, 12}, {1, 5}, {4, 7}, {6, 10}, {11, 14}, {13, 16}, {15, 18}};
    printf("%d\\n", bruteForce(ivs));                                           // 4
    printf("%zu %zu %zu\\n", schedule(ivs, byStart).size(),
           schedule(ivs, byLength).size(), schedule(ivs, byEnd).size());       // 2 3 4
}`;

export const skeleton: LessonSkeleton = {
  demo: <GreedyPrinciplesDemo />,
  code: { python, cpp },
};
