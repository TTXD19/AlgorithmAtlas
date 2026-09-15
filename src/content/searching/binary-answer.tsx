import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { BinaryAnswerDemo } from "@/components/lesson/demos/BinaryAnswerDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# Koko 吃香蕉（LeetCode 875）：每小時吃 k 根，最慢的 k 是多少能在 h 小時內吃完
# 答案 k 在 1..max(piles) 之間（題目保證 h >= 堆數，k = max 一定可行）
# 「k 可行」對 k 單調：快的一定也可行
def min_eating_speed(piles, h):
    def feasible(k):                       # 可行性檢查：速度 k 來得及嗎
        hours = sum((p + k - 1) // k for p in piles)   # 每堆 ceil(p / k)
        return hours <= h

    lo, hi = 1, max(piles)                 # 答案的範圍
    while lo < hi:                         # 和 lower_bound 同一套：找第一個可行
        mid = (lo + hi) // 2
        if feasible(mid):
            hi = mid                       # mid 可行，答案 <= mid
        else:
            lo = mid + 1                   # mid 不可行，答案 > mid
    return lo


# 同一個骨架：貨船最小載重（LeetCode 1011）
# 載重 cap 可行 = 依序裝貨、超過就換下一天，天數 <= days
def ship_within_days(weights, days):
    def feasible(cap):
        d, cur = 1, 0
        for w in weights:
            if cur + w > cap:
                d += 1
                cur = 0
            cur += w
        return d <= days

    lo, hi = max(weights), sum(weights)    # 下限：最重的一件；上限：一天全裝
    while lo < hi:
        mid = (lo + hi) // 2
        if feasible(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo


# 反過來的單調性：找「最大的可行值」，例如切木頭最多能切成多長（每段 >= L）
# 這時可行的在左邊，要改成「最後一個可行」的寫法：mid 向上取整、lo = mid
def max_piece_length(logs, need):
    def feasible(L):                       # 每段長 L，總段數夠不夠
        return sum(x // L for x in logs) >= need

    lo, hi = 1, max(logs)
    while lo < hi:
        mid = (lo + hi + 1) // 2           # 向上取整，避免 lo = mid 卡住
        if feasible(mid):
            lo = mid                       # mid 可行，答案 >= mid
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

// Koko 吃香蕉：最小可行速度
int minEatingSpeed(const std::vector<int>& piles, int h) {
    auto feasible = [&](int k) {           // 可行性檢查
        long long hours = 0;
        for (int p : piles) hours += ((long long)p + k - 1) / k;   // ceil(p / k)，先轉型避免 p + k 溢位
        return hours <= h;
    };
    int lo = 1, hi = *std::max_element(piles.begin(), piles.end());
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (feasible(mid)) hi = mid;       // 可行，答案 <= mid
        else lo = mid + 1;                 // 不可行，答案 > mid
    }
    return lo;
}

// 貨船最小載重
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

// 找「最大的可行值」：切木頭，每段至少 L 要切出 need 段
int maxPieceLength(const std::vector<int>& logs, int need) {
    auto feasible = [&](int L) {
        long long cnt = 0;
        for (int x : logs) cnt += x / L;
        return cnt >= need;
    };
    int lo = 1, hi = *std::max_element(logs.begin(), logs.end());
    while (lo < hi) {
        int mid = lo + (hi - lo + 1) / 2;  // 向上取整
        if (feasible(mid)) lo = mid;       // 可行，答案 >= mid
        else hi = mid - 1;
    }
    return feasible(lo) ? lo : 0;
}

int main() {
    std::cout << minEatingSpeed({30, 11, 23, 4, 20}, 6) << "\\n";                  // 23
    std::cout << shipWithinDays({1, 2, 3, 4, 5, 6, 7, 8, 9, 10}, 5) << "\\n";     // 15
    std::cout << maxPieceLength({10, 7, 5}, 4) << "\\n";                          // 5
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "最少要多快才來得及",
              problem: "Koko 面前有幾堆香蕉，警衛 h 小時後回來。她每小時選一堆吃 k 根（那堆不夠 k 根也算一小時）。k 最小要多少才吃得完？",
              why: "直接算 k 很難，但「給定 k，來不來得及」很好算：每堆算 ⌈pile / k⌉ 加總。而且 k 越大越來得及，可行性是單調的。所以對 k 二分，每次驗證一下，log 次就找到最小的可行 k。",
            },
            {
              title: "貨船最小載重、印表機分工",
              problem: "一批貨要依序在 D 天內運完，船的載重至少要多少？或者把一排工作切給 k 台機器，怎麼切讓最忙的那台最輕鬆？",
              why: "「最小化最大值」是這個技巧的招牌形狀。猜一個上限，貪心地檢查能不能在限制內做完；能就試更小的，不能就試更大的。",
            },
            {
              title: "系統容量規劃",
              problem: "服務要撐住尖峰流量，最少開幾台機器？每個候選數量都要跑一次負載模擬，很貴，不能每個都試。",
              why: "機器越多越撐得住，單調。二分後只需要模擬 log 次，從幾百次降到十次以內。只要「驗證一個答案」比「直接算答案」容易，而且答案單調，就能這樣做。",
            },
          ]}
          cue="最小的可行值、最大的可行值、最小化最大值、最大化最小值、至少要多少才夠、驗證比求解容易。"
        />
      </Section>

      <Section id="concept">
        <p>
          普通二分是在<strong>資料</strong>上找位置，<strong>二分答案</strong>是在<strong>答案的範圍</strong>上找值。把問題從「答案是多少」改成「答案 x 可不可行」，只要可行性對 x 是<strong>單調的</strong>（不可行、不可行、…、可行、可行），答案空間就像一個排好序的布林陣列，可以對它二分，找第一個「可行」的 x。
        </p>
        <p>
          需要三個零件。第一，<strong>答案的範圍</strong> <Code>[lo, hi]</Code>：要包住真正的答案，通常是「最小可能」到「最大可能」，例如速度是 1 到最大堆、載重是最重的一件到總重。第二，<strong>可行性檢查</strong> <Code>feasible(x)</Code>：給定 x，用貪心或模擬判斷做不做得到，這通常是 O(n)。第三，<strong>單調性</strong>：確認 x 可行時比它「更寬鬆」的也可行，否則二分沒有依據。
        </p>
        <p>
          複雜度是 <strong>O(n log R)</strong>：R 是答案範圍的大小（<Code>hi − lo + 1</Code>），二分最多跑 ⌈log₂ R⌉ 輪，每輪做一次 O(n) 的檢查。R 可以很大（十億）也不怕，因為 log₂ 十億只有約 30。這也是為什麼它常用在「答案是實數或很大的整數」的問題上；答案是實數時沒有「相鄰」可言，改成固定跑 50～100 輪，或做到 <Code>hi − lo</Code> 小於精度為止。
        </p>
        <p>
          方向要想清楚。找<strong>最小的可行值</strong>（可行的在右邊）：<Code>feasible(mid)</Code> 成立時 <Code>hi = mid</Code>，否則 <Code>lo = mid + 1</Code>，和 lower_bound 一模一樣。找<strong>最大的可行值</strong>（可行的在左邊）：成立時 <Code>lo = mid</Code>，否則 <Code>hi = mid - 1</Code>，這時 <Code>mid</Code> 必須<strong>向上取整</strong> <Code>(lo + hi + 1) // 2</Code>，不然 <Code>lo</Code> 和 <Code>hi</Code> 相鄰時會卡死。搞不清楚方向時，先在紙上寫出「不可行不可行可行可行」還是「可行可行不可行不可行」。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>把問題改寫成判定題：「答案 x 可不可行」。確認 x 越大（或越小）越容易可行，這是<strong>單調性</strong>。</>,
            <>定出答案範圍 <Code>lo</Code>、<Code>hi</Code>，要保證真正的答案在裡面。範圍寬一點只多跑幾輪（寬兩倍才多一輪），但 <Code>feasible</Code> 必須對範圍內每個值都判斷正確：例如貨船載重小於最重的一件時，逐件裝的貪心會誤判成可行，所以下限直接取最重的一件。</>,
            <>寫 <Code>feasible(x)</Code>：通常是一次 O(n) 的貪心或模擬。它是整個演算法的核心，先獨立測試它。</>,
            <><Code>while lo &lt; hi</Code>：<Code>mid = (lo + hi) // 2</Code>；可行就 <Code>hi = mid</Code>，不可行就 <Code>lo = mid + 1</Code>（找最小可行值）。</>,
            <>迴圈結束 <Code>lo</Code> 就是答案（迴圈不保證驗證過最後剩下的 <Code>lo</Code>，範圍裡可能完全沒有可行值時，要再驗一次 <Code>feasible(lo)</Code>）。找最大可行值時改成 <Code>mid = (lo + hi + 1) // 2</Code>、可行 <Code>lo = mid</Code>、不可行 <Code>hi = mid - 1</Code>。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>Koko 吃香蕉，五堆、限時 6 小時。上排是候選速度 1 到 30，每試一個就把它標成可行（綠）或不可行（黃），你會看到綠的永遠在右邊。下方是每次驗證的計算：每堆 ⌈pile / k⌉ 相加，和 h 比。</p>
        <BinaryAnswerDemo />
      </Section>

      <Section id="code">
        <p>Koko 吃香蕉與貨船載重是「找最小可行值」，骨架完全一樣，只換 <Code>feasible</Code> 和範圍。第三段切木頭是「找最大可行值」，注意 <Code>mid</Code> 向上取整和更新方向都反過來。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 875", name: "Koko Eating Bananas", diff: "Medium" },
            { src: "LeetCode 1011", name: "Capacity To Ship Packages Within D Days", diff: "Medium" },
            { src: "LeetCode 410", name: "Split Array Largest Sum（最小化最大值）", diff: "Hard" },
            { src: "LeetCode 1482", name: "Minimum Number of Days to Make m Bouquets", diff: "Medium" },
            { src: "LeetCode 1552", name: "Magnetic Force Between Two Balls（最大化最小值）", diff: "Medium" },
            { src: "LeetCode 2226", name: "Maximum Candies Allocated to K Children（找最大可行值）", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const binaryAnswerLesson: Lesson = { prereq: "Binary Search", Body };
