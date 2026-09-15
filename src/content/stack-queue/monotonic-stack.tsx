import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { MonotonicStackDemo } from "@/components/lesson/demos/MonotonicStackDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# 每日溫度（LeetCode 739）：每一天要等幾天才會更暖
# 堆疊存索引，對應的溫度由底到頂遞減
def daily_temperatures(temps):
    ans = [0] * len(temps)
    stack = []                                   # 還沒找到答案的日子
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:    # 今天比頂端暖
            j = stack.pop()
            ans[j] = i - j                       # 第 j 天的答案就是今天
        stack.append(i)
    return ans                                   # 留在堆疊裡的是 0


# 下一個更大元素的通用版：回傳每個位置右邊第一個更大的值（沒有就 -1）
def next_greater(nums):
    ans = [-1] * len(nums)
    stack = []
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            ans[stack.pop()] = x
        stack.append(i)
    return ans


# 直方圖最大矩形（LeetCode 84）：對每根柱子找左右第一個比它矮的
def largest_rectangle(heights):
    heights = heights + [0]                      # 哨兵，最後把所有柱子逼出來
    stack = []                                   # 遞增堆疊
    best = 0
    for i, h in enumerate(heights):
        while stack and heights[stack[-1]] >= h:
            top = stack.pop()
            left = stack[-1] if stack else -1    # 左邊第一個更矮的
            width = i - left - 1                 # 右邊第一個更矮的是 i
            best = max(best, heights[top] * width)
        stack.append(i)
    return best`;

const cpp = `#include <vector>
#include <stack>
#include <algorithm>

// 每日溫度
std::vector<int> dailyTemperatures(const std::vector<int>& temps) {
    std::vector<int> ans(temps.size(), 0);
    std::stack<int> st;                           // 索引，溫度遞減
    for (int i = 0; i < (int)temps.size(); i++) {
        while (!st.empty() && temps[st.top()] < temps[i]) {
            ans[st.top()] = i - st.top();
            st.pop();
        }
        st.push(i);
    }
    return ans;
}

// 下一個更大元素
std::vector<int> nextGreater(const std::vector<int>& nums) {
    std::vector<int> ans(nums.size(), -1);
    std::stack<int> st;
    for (int i = 0; i < (int)nums.size(); i++) {
        while (!st.empty() && nums[st.top()] < nums[i]) {
            ans[st.top()] = nums[i];
            st.pop();
        }
        st.push(i);
    }
    return ans;
}

// 直方圖最大矩形
int largestRectangle(std::vector<int> heights) {
    heights.push_back(0);                         // 哨兵
    std::stack<int> st;                           // 遞增
    int best = 0;
    for (int i = 0; i < (int)heights.size(); i++) {
        while (!st.empty() && heights[st.top()] >= heights[i]) {
            int h = heights[st.top()]; st.pop();
            int left = st.empty() ? -1 : st.top();
            best = std::max(best, h * (i - left - 1));
        }
        st.push(i);
    }
    return best;
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "股價：每一天之後第一次漲破今天是哪天",
              problem: "對每一天問「之後第一個比今天高的價格在哪」。暴力做法每一天往後掃，O(n²)，十萬天就是一百億次。",
              why: "從左到右掃，把「還沒找到答案的日子」放在堆疊裡。新的一天出現時，堆疊裡所有比它低的日子答案就是今天，一次全部彈出結算。每一天進出各一次，O(n)。",
            },
            {
              title: "直方圖裡最大的矩形",
              problem: "一排柱子，找面積最大的矩形。矩形的高由最矮的柱子決定，所以要知道每根柱子「左右第一根比它矮的在哪」。",
              why: "這正是單調堆疊回答的問題。維持一個高度遞增的堆疊，彈出的那一刻同時知道左邊界（新的頂端）和右邊界（現在的位置）。",
            },
            {
              title: "接雨水、視線能看到幾棟大樓",
              problem: "「被左右更高的東西夾住」「往右看第一個擋住視線的」，這類問題全部長得一樣。",
              why: "它們都是「找左邊或右邊第一個更大／更小的元素」的變形。認出這個形狀，就知道要用單調堆疊。",
            },
          ]}
          cue="下一個更大／更小、第一個比它高的、左右邊界、每個元素往右看、O(n²) 的雙層迴圈只在找「第一個滿足條件的」。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>單調堆疊</strong>是一個堆疊，但多了一條規則：<strong>裡面的元素永遠保持遞增或遞減</strong>。要推入新元素前，先把所有會破壞單調性的元素彈出。彈出的那一刻，就是那個元素「找到答案」的時刻，因為新元素就是它右邊第一個比它大（或小）的。
        </p>
        <p>
          以「下一個更大元素」為例。堆疊由底到頂遞減，存的是索引。新元素 x 來了：頂端比 x 小的元素，它們的答案就是 x，逐一彈出並記錄；然後把 x 推入。堆疊裡留下的是「還在等更大的」。每個索引恰好推入一次、彈出至多一次，所以整體 <strong>O(n)</strong>，把暴力的 O(n²) 壓掉一個 n。
        </p>
        <p>
          方向與單調性的對應：找<strong>右邊第一個更大</strong>用遞減堆疊、從左往右掃；找<strong>右邊第一個更小</strong>用遞增堆疊；找<strong>左邊</strong>的第一個更大或更小，其實就是彈出時「新的頂端」，不用反過來掃。直方圖最大矩形一次拿到左右兩個邊界，就是這個性質。
        </p>
        <p>
          等於的處理要想清楚。「嚴格更大」用 <Code>&lt;</Code> 彈出，相等的留在堆疊；「大於等於」用 <Code>&lt;=</Code>。直方圖那題加一個高度 0 的哨兵在尾端，讓所有柱子在最後都被彈出結算。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>確認問題是「對每個元素找<strong>某個方向第一個</strong>滿足大小條件的元素」。</>,
            <>決定單調方向：找更大用<strong>遞減</strong>堆疊，找更小用<strong>遞增</strong>堆疊。堆疊裡存<strong>索引</strong>，才能算距離和取值。</>,
            <>從左到右，對每個 i：<Code>while stack and 條件(nums[stack[-1]], nums[i])</Code>，彈出頂端 j 並記錄 <Code>ans[j]</Code>（答案是 i 或 nums[i]）。</>,
            <>把 i 推入。若也需要「左邊第一個」，彈出 j 時的新頂端就是 j 的左邊界。</>,
            <>掃完後堆疊裡剩下的元素沒有答案（設 −1 或 0）。需要全部結算時，在尾端加一個哨兵值。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>每日溫度。黃色是還在堆疊裡等答案的日子，新的一天比頂端暖時，頂端被彈出並填上答案（綠色）。注意堆疊裡的溫度永遠由底到頂遞減。</p>
        <MonotonicStackDemo />
      </Section>

      <Section id="code">
        <p>每日溫度、通用的下一個更大元素，以及同時用到左右邊界的直方圖最大矩形。三段的骨架一模一樣，差在彈出條件和彈出時記什麼。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 739", name: "Daily Temperatures", diff: "Medium" },
            { src: "LeetCode 496", name: "Next Greater Element I", diff: "Easy" },
            { src: "LeetCode 503", name: "Next Greater Element II（環狀：掃兩遍）", diff: "Medium" },
            { src: "LeetCode 901", name: "Online Stock Span", diff: "Medium" },
            { src: "LeetCode 84", name: "Largest Rectangle in Histogram", diff: "Hard" },
            { src: "LeetCode 42", name: "Trapping Rain Water（單調堆疊版）", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const monotonicStackLesson: Lesson = { prereq: "Stack", Body };
