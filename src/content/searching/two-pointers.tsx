import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { TwoPointersDemo } from "@/components/lesson/demos/TwoPointersDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# 對撞指標：有序陣列兩數之和，回傳 0-based 索引
# （LeetCode 167 要的是 1-based，交出去前兩個各加 1）
def two_sum_sorted(nums, target):
    l, r = 0, len(nums) - 1
    while l < r:
        s = nums[l] + nums[r]
        if s == target:
            return [l, r]
        if s < target:
            l += 1                         # nums[l] 配最大的都不夠，淘汰它
        else:
            r -= 1                         # nums[r] 配最小的都太大，淘汰它
    return [-1, -1]


# 同向指標：原地移除有序陣列的重複（LeetCode 26），回傳新長度
# w 是「下一個要寫的位置」，r 負責讀
def remove_duplicates(nums):
    if not nums:
        return 0
    w = 1
    for r in range(1, len(nums)):
        if nums[r] != nums[w - 1]:         # 和上一個保留的不同才是新值
            nums[w] = nums[r]
            w += 1
    return w                               # nums[:w] 是結果


# 對撞指標的另一個經典：三數之和（LeetCode 15）
# 排序後固定一個數，剩下的用兩數之和夾
def three_sum(nums):
    nums.sort()
    out = []
    for i in range(len(nums) - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue                       # 跳過重複的第一個數
        l, r = i + 1, len(nums) - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if s < 0:
                l += 1
            elif s > 0:
                r -= 1
            else:
                out.append([nums[i], nums[l], nums[r]])
                l += 1
                r -= 1
                while l < r and nums[l] == nums[l - 1]:
                    l += 1                 # 跳過重複的第二個數
    return out


if __name__ == "__main__":
    print(two_sum_sorted([2, 3, 5, 8, 11, 14, 17, 21], 25))   # [3, 6]
    a = [1, 1, 2, 2, 2, 3, 5, 5, 6, 6]
    n = remove_duplicates(a)
    print(a[:n])                                              # [1, 2, 3, 5, 6]
    print(three_sum([-1, 0, 1, 2, -1, -4]))                   # [[-1, -1, 2], [-1, 0, 1]]`;

const cpp = `#include <vector>
#include <iostream>
#include <algorithm>

// 對撞指標：有序陣列兩數之和，回傳 0-based 索引
std::vector<int> twoSumSorted(const std::vector<int>& nums, int target) {
    int l = 0, r = (int)nums.size() - 1;
    while (l < r) {
        long long s = (long long)nums[l] + nums[r];   // 兩個大 int 相加可能溢位
        if (s == target) return {l, r};
        if (s < target) l++;               // nums[l] 淘汰
        else r--;                          // nums[r] 淘汰
    }
    return {-1, -1};
}

// 同向指標：原地移除重複，回傳新長度
int removeDuplicates(std::vector<int>& nums) {
    if (nums.empty()) return 0;
    int w = 1;
    for (int r = 1; r < (int)nums.size(); r++) {
        if (nums[r] != nums[w - 1]) nums[w++] = nums[r];
    }
    return w;
}

// 三數之和：固定一個，其餘兩數之和夾
std::vector<std::vector<int>> threeSum(std::vector<int> nums) {
    std::sort(nums.begin(), nums.end());
    std::vector<std::vector<int>> out;
    int n = (int)nums.size();
    for (int i = 0; i + 2 < n; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        int l = i + 1, r = n - 1;
        while (l < r) {
            long long s = (long long)nums[i] + nums[l] + nums[r];
            if (s < 0) l++;
            else if (s > 0) r--;
            else {
                out.push_back({nums[i], nums[l], nums[r]});
                l++; r--;
                while (l < r && nums[l] == nums[l - 1]) l++;
            }
        }
    }
    return out;
}

int main() {
    auto p = twoSumSorted({2, 3, 5, 8, 11, 14, 17, 21}, 25);
    std::cout << p[0] << " " << p[1] << "\\n";                 // 3 6
    std::vector<int> a = {1, 1, 2, 2, 2, 3, 5, 5, 6, 6};
    int n = removeDuplicates(a);
    for (int i = 0; i < n; i++) std::cout << a[i] << " ";     // 1 2 3 5 6
    std::cout << "\\n";
    for (auto& t : threeSum({-1, 0, 1, 2, -1, -4})) std::cout << t[0] << "," << t[1] << "," << t[2] << "  ";
    std::cout << "\\n";                                        // -1,-1,2  -1,0,1
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "有序名單裡找一對加起來剛好的",
              problem: "一份依金額排序的交易紀錄，要找兩筆加起來等於某個對帳金額。暴力是每一筆配每一筆，n(n−1)/2 對，O(n²)。",
              why: "資料有序就有結構可以用：最小加最大太小，表示最小配誰都不夠，直接淘汰；太大就淘汰最大。一左一右往中間夾，每步淘汰一個，最多 n − 1 步就結束。這是有序配對的標準解法。",
            },
            {
              title: "原地整理：去重、搬移零、過濾",
              problem: "一個排好序的陣列裡有重複，要把重複去掉，而且不能開新陣列（記憶體受限或介面要求原地）。",
              why: "一個指標往前讀，一個指標記「寫到哪了」。讀指標永遠不慢於寫指標，所以覆寫不會弄壞還沒讀的資料。這是同向雙指標，O(n) 時間、O(1) 額外空間。",
            },
            {
              title: "回文判斷、合併兩份有序清單",
              problem: "判斷一個字串正著讀反著讀一樣；或把兩份各自有序的清單合成一份有序的。",
              why: "回文是從兩端往中間比，合併是兩個指標各在一份清單上往前走。它們都是「用兩個位置的關係推進」，不需要巢狀迴圈。",
            },
          ]}
          cue="已排序、配對、兩端往中間、原地修改、O(n²) 的雙迴圈裡兩個索引有單調關係。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>雙指標</strong>是一種把兩層迴圈壓成一層的技巧：兩個索引在陣列上移動，但每一步都<strong>只往一個方向走</strong>，總移動距離加起來不超過 2n，所以是 <strong>O(n)</strong>。暴力雙迴圈之所以 O(n²)，是因為外層每換一個位置，內層就重新掃一整段；雙指標能省下來，是因為問題有某種<strong>單調性</strong>讓「回頭」變得沒必要。
        </p>
        <p>
          <strong>對撞指標</strong>：一個從最左、一個從最右往中間走。以有序陣列兩數之和為例，<Code>a[l] + a[r]</Code> 太小時，<Code>a[r]</Code> 已是剩下最大的，<Code>a[l]</Code> 無論配剩下的誰都不夠（和已淘汰元素的配對早就排除了），可以安全丟掉；太大時同理丟掉 <Code>a[r]</Code>。每一步都淘汰一個元素，且淘汰是<strong>有證明的</strong>，這才是它正確的原因，不是「看起來合理」。前提是資料<strong>有序</strong>，無序資料要先排序，或改用雜湊表。注意排序會打亂原本的索引，題目要回傳原索引（例如 LeetCode 1）時，要連索引一起排，或直接用雜湊表。
        </p>
        <p>
          <strong>同向指標</strong>（快慢指標）：兩個指標都往右，一個讀一個寫，或一個探路一個跟隨。移除重複時，<Code>w</Code> 是下一個寫入位置，<Code>r</Code> 往前讀，<Code>a[r]</Code> 和上一個保留值不同就寫進 <Code>a[w]</Code>。因為 <Code>w ≤ r</Code> 恆成立，覆寫的永遠是已經讀過的格子。搬移零、過濾、壓縮字串，都是同一個骨架。
        </p>
        <p>
          和滑動視窗的關係：滑動視窗就是同向雙指標，兩個指標之間的區間有特別意義（視窗）。和二分搜尋的關係：兩者都靠有序性，二分一次砍一半找<strong>一個位置</strong>，雙指標一次淘汰一個找<strong>一對</strong>。三數之和是把一層迴圈固定住，裡面跑對撞指標，O(n²) 取代 O(n³)。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>對撞指標先問：資料有序嗎？無序而題目允許排序就先排（O(n log n)），不允許就考慮雜湊表。同向指標的搬移零、過濾這類題目不需要有序。</>,
            <>對撞：<Code>l = 0</Code>，<Code>r = n − 1</Code>，<Code>while l &lt; r</Code>。比較 <Code>a[l] + a[r]</Code> 和目標。</>,
            <>太小 <Code>l += 1</Code>，太大 <Code>r −= 1</Code>，相等就是答案。每步問自己：被淘汰的那個，為什麼配任何人都不行？</>,
            <>同向：<Code>w = 0</Code>（或 1），<Code>for r in range(n)</Code>。<Code>a[r]</Code> 該保留就 <Code>a[w] = a[r]; w += 1</Code>。</>,
            <>結束時對撞指標回傳找到的一對或「沒有」，同向指標回傳 <Code>w</Code>，<Code>a[:w]</Code> 是結果。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>「對撞」模式在有序陣列找兩數之和 25，劃掉的格子是被證明不可能的。「同向」模式原地移除重複，綠色是已寫好的結果、黃色是正在讀的位置，注意 w 永遠不超過 r。</p>
        <TwoPointersDemo />
      </Section>

      <Section id="code">
        <p>對撞指標的兩數之和、同向指標的移除重複，以及固定一個數再對撞的三數之和。三數之和的去重是最容易寫錯的地方，看清楚兩處跳過重複的位置。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 167", name: "Two Sum II - Input Array Is Sorted", diff: "Medium" },
            { src: "LeetCode 26", name: "Remove Duplicates from Sorted Array", diff: "Easy" },
            { src: "LeetCode 283", name: "Move Zeroes（同向：讀寫指標）", diff: "Easy" },
            { src: "LeetCode 125", name: "Valid Palindrome", diff: "Easy" },
            { src: "LeetCode 15", name: "3Sum", diff: "Medium" },
            { src: "LeetCode 11", name: "Container With Most Water（淘汰矮的那邊）", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const twoPointersLesson: Lesson = { prereq: "Array", Body };
