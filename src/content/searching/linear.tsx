import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { LinearSearchDemo } from "@/components/lesson/demos/LinearSearchDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# 線性搜尋：從頭掃到尾，找到就回傳索引，沒有就回傳 -1
def linear_search(nums, target):
    for i, x in enumerate(nums):
        if x == target:
            return i
    return -1


# 變形一：回傳所有符合條件的位置（條件用函式傳入）
# 條件是任意函式時，每個元素都得檢查一次，O(n) 已經是最好
def find_all(items, pred):
    return [i for i, x in enumerate(items) if pred(x)]


# 變形二：哨兵法。暫時把目標放在尾端，保證一定找得到，
# 迴圈裡每一輪就省掉一次 i < n 的邊界檢查
# 這是 C 這類語言的技巧；在 Python 裡通常比上面的 for 迴圈還慢
def sentinel_search(nums, target):
    n = len(nums)
    nums.append(target)                 # 哨兵（暫時改動 nums）
    i = 0
    while nums[i] != target:
        i += 1
    nums.pop()                          # 還原
    return i if i < n else -1           # 停在哨兵上 = 原本沒有


if __name__ == "__main__":
    data = [17, 4, 29, 8, 51, 23, 12, 46, 3, 35]
    print(linear_search(data, 46))                 # 7
    print(linear_search(data, 40))                 # -1
    print(find_all(data, lambda x: x % 2 == 0))    # [1, 3, 6, 7]
    print(sentinel_search(data, 46))               # 7
    print(sentinel_search(data, 40), len(data))    # -1 10（哨兵已移除）
    # 內建的 in 和 list.index 也是線性搜尋；index 找不到會丟 ValueError
    print(40 in data, data.index(46))              # False 7`;

const cpp = `#include <vector>
#include <iostream>
#include <functional>
#include <algorithm>

// 線性搜尋：找到就回傳索引，沒有就回傳 -1
int linearSearch(const std::vector<int>& nums, int target) {
    for (int i = 0; i < (int)nums.size(); i++) {
        if (nums[i] == target) return i;
    }
    return -1;
}

// 變形一：回傳所有符合條件的位置
std::vector<int> findAll(const std::vector<int>& items, const std::function<bool(int)>& pred) {
    std::vector<int> out;
    for (int i = 0; i < (int)items.size(); i++) {
        if (pred(items[i])) out.push_back(i);
    }
    return out;
}

// 變形二：哨兵法，迴圈裡不檢查邊界，結束前還原
// 用參考傳入：若複製整個 vector，O(n) 的複製就把省下的比較吃光了
int sentinelSearch(std::vector<int>& nums, int target) {
    int n = (int)nums.size();
    nums.push_back(target);              // 哨兵，保證一定找得到
    int i = 0;
    while (nums[i] != target) i++;
    nums.pop_back();                     // 還原
    return i < n ? i : -1;               // 停在哨兵上 = 原本沒有
}

int main() {
    std::vector<int> data = {17, 4, 29, 8, 51, 23, 12, 46, 3, 35};
    std::cout << linearSearch(data, 46) << "\\n";        // 7
    std::cout << linearSearch(data, 40) << "\\n";        // -1
    for (int i : findAll(data, [](int x) { return x % 2 == 0; })) std::cout << i << " ";  // 1 3 6 7
    std::cout << "\\n" << sentinelSearch(data, 46) << "\\n";  // 7
    std::cout << sentinelSearch(data, 40) << "\\n";      // -1
    std::cout << data.size() << "\\n";                   // 10（哨兵已移除）
    // STL 的 std::find 也是線性搜尋，回傳迭代器，找不到就是 end()
    auto it = std::find(data.begin(), data.end(), 46);
    std::cout << (it - data.begin()) << "\\n";           // 7
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "設定檔裡找一個 key",
              problem: "程式啟動時讀一個幾十行的設定檔，要找某個欄位的值。要不要先建索引、排序、用雜湊表？",
              why: "幾十筆資料從頭看到尾，只要微秒等級的時間。排序或建雜湊表本身就得把每一筆都處理一遍，只找一次的話，建置成本一定比直接掃一遍高。資料小又只找一次，一個一個看就是最快的方法。",
            },
            {
              title: "日誌裡找第一筆錯誤",
              problem: "一份剛寫完的日誌檔，順序是時間，內容沒有任何索引。要找出第一次出現 ERROR 的那一行。",
              why: "資料沒有依你要找的東西排序，也不會重複查很多次。這種情況沒有捷徑，順著掃是唯一的選擇，而且找到就能停。",
            },
            {
              title: "「最近開啟的檔案」清單",
              problem: "手上有一份 5 個元素的「最近用過的檔案」清單，每次開檔都要查它在不在清單裡。要用雜湊表嗎？",
              why: "元素很少時，線性掃描的常數比雜湊小：不用算 hash、記憶體連續、CPU 快取友善。5 個元素最多比 5 次，不值得為它另外維護一個雜湊表，還要保持兩者同步。",
            },
          ]}
          cue="資料無序、資料很小、只查一次、找到就停、不值得先排序或建索引。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>線性搜尋</strong>是最直接的搜尋：從第一個元素開始，一個一個和目標比，相等就回傳位置，掃完都沒有就回傳「不存在」。它不需要資料有任何性質，不需要排序、不需要額外空間，任何可以逐一走訪的東西（陣列、鏈結串列、檔案的每一行）都能用。
        </p>
        <p>
          成本是 <strong>O(n)</strong> 時間、<strong>O(1)</strong> 額外空間：最好情況第一格就中，比 1 次；最壞情況比 n 次（目標在最後一格或不存在）；目標存在且在每個位置的機率相同時，平均比 (n+1)/2 次，仍然是 O(n)。這個數字本身不是問題，問題是它會不會被重複很多次。查一次 O(n) 很便宜；查 m 次就是 O(mn)，這時才需要先花 O(n log n) 排序換取每次 O(log n) 的二分搜尋，或花 O(n) 建雜湊表換取每次平均 O(1)。<strong>優化是用建置成本換查詢成本</strong>，只查一次的資料不值得。
        </p>
        <p>
          另一個容易忽略的點是<strong>常數</strong>。線性掃描的迴圈極簡單，記憶體連續存取，CPU 分支預測和快取都很友善。元素在幾十個以內時，它常常比雜湊表快，因為省掉了算 hash 和隨機記憶體存取。所以「小就直接掃」是真實世界的做法，不是偷懶：例如 Rust 標準函式庫的 BTreeMap，每個節點最多放 11 個 key，在節點裡找 key 用的就是線性搜尋。
        </p>
        <p>
          和相鄰工具的分界：資料<strong>已經有序</strong>（而且能隨機存取），直接二分搜尋，查一次也划算；資料<strong>無序</strong>但會<strong>重複查</strong>，先排序再二分，或建雜湊表；資料無序又只查一次，或資料小到建結構的成本都划不來，就用線性搜尋。另外，沒有任何結構可利用時，最壞情況每一格都得看過才能確定目標不在，所以 O(n) 已經是下限，不是寫得不好。學它的重點不是演算法本身，而是知道<strong>什麼時候不需要更好的演算法</strong>。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>從索引 0 開始，<Code>i = 0</Code>。</>,
            <>只要 <Code>i &lt; n</Code>，就比較 <Code>nums[i]</Code> 和目標。相等就回傳 <Code>i</Code>，這是唯一的成功出口。</>,
            <>不相等就 <Code>i += 1</Code>，回到上一步。</>,
            <><Code>i</Code> 到達 <Code>n</Code>（包括陣列是空的、一開始 <Code>n = 0</Code>）表示全部看過都沒有，回傳 <Code>-1</Code>。</>,
            <>需要「所有符合的位置」時，不要提前回傳，把每個符合的 <Code>i</Code> 收進清單，掃完再回傳。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>無序的 10 個數字裡找 46，再切換成找不存在的 40，看最壞情況比了幾次。下方表格列出不同 n 時，線性搜尋和二分搜尋最壞要比幾次，二分的前提是資料已經排好。</p>
        <LinearSearchDemo />
      </Section>

      <Section id="code">
        <p>基本版、回傳所有符合位置的版本，以及每一輪省一次邊界檢查的哨兵法。三段都是 O(n) 時間，差在回傳什麼和迴圈裡做幾次比較。最後附上語言內建的線性搜尋：Python 的 <Code>in</Code>、<Code>list.index</Code>，C++ 的 <Code>std::find</Code>。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 2057", name: "Smallest Index With Equal Value（找第一個，找不到回傳 -1）", diff: "Easy" },
            { src: "LeetCode 2108", name: "Find First Palindromic String in the Array（條件換成函式，找到就停）", diff: "Easy" },
            { src: "LeetCode 2942", name: "Find Words Containing Character（回傳所有符合的位置）", diff: "Easy" },
            { src: "LeetCode 1779", name: "Find Nearest Point That Has the Same X or Y Coordinate", diff: "Easy" },
            { src: "LeetCode 1848", name: "Minimum Distance to the Target Element（從 start 往兩邊找）", diff: "Easy" },
            { src: "LeetCode 1", name: "Two Sum（先對每個數線性搜尋另一半，再想為什麼要換雜湊表）", diff: "Easy" },
          ]}
        />
      </Section>
    </>
  );
}

export const linearLesson: Lesson = { prereq: "Array", Body };
