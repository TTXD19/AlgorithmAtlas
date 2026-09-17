import { MonotonicStackDemo } from "@/components/lesson/demos/MonotonicStackDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `# Daily Temperatures (LeetCode 739): how many days until it gets warmer
# The stack holds indices whose temperatures decrease from bottom to top
def daily_temperatures(temps):
    ans = [0] * len(temps)
    stack = []                                   # days still waiting for an answer
    for i, t in enumerate(temps):
        while stack and temps[stack[-1]] < t:    # today is warmer than the top
            j = stack.pop()
            ans[j] = i - j                       # today is day j's answer
        stack.append(i)
    return ans                                   # whatever is left on the stack stays 0


# General next greater element: the first larger value to the right of each position (-1 if none)
def next_greater(nums):
    ans = [-1] * len(nums)
    stack = []
    for i, x in enumerate(nums):
        while stack and nums[stack[-1]] < x:
            ans[stack.pop()] = x
        stack.append(i)
    return ans


# Largest rectangle in a histogram (LeetCode 84): for each bar, find the first shorter bar on each side
def largest_rectangle(heights):
    heights = heights + [0]                      # sentinel that forces every bar out at the end
    stack = []                                   # increasing stack
    best = 0
    for i, h in enumerate(heights):
        while stack and heights[stack[-1]] >= h:
            top = stack.pop()
            left = stack[-1] if stack else -1    # first shorter bar on the left
            width = i - left - 1                 # the first shorter bar on the right is i
            best = max(best, heights[top] * width)
        stack.append(i)
    return best`;

const cpp = `#include <vector>
#include <stack>
#include <algorithm>

// Daily temperatures
std::vector<int> dailyTemperatures(const std::vector<int>& temps) {
    std::vector<int> ans(temps.size(), 0);
    std::stack<int> st;                           // indices, with decreasing temperatures
    for (int i = 0; i < (int)temps.size(); i++) {
        while (!st.empty() && temps[st.top()] < temps[i]) {
            ans[st.top()] = i - st.top();
            st.pop();
        }
        st.push(i);
    }
    return ans;
}

// Next greater element
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

// Largest rectangle in a histogram
int largestRectangle(std::vector<int> heights) {
    heights.push_back(0);                         // sentinel
    std::stack<int> st;                           // increasing
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

export const skeleton: LessonSkeleton = {
  demo: <MonotonicStackDemo />,
  code: { python, cpp },
};
