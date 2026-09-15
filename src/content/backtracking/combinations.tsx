import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { CombinationsDemo } from "@/components/lesson/demos/CombinationsDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# Combination Sum（LeetCode 39）：每個數可重複使用，湊出 target
def combination_sum(candidates, target):
    candidates = sorted(candidates)         # 排序是剪枝的前提（排出新串列，不改動呼叫者的輸入）
    ans = []
    path = []

    def dfs(start, remain):
        if remain == 0:                     # 剛好湊到
            ans.append(path[:])
            return
        for i in range(start, len(candidates)):
            if candidates[i] > remain:      # 剪枝：右邊只會更大，整個迴圈結束
                break
            path.append(candidates[i])      # 做選擇
            dfs(i, remain - candidates[i])  # 可以重複用，所以下一層仍從 i 開始
            path.pop()                      # 撤銷選擇

    dfs(0, target)
    return ans


# 組合 C(n, k)（LeetCode 77）：從 1..n 挑 k 個，剪枝：剩下的數不夠填滿就不用試
def combine(n, k):
    ans = []
    path = []

    def dfs(start):
        if len(path) == k:
            ans.append(path[:])
            return
        need = k - len(path)                # 還要挑幾個
        for i in range(start, n - need + 2):   # i 之後（含 i）至少要剩 need 個數
            path.append(i)
            dfs(i + 1)                      # 每個數只能用一次，下一層從 i+1 開始
            path.pop()

    dfs(1)
    return ans


# Combination Sum II（LeetCode 40）：每個數只能用一次，且輸入有重複
def combination_sum2(candidates, target):
    candidates = sorted(candidates)
    ans = []
    path = []

    def dfs(start, remain):
        if remain == 0:
            ans.append(path[:])
            return
        for i in range(start, len(candidates)):
            if candidates[i] > remain:
                break
            if i > start and candidates[i] == candidates[i - 1]:
                continue                    # 同一層跳過相同的值
            path.append(candidates[i])
            dfs(i + 1, remain - candidates[i])
            path.pop()

    dfs(0, target)
    return ans


if __name__ == "__main__":
    print(combination_sum([2, 3, 6, 7], 7))         # [[2, 2, 3], [7]]
    print(combine(4, 2))                            # [[1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]]
    print(combination_sum2([10, 1, 2, 7, 6, 1, 5], 8))
    # [[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]]（兩個 1 只產生一次 [1, 7]）`;

const cpp = `#include <vector>
#include <algorithm>

// Combination Sum：每個數可重複使用
void dfsSum(const std::vector<int>& c, int start, int remain, std::vector<int>& path, std::vector<std::vector<int>>& ans) {
    if (remain == 0) { ans.push_back(path); return; }      // 剛好湊到
    for (int i = start; i < (int)c.size(); i++) {
        if (c[i] > remain) break;         // 剪枝：已排序，右邊只會更大
        path.push_back(c[i]);             // 做選擇
        dfsSum(c, i, remain - c[i], path, ans);   // 可重複用，仍從 i 開始
        path.pop_back();                  // 撤銷選擇
    }
}

std::vector<std::vector<int>> combinationSum(std::vector<int> candidates, int target) {
    std::sort(candidates.begin(), candidates.end());
    std::vector<std::vector<int>> ans;
    std::vector<int> path;
    dfsSum(candidates, 0, target, path, ans);
    return ans;
}

// 組合 C(n, k)：剩下的數不夠填滿就不用試
void dfsCombine(int n, int k, int start, std::vector<int>& path, std::vector<std::vector<int>>& ans) {
    if ((int)path.size() == k) { ans.push_back(path); return; }
    int need = k - (int)path.size();
    for (int i = start; i <= n - need + 1; i++) {
        path.push_back(i);
        dfsCombine(n, k, i + 1, path, ans);   // 每個數只用一次
        path.pop_back();
    }
}

std::vector<std::vector<int>> combine(int n, int k) {
    std::vector<std::vector<int>> ans;
    std::vector<int> path;
    dfsCombine(n, k, 1, path, ans);
    return ans;
}

// Combination Sum II：每個數只用一次，輸入有重複
void dfsSum2(const std::vector<int>& c, int start, int remain, std::vector<int>& path, std::vector<std::vector<int>>& ans) {
    if (remain == 0) { ans.push_back(path); return; }
    for (int i = start; i < (int)c.size(); i++) {
        if (c[i] > remain) break;
        if (i > start && c[i] == c[i - 1]) continue;   // 同一層跳過相同的值
        path.push_back(c[i]);
        dfsSum2(c, i + 1, remain - c[i], path, ans);
        path.pop_back();
    }
}

std::vector<std::vector<int>> combinationSum2(std::vector<int> candidates, int target) {
    std::sort(candidates.begin(), candidates.end());
    std::vector<std::vector<int>> ans;
    std::vector<int> path;
    dfsSum2(candidates, 0, target, path, ans);
    return ans;
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "用手上的面額湊出一筆金額",
              problem: "販賣機只收 5、10、50 元，要列出所有能湊出 65 元的投幣方式。10+5+50 和 50+10+5 是同一種，不能重複算。",
              why: "這是「組合」不是「排列」：順序不重要。每一層只從目前位置往右挑，就天生不會產生順序不同的重複。剩餘金額變負時整條分支立刻放棄，這就是剪枝。",
            },
            {
              title: "從 20 個人裡選 5 人的隊伍",
              problem: "社團要從 20 個報名者裡選 5 人參賽，每種名單都要評估一次適配度。C(20, 5) = 15,504 種，要有系統地列出來。",
              why: "從 start 往右挑保證每個名單只出現一次。加一條剪枝：剩下的人不夠填滿 5 個位置就不用再往下試，可以砍掉大量沒用的遞迴。",
            },
            {
              title: "預算內的採購清單",
              problem: "有一份零件價目表，要列出所有總價剛好等於預算的採購組合，每種零件可以買多份。",
              why: "先把價目排序。當目前這個零件的價格已經超過剩餘預算，後面更貴的一定也超過，整個迴圈直接結束。排序加剪枝讓搜尋樹少掉一大半。",
            },
          ]}
          cue="湊出總和、選 k 個、順序不重要、可以重複用或只能用一次、列出所有方案、n 小但暴力太慢。"
        />
      </Section>

      <Section id="concept">
        <p>
          組合是「不管順序的挑選」。[2, 3] 和 [3, 2] 算同一種，所以不能像排列那樣每層從頭掃。做法是帶一個 <Code>start</Code>：<strong>每一層只從 start 往右挑</strong>，挑了第 i 個之後，下一層從 i（可重複用）或 i+1（只能用一次）開始。這樣每個組合只會以「由小到大的索引」這一種順序出現，重複自然消失。
        </p>
        <p>
          <strong>剪枝</strong>是讓回溯能用的關鍵。回溯的樹是指數大的，能砍掉整棵子樹的判斷都值得做。Combination Sum 先把候選排序，for 迴圈裡一旦 <Code>candidates[i] &gt; remain</Code>，右邊的更大、更不可能，直接 <Code>break</Code>，不是 <Code>continue</Code>。C(n, k) 則是「剩下的數不夠填滿 k 個」就不試。這些判斷都是 O(1)，但砍掉的可能是幾千個節點。
        </p>
        <p>
          做選擇、遞迴、撤銷選擇的三步和子集一樣，只是遞迴時多傳了 <Code>start</Code> 和 <Code>remain</Code>。要分清兩個常混淆的地方：<strong>能否重複用同一個元素</strong>決定下一層的 start 是 i 還是 i+1；<strong>輸入本身有重複值</strong>時要先排序，同一層裡 <Code>candidates[i] == candidates[i-1]</Code> 且 <Code>i &gt; start</Code> 就跳過，因為以那個值開頭的分支這一層已經走過。
        </p>
        <p>
          複雜度沒有乾淨的閉合式，依 target 和候選數而異，通常記作<strong>指數</strong>。可以確定的是：沒有排序與剪枝時每一層都會把所有候選試完；有了剪枝，樹的大小接近「真正可行的分支數」。如果題目只問「有幾種」或「最少幾個」而不要列出方案，那是 DP 的範圍（Coin Change），不要用回溯。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>先把候選<strong>排序</strong>，這是剪枝能用 <Code>break</Code> 的前提。</>,
            <>寫 <Code>dfs(start, remain)</Code>：<Code>remain == 0</Code> 時把 <Code>path</Code> 複製進答案並 return。</>,
            <>for 迴圈從 <Code>start</Code> 掃到底。若 <Code>candidates[i] &gt; remain</Code>，<Code>break</Code>（剪枝）。若輸入有重複且 <Code>i &gt; start and candidates[i] == candidates[i-1]</Code>，<Code>continue</Code>。</>,
            <>做選擇：<Code>path.append(candidates[i])</Code>，遞迴 <Code>dfs(i, remain - candidates[i])</Code>（可重複用）或 <Code>dfs(i + 1, …)</Code>（只能用一次）。</>,
            <>撤銷選擇：<Code>path.pop()</Code>，繼續試下一個 i。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>candidates = [2, 3, 6, 7]、target = 7。下方的遞迴堆疊顯示每一層的 start 與 remain，黃色的那一步就是剪枝發生的時刻：候選已經比 remain 大，整個迴圈直接結束。</p>
        <CombinationsDemo />
      </Section>

      <Section id="code">
        <p>Combination Sum（可重複用）、C(n, k)（剩餘數量剪枝）與 Combination Sum II（只能用一次、輸入有重複）。三者只差 start 怎麼傳和剪枝條件。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 39", name: "Combination Sum", diff: "Medium" },
            { src: "LeetCode 40", name: "Combination Sum II（只用一次、跳過重複）", diff: "Medium" },
            { src: "LeetCode 77", name: "Combinations", diff: "Medium" },
            { src: "LeetCode 216", name: "Combination Sum III", diff: "Medium" },
            { src: "LeetCode 17", name: "Letter Combinations of a Phone Number", diff: "Medium" },
            { src: "LeetCode 131", name: "Palindrome Partitioning（切割位置的組合）", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const combinationsLesson: Lesson = { prereq: "Subsets", Body };
