import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { SubsetsDemo } from "@/components/lesson/demos/SubsetsDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# 子集（LeetCode 78）：每個元素「選」或「不選」
def subsets(nums):
    ans = []
    path = []

    def dfs(i):
        if i == len(nums):            # 每個元素都決定完了
            ans.append(path[:])       # 複製一份，path 之後還會變
            return
        path.append(nums[i])          # 做選擇：選 nums[i]
        dfs(i + 1)
        path.pop()                    # 撤銷選擇
        dfs(i + 1)                    # 另一條路：不選 nums[i]

    dfs(0)
    return ans


# 另一種寫法：每層決定「下一個放誰」，每個節點都是一個子集
# 用 start 只往右挑，所以不會同時產生 [1, 2] 和 [2, 1]
def subsets_start(nums):
    ans = []
    path = []

    def dfs(start):
        ans.append(path[:])           # 進到節點就收集
        for j in range(start, len(nums)):
            path.append(nums[j])
            dfs(j + 1)
            path.pop()

    dfs(0)
    return ans


# 含重複元素的子集（LeetCode 90）：先排序，同一層跳過相同的值
def subsets_with_dup(nums):
    nums = sorted(nums)               # 排序出新串列，不改動呼叫者的輸入
    ans = []
    path = []

    def dfs(start):
        ans.append(path[:])
        for j in range(start, len(nums)):
            if j > start and nums[j] == nums[j - 1]:   # 同一層已經試過這個值
                continue
            path.append(nums[j])
            dfs(j + 1)
            path.pop()

    dfs(0)
    return ans


if __name__ == "__main__":
    print(subsets([1, 2, 3]))
    # [[1, 2, 3], [1, 2], [1, 3], [1], [2, 3], [2], [3], []]
    print(subsets_start([1, 2, 3]))
    # [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]
    print(subsets_with_dup([1, 2, 2]))
    # [[], [1], [1, 2], [1, 2, 2], [2], [2, 2]]`;

const cpp = `#include <vector>
#include <algorithm>

// 子集：每個元素「選」或「不選」
void dfsPick(const std::vector<int>& nums, int i, std::vector<int>& path, std::vector<std::vector<int>>& ans) {
    if (i == (int)nums.size()) {      // 每個元素都決定完了
        ans.push_back(path);
        return;
    }
    path.push_back(nums[i]);          // 做選擇：選 nums[i]
    dfsPick(nums, i + 1, path, ans);
    path.pop_back();                  // 撤銷選擇
    dfsPick(nums, i + 1, path, ans);  // 另一條路：不選 nums[i]
}

std::vector<std::vector<int>> subsets(const std::vector<int>& nums) {
    std::vector<std::vector<int>> ans;
    std::vector<int> path;
    dfsPick(nums, 0, path, ans);
    return ans;
}

// 另一種寫法：每層決定「下一個放誰」，用 start 只往右挑，每個節點都是一個子集
void dfsStart(const std::vector<int>& nums, int start, std::vector<int>& path, std::vector<std::vector<int>>& ans) {
    ans.push_back(path);              // 進到節點就收集
    for (int j = start; j < (int)nums.size(); j++) {
        path.push_back(nums[j]);
        dfsStart(nums, j + 1, path, ans);
        path.pop_back();
    }
}

std::vector<std::vector<int>> subsetsStart(const std::vector<int>& nums) {
    std::vector<std::vector<int>> ans;
    std::vector<int> path;
    dfsStart(nums, 0, path, ans);
    return ans;
}

// 含重複元素：先排序，同一層跳過相同的值
void dfsDup(const std::vector<int>& nums, int start, std::vector<int>& path, std::vector<std::vector<int>>& ans) {
    ans.push_back(path);              // 進到節點就收集
    for (int j = start; j < (int)nums.size(); j++) {
        if (j > start && nums[j] == nums[j - 1]) continue;   // 同一層已經試過這個值
        path.push_back(nums[j]);
        dfsDup(nums, j + 1, path, ans);
        path.pop_back();
    }
}

std::vector<std::vector<int>> subsetsWithDup(std::vector<int> nums) {
    std::sort(nums.begin(), nums.end());
    std::vector<std::vector<int>> ans;
    std::vector<int> path;
    dfsDup(nums, 0, path, ans);
    return ans;
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "功能開關的組合測試",
              problem: "系統有 5 個功能開關（深色模式、新結帳流程、實驗性搜尋……），QA 要確認任何一種開關組合都不會互相打架。每個開關可開可關，總共有幾種情況、要怎麼一個不漏地列出來？",
              why: "每個開關「開或關」就是每個元素「選或不選」。逐一決定每個開關，決定完就是一種組合，回頭改上一個決定再往下走，2⁵ = 32 種組合一個不漏、一個不重。",
            },
            {
              title: "選幾樣配菜的所有套餐",
              problem: "便當店有 4 種配菜可以任選，菜單要列出所有可能的套餐（含不選任何配菜）。老闆手寫漏了兩種，客人來問才發現。",
              why: "手寫會漏是因為沒有系統性的順序。子集列舉給的就是一個順序：第一樣選不選、第二樣選不選……走到底就是一份套餐，2⁴ = 16 種保證完整。",
            },
            {
              title: "從一堆數字裡找出總和等於目標的組合",
              problem: "報帳時只知道總金額是 1,250 元，發票有 8 張，要找出哪幾張加起來剛好是這個數。",
              why: "8 張發票的每個子集都算一次總和就好，2⁸ = 256 種完全跑得動。子集列舉是這類「試遍所有組合」問題的地基，之後的組合、剪枝都從它長出來。",
            },
          ]}
          cue="所有組合、任選幾個、每個可以要或不要、冪集、開關的每種狀態、n 很小（≤ 20）而要列出全部。"
        />
      </Section>

      <Section id="concept">
        <p>
          子集問題是回溯的第一課，因為它的<strong>決策樹</strong>最單純：對第 i 個元素只有兩個選擇，<strong>選</strong>或<strong>不選</strong>。從 nums[0] 開始，每往下一層決定一個元素，走到第 n 層時每個元素都有了決定，那時的路徑就是一個子集。n 個元素每個兩種選擇，葉節點共 <strong>2ⁿ</strong> 個，每個子集恰好對應一個葉，所以不重不漏。
        </p>
        <p>
          回溯的骨架就是三步：<strong>做選擇</strong>（把 nums[i] 放進 path）、<strong>遞迴</strong>（處理 i+1）、<strong>撤銷選擇</strong>（把 nums[i] 從 path 拿掉）。撤銷是關鍵，因為 path 是所有遞迴呼叫<strong>共用的同一個陣列</strong>，回到上一層時它必須長得和離開前一模一樣，下一個分支才能在正確的狀態上繼續。收集答案時要 <Code>path[:]</Code> 複製一份，否則之後的 pop 會把已經收進答案的子集也改掉。
        </p>
        <p>
          複雜度來自兩個因子：葉節點有 2ⁿ 個，每個子集複製要 O(n)，所以 <strong>O(2ⁿ·n)</strong>。這無法再壓，因為每個元素出現在一半的子集裡，光是把答案寫出來就有 n·2ⁿ⁻¹ 個數字。空間只有遞迴深度和 path 的 <strong>O(n)</strong>（不算輸出）。這也說明為什麼回溯只適合 n 小的問題：n = 20 約一百萬個子集，n = 40 就超過一兆。
        </p>
        <p>
          另一種常見寫法是每層決定「下一個放誰」，用 <Code>start</Code> 只往右挑，樹上<strong>每個節點</strong>（不只是葉）都是一個子集。這個寫法和組合問題長得一樣，也比較容易處理<strong>重複元素</strong>：先排序，同一層裡若 <Code>j &gt; start</Code> 且 <Code>nums[j] == nums[j-1]</Code> 就跳過，因為「這個位置放這個值」的分支剛才已經走過一遍了。<Code>j &gt; start</Code> 不能省：少了它，連 [2, 2] 這種「往下一層再放一個相同的值」也會被跳過。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>準備 <Code>ans</Code>（答案）與 <Code>path</Code>（目前路徑），寫 <Code>dfs(i)</Code> 表示「正在決定第 i 個元素」。</>,
            <>終止條件：<Code>i == len(nums)</Code>，所有元素都決定了，把 <Code>path</Code> <strong>複製一份</strong>放進 <Code>ans</Code>。</>,
            <>做選擇：<Code>path.append(nums[i])</Code>，遞迴 <Code>dfs(i + 1)</Code>。</>,
            <>撤銷選擇：<Code>path.pop()</Code>，讓 <Code>path</Code> 回到進入這一層時的樣子。</>,
            <>走另一條路：不放 nums[i]，直接 <Code>dfs(i + 1)</Code>。兩條路都走完，這一層結束，回到上一層。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>[1, 2, 3] 的決策樹。樹上每個節點寫著目前的路徑，左邊分支是「選」、右邊是「不選」。留意每次撤銷後路徑會退回剛進入那一層時的樣子，8 個葉節點正好是 8 個子集。</p>
        <SubsetsDemo />
      </Section>

      <Section id="code">
        <p>三個版本：選或不選的標準寫法、用 start 的寫法（每個節點都是子集），以及處理重複元素的版本。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 78", name: "Subsets", diff: "Medium" },
            { src: "LeetCode 90", name: "Subsets II（排序後同層跳過重複）", diff: "Medium" },
            { src: "LeetCode 784", name: "Letter Case Permutation（每個字母選大寫或小寫）", diff: "Medium" },
            { src: "LeetCode 1863", name: "Sum of All Subset XOR Totals", diff: "Easy" },
            { src: "LeetCode 2044", name: "Count Number of Maximum Bitwise-OR Subsets", diff: "Medium" },
            { src: "LeetCode 698", name: "Partition to K Equal Sum Subsets（每個數字決定放進哪個子集，加剪枝）", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const subsetsLesson: Lesson = { prereq: "Recursion", Body };
