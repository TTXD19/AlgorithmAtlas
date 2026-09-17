import { BinaryAnswerDemo } from "@/components/lesson/demos/BinaryAnswerDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `# Koko eating bananas (LeetCode 875): she eats k per hour; what is the slowest k that finishes within h hours?
# The answer k lies in 1..max(piles) (the problem guarantees h >= the pile count, so k = max always works)
# "k is feasible" is monotone in k: anything faster is feasible too
def min_eating_speed(piles, h):
    def feasible(k):                       # feasibility check: is speed k fast enough?
        hours = sum((p + k - 1) // k for p in piles)   # ceil(p / k) for each pile
        return hours <= h

    lo, hi = 1, max(piles)                 # the range of the answer
    while lo < hi:                         # same shape as lower_bound: find the first feasible value
        mid = (lo + hi) // 2
        if feasible(mid):
            hi = mid                       # mid works, so the answer is <= mid
        else:
            lo = mid + 1                   # mid fails, so the answer is > mid
    return lo


# The same skeleton: least ship capacity (LeetCode 1011)
# Capacity cap is feasible = load in order, start a new day on overflow, and the day count is <= days
def ship_within_days(weights, days):
    def feasible(cap):
        d, cur = 1, 0
        for w in weights:
            if cur + w > cap:
                d += 1
                cur = 0
            cur += w
        return d <= days

    lo, hi = max(weights), sum(weights)    # lower bound: the heaviest item; upper bound: everything in one day
    while lo < hi:
        mid = (lo + hi) // 2
        if feasible(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo


# Monotonicity the other way round: the largest feasible value, e.g. the longest pieces logs can be cut into (each >= L)
# Now the feasible values sit on the left, so switch to the "last feasible" form: round mid up and set lo = mid
def max_piece_length(logs, need):
    def feasible(L):                       # with pieces of length L, are there enough of them?
        return sum(x // L for x in logs) >= need

    lo, hi = 1, max(logs)
    while lo < hi:
        mid = (lo + hi + 1) // 2           # round up, or lo = mid gets stuck
        if feasible(mid):
            lo = mid                       # mid works, so the answer is >= mid
        else:
            hi = mid - 1
    return lo if feasible(lo) else 0


if __name__ == "__main__":
    print(min_eating_speed([30, 11, 23, 4, 20], 6))          # 23
    print(ship_within_days([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5))   # 15
    print(max_piece_length([10, 7, 5], 4))                   # 5`;

const cpp = `#include <vector>
#include <iostream>
#include <algorithm>
#include <numeric>

// Koko eating bananas: the smallest feasible speed
int minEatingSpeed(const std::vector<int>& piles, int h) {
    auto feasible = [&](int k) {           // feasibility check
        long long hours = 0;
        for (int p : piles) hours += ((long long)p + k - 1) / k;   // ceil(p / k); cast first so p + k cannot overflow
        return hours <= h;
    };
    int lo = 1, hi = *std::max_element(piles.begin(), piles.end());
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (feasible(mid)) hi = mid;       // feasible, so the answer is <= mid
        else lo = mid + 1;                 // not feasible, so the answer is > mid
    }
    return lo;
}

// Least ship capacity
int shipWithinDays(const std::vector<int>& weights, int days) {
    auto feasible = [&](int cap) {
        int d = 1, cur = 0;
        for (int w : weights) {
            if (cur + w > cap) { d++; cur = 0; }
            cur += w;
        }
        return d <= days;
    };
    int lo = *std::max_element(weights.begin(), weights.end());
    int hi = std::accumulate(weights.begin(), weights.end(), 0);
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (feasible(mid)) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}

// The largest feasible value: cut logs into need pieces, each at least L long
int maxPieceLength(const std::vector<int>& logs, int need) {
    auto feasible = [&](int L) {
        long long cnt = 0;
        for (int x : logs) cnt += x / L;
        return cnt >= need;
    };
    int lo = 1, hi = *std::max_element(logs.begin(), logs.end());
    while (lo < hi) {
        int mid = lo + (hi - lo + 1) / 2;  // round up
        if (feasible(mid)) lo = mid;       // feasible, so the answer is >= mid
        else hi = mid - 1;
    }
    return feasible(lo) ? lo : 0;
}

int main() {
    std::cout << minEatingSpeed({30, 11, 23, 4, 20}, 6) << "\\n";                  // 23
    std::cout << shipWithinDays({1, 2, 3, 4, 5, 6, 7, 8, 9, 10}, 5) << "\\n";     // 15
    std::cout << maxPieceLength({10, 7, 5}, 4) << "\\n";                          // 5
}`;

export const skeleton: LessonSkeleton = {
  demo: <BinaryAnswerDemo />,
  code: { python, cpp },
};
