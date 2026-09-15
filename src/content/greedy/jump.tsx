import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { JumpGameDemo } from "@/components/lesson/demos/JumpGameDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# Jump Game（LeetCode 55）：能不能從 0 跳到最後一格
def can_jump(nums):
    far = 0                                  # 目前確定能踩到的最遠位置
    for i, step in enumerate(nums):
        if i > far:                          # 這格踩不到，後面全部到不了
            return False
        far = max(far, i + step)
        if far >= len(nums) - 1:             # 已經蓋到終點，提早結束
            return True
    return True


# Jump Game II（LeetCode 45）：最少跳幾次（題目保證到得了）
def min_jumps(nums):
    jumps = 0
    cur_end = 0                              # 這一跳能到的右邊界（BFS 的一層）
    far = 0                                  # 下一跳能到的最遠處
    for i in range(len(nums) - 1):           # 站在最後一格不用再跳
        far = max(far, i + nums[i])
        if i == cur_end:                     # 走到這層的邊界，必須跳了
            jumps += 1
            cur_end = far
            if cur_end >= len(nums) - 1:
                break
    return jumps


# 同型變形：加油站（LeetCode 134）
# 總油量夠就一定有解；從 start 出發途中油量變負，start 到這裡都不可能是起點
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

// Jump Game：能不能到最後一格
bool canJump(const std::vector<int>& nums) {
    int n = nums.size(), far = 0;             // far：目前確定能到的最遠位置
    for (int i = 0; i < n; i++) {
        if (i > far) return false;            // 這格踩不到
        far = std::max(far, i + nums[i]);
        if (far >= n - 1) return true;        // 提早結束
    }
    return true;
}

// Jump Game II：最少跳幾次
int minJumps(const std::vector<int>& nums) {
    int n = nums.size(), jumps = 0, curEnd = 0, far = 0;
    for (int i = 0; i < n - 1; i++) {         // 最後一格不用再跳
        far = std::max(far, i + nums[i]);
        if (i == curEnd) {                    // 這一層看完，必須跳
            jumps++;
            curEnd = far;
            if (curEnd >= n - 1) break;
        }
    }
    return jumps;
}

// 加油站：同樣是「維護能不能撐到下一格」
int canCompleteCircuit(const std::vector<int>& gas, const std::vector<int>& cost) {
    if (std::accumulate(gas.begin(), gas.end(), 0) < std::accumulate(cost.begin(), cost.end(), 0)) return -1;
    int start = 0, tank = 0;
    for (int i = 0; i < (int)gas.size(); i++) {
        tank += gas[i] - cost[i];
        if (tank < 0) { start = i + 1; tank = 0; }   // start 到 i 都不可能是起點
    }
    return start;
}

int main() {
    printf("%d %d\\n", canJump({2, 3, 1, 1, 4, 1, 0, 2, 1}), canJump({3, 2, 1, 0, 4}));   // 1 0
    printf("%d\\n", minJumps({2, 3, 1, 1, 4, 1, 0, 2, 1}));                            // 3
    printf("%d\\n", canCompleteCircuit({1, 2, 3, 4, 5}, {3, 4, 5, 1, 2}));               // 3
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "電動車的充電站規劃",
              problem: "一條公路上有幾個充電站，每站充飽後能跑的距離不同。從起點出發，能不能到終點？最少要停幾次？試每一種停靠組合是指數級。",
              why: "只要維護一個數字「目前最遠能到哪」，從左到右掃一遍。每到一站就更新這個上限；哪一站超出上限，就是到不了。最少停幾次是同一個掃描，加上「這一段的邊界在哪」的計數。O(n)，不用試任何組合。",
            },
            {
              title: "資源夠不夠撐到目標",
              problem: "專案每個階段會產生一定的預算餘裕，也會消耗一些。從第一階段開始，能不能一路撐到結案？從哪個階段開始才撐得過一整輪？",
              why: "加油站問題的形狀：每格有收入和支出，問能否走完。貪婪的關鍵觀察是「如果從 A 出發在 B 之前油量變負，那 A 到 B 之間任何一點出發都不行」，所以起點可以直接跳到 B 的下一格，整體一樣是一趟掃描。",
            },
            {
              title: "影片剪輯與灑水器覆蓋",
              problem: "有一堆片段各自覆蓋 [起點, 終點]，要用最少片段拼出完整的 0 到 T；或者花園裡每個灑水器有覆蓋半徑，要開最少幾個把整條澆到。",
              why: "把每個位置能「跳到」的最遠處算出來，就變成 Jump Game II：每一層挑能延伸最遠的，層數就是最少片段數。認出「最遠可達」這個狀態，很多覆蓋問題就都是同一題。",
            },
          ]}
          cue="能不能到達、最遠可達、最少幾跳、每格能往前跳幾步、覆蓋整段用最少片段、油量會不會變負。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>Jump Game</strong>：陣列 <Code>nums[i]</Code> 是站在第 i 格最多能往前跳幾步，問能不能從第 0 格跳到最後一格。暴力做法是 DFS 或 DP 試每個落點，O(n²)。貪婪只維護一個變數 <Code>far</Code>，<strong>目前確定能踩到的最遠位置</strong>。從左到右掃，若 <Code>i &gt; far</Code> 代表第 i 格踩不到，直接回傳 false；否則 <Code>far = max(far, i + nums[i])</Code>。掃完或 far 蓋到終點就是 true。<strong>O(n)</strong> 時間，O(1) 空間。
        </p>
        <p>
          為什麼可以只記最遠？因為能踩到的格子一定是<strong>從 0 到 far 的連續一段</strong>：若能跳到 far，那 far 之前的每一格也都經得過（跳短一點就好）。所以「能不能到 i」等價於「i ≤ far」，不需要記住每一格的可達性。這個觀察把 DP 的 n 個狀態壓成一個數字，是貪婪能取代 DP 的典型原因。
        </p>
        <p>
          <strong>Jump Game II</strong> 問最少跳幾次。把它看成 BFS：第 0 跳能到的範圍是 [0, nums[0]]，第 1 跳能到的是從那個範圍內任一格出發的最遠處，依此類推。實作上用 <Code>cur_end</Code> 記這一層的右邊界、<Code>far</Code> 記下一層的最遠處；掃到 <Code>i == cur_end</Code> 就代表這一層看完了，必須跳一次，<Code>cur_end = far</Code>。每一層都挑能延伸最遠的落點，這是貪婪選擇：任何最佳解在這一層的落點都不會比 far 更遠，換成 far 不會變差。迴圈只跑到 n − 2，站在最後一格不需要再跳。
        </p>
        <p>
          常見誤區：第一題用 DP 也對，但空間多了 O(n)，面試官通常期待 O(1)；第二題若寫成「每步跳到 nums 最大的格子」是錯的，該比較的是 <Code>i + nums[i]</Code>（能到多遠），不是 <Code>nums[i]</Code>（跳多遠）。另外 far 的更新不能省略「max」，跳到比目前更近的地方不會讓可達範圍縮小。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <><Code>far = 0</Code>。從 i = 0 開始往右掃。</>,
            <>若 <Code>i &gt; far</Code>，第 i 格踩不到，回傳 false。</>,
            <><Code>far = max(far, i + nums[i])</Code>。若 <Code>far &gt;= n − 1</Code>，回傳 true。</>,
            <>最少跳數版：另外記 <Code>cur_end</Code>（這一跳的右邊界）與 <Code>jumps</Code>。掃到 <Code>i == cur_end</Code> 時 <Code>jumps += 1</Code>、<Code>cur_end = far</Code>。</>,
            <>迴圈只到 n − 2，<Code>cur_end &gt;= n − 1</Code> 時提早結束，回傳 jumps。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>切換兩個問題和兩組陣列。綠色格子是目前確定踩得到的，far 只會往右長。最少跳數版多了一條黃色邊界 cur_end，掃到邊界就跳一次；黃色格子是每次起跳的位置。試試「卡在 0」那組，看 far 是怎麼停下來的。</p>
        <JumpGameDemo />
      </Section>

      <Section id="code">
        <p>能不能到、最少幾跳，以及同型的加油站問題。三個函式都是一趟掃描加一兩個變數。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 55", name: "Jump Game", diff: "Medium" },
            { src: "LeetCode 45", name: "Jump Game II", diff: "Medium" },
            { src: "LeetCode 134", name: "Gas Station", diff: "Medium" },
            { src: "LeetCode 1024", name: "Video Stitching（片段覆蓋，同 Jump Game II）", diff: "Medium" },
            { src: "LeetCode 1306", name: "Jump Game III（可以往左跳，改用 BFS）", diff: "Medium" },
            { src: "LeetCode 1326", name: "Minimum Number of Taps to Open to Water a Garden", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const jumpLesson: Lesson = { prereq: "Greedy Principles、Array", Body };
