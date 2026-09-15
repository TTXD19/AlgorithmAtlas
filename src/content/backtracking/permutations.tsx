import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { PermutationsDemo } from "@/components/lesson/demos/PermutationsDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# 全排列（LeetCode 46）：used 陣列記錄誰已經在路徑上
def permute(nums):
    ans = []
    path = []
    used = [False] * len(nums)

    def dfs():
        if len(path) == len(nums):        # 每個位置都填了
            ans.append(path[:])
            return
        for j in range(len(nums)):
            if used[j]:                   # 已經在路徑上，跳過
                continue
            used[j] = True                # 做選擇
            path.append(nums[j])
            dfs()
            path.pop()                    # 撤銷選擇
            used[j] = False

    dfs()
    return ans


# 交換法：第 i 個位置和 i 之後的每個元素交換，不用 used 也不用 path
def permute_swap(nums):
    ans = []

    def dfs(i):
        if i == len(nums):
            ans.append(nums[:])
            return
        for j in range(i, len(nums)):
            nums[i], nums[j] = nums[j], nums[i]   # 做選擇：nums[j] 放到位置 i
            dfs(i + 1)
            nums[i], nums[j] = nums[j], nums[i]   # 撤銷：換回來

    dfs(0)
    return ans


# 含重複元素的排列（LeetCode 47）：排序後，相同的值必須「前一個用了才能用後一個」
def permute_unique(nums):
    nums = sorted(nums)                   # 排序出新串列，不改動呼叫者的輸入
    ans = []
    path = []
    used = [False] * len(nums)

    def dfs():
        if len(path) == len(nums):
            ans.append(path[:])
            return
        for j in range(len(nums)):
            if used[j]:
                continue
            if j > 0 and nums[j] == nums[j - 1] and not used[j - 1]:
                continue                  # 同樣的值已經在這個位置試過
            used[j] = True
            path.append(nums[j])
            dfs()
            path.pop()
            used[j] = False

    dfs()
    return ans


if __name__ == "__main__":
    print(permute([1, 2, 3]))
    # [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]
    print(permute_swap([1, 2, 3]))       # 同樣 6 個，但最後兩個順序不同
    # [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 2, 1], [3, 1, 2]]
    print(permute_unique([1, 1, 2]))
    # [[1, 1, 2], [1, 2, 1], [2, 1, 1]]`;

const cpp = `#include <vector>
#include <algorithm>

// 全排列：used 陣列
void dfsUsed(const std::vector<int>& nums, std::vector<bool>& used, std::vector<int>& path, std::vector<std::vector<int>>& ans) {
    if (path.size() == nums.size()) {     // 每個位置都填了
        ans.push_back(path);
        return;
    }
    for (int j = 0; j < (int)nums.size(); j++) {
        if (used[j]) continue;            // 已經在路徑上
        used[j] = true;                   // 做選擇
        path.push_back(nums[j]);
        dfsUsed(nums, used, path, ans);
        path.pop_back();                  // 撤銷選擇
        used[j] = false;
    }
}

std::vector<std::vector<int>> permute(const std::vector<int>& nums) {
    std::vector<std::vector<int>> ans;
    std::vector<int> path;
    std::vector<bool> used(nums.size(), false);
    dfsUsed(nums, used, path, ans);
    return ans;
}

// 交換法：位置 i 和之後的每個元素交換
void dfsSwap(std::vector<int>& nums, int i, std::vector<std::vector<int>>& ans) {
    if (i == (int)nums.size()) { ans.push_back(nums); return; }
    for (int j = i; j < (int)nums.size(); j++) {
        std::swap(nums[i], nums[j]);      // 做選擇
        dfsSwap(nums, i + 1, ans);
        std::swap(nums[i], nums[j]);      // 撤銷
    }
}

std::vector<std::vector<int>> permuteSwap(std::vector<int> nums) {
    std::vector<std::vector<int>> ans;
    dfsSwap(nums, 0, ans);
    return ans;
}

// 含重複元素：排序後，相同的值前一個沒用就不能用後一個
void dfsUnique(const std::vector<int>& nums, std::vector<bool>& used, std::vector<int>& path, std::vector<std::vector<int>>& ans) {
    if (path.size() == nums.size()) { ans.push_back(path); return; }
    for (int j = 0; j < (int)nums.size(); j++) {
        if (used[j]) continue;
        if (j > 0 && nums[j] == nums[j - 1] && !used[j - 1]) continue;
        used[j] = true;
        path.push_back(nums[j]);
        dfsUnique(nums, used, path, ans);
        path.pop_back();
        used[j] = false;
    }
}

std::vector<std::vector<int>> permuteUnique(std::vector<int> nums) {
    std::sort(nums.begin(), nums.end());
    std::vector<std::vector<int>> ans;
    std::vector<int> path;
    std::vector<bool> used(nums.size(), false);
    dfsUnique(nums, used, path, ans);
    return ans;
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "工作站的加工順序",
              problem: "一台機器要處理 6 個訂單，每個訂單之間切換模具的時間不同，順序不同總耗時就不同。要找最省時的順序。",
              why: "順序問題和子集問題不同：同一批東西換個順序就是不同答案。6 個訂單有 6! = 720 種順序，全部列出來各算一次總耗時就好。這是排程問題在 n 小時最直接的解法，也是理解 TSP 這類問題的起點。",
            },
            {
              title: "送貨路線列舉",
              problem: "外送員從店家出發要送 5 個地點再回來，哪個順序總距離最短？",
              why: "5 個地點的所有拜訪順序就是 5 的全排列。用 used 陣列記住哪些地點已經排進路線，每一步從還沒排的裡面挑，走到底就是一條完整路線。",
            },
            {
              title: "字謎與密碼變體",
              problem: "把「listen」的字母重新排列能拼出哪些字？測試帳號的密碼是幾個片段的某種順序，要把所有順序都試一遍。",
              why: "字母的重新排列就是排列。有重複字母時要避免產生一樣的結果，排序後加一條「相同的值前一個沒用就跳過」的規則即可。",
            },
          ]}
          cue="順序、排法、有幾種排法、每個元素恰好用一次、n!、字母重組、路線的拜訪順序。"
        />
      </Section>

      <Section id="concept">
        <p>
          子集是對每個<strong>元素</strong>問「選不選」，排列則是對每個<strong>位置</strong>問「放誰」。第一個位置有 n 個選擇，第二個位置剩 n−1 個，依此類推，葉節點共 <strong>n!</strong> 個。決策樹不再是二元的，每層的分支數等於「還沒用過的元素數」。
        </p>
        <p>
          要知道誰還沒用過，最直接的做法是一個 <Code>used</Code> 陣列。每層 for 迴圈掃過所有元素，<Code>used[j]</Code> 為 true 就跳過，否則<strong>做選擇</strong>（標記 used、放進 path）、<strong>遞迴</strong>到下一個位置、<strong>撤銷選擇</strong>（拿掉、取消標記）。撤銷必須把兩樣東西都復原，少一個下個分支就會看到錯誤的狀態，這是排列最常見的 bug。
        </p>
        <p>
          <strong>交換法</strong>省掉 used 和 path：位置 i 依序和 i 之後的每個元素交換，前 i 個就是已經決定的部分、後面就是還沒用的部分。遞迴回來時再換回去。它少一個陣列，但產生的順序和 used 版不同，遇到重複元素也比較難處理。
        </p>
        <p>
          複雜度是 <strong>O(n!·n)</strong>：n! 個排列各複製 O(n)。n = 10 是三百六十萬，n = 12 已經四億多，所以排列只能在 n 很小時完整列舉；n 大時題目通常要的是「最佳的一種」，那就得轉向 DP（例如狀態壓縮）或貪婪。<strong>重複元素</strong>的處理是先排序，同一層裡若 <Code>nums[j] == nums[j-1]</Code> 且 <Code>used[j-1]</Code> 為 false，表示這個值在同一層已經當過開頭，跳過。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>準備 <Code>ans</Code>、<Code>path</Code> 與 <Code>used</Code>（全 false）。<Code>dfs()</Code> 表示「決定下一個位置放誰」。</>,
            <>終止條件：<Code>len(path) == n</Code>，所有位置都填了，複製 <Code>path</Code> 放進 <Code>ans</Code>。</>,
            <>for 迴圈掃過每個 j：<Code>used[j]</Code> 為 true 就 continue。</>,
            <>做選擇：<Code>used[j] = True</Code>、<Code>path.append(nums[j])</Code>，遞迴 <Code>dfs()</Code>。</>,
            <>撤銷選擇：<Code>path.pop()</Code>、<Code>used[j] = False</Code>，兩樣都要復原，然後試下一個 j。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>[1, 2, 3] 的排列樹。每一層從 used 為 false 的數字裡挑，下方同時顯示 used 陣列和路徑。留意每次撤銷時 used 和路徑是一起復原的。</p>
        <PermutationsDemo />
      </Section>

      <Section id="code">
        <p>used 陣列版、交換法，以及含重複元素的版本。三者的骨架都是「做選擇、遞迴、撤銷」，差在怎麼記錄「誰還沒用」。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 46", name: "Permutations", diff: "Medium" },
            { src: "LeetCode 47", name: "Permutations II（排序加 used[j-1] 判斷）", diff: "Medium" },
            { src: "LeetCode 31", name: "Next Permutation（不用回溯，找下一個字典序）", diff: "Medium" },
            { src: "LeetCode 526", name: "Beautiful Arrangement", diff: "Medium" },
            { src: "LeetCode 60", name: "Permutation Sequence（用階乘直接算第 k 個）", diff: "Hard" },
            { src: "LeetCode 996", name: "Number of Squareful Arrays", diff: "Hard" },
          ]}
        />
      </Section>
    </>
  );
}

export const permutationsLesson: Lesson = { prereq: "Recursion、Subsets", Body };
