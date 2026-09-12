import { CodeTabs } from "@/components/lesson/CodeTabs";
import { Section, Steps, Problems, Code, Applications } from "@/components/lesson/parts";
import { ArrayOpsDemo } from "@/components/lesson/demos/ArrayOpsDemo";
import type { Lesson } from "@/lib/lessons";

const python = `# Python 的 list 就是動態陣列
nums = [12, 7, 3, 9, 15, 4]

nums[3]              # O(1)：位址 = 起點 + 3 × 每格大小，直接跳過去
nums[3] = 10         # O(1)
nums.append(8)       # O(1) 攤銷：尾端有空位就直接放
nums.pop()           # O(1)：把 size 減 1

nums.insert(0, 99)   # O(n)：所有元素往右挪一格
nums.pop(0)          # O(n)：所有元素往左挪一格
99 in nums           # O(n)：沒排序，只能一個一個看
del nums[2]          # O(n)：後面的元素往左補


# 原地移除所有等於 val 的元素（LeetCode 27）：
# 用「寫入指標」把要留的元素往前搬，不開新陣列
def remove_element(nums, val):
    write = 0
    for read in range(len(nums)):
        if nums[read] != val:
            nums[write] = nums[read]
            write += 1
    return write            # 前 write 個就是結果


# 原地旋轉 k 格（LeetCode 189）：三次反轉，O(n) 時間、O(1) 空間
def rotate(nums, k):
    def reverse(i, j):
        while i < j:
            nums[i], nums[j] = nums[j], nums[i]
            i, j = i + 1, j - 1
    n = len(nums)
    k %= n
    reverse(0, n - 1)       # 整個反轉
    reverse(0, k - 1)       # 前 k 個反轉回來
    reverse(k, n - 1)       # 後 n-k 個反轉回來`;

const cpp = `#include <vector>
#include <algorithm>

// std::vector 就是動態陣列
int main() {
    std::vector<int> nums = {12, 7, 3, 9, 15, 4};

    nums[3];                          // O(1)
    nums[3] = 10;                     // O(1)
    nums.push_back(8);                // O(1) 攤銷
    nums.pop_back();                  // O(1)

    nums.insert(nums.begin(), 99);    // O(n)：全部往右挪
    nums.erase(nums.begin());         // O(n)：全部往左挪
    std::find(nums.begin(), nums.end(), 99);   // O(n)

    // 事先知道大小就 reserve，完全避免擴容搬移
    std::vector<int> big;
    big.reserve(1000000);
}

// 原地移除 val：讀寫雙指標
int removeElement(std::vector<int>& nums, int val) {
    int write = 0;
    for (int read = 0; read < (int)nums.size(); read++)
        if (nums[read] != val) nums[write++] = nums[read];
    return write;
}

// 原地旋轉 k 格：三次反轉
void rotate(std::vector<int>& nums, int k) {
    int n = nums.size();
    k %= n;
    std::reverse(nums.begin(), nums.end());
    std::reverse(nums.begin(), nums.begin() + k);
    std::reverse(nums.begin() + k, nums.end());
}`;

function Body() {
  return (
    <>
      <Section id="why">
        <Applications
          items={[
            {
              title: "為什麼 arr[1000000] 和 arr[0] 一樣快",
              problem: "圖片的像素、音訊的取樣點、資料庫的一列列紀錄，程式最常做的事就是「拿第 i 個」。如果拿第 100 萬個要從頭數過去，什麼都做不了。",
              why: "陣列把元素放在連續的記憶體，第 i 個的位址就是起點 + i × 每格大小。一次乘法加法就到，這是 O(1) 隨機存取。",
            },
            {
              title: "為什麼 list.insert(0, x) 會讓程式變慢",
              problem: "有人寫了一個迴圈，每次都把新資料插到 list 的最前面。資料一萬筆時還好，十萬筆時整個程式卡住。",
              why: "連續記憶體的代價：中間插入要把後面的元素全部往後挪。每次插入 O(n)，n 次就是 O(n²)。知道這點，就知道要改成 append 或用 deque。",
            },
            {
              title: "所有語言的 list / vector / ArrayList",
              problem: "Python 的 list、C++ 的 vector、Java 的 ArrayList、JavaScript 的 array，都是「可以一直 push、不用先講大小」的容器。它們怎麼做到的？",
              why: "動態陣列在固定大小的陣列外面包一層：滿了就換一塊兩倍大的。理解它，就理解為什麼 push 快、insert 慢、以及哪些操作會意外變成 O(n)。",
            },
          ]}
          cue="第 i 個、連續記憶體、隨機存取、尾端加入、中間插入很慢、原地（in-place）修改、雙指標讀寫。"
        />
      </Section>

      <Section id="concept">
        <p>
          <strong>陣列</strong>是一塊連續的記憶體，每格一樣大。因為連續，第 i 格的位址可以直接算出來：<Code>base + i × size</Code>。這是陣列唯一的魔法，也是它所有優缺點的來源。存取和覆寫 O(1)；但要在中間插入或刪除，為了維持連續，後面的元素全部要挪，O(n)。
        </p>
        <p>
          固定大小的陣列不方便，所以有了<strong>動態陣列</strong>：記住「容量」和「目前用了幾格」，尾端有空位就直接放（O(1)），滿了就配一塊<strong>兩倍大</strong>的新記憶體、把舊的全搬過去。搬家那一次是 O(n)，但發生得夠少，平均下來每次 push 仍是 O(1)，這叫攤銷 O(1)，前一篇攤銷分析講的就是這件事。
        </p>
        <p>
          記住三個數字就夠了：<strong>存取 O(1)、尾端增刪 O(1)、其他位置增刪 O(n)</strong>。查一個值在不在裡面也是 O(n)，因為沒有排序就只能一格一格看。需要頻繁在前端增刪就換 deque，需要快速查「在不在」就換雜湊表，那是後面幾篇的事。
        </p>
      </Section>

      <Section id="steps">
        <Steps
          items={[
            <>判斷操作發生在<strong>哪個位置</strong>：尾端是 O(1)，其他地方要搬後面的元素，是 O(n)。</>,
            <>要在陣列裡<strong>原地</strong>刪除或搬動元素時，用<strong>讀寫雙指標</strong>：<Code>read</Code> 掃過每一格，符合條件的才寫到 <Code>write</Code> 的位置，最後 <Code>write</Code> 就是新長度。一趟 O(n)，不開新陣列。</>,
            <>需要「把後面 k 個移到前面」這種搬動時，想想能不能用<strong>反轉</strong>拼出來：整個反轉、再分段反轉回來，O(1) 額外空間。</>,
            <>已經知道最後會有幾個元素時，先<strong>預留容量</strong>（<Code>reserve</Code>、<Code>[None] * n</Code>），省掉所有擴容搬移。</>,
            <>迴圈裡出現 <Code>insert(0, x)</Code>、<Code>pop(0)</Code>、<Code>x in list</Code>，就是 O(n²) 的警訊，考慮換 deque 或 set。</>,
          ]}
        />
      </Section>

      <Section id="demo">
        <p>每一格下方是它的記憶體位址。試著在開頭插入或刪除，看有多少格會變黃（被搬動）；再比較尾端操作只動一格。</p>
        <ArrayOpsDemo />
      </Section>

      <Section id="code">
        <p>前半段列出每個常用操作的複雜度，後半段是兩個最經典的原地技巧：讀寫雙指標和三次反轉。</p>
        <CodeTabs samples={{ python, cpp }} />
      </Section>

      <Section id="problems">
        <Problems
          items={[
            { src: "LeetCode 27", name: "Remove Element（讀寫雙指標）", diff: "Easy" },
            { src: "LeetCode 26", name: "Remove Duplicates from Sorted Array", diff: "Easy" },
            { src: "LeetCode 283", name: "Move Zeroes", diff: "Easy" },
            { src: "LeetCode 189", name: "Rotate Array（三次反轉）", diff: "Medium" },
            { src: "LeetCode 238", name: "Product of Array Except Self", diff: "Medium" },
          ]}
        />
      </Section>
    </>
  );
}

export const arrayLesson: Lesson = { prereq: "Big-O Notation", Body };
