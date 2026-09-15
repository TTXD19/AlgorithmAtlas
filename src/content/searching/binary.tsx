import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { BinarySearchDemo } from "@/components/lesson/demos/BinarySearchDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# 經典版：閉區間 [lo, hi]，找到任一個 target 就回傳索引，沒有回傳 -1
def binary_search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:                        # 閉區間：lo == hi 時還有一個元素要看
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1                   # mid 已經看過，排除
        else:
            hi = mid - 1
    return -1


# lower_bound：第一個 nums[i] >= target 的 i（不存在就回傳 n）
# 半開區間 [lo, hi)，答案範圍是 0..n，所以 hi 從 n 開始
def lower_bound(nums, target):
    lo, hi = 0, len(nums)
    while lo < hi:                         # 半開區間：lo == hi 表示區間空了
        mid = (lo + hi) // 2
        if nums[mid] >= target:
            hi = mid                       # mid 可能是答案，留在區間裡
        else:
            lo = mid + 1                   # mid 一定不是答案
    return lo                              # 此時 lo == hi


# upper_bound：第一個 nums[i] > target 的 i。只差一個等號
def upper_bound(nums, target):
    lo, hi = 0, len(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > target:
            hi = mid
        else:
            lo = mid + 1
    return lo


# 用兩個邊界回答常見問題
def first_and_last(nums, target):          # LeetCode 34
    lo = lower_bound(nums, target)
    if lo == len(nums) or nums[lo] != target:
        return [-1, -1]
    return [lo, upper_bound(nums, target) - 1]


if __name__ == "__main__":
    a = [2, 5, 8, 8, 8, 13, 21, 34, 55, 89]
    print(binary_search(a, 8))     # 4（任一個）
    print(lower_bound(a, 8))       # 2
    print(upper_bound(a, 8))       # 5
    print(first_and_last(a, 8))    # [2, 4]
    print(lower_bound(a, 9))       # 5（不存在：插入位置）
    # Python 內建：bisect.bisect_left 就是 lower_bound，bisect_right 就是 upper_bound`;

const cpp = `#include <vector>
#include <iostream>
#include <algorithm>

// 經典版：閉區間 [lo, hi]
int binarySearch(const std::vector<int>& nums, int target) {
    int lo = 0, hi = (int)nums.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;      // 避免 lo + hi 溢位
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}

// lower_bound：第一個 nums[i] >= target 的 i，半開區間 [lo, hi)
int lowerBound(const std::vector<int>& nums, int target) {
    int lo = 0, hi = (int)nums.size();
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] >= target) hi = mid;  // mid 可能是答案，留著
        else lo = mid + 1;                  // mid 一定不是答案
    }
    return lo;
}

// upper_bound：第一個 nums[i] > target 的 i
int upperBound(const std::vector<int>& nums, int target) {
    int lo = 0, hi = (int)nums.size();
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] > target) hi = mid;
        else lo = mid + 1;
    }
    return lo;
}

int main() {
    std::vector<int> a = {2, 5, 8, 8, 8, 13, 21, 34, 55, 89};
    std::cout << binarySearch(a, 8) << "\\n";   // 4
    std::cout << lowerBound(a, 8) << "\\n";     // 2
    std::cout << upperBound(a, 8) << "\\n";     // 5
    std::cout << lowerBound(a, 9) << "\\n";     // 5（不存在：插入位置）
    // STL 同名函式回傳迭代器，減去 begin() 就是索引
    std::cout << (std::lower_bound(a.begin(), a.end(), 8) - a.begin()) << "\\n";  // 2
    std::cout << (std::upper_bound(a.begin(), a.end(), 8) - a.begin()) << "\\n";  // 5
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "git bisect：一千個 commit 裡哪一個弄壞了功能",
              problem: "上週還好好的，今天壞了，中間有一千個 commit。一個一個 checkout 再跑測試，一千次。",
              why: "commit 是有順序的，而且「好 → 壞」只會翻轉一次：某個 commit 之前全好、之後全壞。測中間那個，好就往後找、壞就往前找，每次砍掉一半，十次就找到。git bisect 做的就是這件事。",
            },
            {
              title: "版本相容性測試：哪一版開始不支援",
              problem: "套件有 200 個歷史版本，客戶問「最低要哪一版才有這個 API」。",
              why: "「有沒有這個 API」對版本號是單調的：從某一版開始有，之後都有。要找的是「第一個有的版本」，這正是 lower_bound 回答的問題，八次測試就能定位。",
            },
            {
              title: "字典與時間序列查詢",
              problem: "一份依時間排序的 log 有一億筆，要找「10:30 之後的第一筆」；或依字母排序的字典裡找一個字。",
              why: "資料已經排好，每比一次就能扔掉一半。一億筆只要 27 次比較。「第一筆 ≥ 某時間」就是 lower_bound，這也是資料庫索引查範圍的基本動作。",
            },
          ]}
          cue="已排序、單調、第一個滿足條件的位置、最後一個不滿足的位置、log n、砍一半、bisect。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>二分搜尋</strong>只需要一個前提：資料對於你要問的問題是<strong>單調的</strong>。有序陣列是最常見的形式，但本質是「某個條件在前半全部不成立、後半全部成立」。看中間那個元素，就知道答案在左半還是右半，扔掉另一半。每次砍一半，n 個元素 <strong>⌈log₂(n+1)⌉</strong> 次就到底，這是 <strong>O(log n)</strong> 的來源。不過要真的做到 O(log n)，還得能直接跳到中間那格：陣列可以，鏈結串列光是走到中間就要 O(n)。
        </p>
        <p>
          最常見的錯不是想法錯，是<strong>邊界寫錯</strong>：<Code>hi</Code> 該是 <Code>n</Code> 還是 <Code>n-1</Code>、迴圈是 <Code>&lt;</Code> 還是 <Code>&lt;=</Code>、更新是 <Code>mid</Code> 還是 <Code>mid+1</Code>，三者必須配套。記住兩套寫法就夠。<strong>閉區間</strong> <Code>[lo, hi]</Code>：<Code>hi = n-1</Code>，<Code>while lo &lt;= hi</Code>，兩邊都用 <Code>mid ± 1</Code> 排除，找到就回傳，適合「找任一個等於 target 的」。<strong>半開區間</strong> <Code>[lo, hi)</Code>：<Code>hi = n</Code>，<Code>while lo &lt; hi</Code>，條件成立時 <Code>hi = mid</Code>（mid 可能是答案，留著），不成立時 <Code>lo = mid + 1</Code>（mid 確定不是），迴圈結束時 <Code>lo == hi</Code> 就是答案，適合「找第一個滿足條件的位置」。
        </p>
        <p>
          <strong>lower_bound</strong> 是「第一個 <Code>≥ target</Code> 的位置」，<strong>upper_bound</strong> 是「第一個 <Code>&gt; target</Code> 的位置」，程式碼只差一個等號。它們回傳的是 <Code>0..n</Code> 之間的<strong>插入位置</strong>，target 不存在時不會回傳 −1，而是「如果要插入應該放哪」，所以 <Code>hi</Code> 必須能等於 <Code>n</Code>。有了這兩個，很多問題直接組合：target 存在嗎，看 <Code>lower &lt; n and a[lower] == target</Code>；出現幾次，<Code>upper − lower</Code>；最後一次出現的位置（先確認存在），<Code>upper − 1</Code>；「最後一個 <Code>≤ target</Code>」，<Code>upper − 1</Code>；「最後一個 <Code>&lt; target</Code>」，<Code>lower − 1</Code>。
        </p>
        <p>
          半開區間為什麼不會無限迴圈：<Code>mid = (lo + hi) // 2</Code> 向下取整，所以 <Code>mid &lt; hi</Code>，<Code>hi = mid</Code> 一定縮小；<Code>lo = mid + 1</Code> 一定變大。若你寫成「<Code>lo = mid</Code>」這種不排除 mid 的更新，<Code>lo</Code> 和 <Code>hi</Code> 相鄰時 mid 會等於 lo，就卡死了。這時要改成向上取整 <Code>mid = (lo + hi + 1) // 2</Code>，另一邊配 <Code>hi = mid - 1</Code>。C++ 裡 <Code>lo + hi</Code> 可能溢位，寫 <Code>lo + (hi - lo) / 2</Code>。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>確認資料對你的條件是<strong>單調</strong>的：前半全「否」、後半全「是」。把問題改寫成「找第一個『是』的位置」。</>,
            <>選半開區間：<Code>lo = 0</Code>，<Code>hi = n</Code>。答案範圍是 <Code>0..n</Code>，<Code>n</Code> 代表「全部都是否」。</>,
            <><Code>while lo &lt; hi</Code>：<Code>mid = (lo + hi) // 2</Code>。</>,
            <>條件成立（<Code>a[mid] ≥ target</Code>）：<Code>hi = mid</Code>，mid 留在區間裡。不成立：<Code>lo = mid + 1</Code>，mid 排除。</>,
            <>迴圈結束時 <Code>lo == hi</Code>，就是答案。要 upper_bound 把 <Code>≥</Code> 改成 <Code>&gt;</Code>；要判斷存在，檢查 <Code>lo &lt; n and a[lo] == target</Code>。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>陣列裡 8 出現三次。三個模式對同一份資料、同一個目標：「找任一個」用閉區間，找到就停，回傳的是哪一個 8 沒有保證；lower_bound 和 upper_bound 用半開區間，最後 lo 和 hi 會合的位置就是答案。注意 hi 在半開區間裡是「不含」的，所以可以指到陣列外的 n。</p>
        <BinarySearchDemo />
      </Section>

      <Section id="code">
        <p>三個函式：經典閉區間版、lower_bound、upper_bound，以及用它們組出「第一次與最後一次出現」。Python 內建 <Code>bisect_left</Code> / <Code>bisect_right</Code>、C++ 的 <Code>std::lower_bound</Code> / <Code>std::upper_bound</Code> 就是這兩個邊界，會自己寫才知道它們回傳什麼。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 704", name: "Binary Search", diff: "Easy" },
            { src: "LeetCode 35", name: "Search Insert Position（就是 lower_bound）", diff: "Easy" },
            { src: "LeetCode 278", name: "First Bad Version（git bisect 的題目版）", diff: "Easy" },
            { src: "LeetCode 34", name: "Find First and Last Position of Element in Sorted Array", diff: "Medium" },
            { src: "LeetCode 33", name: "Search in Rotated Sorted Array（判斷哪半邊有序）", diff: "Medium" },
            { src: "LeetCode 162", name: "Find Peak Element（對「上坡／下坡」二分）", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const binaryLesson: Lesson = { prereq: "Array、Linear Search", Body };
