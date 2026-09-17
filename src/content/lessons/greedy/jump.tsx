import { JumpGameDemo } from "@/components/lesson/demos/JumpGameDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

const python = `# Jump Game (LeetCode 55): can you get from index 0 to the last cell?
def can_jump(nums):
    far = 0                                  # furthest position we are sure we can stand on
    for i, step in enumerate(nums):
        if i > far:                          # this cell is out of reach, so everything after it is too
            return False
        far = max(far, i + step)
        if far >= len(nums) - 1:             # the end is already covered, so stop early
            return True
    return True


# Jump Game II (LeetCode 45): fewest jumps (the problem guarantees the end is reachable)
def min_jumps(nums):
    jumps = 0
    cur_end = 0                              # right edge this jump can reach (one BFS level)
    far = 0                                  # furthest the next jump can reach
    for i in range(len(nums) - 1):           # standing on the last cell needs no further jump
        far = max(far, i + nums[i])
        if i == cur_end:                     # we hit this level's edge, so we have to jump
            jumps += 1
            cur_end = far
            if cur_end >= len(nums) - 1:
                break
    return jumps


# Same shape in different clothes: Gas Station (LeetCode 134)
# Enough fuel overall guarantees a solution; if the tank goes negative on the way from start, no index from start to here can be the starting point
def can_complete_circuit(gas, cost):
    if sum(gas) < sum(cost):
        return -1
    start = tank = 0
    for i in range(len(gas)):
        tank += gas[i] - cost[i]
        if tank < 0:
            start, tank = i + 1, 0
    return start


if __name__ == "__main__":
    print(can_jump([2, 3, 1, 1, 4, 1, 0, 2, 1]))   # True
    print(can_jump([3, 2, 1, 0, 4]))               # False
    print(min_jumps([2, 3, 1, 1, 4, 1, 0, 2, 1]))  # 3
    print(can_complete_circuit([1, 2, 3, 4, 5], [3, 4, 5, 1, 2]))   # 3`;

const cpp = `#include <vector>
#include <algorithm>
#include <numeric>
#include <cstdio>

// Jump Game: can we reach the last cell?
bool canJump(const std::vector<int>& nums) {
    int n = nums.size(), far = 0;             // far: furthest position we are sure we can reach
    for (int i = 0; i < n; i++) {
        if (i > far) return false;            // this cell is out of reach
        far = std::max(far, i + nums[i]);
        if (far >= n - 1) return true;        // stop early
    }
    return true;
}

// Jump Game II: fewest jumps
int minJumps(const std::vector<int>& nums) {
    int n = nums.size(), jumps = 0, curEnd = 0, far = 0;
    for (int i = 0; i < n - 1; i++) {         // the last cell needs no further jump
        far = std::max(far, i + nums[i]);
        if (i == curEnd) {                    // this level is finished, so we have to jump
            jumps++;
            curEnd = far;
            if (curEnd >= n - 1) break;
        }
    }
    return jumps;
}

// Gas Station: again just tracking whether we can make it to the next stop
int canCompleteCircuit(const std::vector<int>& gas, const std::vector<int>& cost) {
    if (std::accumulate(gas.begin(), gas.end(), 0) < std::accumulate(cost.begin(), cost.end(), 0)) return -1;
    int start = 0, tank = 0;
    for (int i = 0; i < (int)gas.size(); i++) {
        tank += gas[i] - cost[i];
        if (tank < 0) { start = i + 1; tank = 0; }   // nothing from start to i can be the starting point
    }
    return start;
}

int main() {
    printf("%d %d\\n", canJump({2, 3, 1, 1, 4, 1, 0, 2, 1}), canJump({3, 2, 1, 0, 4}));   // 1 0
    printf("%d\\n", minJumps({2, 3, 1, 1, 4, 1, 0, 2, 1}));                            // 3
    printf("%d\\n", canCompleteCircuit({1, 2, 3, 4, 5}, {3, 4, 5, 1, 2}));               // 3
}`;

export const skeleton: LessonSkeleton = {
  demo: <JumpGameDemo />,
  code: { python, cpp },
};
