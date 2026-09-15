import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { SlidingWindowDemo } from "@/components/lesson/demos/SlidingWindowDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# 可變視窗：最長不重複子字串（LeetCode 3）
# r 每次往右加一個字元；視窗不合法（有重複）時 l 往右縮到合法為止
def length_of_longest_substring(s):
    seen = set()                           # 視窗裡的字元
    l = 0
    best = 0
    for r, c in enumerate(s):
        while c in seen:                   # 視窗不合法
            seen.remove(s[l])
            l += 1
        seen.add(c)
        best = max(best, r - l + 1)
    return best


# 固定視窗：長度 k 的子陣列最大平均（LeetCode 643），假設 1 <= k <= len(nums)
# 每滑一格：加新的、減舊的，不重算整個視窗
def max_average(nums, k):
    total = sum(nums[:k])
    best = total
    for r in range(k, len(nums)):
        total += nums[r] - nums[r - k]     # 進一個、出一個
        best = max(best, total)
    return best / k


# 可變視窗的另一種形狀：和 >= target 的最短子陣列（LeetCode 209）
# 條件一滿足就盡量縮，縮的時候更新答案
# 前提：nums 全是正數。有負數時縮左端不一定讓和變小，視窗就不成立
def min_subarray_len(target, nums):
    l = 0
    total = 0
    best = float("inf")
    for r, x in enumerate(nums):
        total += x
        while total >= target:             # 合法，試著縮到最短
            best = min(best, r - l + 1)
            total -= nums[l]
            l += 1
    return 0 if best == float("inf") else best


# 限流（rate limit）：過去 window 秒內最多 limit 次請求
# 用佇列當視窗，過期的從左邊丟掉
from collections import deque

class RateLimiter:
    def __init__(self, limit, window):
        self.limit, self.window = limit, window
        self.q = deque()                   # 請求的時間戳，遞增

    def allow(self, now):
        while self.q and self.q[0] <= now - self.window:
            self.q.popleft()               # 視窗左端過期
        if len(self.q) < self.limit:
            self.q.append(now)
            return True
        return False


if __name__ == "__main__":
    print(length_of_longest_substring("abcadbcxab"))   # 5
    print(max_average([1, 12, -5, -6, 50, 3], 4))      # 12.75
    print(min_subarray_len(7, [2, 3, 1, 2, 4, 3]))     # 2
    rl = RateLimiter(3, 10)
    print([rl.allow(t) for t in (1, 2, 3, 4, 12)])     # [True, True, True, False, True]`;

const cpp = `#include <string>
#include <vector>
#include <deque>
#include <iostream>
#include <algorithm>
#include <climits>

// 可變視窗：最長不重複子字串
int lengthOfLongestSubstring(const std::string& s) {
    std::vector<int> cnt(256, 0);          // 視窗裡每個 byte 的數量
    int l = 0, best = 0;
    for (int r = 0; r < (int)s.size(); r++) {
        unsigned char c = s[r];            // char 可能是負的，轉成 0..255 才能當索引
        cnt[c]++;
        while (cnt[c] > 1) {               // 視窗不合法，縮
            cnt[(unsigned char)s[l]]--;
            l++;
        }
        best = std::max(best, r - l + 1);
    }
    return best;
}

// 固定視窗：長度 k 的最大平均（1 <= k <= n）
double maxAverage(const std::vector<int>& nums, int k) {
    long long total = 0;
    for (int i = 0; i < k; i++) total += nums[i];
    long long best = total;
    for (int r = k; r < (int)nums.size(); r++) {
        total += (long long)nums[r] - nums[r - k];  // 進一個、出一個，先轉 long long 免得相減溢位
        best = std::max(best, total);
    }
    return (double)best / k;
}

// 可變視窗：和 >= target 的最短子陣列（nums 全是正數）
int minSubarrayLen(int target, const std::vector<int>& nums) {
    int l = 0, best = INT_MAX;
    long long total = 0;
    for (int r = 0; r < (int)nums.size(); r++) {
        total += nums[r];
        while (total >= target) {          // 合法，盡量縮
            best = std::min(best, r - l + 1);
            total -= nums[l++];
        }
    }
    return best == INT_MAX ? 0 : best;
}

// 限流：過去 window 秒內最多 limit 次
class RateLimiter {
    int limit, window;
    std::deque<int> q;                     // 時間戳，遞增
public:
    RateLimiter(int limit, int window) : limit(limit), window(window) {}
    bool allow(int now) {
        while (!q.empty() && q.front() <= now - window) q.pop_front();
        if ((int)q.size() < limit) { q.push_back(now); return true; }
        return false;
    }
};

int main() {
    std::cout << lengthOfLongestSubstring("abcadbcxab") << "\\n";   // 5
    std::cout << maxAverage({1, 12, -5, -6, 50, 3}, 4) << "\\n";     // 12.75
    std::cout << minSubarrayLen(7, {2, 3, 1, 2, 4, 3}) << "\\n";     // 2
    RateLimiter rl(3, 10);
    for (int t : {1, 2, 3, 4, 12}) std::cout << rl.allow(t) << " "; // 1 1 1 0 1
    std::cout << "\\n";
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "監控系統的「過去 5 分鐘平均延遲」",
              problem: "延遲資料每秒進來，儀表板每秒要更新「過去 300 秒的平均」。每秒重新加總 300 筆，資料量一大就跟不上。",
              why: "視窗每秒只變動兩筆：新的一筆進來、最舊的一筆出去。維護一個總和，加一筆減一筆就是新的平均，每秒 O(1)。這是固定長度的滑動視窗。",
            },
            {
              title: "API 限流：每 10 秒最多 100 次",
              problem: "每個請求進來要判斷「這個用戶過去 10 秒內是否已經打了 100 次」。存所有歷史再每次過濾，太慢也太占空間。",
              why: "只保留視窗內的請求時間戳，新請求進來時先把左端過期的丟掉，再看剩多少。每個時間戳進一次、出一次，攤銷 O(1)。視窗的時間跨度固定，但裡面有幾筆請求不固定，所以要用佇列而不是固定大小的陣列。",
            },
            {
              title: "最長不重複子字串、最短滿足條件的子陣列",
              problem: "字串裡最長的一段沒有重複字元；或陣列裡和至少為 S 的最短一段。暴力枚舉所有區間是 O(n²) 甚至 O(n³)。",
              why: "右端往右擴、條件被破壞時左端往右縮，兩端都只往右走。每個元素進出視窗各一次，O(n)。認出「連續區間」加「單調的合法性」，就是可變視窗。",
            },
          ]}
          cue="連續子陣列／子字串、過去 k 個、過去 t 秒、最長／最短滿足條件的區間、串流統計、限流、加一個減一個。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>滑動視窗</strong>是同向雙指標的特例：<Code>l</Code> 和 <Code>r</Code> 之間的區間就是「視窗」，視窗上維護一些<strong>可以增量更新</strong>的統計量（總和、計數、字元集合）。<Code>r</Code> 往右一格就把新元素「加進」統計，<Code>l</Code> 往右一格就把舊元素「減掉」。不重算整個區間，每個元素進出各一次，每次 O(1)，所以 <strong>O(n)</strong>。額外空間是統計量的大小：總和只要 O(1)，集合或計數最多 O(k)（k 是視窗長度或字元種類數）。
        </p>
        <p>
          <strong>固定長度</strong>的視窗最簡單：長度永遠是 k，每步 <Code>r</Code> 和 <Code>l</Code> 同時前進一格，統計量加 <Code>a[r]</Code> 減 <Code>a[l-1]</Code>。過去 k 筆的平均、長度 k 的最大和、固定長度的字母異位詞，都是這個。
        </p>
        <p>
          <strong>可變長度</strong>的視窗靠一個<strong>合法性條件</strong>驅動：<Code>r</Code> 每次擴一格，若視窗不合法（有重複字元、和超過上限），<Code>l</Code> 往右縮到合法為止；若問的是「最短的合法區間」，就反過來，在合法時盡量縮並更新答案。能這樣做的前提是合法性對區間<strong>單調</strong>，而兩種問法要的方向相反：求最長，要「合法的區間縮小後仍合法」（沒有重複的子字串去掉一端還是沒有重複）；求最短，要「合法的區間放大後仍合法」（元素全是正數時，和 ≥ target 的區間再多包一個仍然 ≥ target）。條件跟「和」有關時，陣列一有負數這種單調性就不成立，<Code>l</Code> 不能只往右走，要改用前綴和等其他方法。要<strong>計數</strong>「恰好 k 種」的子陣列，條件本身不單調，就拆成「至多 k 種」的個數減「至多 k−1 種」的個數，每個 <Code>r</Code> 貢獻以它結尾的 <Code>r − l + 1</Code> 個合法子陣列。
        </p>
        <p>
          統計量的選擇決定每步的成本。總和用一個變數；「有沒有重複」用集合或計數陣列；「視窗最大值」沒辦法只靠一個變數維護（最大值移出後不知道下一個是誰），要配合單調佇列，攤銷 O(1)。限流的視窗以時間為界，元素數量不固定，用佇列存時間戳，左端過期就彈出，本質相同。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>確認問的是<strong>連續</strong>區間，且合法性對區間的伸縮是單調的（求最長：縮小仍合法；求最短：放大仍合法）。決定視窗上要維護什麼統計量，必須能 O(1) 加入與移除。</>,
            <><Code>l = 0</Code>，統計量清空。<Code>for r in range(n)</Code>：把 <Code>a[r]</Code> 加進統計量。</>,
            <><Code>while 視窗不合法</Code>：把 <Code>a[l]</Code> 從統計量移除，<Code>l += 1</Code>。這個內層迴圈總共最多跑 n 次，不是每步 n 次。</>,
            <>視窗現在合法，用 <Code>r − l + 1</Code> 更新答案（最長）。找最短時把更新放在縮的迴圈裡，條件改成「合法時縮」。</>,
            <>固定長度時省掉合法性判斷：<Code>r ≥ k</Code> 後每步移除 <Code>a[r − k]</Code>，視窗長度恆為 k。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>最長不重複子字串。藍色格子是目前視窗，下方是視窗裡的字元集合。r 指到一個已經在集合裡的字元（黃色）時，它先不加入，l 往右縮到那個字元離開為止，再把它加進來。綠線是目前最佳區間。</p>
        <SlidingWindowDemo />
      </Section>

      <Section id="code">
        <p>四段：可變視窗的最長不重複子字串、固定視窗的最大平均、找最短區間的可變視窗，以及用佇列當視窗的限流器。留意最長和最短兩種可變視窗，更新答案的位置不同。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 3", name: "Longest Substring Without Repeating Characters", diff: "Medium" },
            { src: "LeetCode 643", name: "Maximum Average Subarray I（固定視窗）", diff: "Easy" },
            { src: "LeetCode 209", name: "Minimum Size Subarray Sum（最短合法區間）", diff: "Medium" },
            { src: "LeetCode 424", name: "Longest Repeating Character Replacement", diff: "Medium" },
            { src: "LeetCode 567", name: "Permutation in String（固定視窗 + 計數）", diff: "Medium" },
            { src: "LeetCode 76", name: "Minimum Window Substring", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const slidingLesson: Lesson = { prereq: "Two Pointers、Hash Table", Body };
