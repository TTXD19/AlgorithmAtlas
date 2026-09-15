import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { StackDemo } from "@/components/lesson/demos/StackDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# Python 的 list 就是堆疊：append 推入、pop 彈出、[-1] 看頂端，全部 O(1)
stack = []
stack.append(1)
stack.append(2)
stack[-1]          # 2（peek）
stack.pop()        # 2
len(stack) == 0    # 是否為空


# 括號配對（LeetCode 20）
def is_valid(s):
    pair = {")": "(", "]": "[", "}": "{"}
    stack = []
    for c in s:
        if c in pair:                          # 右括號
            if not stack or stack[-1] != pair[c]:
                return False
            stack.pop()
        else:                                  # 左括號
            stack.append(c)
    return not stack                           # 剛好全部配完


# 後綴表達式求值（LeetCode 150）："2 1 + 3 *" → (2+1)*3 = 9
def eval_rpn(tokens):
    stack = []
    for t in tokens:
        if t in "+-*/":
            b, a = stack.pop(), stack.pop()    # 注意順序：先彈出的是右運算元
            if t == "+": stack.append(a + b)
            elif t == "-": stack.append(a - b)
            elif t == "*": stack.append(a * b)
            else: stack.append(int(a / b))     # 向零截斷
        else:
            stack.append(int(t))
    return stack[0]


# Min Stack（LeetCode 155）：多存一個「到目前為止的最小值」
class MinStack:
    def __init__(self):
        self.stack = []        # (值, 當時的最小值)

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

// std::stack：push / pop / top / empty，全部 O(1)
void basics() {
    std::stack<int> st;
    st.push(1);
    st.push(2);
    st.top();      // 2
    st.pop();      // 注意：pop() 不回傳值
    st.empty();
}

// 括號配對
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

// 後綴表達式求值
int evalRPN(const std::vector<std::string>& tokens) {
    std::stack<long long> st;
    for (const auto& t : tokens) {
        if (t == "+" || t == "-" || t == "*" || t == "/") {
            long long b = st.top(); st.pop();
            long long a = st.top(); st.pop();
            if (t == "+") st.push(a + b);
            else if (t == "-") st.push(a - b);
            else if (t == "*") st.push(a * b);
            else st.push(a / b);            // C++ 整數除法本來就向零截斷
        } else {
            st.push(std::stoll(t));
        }
    }
    return st.top();
}

// Min Stack
class MinStack {
    std::stack<std::pair<int, int>> st;   // (值, 當時最小)
public:
    void push(int x) { st.push({x, st.empty() ? x : std::min(x, st.top().second)}); }
    void pop() { st.pop(); }
    int top() { return st.top().first; }
    int getMin() { return st.top().second; }
};`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "編輯器的括號檢查與 Ctrl+Z",
              problem: "程式碼裡的括號要成對，而且「最近打開的必須最先關閉」。undo 也一樣：最後做的操作要最先被撤銷。",
              why: "堆疊只允許從同一端進出，天生就是「後進先出」。左括號推入、右括號彈出比對；每個操作推入、undo 就彈出。結構本身就表達了規則。",
            },
            {
              title: "函式呼叫怎麼記得「回到哪裡」",
              problem: "A 呼叫 B、B 呼叫 C，C 結束後要回到 B 的哪一行、B 結束後回到 A 的哪一行？遞迴時同一個函式還有幾十層。",
              why: "呼叫堆疊：每次呼叫推入一層紀錄，返回就彈出。遞迴那篇看到的 call stack 就是堆疊。DFS 用堆疊、BFS 用佇列，也是同一個道理。",
            },
            {
              title: "計算機怎麼算 3 + 4 × 2",
              problem: "運算式有優先順序和括號，從左到右直接算會錯。編譯器、試算表、計算機都要正確處理。",
              why: "把運算式轉成後綴（逆波蘭）表示法，用一個堆疊就能從左到右一次算完：數字推入、遇到運算子彈兩個算完推回去。",
            },
          ]}
          cue="後進先出、最近的先處理、配對、undo、巢狀結構、運算式求值、DFS 的迭代版。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>堆疊</strong>只有三個操作：<Code>push</Code> 放到頂端、<Code>pop</Code> 從頂端拿走、<Code>peek</Code> 看頂端。<strong>後進先出</strong>（LIFO）：最後放進去的最先被拿出來。全部 O(1)。它簡單到用陣列的尾端就能做（尾端增刪 O(1)），Python 的 list、C++ 的 <Code>std::stack</Code> 都是這樣。
        </p>
        <p>
          堆疊的價值不在操作多快，而在<strong>它記住了順序</strong>。任何「最近打開的要最先關閉」「進入後要能原路退回」的問題，堆疊的結構就是答案的一半：括號配對、巢狀標籤、函式呼叫、路徑的 <Code>..</Code>、undo/redo、DFS 的迭代寫法。
        </p>
        <p>
          一個常見的擴充是<strong>每一層多存一點資訊</strong>。Min Stack 在每個元素旁邊記「到這裡為止的最小值」，pop 之後最小值自動回到上一層的紀錄，不用重算。下一篇的單調堆疊則是對「什麼時候該 pop」加上條件，把 O(n²) 的問題壓成 O(n)。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>辨認問題有沒有「<strong>最近的先處理</strong>」的結構：巢狀、配對、回溯、需要記得走過的路。</>,
            <>決定堆疊裡<strong>存什麼</strong>：字元、索引、還是 (值, 附加資訊) 的組合。存索引通常比存值靈活。</>,
            <>從左到右掃輸入。遇到「開啟」就 push；遇到「關閉」先檢查<strong>堆疊是否為空</strong>，再和頂端比對後 pop。</>,
            <>掃完後檢查堆疊<strong>是否清空</strong>：剩東西通常代表有未關閉的項目。</>,
            <>用三種輸入驗證：空輸入、只有關閉沒有開啟、只有開啟沒有關閉。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>選一個字串逐步看括號配對：左括號推入，右括號和頂端比對後彈出。三種不合法的情況分別在哪一步被抓到。</p>
        <StackDemo />
      </Section>

      <Section id="code">
        <p>基本操作、括號配對、後綴表達式求值、以及每層多存一個最小值的 Min Stack。C++ 注意 <Code>pop()</Code> 不回傳值，要先 <Code>top()</Code>。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 20", name: "Valid Parentheses", diff: "Easy" },
            { src: "LeetCode 155", name: "Min Stack", diff: "Medium" },
            { src: "LeetCode 150", name: "Evaluate Reverse Polish Notation", diff: "Medium" },
            { src: "LeetCode 71", name: "Simplify Path", diff: "Medium" },
            { src: "LeetCode 394", name: "Decode String（巢狀）", diff: "Medium" },
            { src: "LeetCode 224", name: "Basic Calculator", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const stackLesson: Lesson = { prereq: "Array & Dynamic Array", Body };
