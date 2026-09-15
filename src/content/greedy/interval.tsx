import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { IntervalSchedulingDemo } from "@/components/lesson/demos/IntervalSchedulingDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# 區間排程：一間會議室最多排幾場（按結束時間貪婪）
def max_meetings(intervals):
    intervals = sorted(intervals, key=lambda iv: iv[1])   # 按結束時間排序
    chosen = []
    last_end = float("-inf")
    for s, e in intervals:
        if s >= last_end:                    # 不和上一場衝突（允許首尾相接）
            chosen.append((s, e))
            last_end = e
    return chosen


# 合併重疊區間（LeetCode 56）：按開始時間排序，能接就接
def merge_intervals(intervals):
    intervals = sorted(intervals, key=lambda iv: iv[0])
    merged = []
    for s, e in intervals:
        if merged and s <= merged[-1][1]:    # 和上一段重疊
            merged[-1][1] = max(merged[-1][1], e)
        else:
            merged.append([s, e])
    return merged


# 最少需要幾間會議室（LeetCode 253）：掃描線，同一時刻最多幾場在開
def min_rooms(intervals):
    events = []
    for s, e in intervals:
        events.append((s, 1))                # 開始：+1
        events.append((e, -1))               # 結束：-1
    events.sort()                            # 同一時刻結束排在開始前（-1 < 1）
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

// 區間排程：一間會議室最多排幾場
std::vector<Iv> maxMeetings(std::vector<Iv> ivs) {
    std::sort(ivs.begin(), ivs.end(), [](const Iv& a, const Iv& b) { return a.second < b.second; });
    std::vector<Iv> chosen;
    int lastEnd = INT_MIN;
    for (auto& [s, e] : ivs) {
        if (s >= lastEnd) { chosen.push_back({s, e}); lastEnd = e; }
    }
    return chosen;
}

// 合併重疊區間：按開始時間排序
std::vector<Iv> mergeIntervals(std::vector<Iv> ivs) {
    std::sort(ivs.begin(), ivs.end());        // pair 預設先比 first
    std::vector<Iv> merged;
    for (auto& [s, e] : ivs) {
        if (!merged.empty() && s <= merged.back().second)
            merged.back().second = std::max(merged.back().second, e);
        else
            merged.push_back({s, e});
    }
    return merged;
}

// 最少會議室：掃描線
int minRooms(const std::vector<Iv>& ivs) {
    std::vector<std::pair<int, int>> events;  // (時間, +1 或 -1)
    for (auto& [s, e] : ivs) { events.push_back({s, 1}); events.push_back({e, -1}); }
    std::sort(events.begin(), events.end());  // 同時刻 -1 排在 +1 前
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

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "一間會議室，最多能排幾場會",
              problem: "九個團隊都申請了同一間會議室，時段互相重疊。行政要在不動任何人時間的前提下，塞進最多場會議。試所有組合是 2⁹ 種，人數多一點就爆炸。",
              why: "按結束時間排序，每次選最早結束而且不衝突的那場。結束得早，留給後面的時間就多，這個直覺可以用交換論證證明是最佳。排序一次加一趟掃描，O(n log n)。",
            },
            {
              title: "CPU 的工作排程",
              problem: "作業系統一次只能跑一個工作，每個工作有到達時間和所需時間。想讓完成的工作數最多，或讓平均等待時間最短。",
              why: "「完成數最多」就是區間排程，先跑最早結束的。「平均等待最短」是它的近親，最短工作優先（SJF），同樣用交換論證證明：把長工作和短工作對調，總等待時間只會變短。",
            },
            {
              title: "廣告時段與機台預約",
              problem: "廣告代理商要在一天的節目裡插進最多支廣告，每支有指定時段；工廠的機台被多個訂單預約，重疊的要合併成一段來計算佔用時間；或者反過來，同時最多有幾個訂單在跑，需要幾台機器。",
              why: "這三個都是區間問題的變形：選最多個不重疊（按結束時間）、合併重疊（按開始時間）、最多同時幾個（掃描線）。認出區間的形狀，就知道排序依據該選誰。",
            },
          ]}
          cue="會議室、時段、不重疊、最多場、合併區間、同時最多幾個、按結束時間排序。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>區間排程</strong>：給 n 個區間 [s, e)，選出最多個互不重疊的。貪婪策略是<strong>按結束時間排序</strong>，從頭掃，只要區間的開始時間不早於目前已選區間的最後結束時間，就選它並更新結束時間。程式只有一個排序和一個變數 <Code>last_end</Code>，時間 <strong>O(n log n)</strong>，額外空間 O(1)。
        </p>
        <p>
          為什麼是結束時間而不是開始時間或長度？交換論證：貪婪選的第一個區間 G₁ 是全部裡最早結束的，任何最佳解裡第一個結束的區間 O₁ 結束時間 ≥ G₁ 的。把 O₁ 換成 G₁，最佳解裡其他區間都在 O₁ 結束之後才開始，自然也在 G₁ 之後，換完仍不衝突。所以存在一個以 G₁ 開頭的最佳解，接著對「開始時間 ≥ G₁ 結束」的剩餘區間重複這個論證。用開始時間排序會被一個很長的早會佔掉一整天；用長度排序會被一個橫跨兩場的短會騙走兩場。這兩個都構造得出反例。
        </p>
        <p>
          同一批區間，換個問法就換排序依據。<strong>合併重疊區間</strong>（LeetCode 56）按<strong>開始時間</strong>排序，掃過去時只要新區間的開始 ≤ 目前合併段的結束，就把結束時間取 max 延長它，否則開新的一段。<strong>最少會議室數</strong>（LeetCode 253）問的是「同一時刻最多有幾場在進行」，把每個區間拆成開始事件 +1 和結束事件 −1，按時間排序後掃過去累加，最大值就是答案，這叫<strong>掃描線</strong>。
        </p>
        <p>
          邊界要想清楚：一場 10:00 結束、另一場 10:00 開始，算不算衝突？題目通常視為不衝突，判斷式寫 <Code>s &gt;= last_end</Code>；掃描線裡結束事件要排在同一時刻的開始事件前面，才不會多算一間。另一個誤區是 LeetCode 435「移除最少區間使其不重疊」，它看起來是新問題，其實答案就是 n 減去區間排程選出的個數。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>把所有區間按<strong>結束時間</strong>由小到大排序。</>,
            <>初始化 <Code>last_end = −∞</Code>，代表目前已選區間的最後結束時間。</>,
            <>依序看每個區間 (s, e)：若 <Code>s &gt;= last_end</Code>，選它，<Code>last_end = e</Code>；否則跳過。</>,
            <>掃完就是答案，被選的區間互不重疊而且數量最多。</>,
            <>變形：要<strong>合併</strong>改按開始時間排序、延長結束；要<strong>算同時最多幾個</strong>改用掃描線，開始 +1 結束 −1。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>九場會議申請一間會議室。第一步先按結束時間排序，之後每一步看一場：開始時間不早於黃線（目前最後結束時間）就排進去，否則跳過。留意 B「面試」和 G「一對一」這種長會議是怎麼被自然淘汰的。</p>
        <IntervalSchedulingDemo />
      </Section>

      <Section id="code">
        <p>區間排程本體，加上兩個最常見的變形：合併重疊區間和最少會議室數。三段都是排序加一趟掃描，差別只在排序依據和掃描時做什麼。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 2446", name: "Determine if Two Events Have Conflict（兩個區間重不重疊）", diff: "Easy" },
            { src: "LeetCode 435", name: "Non-overlapping Intervals（n 減掉區間排程的答案）", diff: "Medium" },
            { src: "LeetCode 56", name: "Merge Intervals", diff: "Medium" },
            { src: "LeetCode 2406", name: "Divide Intervals Into Minimum Number of Groups（就是最少會議室數，掃描線或最小堆積）", diff: "Medium" },
            { src: "LeetCode 452", name: "Minimum Number of Arrows to Burst Balloons", diff: "Medium" },
            { src: "LeetCode 1353", name: "Maximum Number of Events That Can Be Attended（每天選最早結束的）", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const intervalLesson: Lesson = { prereq: "Greedy Principles", Body };
