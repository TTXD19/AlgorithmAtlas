import { StackDemo } from "@/components/lesson/demos/StackDemo";
import type { LessonSkeleton } from "@/lib/lesson-model";

// 程式碼註解一律英文，不隨語言翻譯：真實世界的程式碼註解就是英文。
const python = `# A Python list is a stack: append to push, pop to remove, [-1] to peek — all O(1)
stack = []
stack.append(1)
stack.append(2)
stack[-1]          # 2 (peek)
stack.pop()        # 2
len(stack) == 0    # is it empty?


# Matching brackets (LeetCode 20)
def is_valid(s):
    pair = {")": "(", "]": "[", "}": "{"}
    stack = []
    for c in s:
        if c in pair:                          # a closing bracket
            if not stack or stack[-1] != pair[c]:
                return False
            stack.pop()
        else:                                  # an opening bracket
            stack.append(c)
    return not stack                           # everything paired up exactly


# Evaluating postfix notation (LeetCode 150): "2 1 + 3 *" → (2+1)*3 = 9
def eval_rpn(tokens):
    stack = []
    for t in tokens:
        if t in "+-*/":
            b, a = stack.pop(), stack.pop()    # mind the order: the first pop is the right operand
            if t == "+": stack.append(a + b)
            elif t == "-": stack.append(a - b)
            elif t == "*": stack.append(a * b)
            else: stack.append(int(a / b))     # truncate towards zero
        else:
            stack.append(int(t))
    return stack[0]


# Min Stack (LeetCode 155): store the minimum so far alongside each value
class MinStack:
    def __init__(self):
        self.stack = []        # (value, minimum at that point)

    def push(self, x):
        cur_min = min(x, self.stack[-1][1]) if self.stack else x
        self.stack.append((x, cur_min))

    def pop(self):
        self.stack.pop()

    def top(self):
        return self.stack[-1][0]

    def get_min(self):
        return self.stack[-1][1]`;

const cpp = `#include <stack>
#include <string>
#include <vector>
#include <unordered_map>

// std::stack: push / pop / top / empty, all O(1)
void basics() {
    std::stack<int> st;
    st.push(1);
    st.push(2);
    st.top();      // 2
    st.pop();      // note: pop() returns nothing
    st.empty();
}

// Matching brackets
bool isValid(const std::string& s) {
    std::unordered_map<char, char> pair = {{')', '('}, {']', '['}, {'}', '{'}};
    std::stack<char> st;
    for (char c : s) {
        if (pair.count(c)) {
            if (st.empty() || st.top() != pair[c]) return false;
            st.pop();
        } else {
            st.push(c);
        }
    }
    return st.empty();
}

// Evaluating postfix notation
int evalRPN(const std::vector<std::string>& tokens) {
    std::stack<long long> st;
    for (const auto& t : tokens) {
        if (t == "+" || t == "-" || t == "*" || t == "/") {
            long long b = st.top(); st.pop();
            long long a = st.top(); st.pop();
            if (t == "+") st.push(a + b);
            else if (t == "-") st.push(a - b);
            else if (t == "*") st.push(a * b);
            else st.push(a / b);            // C++ integer division already truncates towards zero
        } else {
            st.push(std::stoll(t));
        }
    }
    return st.top();
}

// Min Stack
class MinStack {
    std::stack<std::pair<int, int>> st;   // (value, minimum at that point)
public:
    void push(int x) { st.push({x, st.empty() ? x : std::min(x, st.top().second)}); }
    void pop() { st.pop(); }
    int top() { return st.top().first; }
    int getMin() { return st.top().second; }
};`;

export const skeleton: LessonSkeleton = {
  demo: <StackDemo />,
  code: { python, cpp },
};
